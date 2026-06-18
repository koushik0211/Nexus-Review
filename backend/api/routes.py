import re
import queue
import threading
import json
import uuid
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from backend.schemas.pr import AnalyzeRequest, AnalyzeResponse, ResumeRequest
from backend.services.github_client import get_pr_diff
from backend.services.agent import review_pr, resume_pr

router = APIRouter()

@router.post("/analyze")
async def analyze_pr(request: AnalyzeRequest):
    url = request.url
    match = re.search(r"github\.com/([^/]+)/([^/]+)/pull/(\d+)", url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid URL format. Please paste a valid GitHub PR URL.")
        
    repo_name = f"{match.group(1)}/{match.group(2)}"
    pr_number = int(match.group(3))
    
    try:
        github_data = get_pr_diff(repo_name, pr_number)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch PR from GitHub: {str(e)}")
        
    thread_id = str(uuid.uuid4())
    q = queue.Queue()
    
    def run_agent():
        try:
            review_pr(github_data, thread_id, q, provider=request.provider, model=request.model, api_key=request.api_key)
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
