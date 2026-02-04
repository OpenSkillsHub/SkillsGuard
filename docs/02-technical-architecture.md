# Skills Guard - Technical Architecture

## 1. Overall Architecture

### 1.1 Core + Adapters Architecture

Skills Guard adopts a **Core + Adapters** architecture design, implementing "develop once, package for multiple forms":

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Skills Guard Architecture                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                        ┌─────────────────────────┐                          │
│                        │      Core Engine        │                          │
│                        │  (Core Detection Engine)│                          │
│                        │                         │                          │
│                        │  • Parser               │                          │
│                        │  • Rules Engine         │                          │
│                        │  • Scanner              │                          │
│                        │  • Scorer               │                          │
│                        │  • Reporter             │                          │
│                        └───────────┬─────────────┘                          │
│                                    │                                        │
│              ┌─────────────────────┼─────────────────────┐                  │
│              │                     │                     │                  │
│        ┌─────▼─────┐         ┌─────▼─────┐         ┌─────▼─────┐           │
│        │  Adapter  │         │  Adapter  │         │  Adapter  │           │
│        │    API    │         │    CLI    │         │  Plugin   │           │
│        └─────┬─────┘         └─────┬─────┘         └─────┬─────┘           │
│              │                     │                     │                  │
│    ┌─────────┴───────┐       ┌─────┴─────┐     ┌────────┴────────┐        │
│    ▼                 ▼       ▼           ▼     ▼                 ▼        │
│ ┌────────┐     ┌──────────┐ ┌───────┐ ┌──────────┐ ┌───────────────────┐  │
│ │  MCP   │     │  REST    │ │  CLI  │ │ GitHub   │ │   IDE Plugins     │  │
│ │ Server │     │  API     │ │  Tool │ │ Action   │ │ (Claude/CodeBuddy)│  │
│ └────────┘     └──────────┘ └───────┘ └──────────┘ └───────────────────┘  │
│                                                                            │
│    AI Integration  Platform      CLI     CI/CD      Developer Daily        │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Advantages

| Advantage | Description |
|-----------|-------------|
| **Develop Once** | Core engine written once, shared by all forms |
| **Independent Testing** | Core unit tests, Adapter integration tests |
| **Flexible Extension** | Adding adapters doesn't affect core logic |
| **Version Consistency** | All forms use the same rules and scoring logic |
| **Community Friendly** | Developers can choose the most suitable form |

### 1.3 Release Forms

| Form | Package/Installation | Target Users | Scenario |
|------|---------------------|--------------|----------|
| **NPM Core** | `@skills-guard/core` | Library developers | Secondary development integration |
| **MCP Server** | `skills-guard-mcp` | AI IDE users | Claude/Cursor/CodeBuddy |
| **CLI** | `skills-guard` (npx sg) | DevOps | Command line / CI/CD |
| **REST API** | Docker deployment | Platform operators | Skills Factory, etc. |
| **Claude Code Plugin** | `/plugins install` | Claude Code users | Real-time detection during development |
| **CodeBuddy Plugin** | Plugin marketplace | CodeBuddy users | Real-time detection during development |
| **GitHub Action** | `uses: skills-guard/action` | Open source projects | Automatic PR detection |

## 2. Technology Stack

### 2.1 Core Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Language** | TypeScript | Type safety, rich ecosystem, native MCP SDK support |
| **Runtime** | Node.js | Cross-platform, MCP compatible |
| **Package Manager** | pnpm | Good Monorepo support, excellent performance |
| **Build** | tsup | Simple and efficient, ESM/CJS dual output |
| **Testing** | Vitest | Fast, TypeScript native |
| **Rule Format** | YAML | Good readability, easy to edit |
| **YAML Parser** | yaml | Agent Skills spec recommended |

### 2.2 Project Structure

