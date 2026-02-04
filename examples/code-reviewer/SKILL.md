---
name: code-reviewer
description: Automated code review assistant. Use when users need to review code for quality, security issues, performance problems, or adherence to coding standards. Supports Python, JavaScript, TypeScript, and Go.
license: MIT
---

# Code Review Guide

## Overview

This skill provides automated code review capabilities, analyzing code for:
- Security vulnerabilities
- Performance issues
- Code quality and style
- Best practices adherence

## Quick Start

Run a basic review:

```bash
python scripts/review.py path/to/code.py
```

## Review Process

1. **Syntax Check**: Verify code compiles/parses correctly
2. **Security Scan**: Check for common vulnerabilities
3. **Style Check**: Verify coding standards
4. **Performance Review**: Identify optimization opportunities

## Scripts

### Full Code Review

```bash
python scripts/review.py <file> [--format json|text]
```

### Security-Only Scan

```bash
python scripts/security_scan.py <file>
```

## Supported Languages

| Language | Extensions | Linter Used |
|----------|------------|-------------|
| Python | .py | pylint, bandit |
| JavaScript | .js | eslint |
| TypeScript | .ts | eslint, tsc |
| Go | .go | golint |

## Review Categories

- **CRITICAL**: Security vulnerabilities, crashes
- **WARNING**: Performance issues, code smells
- **INFO**: Style suggestions, minor improvements

For detailed security rules, see [references/security-rules.md](references/security-rules.md).
