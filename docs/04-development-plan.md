# Skills Guard - Development Plan

## 1. Milestone Planning

```
┌─────────────────────────────────────────────────────────────────┐
│                    Skills Guard Development Roadmap              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   M0: MVP (2 weeks)                                             │
│   ━━━━━━━━━━━━━━━━━                                             │
│   ☐ Core engine (with Agent Skills spec parsing)               │
│   ☐ MCP Server (6 tools)                                        │
│   ☐ CLI tool (sg scan / sg validate)                           │
│   ☐ Basic rule library (Layer 0-2)                              │
│                                                                 │
│   M1: Enhancement (2 weeks)                                     │
│   ━━━━━━━━━━━━━━━━━                                             │
│   ☐ Complete rule library (Layer 3-4)                           │
│   ☐ scripts/ directory scanning                                 │
│   ☐ NPM publishing                                              │
│   ☐ Detailed documentation                                      │
│                                                                 │
│   M2: Extension (2 weeks)                                       │
│   ━━━━━━━━━━━━━━━━━                                             │
│   ☐ REST API Server                                             │
│   ☐ @skills-guard/sdk package                                   │
│   ☐ Skills Factory integration                                  │
│   ☐ Claude Code Plugin                                          │
│   ☐ CodeBuddy Plugin                                            │
│                                                                 │
│   M3: Advanced (ongoing)                                        │
│   ━━━━━━━━━━━━━━━━━                                             │
│   ☐ GitHub Action                                               │
│   ☐ Continuous rule updates                                     │
│   ☐ AI-assisted detection                                       │
│   ☐ Enterprise features                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. M0: MVP Detailed Plan

### 2.1 Goals

Complete minimum viable version in 2 weeks, supporting:
- Complete parsing based on **Anthropic Agent Skills specification**
- Use via MCP in Claude/Cursor/CodeBuddy
- Use via CLI on command line
- Layer 0-2 detection capabilities (Format compliance + Prompt security + Tools risk)

### 2.2 Task Breakdown

#### Week 1: Core Engine + CLI

| Task | Estimate | Output |
|------|----------|--------|
| Project initialization (Monorepo structure) | 2h | Project skeleton |
| Type definitions (based on Agent Skills spec) | 2h | types.ts |
| Skill parser (Frontmatter + Body) | 4h | parser.ts |
| Rules engine framework | 4h | rules/loader.ts |
| Layer 0 rules (Format compliance) | 4h | rules/format.yaml |
| Layer 1 rules (Injection+Commands+Secrets) | 6h | rules/*.yaml |
| Layer 2 rules (Tool risks) | 4h | rules/tools.yaml |
| Scanner implementation | 4h | scanner.ts |
| Report generator | 4h | reporter.ts |
| CLI basic commands | 4h | cli/index.ts |

#### Week 2: MCP + Refinement

| Task | Estimate | Output |
|------|----------|--------|
| MCP Server implementation (6 tools) | 8h | mcp/index.ts |
| Tool output formatting | 4h | formatters.ts |
| validate_skill implementation | 2h | validate.ts |
| check_tools implementation | 2h | tools-risk.ts |
| explain_issue implementation | 2h | explain.ts |
| Unit tests | 6h | tests/*.test.ts |
| Integration tests | 4h | tests/integration |
| README documentation | 4h | README.md |
| NPM publish preparation | 2h | package.json config |

### 2.3 MVP Feature List

**Core Engine:**
- [x] Agent Skills spec parsing (Frontmatter + Body)
- [x] name field compliance validation
- [x] description field validation
- [x] allowed-tools parsing and risk assessment
- [x] Rule loading and matching
- [x] Score calculation
- [x] Report generation (JSON/Text/Markdown)

**Detection Capabilities (Layer 0-2):**
| Layer | Category | Rule Count | MVP |
|-------|----------|------------|-----|
| 0 | Format Compliance | 12 | ✅ |
| 1 | Prompt Injection | 7 | ✅ |
| 1 | Sensitive Info | 7 | ✅ |
| 1 | Dangerous Commands | 8 | ✅ |
| 1 | Content Compliance | 5 | ⏳ M1 |
| 2 | Tool Risk | 15 | ✅ |
| 3 | Resource Security | 18 | ⏳ M1 |
| 4 | Behavior Analysis | 10 | ⏳ M1 |

**MCP Server:**
- [x] scan_skill tool
- [x] scan_file tool
- [x] validate_skill tool
- [x] check_tools tool
- [x] explain_issue tool
- [x] suggest_fix tool

**CLI:**
- [x] `sg scan <path>` - Scan Skill
- [x] `sg validate <path>` - Format validation (skills-ref compatible)
- [x] `sg check-tools <tools...>` - Tool risk check
- [ ] `sg rules` - List rules (M1)

## 3. M1: Enhancement Plan

### 3.1 Goals

- Complete 5-layer detection capabilities
- scripts/ directory scanning
- Official NPM release

### 3.2 Task List

| Task | Priority | Estimate |
|------|----------|----------|
| Layer 3 rules (Path+URL) | P0 | 6h |
| Layer 4 rules (Behavior analysis) | P0 | 6h |
| scripts/ directory scanning | P0 | 4h |
| references/ directory scanning | P1 | 2h |
| Content compliance detection | P1 | 4h |
| Tool combination risk analysis | P1 | 4h |
| CLI output beautification | P1 | 4h |
| `sg rules` command | P1 | 2h |
| Detailed documentation | P0 | 8h |
| Official NPM release | P0 | 2h |
| GitHub Actions CI | P1 | 4h |

## 4. M2: Extension Plan

### 4.1 REST API Server

Provide HTTP API for platform integration (e.g., Skills Factory):

```
POST /api/v1/scan          # Scan Skill
POST /api/v1/validate      # Format validation
POST /api/v1/check-tools   # Tool check
GET  /api/v1/rules         # Get rules list
GET  /api/v1/rules/:id     # Get rule details
```

### 4.2 @skills-guard/sdk Package

Client SDK for platform integration:

```typescript
// Skills Factory usage example
import { SkillsGuardClient } from '@skills-guard/sdk';

