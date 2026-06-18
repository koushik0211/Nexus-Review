import json
from backend.schemas.state import AgentState

class FixNode:
    def __init__(self, fix_chain, log_queue=None):
        self.fix_chain = fix_chain
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
        self.log(f"\n[Node 5: fix_json] -> [API Call - AutoCorrect] Asking LLM to fix its formatting mistake...")
        try:
            response = self.fix_chain.invoke({
                "broken_json": json.dumps(state["final_review"]),
                "error": state["validation_error"]
            })
            clean_text = response.content.replace('```json', '').replace('```', '').strip()
            fixed_json = json.loads(clean_text)
            return {"final_review": fixed_json}
        except Exception as e:
            self.log(f"   Error: Auto-correct failed: {self.sanitize_error(e)}")
            return {}
