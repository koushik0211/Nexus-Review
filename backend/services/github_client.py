import os
import re
from github import Github

def get_pr_diff(repo_name, pr_number, oauth_token=None):
    token = oauth_token or os.getenv("GITHUB_TOKEN")
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

def apply_fix_github(repo_name, pr_number, finding, oauth_token=None):
    token = oauth_token or os.getenv("GITHUB_TOKEN")
    g = Github(token)
    
    repo = g.get_repo(repo_name)
    pr = repo.get_pull(pr_number)
    
    # Get the source branch of the PR
    branch = pr.head.ref
    head_repo = pr.head.repo
    
    # Fetch the file contents from that specific branch
    file_content = head_repo.get_contents(finding.file, ref=branch)
    decoded_content = file_content.decoded_content.decode('utf-8')
    
    # Apply the replacement
    if finding.original_code not in decoded_content:
        raise ValueError("Could not find the original code block in the file. It may have been modified.")
        
    new_content = decoded_content.replace(finding.original_code, finding.suggested_code)
    
    # Create the commit message based on the finding title or comment
    short_comment = finding.title if finding.title else (finding.comment[:50] + ("..." if len(finding.comment) > 50 else ""))
    commit_message = f"{short_comment} [by nexus-review]"
    
    # Push the commit
    head_repo.update_file(
        file_content.path,
        commit_message,
        new_content,
        file_content.sha,
        branch=branch
    )
    return True