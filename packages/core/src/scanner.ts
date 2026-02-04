/**
 * Skills Guard - Core Scanner
 * Core Scanner: Unified entry point for all adapters
 */

import { Skill, Issue, ScanResult, ScanOptions, ToolCheckResult, ScriptFile, ReferenceFile } from './types.js';
import { parseSkill, parseSkillContent } from './parser.js';
import { RulesEngine } from './rules/index.js';
import { RiskScorer } from './scorer.js';
import { ReportGenerator } from './reporter.js';

/**
 * Skills Guard Core Scanner
 */
export class SkillsGuardScanner {
  private rulesEngine: RulesEngine;
  private scorer: RiskScorer;
  private reporter: ReportGenerator;
  public readonly version = '0.1.0';

  constructor() {
    this.rulesEngine = new RulesEngine();
    this.scorer = new RiskScorer();
    this.reporter = new ReportGenerator();
  }

  /**
   * Scan Skill content (string)
   */
  async scan(content: string, options?: ScanOptions): Promise<ScanResult> {
    const startTime = Date.now();

    // 1. Parse Skill content
    const skill = parseSkillContent(content);

    // 2. Execute rule detection
    let issues = this.rulesEngine.check(skill, {
      excludeRules: options?.excludeRules,
    });

    // 3. If scripts directory exists, scan script files
    if (skill.directories?.scripts && options?.scanDirectories !== false) {
      const scriptIssues = this.scanScripts(skill.directories.scripts);
      issues.push(...scriptIssues);
    }

    // 4. If references directory exists, scan reference files
    if (skill.directories?.references && options?.scanDirectories !== false) {
      const refIssues = this.scanReferences(skill.directories.references);
      issues.push(...refIssues);
    }

    // 5. Filter by layers
    const filteredIssues = this.filterIssuesByLayers(issues, options?.layers);

    // 6. Calculate risk score
    const score = this.scorer.calculate(filteredIssues);
    const level = this.scorer.getLevel(score);

    // 7. Generate result
    return {
      score,
      level,
      issues: filteredIssues,
      summary: this.summarizeIssues(filteredIssues),
      formatCompliance: this.checkFormatCompliance(filteredIssues),
      metadata: {
        scanTime: Date.now() - startTime,
        engineVersion: this.version,
        rulesVersion: this.rulesEngine.version,
        skillName: skill.frontmatter.name || undefined,
      },
    };
  }

  /**
   * Scan local Skill file or directory
   */
  async scanFile(path: string, options?: ScanOptions): Promise<ScanResult> {
    const skill = await parseSkill(path);
    return this.scan(skill.raw, options);
  }

  /**
   * Batch scan multiple Skills
   */
  async scanBatch(paths: string[]): Promise<ScanResult[]> {
    return Promise.all(paths.map(path => this.scanFile(path)));
  }

  /**
   * Validate format compliance only (Layer 0)
   */
  async validate(content: string): Promise<ScanResult> {
    return this.scan(content, { layers: [0] });
  }

  /**
   * Check tool configuration risks
   */
  checkTools(tools: string | string[]): ToolCheckResult[] {
    const toolList = typeof tools === 'string' ? this.parseToolsString(tools) : tools;
    return this.rulesEngine.analyzeTools(toolList);
  }

  /**
   * Generate report
   */
  generateReport(result: ScanResult, format: 'json' | 'text' | 'markdown' = 'text'): string {
    return this.reporter.generate(result, format);
  }

  /**
   * Explain rule
   */
  explainRule(ruleId: string): string {
    return this.rulesEngine.explain(ruleId);
  }

