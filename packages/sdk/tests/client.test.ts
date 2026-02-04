/**
 * Skills Guard SDK - Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SkillsGuardClient, SkillsGuardError } from '../src/index.js';

describe('SkillsGuardClient', () => {
  const mockFetch = vi.fn();
  
  beforeEach(() => {
    mockFetch.mockReset();
  });

  const createClient = (config = {}) => {
    return new SkillsGuardClient({
      baseUrl: 'http://localhost:3000',
      fetch: mockFetch as any,
      ...config,
    });
  };

  describe('scan', () => {
    it('should send scan request', async () => {
      const mockResult = {
        success: true,
        data: {
          score: 85,
          level: 'low',
          issues: [],
          summary: { high: 0, medium: 0, low: 0, info: 0, total: 0 },
          formatCompliance: { valid: true, errors: [] },
          metadata: { scanTime: 10, engineVersion: '0.1.0', rulesVersion: '1.0.0' },
        },
      };
      
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResult),
      });
      
      const client = createClient();
      const result = await client.scan('---\nname: test\n---');
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.score).toBe(85);
      expect(result.level).toBe('low');
    });

    it('should handle errors', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: false,
          error: { code: 'SCAN_ERROR', message: 'Failed to scan' },
        }),
      });
      
      const client = createClient();
      
      await expect(client.scan('invalid')).rejects.toThrow(SkillsGuardError);
    });

    it('should pass options', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: {
            score: 100,
            level: 'safe',
            issues: [],
            summary: { high: 0, medium: 0, low: 0, info: 0, total: 0 },
            formatCompliance: { valid: true, errors: [] },
            metadata: {},
          },
        }),
      });
      
      const client = createClient();
      await client.scan('content', { layers: [0, 1], excludeRules: ['INJ001'] });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/scan',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"layers":[0,1]'),
        })
      );
    });
  });

  describe('validate', () => {
    it('should validate skill', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: { valid: true, errors: [], warnings: [] },
        }),
      });
      
      const client = createClient();
      const result = await client.validate('---\nname: test\ndescription: Test\n---');
      
      expect(result.valid).toBe(true);
    });
  });

  describe('checkTools', () => {
    it('should check tool risks', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: {
            tools: [
              { tool: 'Bash(git:*)', risk: 'medium', score: 15, description: 'Git commands' },
            ],
            totalScore: 15,
            estimatedLevel: 'low',
            suggestions: [],
          },
        }),
      });
      
      const client = createClient();
      const result = await client.checkTools('Bash(git:*)');
      
      expect(result.tools).toHaveLength(1);
      expect(result.totalScore).toBe(15);
    });
  });

  describe('quickCheck', () => {
    it('should return simple result', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: {
            score: 95,
            level: 'safe',
            issues: [],
            summary: { high: 0, medium: 0, low: 0, info: 0, total: 0 },
            formatCompliance: { valid: true, errors: [] },
            metadata: {},
          },
        }),
      });
      
      const client = createClient();
      const result = await client.quickCheck('---\nname: test\n---');
      
      expect(result.safe).toBe(true);
      expect(result.score).toBe(95);
      expect(result.issueCount).toBe(0);
    });
  });

  describe('isSafe', () => {
    it('should return true for safe skills', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: { score: 95, level: 'safe', issues: [], summary: {}, formatCompliance: {}, metadata: {} },
        }),
      });
      
      const client = createClient();
      const result = await client.isSafe('---\nname: test\n---');
      
      expect(result).toBe(true);
    });
  });

  describe('health', () => {
    it('should check server health', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          success: true,
          data: { status: 'healthy', version: '0.1.0', uptime: 1000 },
        }),
      });
      
      const client = createClient();
      const result = await client.health();
      
      expect(result.status).toBe('healthy');
    });
  });

  describe('configuration', () => {
    it('should use API key', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: {} }),
      });
      
      const client = createClient({ apiKey: 'test-key' });
      await client.health();
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'test-key',
          }),
        })
      );
    });

    it('should retry on failure', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ success: true, data: {} }),
        });
      
      const client = createClient({ retries: 1 });
      await client.health();
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