```
skills-guard/
├── packages/
│   ├── core/                     # 🔥 Core scanning engine (pure logic, no external dependencies)
│   │   ├── src/
│   │   │   ├── index.ts          # Main entry - unified exports
│   │   │   ├── scanner.ts        # Main scanner class
│   │   │   ├── parser.ts         # Skill parser
│   │   │   ├── scorer.ts         # Risk scorer
│   │   │   ├── reporter.ts       # Report generator
│   │   │   ├── rules/            # Rules engine
│   │   │   │   ├── index.ts      # Rule loader
│   │   │   │   ├── engine.ts     # Rule execution engine
│   │   │   │   └── types.ts      # Rule type definitions
│   │   │   └── types.ts          # Core type definitions
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mcp/                      # MCP Server adapter
│   │   ├── src/
│   │   │   └── index.ts          # MCP protocol implementation
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── cli/                      # CLI adapter
│   │   ├── src/
│   │   │   └── index.ts          # Command line tool
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── server/                   # REST API adapter
│   │   ├── src/
│   │   │   ├── index.ts          # Express application
│   │   │   └── routes.ts         # API routes
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── plugin-claude/            # Claude Code Plugin adapter
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json       # Plugin metadata
│   │   ├── commands/
│   │   │   ├── scan-skill.md     # /scan-skill command
│   │   │   └── check-tools.md    # /check-tools command
│   │   ├── hooks/
│   │   │   ├── hooks.json        # Hook configuration
│   │   │   └── skill_guard_hook.py  # Pre-install detection Hook
│   │   ├── agents/
│   │   │   └── security-analyzer.md  # Security analysis Agent
│   │   └── README.md
│   │
│   ├── plugin-codebuddy/         # CodeBuddy Plugin adapter
│   │   └── ... (similar structure)
│   │
│   └── sdk/                      # API client (for platform integration)
│       ├── src/
│       │   └── index.ts
│       └── package.json
│
├── rules/                        # 📋 Rule library (YAML configuration)
│   ├── format.yaml               # Layer 0: Format compliance rules
│   ├── injection.yaml            # Layer 1: Prompt injection rules
│   ├── secrets.yaml              # Layer 1: Sensitive information rules
│   ├── commands.yaml             # Layer 1: Dangerous command rules
│   ├── tools.yaml                # Layer 2: Tool risk rules
│   ├── paths.yaml                # Layer 3: Path security rules
│   ├── urls.yaml                 # Layer 3: URL security rules
│   ├── scripts.yaml              # Layer 3: Script security rules
│   └── behavior.yaml             # Layer 4: Behavior pattern rules
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## 3. Core Engine Design

### 3.1 Core Type Definitions

```typescript
// packages/core/src/types.ts

/**
 * Agent Skill structure (based on Anthropic specification)
 */
export interface Skill {
  /** SKILL.md file path */
  path: string;
  
  /** Frontmatter metadata */
  frontmatter: {
    /** Required: 1-64 characters, lowercase + hyphens */
    name: string;
    /** Required: 1-1024 characters, functionality description */
    description: string;
    /** Optional: License */
    license?: string;
    /** Optional: Environment requirements (max 500 characters) */
    compatibility?: string;
    /** Optional: Custom metadata */
    metadata?: Record<string, string>;
    /** Optional: Pre-approved tool list (space-separated) */
    allowedTools?: string[];
  };
  
  /** Body content (Markdown instructions) */
  body: string;
  
  /** Optional directories */
  directories?: {
    scripts?: ScriptFile[];
    references?: ReferenceFile[];
    assets?: string[];
  };
  
  /** Raw content */
  raw: string;
}

export interface ScriptFile {
  path: string;
  content: string;
  language: 'python' | 'bash' | 'javascript' | 'unknown';
}

export interface ReferenceFile {
  path: string;
  content: string;
}

/**
 * Scan issue
 */
export interface Issue {
  /** Rule ID, e.g., INJ001, FMT002 */
  ruleId: string;
  /** Rule name */
  ruleName: string;
  /** Risk level */
  severity: 'high' | 'medium' | 'low' | 'info';
  /** Detection category */
  category: 
    | 'format'      // Layer 0: Format compliance
    | 'injection'   // Layer 1: Prompt injection
    | 'secret'      // Layer 1: Sensitive information
    | 'command'     // Layer 1: Dangerous command
    | 'compliance'  // Layer 1: Content compliance
    | 'tool'        // Layer 2: Tool risk
    | 'path'        // Layer 3: Path security
    | 'url'         // Layer 3: URL security
    | 'script'      // Layer 3: Script security
    | 'behavior';   // Layer 4: Behavior analysis
  /** Issue description */
  message: string;
  /** Fix suggestion */
  suggestion?: string;
  /** Issue location */
  location?: {
    file?: string;      // File path (SKILL.md / scripts/xxx.py)
    line?: number;
    column?: number;
    content?: string;   // Problem code snippet
  };
}

