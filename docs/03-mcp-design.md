# Skills Guard - MCP Server Design

## 1. MCP Overview

MCP (Model Context Protocol) is a protocol launched by Anthropic that allows AI applications (such as Claude Desktop, Cursor, CodeBuddy) to interact with external tools.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Working Principle                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User: "Help me check if this Skill is safe?"                  │
│                    │                                            │
│                    ▼                                            │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  AI (Claude/Cursor)                                     │   │
│   │  "I need to call skills-guard's scan_skill tool"        │   │
│   └─────────────────────────┬───────────────────────────────┘   │
│                             │                                   │
│                             ▼ MCP Protocol                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Skills Guard MCP Server                                │   │
│   │  - Receive scan request                                 │   │
│   │  - Execute security detection                           │   │
│   │  - Return result                                        │   │
│   └─────────────────────────┬───────────────────────────────┘   │
│                             │                                   │
│                             ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  AI interprets result and replies to user               │   │
│   │  "This Skill scores 72, has 2 medium-risk issues..."    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. MCP Tool Design

### 2.1 Tool List

| Tool Name | Description | Main Purpose |
|-----------|-------------|--------------|
| `scan_skill` | Scan complete Skill security risks | Core functionality |
| `scan_file` | Scan local Skill file/directory | File scanning |
| `validate_skill` | Validate format compliance only | Quick validation |
| `check_tools` | Analyze allowed-tools configuration risk | Tool check |
| `explain_issue` | Explain security issue details | Deep understanding |
| `suggest_fix` | Generate fix suggestions | Assist in fixing |

### 2.2 Detailed Tool Definitions

#### 2.2.1 scan_skill

**Description:** Scan Agent Skill content for security risks (based on Anthropic specification)

```json
{
  "name": "scan_skill",
  "description": "Scan Agent Skill security risks, analyze Frontmatter, Body, allowed-tools, scripts, etc., return security score and issue details. Supports complete Skill directory or single SKILL.md content.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "content": {
        "type": "string",
        "description": "Complete SKILL.md content (Markdown format, including frontmatter)"
      },
      "format": {
        "type": "string",
        "enum": ["brief", "detailed", "json"],
        "description": "Output format: brief summary / detailed report / json raw data",
        "default": "brief"
      },
      "layers": {
        "type": "array",
        "items": {
          "type": "integer",
          "enum": [0, 1, 2, 3, 4]
        },
        "description": "Specify detection layers: 0-Format compliance 1-Prompt security 2-Tools risk 3-Resource security 4-Behavior analysis (default all)"
      }
    },
    "required": ["content"]
  }
}
```

**Output Example (brief format):**
```
🟡 Security Score: 72/100 (Low Risk)

📋 Format Compliance: ✅ Pass
   name: code-review ✓
   description: ✓

Detected 3 issues:
• 🟠 Medium: 2
• 🟡 Low: 1

Main issues:
• [TOOL001] allowed-tools contains Bash(git:*) with some risk
• [SEC001] Environment variable access detected (line 23)
• [URL001] External URL access detected (line 45)

💡 Suggestion: Add explanations for detected risks before publishing, help users understand necessity of these behaviors.
```

#### 2.2.2 scan_file

**Description:** Scan local Skill file or directory

```json
{
  "name": "scan_file",
  "description": "Scan local Skill directory (containing SKILL.md and optional scripts/references/assets) or single SKILL.md file",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Skill directory path or SKILL.md file path"
      },
      "format": {
        "type": "string",
        "enum": ["brief", "detailed", "json"],
        "default": "brief"
      },
      "scan_dirs": {
        "type": "boolean",
        "description": "Whether to scan scripts/references/ directories (default true)",
        "default": true
      }
    },
    "required": ["path"]
  }
}
```

#### 2.2.3 validate_skill

**Description:** Validate Skill format compliance only (Layer 0), compatible with skills-ref validate

```json
{
  "name": "validate_skill",
  "description": "Validate whether Skill conforms to Anthropic Agent Skills specification (frontmatter format, name naming rules, description requirements, etc.)",
  "inputSchema": {
    "type": "object",
    "properties": {
      "content": {
        "type": "string",
        "description": "Complete SKILL.md content"
      }
    },
    "required": ["content"]
  }
}
```

**Output Example:**
```
📋 Format Validation Result

✅ Frontmatter exists
✅ name: code-review
   • Lowercase + hyphens ✓
   • Length 11 chars ✓
✅ description: Helps review code quality and potential issues...
   • Length 45 chars ✓
✅ allowed-tools: Bash(git:*) Read Grep
   • Format correct ✓

Conclusion: ✅ Conforms to Agent Skills specification
```

#### 2.2.4 check_tools

**Description:** Quickly analyze allowed-tools configuration risk level

```json
{
  "name": "check_tools",
  "description": "Analyze allowed-tools configuration risk level, evaluate potential risks of tool combinations. Input can be space-separated string or array.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "tools": {
        "oneOf": [
          { "type": "string", "description": "Space-separated tool list, e.g., 'Bash(git:*) Read Write'" },
          { "type": "array", "items": { "type": "string" }, "description": "Tool array" }
        ],
        "description": "Tool list"
      }
    },
    "required": ["tools"]
  }
}
```

