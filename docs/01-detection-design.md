# Skills Guard - Detection Design

> This document defines the complete detection capabilities of Skills Guard, **strictly based on the Agent Skills specification** (see `agent-skills-spec.md`).

## 1. Agent Skills Structure Analysis

According to the Agent Skills specification, a standard Skill contains the following structure:

```
skill-name/
└── SKILL.md              # Required: Core file
    ├── Frontmatter       # YAML metadata
    │   ├── name          # Required: 1-64 chars, lowercase + hyphens
    │   ├── description   # Required: 1-1024 chars, describes purpose
    │   ├── license       # Optional: license
    │   ├── compatibility # Optional: environment requirements
    │   ├── metadata      # Optional: custom metadata
    │   └── allowed-tools # Optional: pre-approved tools list (experimental)
    │
    └── Body Content      # Markdown instructions
        ├── Role definition
        ├── Behavior instructions
        └── Constraints

# Optional directories
├── scripts/              # Executable scripts
├── references/           # Reference documents
└── assets/               # Static resources
```

## 2. Detection Scope and Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    Skills Guard Detection Layers                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Layer 0: Structure Compliance (Based on Agent Skills Spec)    │
│   ────────────────────────────────────────────────              │
│   • Frontmatter format validation                               │
│   • name field compliance                                       │
│   • description quality check                                   │
│   • allowed-tools validity                                      │
│                                                                 │
│   Layer 1: Prompt Content Security                              │
│   ────────────────────────────────────────────────              │
│   • Prompt injection detection                                  │
│   • Sensitive information detection                             │
│   • Dangerous command detection                                 │
│   • Content compliance detection                                │
│                                                                 │
│   Layer 2: Tools Configuration Risk (Based on allowed-tools)    │
│   ────────────────────────────────────────────────              │
│   • Individual tool risk assessment                             │
│   • Tool combination risk analysis                              │
│   • Undeclared tool usage detection                             │
│                                                                 │
│   Layer 3: Resource Reference Security                          │
│   ────────────────────────────────────────────────              │
│   • scripts/ script security                                    │
│   • references/ check                                           │
│   • External URL security                                       │
│   • File path security                                          │
│                                                                 │
│   Layer 4: Behavior Pattern Analysis                            │
│   ────────────────────────────────────────────────              │
│   • Data flow analysis                                          │
│   • Privilege escalation detection                              │
│   • Resource abuse detection                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Layer 0: Structure Compliance Detection

### 3.1 Frontmatter Format Validation

**Goal:** Ensure SKILL.md conforms to the Agent Skills specification.

| Rule ID | Detection Item | Risk Level | Description |
|---------|----------------|------------|-------------|
| FMT001 | Missing frontmatter | 🟡 Medium | Must have `---` wrapped YAML header |
| FMT002 | YAML syntax error | 🔴 High | Frontmatter parsing failed |
| FMT003 | Missing name field | 🔴 High | name is a required field |
| FMT004 | Missing description field | 🔴 High | description is a required field |

### 3.2 name Field Compliance

According to the specification, the `name` field must:
- Be 1-64 characters
- Contain only lowercase letters, numbers, hyphens
- Not start or end with a hyphen
- Not contain consecutive hyphens

| Rule ID | Detection Item | Risk Level | Example |
|---------|----------------|------------|---------|
| NAM001 | Contains uppercase | 🟠 Medium | `PDF-Processing` → `pdf-processing` |
| NAM002 | Contains illegal characters | 🟠 Medium | `my_skill` → `my-skill` |
| NAM003 | Starts/ends with hyphen | 🟠 Medium | `-pdf-` → `pdf` |
| NAM004 | Contains consecutive hyphens | 🟠 Medium | `pdf--tool` → `pdf-tool` |
| NAM005 | Exceeds 64 characters | 🟠 Medium | Needs shortening |

### 3.3 description Quality Check

