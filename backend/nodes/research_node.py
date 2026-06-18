import requests
from bs4 import BeautifulSoup
from backend.schemas.state import AgentState

class ResearchNode:
    def __init__(self, log_queue=None):
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
        urls = state.get("urls", [])
        if not urls:
            return {"web_research": "No external links found."}
            
        self.log(f"\n[Node 1: research_external_docs] Found {len(urls)} external links! Initiating Web Scraping...")
        research_results = ""
        
        for url in urls:
            self.log(f"   -> Scraping context from: {url}")
            try:
                res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=5)
                res.raise_for_status()
                
                soup = BeautifulSoup(res.text, 'html.parser')
                text_content = soup.get_text(separator=' ', strip=True)
                
                truncated_text = text_content[:2000] + "..." if len(text_content) > 2000 else text_content
                research_results += f"Documentation from {url}:\n{truncated_text}\n\n"
            except Exception as e:
                self.log(f"   Error: Scraping failed for {url}: {self.sanitize_error(e)}")
                
        return {"web_research": research_results}