const client = new SkillsGuardClient({
  endpoint: 'https://api.skillsguard.dev',
  apiKey: process.env.SKILLS_GUARD_API_KEY,
});

// Pre-publish scan
const result = await client.scan({
  content: skillMdContent,
  format: 'detailed',
});

// Format validation
const validation = await client.validate({
  content: skillMdContent,
});
```

### 4.3 Skills Factory Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    Skills Factory Integration Plan               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Skills Factory                    Skills Guard                │
│   ┌──────────────────┐             ┌──────────────────┐        │
│   │                  │  HTTP API   │                  │        │
│   │  Publish Flow    │────────────▶│  REST API Server │        │
│   │                  │             │                  │        │
│   │  • Create Skill  │             │  • /scan         │        │
│   │  • Scan on save  │◀────────────│  • /validate     │        │
│   │  • Pre-publish   │   Result    │  • /check-tools  │        │
│   │    detection     │   return    │                  │        │
│   │                  │             │                  │        │
│   └──────────────────┘             └──────────────────┘        │
│                                                                 │
│   Or: Use @skills-guard/sdk package directly                    │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │  import { scan } from '@skills-guard/sdk';               │ │
│   │  const result = await scan(content);                     │ │
│   └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 IDE Plugin Adapters

#### 4.4.1 Claude Code Plugin

```
packages/plugin-claude/
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata
├── commands/
│   ├── scan-skill.md            # /scan-skill scan command
│   └── check-tools.md           # /check-tools tool check
├── hooks/
│   ├── hooks.json               # Hook configuration
│   └── skill_guard_hook.py      # PreToolUse security detection
├── agents/
│   └── security-analyzer.md     # Security analysis expert Agent
└── README.md
```

**Features:**
- `/scan-skill [path]` - Manually scan Skill files
- `/check-tools <tools>` - Check tool configuration risk
- PreToolUse Hook - Auto-detect when editing Skill files
- Security Analyzer Agent - Deep security analysis

**Usage Scenarios:**
```bash
# Manual scan
/scan-skill ./my-skill/SKILL.md

# Check tool risks
/check-tools Bash(git:*) Read Write

# Auto protection (Hook auto-triggers)
# Auto-detect when editing *.skill.md or SKILL.md
```

#### 4.4.2 CodeBuddy Plugin

Similar structure, adapted to CodeBuddy plugin specifications.

### 4.5 GitHub Action

```yaml
# .github/workflows/skill-guard.yml
name: Skills Guard
on:
  pull_request:
    paths:
      - '**/*.skill.md'
      - '**/SKILL.md'
      - 'skills/**'

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: skills-guard/action@v1
        with:
          path: ./skills
          min-score: 70
          fail-on-high: true
