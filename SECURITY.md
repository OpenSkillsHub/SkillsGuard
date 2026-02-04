# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at Skills Guard. If you discover a security vulnerability **in Skills Guard itself** (not a detection rule suggestion), please follow these steps:

### 1. Do NOT Open a Public Issue

Security vulnerabilities should be reported privately to prevent potential exploitation.

### 2. Report Privately

**Option A: GitHub Security Advisory (Recommended)**
- Go to [Security Advisories](https://github.com/uttgeorge/SkillsGuard/security/advisories/new)
- Create a new private security advisory

**Option B: Email**
- Send an email to: **security@skillsguard.dev**
- Use PGP encryption if possible (key available on request)

### 3. Include the Following Information

- Type of vulnerability
- Full path to the vulnerable code
- Step-by-step instructions to reproduce
- Proof-of-concept or exploit code (if possible)
- Impact assessment

### 4. Response Timeline

| Stage | Timeline |
|-------|----------|
| Initial Response | Within 48 hours |
| Status Update | Within 7 days |
| Resolution Target | Within 30 days |

### 5. Disclosure Policy

- We follow [Coordinated Vulnerability Disclosure](https://vuls.cert.org/confluence/display/CVD)
- Public disclosure after fix is released (or 90 days, whichever comes first)
- Credit will be given to the reporter (unless anonymity is requested)

## Scope

### In Scope

- Security vulnerabilities in Skills Guard code
- Authentication/authorization bypasses
- Remote code execution
- Information disclosure
- Denial of service

### Out of Scope

- **Detection rule suggestions** (use the [Security Rule template](https://github.com/uttgeorge/SkillsGuard/issues/new?template=security_rule.yml))
- Social engineering attacks
- Physical attacks
- Issues in dependencies (report to upstream)

## Recognition

Security researchers who report valid vulnerabilities will be:

- Acknowledged in our security advisories
- Listed in CONTRIBUTORS.md (with permission)
- Thanked publicly in release notes

Thank you for helping keep Skills Guard and its users safe! 🛡️