/**
 * Scan result
 */
export interface ScanResult {
  /** Security score 0-100 */
  score: number;
  /** Risk level */
  level: 'safe' | 'low' | 'medium' | 'high';
  /** Detected issues list */
  issues: Issue[];
  /** Issue summary */
  summary: {
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  /** Format compliance */
  formatCompliance: {
    valid: boolean;
    errors: string[];
  };
  /** Metadata */
  metadata: {
    scanTime: number;       // Scan duration ms
    engineVersion: string;
    rulesVersion: string;
    skillName?: string;     // If parsed successfully
  };
}

/**
 * Scan options
 */
export interface ScanOptions {
  /** Which detection layers to include */
  layers?: (0 | 1 | 2 | 3 | 4)[];
  /** Which detection categories to include */
  include?: Issue['category'][];
  /** Which rules to exclude */
  excludeRules?: string[];
  /** Custom rules path */
  customRulesPath?: string;
  /** Whether to scan optional directories (scripts/references/) */
  scanDirectories?: boolean;
  /** Output format */
  format?: 'json' | 'text' | 'markdown';
}
```

### 3.2 Main Scanner Class

```typescript
// packages/core/src/scanner.ts

import { Skill, Issue, ScanResult, ScanOptions } from './types';
import { parseSkill, parseSkillContent } from './parser';
import { RuleEngine } from './rules';
import { RiskScorer } from './scorer';
import { ReportGenerator } from './reporter';

/**
 * Skills Guard Core Scanner
 * Unified entry point for all adapters
 */
export class SkillsGuardScanner {
  private ruleEngine: RuleEngine;
  private scorer: RiskScorer;
  private reporter: ReportGenerator;
  
  constructor(options?: { rulesPath?: string }) {
    this.ruleEngine = new RuleEngine(options?.rulesPath);
    this.scorer = new RiskScorer();
    this.reporter = new ReportGenerator();
  }
  
  /**
   * Scan Skill content (string)
   */
  async scan(content: string, options?: ScanOptions): Promise<ScanResult> {
    const startTime = Date.now();
    
    // 1. Parse Skill content
    const skill = parseSkillContent(content);
    
    // 2. Execute rule detection
    const issues = await this.ruleEngine.check(skill, options);
    
    // 3. Calculate risk score
    const score = this.scorer.calculate(issues);
    const level = this.scorer.getLevel(score);
    
    // 4. Generate result
    return {
      score,
      level,
      issues,
      summary: this.summarizeIssues(issues),
      formatCompliance: this.checkFormatCompliance(issues),
      metadata: {
        scanTime: Date.now() - startTime,
        engineVersion: '1.0.0',
        rulesVersion: this.ruleEngine.version,
        skillName: skill.frontmatter.name || undefined,
      },
    };
  }
  
  /**
   * Scan local Skill file or directory
   */
  async scanFile(path: string, options?: ScanOptions): Promise<ScanResult> {
    const skill = await parseSkill(path);
    const content = skill.raw;
    return this.scan(content, {
      ...options,
      scanDirectories: options?.scanDirectories ?? true,
    });
  }
  
  /**
   * Batch scan multiple Skills
   */
  async scanBatch(paths: string[]): Promise<ScanResult[]> {
    return Promise.all(paths.map(path => this.scanFile(path)));
  }
  
  /**
   * Validate format compliance only (Layer 0)
   */
  async validate(content: string): Promise<ScanResult> {
    return this.scan(content, { layers: [0] });
  }
  
  /**
   * Check tool configuration risk
   */
  checkTools(tools: string[]): { tool: string; risk: string; score: number }[] {
    return this.ruleEngine.analyzeTools(tools);
  }
  
  /**
   * Generate report
   */
  generateReport(result: ScanResult, format: 'json' | 'text' | 'markdown' = 'text'): string {
    return this.reporter.generate(result, format);
  }
  
  /**
   * Explain rule
   */
  explainRule(ruleId: string): string {
    return this.ruleEngine.explain(ruleId);
  }
  
  private summarizeIssues(issues: Issue[]) {
    return {
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length,
      info: issues.filter(i => i.severity === 'info').length,
      total: issues.length,
    };
  }
  
