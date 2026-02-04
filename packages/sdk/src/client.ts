/**
 * Skills Guard SDK - Client
 * Core Client Implementation
 */

import {
  SkillsGuardClientConfig,
  ScanOptions,
  ScanFileOptions,
  BatchScanOptions,
  ScanResult,
  BatchScanItem,
  BatchScanResult,
  ValidateResult,
  CheckToolsResult,
  RulesListResult,
  ApiResponse,
  SkillsGuardError,
} from './types.js';

const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRIES = 3;

/**
 * Skills Guard Client
 */
export class SkillsGuardClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;
  private retries: number;
  private customFetch: typeof fetch;
  private headers: Record<string, string>;

  constructor(config: Partial<SkillsGuardClientConfig> = {}) {
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.retries = config.retries ?? DEFAULT_RETRIES;
    this.customFetch = config.fetch || globalThis.fetch;
    this.headers = config.headers || {};
  }

  // ============ Core Methods ============

  /**
   * Scan Skill content
   */
  async scan(content: string, options: ScanOptions = {}): Promise<ScanResult> {
    const response = await this.request<ScanResult>('/api/v1/scan', {
      method: 'POST',
      body: {
        content,
        format: options.format || 'json',
        layers: options.layers,
        excludeRules: options.excludeRules,
      },
    });
    return response;
  }

  /**
   * Scan local file (requires server-side support)
   */
  async scanFile(path: string, options: ScanFileOptions = {}): Promise<ScanResult> {
    const response = await this.request<ScanResult>('/api/v1/scan/file', {
      method: 'POST',
      body: {
        path,
        format: options.format || 'json',
        scanDirectories: options.scanDirectories ?? true,
      },
    });
    return response;
  }

  /**
   * Batch scan multiple Skills
   */
  async scanBatch(
    skills: BatchScanItem[],
    options: BatchScanOptions = {}
  ): Promise<BatchScanResult> {
    const response = await this.request<BatchScanResult>('/api/v1/scan/batch', {
      method: 'POST',
      body: {
        skills,
        format: options.format || 'json',
        layers: options.layers,
      },
    });
    return response;
  }

  /**
   * Validate format compliance
   */
  async validate(content: string): Promise<ValidateResult> {
    const response = await this.request<ValidateResult>('/api/v1/validate', {
      method: 'POST',
      body: { content },
    });
    return response;
  }

  /**
   * Check tool risks
   */
  async checkTools(tools: string | string[]): Promise<CheckToolsResult> {
    const response = await this.request<CheckToolsResult>('/api/v1/check-tools', {
      method: 'POST',
      body: { tools },
    });
    return response;
  }

  /**
   * Explain a rule
   */
  async explainRule(ruleId: string): Promise<string> {
    const response = await this.request<{ ruleId: string; explanation: string }>(
      `/api/v1/explain/${ruleId.toUpperCase()}`
    );
    return response.explanation;
  }

  /**
   * Get rules list
   */
  async getRules(filter?: {
    category?: string;
    severity?: string;
  }): Promise<RulesListResult> {
    const params = new URLSearchParams();
    if (filter?.category) params.append('category', filter.category);
    if (filter?.severity) params.append('severity', filter.severity);
    
    const query = params.toString();
    const url = query ? `/api/v1/rules?${query}` : '/api/v1/rules';
    
    return this.request<RulesListResult>(url);
  }

  /**
   * Health check
   */
  async health(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime: number;
  }> {
    return this.request<any>('/health');
  }

  // ============ Convenience Methods ============

  /**
   * Quick check (returns simplified result)
   */
  async quickCheck(content: string): Promise<{
    safe: boolean;
    score: number;
    level: string;
    issueCount: number;
  }> {
    const result = await this.scan(content);
    return {
      safe: result.level === 'safe',
      score: result.score,
      level: result.level,
      issueCount: result.summary.total,
    };
  }

  /**
   * Get detailed report
   */
  async getReport(content: string, detailed: boolean = false): Promise<string> {
    const result = await this.scan(content, {
      format: detailed ? 'detailed' : 'brief',
    });
    return result.report || '';
  }

  /**
   * Check if Skill is safe (score >= 90)
   */
  async isSafe(content: string): Promise<boolean> {
    const result = await this.scan(content);
    return result.level === 'safe';
  }

  // ============ Internal Methods ============

  /**
   * Send HTTP request
   */
  private async request<T>(
    path: string,
    options: {
      method?: string;
      body?: unknown;
    } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const { method = 'GET', body } = options;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.headers,
    };
    
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await this.customFetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        const data: ApiResponse<T> = await response.json();
        
        if (!data.success) {
          throw new SkillsGuardError(
            data.error?.code || 'UNKNOWN_ERROR',
            data.error?.message || 'Unknown error',
            data.error?.details
          );
        }
        
        return data.data as T;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry client errors
        if (error instanceof SkillsGuardError) {
          throw error;
        }
        
        // Last attempt, throw error
        if (attempt === this.retries) {
          break;
        }
        
        // Wait before retry
        await this.sleep(Math.pow(2, attempt) * 100);
      }
    }
    
    throw new SkillsGuardError(
      'REQUEST_FAILED',
      lastError?.message || 'Request failed',
      { url, method }
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Default instance
let defaultClient: SkillsGuardClient | null = null;

/**
 * Get or create default client
 */
export function getClient(config?: Partial<SkillsGuardClientConfig>): SkillsGuardClient {
  if (!defaultClient || config) {
    defaultClient = new SkillsGuardClient(config);
  }
  return defaultClient;
}

/**
 * Convenience function: scan
 */
export async function scan(
  content: string,
  options?: ScanOptions
): Promise<ScanResult> {
  return getClient().scan(content, options);
}

/**
 * Convenience function: validate
 */
export async function validate(content: string): Promise<ValidateResult> {
  return getClient().validate(content);
}

/**
 * Convenience function: check tools
 */
export async function checkTools(
  tools: string | string[]
): Promise<CheckToolsResult> {
  return getClient().checkTools(tools);
}

/**
 * Convenience function: quick check
 */
export async function quickCheck(content: string): Promise<{
  safe: boolean;
  score: number;
  level: string;
  issueCount: number;
}> {
  return getClient().quickCheck(content);
}
