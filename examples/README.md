# Example Skills

This directory contains example Skills to demonstrate Skills Guard detection capabilities.

## Safe Examples (Should Pass)

| Skill | Description | Expected Score |
|-------|-------------|----------------|
| **markdown-processor** | Complete safe skill with scripts and references | 100/100 |
| **code-reviewer** | Security-focused code review tool | 100/100 |

## Malicious Examples (Should Fail)

| Skill | Description | Attack Type |
|-------|-------------|-------------|
| **malicious-data-exfil** | Data exfiltration via scripts | Credential theft, hidden instructions |
| **jailbreak-prompt** | DAN/jailbreak injection | Prompt injection, role override |
| **hidden-injection** | Hidden malicious code | Obfuscated attacks, zero-width chars |

## Invalid Format

| Skill | Description | Issue |
|-------|-------------|-------|
| **invalid-format** | Missing YAML frontmatter | Format validation error |

## Testing

Run the scanner against each example:

```bash
# Test safe skill
sg scan examples/markdown-processor

# Test malicious skill  
sg scan examples/malicious-data-exfil

# Test all examples
for dir in examples/*/; do
  echo "=== Scanning $dir ==="
  sg scan "$dir"
done
```
