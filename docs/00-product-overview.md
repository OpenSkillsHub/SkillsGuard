# Skills Guard - Product Overview

## 1. Product Positioning

**Skills Guard** is a security scanning tool designed specifically for **Agent Skills** (based on Anthropic specification), helping developers and users identify potential security risks in Skills.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   🛡️ Skills Guard                                               │
│                                                                 │
│   Security Scanner for Agent Skills                             │
│   Secure your Agent Skills                                      │
│                                                                 │
│   • Based on Anthropic Agent Skills Specification               │
│   • 5-Layer Deep Detection                                      │
│   • MCP / CLI / API Multi-interface Support                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. What are Agent Skills?

According to the [Anthropic Agent Skills Specification](https://github.com/agentskills/agentskills), an Agent Skill is a standardized directory structure:

```
skill-name/
├── SKILL.md              # Required: Core file
│   ├── Frontmatter       # YAML metadata (name, description, allowed-tools...)
│   └── Body              # Markdown instruction content
│
├── scripts/              # Optional: Executable scripts
├── references/           # Optional: Reference documents
└── assets/               # Optional: Static resources
```

**SKILL.md Example:**
```yaml
---
name: code-review
description: Helps review code quality and potential issues. Use when users need code review.
license: MIT
metadata:
  author: example-org
  version: "1.0"
allowed-tools: Bash(git:*) Read Grep
---

# Code Review Skill

When a user requests code review, follow these steps:
1. Use `git diff` to view changes
2. Analyze code quality
3. Provide improvement suggestions
...
```

## 3. Core Value

### 3.1 Problems Solved

Agent Skills are essentially **instructions that guide AI behavior** and may contain risks:

| Risk Type | Example | Impact |
|-----------|---------|--------|
| **Dangerous Commands** | `rm -rf /`, `format C:` | System destruction |
| **Data Theft** | Read `~/.ssh/id_rsa`, environment variables | Sensitive information leakage |
| **Data Exfiltration** | Send data to unknown servers | Privacy breach |
| **Prompt Injection** | "Ignore previous instructions" | Hijack AI behavior |
| **Permission Abuse** | `allowed-tools: *` | Unlimited permissions |
| **Format Non-compliance** | Missing required fields, naming violations | Compatibility issues |

### 3.2 Our Solution

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Input: Agent Skill (SKILL.md + optional directories)          │
│                                                                 │
│         ↓                                                       │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              Skills Guard Scan Engine                   │   │
│   │                                                         │   │
│   │   Layer 0: Structure Compliance (Frontmatter validation)│   │
│   │   Layer 1: Prompt Content Safety (injection/keys/cmds)  │   │
│   │   Layer 2: Tools Configuration Risk (allowed-tools)     │   │
│   │   Layer 3: Resource Reference Safety (scripts/URL/path) │   │
│   │   Layer 4: Behavior Pattern Analysis (data flow/privesc)│   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│         ↓                                                       │
│                                                                 │
│   Output: Security Report                                       │
│   • Security Score (0-100)                                      │
│   • Risk Level (Safe/Low/Medium/High)                           │
│   • Issue Details + Fix Suggestions                             │
│   • Format Compliance Report                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Target Users

| User Group | Use Case | Core Need |
|------------|----------|-----------|
| **Skill Developers** | Check when creating Skills | Ensure compliance and security |
| **Skill Users** | Check before using | Know if a Skill is trustworthy |
| **Platform Operators** | Platform publishing workflow | Integrate scanning service |
| **Enterprise Security Teams** | Internal Skill review | Compliance and security management |

## 5. Product Forms

### 5.1 Packaging Forms (by Priority)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Skills Guard Product Forms                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   P0 - MCP Server (Preferred)                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  • Native integration with Claude Desktop/Cursor/CodeBuddy│ │
│   │  • AI can directly call scanning capabilities             │ │
│   │  • Local execution, privacy-safe                          │ │
│   │  • Install: npx skills-guard-mcp                          │ │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   P0 - CLI Tool                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  • Local developer use                                    │ │
│   │  • CI/CD integration                                      │ │
│   │  • Compatible with skills-ref validate                    │ │
│   │  • Install: npm install -g skills-guard                   │ │
│   │  • Usage: sg scan ./my-skill/                             │ │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   P1 - REST API                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  • Platform integration (Skills Factory, etc.)            │ │
│   │  • Enterprise private deployment                          │ │
│   │  • POST https://api.skillsguard.dev/scan                  │ │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   P2 - Web Interface                                            │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  • Online experience entry point                          │ │
│   │  • No installation, paste and scan                        │ │
│   │  • https://skillsguard.dev                                │ │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Relationship with skills-ref

[skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref) is the official Skill validation tool provided by Anthropic:

```bash
# skills-ref only does format validation
skills-ref validate ./my-skill

# Skills Guard does security detection (including format validation)
sg scan ./my-skill
```

**Capability Comparison:**

| Capability | skills-ref | Skills Guard |
|------------|-----------|--------------|
| Frontmatter format validation | ✅ | ✅ |
| name naming convention check | ✅ | ✅ |
| Prompt injection detection | ❌ | ✅ |
| Sensitive information detection | ❌ | ✅ |
| Dangerous command detection | ❌ | ✅ |
| allowed-tools risk assessment | ❌ | ✅ |
| scripts/ script security | ❌ | ✅ |
| Security scoring | ❌ | ✅ |

## 6. Relationship with Skills Factory

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Skills Guard (Independent Project)                            │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   Core Scan Engine + Multiple Packaging Forms           │   │
│   │                                                         │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │                                  │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │Skills Factory│  │   Cursor     │  │Other Platforms│        │
│   │  (API Call)  │  │(MCP Integr.) │  │(API Integr.)  │        │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

- **Skills Guard** is an **independent project** focused on security detection capabilities
- **Skills Factory** is a **service consumer** that calls Skills Guard via API
- Both projects **develop independently**, Skills Factory doesn't rebuild scanning capabilities

### 6.1 Skills Factory Integration

Skills Factory uses Skills Guard as follows:

```typescript
// Skills Factory backend code
import { SkillsGuardClient } from '@skills-guard/client';

const client = new SkillsGuardClient({
  endpoint: 'https://api.skillsguard.dev',
  apiKey: process.env.SKILLS_GUARD_API_KEY,
});

// Scan before publishing
async function scanBeforePublish(skillContent: string) {
  const result = await client.scan({
    content: skillContent,
    format: 'detailed',
  });
  
  return {
    score: result.score,
    level: result.level,
    issues: result.issues,
  };
}
```

## 7. Competitive Analysis

| Tool | Positioning | Difference from Skills Guard |
|------|-------------|------------------------------|
| **skills-ref** | Official format validation | Only validates format, no security detection |
| **LLM-Guard** | General LLM security | Doesn't understand Skill structure |
| **Rebuff** | Prompt injection detection | Only detects injection, limited scope |
| **Garak** | LLM vulnerability scanning | Targets LLM itself, not Skills |

**Skills Guard Differentiation:**
- Designed specifically for **Agent Skills specification**
- Understands complete Skill **structure** (Frontmatter + Body + scripts/ + references/)
- 5-layer deep detection, from format to behavior
- **MCP native integration**, deeply integrated with AI workflow

## 8. Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| MVP | MCP installations | 100+ |
| MVP | CLI downloads | 500+ |
| V1 | Daily scans | 1000+ |
| V1 | Skills Factory integration | Complete |
| V2 | API calls | 10000+/month |

## 9. Document Directory

| Document | Content |
|----------|---------|
| 00-product-overview.md | This document |
| 01-detection-design.md | 5-layer detection capability design |
| 02-technical-architecture.md | Technology selection and architecture design |
| 03-mcp-design.md | MCP Server detailed design |
| 04-development-plan.md | Milestones and schedule |
| agent-skills-spec.md | Anthropic official specification reference |