  private checkFormatCompliance(issues: Issue[]) {
    const formatIssues = issues.filter(i => i.category === 'format');
    return {
      valid: formatIssues.filter(i => i.severity === 'high').length === 0,
      errors: formatIssues.map(i => i.message),
    };
  }
}

// Convenience exports
export const scanner = new SkillsGuardScanner();
export const scan = scanner.scan.bind(scanner);
export const scanFile = scanner.scanFile.bind(scanner);
export const validate = scanner.validate.bind(scanner);
export const checkTools = scanner.checkTools.bind(scanner);
```

### 3.3 Parser Design

```typescript
// packages/core/src/parser.ts

import * as yaml from 'yaml';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Skill, ScriptFile, ReferenceFile } from './types';

/**
 * Parse Skill directory or single SKILL.md file
 */
export async function parseSkill(input: string): Promise<Skill> {
  const stat = await fs.stat(input);
  
  if (stat.isDirectory()) {
    return parseSkillDirectory(input);
  } else {
    return parseSkillFile(input);
  }
}

/**
 * Parse Skill directory
 */
async function parseSkillDirectory(dirPath: string): Promise<Skill> {
  const skillMdPath = path.join(dirPath, 'SKILL.md');
  const skill = await parseSkillFile(skillMdPath);
  skill.path = dirPath;
  
  // Parse optional directories
  skill.directories = {
    scripts: await parseScriptsDir(path.join(dirPath, 'scripts')),
    references: await parseReferencesDir(path.join(dirPath, 'references')),
    assets: await listAssets(path.join(dirPath, 'assets')),
  };
  
  return skill;
}

/**
 * Parse single SKILL.md file
 */
async function parseSkillFile(filePath: string): Promise<Skill> {
  const content = await fs.readFile(filePath, 'utf-8');
  return parseSkillContent(content, filePath);
}

/**
 * Parse SKILL.md content
 */
export function parseSkillContent(content: string, filePath: string = 'SKILL.md'): Skill {
  const skill: Skill = {
    path: filePath,
    frontmatter: {
      name: '',
      description: '',
    },
    body: '',
    raw: content,
  };

  // 1. Extract YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    try {
      const fm = yaml.parse(frontmatterMatch[1]);
      skill.frontmatter = {
        name: fm.name || '',
        description: fm.description || '',
        license: fm.license,
        compatibility: fm.compatibility,
        metadata: fm.metadata,
        // allowed-tools is a space-separated string
        allowedTools: parseAllowedTools(fm['allowed-tools']),
      };
    } catch (e) {
      // YAML parsing error, keep raw content for subsequent detection
    }
    
    // Extract body (content after frontmatter)
    skill.body = content.slice(frontmatterMatch[0].length).trim();
  } else {
    // No frontmatter, entire content as body
    skill.body = content;
  }

  return skill;
}

/**
 * Parse allowed-tools string
 * Format: space-separated, e.g., "Bash(git:*) Bash(jq:*) Read"
 */
function parseAllowedTools(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  // Use regex to match, handle tool names with parentheses
  const tools: string[] = [];
  const regex = /(\w+(?:\([^)]*\))?)/g;
  let match;
  while ((match = regex.exec(value)) !== null) {
    tools.push(match[1]);
  }
  return tools.length > 0 ? tools : undefined;
}

/**
 * Parse scripts/ directory
 */
async function parseScriptsDir(dirPath: string): Promise<ScriptFile[]> {
  try {
    const files = await fs.readdir(dirPath);
    const scripts: ScriptFile[] = [];
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      scripts.push({
        path: `scripts/${file}`,
        content,
        language: detectScriptLanguage(file),
      });
    }
    
    return scripts;
  } catch {
    return [];
  }
}

function detectScriptLanguage(filename: string): ScriptFile['language'] {
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.sh') || filename.endsWith('.bash')) return 'bash';
  if (filename.endsWith('.js') || filename.endsWith('.ts')) return 'javascript';
  return 'unknown';
}

/**
 * Parse references/ directory
 */
async function parseReferencesDir(dirPath: string): Promise<ReferenceFile[]> {
  try {
    const files = await fs.readdir(dirPath);
    const refs: ReferenceFile[] = [];
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        refs.push({
          path: `references/${file}`,
          content,
        });
      }
    }
    
    return refs;
  } catch {
    return [];
  }
}

