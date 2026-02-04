/**
 * Skills Guard - Report Generator
 */

import { Issue, ScanResult, RiskLevel } from './types.js';

/**
 * Report Generator
 */
export class ReportGenerator {
  /**
   * Generate report
   */
  generate(result: ScanResult, format: 'json' | 'text' | 'markdown' = 'text'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(result, null, 2);
      case 'markdown':
        return this.formatMarkdown(result);
      case 'text':
      default:
        return this.formatText(result);
    }
  }

  private formatText(result: ScanResult): string {
    const levelInfo = this.getLevelInfo(result.level);

    let text = `${levelInfo.emoji} Security Score: ${result.score}/100 (${levelInfo.name})\n\n`;

    // Format compliance
    if (!result.formatCompliance.valid) {
      text += `⚠️ Format Non-compliant:\n`;
      for (const err of result.formatCompliance.errors) {
        text += `  • ${err}\n`;
      }
      text += '\n';
    } else {
      text += `📋 Format Compliance: ✅ Passed\n`;
      if (result.metadata.skillName) {
        text += `   name: ${result.metadata.skillName} ✓\n`;
      }
      text += '\n';
    }

    // Issue summary
    if (result.issues.length === 0) {
      text += '✅ No security issues detected\n';
    } else {
      text += `Detected ${result.summary.total} issues:\n`;
      if (result.summary.high > 0) text += `• 🔴 High: ${result.summary.high}\n`;
      if (result.summary.medium > 0) text += `• 🟠 Medium: ${result.summary.medium}\n`;
      if (result.summary.low > 0) text += `• 🟡 Low: ${result.summary.low}\n`;
      if (result.summary.info > 0) text += `• 💡 Info: ${result.summary.info}\n`;

      text += '\nMain issues:\n';
      for (const issue of result.issues.slice(0, 10)) {
        const emoji = this.getSeverityEmoji(issue.severity);
        text += `${emoji} [${issue.ruleId}] ${issue.message}\n`;
        if (issue.location?.line) {
          text += `   Location: Line ${issue.location.line}\n`;
        }
        if (issue.suggestion) {
          text += `   Suggestion: ${issue.suggestion}\n`;
        }
      }

      if (result.issues.length > 10) {
        text += `\n...and ${result.issues.length - 10} more issues\n`;
      }
    }

    // Scan info
    text += `\n⏱️ Scan time: ${result.metadata.scanTime}ms`;

    return text;
  }

  private formatMarkdown(result: ScanResult): string {
    const levelInfo = this.getLevelInfo(result.level);

    let md = `# 🛡️ Skills Guard Security Report\n\n`;

    // Summary table
    md += `## Summary\n\n`;
    md += `| Item | Result |\n|------|------|\n`;
    md += `| Security Score | ${levelInfo.emoji} **${result.score}/100** (${levelInfo.name}) |\n`;
    md += `| Format Compliance | ${result.formatCompliance.valid ? '✅ Passed' : '❌ Failed'} |\n`;
    md += `| Total Issues | ${result.summary.total} |\n`;
    md += `| Scan Time | ${result.metadata.scanTime}ms |\n\n`;

    // Skill info
    if (result.metadata.skillName) {
      md += `## Skill Info\n\n`;
      md += `- **Name**: ${result.metadata.skillName}\n\n`;
    }

    // Issue list
    if (result.issues.length > 0) {
      md += `## Detected Issues\n\n`;

      const grouped = this.groupIssues(result.issues);

      for (const [severity, issues] of Object.entries(grouped)) {
        if (issues.length === 0) continue;
        const severityLabel = {
          high: '🔴 High',
          medium: '🟠 Medium',
          low: '🟡 Low',
          info: '💡 Info',
        }[severity];

        md += `### ${severityLabel}\n\n`;
        for (const issue of issues) {
          md += `- **[${issue.ruleId}]** ${issue.message}\n`;
          if (issue.location?.line) {
            md += `  - Location: Line ${issue.location.line}\n`;
          }
          if (issue.suggestion) {
            md += `  - Suggestion: ${issue.suggestion}\n`;
          }
        }
        md += '\n';
      }
    } else {
      md += `## ✅ No Security Issues Detected\n\n`;
      md += `This Skill passed all security checks.\n\n`;
    }

    // Conclusion
    md += `## Conclusion\n\n`;
    md += `${levelInfo.description}\n`;

    return md;
  }

  private groupIssues(issues: Issue[]): Record<string, Issue[]> {
    return {
      high: issues.filter(i => i.severity === 'high'),
      medium: issues.filter(i => i.severity === 'medium'),
      low: issues.filter(i => i.severity === 'low'),
      info: issues.filter(i => i.severity === 'info'),
    };
  }

  private getLevelInfo(level: RiskLevel): { emoji: string; name: string; description: string } {
    const info = {
      safe: { emoji: '🟢', name: 'Safe', description: 'This Skill is safe to use.' },
      low: { emoji: '🟡', name: 'Low Risk', description: 'This Skill has some risks, understand before using.' },
      medium: { emoji: '🟠', name: 'Medium Risk', description: 'This Skill has significant risks, evaluate carefully.' },
      high: { emoji: '🔴', name: 'High Risk', description: 'This Skill has high risks, use with caution!' },
    };
    return info[level];
  }

  private getSeverityEmoji(severity: string): string {
    const emojis: Record<string, string> = {
      high: '🔴',
      medium: '🟠',
      low: '🟡',
      info: '💡',
    };
    return emojis[severity] || '❓';
  }
}
