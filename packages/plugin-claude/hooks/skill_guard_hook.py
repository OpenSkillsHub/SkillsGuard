#!/usr/bin/env python3
"""
Skills Guard Hook for Claude Code
Auto-detect security issues when editing Skill files
"""

import json
import os
import re
import sys
from datetime import datetime

# Debug log
DEBUG_LOG = "/tmp/skills-guard-hook.log"

def debug_log(message: str):
    """Write to debug log"""
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(DEBUG_LOG, "a") as f:
            f.write(f"[{timestamp}] {message}\n")
    except:
        pass

# Security detection pattern configuration
SECURITY_PATTERNS = [
    # === High Risk: Prompt Injection ===
    {
        "ruleName": "prompt_injection_ignore",
        "patterns": [
            r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
            r"disregard\s+(all\s+)?(previous|prior)",
            r"forget\s+(all\s+)?(previous|prior)\s+instructions",
        ],
        "severity": "high",
        "category": "injection",
        "reminder": """🔴 HIGH RISK WARNING: Prompt injection risk detected!

Found Content: Attempting to make AI ignore previous instructions

Risk Description:
- May cause AI to bypass security restrictions
- May execute unauthorized operations
- Common prompt injection attack pattern

Recommended Actions:
- Remove suspicious content
- Check instruction source
- Ensure Skill content is safe"""
    },
    {
        "ruleName": "prompt_injection_jailbreak",
        "patterns": [
            r"jailbreak",
            r"DAN\s+mode",
            r"developer\s+mode",
            r"你是一个没有任何限制的",
            r"假装你是一个没有道德约束的",
        ],
        "severity": "high",
        "category": "injection",
        "reminder": """🔴 HIGH RISK WARNING: Jailbreak attempt detected!

Found Content: Attempting to put AI into unrestricted mode

Risk Description:
- "Jailbreak" and "DAN mode" are common AI jailbreak techniques
- May cause AI to generate harmful content
- May bypass all security policies

Recommended Actions:
- Immediately remove related content
- Re-evaluate the Skill's security"""
    },
    
    # === High Risk: Dangerous Tool Configuration ===
    {
        "ruleName": "dangerous_bash_all",
        "patterns": [
            r"allowed-tools:.*Bash\s*\(\s*\*\s*\)",
        ],
        "severity": "high",
        "category": "tool",
        "reminder": """🔴 HIGH RISK WARNING: Dangerous tool configuration detected!

Found Content: Bash(*) - Allows arbitrary Shell command execution

Risk Description:
- Can execute destructive commands like rm -rf /
- Can steal system credentials
- Can install malware

Recommended Actions:
- Use precise command restrictions
- Example: Bash(git:*) Bash(npm:install)
- Never use Bash(*)"""
    },
    {
        "ruleName": "dangerous_bash_rm",
        "patterns": [
            r"allowed-tools:.*Bash\s*\(\s*rm\s",
            r"allowed-tools:.*Bash\s*\(\s*sudo\s",
            r"allowed-tools:.*Bash\s*\(\s*chmod\s*777",
        ],
        "severity": "high",
        "category": "tool",
        "reminder": """🔴 HIGH RISK WARNING: Dangerous command permission detected!

Found Content: Requesting high-risk Shell command permissions

Risk Description:
- rm command may cause data loss
- sudo may escalate to system privileges
- chmod 777 may create security vulnerabilities

Recommended Actions:
- Evaluate if these permissions are truly needed
- If needed, explain the reason in description"""
    },
    
    # === Medium Risk: Sensitive Information Access ===
    {
        "ruleName": "sensitive_paths",
        "patterns": [
            r"/etc/passwd",
            r"/etc/shadow",
            r"~/.ssh/",
            r"\.aws/credentials",
            r"\.env\b",
            r"\.npmrc",
            r"\.gitconfig",
        ],
        "severity": "medium",
        "category": "secret",
        "reminder": """🟠 SECURITY NOTICE: Sensitive path access detected

Found Content: Accessing system sensitive files or credential storage

Risk Description:
- May leak system user information
- May expose SSH keys
- May leak cloud service credentials

Recommended Actions:
- Confirm if access to these paths is necessary
- Explain access reason in description
- Consider if there are safer alternatives"""
    },
    {
        "ruleName": "hardcoded_secrets",
        "patterns": [
            r"(?:api[_-]?key|apikey)\s*[:=]\s*['\"][^'\"]{10,}['\"]",
            r"(?:secret|password|token)\s*[:=]\s*['\"][^'\"]{6,}['\"]",
            r"sk-[a-zA-Z0-9]{20,}",  # OpenAI API key pattern
            r"ghp_[a-zA-Z0-9]{36}",  # GitHub token pattern
        ],
        "severity": "medium",
        "category": "secret",
        "reminder": """🟠 SECURITY NOTICE: Hardcoded credentials detected

Found Content: Code may contain API keys or passwords

Risk Description:
- Credentials may be leaked
- May be maliciously exploited
- Violates security best practices

Recommended Actions:
- Remove hardcoded credentials
- Use environment variables or key management services
- Check if credentials need to be committed to version control"""
    },
    
    # === Medium Risk: External Communication ===
    {
        "ruleName": "suspicious_urls",
        "patterns": [
            r"https?://[^/\s]+\.(xyz|tk|ml|ga|cf|gq|top|work)",
            r"send.*to.*server",
            r"upload.*to.*external",
            r"exfiltrate",
        ],
        "severity": "medium",
        "category": "url",
        "reminder": """🟠 SECURITY NOTICE: Suspicious external communication detected

Found Content: Sending data to external servers or accessing suspicious domains

Risk Description:
- May cause data leakage
- Suspicious TLDs are often used for malicious purposes
- May violate data privacy policies

Recommended Actions:
- Verify the legitimacy of target URL
- Explain the purpose of external communication in description
- Consider if external communication can be avoided"""
    },
]