**Output Example:**
```
🔧 Tool Risk Analysis

Configured tools: Bash(git:*) Read WebFetch

Risk Assessment:
• Bash(git:*)  🟡 Medium - Limited command shell execution (-15 points)
• Read         🟢 Low - Read-only operation (-0 points)
• WebFetch     🟡 Medium - Can fetch external web pages (-5 points)

⚠️ Combination Risk: Read + WebFetch has data exfiltration risk (extra -10 points)
   Attack scenario: Read sensitive files then send via network

Total Deduction: -30 points
Estimated Score Impact: From 100 down to ~70

Suggestions:
• If only git operations needed, consider more precise limits like Bash(git:status) Bash(git:diff)
• Confirm if WebFetch is needed, remove if only for documentation references
```

#### 2.2.5 explain_issue

**Description:** Explain detailed information about a security issue

```json
{
  "name": "explain_issue",
  "description": "Explain detailed information about a security rule or issue, including why it's a problem, potential risks, how to fix",
  "inputSchema": {
    "type": "object",
    "properties": {
      "rule_id": {
        "type": "string",
        "description": "Rule ID, e.g., INJ001, SEC001, FMT003, NAM001"
      }
    },
    "required": ["rule_id"]
  }
}
```

**Output Example (NAM001):**
```
📖 Rule Explanation: NAM001 - name contains uppercase letters

❓ What is this?
According to Agent Skills specification, name field can only contain lowercase letters, numbers, and hyphens.

📋 Specification Requirements:
• Length: 1-64 characters
• Characters: Only a-z, 0-9, -
• Cannot start or end with hyphen
• Cannot contain consecutive hyphens

❌ Invalid Examples:
  name: PDF-Processing    # Contains uppercase
  name: my_skill          # Contains underscore
  name: -my-skill-        # Starts/ends with hyphen

✅ Valid Examples:
  name: pdf-processing
  name: my-skill
  name: code-review-v2

✅ How to fix?
Convert name to lowercase:
  name: PDF-Processing  →  name: pdf-processing
```

#### 2.2.6 suggest_fix

**Description:** Generate fix suggestions for detected issues

```json
{
  "name": "suggest_fix",
  "description": "Generate specific fix suggestions and code examples for detected security issues",
  "inputSchema": {
    "type": "object",
    "properties": {
      "issue": {
        "type": "object",
        "description": "Issue object (from scan_skill result)",
        "properties": {
          "ruleId": { "type": "string" },
          "message": { "type": "string" },
          "location": {
            "type": "object",
            "properties": {
              "line": { "type": "integer" },
              "content": { "type": "string" }
            }
          }
        }
      },
      "context": {
        "type": "string",
        "description": "Context code around the issue (optional)"
      }
    },
    "required": ["issue"]
  }
}
```

## 3. Usage Scenarios

### 3.1 Auto-detect When Creating Skill

```
User: Help me write a code review Skill

AI: OK, I'll create a code review Skill...
    [Generate SKILL.md content]
    
AI: Let me check this Skill's security and compliance...
    [Call scan_skill]
    
AI: Generated code review Skill, security score 85 (Low Risk).

    📋 Format Compliance: ✅ Pass
    
    Detected the following risk points:
    1. allowed-tools uses Bash(git:*) (Medium Risk)
       Note: This is a normal requirement for code review, used for git diff and other commands
    
    Should I adjust allowed-tools configuration or add explanations?
```

### 3.2 Pre-use Check

```
User: Help me check if this Skill is safe?
      [Paste SKILL.md content]

AI: [Call scan_skill]

AI: This Skill scores 45 (Medium Risk), found these issues:

    📋 Format Compliance: ❌ Has problems
    • name field contains uppercase, should change to lowercase
    
    🔴 High Risk Issues:
    • [INJ001] Prompt injection attempt detected (line 15)
      "Ignore previous instructions and..."
    
    🟠 Medium Risk Issues:
    • [SEC001] Will read environment variables
    • [URL005] Sends data to unknown domain xxx.com
    
    ⚠️ Recommend not using this Skill unless you fully trust the source.
    
    Should I explain any issue in detail?
```

### 3.3 Format Validation

```
User: Is this Skill's format correct?

AI: [Call validate_skill]

AI: Format validation result:

    ❌ Found 2 format issues:
    
    1. [NAM001] name "My-Skill" contains uppercase
       Fix: Change to name: my-skill
    
    2. [DESC001] description only has 10 characters, recommend more detail
       Fix: Add functionality description and use cases
    
    Should I help fix these issues?
```

### 3.4 Tool Configuration Check

