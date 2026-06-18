from pydantic import ValidationError
from backend.schemas.pr import AnalyzeResponse
from backend.schemas.state import AgentState

class ValidateNode:
    def __init__(self, log_queue=None):
        self.log_queue = log_queue

    def log(self, msg):
        print(msg)
        if self.log_queue is not None:
            self.log_queue.put({"type": "log", "message": msg})

    def __call__(self, state: AgentState):
        final_review = state.get("final_review", {})
        self.log(f"\n[Node 4: validate_json] Validating final JSON against Pydantic schema...")
        
        try:
            AnalyzeResponse(**final_review)
            self.log("[Node 4: validate_json] Validation passed! Sending JSON to frontend.\n")
            return {"validation_error": ""}
        except ValidationError as e:
            self.log(f"   Error: Pydantic Validation Error caught! Initiating self-healing loop...")
            return {
                "validation_error": str(e),
                "validation_retries": state.get("validation_retries", 0) + 1
            }
