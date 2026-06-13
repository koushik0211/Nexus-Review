import os
from github import Github

def get_pr_diff(repo_name, pr_number):
    token = os.getenv("GITHUB_TOKEN")
    g = Github(token)
    
    repo = g.get_repo(repo_name)
    pr = repo.get_pull(pr_number)
    
    diff_files = pr.get_files()
    diff_text = f"PR Title: {pr.title}\n\n"
    
    for file in diff_files:
        diff_text += f"File: {file.filename}\nPatch: \n{file.patch}\n\n"
        
    return diff_text