  /**
   * Parse tools string
   */
  private parseToolsString(tools: string): string[] {
    const result: string[] = [];
    const regex = /(\w+(?:\([^)]*\))?)/g;
    let match;
    while ((match = regex.exec(tools)) !== null) {
      result.push(match[1]);
    }
    return result;
  }

  /**
   * Filter issues by layers
   */
  private filterIssuesByLayers(issues: Issue[], layers?: (0 | 1 | 2 | 3 | 4)[]): Issue[] {
    if (!layers || layers.length === 0) return issues;

    const layerCategories: Record<number, string[]> = {
      0: ['format'],
      1: ['injection', 'secret', 'command', 'compliance'],
      2: ['tool'],
      3: ['path', 'url', 'script'],
      4: ['behavior'],
    };

    const allowedCategories = new Set<string>();
    for (const layer of layers) {
      for (const cat of layerCategories[layer] || []) {
        allowedCategories.add(cat);
      }
    }

    return issues.filter(issue => allowedCategories.has(issue.category));
  }

  /**
   * Summarize issues
   */
  private summarizeIssues(issues: Issue[]) {
    return {
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length,
      info: issues.filter(i => i.severity === 'info').length,
      total: issues.length,
    };
  }

  /**
   * Check format compliance
   */
  private checkFormatCompliance(issues: Issue[]) {
    const formatIssues = issues.filter(i => i.category === 'format');
    return {
      valid: formatIssues.filter(i => i.severity === 'high').length === 0,
      errors: formatIssues.map(i => i.message),
    };
  }

  /**
   * Scan script files in scripts/ directory
   */
  private scanScripts(scripts: ScriptFile[]): Issue[] {
    const issues: Issue[] = [];
    
    // Script security rules
    const scriptRules = [
      // Python rules
      { id: 'SCR-PY001', pattern: /subprocess\.(run|call|Popen)\s*\(/g, message: 'Subprocess call', severity: 'high' as const },
      { id: 'SCR-PY002', pattern: /os\.system\s*\(/g, message: 'System command execution', severity: 'high' as const },
      { id: 'SCR-PY003', pattern: /eval\s*\(/g, message: 'Dynamic code execution', severity: 'high' as const },
      { id: 'SCR-PY004', pattern: /exec\s*\(/g, message: 'Dynamic code execution', severity: 'high' as const },
      { id: 'SCR-PY005', pattern: /open\s*\(\s*['"]\/etc\//g, message: 'Sensitive file access', severity: 'high' as const },
      { id: 'SCR-PY006', pattern: /os\.environ\[/g, message: 'Environment variable access', severity: 'medium' as const },
      { id: 'SCR-PY007', pattern: /requests\.(get|post)\s*\(/g, message: 'Network request', severity: 'medium' as const },
      { id: 'SCR-PY008', pattern: /urllib\.request\.urlopen/g, message: 'Network request', severity: 'medium' as const },
      { id: 'SCR-PY009', pattern: /base64\.b64decode/g, message: 'Base64 decoding', severity: 'medium' as const },
      { id: 'SCR-PY010', pattern: /pickle\.loads/g, message: 'Unsafe deserialization', severity: 'high' as const },
      
      // Bash rules
      { id: 'SCR-SH001', pattern: /curl.*\|\s*(ba)?sh/g, message: 'Remote script execution', severity: 'high' as const },
      { id: 'SCR-SH002', pattern: /wget.*&&.*bash/g, message: 'Remote script execution', severity: 'high' as const },
      { id: 'SCR-SH003', pattern: /rm\s+-rf\s+[\/~]/g, message: 'Dangerous delete command', severity: 'high' as const },
      { id: 'SCR-SH004', pattern: /chmod\s+777/g, message: 'Dangerous permission setting', severity: 'medium' as const },
      { id: 'SCR-SH005', pattern: /\bsudo\b/g, message: 'Privilege escalation', severity: 'medium' as const },
      { id: 'SCR-SH006', pattern: /\beval\b/g, message: 'Dynamic execution', severity: 'high' as const },
      { id: 'SCR-SH007', pattern: /\$\([^)]*\)/g, message: 'Command substitution', severity: 'low' as const },
      { id: 'SCR-SH008', pattern: />\s*\/dev\/tcp\//g, message: 'Network communication', severity: 'high' as const },
      
      // JavaScript rules
      { id: 'SCR-JS001', pattern: /eval\s*\(/g, message: 'Dynamic code execution', severity: 'high' as const },
      { id: 'SCR-JS002', pattern: /new\s+Function\s*\(/g, message: 'Dynamic function creation', severity: 'high' as const },
      { id: 'SCR-JS003', pattern: /child_process\.(exec|spawn)/g, message: 'Subprocess call', severity: 'high' as const },
      { id: 'SCR-JS004', pattern: /process\.env\./g, message: 'Environment variable access', severity: 'medium' as const },
      { id: 'SCR-JS005', pattern: /fs\.readFileSync\s*\(\s*['"]\/etc\//g, message: 'Sensitive file access', severity: 'high' as const },
      { id: 'SCR-JS006', pattern: /fetch\s*\(/g, message: 'Network request', severity: 'medium' as const },
      { id: 'SCR-JS007', pattern: /axios\.(get|post)\s*\(/g, message: 'Network request', severity: 'medium' as const },
      { id: 'SCR-JS008', pattern: /Buffer\.from\s*\([^,]+,\s*['"]base64['"]/g, message: 'Base64 decoding', severity: 'medium' as const },
    ];

    for (const script of scripts) {
      for (const rule of scriptRules) {
        const match = rule.pattern.exec(script.content);
        if (match) {
          // Find line number
          const lines = script.content.split('\n');
          let lineNum = 1;
          let charCount = 0;
          for (let i = 0; i < lines.length; i++) {
            if (charCount + lines[i].length >= match.index) {
              lineNum = i + 1;
              break;
            }
            charCount += lines[i].length + 1;
          }

          issues.push({
            ruleId: rule.id,
            ruleName: `script_${rule.id.toLowerCase()}`,
            severity: rule.severity,
            category: 'script',
            message: `Script ${script.path}: ${rule.message}`,
            suggestion: 'Review if this operation in the script is necessary and secure',
            location: {
              file: script.path,
              line: lineNum,
              content: match[0].substring(0, 50),
            },
          });
        }
        // Reset regex state
        rule.pattern.lastIndex = 0;
      }
    }

    return issues;
  }

  /**
   * Scan reference files in references/ directory
   */
  private scanReferences(references: ReferenceFile[]): Issue[] {
    const issues: Issue[] = [];

    // Reference file security rules (detect sensitive content)
    const refRules = [
      { id: 'REF001', pattern: /sk-[a-zA-Z0-9]{20,}/g, message: 'API Key', severity: 'high' as const },
      { id: 'REF002', pattern: /-----BEGIN.*PRIVATE KEY-----/g, message: 'Private Key', severity: 'high' as const },
      { id: 'REF003', pattern: /password\s*[=:]\s*['"][^'"]{6,}['"]/gi, message: 'Hardcoded password', severity: 'medium' as const },
      { id: 'REF004', pattern: /https?:\/\/[^/]*\.onion/g, message: 'Dark web link', severity: 'high' as const },
      { id: 'REF005', pattern: /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?)/gi, message: 'Prompt injection', severity: 'high' as const },
    ];

    for (const ref of references) {
      for (const rule of refRules) {
        const match = rule.pattern.exec(ref.content);
        if (match) {
          issues.push({
            ruleId: `REF-${rule.id}`,
            ruleName: `reference_${rule.id.toLowerCase()}`,
            severity: rule.severity,
            category: 'path',
            message: `Detected ${rule.message} in reference file ${ref.path}`,
            suggestion: 'Remove sensitive content from reference files',
            location: {
              file: ref.path,
              content: match[0].substring(0, 30) + '...',
            },
          });
        }
        // Reset regex state
        rule.pattern.lastIndex = 0;
      }
    }

    return issues;
  }
}

// Create default instance and convenience exports
export const scanner = new SkillsGuardScanner();
export const scan = scanner.scan.bind(scanner);
export const scanFile = scanner.scanFile.bind(scanner);
export const validate = scanner.validate.bind(scanner);
export const checkTools = scanner.checkTools.bind(scanner);
export const generateReport = scanner.generateReport.bind(scanner);
export const explainRule = scanner.explainRule.bind(scanner);
