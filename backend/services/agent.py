import os
import json
import time
from langchain_google_genai import ChatGoogleGenerativeAI
from backend.services.prompts import get_review_prompt, get_summary_prompt

def review_pr(diff_text):
    my_key = os.getenv("GOOGLE_API_KEY")
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=my_key, temperature=0)
    
    review_prompt = get_review_prompt()
    chain = review_prompt | llm
    
    all_findings = []
    
    try:
        response = chain.invoke({"chunk": diff_text})
        clean_text = response.content.replace('```json', '').replace('```', '').strip()
        findings = json.loads(clean_text)
        all_findings.extend(findings)
    except Exception as e:
        print(f"Error analyzing diff: {e}")
        return {"summary": f"API Error: {str(e)}", "findings": [], "recommendation": "Needs Discussion"}
            
    summary_prompt = get_summary_prompt()
    summary_chain = summary_prompt | llm
    
    try:
        summary_response = summary_chain.invoke({"findings": json.dumps(all_findings)})
        clean_summary = summary_response.content.replace('```json', '').replace('```', '').strip()
        final_review = json.loads(clean_summary)
        final_review["findings"] = all_findings
        return final_review
    except Exception as e:
        print(f"Error parsing summary: {e}")
        return {"summary": "Analysis complete but error synthesizing summary.", "findings": all_findings, "recommendation": "Needs Discussion"}