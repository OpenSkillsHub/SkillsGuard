/**
 * Skills Guard Server - OpenAPI Spec
 * Swagger/OpenAPI Documentation
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Skills Guard API',
    version: '1.0.0',
    description: 'Agent Skills Security Detection REST API',
    contact: {
      name: 'Skills Guard Team',
      url: 'https://github.com/skills-guard/skills-guard',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'scan', description: 'Security scanning' },
    { name: 'validate', description: 'Format validation' },
    { name: 'tools', description: 'Tool analysis' },
    { name: 'rules', description: 'Rule management' },
    { name: 'system', description: 'System information' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['system'],
        summary: 'Health check',
        description: 'Check service status',
        responses: {
          200: {
            description: 'Service healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/version': {
      get: {
        tags: ['system'],
        summary: 'Version information',
        responses: {
          200: {
            description: 'Version information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        version: { type: 'string' },
                        nodeVersion: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/scan': {
      post: {
        tags: ['scan'],
        summary: 'Scan Skill content',
        description: 'Perform security scan on SKILL.md content, returns score and issue list',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ScanRequest' },
              example: {
                content: '---\nname: my-skill\ndescription: A sample skill\n---\n\n# My Skill\n\nThis is the skill content.',
                format: 'json',
                layers: [0, 1, 2],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Scan result',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ScanResponse' },
              },
            },
          },
          400: {
            description: 'Invalid request parameters',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/scan/file': {
      post: {
        tags: ['scan'],
        summary: 'Scan local file',
        description: 'Scan local Skill file or directory',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ScanFileRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Scan result',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ScanResponse' },
              },
            },
          },
          404: {
            description: 'File not found',
          },
        },
      },
    },
    '/api/v1/scan/batch': {
      post: {
        tags: ['scan'],
        summary: 'Batch scan',
        description: 'Batch scan multiple Skills, max 50',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BatchScanRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Batch scan result',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BatchScanResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/validate': {
      post: {
        tags: ['validate'],
        summary: 'Validate Skill format',
        description: 'Validate if Skill complies with Anthropic Agent Skills specification',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Validation result',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidateResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/check-tools': {
      post: {
        tags: ['tools'],
        summary: 'Check tool risks',
        description: 'Analyze risk level of allowed-tools configuration',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CheckToolsRequest' },
              example: {
                tools: 'Bash(git:*) Read Write WebFetch',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Tool risk analysis result',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CheckToolsResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/explain': {
      post: {
        tags: ['rules'],
        summary: 'Explain rule',
        description: 'Get detailed explanation for a security rule',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ExplainRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Rule explanation',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ExplainResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/explain/{ruleId}': {
      get: {
        tags: ['rules'],
        summary: 'Explain rule (GET)',
        parameters: [
          {
            name: 'ruleId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'INJ001',
          },
        ],
        responses: {
          200: {
            description: 'Rule explanation',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ExplainResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/rules': {
      get: {
        tags: ['rules'],
        summary: 'Get rules list',
        description: 'Get all available security rules',
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['format', 'injection', 'secret', 'command', 'tool', 'path', 'url', 'script', 'behavior', 'compliance'],
            },
          },
          {
            name: 'severity',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['high', 'medium', 'low', 'info'],
            },
          },
        ],
        responses: {
          200: {
            description: 'Rules list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RulesListResponse' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ScanRequest: {
        type: 'object',
        required: ['content'],
        properties: {
          content: {
            type: 'string',
            description: 'Full content of SKILL.md',
          },
          format: {
            type: 'string',
            enum: ['brief', 'detailed', 'json'],
            default: 'json',
            description: 'Output format',
          },
          layers: {
            type: 'array',
            items: { type: 'integer', minimum: 0, maximum: 4 },
            description: 'Detection layers',
          },
          excludeRules: {
            type: 'array',
            items: { type: 'string' },
            description: 'Excluded rule IDs',
          },
        },
      },
      ScanFileRequest: {
        type: 'object',
        required: ['path'],
        properties: {
          path: { type: 'string', description: 'File or directory path' },
          format: { type: 'string', enum: ['brief', 'detailed', 'json'], default: 'json' },
          scanDirectories: { type: 'boolean', default: true },
        },
      },
      BatchScanRequest: {
        type: 'object',
        required: ['skills'],
        properties: {
          skills: {
            type: 'array',
            items: {
              type: 'object',
              required: ['content'],
              properties: {
                id: { type: 'string' },
                content: { type: 'string' },
              },
            },
            maxItems: 50,
          },
          format: { type: 'string', enum: ['brief', 'detailed', 'json'], default: 'json' },
          layers: { type: 'array', items: { type: 'integer' } },
        },
      },
      ValidateRequest: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string' },
        },
      },
      CheckToolsRequest: {
        type: 'object',
        required: ['tools'],
        properties: {
          tools: {
            oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
          },
        },
      },
      ExplainRequest: {
        type: 'object',
        required: ['ruleId'],
        properties: {
          ruleId: { type: 'string' },
        },
      },
      ScanResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              score: { type: 'number', minimum: 0, maximum: 100 },
              level: { type: 'string', enum: ['safe', 'low', 'medium', 'high'] },
              issues: { type: 'array', items: { $ref: '#/components/schemas/Issue' } },
              summary: { $ref: '#/components/schemas/IssueSummary' },
              formatCompliance: { $ref: '#/components/schemas/FormatCompliance' },
              metadata: { $ref: '#/components/schemas/ScanMetadata' },
              report: { type: 'string' },
            },
          },
          meta: { $ref: '#/components/schemas/ResponseMeta' },
        },
      },
      BatchScanResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              results: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    result: { $ref: '#/components/schemas/ScanResponse' },
                  },
                },
              },
              summary: {
                type: 'object',
                properties: {
                  total: { type: 'integer' },
                  safe: { type: 'integer' },
                  low: { type: 'integer' },
                  medium: { type: 'integer' },
                  high: { type: 'integer' },
                  avgScore: { type: 'number' },
                },
              },
            },
          },
        },
      },
      ValidateResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              errors: { type: 'array', items: { type: 'string' } },
              warnings: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      CheckToolsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              tools: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    tool: { type: 'string' },
                    risk: { type: 'string', enum: ['high', 'medium', 'low'] },
                    score: { type: 'number' },
                    description: { type: 'string' },
                  },
                },
              },
              totalScore: { type: 'number' },
              estimatedLevel: { type: 'string', enum: ['safe', 'low', 'medium', 'high'] },
              suggestions: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      ExplainResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              ruleId: { type: 'string' },
              explanation: { type: 'string' },
            },
          },
        },
      },
      RulesListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              rules: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    category: { type: 'string' },
                    severity: { type: 'string' },
                    enabled: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
              version: { type: 'string' },
              uptime: { type: 'integer' },
              timestamp: { type: 'integer' },
            },
          },
        },
      },
      Issue: {
        type: 'object',
        properties: {
          ruleId: { type: 'string' },
          ruleName: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low', 'info'] },
          category: { type: 'string' },
          message: { type: 'string' },
          suggestion: { type: 'string' },
          location: {
            type: 'object',
            properties: {
              file: { type: 'string' },
              line: { type: 'integer' },
              content: { type: 'string' },
            },
          },
        },
      },
      IssueSummary: {
        type: 'object',
        properties: {
          high: { type: 'integer' },
          medium: { type: 'integer' },
          low: { type: 'integer' },
          info: { type: 'integer' },
          total: { type: 'integer' },
        },
      },
      FormatCompliance: {
        type: 'object',
        properties: {
          valid: { type: 'boolean' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
      ScanMetadata: {
        type: 'object',
        properties: {
          scanTime: { type: 'integer' },
          engineVersion: { type: 'string' },
          rulesVersion: { type: 'string' },
          skillName: { type: 'string' },
        },
      },
      ResponseMeta: {
        type: 'object',
        properties: {
          requestId: { type: 'string' },
          timestamp: { type: 'integer' },
          duration: { type: 'integer' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' },
            },
          },
          meta: { $ref: '#/components/schemas/ResponseMeta' },
        },
      },
    },
    securitySchemes: {
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key authentication (optional)',
      },
    },
  },
};
