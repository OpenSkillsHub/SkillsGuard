/**
 * Skills Guard - Risk Scorer
 */

import { Issue, Severity, RiskLevel } from './types.js';

/**
 * Score deduction configuration
 */
const SCORE_DEDUCTIONS: Record<Severity, number> = {
  high: 30,
  medium: 15,
  low: 5,
  info: 0,
};

/**
 * Risk Scorer
 */
export class RiskScorer {
  /**
   * Calculate security score
   */
  calculate(issues: Issue[]): number {
    let score = 100;

    for (const issue of issues) {
      score -= SCORE_DEDUCTIONS[issue.severity];
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get risk level based on score
   */
  getLevel(score: number): RiskLevel {
    if (score >= 90) return 'safe';
    if (score >= 70) return 'low';
    if (score >= 40) return 'medium';
    return 'high';
  }

  /**
   * Get risk level display info
   */
  getLevelInfo(level: RiskLevel): { emoji: string; name: string; description: string } {
    const info = {
      safe: { emoji: '🟢', name: 'Safe', description: 'Safe to use' },
      low: { emoji: '🟡', name: 'Low Risk', description: 'Understand before using' },
      medium: { emoji: '🟠', name: 'Medium Risk', description: 'Evaluate carefully' },
      high: { emoji: '🔴', name: 'High Risk', description: 'Use with caution' },
    };
    return info[level];
  }
}