| Rule ID | Detection Item | Risk Level | Description |
|---------|----------------|------------|-------------|
| DESC001 | Too short (<20 chars) | 🟡 Low | Description should clearly explain functionality |
| DESC002 | Too long (>1024 chars) | 🟡 Low | Exceeds spec limit |
| DESC003 | Missing use case | 🟢 Info | Recommend explaining "when to use" |

### 3.4 allowed-tools Validity

According to the specification, `allowed-tools` is a space-separated tool list:

```yaml
allowed-tools: Bash(git:*) Bash(jq:*) Read
```

| Rule ID | Detection Item | Risk Level | Description |
|---------|----------------|------------|-------------|
| TOOL001 | Format error | 🟠 Medium | Should be space-separated |
| TOOL002 | Unknown tool name | 🟡 Low | Tool name may not be supported |
| TOOL003 | Wildcard abuse | 🟠 Medium | `Bash(*)` has excessive permissions |

---

## 4. Layer 1: Prompt Content Security

### 4.1 Prompt Injection Detection

**Goal:** Detect malicious instructions attempting to hijack AI behavior.

| Rule ID | Detection Pattern | Risk Level | Description |
|---------|-------------------|------------|-------------|
| INJ001 | `Ignore previous instructions` | 🔴 High | Role override attempt |
| INJ002 | `Disregard above`, `Forget everything` | 🔴 High | Instruction clearing |
| INJ003 | `You are now`, `Act as` (outside role definition) | 🟡 Medium | Role redefinition |
| INJ004 | `[[SYSTEM]]`, `<\|im_start\|>` | 🔴 High | System instruction injection |
| INJ005 | Base64/Unicode encoded suspicious content | 🟡 Medium | Encoding bypass |
| INJ006 | `DAN`, `jailbreak`, `unlimited mode` | 🔴 High | Jailbreak attempt |
| INJ007 | `{{`, `${`, `<%`, `{%` | 🟡 Medium | Template injection |

**Detection Logic:**
```typescript
const injectionPatterns = [
  { id: 'INJ001', pattern: /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?)/gi, severity: 'high' },
  { id: 'INJ002', pattern: /disregard\s+(everything|all)\s+(above|before)/gi, severity: 'high' },
  { id: 'INJ003', pattern: /forget\s+(everything|all)\s+you\s+(know|were\s+told)/gi, severity: 'high' },
  { id: 'INJ004', pattern: /\[\[SYSTEM\]\]|<\|im_start\|>|<\|system\|>/gi, severity: 'high' },
  { id: 'INJ005', pattern: /[A-Za-z0-9+/]{50,}={0,2}/g, severity: 'medium' }, // Base64
  { id: 'INJ006', pattern: /\bDAN\b|jailbreak|developer\s+mode/gi, severity: 'high' },
  { id: 'INJ007', pattern: /\{\{|\$\{|<%|\{%/g, severity: 'medium' },
];
```

### 4.2 Sensitive Information Detection

**Goal:** Detect hardcoded API keys, passwords, and other sensitive information.

| Rule ID | Detection Pattern | Risk Level | Description |
|---------|-------------------|------------|-------------|
| SEC001 | `sk-[a-zA-Z0-9]{48}` | 🔴 High | OpenAI API Key |
| SEC002 | `AKIA[0-9A-Z]{16}` | 🔴 High | AWS Access Key |
| SEC003 | `-----BEGIN.*PRIVATE KEY-----` | 🔴 High | Private key |
| SEC004 | `ghp_[a-zA-Z0-9]{36}` | 🔴 High | GitHub Token |
| SEC005 | `xoxb-`, `xoxp-` | 🔴 High | Slack Token |
| SEC006 | `password\s*[=:]\s*['"][^'"]+['"]` | 🟡 Medium | Hardcoded password |
| SEC007 | Random string ≥32 chars | 🟡 Medium | Suspected key |

### 4.3 Dangerous Command Detection

