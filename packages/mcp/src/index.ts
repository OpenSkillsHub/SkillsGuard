#!/usr/bin/env node
/**
 * Skills Guard MCP Server
 * Provides Agent Skills security detection capabilities to AI applications
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { SkillsGuardScanner } from '@skills-guard/core';

const scanner = new SkillsGuardScanner();

/**
 * Create MCP Server
 */
const server = new Server(
  {
    name: 'skills-guard',
    version: scanner.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Register tool list
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'scan_skill',
      description: 'Scan Agent Skill for security risks (based on Anthropic specification). Analyzes Frontmatter, Body, allowed-tools, etc., returns security score and issue details.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          content: {
            type: 'string',
            description: 'Full content of SKILL.md (Markdown format, including frontmatter)',
          },
          format: {
            type: 'string',
            enum: ['brief', 'detailed', 'json'],
            description: 'Output format: brief summary / detailed report / json raw data',
            default: 'brief',
          },
          layers: {
            type: 'array',
            items: { type: 'integer', enum: [0, 1, 2, 3, 4] },
            description: 'Detection layers: 0-Format compliance 1-Prompt security 2-Tools risk 3-Resource security 4-Behavior analysis (all by default)',
          },
        },
        required: ['content'],
      },
    },
    {
      name: 'scan_file',
      description: 'Scan local Skill directory or SKILL.md file',
      inputSchema: {
        type: 'object' as const,
        properties: {
          path: {
            type: 'string',
            description: 'Skill directory path or SKILL.md file path',
          },
          format: {
            type: 'string',
            enum: ['brief', 'detailed', 'json'],
            default: 'brief',
          },
        },
        required: ['path'],
      },
    },
    {
      name: 'validate_skill',
      description: 'Validate if Skill complies with Anthropic Agent Skills specification (frontmatter format, name rules, description requirements, etc.)',
      inputSchema: {
        type: 'object' as const,
        properties: {
          content: {
            type: 'string',
            description: 'Full content of SKILL.md',
          },
        },
        required: ['content'],
      },
    },
    {
      name: 'check_tools',
      description: 'Analyze risk level of allowed-tools configuration, evaluate potential risks of tool combinations',
      inputSchema: {
        type: 'object' as const,
        properties: {
          tools: {
            type: 'string',
            description: 'Tool list (space-separated), e.g., "Bash(git:*) Read Write"',
          },
        },
        required: ['tools'],
      },
    },
    {
      name: 'explain_issue',
      description: 'Explain detailed information about a security rule or issue',
      inputSchema: {
        type: 'object' as const,
        properties: {
          rule_id: {
            type: 'string',
            description: 'Rule ID, e.g., INJ001, SEC001, FMT003',
          },
        },
        required: ['rule_id'],
      },
    },
  ],
}));

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'scan_skill': {
        const content = args?.content as string;
        if (!content) {
          throw new McpError(ErrorCode.InvalidParams, 'Missing content parameter');
        }
        
        const format = (args?.format as string) || 'brief';
        const layers = args?.layers as (0 | 1 | 2 | 3 | 4)[] | undefined;
        
        const result = await scanner.scan(content, { layers });
        
        if (format === 'json') {
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        
        const reportFormat = format === 'detailed' ? 'markdown' : 'text';
        const report = scanner.generateReport(result, reportFormat);
        
        return {
          content: [{ type: 'text', text: report }],
        };
      }

      case 'scan_file': {
        const filePath = args?.path as string;
        if (!filePath) {
          throw new McpError(ErrorCode.InvalidParams, 'Missing path parameter');
        }
        
        const format = (args?.format as string) || 'brief';
        
        const result = await scanner.scanFile(filePath);
        
        if (format === 'json') {
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        
        const reportFormat = format === 'detailed' ? 'markdown' : 'text';
        const report = scanner.generateReport(result, reportFormat);
        
        return {
          content: [{ type: 'text', text: report }],
        };
      }

      case 'validate_skill': {
        const content = args?.content as string;
        if (!content) {
          throw new McpError(ErrorCode.InvalidParams, 'Missing content parameter');
        }
        
        const result = await scanner.validate(content);
        
        let text = '📋 Format Validation Result\n\n';
        
        if (result.formatCompliance.valid) {
          text += '✅ Format Compliant\n';
          if (result.metadata.skillName) {
            text += `   name: ${result.metadata.skillName} ✓\n`;
          }
        } else {
          text += '❌ Format Non-compliant\n\n';
          for (const err of result.formatCompliance.errors) {
            text += `• ${err}\n`;
          }
        }
        
        if (result.issues.filter(i => i.severity === 'low').length > 0) {
          text += '\n⚠️ Suggested Fixes:\n';
          for (const issue of result.issues.filter(i => i.severity === 'low')) {
            text += `• ${issue.message}\n`;
          }
        }
        
        return {
          content: [{ type: 'text', text }],
        };
      }

      case 'check_tools': {
        const tools = args?.tools as string;
        if (!tools) {
          throw new McpError(ErrorCode.InvalidParams, 'Missing tools parameter');
        }
        
        const results = scanner.checkTools(tools);
        
        let text = '🔧 Tool Risk Analysis\n\n';
        text += `Configured tools: ${tools}\n\n`;
        text += '━━━ Individual Tool Assessment ━━━\n';
        
        let totalScore = 0;
        for (const { tool, risk, score, description } of results) {
          const emoji = risk === 'high' ? '🔴' : risk === 'medium' ? '🟠' : '🟢';
          const riskName = risk === 'high' ? 'High' : risk === 'medium' ? 'Medium' : 'Low';
          text += `\n• ${tool}  ${emoji} ${riskName} (-${score} points)\n`;
          text += `  Description: ${description}\n`;
          totalScore += score;
        }
        
        text += '\n━━━ Summary ━━━\n\n';
        text += `Total deduction: -${totalScore} points\n`;
        text += `Estimated score impact: From 100 to approximately ${100 - totalScore}\n`;
        
        if (totalScore >= 30) {
          text += '\n⚠️ High risk tool combination, recommend restricting permissions precisely';
        } else if (totalScore >= 15) {
          text += '\n💡 Some risk present, recommend explaining reasons in description';
        } else {
          text += '\n✅ Tool configuration risk is acceptable';
        }
        
        return {
          content: [{ type: 'text', text }],
        };
      }

      case 'explain_issue': {
        const ruleId = args?.rule_id as string;
        if (!ruleId) {
          throw new McpError(ErrorCode.InvalidParams, 'Missing rule_id parameter');
        }
        
        const explanation = scanner.explainRule(ruleId.toUpperCase());
        
        return {
          content: [{ type: 'text', text: explanation }],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    return {
      content: [{ type: 'text', text: `❌ Error: ${(error as Error).message}` }],
      isError: true,
    };
  }
});

/**
 * Start server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Skills Guard MCP Server started');
}

main().catch(console.error);
