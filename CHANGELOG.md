# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Skills Guard
- Core scanning engine with 62+ security rules
- 5-layer detection architecture:
  - Layer 0: Schema Validation
  - Layer 1: Tool Permission Analysis
  - Layer 2: Instruction Content Scanning
  - Layer 3: Behavioral Pattern Analysis
  - Layer 4: External Script Analysis
- CLI tool (`@anthropic-skills/guard-cli`)
- MCP Server for AI integration (`@anthropic-skills/guard-mcp`)
- REST API Server (`@anthropic-skills/guard-server`)
- TypeScript SDK (`@anthropic-skills/guard-sdk`)
- Claude Code Plugin

### Security Rules
- Tool permission detection (Bash, Edit, Computer, Admin, MCP wildcards)
- Jailbreak pattern detection (DAN, role-play attacks, boundary dissolution)
- Injection attack detection (prompt injection, command injection, path traversal)
- Data exfiltration detection (credential theft, PII harvesting, data encoding)
- Social engineering detection (urgency, authority impersonation, emotional manipulation)
- External script analysis (shell, Python, JavaScript, Ruby, PowerShell)

## [0.1.0] - 2026-02-04

### Added
- Initial public release
- Complete monorepo structure
- Comprehensive documentation
- Security standard specification

---

## Release Notes Format

### Version Format: MAJOR.MINOR.PATCH

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Features to be removed in future
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security-related changes

[Unreleased]: https://github.com/uttgeorge/SkillsGuard/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/uttgeorge/SkillsGuard/releases/tag/v0.1.0
