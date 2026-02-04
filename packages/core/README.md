# @skills-guard/core

> Skills Guard Core Scanning Engine - Security Detection for Anthropic Agent Skills

## Installation

```bash
npm install @skills-guard/core
```

## Usage

```typescript
import { 
  SkillsGuardScanner, 
  parseSkillContent,
  RulesEngine 
} from '@skills-guard/core';

// Create scanner instance
const scanner = new SkillsGuardScanner();

// Scan Skill content
const result = await scanner.scan(skillMdContent);

console.log(`Security Score: ${result.score}/100`);
console.log(`Risk Level: ${result.level}`);
console.log(`Detected ${result.issues.length} issues`);

// Generate report
const textReport = scanner.generateReport(result, 'text');
const jsonReport = scanner.generateReport(result, 'json');

// Scan local file
const fileResult = await scanner.scanFile('./my-skill');

// Check tool risks
const toolRisks = scanner.checkTools(['Bash(*)', 'Read', 'Write']);

// Explain rule
const explanation = scanner.explainRule('INJ001');
```

## API

### `SkillsGuardScanner`

Main scanner class.

#### Methods

| Method | Description |
|--------|-------------|
| `scan(content, options?)` | Scan Skill content |
| `scanFile(path, options?)` | Scan local file or directory |
| `validate(content)` | Validate format compliance only |
| `checkTools(tools)` | Check tool configuration risks |
| `generateReport(result, format)` | Generate report |
| `explainRule(ruleId)` | Explain rule |

### Scan Options

```typescript
interface ScanOptions {
  layers?: (0 | 1 | 2 | 3 | 4)[];  // Detection layers
  excludeRules?: string[];          // Excluded rules
  scanDirectories?: boolean;        // Whether to scan scripts/
  format?: 'json' | 'text' | 'markdown';
}
```

### Scan Result

```typescript
interface ScanResult {
  score: number;        // 0-100 security score
  level: RiskLevel;     // 'safe' | 'low' | 'medium' | 'high'
  issues: Issue[];      // Detected issues
  summary: {
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  formatCompliance: {
    valid: boolean;
    errors: string[];
  };
}
```

## Detection Rules

62+ detection rules covering:

- **Layer 0**: Format compliance (name/description validation)
- **Layer 1**: Prompt injection, sensitive information, dangerous commands, content compliance
- **Layer 2**: Tool risk assessment
- **Layer 3**: Path security, URL security, script security
- **Layer 4**: Behavior pattern analysis

## License

MIT