async function listAssets(dirPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    return files.map(f => `assets/${f}`);
  } catch {
    return [];
  }
}
```

### 3.4 Reporter Design

```typescript
// packages/core/src/reporter.ts

import { Issue, ScanResult } from './types';

const SCORE_DEDUCTIONS = {
  high: 30,
  medium: 15,
  low: 5,
  info: 0,
};

export class ReportGenerator {
  generate(result: ScanResult, format: 'json' | 'text' | 'markdown'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(result, null, 2);
      case 'markdown':
        return this.formatMarkdown(result);
      case 'text':
      default:
        return this.formatText(result);
    }
  }
  
  private formatText(result: ScanResult): string {
    const emoji = { safe: '🟢', low: '🟡', medium: '🟠', high: '🔴' }[result.level];
    const levelName = { safe: 'Safe', low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk' }[result.level];
    
    let text = `${emoji} Security Score: ${result.score}/100 (${levelName})\n\n`;
    
    if (!result.formatCompliance.valid) {
      text += `⚠️ Format Non-compliant:\n`;
      for (const err of result.formatCompliance.errors) {
        text += `  • ${err}\n`;
      }
      text += '\n';
    }
    
    if (result.issues.length === 0) {
      text += '✅ No security issues detected';
    } else {
      text += `Detected ${result.summary.total} issues:\n`;
      if (result.summary.high > 0) text += `• 🔴 High: ${result.summary.high}\n`;
      if (result.summary.medium > 0) text += `• 🟠 Medium: ${result.summary.medium}\n`;
      if (result.summary.low > 0) text += `• 🟡 Low: ${result.summary.low}\n`;
      
      text += '\nMain issues:\n';
      for (const issue of result.issues.slice(0, 5)) {
        const emoji = { high: '🔴', medium: '🟠', low: '🟡', info: '💡' }[issue.severity];
        text += `${emoji} [${issue.ruleId}] ${issue.message}\n`;
        if (issue.location?.line) {
          text += `   Location: ${issue.location.file || 'SKILL.md'} line ${issue.location.line}\n`;
        }
      }
    }
    
    return text;
  }
  
  private formatMarkdown(result: ScanResult): string {
    const emoji = { safe: '🟢', low: '🟡', medium: '🟠', high: '🔴' }[result.level];
    const levelName = { safe: 'Safe', low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk' }[result.level];
    
    let md = `# Skills Guard Security Report\n\n`;
    md += `## Summary\n\n`;
    md += `| Item | Result |\n|------|------|\n`;
    md += `| Security Score | ${emoji} **${result.score}/100** (${levelName}) |\n`;
    md += `| Format Compliance | ${result.formatCompliance.valid ? '✅ Pass' : '❌ Fail'} |\n`;
    md += `| Total Issues | ${result.summary.total} |\n`;
    md += `| Scan Time | ${result.metadata.scanTime}ms |\n\n`;
    
    if (result.issues.length > 0) {
      md += `## Detected Issues\n\n`;
      
      const grouped = this.groupIssues(result.issues);
      for (const [severity, issues] of Object.entries(grouped)) {
        if (issues.length === 0) continue;
        const severityEmoji = { high: '🔴 High', medium: '🟠 Medium', low: '🟡 Low', info: '💡 Info' }[severity];
        md += `### ${severityEmoji}\n\n`;
        for (const issue of issues) {
          md += `- **[${issue.ruleId}]** ${issue.message}\n`;
          if (issue.suggestion) {
            md += `  - Suggestion: ${issue.suggestion}\n`;
          }
        }
        md += '\n';
      }
    } else {
      md += `## ✅ No Security Issues Detected\n\n`;
    }
    
    return md;
  }
  
  private groupIssues(issues: Issue[]): Record<string, Issue[]> {
    return {
      high: issues.filter(i => i.severity === 'high'),
      medium: issues.filter(i => i.severity === 'medium'),
      low: issues.filter(i => i.severity === 'low'),
      info: issues.filter(i => i.severity === 'info'),
    };
  }
}
```

## 4. Adapter Design

### 4.1 MCP Server Adapter

See `03-mcp-design.md` for details.

```typescript
// packages/mcp/src/index.ts

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SkillsGuardScanner } from "@skills-guard/core";

