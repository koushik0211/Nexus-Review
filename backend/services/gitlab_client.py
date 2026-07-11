import os
import re
import gitlab

def get_mr_diff(project_id, mr_iid):
    token = os.getenv("GITLAB_TOKEN")
    url = os.getenv("GITLAB_URL", "https://gitlab.com")
    
    # Auth is optional for public repos, but token is used if provided
    gl = gitlab.Gitlab(url, private_token=token)
    
    project = gl.projects.get(project_id)
    mr = project.mergerequests.get(mr_iid)
    
    # Get changes
    changes = mr.changes()
    chunks = []
    
    for change in changes.get('changes', []):
        patch = change.get('diff', '')
        if patch:
            chunks.append({
                "filename": change.get('new_path', ''),
                "patch": patch
            })
            
    mr_body = mr.description or ""
    
    # Extract Issue Context (GitLab uses #123)
    issue_numbers = re.findall(r'#(\d+)', mr_body)
    issue_context = ""
    for num in issue_numbers:
        try:
            issue = project.issues.get(num)
            issue_context += f"Issue #{num}: {issue.title}\n{issue.description or ''}\n\n"
        except:
            pass
            
    pr_context = f"MR Title: {mr.title}\nMR Description: {mr_body}\n\nLinked Issues:\n{issue_context}"
    
    # Extract URLs for external research
    urls = re.findall(r'(https?://[^\s]+)', mr_body)
    
    # Filter out gitlab links
    external_urls = [u for u in urls if "gitlab.com" not in u]
    
    return {
        "chunks": chunks,
        "pr_context": pr_context,
        "urls": list(set(external_urls))
    }
