/**
 * Skills Guard Server - Types
 * API Request/Response Type Definitions
 */

import { z } from 'zod';
import type { ScanResult, ToolCheckResult, RiskLevel, Severity } from '@skills-guard/core';

// ============ Request Schemas ============

/** scan_skill Request */
export const ScanRequestSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
  format: z.enum(['brief', 'detailed', 'json']).default('json'),
  layers: z.array(z.number().int().min(0).max(4)).optional(),
  excludeRules: z.array(z.string()).optional(),
});

export type ScanRequest = z.infer<typeof ScanRequestSchema>;

/** scan_file Request */
export const ScanFileRequestSchema = z.object({
  path: z.string().min(1, 'Path cannot be empty'),
  format: z.enum(['brief', 'detailed', 'json']).default('json'),
  scanDirectories: z.boolean().default(true),
});

export type ScanFileRequest = z.infer<typeof ScanFileRequestSchema>;

/** validate Request */
export const ValidateRequestSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
});

export type ValidateRequest = z.infer<typeof ValidateRequestSchema>;

/** check_tools Request */
export const CheckToolsRequestSchema = z.object({
  tools: z.union([
    z.string().min(1),
    z.array(z.string()).min(1),
  ]),
});

export type CheckToolsRequest = z.infer<typeof CheckToolsRequestSchema>;

/** explain Request */
export const ExplainRequestSchema = z.object({
  ruleId: z.string().min(1, 'Rule ID cannot be empty'),
});

export type ExplainRequest = z.infer<typeof ExplainRequestSchema>;

/** batch scan Request */
export const BatchScanRequestSchema = z.object({
  skills: z.array(z.object({
    id: z.string().optional(),
    content: z.string().min(1),
  })).min(1).max(50),
  format: z.enum(['brief', 'detailed', 'json']).default('json'),
  layers: z.array(z.number().int().min(0).max(4)).optional(),
});

export type BatchScanRequest = z.infer<typeof BatchScanRequestSchema>;

// ============ Response Types ============

/** Generic API Response */
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

/** Scan Response */
export interface ScanResponse {
  score: number;
  level: RiskLevel;
  issues: Array<{
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
  }>;
  summary: {
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  formatCompliance: {
    valid: boolean;
    errors: string[];
  };
  metadata: {
    scanTime: number;
    engineVersion: string;
    rulesVersion: string;
    skillName?: string;
  };
  /** Formatted report (returned for brief/detailed format) */
  report?: string;
}

/** Validate Response */
export interface ValidateResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Check Tools Response */
export interface CheckToolsResponse {
  tools: ToolCheckResult[];
  totalScore: number;
  estimatedLevel: RiskLevel;
  suggestions: string[];
}

/** Batch Scan Response */
export interface BatchScanResponse {
  results: Array<{
    id?: string;
    result: ScanResponse;
  }>;
  summary: {
    total: number;
    safe: number;
    low: number;
    medium: number;
    high: number;
    avgScore: number;
  };
}

/** Rule Explanation Response */
export interface ExplainResponse {
  ruleId: string;
  explanation: string;
}

/** Health Check Response */
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: number;
}

/** Rules List Response */
export interface RulesListResponse {
  total: number;
  rules: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    severity: Severity;
    enabled: boolean;
  }>;
}

// ============ Server Configuration ============

export interface ServerConfig {
  /** Server port */
  port: number;
  /** Host address */
  host: string;
  /** CORS configuration */
  cors?: {
    origin: string | string[] | boolean;
    credentials?: boolean;
  };
  /** Rate limiting */
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  /** API key (optional authentication) */
  apiKey?: string;
  /** Enable Swagger UI */
  enableSwagger?: boolean;
  /** Log level */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export const defaultConfig: ServerConfig = {
  port: 3000,
  host: '0.0.0.0',
  cors: {
    origin: true,
    credentials: true,
  },
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests
  },
  enableSwagger: true,
  logLevel: 'info',
};
