#!/usr/bin/env node
/**
 * Skills Guard Server - CLI
 * Command line server startup
 */

import { startServer, ServerConfig } from './index.js';

// Parse command line arguments
function parseArgs(): Partial<ServerConfig> {
  const args = process.argv.slice(2);
  const config: Partial<ServerConfig> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '-p':
      case '--port':
        config.port = parseInt(args[++i], 10);
        break;
      case '-h':
      case '--host':
        config.host = args[++i];
        break;
      case '-k':
      case '--api-key':
        config.apiKey = args[++i];
        break;
      case '--no-swagger':
        config.enableSwagger = false;
        break;
      case '--no-rate-limit':
        config.rateLimit = undefined;
        break;
      case '-d':
      case '--debug':
        config.logLevel = 'debug';
        break;
      case '-v':
      case '--version':
        console.log('skills-guard-server v0.1.0');
        process.exit(0);
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
    }
  }
  
  // Environment variable overrides
  if (process.env.PORT) {
    config.port = parseInt(process.env.PORT, 10);
  }
  if (process.env.HOST) {
    config.host = process.env.HOST;
  }
  if (process.env.API_KEY) {
    config.apiKey = process.env.API_KEY;
  }
  if (process.env.LOG_LEVEL) {
    config.logLevel = process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error';
  }
  
  return config;
}

function printHelp() {
  console.log(`
Skills Guard Server - Agent Skills Security Detection API Service

Usage: skills-guard-server [options]

Options:
  -p, --port <port>       Server port (default: 3000)
  -h, --host <host>       Host address (default: 0.0.0.0)
  -k, --api-key <key>     API key authentication
  --no-swagger            Disable Swagger docs
  --no-rate-limit         Disable rate limiting
  -d, --debug             Debug mode
  -v, --version           Show version
  --help                  Show help

Environment Variables:
  PORT                    Server port
  HOST                    Host address
  API_KEY                 API key
  LOG_LEVEL               Log level (debug/info/warn/error)

Examples:
  # Default startup
  skills-guard-server

  # Specify port
  skills-guard-server -p 8080

  # Enable API authentication
  skills-guard-server -k my-secret-key

  # Debug mode
  skills-guard-server -d

API Endpoints:
  GET  /health              Health check
  POST /api/v1/scan         Scan Skill content
  POST /api/v1/scan/file    Scan local file
  POST /api/v1/scan/batch   Batch scan
  POST /api/v1/validate     Validate format
  POST /api/v1/check-tools  Check tool risks
  POST /api/v1/explain      Explain rule
  GET  /api/v1/rules        Get rules list
  GET  /docs                API docs (Swagger UI)
`);
}

// Main function
async function main() {
  const config = parseArgs();
  
  try {
    await startServer(config);
  } catch (error) {
    console.error('Startup failed:', (error as Error).message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  process.exit(0);
});

main();
