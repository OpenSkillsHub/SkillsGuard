/**
 * Skills Guard Server - Main Entry
 * Express Application Configuration
 */

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { router } from './routes.js';
import {
  requestContext,
  requestLogger,
  apiKeyAuth,
  errorHandler,
  notFoundHandler,
} from './middleware.js';
import { openApiSpec } from './openapi.js';
import { ServerConfig, defaultConfig } from './types.js';

/**
 * Create Express Application
 */
export function createApp(config: Partial<ServerConfig> = {}): Express {
  const cfg = { ...defaultConfig, ...config };
  const app = express();

  // ============ Base Middleware ============
  
  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }));
  
  // CORS
  if (cfg.cors) {
    app.use(cors(cfg.cors));
  }
  
  // Rate Limiting
  if (cfg.rateLimit) {
    app.use(rateLimit({
      windowMs: cfg.rateLimit.windowMs,
      max: cfg.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
        },
      },
    }));
  }
  
  // JSON Parsing
  app.use(express.json({ limit: '10mb' }));
  
  // Request Context
  app.use(requestContext);
  
  // Request Logger
  app.use(requestLogger(cfg.logLevel));
  
  // API Key Authentication
  app.use(apiKeyAuth(cfg.apiKey));

  // ============ API Documentation ============
  
  if (cfg.enableSwagger) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Skills Guard API',
    }));
    
    // OpenAPI JSON
    app.get('/openapi.json', (req, res) => {
      res.json(openApiSpec);
    });
  }

  // ============ Business Routes ============
  
  app.use(router);

  // ============ Error Handling ============
  
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

/**
 * Start Server
 */
export function startServer(config: Partial<ServerConfig> = {}): Promise<void> {
  const cfg = { ...defaultConfig, ...config };
  const app = createApp(cfg);
  
  return new Promise((resolve, reject) => {
    const server = app.listen(cfg.port, cfg.host, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🛡️  Skills Guard Server                                  ║
║                                                            ║
║   Running at: http://${cfg.host}:${cfg.port}                       ║
║   API Docs:   http://${cfg.host}:${cfg.port}/docs                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
      resolve();
    });
    
    server.on('error', reject);
  });
}

// Export types
export * from './types.js';
