# skills-guard

> Skills Guard CLI - Security Detection Command-Line Tool for Anthropic Agent Skills

## Installation

```bash
# Global install
npm install -g skills-guard

# Or use npx
npx skills-guard scan ./my-skill
```

## Commands

### Scan Skill

```bash
sg scan <path> [options]

# Examples
sg scan ./my-skill
sg scan ./my-skill/SKILL.md
sg scan ./my-skill -f json -o report.json
sg scan ./my-skill --min-score 70
```

**Options:**
- `-f, --format <format>` - Output format (json|text|markdown)
- `-o, --output <file>` - Output to file
- `--min-score <score>` - Minimum passing score
- `--exclude <rules>` - Excluded rule IDs
- `--layers <layers>` - Detection layers (0,1,2,3,4)
- `--no-scripts` - Skip scripts/ directory scanning
- `-q, --quiet` - Minimal output

### Format Validation

```bash
sg validate <path>

# Examples
sg validate ./my-skill
```

### Tool Risk Check

```bash
sg check-tools <tools...>

# Examples
sg check-tools "Bash(*)" Read Write WebFetch
sg check-tools Bash\(git:\*\) Read
```

### List Rules

```bash
sg rules [options]

# Examples
sg rules
sg rules -c injection    # Filter by category
sg rules -s high         # Filter by severity
sg rules --json          # JSON format
```

### Explain Rule

```bash
sg explain <ruleId>

# Examples
sg explain INJ001
sg explain SEC003
```

### Quick Scan

```bash
# Read from stdin
cat SKILL.md | sg quick
echo "---\nname: test\n---" | sg quick -f json
```

## Output Example

```
╔═══════════════════════════════════════════════════════════╗
║     🛡️  Skills Guard - Agent Skills Security Detection    ║
╚═══════════════════════════════════════════════════════════╝

🔍 Scan Target: ./my-skill
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Scan Results Overview
────────────────────────────────────────────────────────────
   Security Score: 70/100    🟡 Low Risk
   Scan Duration: 5ms
   Skill Name: my-skill

📋 Issue Statistics
────────────────────────────────────────────────────────────
   🔴 High: 0   🟠 Medium: 2   🟡 Low: 1   ℹ️ Info: 0
   Total: 3 issues
```

## License

MIT
