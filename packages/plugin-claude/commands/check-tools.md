---
description: Check the risk level of allowed-tools configuration
---

# /check-tools

Analyze the risk level of allowed-tools configuration and assess potential risks of tool combinations.

## Usage

```
/check-tools <tools...>
/check-tools Bash(git:*) Read Write
/check-tools "Bash(*) Read WebFetch"
```

## Execution Steps

1. **Parse Tool List**
   - Supports space-separated strings
   - Supports tool names with parentheses, e.g., Bash(git:*)

2. **Assess Individual Tool Risks**
   - Evaluate each tool based on the risk database
   - Output tool name, risk level, deduction

3. **Assess Combination Risks**
   - Analyze potential attack scenarios of tool combinations
   - e.g., Read + WebFetch = Data exfiltration risk

4. **Generate Recommendations**
   - Provide safer alternatives
   - Explain how to precisely limit permissions

## Tool Risk Level Reference

### 🔴 High-Risk Tools
| Tool | Risk | Deduction |
|------|------|-----------|
| `Bash(*)` | Arbitrary command execution | -25 |
| `Bash(rm:*)` | File deletion | -20 |
| `Bash(sudo:*)` | Privilege escalation | -25 |
| `Write` + `Bash` | Write + Execute | -20 |

### 🟠 Medium-Risk Tools
| Tool | Risk | Deduction |
|------|------|-----------|
| `Bash(git:*)` | Git operations | -15 |
| `Bash(npm:*)` | NPM operations | -10 |
| `WebFetch` | Network access | -5 |
| `Write` | File writing | -10 |

### 🟢 Low-Risk Tools
| Tool | Risk | Deduction |
|------|------|-----------|
| `Read` | File reading | -0 |
| `Grep` | Content search | -0 |
| `List` | Directory listing | -0 |

## Output Format

```
🔧 Tool Risk Analysis

Configured Tools: Bash(git:*) Read WebFetch

━━━ Individual Tool Assessment ━━━

• Bash(git:*)  🟡 Medium Risk (-15 points)
  Description: Limited command Shell execution
  Allowed: git status, git diff, git log, etc.
  Risk: git push may modify remote repository

• Read         🟢 Low Risk (-0 points)
  Description: Read-only file access
  Risk: May read sensitive configuration files

• WebFetch     🟡 Medium Risk (-5 points)
  Description: Can fetch external web content
  Risk: May be used for data exfiltration

━━━ Combination Risks ━━━

⚠️ Read + WebFetch: Data exfiltration risk (-10 points)
   Attack scenario: Read sensitive files then send via network

━━━ Summary ━━━

Total Deduction: -30 points
Estimated Score Impact: From 100 to approximately 70 points

💡 Recommendations:
1. If you only need git status viewing, use Bash(git:status) Bash(git:diff) instead
2. If network access is not needed, remove WebFetch
3. Explain the reason for needing these permissions in description
```
