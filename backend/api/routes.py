import re
import queue
import threading
import json
import uuid
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from backend.schemas.pr import AnalyzeRequest, AnalyzeResponse, ResumeRequest, ChatRequest
from backend.services.github_client import get_pr_diff
from backend.services.gitlab_client import get_mr_diff
from backend.services.agent import review_pr, resume_pr
from backend.services.prompts import get_chat_system_prompt
import urllib.parse

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

router = APIRouter()

@router.post("/analyze")
async def analyze_pr(request: AnalyzeRequest):
    url = request.url
    
    try:
        if "gitlab.com" in url or "-/merge_requests/" in url:
            # Parse GitLab MR URL
            # Format: https://gitlab.com/group/project/-/merge_requests/123
            match = re.search(r"gitlab\.com/(.*?)/-/merge_requests/(\d+)", url)
            if not match:
                raise ValueError("Invalid GitLab MR URL format.")
            project_id = match.group(1) # python-gitlab handles the URL encoding internally
            mr_iid = int(match.group(2))
            code_data = get_mr_diff(project_id, mr_iid)
        else:
            # Assume GitHub
            match = re.search(r"github\.com/([^/]+)/([^/]+)/pull/(\d+)", url)
            if not match:
                raise ValueError("Invalid URL format. Please paste a valid GitHub PR or GitLab MR URL.")
            repo_name = f"{match.group(1)}/{match.group(2)}"
            pr_number = int(match.group(3))
            code_data = get_pr_diff(repo_name, pr_number)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch code from URL: {str(e)}")
        
    thread_id = str(uuid.uuid4())
    q = queue.Queue()
    
    def run_agent():
        try:
            review_pr(code_data, thread_id, q, provider=request.provider, model=request.model, api_key=request.api_key)
        except Exception as e:
            q.put({"type": "error", "message": f"Failed to analyze PR: {str(e)}"})
            q.put(None)
            
    threading.Thread(target=run_agent).start()
    
    def sync_event_stream():
        while True:
            item = q.get()
            if item is None:
                break
            yield f"data: {json.dumps(item)}\n\n"
            
    return StreamingResponse(sync_event_stream(), media_type="text/event-stream")

@router.post("/resume")
async def resume_analysis(request: ResumeRequest):
    q = queue.Queue()
    findings_dicts = [f.model_dump() for f in request.findings]
    
    def run_agent():
        try:
            resume_pr(request.thread_id, findings_dicts, q, provider=request.provider, model=request.model, api_key=request.api_key)
        except Exception as e:
            q.put({"type": "error", "message": f"Failed to resume analysis: {str(e)}"})
            q.put(None)
            
    threading.Thread(target=run_agent).start()
    
    def sync_event_stream():
        while True:
            item = q.get()
            if item is None:
                break
            yield f"data: {json.dumps(item)}\n\n"
            
    return StreamingResponse(sync_event_stream(), media_type="text/event-stream")


def _get_chat_llm(provider, model, api_key):
    """Lightweight LLM factory for the chat endpoint."""
    if provider == "openai":
        key = api_key or os.getenv("OPENAI_API_KEY")
        return ChatOpenAI(model=model or "gpt-4o", api_key=key, temperature=0.3)
    else:
        key = api_key or os.getenv("GOOGLE_API_KEY")
        return ChatGoogleGenerativeAI(model=model or "gemini-2.5-flash", google_api_key=key, temperature=0.3)


@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    system_prompt = get_chat_system_prompt(request.findings)

    # Build message history
    messages = [SystemMessage(content=system_prompt)]
    for msg in request.history:
        if msg.role == "user":
            messages.append(HumanMessage(content=msg.content))
        else:
            messages.append(AIMessage(content=msg.content))
    messages.append(HumanMessage(content=request.message))

    try:
        llm = _get_chat_llm(request.provider, request.model, request.api_key)
        response = llm.invoke(messages)
        return {"reply": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
