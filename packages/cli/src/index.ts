#!/usr/bin/env node
/**
 * Skills Guard CLI
 * Security scanning command-line tool for Agent Skills
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SkillsGuardScanner } from '@skills-guard/core';

const scanner = new SkillsGuardScanner();
const program = new Command();

// Output formatting utilities
const symbols = {
  check: chalk.green('✓'),
  cross: chalk.red('✗'),
  warning: chalk.yellow('⚠'),
  info: chalk.blue('ℹ'),
  bullet: chalk.gray('•'),
  arrow: chalk.cyan('→'),
};

function formatSeverity(severity: string): string {
  switch (severity) {
    case 'high': return chalk.red.bold('🔴 High');
    case 'medium': return chalk.yellow.bold('🟠 Medium');
    case 'low': return chalk.blue('🟡 Low');
    default: return chalk.gray('ℹ️ Info');
  }
}

function formatCategory(category: string): string {
  const categoryNames: Record<string, string> = {
    format: 'Format',
    injection: 'Injection',
    secret: 'Secret',
    command: 'Command',
    compliance: 'Compliance',
    tool: 'Tool Risk',
    path: 'Path',
    url: 'URL',
    script: 'Script',
    behavior: 'Behavior',
  };
  return categoryNames[category] || category;
}

function formatScore(score: number): string {
  if (score >= 90) return chalk.green.bold(`${score}`);
  if (score >= 70) return chalk.yellow.bold(`${score}`);
  if (score >= 40) return chalk.rgb(255, 165, 0).bold(`${score}`);
  return chalk.red.bold(`${score}`);
}

function formatLevel(level: string): string {
  switch (level) {
    case 'safe': return chalk.green.bold('🟢 Safe');
    case 'low': return chalk.yellow.bold('🟡 Low Risk');
    case 'medium': return chalk.rgb(255, 165, 0).bold('🟠 Medium Risk');
    case 'high': return chalk.red.bold('🔴 High Risk');
    default: return level;
  }
}

function printBox(title: string, content: string): void {
  const width = 60;
  const line = '─'.repeat(width);
  console.log(chalk.cyan(`┌${line}┐`));
  console.log(chalk.cyan(`│ ${chalk.bold(title.padEnd(width - 2))} │`));
  console.log(chalk.cyan(`├${line}┤`));
  content.split('\n').forEach(l => {
    console.log(chalk.cyan(`│ ${l.padEnd(width - 2)} │`));
  });
  console.log(chalk.cyan(`└${line}┘`));
}

function printHeader(): void {
  console.log(chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════════╗
║     🛡️  Skills Guard - Agent Skills Security Scanner     ║
╚═══════════════════════════════════════════════════════════╝
`));
}

program
  .name('sg')
  .description('Skills Guard - Agent Skills Security Scanner')
  .version(scanner.version);

/**
 * scan command - Scan Skill
 */