```

## 5. Technical Debt & Optimization

| Item | Description | Priority |
|------|-------------|----------|
| Hot rule updates | Support rule updates without restart | P2 |
| Cache optimization | Skip duplicate scans for same content | P2 |
| Incremental scanning | Only scan changed parts | P3 |
| AI-assisted detection | Use LLM to detect complex patterns | P3 |
| Multi-language rules | Support Chinese Prompt detection | P2 |
| Performance optimization | Chunked processing for large files | P2 |

## 6. Success Metrics

### 6.1 MVP Stage

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature Completion | 100% | Feature list complete |
| Test Coverage | >80% | Vitest coverage |
| Documentation | README + API | Docs exist |
| Agent Skills Compatibility | 100% | Pass skills-ref test cases |

### 6.2 Post-launch

| Metric | Target | Period |
|--------|--------|--------|
| NPM Downloads | 100+ | First month |
| GitHub Stars | 50+ | First month |
| MCP Installs | 50+ | First month |
| Issue Response Time | <24h | Ongoing |

### 6.3 Post Skills Factory Integration

| Metric | Target | Period |
|--------|--------|--------|
| API Calls | 1000+/day | First month after integration |
| Average Scan Time | <500ms | Ongoing |
| False Positive Rate | <5% | Ongoing monitoring |

## 7. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Agent Skills spec changes | Medium | High | Monitor Anthropic official updates, maintain compatibility |
| MCP protocol changes | Low | High | Monitor official updates, timely adaptation |
| High false positive rate | Medium | Medium | Collect feedback, continuously optimize rules |
| Performance issues | Low | Medium | Reserve optimization space, chunked processing for large files |

## 8. Development Order

```
Phase 1: Core Engine (Week 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Create project structure
   └── pnpm init + workspace config

2. Define types (based on Agent Skills spec)
   └── packages/core/src/types.ts

3. Implement Parser
   ├── Frontmatter parsing
   ├── name/description validation
   └── allowed-tools parsing

4. Create rule library
   ├── rules/format.yaml (Layer 0)
   ├── rules/injection.yaml (Layer 1)
   ├── rules/secrets.yaml (Layer 1)
   ├── rules/commands.yaml (Layer 1)
   └── rules/tools.yaml (Layer 2)

5. Implement Scanner + Scorer + Reporter
   └── packages/core/src/*.ts

Phase 2: Adapters - CLI & MCP (Week 2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. Implement CLI adapter
   ├── sg scan
   ├── sg validate
   └── sg check-tools

7. Implement MCP Server adapter
   ├── scan_skill
   ├── scan_file
   ├── validate_skill
   ├── check_tools
   ├── explain_issue
   └── suggest_fix

8. Testing & Documentation
   ├── Unit tests
   ├── Integration tests
   └── README.md

Phase 3: Complete Rules (Week 3)
━━━━━━━━━━━━━━━━━━━━━━━━━━
9. Layer 3-4 rules
   ├── rules/paths.yaml
   ├── rules/urls.yaml
   ├── rules/scripts.yaml
   └── rules/behavior.yaml

10. scripts/ directory scanning
    └── Support Python/Bash/JS script detection

11. NPM Publishing
    ├── @skills-guard/core
    ├── skills-guard (CLI)
    └── skills-guard-mcp

Phase 4: Adapters - Plugin (Week 4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
12. Claude Code Plugin adapter
    ├── plugin.json metadata
    ├── /scan-skill command
    ├── /check-tools command
    ├── PreToolUse Hook
    └── security-analyzer Agent

13. CodeBuddy Plugin adapter
    └── Similar structure

14. Testing & Publishing
    ├── Local testing
    └── Submit to plugin marketplace

Phase 5: Platform Integration (Week 5-6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
15. REST API Server
    └── packages/server/

16. @skills-guard/sdk client
    └── packages/sdk/

17. Skills Factory integration
    ├── Publish flow integration
    └── Security report display

18. GitHub Action
    └── skills-guard/action
```

---

**Next Step:** Start MVP development!
