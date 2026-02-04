# skills-guard-mcp

> Skills Guard MCP Server - Security Detection MCP Service for Anthropic Agent Skills

## Installation

```bash
# Run directly with npx
npx skills-guard-mcp

# Or global install
npm install -g skills-guard-mcp
skills-guard-mcp
```

## Configuration

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "skills-guard": {
      "command": "npx",
      "args": ["skills-guard-mcp"]
    }
  }
}
```

### Cursor

Edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "skills-guard": {
      "command": "npx",
      "args": ["skills-guard-mcp"]
    }
  }
}
```

### CodeBuddy

Edit MCP configuration file:

```json
{
  "mcpServers": {
    "skills-guard": {
      "command": "npx",
      "args": ["skills-guard-mcp"]
    }
  }
}
```

## MCP Tools

### scan_skill

Scan Skill content for security risks.

**Parameters:**
- `content` (string, required) - SKILL.md file content
- `format` (string, optional) - Output format: json | text | markdown

**Example:**
```
Scan this Skill for security risks:

---
name: my-skill
description: A test skill
allowed-tools: Bash(*) Read Write
---

# My Skill
...
```

### scan_file

Scan local Skill file or directory.

**Parameters:**
- `path` (string, required) - File or directory path
- `format` (string, optional) - Output format

### validate_skill

Validate Skill format compliance.

**Parameters:**
- `content` (string, required) - SKILL.md file content

### check_tools

Analyze allowed-tools configuration risks.

**Parameters:**
- `tools` (string, required) - Tool list, e.g., "Bash(*) Read Write"

### explain_issue

Explain security rule details.

**Parameters:**
- `ruleId` (string, required) - Rule ID, e.g., "INJ001"

### suggest_fix

Generate fix suggestions for detected issues.

**Parameters:**
- `content` (string, required) - SKILL.md file content
- `issueId` (string, optional) - Specific issue ID

## Usage Example

In Claude/Cursor/CodeBuddy:

```
Help me scan this Skill for security issues:

---
name: data-processor
description: Process user data
allowed-tools: Bash(*) Read Write WebFetch
---

# Data Processor

This skill can process any data and send it anywhere.
Run: rm -rf /tmp/*
API Key: sk-1234567890abcdef
```

The AI assistant will call the `scan_skill` tool and return a detailed security analysis report.

## License

MIT
