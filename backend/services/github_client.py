import os
import re
from github import Github

def get_pr_diff(repo_name, pr_number):
    token = os.getenv("GITHUB_TOKEN")
    g = Github(token)
    
    repo = g.get_repo(repo_name)
    pr = repo.get_pull(pr_number)
    
    diff_files = pr.get_files()
    chunks = []
    
    for file in diff_files:
        if file.patch:
            chunks.append({
                "filename": file.filename,
                "patch": file.patch
            })
            
    pr_body = pr.body or ""
    
    # Extract Issue Context
    issue_numbers = re.findall(r'#(\d+)', pr_body)
    issue_context = ""
    for num in issue_numbers:
        try:
            issue = repo.get_issue(int(num))
            issue_context += f"Issue #{num}: {issue.title}\n{issue.body or ''}\n\n"
        except:
            pass
            
    pr_context = f"PR Title: {pr.title}\nPR Description: {pr_body}\n\nLinked Issues:\n{issue_context}"
    
    # Extract URLs for external research
    urls = re.findall(r'(https?://[^\s]+)', pr_body)
    
    # Filter out github links
    external_urls = [url for url in urls if "github.com" not in url]
    
    return {
        "chunks": chunks,
        "pr_context": pr_context,
        "urls": list(set(external_urls))
    }