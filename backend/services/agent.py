import os
import uuid
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import ConnectionPool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from backend.schemas.state import AgentState
from backend.services.prompts import get_review_prompt, get_summary_prompt, get_fix_json_prompt

from backend.nodes.research_node import ResearchNode
from backend.nodes.analyze_node import AnalyzeNode
from backend.nodes.synthesize_node import SynthesizeNode
from backend.nodes.validate_node import ValidateNode
from backend.nodes.fix_node import FixNode

def route_research(state: AgentState):
    if len(state.get("urls", [])) > 0:
        return "research_external_docs"
    return "analyze_files"

def route_validation(state: AgentState):
    if not state.get("validation_error"):
        return END
    if state.get("validation_retries", 0) >= 3:
        print("   Warning: Max retries reached. Bypassing validation.")
        return END
    return "fix_json"



# Global checkpointer for HITL
db_uri = os.getenv("SUPABASE_DB_URL")
if db_uri:
    print(f"[System] Initializing Supabase Postgres Checkpointer...")
    pool = ConnectionPool(conninfo=db_uri, max_size=20, kwargs={"autocommit": True, "prepare_threshold": None})
    memory = PostgresSaver(pool)
    memory.setup()
else:
    print(f"[System] Warning: SUPABASE_DB_URL not found. Falling back to MemorySaver...")
    memory = MemorySaver()

def get_app(log_queue=None, provider=None, model=None, api_key=None):
    # 1. Initialize LLM
    if provider == "openai":
        key = api_key or os.getenv("OPENAI_API_KEY")
        selected_model = model or "gpt-4o"
        llm = ChatOpenAI(model=selected_model, api_key=key, temperature=0)
        if log_queue: log_queue.put({"type": "log", "message": f"\n[System] Initialized OpenAI Model: {selected_model}"})
    else:
        key = api_key or os.getenv("GOOGLE_API_KEY")
        selected_model = model or "gemini-2.5-flash"
        llm = ChatGoogleGenerativeAI(model=selected_model, google_api_key=key, temperature=0)
        if log_queue: log_queue.put({"type": "log", "message": f"\n[System] Initialized Gemini Model: {selected_model}"})
    
    # 2. Setup Chains
    chain = get_review_prompt() | llm
    summary_chain = get_summary_prompt() | llm
    fix_chain = get_fix_json_prompt() | llm

    # 3. Initialize Nodes
    research_node = ResearchNode(log_queue)
    analyze_node = AnalyzeNode(chain, log_queue)
    synthesize_node = SynthesizeNode(summary_chain, log_queue)
    validate_node = ValidateNode(log_queue)
    fix_node = FixNode(fix_chain, log_queue)

    # 4. Compile Graph
    workflow = StateGraph(AgentState)
    workflow.add_node("research_external_docs", research_node)
    workflow.add_node("analyze_files", analyze_node)
    workflow.add_node("synthesize_review", synthesize_node)
    workflow.add_node("validate_json", validate_node)
    workflow.add_node("fix_json", fix_node)
    
    workflow.add_conditional_edges(START, route_research)
    workflow.add_edge("research_external_docs", "analyze_files")
    workflow.add_edge("analyze_files", "synthesize_review")
    workflow.add_edge("synthesize_review", "validate_json")
    workflow.add_conditional_edges("validate_json", route_validation)
    workflow.add_edge("fix_json", "validate_json")
    
    # Add checkpointer and interrupt_before synthesize_review
    return workflow.compile(checkpointer=memory, interrupt_before=["synthesize_review"])

def review_pr(github_data, thread_id, log_queue=None, provider=None, model=None, api_key=None):
    app = get_app(log_queue, provider, model, api_key)
    config = {"configurable": {"thread_id": thread_id}}
    
    app.invoke({
        "chunks": github_data["chunks"], 
        "pr_context": github_data["pr_context"],
        "urls": github_data["urls"],
        "web_research": "",
        "findings": [], 
        "final_review": {},
        "validation_error": "",
        "validation_retries": 0
    }, config)
    
    state = app.get_state(config)
    if "synthesize_review" in state.next:
        if log_queue is not None:
            log_queue.put({"type": "hitl_request", "data": state.values.get("findings", []), "thread_id": thread_id})
            log_queue.put(None)
        return None
    
    final_res = state.values.get("final_review", {})
    if log_queue is not None:
        log_queue.put({"type": "result", "data": final_res})
        log_queue.put(None)
        
    return final_res

def resume_pr(thread_id, edited_findings, log_queue=None, provider=None, model=None, api_key=None):
    app = get_app(log_queue, provider, model, api_key)
    config = {"configurable": {"thread_id": thread_id}}
    
    if log_queue: log_queue.put({"type": "log", "message": f"\n[System] Resuming analysis from HITL breakpoint..."})
    
    # Update state with the edited findings from the user using a non-reducer field to overwrite
    app.update_state(config, {"curated_findings": edited_findings})
    
    # Resume execution by passing None
    app.invoke(None, config)
    
    state = app.get_state(config)
    final_res = state.values.get("final_review", {})
    
    if log_queue is not None:
        log_queue.put({"type": "result", "data": final_res})
        log_queue.put(None)
        
    return final_res