program
  .command('scan <target>')
  .description('Scan Skill directory or SKILL.md file')
  .option('-f, --format <format>', 'Output format (json|text|markdown)', 'text')
  .option('-o, --output <file>', 'Output to file')
  .option('--min-score <score>', 'Minimum passing score', '0')
  .option('--exclude <rules>', 'Excluded rule IDs, comma-separated')
  .option('--layers <layers>', 'Detection layers, comma-separated (0,1,2,3,4)')
  .option('--no-scripts', 'Do not scan scripts/ directory')
  .option('-q, --quiet', 'Quiet output')
  .action(async (target, options) => {
    try {
      // Check if file exists
      const targetPath = path.resolve(target);
      await fs.access(targetPath);

      if (!options.quiet) {
        printHeader();
        console.log(chalk.cyan(`🔍 Scan target: ${chalk.white(targetPath)}`));
        console.log(chalk.gray(`━`.repeat(60)));
      }

      // Parse options
      const scanOptions: {
        excludeRules?: string[];
        layers?: (0 | 1 | 2 | 3 | 4)[];
        scanDirectories?: boolean;
      } = {};

      if (options.exclude) {
        scanOptions.excludeRules = options.exclude.split(',');
      }

      if (options.layers) {
        scanOptions.layers = options.layers.split(',').map(Number) as (0 | 1 | 2 | 3 | 4)[];
      }

      if (options.noScripts) {
        scanOptions.scanDirectories = false;
      }

      // Execute scan
      const startTime = Date.now();
      const result = await scanner.scanFile(targetPath, scanOptions);
      const elapsed = Date.now() - startTime;

      // If JSON format, output directly
      if (options.format === 'json') {
        const report = scanner.generateReport(result, 'json');
        if (options.output) {
          await fs.writeFile(options.output, report);
          console.log(chalk.green(`✅ Report saved to: ${options.output}`));
        } else {
          console.log(report);
        }
      } else if (!options.quiet) {
        // Formatted output
        console.log();
        
        // Overview card
        console.log(chalk.bold('📊 Scan Results Overview'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(`   Security Score: ${formatScore(result.score)}/100    ${formatLevel(result.level)}`);
        console.log(`   Scan Time: ${chalk.gray(`${elapsed}ms`)}`);
        if (result.metadata.skillName) {
          console.log(`   Skill Name: ${chalk.cyan(result.metadata.skillName)}`);
        }
        console.log();

        // Issue statistics
        console.log(chalk.bold('📋 Issue Statistics'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(`   ${chalk.red.bold(`🔴 High: ${result.summary.high}`)}   ${chalk.yellow.bold(`🟠 Medium: ${result.summary.medium}`)}   ${chalk.blue(`🟡 Low: ${result.summary.low}`)}   ${chalk.gray(`ℹ️ Info: ${result.summary.info}`)}`);
        console.log(`   ${chalk.gray(`Total ${result.summary.total} issues`)}`);
        console.log();

        // Detailed issue list
        if (result.issues.length > 0) {
          console.log(chalk.bold('🔍 Detected Issues'));
          console.log(chalk.gray('─'.repeat(60)));
          
          // Sort by severity
          const sortedIssues = [...result.issues].sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2, info: 3 };
            return (order[a.severity] || 3) - (order[b.severity] || 3);
          });

          for (const issue of sortedIssues) {
            console.log();
            console.log(`   ${formatSeverity(issue.severity)}  ${chalk.bold(issue.ruleId)}`);
            console.log(`   ${chalk.gray('Category:')} ${formatCategory(issue.category)}`);
            console.log(`   ${chalk.gray('Description:')} ${issue.message}`);
            if (issue.location?.line) {
              console.log(`   ${chalk.gray('Location:')} Line ${issue.location.line}`);
            }
            if (issue.location?.content) {
              console.log(`   ${chalk.gray('Content:')} ${chalk.dim(issue.location.content)}`);
            }
            if (issue.suggestion) {
              console.log(`   ${chalk.gray('Suggestion:')} ${chalk.green(issue.suggestion)}`);
            }
          }
          console.log();
        } else {
          console.log(chalk.green('   ✨ No security issues detected'));
          console.log();
        }

        // Format compliance
        console.log(chalk.bold('📝 Format Compliance'));
        console.log(chalk.gray('─'.repeat(60)));
        if (result.formatCompliance.valid) {
          console.log(chalk.green(`   ${symbols.check} Skill format is compliant`));
        } else {
          console.log(chalk.red(`   ${symbols.cross} Skill format is non-compliant`));
          for (const err of result.formatCompliance.errors) {
            console.log(chalk.red(`     ${symbols.bullet} ${err}`));
          }
        }
        console.log();

        // Save to file
        if (options.output) {
          const report = scanner.generateReport(result, options.format);
          await fs.writeFile(options.output, report);
          console.log(chalk.green(`✅ Report saved to: ${options.output}`));
        }
      } else {
        // Quiet output
        const emoji = result.level === 'safe' ? '✅' : result.level === 'low' ? '⚠️' : result.level === 'medium' ? '🟠' : '❌';
        console.log(`${emoji} Score: ${result.score}/100 | Issues: ${result.summary.total} (H:${result.summary.high} M:${result.summary.medium} L:${result.summary.low})`);
      }

      // Check minimum score
      const minScore = parseInt(options.minScore);
      if (result.score < minScore) {
        console.log(chalk.red(`\n❌ Score ${result.score} is below minimum required ${minScore}`));
        process.exit(1);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.error(chalk.red(`❌ File not found: ${target}`));
      } else {
        console.error(chalk.red(`❌ Scan failed: ${(error as Error).message}`));
      }
      process.exit(1);
    }
  });

/**
 * validate command - Format validation
 */
program
  .command('validate <target>')
  .description('Validate Skill format compliance (Layer 0 only)')
  .action(async (target) => {
    try {
      const targetPath = path.resolve(target);
      await fs.access(targetPath);

      console.log(chalk.cyan(`\n📋 Validating: ${targetPath}\n`));

      const result = await scanner.scanFile(targetPath, { layers: [0] });

      if (result.formatCompliance.valid) {
        console.log(chalk.green('✅ Skill format is compliant\n'));
        
        if (result.metadata.skillName) {
          console.log(`   name: ${chalk.cyan(result.metadata.skillName)} ✓`);
        }
        
        if (result.issues.length > 0) {
          console.log(chalk.yellow('\n⚠️ Some issues recommended to fix:'));
          for (const issue of result.issues) {
            console.log(chalk.yellow(`   • ${issue.message}`));
          }
        }
      } else {
        console.log(chalk.red('❌ Skill format is non-compliant:\n'));
        for (const err of result.formatCompliance.errors) {
          console.log(chalk.red(`   • ${err}`));
        }
        process.exit(1);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.error(chalk.red(`❌ File not found: ${target}`));
      } else {
        console.error(chalk.red(`❌ Validation failed: ${(error as Error).message}`));
      }
      process.exit(1);
    }
  });

/**
 * check-tools command - Tool risk check
 */
program
  .command('check-tools <tools...>')
  .description('Check allowed-tools configuration risk level')
  .action((tools) => {
    printHeader();
    console.log(chalk.bold('🔧 Tool Risk Analysis\n'));

    const toolsString = tools.join(' ');
    console.log(`${chalk.gray('Configured tools:')} ${chalk.white(toolsString)}\n`);
    console.log(chalk.gray('─'.repeat(60)));

    const results = scanner.checkTools(toolsString);
    let totalScore = 0;

    for (const { tool, risk, score, description } of results) {
      const emoji = risk === 'high' ? '🔴' : risk === 'medium' ? '🟠' : '🟢';
      const riskName = risk === 'high' ? chalk.red('High') : risk === 'medium' ? chalk.yellow('Medium') : chalk.green('Low');
      const scoreText = score > 0 ? chalk.red(`-${score} points`) : chalk.green('No deduction');
      
      console.log();
      console.log(`${emoji} ${chalk.bold(tool)}`);
      console.log(`   ${chalk.gray('Risk level:')} ${riskName}`);
      console.log(`   ${chalk.gray('Description:')} ${description}`);
      console.log(`   ${chalk.gray('Deduction:')} ${scoreText}`);
      
      totalScore += score;
    }

    console.log();
    console.log(chalk.gray('─'.repeat(60)));
    console.log();
    console.log(`${chalk.bold('📊 Risk Assessment')}`);
    console.log(`   ${chalk.gray('Total deduction:')} ${chalk.red.bold(`-${totalScore} points`)}`);
    console.log(`   ${chalk.gray('Estimated score:')} ${formatScore(100 - totalScore)}/100`);
    console.log();

    if (totalScore >= 30) {
      console.log(chalk.red.bold('⚠️  Risk Level: High'));
      console.log(chalk.red('   Recommend precisely limiting tool permissions, avoid wildcards'));
    } else if (totalScore >= 15) {
      console.log(chalk.yellow.bold('⚠️  Risk Level: Medium'));
      console.log(chalk.yellow('   Recommend explaining tool usage in description'));
    } else {
      console.log(chalk.green.bold('✅ Risk Level: Low'));
      console.log(chalk.green('   Tool configuration risk is acceptable'));
    }
    console.log();
  });

/**
 * explain command - Explain rule
 */
program
  .command('explain <ruleId>')
  .description('Explain security rule details')
  .action((ruleId) => {
    const explanation = scanner.explainRule(ruleId.toUpperCase());
    console.log('\n' + explanation + '\n');
  });

/**
 * rules command - List all rules
 */
program
  .command('rules')
  .description('List all detection rules')
  .option('-c, --category <category>', 'Filter by category')
  .option('-s, --severity <severity>', 'Filter by severity (high|medium|low)')
  .option('--json', 'JSON format output')
  .action((options) => {
    // Get rules engine instance
    const rulesEngine = new (scanner as any).rulesEngine.constructor();
    const rules = rulesEngine.listRules();
    const stats = rulesEngine.getRuleStats();

    if (options.json) {
      console.log(JSON.stringify({ rules, stats }, null, 2));
      return;
    }

    printHeader();
    console.log(chalk.bold('📚 Detection Rule Library\n'));

    // Statistics
    console.log(chalk.bold('📊 Rule Statistics'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(`   Total rules: ${chalk.cyan.bold(stats.total)}`);
    console.log();
    console.log('   By category:');
    Object.entries(stats.byCategory).forEach(([cat, count]) => {
      console.log(`     ${formatCategory(cat).padEnd(12)} ${chalk.cyan(count)}`);
    });
    console.log();
    console.log('   By severity:');
    Object.entries(stats.bySeverity).forEach(([sev, count]) => {
      const icon = sev === 'high' ? '🔴' : sev === 'medium' ? '🟠' : '🟡';
      console.log(`     ${icon} ${sev.padEnd(8)} ${chalk.cyan(count)}`);
    });
    console.log();

    // Filter rules
    let filteredRules = rules;
    if (options.category) {
      filteredRules = filteredRules.filter((r: any) => r.category === options.category);
    }
    if (options.severity) {
      filteredRules = filteredRules.filter((r: any) => r.severity === options.severity);
    }

    // Rule list
    console.log(chalk.bold('📋 Rule List'));
    console.log(chalk.gray('─'.repeat(60)));
    
    // Group by category
    const grouped: Record<string, typeof filteredRules> = {};
    for (const rule of filteredRules) {
      if (!grouped[rule.category]) {
        grouped[rule.category] = [];
      }
      grouped[rule.category].push(rule);
    }

    for (const [category, categoryRules] of Object.entries(grouped)) {
      console.log();
      console.log(chalk.bold(`  ${formatCategory(category)} (${categoryRules.length})`));
      for (const rule of categoryRules) {
        const icon = rule.severity === 'high' ? '🔴' : rule.severity === 'medium' ? '🟠' : '🟡';
        const status = rule.enabled ? '' : chalk.gray(' [disabled]');
        console.log(`    ${icon} ${chalk.cyan(rule.id.padEnd(10))} ${rule.name}${status}`);
      }
    }
    console.log();
    console.log(chalk.gray(`Tip: Use ${chalk.cyan('sg explain <ruleID>')} to view rule details`));
    console.log();
  });

/**
 * Quick scan content
 */
program
  .command('quick')
  .description('Quick scan (read content from stdin)')
  .option('-f, --format <format>', 'Output format (json|text|markdown)', 'text')
  .action(async (options) => {
    let content = '';
    
    process.stdin.setEncoding('utf8');
    
    for await (const chunk of process.stdin) {
      content += chunk;
    }

    if (!content.trim()) {
      console.error(chalk.red('❌ No input content received'));
      process.exit(1);
    }

    const result = await scanner.scan(content);
    const report = scanner.generateReport(result, options.format);
    console.log(report);
  });

// Parse command line arguments
program.parse();
