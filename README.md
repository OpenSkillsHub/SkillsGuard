# 🛡️ Skills Guard

> Security Scanner for Anthropic Agent Skills

**[English](./README.md)** | [简体中文](./README.zh-CN.md)

[![NPM Version](https://img.shields.io/npm/v/skills-guard)](https://www.npmjs.com/package/skills-guard)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/node/v/skills-guard)](package.json)

**Documentation:** [Security Standard](./SECURITY_STANDARD.md) | [Contributing](./CONTRIBUTING.md) | [Changelog](./CHANGELOG.md)

Skills Guard is a security scanning tool designed specifically for **Anthropic Agent Skills specification**, helping developers and users identify potential security risks in Skills.

## ✨ Features

- 🔍 **5-Layer Deep Analysis** - Format Compliance → Prompt Security → Tool Risks → Resource Security → Behavior Analysis
- 📊 **62+ Detection Rules** - Covering injection attacks, sensitive information, dangerous commands, and more
- 🎯 **Quantitative Scoring** - 0-100 score for intuitive risk assessment
- 🔌 **Multiple Interfaces** - CLI / MCP Server / REST API / SDK / IDE Plugin

## 📦 Installation

### CLI Tool

```bash
# Global install
npm install -g skills-guard

# Or use npx
npx skills-guard scan ./my-skill
```

### MCP Server

```bash
# Run directly
npx skills-guard-mcp

# Or global install
npm install -g skills-guard-mcp
skills-guard-mcp
```

### REST API Server

```bash
# Start server
npx skills-guard-server

# Custom port
npx skills-guard-server -p 8080

# Enable API authentication
npx skills-guard-server -k your-api-key
```

### SDK Client

```bash
npm install @skills-guard/sdk
```

### Core Library

```bash
npm install @skills-guard/core
```

## 🚀 Quick Start

### CLI Usage

```bash
# Scan a Skill directory
sg scan ./my-skill

# Scan a single SKILL.md file
sg scan ./my-skill/SKILL.md

# Validate format compliance
sg validate ./my-skill

# Check tool configuration risks
sg check-tools "Bash(*)" Read Write WebFetch

# List all rules
sg rules

# Explain a specific rule
sg explain INJ001

# Output as JSON (for AI Agent consumption)
sg scan ./my-skill --format json
```

### SDK Usage

```typescript
import { SkillsGuardClient, quickCheck } from '@skills-guard/sdk';

// Create client
const client = new SkillsGuardClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key', // optional
});

// Scan a Skill
const result = await client.scan(skillContent);
console.log(`Security Score: ${result.score}/100`);
console.log(`Risk Level: ${result.level}`);

// Quick check
const check = await client.quickCheck(skillContent);
if (check.safe) {
  console.log('Skill is safe!');
}

// Check tool risks
const tools = await client.checkTools('Bash(git:*) Read WebFetch');
console.log(`Total Deduction: ${tools.totalScore}`);
```

### REST API Usage

```bash
# Scan a Skill
curl -X POST http://localhost:3000/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"content": "---\nname: test\ndescription: Test skill\n---\n\n# Test"}'

# Check tool risks
curl -X POST http://localhost:3000/api/v1/check-tools \
  -H "Content-Type: application/json" \
  -d '{"tools": "Bash(git:*) Read Write"}'

# Get rules list
curl http://localhost:3000/api/v1/rules

# API documentation
open http://localhost:3000/docs
```

### Core Library Usage

```typescript
import { SkillsGuardScanner } from '@skills-guard/core';

const scanner = new SkillsGuardScanner();

// Scan content
const result = await scanner.scan(skillContent);
console.log(`Security Score: ${result.score}/100`);
console.log(`Risk Level: ${result.level}`);
console.log(`Issues Found: ${result.issues.length}`);

// Check tool risks
const toolRisks = scanner.checkTools(['Bash(*)', 'Read', 'Write']);
```

### MCP Configuration

Configure in Claude Desktop / Cursor / CodeBuddy:

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

## 📋 Detection Capabilities

### Rule Distribution

| Layer | Category | Rules | Examples |
|-------|----------|-------|----------|
| Layer 0 | Format Compliance | 11 | Missing name/description, naming violations |
| Layer 1 | Prompt Injection | 5 | "Ignore previous instructions", system prompt injection |
| Layer 1 | Sensitive Info | 5 | API keys, private keys, hardcoded passwords |
| Layer 1 | Dangerous Commands | 6 | `rm -rf /`, disk formatting |
| Layer 1 | Content Compliance | 5 | Illegal content, hate speech, violence |
| Layer 2 | Tool Risks | 15+ | `Bash(*)`, tool combination risks |
| Layer 3 | Path Security | 10 | SSH keys, AWS credentials, browser data |
| Layer 3 | URL Security | 5 | Non-HTTPS, direct IP, suspicious domains |
| Layer 3 | Script Security | 5 | Subprocess calls, remote execution, env vars |
| Layer 4 | Behavior Analysis | 10 | Data collection, persistence, brute force |

### Scoring Algorithm

```
Base Score = 100

Deduction Rules:
- Each 🔴 Critical issue: -30 points
- Each 🟠 Medium issue: -15 points
- Each 🟡 Low issue: -5 points

Risk Level Classification:
- 90-100 → 🟢 Safe
- 70-89  → 🟡 Low Risk
- 40-69  → 🟠 Medium Risk
- 0-39   → 🔴 High Risk
```

## 🛠️ CLI Commands

| Command | Description |
|---------|-------------|
| `sg scan <path>` | Scan Skill for security risks |
| `sg validate <path>` | Validate format compliance |
| `sg check-tools <tools...>` | Analyze tool configuration risks |
| `sg rules` | List all detection rules |
| `sg explain <ruleId>` | Explain rule details |
| `sg quick` | Quick scan from stdin |

### Scan Options

```bash
sg scan ./skill [options]

Options:
  -f, --format <format>   Output format (json|text|markdown)
  -o, --output <file>     Output to file
  --min-score <score>     Minimum passing score (exit 1 if below)
  --exclude <rules>       Exclude rule IDs, comma-separated
  --layers <layers>       Detection layers, comma-separated (0,1,2,3,4)
  --no-scripts            Skip scripts/ directory scanning
  -q, --quiet             Minimal output
```

## 🔌 MCP Tools

| Tool | Description |
|------|-------------|
| `scan_skill` | Scan Skill content |
| `scan_file` | Scan local file/directory |
| `validate_skill` | Validate format compliance |
| `check_tools` | Analyze tool configuration risks |
| `explain_issue` | Explain security rules |
| `suggest_fix` | Generate fix suggestions |

## 📁 Project Structure

```
packages/
├── core/           # @skills-guard/core - Core Engine
│   ├── src/
│   │   ├── types.ts       # Type definitions
│   │   ├── parser.ts      # Skill parser
│   │   ├── rules/         # Rules engine (62+ rules)
│   │   ├── scanner.ts     # Main scanner
│   │   ├── scorer.ts      # Scorer
│   │   └── reporter.ts    # Report generator
│   └── tests/             # Unit tests
│
├── cli/            # skills-guard - CLI Tool
│   └── src/index.ts
│
├── mcp/            # skills-guard-mcp - MCP Server
│   └── src/index.ts
│
├── server/         # @skills-guard/server - REST API
│   ├── src/
│   │   ├── index.ts       # Express application
│   │   ├── routes.ts      # API routes
│   │   ├── middleware.ts  # Middleware
│   │   └── openapi.ts     # Swagger documentation
│   └── tests/
│
├── sdk/            # @skills-guard/sdk - Client SDK
│   └── src/
│       ├── client.ts      # HTTP client
│       └── types.ts       # Type definitions
│
└── plugin-claude/  # Claude Code Plugin
    ├── .claude-plugin/
    ├── commands/          # Slash commands
    ├── hooks/             # Security detection hooks
    ├── agents/            # Security analysis agent
    └── skills/            # Security knowledge base
```

## 🧪 Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Test CLI locally
node packages/cli/dist/index.js scan examples/safe-skill
```

## 📄 License

MIT License

## 🤝 Contributing

We welcome contributions! Please see our:

- 📖 [Contributing Guide](CONTRIBUTING.md) - How to contribute
- 📜 [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines
- 🔒 [Security Policy](SECURITY.md) - Reporting vulnerabilities
- 📋 [Changelog](CHANGELOG.md) - Version history

