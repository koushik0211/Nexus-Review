from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    url: str

class ReviewFinding(BaseModel):
    severity: str
    file: str
    line: str
    comment: str
    original_code: str = ""
    suggested_code: str = ""

class AnalyzeResponse(BaseModel):
    summary: str
    recommendation: str
    findings: list[ReviewFinding]
