/**
 * Skills Guard - Core Types
 * Based on Anthropic Agent Skills specification
 */

/**
 * Agent Skill structure
 */
export interface Skill {
  /** SKILL.md file path */
  path: string;

  /** Frontmatter metadata */
  frontmatter: SkillFrontmatter;

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

/**
 * Skill Frontmatter metadata
 */
export interface SkillFrontmatter {
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
  /** Optional: Pre-authorized tool list */
  allowedTools?: string[];
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
 * Severity level
 */
export type Severity = 'high' | 'medium' | 'low' | 'info';

/**
 * Detection category
 */
export type IssueCategory =
  | 'format'      // Layer 0: Format compliance
  | 'injection'   // Layer 1: Prompt injection
  | 'secret'      // Layer 1: Sensitive information
  | 'command'     // Layer 1: Dangerous commands
  | 'compliance'  // Layer 1: Content compliance
  | 'tool'        // Layer 2: Tool risk
  | 'path'        // Layer 3: Path security
  | 'url'         // Layer 3: URL security
  | 'script'      // Layer 3: Script security
  | 'behavior';   // Layer 4: Behavior analysis

/**
 * Scan issue
 */
export interface Issue {
  /** Rule ID, e.g., INJ001, FMT002 */
  ruleId: string;
  /** Rule name */
  ruleName: string;
  /** Severity level */
  severity: Severity;
  /** Detection category */
  category: IssueCategory;
  /** Issue description */
  message: string;
  /** Fix suggestion */
  suggestion?: string;
  /** Issue location */
  location?: {
    file?: string;
    line?: number;
    column?: number;
    content?: string;
  };
}

/**
 * Risk level
 */
export type RiskLevel = 'safe' | 'low' | 'medium' | 'high';

/**
 * Scan result
 */
export interface ScanResult {
  /** Security score 0-100 */
  score: number;
  /** Risk level */
  level: RiskLevel;
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
    scanTime: number;
    engineVersion: string;
    rulesVersion: string;
    skillName?: string;
  };
}

/**
 * Scan options
 */
export interface ScanOptions {
  /** Include which detection layers */
  layers?: (0 | 1 | 2 | 3 | 4)[];
  /** Include which detection categories */
  include?: IssueCategory[];
  /** Exclude which rules */
  excludeRules?: string[];
  /** Custom rules path */
  customRulesPath?: string;
  /** Scan optional directories (scripts/references/) */
  scanDirectories?: boolean;
  /** Output format */
  format?: 'json' | 'text' | 'markdown';
}

/**
 * Rule definition
 */
export interface Rule {
  id: string;
  name: string;
  description: string;
  category: IssueCategory;
  severity: Severity;
  patterns?: (string | RegExp)[];
  validator?: (skill: Skill) => Issue | null;
  message: string;
  suggestion?: string;
  enabled: boolean;
}

/**
 * Tool risk configuration
 */
export interface ToolRisk {
  pattern: string | RegExp;
  severity: Severity;
  score: number;
  description: string;
}

/**
 * Tool check result
 */
export interface ToolCheckResult {
  tool: string;
  risk: Severity;
  score: number;
  description: string;
}