const server = new Server({ name: "skills-guard", version: "1.0.0" }, { capabilities: { tools: {} } });
const scanner = new SkillsGuardScanner();

// Register tools
server.setRequestHandler("tools/list", async () => ({ tools: [...] }));
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  switch (name) {
    case "scan_skill": return formatResponse(await scanner.scan(args.content));
    case "scan_file": return formatResponse(await scanner.scanFile(args.path));
    case "validate_skill": return formatResponse(await scanner.validate(args.content));
    case "check_tools": return formatResponse(scanner.checkTools(args.tools));
    // ...
  }
});

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 4.2 CLI Adapter

```typescript
// packages/cli/src/index.ts

import { Command } from 'commander';
import { SkillsGuardScanner } from '@skills-guard/core';
import chalk from 'chalk';

const program = new Command();
const scanner = new SkillsGuardScanner();

program
  .name('sg')
  .description('Skills Guard - Agent Skills Security Detection Tool')
  .version('1.0.0');

// Scan command
program
  .command('scan <target>')
  .description('Scan Skill directory or SKILL.md file')
  .option('-f, --format <format>', 'Output format (json|text|markdown)', 'text')
  .option('-o, --output <file>', 'Output to file')
  .option('--min-score <score>', 'Minimum passing score', '0')
  .option('--exclude <rules>', 'Excluded rule IDs, comma-separated')
  .action(async (target, options) => {
    const result = await scanner.scanFile(target, {
      format: options.format,
      excludeRules: options.exclude?.split(','),
    });
    
    console.log(scanner.generateReport(result, options.format));
    
    if (result.score < parseInt(options.minScore)) {
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate <target>')
  .description('Validate Skill format compliance (Layer 0 only)')
  .action(async (target) => {
    const result = await scanner.scanFile(target, { layers: [0] });
    
    if (result.formatCompliance.valid) {
      console.log(chalk.green('✅ Skill format is compliant'));
    } else {
      console.log(chalk.red('❌ Skill format is non-compliant:'));
      for (const err of result.formatCompliance.errors) {
        console.log(chalk.yellow(`  • ${err}`));
      }
      process.exit(1);
    }
  });

// Check tools risk
program
  .command('check-tools <tools...>')
  .description('Check allowed-tools configuration risk level')
  .action((tools) => {
    const risks = scanner.checkTools(tools);
    for (const { tool, risk, score } of risks) {
      const emoji = score > 20 ? '🔴' : score > 10 ? '🟠' : '🟢';
      console.log(`${emoji} ${tool}: ${risk} (-${score} points)`);
    }
  });

program.parse();
```

### 4.3 Claude Code Plugin Adapter

```
packages/plugin-claude/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── scan-skill.md
│   └── check-tools.md
├── hooks/
│   ├── hooks.json
│   └── skill_guard_hook.py
├── agents/
│   └── security-analyzer.md
└── README.md
```

#### plugin.json

```json
{
  "name": "skills-guard",
  "version": "1.0.0",
  "description": "Agent Skills Security Scanning Plugin - Detect Prompt injection, permission abuse, data leakage risks",
  "author": {
    "name": "Skills Guard Team"
  },
  "category": "security",
  "keywords": ["security", "skills", "agent", "prompt-injection", "audit"]
}
```

#### commands/scan-skill.md

```markdown
---
description: Scan Agent Skill security risks
allowed-tools: Read
---

Scan the specified Skill file or directory, detect security risks.

Execution steps:
1. Read target Skill file content
2. Parse YAML frontmatter and Markdown body
3. Execute multi-layer security detection:
   - Layer 0: Format compliance
   - Layer 1: Prompt injection, sensitive info, dangerous commands
   - Layer 2: Tool permission risks
   - Layer 3: Resource reference security
   - Layer 4: Behavior pattern analysis
4. Calculate security score (0-100)
5. Generate security report

Output format:
- Security score and risk level
- Format compliance check result
- Detected issues list (sorted by severity)
- Fix suggestions

Usage examples:
```
/scan-skill ./my-skill/SKILL.md
/scan-skill ./skills/code-review
```
```

#### hooks/hooks.json

```json
{
  "description": "Skills Guard Security Protection Hook - Auto-detect when editing or installing Skills",
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/skill_guard_hook.py"
          }
        ],
        "matcher": "Edit|Write|MultiEdit"
      }
    ]
  }
}
```

