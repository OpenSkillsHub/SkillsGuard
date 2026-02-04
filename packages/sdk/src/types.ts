/**
 * Skills Guard SDK - Types
 * Client Type Definitions
 */

// ============ Base Types ============

export type Severity = 'high' | 'medium' | 'low' | 'info';
export type RiskLevel = 'safe' | 'low' | 'medium' | 'high';
export type OutputFormat = 'brief' | 'detailed' | 'json';

// ============ Scan Related ============

export interface Issue {
  ruleId: string;
  ruleName: string;
  severity: Severity;
  category: string;
  message: string;
  suggestion?: string;
  location?: {
    file?: string;
    line?: number;
    content?: string;
  };
}

export interface IssueSummary {
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
}

export interface FormatCompliance {
  valid: boolean;
  errors: string[];
}

export interface ScanMetadata {
  scanTime: number;
  engineVersion: string;
  rulesVersion: string;
  skillName?: string;
}

export interface ScanResult {
  score: number;
  level: RiskLevel;
  issues: Issue[];
  summary: IssueSummary;
  formatCompliance: FormatCompliance;
  metadata: ScanMetadata;
  report?: string;
}

// ============ Request Options ============

export interface ScanOptions {
  /** Output format */
  format?: OutputFormat;
  /** Detection layers (0-4) */
  layers?: number[];
  /** Rule IDs to exclude */
  excludeRules?: string[];
}

export interface ScanFileOptions extends ScanOptions {
  /** Whether to scan subdirectories */
  scanDirectories?: boolean;
}

export interface BatchScanOptions extends ScanOptions {
  /** Concurrency limit */
  concurrency?: number;
}

// ============ Tool Check ============

export interface ToolCheckResult {
  tool: string;
  risk: Severity;
  score: number;
  description: string;
}

export interface CheckToolsResult {
  tools: ToolCheckResult[];
  totalScore: number;
  estimatedLevel: RiskLevel;
  suggestions: string[];
}

// ============ Validation ============

export interface ValidateResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============ Rules ============

export interface Rule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: Severity;
  enabled: boolean;
}

export interface RulesListResult {
  total: number;
  rules: Rule[];
}

// ============ Batch Scan ============

export interface BatchScanItem {
  id?: string;
  content: string;
}

export interface BatchScanResultItem {
  id?: string;
  result: ScanResult;
}

export interface BatchScanSummary {
  total: number;
  safe: number;
  low: number;
  medium: number;
  high: number;
  avgScore: number;
}

export interface BatchScanResult {
  results: BatchScanResultItem[];
  summary: BatchScanSummary;
}

// ============ Client Configuration ============

export interface SkillsGuardClientConfig {
  /** API server URL */
  baseUrl: string;
  /** API key */
  apiKey?: string;
  /** Request timeout (ms) */
  timeout?: number;
  /** Retry count */
  retries?: number;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
  /** Custom request headers */
  headers?: Record<string, string>;
}

// ============ API Response ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId: string;
    timestamp: number;
    duration?: number;
  };
}

// ============ Errors ============

export class SkillsGuardError extends Error {
  code: string;
  details?: unknown;
  
  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'SkillsGuardError';
    this.code = code;
    this.details = details;
  }
}