**Goal:** Detect dangerous commands that could harm user systems.

| Rule ID | Detection Pattern | Risk Level | Description |
|---------|-------------------|------------|-------------|
| CMD001 | `rm\s+-rf`, `del\s+/[sf]` | 🔴 High | Recursive deletion |
| CMD002 | `format`, `fdisk`, `mkfs` | 🔴 High | Disk formatting |
| CMD003 | `curl.*\|\s*(ba)?sh`, `wget.*&&.*bash` | 🔴 High | Download & execute |
| CMD004 | `chmod\s+777`, `chmod\s+-R\s+777` | 🟡 Medium | Dangerous permissions |
| CMD005 | `sudo`, `su\s+root`, `runas` | 🟡 Medium | Privilege escalation |
| CMD006 | `eval`, `exec` | 🟡 Medium | Dynamic execution |
| CMD007 | `kill\s+-9`, `taskkill\s+/f` | 🟡 Medium | Forced termination |
| CMD008 | `reg\s+delete`, `registry` | 🟡 Medium | Registry modification |

### 4.4 Content Compliance Detection

| Rule ID | Detection Type | Risk Level | Handling |
|---------|----------------|------------|----------|
| CMP001 | Illegal content | 🔴 High | Flag |
| CMP002 | Pornographic/Vulgar | 🔴 High | Flag |
| CMP003 | Violence/Gore | 🔴 High | Flag |
| CMP004 | Discriminatory content | 🔴 High | Flag |
| CMP005 | Politically sensitive | 🟡 Medium | Alert |

---

## 5. Layer 2: Tools Configuration Risk

### 5.1 Tool Permission Risk Assessment

Based on the `allowed-tools` field in the Agent Skills specification:

```yaml
# Example
allowed-tools: Bash(git:*) Bash(jq:*) Read Write
```

**Tool Risk Classification:**

| Tool/Pattern | Risk Level | Deduction | Description |
|--------------|------------|-----------|-------------|
| `Read`, `Grep`, `Glob`, `ListDir` | 🟢 Low | -0 | Read-only operations |
| `WebSearch` | 🟢 Low | -0 | Web search |
| `WebFetch` | 🟡 Medium | -5 | Fetch web pages, may leak URL |
| `Edit`, `Write`, `CreateFile` | 🟡 Medium | -10 | File modification |
| `Delete` | 🟡 Medium | -10 | Delete files |
| `Bash(xxx:*)` | 🟡 Medium | -15 | Limited command shell execution |
| `Bash(*)`, `Execute`, `Shell` | 🔴 High | -25 | Arbitrary command execution |
| `*` | 🔴 High | -30 | Unrestricted permissions |

### 5.2 Tool Combination Risk Analysis

Certain tool combinations create higher risks:

| Combination | Risk | Description | Extra Deduction |
|-------------|------|-------------|-----------------|
| `Read` + `WebFetch` | 🟡 Medium | Read local files and send externally | -10 |
| `Read` + `Bash(*)` | 🔴 High | Read sensitive files and execute | -15 |
| `Grep` + `WebFetch` | 🟡 Medium | Search sensitive info and exfiltrate | -10 |
| `Write` + `Bash(*)` | 🔴 High | Write malicious script and execute | -15 |

### 5.3 Undeclared Tool Usage Detection

Detect if Prompt Body instructs using tools not declared in `allowed-tools`:

| Rule ID | Detection Scenario | Risk Level | Description |
|---------|-------------------|------------|-------------|
| UTOOL001 | Prompt mentions Execute but not declared | 🟠 Medium | May bypass permission limits |
| UTOOL002 | References undeclared MCP tools | 🟡 Low | Depends on undeclared capabilities |

---

## 6. Layer 3: Resource Reference Security

### 6.1 scripts/ Directory Detection

According to the specification, `scripts/` directory contains executable code:

