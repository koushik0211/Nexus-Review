import json
from backend.schemas.state import AgentState

class SynthesizeNode:
    def __init__(self, summary_chain, log_queue=None):
        self.summary_chain = summary_chain
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
        curated = state.get("curated_findings")
        findings = curated if curated is not None else state.get("findings", [])
        self.log(f"\n[Node 3: synthesize_review] Map phase complete. Found {len(findings)} total issues.")
        self.log(f"   -> [API Call] Synthesizing final review...")
        
        try:
            summary_response = self.summary_chain.invoke({"findings": json.dumps(findings)})
            clean_summary = summary_response.content.replace('```json', '').replace('```', '').strip()
            final_review = json.loads(clean_summary)
            final_review["findings"] = findings
            return {"final_review": final_review}
        except Exception as e:
            self.log(f"   Error parsing summary: {self.sanitize_error(e)}")
            return {"final_review": {"summary": "Analysis complete but error synthesizing summary.", "findings": findings, "recommendation": "Needs Discussion"}}
