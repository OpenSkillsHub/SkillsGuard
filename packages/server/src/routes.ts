/**
 * Skills Guard Server - Routes
 * API Route Definitions
 */

import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { SkillsGuardScanner } from '@skills-guard/core';
import { validateBody } from './middleware.js';
import {
  ScanRequestSchema,
  ScanFileRequestSchema,
  ValidateRequestSchema,
  CheckToolsRequestSchema,
  ExplainRequestSchema,
  BatchScanRequestSchema,
  ApiResponse,
  ScanResponse,
  ValidateResponse,
  CheckToolsResponse,
  ExplainResponse,
  BatchScanResponse,
  HealthResponse,
  RulesListResponse,
} from './types.js';

const router: RouterType = Router();
const scanner = new SkillsGuardScanner();
const startTime = Date.now();

// ============ Helper Functions ============

function response<T>(
  res: Response,
  data: T,
  req: Request,
  statusCode: number = 200
): void {
  const result: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      requestId: req.requestId,
      timestamp: Date.now(),
      duration: Date.now() - req.startTime,
    },
  };
  res.status(statusCode).json(result);
}

function errorResponse(
  res: Response,
  code: string,
  message: string,
  req: Request,
  statusCode: number = 400,
  details?: unknown
): void {
  const result: ApiResponse<null> = {
    success: false,
    error: { code, message, details },
    meta: {
      requestId: req.requestId,
      timestamp: Date.now(),
      duration: Date.now() - req.startTime,
    },
  };
  res.status(statusCode).json(result);
}

// ============ API Routes ============

/**
 * GET /health - Health Check
 */
router.get('/health', (req: Request, res: Response) => {
  const data: HealthResponse = {
    status: 'healthy',
    version: scanner.version,
    uptime: Date.now() - startTime,
    timestamp: Date.now(),
  };
  response(res, data, req);
});

/**
 * GET /api/v1/version - Version Info
 */
router.get('/api/v1/version', (req: Request, res: Response) => {
  response(res, {
    name: 'skills-guard-server',
    version: scanner.version,
    nodeVersion: process.version,
  }, req);
});

/**
 * POST /api/v1/scan - Scan Skill Content
 */
router.post(
  '/api/v1/scan',
  validateBody(ScanRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { content, format, layers, excludeRules } = req.body;
      
      const result = await scanner.scan(content, {
        layers: layers as (0 | 1 | 2 | 3 | 4)[],
        excludeRules,
      });
      
      const data: ScanResponse = {
        ...result,
      };
      
      // Add formatted report if not JSON format
      if (format !== 'json') {
        const reportFormat = format === 'detailed' ? 'markdown' : 'text';
        data.report = scanner.generateReport(result, reportFormat);
      }
      
      response(res, data, req);
    } catch (error) {
      errorResponse(
        res,
        'SCAN_ERROR',
        (error as Error).message,
        req,
        500
      );
    }
  }
);

/**
 * POST /api/v1/scan/file - Scan Local File
 */
router.post(
  '/api/v1/scan/file',
  validateBody(ScanFileRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { path, format, scanDirectories } = req.body;
      
      const result = await scanner.scanFile(path, { scanDirectories });
      
      const data: ScanResponse = {
        ...result,
      };
      
      if (format !== 'json') {
        const reportFormat = format === 'detailed' ? 'markdown' : 'text';
        data.report = scanner.generateReport(result, reportFormat);
      }
      
      response(res, data, req);
    } catch (error) {
      const message = (error as Error).message;
      const code = message.includes('ENOENT') ? 'FILE_NOT_FOUND' : 'SCAN_ERROR';
      const status = code === 'FILE_NOT_FOUND' ? 404 : 500;
      errorResponse(res, code, message, req, status);
    }
  }
);

/**
 * POST /api/v1/scan/batch - Batch Scan
 */
router.post(
  '/api/v1/scan/batch',
  validateBody(BatchScanRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { skills, format, layers } = req.body;
      
      const results = await Promise.all(
        skills.map(async (skill: { id?: string; content: string }) => {
          const result = await scanner.scan(skill.content, {
            layers: layers as (0 | 1 | 2 | 3 | 4)[],
          });
          
          const scanResponse: ScanResponse = { ...result };
          
          if (format !== 'json') {
            const reportFormat = format === 'detailed' ? 'markdown' : 'text';
            scanResponse.report = scanner.generateReport(result, reportFormat);
          }
          
          return {
            id: skill.id,
            result: scanResponse,
          };
        })
      );
      
      // Calculate summary
      const summary = {
        total: results.length,
        safe: results.filter(r => r.result.level === 'safe').length,
        low: results.filter(r => r.result.level === 'low').length,
        medium: results.filter(r => r.result.level === 'medium').length,
        high: results.filter(r => r.result.level === 'high').length,
        avgScore: Math.round(
          results.reduce((sum, r) => sum + r.result.score, 0) / results.length
        ),
      };
      
      const data: BatchScanResponse = { results, summary };
      response(res, data, req);
    } catch (error) {
      errorResponse(res, 'BATCH_SCAN_ERROR', (error as Error).message, req, 500);
    }
  }
);