| Rule ID | Detection Item | Risk Level | Description |
|---------|----------------|------------|-------------|
| SCR001 | Scripts contain dangerous commands | 🔴 High | Apply CMD* rules to script content |
| SCR002 | Scripts contain sensitive info | 🔴 High | Apply SEC* rules to script content |
| SCR003 | Scripts download external code | 🔴 High | `curl | sh` pattern |
| SCR004 | Scripts modify system files | 🟡 Medium | Modifying /etc/ etc. |

### 6.2 references/ Directory Detection

| Rule ID | Detection Item | Risk Level | Description |
|---------|----------------|------------|-------------|
| REF001 | References contain dangerous instructions | 🟡 Medium | Check REFERENCE.md etc. |
| REF002 | Deep nested references | 🟢 Low | Spec recommends keeping to one level |

### 6.3 External URL Security Check

| Rule ID | Detection Item | Risk Level | Description |
|---------|----------------|------------|-------------|
| URL001 | Non-HTTPS link | 🟡 Medium | Insecure transmission |
| URL002 | Direct IP address | 🟡 Medium | Bypassing domain check |
| URL003 | Short URL | 🟡 Medium | Hiding real destination |
| URL004 | Unknown domain | 🟢 Low | Alert user attention |
| URL005 | Known malicious domain | 🔴 High | Blacklist match |

**Safe Domain Whitelist:**
```yaml
safe_domains:
  - github.com
  - githubusercontent.com
  - npmjs.com
  - pypi.org
  - docs.python.org
  - developer.mozilla.org
  - anthropic.com
```

### 6.4 File Path Security Check

| Rule ID | Detection Pattern | Risk Level | Description |
|---------|-------------------|------------|-------------|
| PATH001 | `~/.ssh`, `.ssh/` | 🔴 High | SSH key directory |
| PATH002 | `id_rsa`, `id_ed25519` | 🔴 High | Private key files |
| PATH003 | `/etc/passwd`, `/etc/shadow` | 🔴 High | System password files |
| PATH004 | `.env`, `.env.local` | 🟡 Medium | Environment variable files |
| PATH005 | `~/.aws/credentials` | 🔴 High | AWS credentials |
| PATH006 | `~/.config` | 🟡 Medium | Config directory |
| PATH007 | `/etc/` | 🟡 Medium | System configuration |

---

## 7. Layer 4: Behavior Pattern Analysis

### 7.1 Data Flow Analysis

Detect possible data exfiltration paths:

```
Pattern: Read sensitive data → Exfiltrate
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   "Read ~/.ssh/id_rsa"  →  "Send to https://xxx.com"            │
│           ↓                         ↓                           │
│      Sensitive file read       External URL access              │
│           └─────────────┬───────────┘                           │
│                         ↓                                       │
│              🔴 High Risk: Data exfiltration                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Rule ID | Detection Pattern | Risk Level |
|---------|-------------------|------------|
| FLOW001 | Sensitive path + External URL | 🔴 High |
| FLOW002 | Environment variable + Network request | 🟡 Medium |
| FLOW003 | File read + Command execution | 🟡 Medium |

### 7.2 Privilege Escalation Detection

| Rule ID | Detection Pattern | Risk Level | Description |
|---------|-------------------|------------|-------------|
| PRIV001 | `sudo`, `su root` | 🟡 Medium | Direct privilege escalation |
| PRIV002 | Modify sudoers | 🔴 High | Persistent privilege escalation |
| PRIV003 | setuid/setgid operations | 🔴 High | Permission setting |

### 7.3 Resource Abuse Detection

| Rule ID | Detection Pattern | Risk Level | Description |
|---------|-------------------|------------|-------------|
| RES001 | `while(true)`, `infinite loop` | 🟡 Medium | Possible infinite loop |
| RES002 | Large amount of repeated content | 🟢 Low | Token abuse |
| RES003 | Extremely long single line | 🟢 Low | Possible obfuscation |
| RES004 | Body exceeds 5000 tokens | 🟢 Info | Spec recommended value |

---

## 8. Scoring Algorithm

### 8.1 Base Scoring

```
Base Score = 100

