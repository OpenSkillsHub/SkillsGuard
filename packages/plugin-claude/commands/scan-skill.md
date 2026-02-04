---
description: Scan Agent Skill for security risks
allowed-tools: Read
---

# /scan-skill

Scan specified Skill file or directory for security risks.

## Usage

```
/scan-skill <path>
/scan-skill ./my-skill/SKILL.md
/scan-skill ./skills/code-review/
```

## Execution Steps

1. **Read Skill Content**
   - Supports single SKILL.md file
   - Supports Skill directory (including scripts/references/assets)

2. **Parse Structure**
   - Parse YAML frontmatter (name, description, allowed-tools, etc.)
   - Parse Markdown body (instruction content)
   - If directory, parse scripts/*.py and other scripts

3. **Execute 5-Layer Security Detection**
   - Layer 0: Format compliance (frontmatter structure, name naming rules)
   - Layer 1: Prompt security (injection detection, sensitive information, dangerous commands)
   - Layer 2: Tool risks (allowed-tools configuration assessment)
   - Layer 3: Resource security (path, URL, script detection)
   - Layer 4: Behavior analysis (data flow, persistence, automation chains)

4. **Calculate Security Score**
   - Based on issue count and severity
   - Score range 0-100
   - Risk levels: 🟢Safe(90+) / 🟡Low Risk(70-89) / 🟠Medium Risk(40-69) / 🔴High Risk(<40)

5. **Generate Report**

## Output Format

```
🛡️ Skills Guard Security Scan Report

🟡 Security Score: 72/100 (Low Risk)

📋 Format Compliance: ✅ Passed
   name: code-review ✓
   description: ✓

Detected 3 issues:
• 🟠 Medium: 2
• 🟡 Low: 1

Main Issues:
🟠 [TOOL001] Bash(git:*) in allowed-tools has some risk
   Recommendation: If you only need git status/diff, use more precise restrictions

🟠 [SEC001] Environment variable access detected (line 23)
   Content: process.env.API_KEY
   Recommendation: Avoid hardcoded credential access

🟡 [URL001] External URL access detected (line 45)
   Content: https://api.example.com
   Recommendation: Explain the purpose of external access in description

💡 Recommendation: Add explanations for detected risk points to help users understand the necessity of these behaviors.
```

## Exit Conditions

- If Skill does not exist, output error message
- If high-risk issues detected, advise user to use with caution
- Always output complete security report
