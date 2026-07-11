import os
import re
import gitlab

def get_mr_diff(project_id, mr_iid, oauth_token=None):
    token = oauth_token or os.getenv("GITLAB_TOKEN")
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

def apply_fix_gitlab(project_id, mr_iid, finding, oauth_token=None):
    token = oauth_token or os.getenv("GITLAB_TOKEN")
    url = os.getenv("GITLAB_URL", "https://gitlab.com")
    
    gl = gitlab.Gitlab(url, private_token=token)
    project = gl.projects.get(project_id)
    mr = project.mergerequests.get(mr_iid)
    
    source_project = gl.projects.get(mr.source_project_id)
    branch = mr.source_branch
    
    try:
        # Fetch file from the branch
        f = source_project.files.get(file_path=finding.file, ref=branch)
        decoded_content = f.decode().decode('utf-8')
        
        if finding.original_code not in decoded_content:
            raise ValueError("Could not find the original code block in the file.")
            
        new_content = decoded_content.replace(finding.original_code, finding.suggested_code)
        
        short_comment = finding.title if finding.title else (finding.comment[:50] + ("..." if len(finding.comment) > 50 else ""))
        commit_message = f"{short_comment} [by nexus-review]"
        
        f.content = new_content
        f.save(branch=branch, commit_message=commit_message)
        return True
    except gitlab.exceptions.GitlabGetError:
        raise ValueError(f"Could not find file {finding.file} in the MR branch.")
