import re
from fastapi import APIRouter, HTTPException

from backend.schemas.pr import AnalyzeRequest, AnalyzeResponse
from backend.services.github_client import get_pr_diff
from backend.services.agent import review_pr

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_pr(request: AnalyzeRequest):
    url = request.url
    match = re.search(r"github\.com/([^/]+)/([^/]+)/pull/(\d+)", url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid URL format. Please paste a valid GitHub PR URL.")
        
    repo_name = f"{match.group(1)}/{match.group(2)}"
    pr_number = int(match.group(3))
    
    try:
        diff_text = get_pr_diff(repo_name, pr_number)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch PR from GitHub: {str(e)}")
        
    try:
        review_data = review_pr(diff_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze PR: {str(e)}")
        
    return review_data
