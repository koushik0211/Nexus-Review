import json
from backend.schemas.state import AgentState

class AnalyzeNode:
    def __init__(self, chain, log_queue=None):
        self.chain = chain
        self.log_queue = log_queue

    def log(self, msg):
        print(msg)
        if self.log_queue is not None:
            self.log_queue.put({"type": "log", "message": msg})

    def sanitize_error(self, e):
        err = str(e)
        if "429" in err or "quota" in err.lower() or "exhausted" in err.lower():
            return "API Quota Exhausted (429 Rate Limit). Please wait a moment."
        if len(err) > 150: return err[:150] + "... (truncated)"
        return err

    def __call__(self, state: AgentState):
        all_findings = []
        chunks = state.get("chunks", [])
        total_files = len(chunks)
        pr_context = state.get("pr_context", "")
        web_research = state.get("web_research", "")
        
        self.log(f"\n[Node 2: analyze_files] Starting Map-Reduce workflow for {total_files} files...")
        
        inputs = []
        for index, chunk in enumerate(chunks, 1):
            self.log(f"   -> [Queuing {index}/{total_files}] Preparing file: {chunk['filename']}...")
            chunk_text = f"File: {chunk['filename']}\nPatch: \n{chunk['patch']}"
            inputs.append({
                "chunk": chunk_text, 
                "pr_context": pr_context, 
                "web_research": web_research
            })
            
        self.log("   Executing all files in parallel using Langchain Batching...")
        try:
            responses = self.chain.batch(inputs, config={"max_concurrency": 5})
            
            for i, response in enumerate(responses):
                try:
                    clean_text = response.content.replace('```json', '').replace('```', '').strip()
                    findings = json.loads(clean_text)
                    all_findings.extend(findings)
                except Exception as e:
                    self.log(f"   Error parsing JSON for chunk {chunks[i]['filename']}: {self.sanitize_error(e)}")
                    
        except Exception as e:
            self.log(f"   Error: Parallel execution failed: {self.sanitize_error(e)}")
            
        return {"findings": all_findings}
