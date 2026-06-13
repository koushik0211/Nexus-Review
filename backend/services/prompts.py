from langchain_core.prompts import ChatPromptTemplate

def get_review_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", "You are an expert code reviewer. Find bugs, security, and style issues. Return ONLY a JSON list: [{{\"severity\": \"critical|warning|suggestion\", \"file\": \"filename\", \"line\": \"line_num\", \"comment\": \"issue explanation\", \"original_code\": \"the exact code block with the issue\", \"suggested_code\": \"the corrected code block\"}}]"),
        ("user", "Review this code chunk:\n{chunk}")
    ])

def get_summary_prompt():
    return ChatPromptTemplate.from_messages([
        ("system", "Summarize findings into JSON: {{\"summary\": \"2 sentences max\", \"recommendation\": \"Approve | Request Changes | Needs Discussion\"}}"),
        ("user", "Findings: {findings}")
    ])