Deduction Rules:
- Each 🔴 High issue: -30 points
- Each 🟠 Medium issue: -15 points (tool-related)
- Each 🟡 Medium issue: -15 points
- Each 🟢 Low issue: -5 points
- Combination risks: Extra deduction (see 5.2)

Final Score = max(0, min(100, Base Score - Total Deduction))
```

### 8.2 Level Determination

| Level | Score Range | Badge | User Recommendation |
|-------|-------------|-------|---------------------|
| Safe | 90-100 | 🟢 | Safe to use |
| Low Risk | 70-89 | 🟡 | Recommend understanding before use |
| Medium Risk | 40-69 | 🟠 | Requires careful evaluation |
| High Risk | 0-39 | 🔴 | Use with caution |

### 8.3 Scoring Example

```
Example Skill:
- Frontmatter complete ✅
- name compliant ✅
- allowed-tools: Bash(git:*) Read WebFetch
  - Bash(git:*): -15 (limited command)
  - Read: -0
  - WebFetch: -5
  - Combination Read+WebFetch: -10
- Prompt content:
  - Environment variable access detected (SEC): -15

Total Deduction = 15 + 5 + 10 + 15 = 45
Final Score = 100 - 45 = 55 → 🟠 Medium Risk
```

---

## 9. Rule Library Management

### 9.1 Rule Definition Format

```yaml
# rules/injection.yaml
rules:
  - id: INJ001
    name: role_override
    description: Detect role override attempts
    category: injection
    severity: high
    patterns:
      - 'ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?)'
      - 'disregard\s+(everything|all)\s+(above|before)'
    message: Role override attempt detected, may hijack AI behavior
    suggestion: Remove such instructions, or confirm this is intended behavior
    enabled: true
```

### 9.2 Rule Categories

```
rules/
├── format.yaml         # Format compliance rules (Layer 0)
├── injection.yaml      # Prompt injection rules
├── secrets.yaml        # Sensitive information rules
├── commands.yaml       # Dangerous command rules
├── compliance.yaml     # Content compliance rules
├── tools.yaml          # Tool risk rules
├── paths.yaml          # File path rules
├── urls.yaml           # URL security rules
├── scripts.yaml        # Script security rules
└── behavior.yaml       # Behavior pattern rules
```

### 9.3 Rule Statistics

| Layer | Category | Rule Count | Coverage |
|-------|----------|------------|----------|
| Layer 0 | Format Compliance | 12 | Frontmatter validation |
| Layer 1 | Prompt Security | 25 | Injection/Secrets/Commands/Compliance |
| Layer 2 | Tools Risk | 15 | Tool permission assessment |
| Layer 3 | Resource Security | 18 | Scripts/URLs/Paths |
| Layer 4 | Behavior Analysis | 10 | Data flow/Permissions/Resources |
| **Total** | - | **80** | - |

---

## 10. Special Scenario Handling

### 10.1 Dynamic Content Placeholders

Common dynamic content in Skills should not be false positives:

```markdown
# Normal usage, should not alert
When user provides `${USER_INPUT}`...
```

**Handling:** Determine if it's documentation in context.

### 10.2 Code Example Blocks

Content in code blocks needs different treatment:

```markdown
# This is a code example, reduced risk level
\`\`\`bash
rm -rf ./temp  # Example command
\`\`\`
```

**Handling:** Detection results inside code blocks are downgraded by one risk level.

### 10.3 Multi-language Support

Detection rules need to support both English and Chinese:

| English Pattern | Chinese Pattern |
|-----------------|-----------------|
| `Ignore previous instructions` | `忽略之前的指令` |
| `You are now` | `你现在是` |
| `jailbreak` | `越狱` |
