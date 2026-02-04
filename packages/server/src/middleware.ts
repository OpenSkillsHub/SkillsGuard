/**
 * Skills Guard Server - Middleware
 * Express Middleware Functions
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/** Request Context Extension */
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Request ID and Timing Middleware
 */
export function requestContext(req: Request, res: Response, next: NextFunction) {
  req.requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}

/**
 * Request Logger Middleware
 */
export function requestLogger(logLevel: string = 'info') {
  return (req: Request, res: Response, next: NextFunction) => {
    const { method, path, requestId } = req;
    
    // Log request
    if (logLevel === 'debug') {
      console.log(`[${requestId}] → ${method} ${path}`);
    }
    
    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - req.startTime;
      const { statusCode } = res;
      const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
      
      if (logLevel === 'debug' || level !== 'info') {
        console.log(`[${requestId}] ← ${method} ${path} ${statusCode} ${duration}ms`);
      }
    });
    
    next();
  };
}

/**
 * Zod Validation Middleware
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          meta: {
            requestId: req.requestId,
            timestamp: Date.now(),
          },
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * API Key Authentication Middleware
 */
export function apiKeyAuth(apiKey?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip authentication if no API key configured
    if (!apiKey) {
      return next();
    }
    
    // Skip health check and documentation
    if (req.path === '/health' || req.path.startsWith('/docs')) {
      return next();
    }
    
    const providedKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (providedKey !== apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or missing API key',
        },
        meta: {
          requestId: req.requestId,
          timestamp: Date.now(),
        },
      });
    }
    
    next();
  };
}

/**
 * Error Handler Middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`[${req.requestId}] Error:`, err);
  
  // Response already sent, do not handle
  if (res.headersSent) {
    return next(err);
  }
  
  const statusCode = 'statusCode' in err ? (err as any).statusCode : 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
    meta: {
      requestId: req.requestId,
      timestamp: Date.now(),
    },
  });
}

/**
 * 404 Not Found Handler Middleware
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    meta: {
      requestId: req.requestId,
      timestamp: Date.now(),
    },
  });
}

/**
 * Simple UUID Generator (avoids uuid package dependency)
 */
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
