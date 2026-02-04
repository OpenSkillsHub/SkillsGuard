# Skills Guard Plugin for Claude Code

Agent Skills Security Scanner Plugin - Detect Prompt injection, privilege abuse, data leakage, and other risks.

## Features

- 🔍 **Auto Detection**: Automatic security scanning when editing Skill files
- 🛡️ **5-Layer Security Scan**: Format compliance, Prompt safety, tool risks, resource security, behavior analysis
- 📊 **Security Score**: 0-100 scoring with clear risk levels
- 💡 **Fix Suggestions**: Specific remediation recommendations for each issue

## Installation

```bash
# Install in Claude Code
/plugins install skills-guard

# Or install from marketplace
/plugins
# Search "skills-guard"
# Click install
```

## Usage

### Slash Commands

```bash
# Scan a single Skill
/scan-skill ./my-skill/SKILL.md

# Scan a Skill directory
/scan-skill ./skills/code-review/

# Check tool risks
/check-tools Bash(git:*) Read Write

# Generate security report
/security-report ./skills/ --output report.md
```

### Auto Detection

The plugin automatically scans in these situations:

- When editing `SKILL.md` files
- When editing files in `skills/` directory
- When writing new files containing Skill format

### Deep Analysis

Chat with the Security Analyzer Agent:

```
"Help me analyze the security of this Skill"
"Is the tool configuration of this Skill reasonable?"
"How can I make this Skill more secure?"
```

## Configuration

```json
// .claude/settings.json
{
  "plugins": {
    "skills-guard": {
      "enabled": true,
      "autoScan": true,
      "minScore": 70,
      "blockOnHigh": true
    }
  }
}
```

| Option | Description | Default |
|--------|-------------|---------|
| `enabled` | Enable plugin | `true` |
| `autoScan` | Auto scan | `true` |
| `minScore` | Minimum score warning threshold | `70` |
| `blockOnHigh` | Block on high risk | `true` |

## Risk Levels

| Level | Score | Description |
|-------|-------|-------------|
| 🟢 Safe | 90-100 | No obvious risks |
| 🟡 Low Risk | 70-89 | Acceptable risk points |
| 🟠 Medium Risk | 40-69 | Requires review and fixes |
| 🔴 High Risk | 0-39 | Not recommended for use |

## Detection Rules

### Layer 0: Format Compliance
- Frontmatter structure
- Name naming conventions
- Description requirements

### Layer 1: Prompt Security
- Prompt injection detection
- Sensitive information detection
- Dangerous command identification

### Layer 2: Tool Risks
- allowed-tools configuration
- Tool combination risks
- Excessive permission requests

### Layer 3: Resource Security
- Sensitive path detection
- URL security checks
- Script file scanning

### Layer 4: Behavior Analysis
- Data collection patterns
- Exfiltration behavior detection
- Persistence behavior

## File Structure

```
skills-guard/
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata
├── commands/
│   ├── scan-skill.md            # /scan-skill command
│   ├── check-tools.md           # /check-tools command
│   └── security-report.md       # /security-report command
├── hooks/
│   ├── hooks.json               # Hook configuration
│   └── skill_guard_hook.py      # Security detection hook
├── agents/
│   └── security-analyzer.md     # Security analyzer agent
├── skills/
│   └── security-knowledge.md    # Security knowledge base
└── README.md
```

## License

MIT