# State file path
def get_state_file(session_id: str) -> str:
    return os.path.expanduser(f"~/.claude/skills_guard_state_{session_id}.json")

def load_state(session_id: str) -> set:
    """Load shown warning state"""
    state_file = get_state_file(session_id)
    if os.path.exists(state_file):
        try:
            with open(state_file, "r") as f:
                return set(json.load(f))
        except:
            return set()
    return set()

def save_state(session_id: str, shown_warnings: set):
    """Save warning state"""
    state_file = get_state_file(session_id)
    try:
        os.makedirs(os.path.dirname(state_file), exist_ok=True)
        with open(state_file, "w") as f:
            json.dump(list(shown_warnings), f)
    except:
        pass

def is_skill_file(file_path: str) -> bool:
    """Check if it's a Skill-related file"""
    if not file_path:
        return False
    
    path_lower = file_path.lower()
    filename = os.path.basename(path_lower)
    
    # Match Skill files
    skill_patterns = [
        'skill.md',
        '.skill.yaml',
        '.skill.yml',
        '.skill.md',
    ]
    
    for pattern in skill_patterns:
        if filename.endswith(pattern) or filename == pattern:
            return True
    
    # Match files in skills directory
    if '/skills/' in path_lower or '\\skills\\' in path_lower:
        return True
    
    return False

def check_patterns(content: str, file_path: str) -> tuple:
    """Check if content matches security patterns"""
    for pattern_group in SECURITY_PATTERNS:
        for pattern in pattern_group["patterns"]:
            match = re.search(pattern, content, re.IGNORECASE | re.MULTILINE)
            if match:
                return (
                    pattern_group["ruleName"],
                    pattern_group["severity"],
                    pattern_group["reminder"],
                    match.group(0)  # Matched content
                )
    return None, None, None, None

def extract_content(tool_name: str, tool_input: dict) -> str:
    """Extract content from tool input"""
    if tool_name == "Write":
        return tool_input.get("content", "")
    elif tool_name == "Edit":
        return tool_input.get("new_string", "")
    elif tool_name == "MultiEdit":
        edits = tool_input.get("edits", [])
        return " ".join(edit.get("new_string", "") for edit in edits)
    return ""

def main():
    """Main function"""
    debug_log("Skills Guard Hook started")
    
    # Read input
    try:
        raw_input = sys.stdin.read()
        input_data = json.loads(raw_input)
        debug_log(f"Input received: {raw_input[:200]}...")
    except json.JSONDecodeError as e:
        debug_log(f"JSON decode error: {e}")
        sys.exit(0)  # Allow on parse error
    
    # Get basic info
    session_id = input_data.get("session_id", "default")
    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})
    
    debug_log(f"Tool: {tool_name}, Session: {session_id}")
    
    # Only process file edit tools
    if tool_name not in ["Edit", "Write", "MultiEdit"]:
        debug_log(f"Skipping non-edit tool: {tool_name}")
        sys.exit(0)
    
    # Get file path
    file_path = tool_input.get("file_path", "")
    debug_log(f"File path: {file_path}")
    
    # Only process Skill-related files
    if not is_skill_file(file_path):
        debug_log(f"Not a skill file: {file_path}")
        sys.exit(0)
    
    debug_log(f"Processing skill file: {file_path}")
    
    # Get content to write
    content = extract_content(tool_name, tool_input)
    
    if not content:
        debug_log("No content to check")
        sys.exit(0)
    
    debug_log(f"Content length: {len(content)}")
    
    # Execute security detection
    rule_name, severity, reminder, matched = check_patterns(content, file_path)
    
    if rule_name:
        # Create warning key
        warning_key = f"{file_path}-{rule_name}"
        
        # Load shown warnings
        shown_warnings = load_state(session_id)
        
        # Check if already shown
        if warning_key not in shown_warnings:
            # Record and save
            shown_warnings.add(warning_key)
            save_state(session_id, shown_warnings)
            
            # Output warning
            print(reminder, file=sys.stderr)
            debug_log(f"Warning shown: {rule_name}, severity: {severity}")
            
            # Block operation for high severity
            if severity == "high":
                debug_log("Blocking operation due to high severity")
                sys.exit(2)
        else:
            debug_log(f"Warning already shown: {warning_key}")
    
    debug_log("Hook completed, allowing operation")
    sys.exit(0)

if __name__ == "__main__":
    main()