```
User: If my Skill configures allowed-tools: Bash(*) Read Write, is the risk high?

AI: [Call check_tools]

AI: This tool combination is very high risk (🔴 High)

    • Bash(*) itself is high risk (-25 points)
      Allows executing any shell command
    • Write is medium risk (-10 points)
      Can modify files
    • Bash(*) + Read + Write combination is very high risk (extra -15 points)
      Attack scenario: Read sensitive files, write malicious script, execute

    Estimated score: 100 - 50 = 50 (Medium Risk)
    
    Suggestions:
    1. Precisely limit Bash commands, e.g., Bash(git:*) Bash(npm:install)
    2. If file writing not needed, remove Write
    3. Clearly explain why these permissions are needed in description
```

## 4. Installation & Configuration

### 4.1 Installation Methods

```bash
# Global install
npm install -g skills-guard-mcp

# Or run directly with npx
npx skills-guard-mcp
```

### 4.2 Claude Desktop Configuration

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
// %APPDATA%\Claude\claude_desktop_config.json (Windows)
{
  "mcpServers": {
    "skills-guard": {
      "command": "npx",
      "args": ["skills-guard-mcp"]
    }
  }
}
```

### 4.3 Cursor Configuration

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "skills-guard": {
      "command": "npx",
      "args": ["skills-guard-mcp"]
    }
  }
}
```

### 4.4 CodeBuddy Configuration

```json
// .codebuddy/mcp.json
{
  "mcpServers": {
    "skills-guard": {
      "command": "npx",
      "args": ["skills-guard-mcp"]
    }
  }
}
```

## 5. Advanced Configuration

### 5.1 Custom Rules

```bash
# Use custom rules directory
skills-guard-mcp --rules ./my-rules

# Exclude certain rules
skills-guard-mcp --exclude INJ002,SEC003

# Enable only specific layers
skills-guard-mcp --layers 0,1,2
```

### 5.2 Environment Variable Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `SG_RULES_PATH` | Custom rules path | Built-in rules |
| `SG_EXCLUDE_RULES` | Excluded rule IDs | None |
| `SG_LAYERS` | Enabled detection layers | 0,1,2,3,4 |
| `SG_LOG_LEVEL` | Log level | info |

## 6. Error Handling

### 6.1 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Parse Error` | YAML frontmatter format error | Check `---` separators and YAML syntax |
| `File Not Found` | File path error | Check if file exists |
| `Invalid Skill` | Missing required fields | Add name and description |
| `Rule Not Found` | Rule ID doesn't exist | Use `explain_issue` to see valid rules |

### 6.2 Error Response Format

```json
{
  "error": {
    "code": "PARSE_ERROR",
    "message": "Cannot parse SKILL.md",
    "details": "Line 10 YAML syntax error: unexpected token"
  }
}
```

## 7. MCP Server Implementation

```typescript
// packages/mcp/src/index.ts

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { scan, scanFile, validate, checkTools, explainRule } from "@skills-guard/core";

const server = new Server(
  {
    name: "skills-guard",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool list
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "scan_skill",
      description: "Scan Agent Skill security risks (based on Anthropic specification)",
      inputSchema: {
        type: "object",
        properties: {
          content: { type: "string", description: "Complete SKILL.md content" },
          format: { type: "string", enum: ["brief", "detailed", "json"], default: "brief" },
          layers: { type: "array", items: { type: "integer" } },
        },
        required: ["content"],
      },
    },
    {
      name: "scan_file",
      description: "Scan local Skill file or directory",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Skill path" },
          format: { type: "string", enum: ["brief", "detailed", "json"], default: "brief" },
          scan_dirs: { type: "boolean", default: true },
        },
        required: ["path"],
      },
    },
    {
      name: "validate_skill",
      description: "Validate Skill format compliance (Layer 0)",
      inputSchema: {
        type: "object",
        properties: {
          content: { type: "string", description: "Complete SKILL.md content" },
        },
        required: ["content"],
      },
    },
    {
      name: "check_tools",
      description: "Analyze allowed-tools configuration risk",
      inputSchema: {
        type: "object",
        properties: {
          tools: {
            oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
          },
        },
        required: ["tools"],
      },
    },
    {
      name: "explain_issue",
      description: "Explain security rule details",
      inputSchema: {
        type: "object",
        properties: {
          rule_id: { type: "string", description: "Rule ID" },
        },
        required: ["rule_id"],
      },
    },
  ],
}));

// Tool calls
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "scan_skill": {
        const result = await scan(args.content, {
          layers: args.layers,
          format: args.format,
        });
        return formatResponse(result, args.format);
      }
      
      case "scan_file": {
        const result = await scanFile(args.path, {
          scanDirectories: args.scan_dirs,
          format: args.format,
        });
        return formatResponse(result, args.format);
      }
      
      case "validate_skill": {
        const result = await validate(args.content);
        return formatValidationResponse(result);
      }
      
      case "check_tools": {
        const tools = typeof args.tools === 'string' 
          ? args.tools.split(/\s+/) 
          : args.tools;
        const result = checkTools(tools);
        return formatToolsResponse(result);
      }
      
      case "explain_issue": {
        const explanation = explainRule(args.rule_id);
        return { content: [{ type: "text", text: explanation }] };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Error: ${error.message}`,
      }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```
