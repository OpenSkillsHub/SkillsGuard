# Skills Guard Security Standard

> Version 1.0.0 | Security Detection Standard for Anthropic Agent Skills

## Overview

This document defines the security detection standard for Skills Guard, providing a comprehensive framework for evaluating the security of Anthropic Agent Skills. The standard aims to help developers create safer Skills while enabling users to make informed decisions about which Skills to trust.

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [5-Layer Detection Architecture](#5-layer-detection-architecture)
3. [Scoring System](#scoring-system)
4. [Rule Categories](#rule-categories)
5. [Rule Reference](#rule-reference)
6. [Severity Classification](#severity-classification)
7. [Best Practices](#best-practices)

---

## Design Philosophy

### Core Principles

1. **Defense in Depth** - Multiple layers of detection to catch various attack vectors
2. **Quantifiable Risk** - Objective scoring system for consistent evaluation
3. **Actionable Feedback** - Every detection includes remediation guidance
4. **Balanced Security** - Minimize false positives while maximizing threat detection
5. **Transparency** - Clear documentation of what we detect and why

### Threat Model

Skills Guard protects against:

- **Malicious Skills** - Intentionally designed to harm users
- **Compromised Skills** - Previously safe Skills that have been tampered with
- **Risky Skills** - Well-intentioned but poorly designed Skills with security gaps
- **Social Engineering** - Skills that attempt to manipulate AI behavior

---

## 5-Layer Detection Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 4: Behavior Analysis               │
│         (Data flow patterns, persistence, attack chains)    │
├─────────────────────────────────────────────────────────────┤
│                    Layer 3: Resource Security               │
│            (Path safety, URL validation, script audit)      │
├─────────────────────────────────────────────────────────────┤
│                     Layer 2: Tool Risks                     │
│       (allowed-tools assessment, combination analysis)      │
├─────────────────────────────────────────────────────────────┤
│                    Layer 1: Content Security                │
│      (Prompt injection, sensitive data, dangerous cmds)     │
├─────────────────────────────────────────────────────────────┤
│                   Layer 0: Format Compliance                │
│            (Frontmatter validation, naming rules)           │
└─────────────────────────────────────────────────────────────┘
```

### Layer 0: Format Compliance

**Purpose**: Ensure the Skill follows the Anthropic Agent Skills specification.

| Check | Description | Severity |
|-------|-------------|----------|
| Frontmatter presence | YAML frontmatter must exist | Medium |
| YAML validity | Frontmatter must be valid YAML | Medium |
| Required fields | `name` and `description` are required | Medium |
| Name format | Lowercase, alphanumeric, hyphens only, 1-64 chars | Low |
| Name boundaries | Cannot start/end with hyphen, no consecutive hyphens | Low |
| Description length | 1-1024 characters | Low |

### Layer 1: Content Security

**Purpose**: Detect malicious content in the Skill's instructions.

| Category | Description | Severity |
|----------|-------------|----------|
| Prompt Injection | Attempts to override AI instructions | High |
| Jailbreak | Attempts to bypass AI safety measures | High |
| Sensitive Data | Hardcoded credentials, API keys, tokens | Medium |
| Dangerous Commands | Destructive system commands | High |
| Content Compliance | Illegal, violent, or hateful content | High |

### Layer 2: Tool Risks

**Purpose**: Evaluate the risk of requested tool permissions.

| Tool Pattern | Risk Level | Deduction | Rationale |
|--------------|------------|-----------|-----------|
| `Bash(*)` | Critical | -25 | Arbitrary command execution |
| `Bash(rm:*)` | High | -20 | File deletion capability |
| `Bash(sudo:*)` | Critical | -25 | Privilege escalation |
| `Bash(curl:*)` | Medium | -10 | Network data transfer |
| `Bash(git:*)` | Medium | -15 | Repository manipulation |
| `Bash(npm:*)` | Medium | -10 | Package execution |
| `Write` | Medium | -10 | File system modification |
| `WebFetch` | Low | -5 | External network access |
| `Read` | Safe | 0 | Read-only access |

#### Combination Risks

| Combination | Additional Deduction | Attack Vector |
|-------------|---------------------|---------------|
| `Read` + `WebFetch` | -10 | Data exfiltration |
| `Write` + `Bash` | -15 | Malware deployment |
| `Read` + `Write` + `Bash` | -20 | Full system compromise |

### Layer 3: Resource Security

**Purpose**: Identify access to sensitive resources.

#### Sensitive Paths

| Category | Examples | Severity |
|----------|----------|----------|
| System credentials | `/etc/passwd`, `/etc/shadow` | High |
| SSH keys | `~/.ssh/id_rsa`, `~/.ssh/config` | High |
| Cloud credentials | `~/.aws/credentials`, `~/.azure/` | High |
| Application secrets | `.env`, `.npmrc`, `.gitconfig` | Medium |
| Browser data | Chrome/Firefox profiles, cookies | High |

#### URL Security

| Check | Description | Severity |
|-------|-------------|----------|
| Non-HTTPS | Unencrypted connections | Low |
| Direct IP | IP address instead of domain | Medium |
| Suspicious TLD | `.xyz`, `.tk`, `.ml`, etc. | Medium |
| Data exfiltration patterns | POST to external servers | High |

### Layer 4: Behavior Analysis

**Purpose**: Detect malicious behavior patterns.

| Pattern | Description | Severity |
|---------|-------------|----------|
| Data Collection | Gathering user information | Medium |
| Data Exfiltration | Sending data externally | High |
| Persistence | Modifying startup, cron, etc. | High |
| Credential Harvesting | Prompting for passwords | High |
| Network Scanning | Port scanning, host discovery | Medium |
| Resource Abuse | Crypto mining, infinite loops | Medium |
| Security Bypass | Disabling security features | High |
| Brute Force | Unauthorized access attempts | High |
| Stealth | Log clearing, history deletion | High |
| Social Engineering | Impersonation, phishing | High |

---

## Scoring System

### Base Score

Every Skill starts with a base score of **100 points**.

### Deduction Rules

| Severity | Points Deducted | Description |
|----------|-----------------|-------------|
| 🔴 High | -30 | Critical security risk requiring immediate attention |
| 🟠 Medium | -15 | Significant risk that should be addressed |
| 🟡 Low | -5 | Minor concern or best practice violation |
| ℹ️ Info | 0 | Informational, no deduction |

### Risk Level Classification

| Score Range | Level | Icon | Recommendation |
|-------------|-------|------|----------------|
| 90-100 | Safe | 🟢 | Generally safe to use |
| 70-89 | Low Risk | 🟡 | Review flagged items before use |
| 40-69 | Medium Risk | 🟠 | Use with caution, consider alternatives |
| 0-39 | High Risk | 🔴 | Not recommended for use |

### Score Calculation Formula

```
Final Score = max(0, 100 - Σ(severity_deductions))

Where:
- High severity issues: -30 each
- Medium severity issues: -15 each  
- Low severity issues: -5 each
```

---

## Rule Categories

### Rule ID Naming Convention

```
[CATEGORY][NUMBER]

Categories:
- FMT: Format compliance
- NAM: Naming rules
- DESC: Description rules
- INJ: Injection attacks
- SEC: Sensitive information
- CMD: Dangerous commands
- TOOL: Tool configuration
- PATH: Path security
- URL: URL security
- SCRIPT: Script security
- BEH: Behavior analysis
- CONTENT: Content compliance
```

---

## Rule Reference

### Format Rules (FMT)

| ID | Name | Description | Severity |
|----|------|-------------|----------|
| FMT001 | missing_frontmatter | No YAML frontmatter found | Medium |
| FMT002 | invalid_yaml | Frontmatter is not valid YAML | Medium |
| FMT003 | missing_name | Required `name` field is missing | Medium |
| FMT004 | missing_description | Required `description` field is missing | Medium |

### Naming Rules (NAM)

| ID | Name | Description | Severity |
|----|------|-------------|----------|
| NAM001 | name_uppercase | Name contains uppercase letters | Low |
| NAM002 | name_invalid_chars | Name contains invalid characters | Low |
| NAM003 | name_too_long | Name exceeds 64 characters | Low |
| NAM004 | name_hyphen_bounds | Name starts/ends with hyphen | Low |
| NAM005 | name_consecutive_hyphens | Name has consecutive hyphens | Low |

### Injection Rules (INJ)

| ID | Name | Description | Severity |
|----|------|-------------|----------|
| INJ001 | instruction_override | "Ignore previous instructions" pattern | High |
| INJ002 | jailbreak_attempt | DAN mode, jailbreak patterns | High |
| INJ003 | role_redefinition | "You are now..." patterns | High |
| INJ004 | system_prompt_leak | Attempting to extract system prompt | Medium |
| INJ005 | encoding_bypass | Base64/hex encoded instructions | Medium |

### Security Rules (SEC)

| ID | Name | Description | Severity |
|----|------|-------------|----------|
| SEC001 | hardcoded_api_key | API key patterns detected | Medium |
| SEC002 | hardcoded_password | Password strings detected | Medium |
| SEC003 | private_key_exposure | Private key content detected | High |
| SEC004 | aws_credentials | AWS credential patterns | High |
| SEC005 | jwt_token | JWT token detected | Medium |

### Command Rules (CMD)

| ID | Name | Description | Severity |
|----|------|-------------|----------|
| CMD001 | destructive_rm | `rm -rf` patterns | High |
| CMD002 | disk_format | Disk formatting commands | High |
| CMD003 | privilege_escalation | `sudo`, `su` commands | High |
| CMD004 | download_execute | Download and execute patterns | High |
| CMD005 | reverse_shell | Reverse shell patterns | High |
| CMD006 | file_permission | Dangerous chmod patterns | Medium |

### Tool Rules (TOOL)

| ID | Name | Description | Severity |
|----|------|-------------|----------|
| TOOL001 | bash_wildcard | `Bash(*)` unrestricted access | High |
| TOOL002 | bash_rm | `Bash(rm:*)` file deletion | High |
| TOOL003 | bash_sudo | `Bash(sudo:*)` privilege escalation | High |
| TOOL004 | bash_curl | `Bash(curl:*)` network access | Medium |
| TOOL005 | tool_combo_exfil | Read + WebFetch combination | Medium |
| TOOL006 | tool_combo_malware | Write + Bash combination | High |

### Path Rules (PATH)

| ID | Name | Description | Severity |
|----|------|-------------|----------|
| PATH001 | system_passwd | Access to /etc/passwd | High |
| PATH002 | ssh_keys | Access to ~/.ssh/ | High |
| PATH003 | aws_creds | Access to ~/.aws/ | High |
| PATH004 | env_file | Access to .env files | Medium |
| PATH005 | browser_data | Access to browser profiles | High |
| PATH006 | directory_traversal | `../` traversal patterns | Medium |

### URL Rules (URL)

| ID | Name | Description | Severity |
|----|------|-------------|----------|
| URL001 | non_https | HTTP instead of HTTPS | Low |
| URL002 | direct_ip | IP address in URL | Medium |
| URL003 | suspicious_tld | Suspicious TLD (.xyz, .tk) | Medium |
| URL004 | localhost_access | Localhost/127.0.0.1 access | Low |
| URL005 | internal_ip | Internal network IP | Medium |

### Behavior Rules (BEH)

| ID | Name | Description | Severity |
|----|------|-------------|----------|
| BEH001 | data_collection | User data gathering patterns | Medium |
| BEH002 | data_exfiltration | External data transmission | High |
| BEH003 | persistence | Startup/cron modification | High |
| BEH004 | credential_harvest | Password prompt patterns | High |
| BEH005 | network_scan | Port/host scanning | Medium |
| BEH006 | resource_abuse | Mining, infinite loops | Medium |
| BEH007 | security_bypass | Disable AV/firewall | High |
| BEH008 | brute_force | Unauthorized access attempts | High |
| BEH009 | stealth | Log/history clearing | High |
| BEH010 | social_engineering | Impersonation, phishing | High |

### Content Rules (CONTENT)

| ID | Name | Description | Severity |
|----|------|-------------|----------|
| CONTENT001 | illegal_content | Drugs, terrorism references | High |
| CONTENT002 | hate_speech | Discriminatory content | High |
| CONTENT003 | violence | Violence instructions | High |
| CONTENT004 | privacy_violation | Surveillance patterns | High |
| CONTENT005 | misinformation | Fake news, deception | Medium |

---

## Severity Classification

### High Severity (🔴 -30 points)

Issues that pose immediate and significant security risks:

- Can result in system compromise
- May lead to data theft or destruction
- Could enable privilege escalation
- Potential for malware deployment

**Examples**: `Bash(*)`, prompt injection, private key exposure, reverse shells

### Medium Severity (🟠 -15 points)

Issues that present notable security concerns:

- Could be exploited under certain conditions
- May lead to information disclosure
- Potential for misuse if combined with other factors

**Examples**: Hardcoded API keys, suspicious URLs, data collection patterns

### Low Severity (🟡 -5 points)

Minor issues or best practice violations:

- Generally not exploitable alone
- May indicate poor security hygiene
- Could be stepping stones for larger attacks

**Examples**: Non-HTTPS URLs, naming convention violations, overly broad descriptions

### Informational (ℹ️ 0 points)

Observations that don't affect the score:

- Documentation suggestions
- Performance recommendations
- Style guidelines

---

## Best Practices

### For Skill Developers

1. **Principle of Least Privilege**
   - Request only the tools you need
   - Use specific patterns instead of wildcards (e.g., `Bash(git:status)` instead of `Bash(git:*)`)

2. **Avoid Hardcoded Secrets**
   - Never embed API keys, passwords, or tokens
   - Use environment variables or secure configuration

3. **Document Your Intentions**
   - Explain why specific permissions are needed
   - Describe what external resources will be accessed

4. **Validate External Input**
   - Sanitize user input before processing
   - Avoid executing arbitrary user-provided content

5. **Limit Network Access**
   - Only access necessary external URLs
   - Use HTTPS for all connections

### For Skill Users

1. **Check the Score**
   - Prefer Skills with scores above 70
   - Be cautious with Skills below 40

2. **Review Permissions**
   - Understand what tools the Skill requests
   - Question unusual permission combinations

3. **Verify the Source**
   - Use Skills from trusted developers
   - Check for community reviews and audits

4. **Monitor Behavior**
   - Watch for unexpected network activity
   - Be alert to unusual file system access

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01 | Initial release |

---

## Contributing

To propose changes to this standard:

1. Open an issue describing the proposed change
2. Provide rationale and examples
3. Submit a pull request with documentation updates

---

## License

This security standard is released under MIT License.

---

*Skills Guard - Making Agent Skills Safer*
