import operator
from typing import TypedDict, Annotated, List

class AgentState(TypedDict):
    chunks: List[dict]
    pr_context: str
    urls: List[str]
    web_research: str
    findings: Annotated[List[dict], operator.add]
    curated_findings: List[dict]
    final_review: dict
    validation_error: str
    validation_retries: int
