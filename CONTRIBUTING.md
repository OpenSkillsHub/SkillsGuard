# Contributing to Skills Guard

First off, thank you for considering contributing to Skills Guard! 🎉

Skills Guard is a security scanning tool for Anthropic Agent Skills. We welcome contributions from everyone who wants to help make AI agent interactions safer.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [security@skillsguard.dev](mailto:security@skillsguard.dev).

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SkillsGuard.git
   cd SkillsGuard
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/uttgeorge/SkillsGuard.git
   ```

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When creating a bug report, please include:
- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs **actual behavior**
- **Environment details** (OS, Node.js version, etc.)
- **Sample Skill file** if applicable (anonymized)

### 💡 Suggesting Features

Feature requests are welcome! Please:
- Check if the feature has already been requested
- Explain the use case and why it would be valuable
- Consider if it fits the project's scope (security scanning for Agent Skills)

### 📝 Improving Documentation

Documentation improvements are always appreciated:
- Fix typos or unclear explanations
- Add examples or use cases
- Translate documentation (we welcome i18n contributions)

### 🔧 Contributing Code

1. **Pick an issue** or create one for discussion
2. **Create a branch** from `main`
3. **Write your code** following our guidelines
4. **Add tests** for new functionality
5. **Submit a Pull Request**

### 🔒 Adding Security Rules

We especially welcome contributions to our detection rules! To add a new rule:

1. Identify a security pattern not currently detected
2. Add the rule to `packages/core/src/rules/engine.ts`
3. Add test cases to `packages/core/tests/core.test.ts`
4. Update `SECURITY_STANDARD.md` with the new rule documentation
5. Submit a PR with clear explanation of the threat model

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run CLI locally
node packages/cli/dist/index.js scan examples/unsafe-skill
```

### Development Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Run linter (if configured) |
| `pnpm clean` | Clean build artifacts |

## Project Structure

```
SkillsGuard/
├── packages/
│   ├── core/          # Core scanning engine (rules, parser, scorer)
│   ├── cli/           # Command-line interface
│   ├── mcp/           # MCP Server for AI integration
│   ├── server/        # REST API server
│   ├── sdk/           # TypeScript client SDK
│   └── plugin-claude/ # Claude Code plugin
├── examples/          # Sample Skills for testing
├── docs/              # Product documentation
└── SECURITY_STANDARD.md  # Detection rules specification
```

### Package Dependencies

```
core → (no dependencies)
cli → core
mcp → core
server → core
sdk → (HTTP client, connects to server)
plugin-claude → (uses MCP server)
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Code Style

```typescript
// ✅ Good
export interface ScanResult {
  score: number;
  issues: SecurityIssue[];
}

export function scanSkill(content: string): ScanResult {
  // Implementation
}

// ❌ Avoid
export function scan(c: any) {
  // Unclear naming, no types
}
```

### Testing

- Write tests for all new functionality
- Use descriptive test names
- Test edge cases and error conditions

```typescript
describe('RuleEngine', () => {
  it('should detect bash wildcard tool permission', () => {
    const content = '- Bash(*)';
    const issues = engine.scan(content);
    expect(issues).toContainEqual(
      expect.objectContaining({ id: 'TOOL001' })
    );
  });
});
```

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |
| `security` | Security-related changes |

### Examples

```
feat(core): add detection for encoded payload attacks

fix(cli): handle empty SKILL.md files gracefully

docs: add Chinese translation for README

security(rules): add SSRF detection pattern
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**: `pnpm test`
4. **Update CHANGELOG.md** with your changes
5. **Request review** from maintainers

### PR Title Format

Follow the same format as commit messages:
```
feat(core): add new injection detection rule
```

### PR Description Template

Your PR description should include:
- **What** does this PR do?
- **Why** is this change needed?
- **How** was it tested?
- **Screenshots** (if applicable)

## Security Vulnerabilities

If you discover a security vulnerability in Skills Guard itself (not a detection rule), please:

1. **Do NOT** open a public issue
2. Email [security@skillsguard.dev](mailto:security@skillsguard.dev)
3. Include detailed information about the vulnerability
4. Allow time for us to address it before public disclosure

## Recognition

Contributors will be:
- Listed in our [CONTRIBUTORS.md](CONTRIBUTORS.md) file
- Mentioned in release notes for significant contributions
- Invited to join our community discussions

## Questions?

- Open a [Discussion](https://github.com/uttgeorge/SkillsGuard/discussions) on GitHub
- Check our [documentation](./docs/)
- Review existing [issues](https://github.com/uttgeorge/SkillsGuard/issues)

---

Thank you for helping make AI agents safer! 🛡️
