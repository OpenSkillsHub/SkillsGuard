---
description: Generate Skill security audit report
allowed-tools: Read Write
---

# /security-report

Generate security audit reports for all Skills in a specified directory.

## Usage

```
/security-report <directory>
/security-report ./skills/
/security-report ./skills/ --output report.md
```

## Execution Steps

1. **Scan Directory**
   - Recursively find all SKILL.md files
   - Identify Skill directory structure

2. **Batch Detection**
   - Perform complete 5-layer security detection for each Skill
   - Collect all issues and scores

3. **Generate Summary Report**
   - Summarize overall security status
   - List scores for all Skills
   - Sort by risk level

4. **Output Report**
   - Default output to terminal
   - Use --output option to output to file

## Output Format

```markdown
# 🛡️ Skills Guard Security Audit Report

Generated: 2024-01-15 10:30:00
Scanned Directory: ./skills/
Skills Scanned: 5

## 📊 Overall Summary

| Metric | Value |
|--------|-------|
| Average Score | 72/100 |
| Safe (90+) | 1 |
| Low Risk (70-89) | 2 |
| Medium Risk (40-69) | 1 |
| High Risk (<40) | 1 |

## 📋 Skill Details

### 1. code-review (🟢 92 points)
- Status: Safe
- Issues: 0 High / 0 Medium / 1 Low

### 2. data-analyzer (🟡 75 points)
- Status: Low Risk
- Issues: 0 High / 2 Medium / 1 Low
- Main Issues:
  - [TOOL002] WebFetch can access external network

### 3. system-monitor (🟠 55 points)
- Status: Medium Risk
- Issues: 1 High / 3 Medium / 2 Low
- Main Issues:
  - [SEC001] Accessing sensitive path ~/.ssh/

### 4. malicious-skill (🔴 25 points)
- Status: High Risk
- Issues: 3 High / 2 Medium / 0 Low
- Main Issues:
  - [INJ001] Prompt injection detected
  - [TOOL001] Requesting Bash(*) permission

## ⚠️ High-Risk Issues Summary

1. **malicious-skill** - INJ001: Prompt injection
2. **malicious-skill** - TOOL001: Bash(*) permission
3. **system-monitor** - SEC001: Sensitive path access

## 💡 Recommendations

1. Immediately review malicious-skill due to serious security risks
2. Add explanation for sensitive path access in system-monitor
3. Consider removing unnecessary network access permissions
```

## Options

- `--output <file>` - Output to file
- `--format <type>` - Output format (markdown/json)
- `--min-score <n>` - Only show Skills with scores below n
