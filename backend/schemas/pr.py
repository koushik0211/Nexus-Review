from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    url: str
    provider: str | None = None
    model: str | None = None
    api_key: str | None = None

class ReviewFinding(BaseModel):
    severity: str
    file: str
    line: str | int
    comment: str
    confidence_score: int = 100
    original_code: str | None = ""
    suggested_code: str | None = ""
    user_feedback: str | None = None

class AnalyzeResponse(BaseModel):
    summary: str
    recommendation: str
    findings: list[ReviewFinding]

class ResumeRequest(BaseModel):
    thread_id: str
    findings: list[ReviewFinding]
    provider: str | None = None
    model: str | None = None
    api_key: str | None = None

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    findings: list[ReviewFinding]
    history: list[ChatMessage] = []
    provider: str | None = None
    model: str | None = None
    api_key: str | None = None