### 4.4 REST API Adapter

```typescript
// packages/server/src/index.ts

import express from 'express';
import { SkillsGuardScanner } from '@skills-guard/core';

const app = express();
const scanner = new SkillsGuardScanner();

app.use(express.json({ limit: '1mb' }));

// Scan Skill
app.post('/api/v1/scan', async (req, res) => {
  try {
    const { content, format = 'json', layers } = req.body;
    const result = await scanner.scan(content, { layers });
    
    if (format === 'json') {
      res.json(result);
    } else {
      res.type('text').send(scanner.generateReport(result, format));
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Validate format
app.post('/api/v1/validate', async (req, res) => {
  try {
    const { content } = req.body;
    const result = await scanner.validate(content);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Check tool risks
app.post('/api/v1/check-tools', (req, res) => {
  try {
    const { tools } = req.body;
    const result = scanner.checkTools(tools);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get rules list
app.get('/api/v1/rules', (req, res) => {
  // ...
});

// Explain rule
app.get('/api/v1/rules/:id', (req, res) => {
  const explanation = scanner.explainRule(req.params.id);
  res.json({ explanation });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Skills Guard API running on port ${PORT}`);
});
```

## 5. Publishing Configuration

### 5.1 NPM Package Configuration

```json
// packages/core/package.json
{
  "name": "@skills-guard/core",
  "version": "1.0.0",
  "description": "Security Scanner Engine for Anthropic Agent Skills",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/index.js",
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "rules"],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "test": "vitest"
  },
  "dependencies": {
    "yaml": "^2.3.0"
  }
}

// packages/mcp/package.json
{
  "name": "skills-guard-mcp",
  "version": "1.0.0",
  "description": "Model Context Protocol Server for Agent Skills Security",
  "bin": {
    "skills-guard-mcp": "./dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@skills-guard/core": "workspace:*"
  }
}

// packages/cli/package.json
{
  "name": "skills-guard",
  "version": "1.0.0",
  "description": "Command Line Tool for Agent Skills Security Scanning",
  "bin": {
    "sg": "./dist/index.js",
    "skills-guard": "./dist/index.js"
  },
  "dependencies": {
    "@skills-guard/core": "workspace:*",
    "commander": "^12.0.0",
    "chalk": "^5.3.0"
  }
}
```

### 5.2 Monorepo Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

```json
// package.json (root)
{
  "name": "skills-guard-monorepo",
  "private": true,
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "publish": "pnpm -r publish"
  }
}
```

## 6. Difference from Code Review

### 6.1 Comparison Summary

| Dimension | Code Review (Claude Code) | Skills Guard |
|-----------|---------------------------|--------------|
| **Detection Object** | Source code (JS/TS/Python...) | Agent Skill definition (YAML/Markdown) |
| **Review Goal** | Code quality, bugs, standard compliance | Prompt injection, permission abuse, data leakage |
| **Threat Model** | Bugs written by developers | Malicious/unsafe AI behavior instructions |
| **Detection Level** | Syntax, logic, pattern matching | Semantic analysis, intent recognition, risk assessment |
| **Typical Issues** | SQL injection, XSS, null pointer | "Ignore previous instructions", excessive permissions, data exfiltration |
| **Use Cases** | PR review, pre-commit | Before Skill publishing, installation, usage |

### 6.2 Complementary Relationship

```
┌──────────────────────────────────────────────────────────────┐
│                    Complete Security Defense System           │
├────────────────────────────┬─────────────────────────────────┤
│     Code Review            │       Skills Guard               │
│     (Code-level Security)  │       (Instruction-level Security)│
├────────────────────────────┼─────────────────────────────────┤
│  Development Phase:        │  Usage Phase:                    │
│  ✅ Skill code quality     │  ✅ Skill definition security    │
│  ✅ Implementation bug     │  ✅ Prompt injection detection   │
│     detection              │  ✅ Permission abuse detection   │
│  ✅ Code security pattern  │  ✅ Behavior risk assessment     │
│     detection              │                                  │
└────────────────────────────┴─────────────────────────────────┘

Code Review  ≈  Antivirus software (scans application code)
Skills Guard ≈  App Store review (reviews App permissions and behavior)
```

**Both complement each other, together forming complete Agent security protection.**