/**
 * POST /api/v1/validate - Validate Format
 */
router.post(
  '/api/v1/validate',
  validateBody(ValidateRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      
      const result = await scanner.validate(content);
      
      const data: ValidateResponse = {
        valid: result.formatCompliance.valid,
        errors: result.formatCompliance.errors,
        warnings: result.issues
          .filter(i => i.severity === 'low' || i.severity === 'info')
          .map(i => i.message),
      };
      
      response(res, data, req);
    } catch (error) {
      errorResponse(res, 'VALIDATE_ERROR', (error as Error).message, req, 500);
    }
  }
);

/**
 * POST /api/v1/check-tools - Check Tool Risks
 */
router.post(
  '/api/v1/check-tools',
  validateBody(CheckToolsRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { tools } = req.body;
      
      const toolsStr = Array.isArray(tools) ? tools.join(' ') : tools;
      const results = scanner.checkTools(toolsStr);
      
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      
      // Calculate estimated risk level
      let estimatedLevel: 'safe' | 'low' | 'medium' | 'high' = 'safe';
      const estimatedScore = 100 - totalScore;
      if (estimatedScore < 40) estimatedLevel = 'high';
      else if (estimatedScore < 70) estimatedLevel = 'medium';
      else if (estimatedScore < 90) estimatedLevel = 'low';
      
      // Generate suggestions
      const suggestions: string[] = [];
      const hasHighRisk = results.some(r => r.risk === 'high');
      const hasMediumRisk = results.some(r => r.risk === 'medium');
      
      if (hasHighRisk) {
        suggestions.push('High-risk tools detected. Consider restricting permissions or removing them.');
      }
      if (hasMediumRisk) {
        suggestions.push('Explain the need for these tools in the description.');
      }
      if (results.length > 5) {
        suggestions.push('Large number of tools requested. Review if all are necessary.');
      }
      
      const data: CheckToolsResponse = {
        tools: results,
        totalScore,
        estimatedLevel,
        suggestions,
      };
      
      response(res, data, req);
    } catch (error) {
      errorResponse(res, 'CHECK_TOOLS_ERROR', (error as Error).message, req, 500);
    }
  }
);

/**
 * POST /api/v1/explain - Explain Rule
 * GET /api/v1/explain/:ruleId - Explain Rule (GET)
 */
router.post(
  '/api/v1/explain',
  validateBody(ExplainRequestSchema),
  (req: Request, res: Response) => {
    try {
      const { ruleId } = req.body;
      const explanation = scanner.explainRule(ruleId.toUpperCase());
      
      const data: ExplainResponse = {
        ruleId: ruleId.toUpperCase(),
        explanation,
      };
      
      response(res, data, req);
    } catch (error) {
      errorResponse(res, 'EXPLAIN_ERROR', (error as Error).message, req, 500);
    }
  }
);

router.get('/api/v1/explain/:ruleId', (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    const explanation = scanner.explainRule(ruleId.toUpperCase());
    
    const data: ExplainResponse = {
      ruleId: ruleId.toUpperCase(),
      explanation,
    };
    
    response(res, data, req);
  } catch (error) {
    errorResponse(res, 'EXPLAIN_ERROR', (error as Error).message, req, 500);
  }
});

/**
 * GET /api/v1/rules - Get Rules List
 */
router.get('/api/v1/rules', (req: Request, res: Response) => {
  try {
    // Get filter conditions from query params
    const { category, severity } = req.query;
    
    // Get all rules (via internal method)
    const rulesEngine = (scanner as any).rulesEngine;
    let rules = rulesEngine.listRules();
    
    // Filter
    if (category && typeof category === 'string') {
      rules = rules.filter((r: any) => r.category === category);
    }
    if (severity && typeof severity === 'string') {
      rules = rules.filter((r: any) => r.severity === severity);
    }
    
    const data: RulesListResponse = {
      total: rules.length,
      rules: rules.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        category: r.category,
        severity: r.severity,
        enabled: r.enabled !== false,
      })),
    };
    
    response(res, data, req);
  } catch (error) {
    errorResponse(res, 'RULES_ERROR', (error as Error).message, req, 500);
  }
});

export { router };
