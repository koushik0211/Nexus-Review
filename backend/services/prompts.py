from langchain_core.prompts import ChatPromptTemplate

def get_review_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", "You are an expert code reviewer. You will be provided with PR context (Title, Description, Linked Issues) and external documentation research. Use this context to determine if the code successfully solves the problem. Find bugs, security, and style issues. Return ONLY a JSON list: [{{\"severity\": \"critical|warning|suggestion\", \"file\": \"filename\", \"line\": \"line_num\", \"comment\": \"issue explanation\", \"confidence_score\": integer between 1 and 100, \"original_code\": \"the exact code block with the issue\", \"suggested_code\": \"the corrected code block\"}}]"),
        ("user", "PR Context:\n{pr_context}\n\nExternal Research:\n{web_research}\n\nReview this code chunk:\n{chunk}")
    ])

def get_summary_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", "Summarize findings into JSON: {{\"summary\": \"2 sentences max\", \"recommendation\": \"Approve | Request Changes | Needs Discussion\"}}"),
        ("user", "Findings: {findings}")
    ])

def get_fix_json_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", "You are an expert JSON formatter. A previous AI generated invalid JSON that failed Pydantic validation. Fix the JSON and return ONLY the valid JSON block without any markdown formatting."),
        ("user", "Broken JSON:\n{broken_json}\n\nPydantic Error:\n{error}\n\nFix the JSON.")
    ])
