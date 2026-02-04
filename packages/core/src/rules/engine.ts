/**
 * Skills Guard - Rules Engine
 * Rules Engine: Load and execute detection rules
 */

import { Skill, Issue, Rule, IssueCategory, Severity, ToolRisk, ToolCheckResult } from '../types.js';

/**
 * Built-in rule definitions
 */
const BUILTIN_RULES: Rule[] = [
  // ===== Layer 0: Format Compliance =====
  {
    id: 'FMT001',
    name: 'missing_frontmatter',
    description: 'Missing frontmatter',
    category: 'format',
    severity: 'high',
    message: 'Missing YAML frontmatter (metadata block wrapped by ---)',
    suggestion: 'Add frontmatter at file start with name and description fields',
    enabled: true,
    validator: (skill) => {
      if (skill.frontmatter._noFrontmatter) {
        return {
          ruleId: 'FMT001',
          ruleName: 'missing_frontmatter',
          severity: 'high',
          category: 'format',
          message: 'Missing YAML frontmatter (metadata block wrapped by ---)',
          suggestion: 'Add frontmatter at file start with name and description fields',
        };
      }
      return null;
    },
  },
  {
    id: 'FMT002',
    name: 'yaml_parse_error',
    description: 'YAML syntax error',
    category: 'format',
    severity: 'high',
    message: 'Frontmatter YAML parse failed',
    suggestion: 'Check YAML syntax, ensure correct format',
    enabled: true,
    validator: (skill) => {
      if (skill.frontmatter._parseError) {
        return {
          ruleId: 'FMT002',
          ruleName: 'yaml_parse_error',
          severity: 'high',
          category: 'format',
          message: `Frontmatter YAML parse failed: ${skill.frontmatter._parseError}`,
          suggestion: 'Check YAML syntax, ensure correct format',
        };
      }
      return null;
    },
  },
  {
    id: 'FMT003',
    name: 'missing_name',
    description: 'Missing name field',
    category: 'format',
    severity: 'high',
    message: 'Missing required name field',
    suggestion: 'Add name field, format: lowercase letters, numbers and hyphens',
    enabled: true,
    validator: (skill) => {
      if (!skill.frontmatter.name) {
        return {
          ruleId: 'FMT003',
          ruleName: 'missing_name',
          severity: 'high',
          category: 'format',
          message: 'Missing required name field',
          suggestion: 'Add name field, format: lowercase letters, numbers and hyphens',
        };
      }
      return null;
    },
  },
  {
    id: 'FMT004',
    name: 'missing_description',
    description: 'Missing description field',
    category: 'format',
    severity: 'high',
    message: 'Missing required description field',
    suggestion: 'Add description field describing Skill functionality and use cases',
    enabled: true,
    validator: (skill) => {
      if (!skill.frontmatter.description) {
        return {
          ruleId: 'FMT004',
          ruleName: 'missing_description',
          severity: 'high',
          category: 'format',
          message: 'Missing required description field',
          suggestion: 'Add description field describing Skill functionality and use cases',
        };
      }
      return null;
    },
  },
  {
    id: 'NAM001',
    name: 'name_uppercase',
    description: 'Name contains uppercase letters',
    category: 'format',
    severity: 'medium',
    message: 'Name field contains uppercase letters, should be all lowercase',
    suggestion: 'Convert name to lowercase',
    enabled: true,
    validator: (skill) => {
      if (skill.frontmatter.name && /[A-Z]/.test(skill.frontmatter.name)) {
        return {
          ruleId: 'NAM001',
          ruleName: 'name_uppercase',
          severity: 'medium',
          category: 'format',
          message: `Name "${skill.frontmatter.name}" contains uppercase letters, should be all lowercase`,
          suggestion: `Suggested: ${skill.frontmatter.name.toLowerCase()}`,
        };
      }
      return null;
    },
  },
  {
    id: 'NAM002',
    name: 'name_invalid_chars',
    description: 'Name contains invalid characters',
    category: 'format',
    severity: 'medium',
    message: 'Name field can only contain lowercase letters, numbers and hyphens',
    suggestion: 'Remove invalid characters',
    enabled: true,
    validator: (skill) => {
      if (skill.frontmatter.name && !/^[a-z0-9-]*$/.test(skill.frontmatter.name)) {
        return {
          ruleId: 'NAM002',
          ruleName: 'name_invalid_chars',
          severity: 'medium',
          category: 'format',
          message: `Name "${skill.frontmatter.name}" contains invalid characters (only lowercase letters, numbers, hyphens allowed)`,
          suggestion: 'Remove or replace invalid characters',
        };
      }
      return null;
    },
  },
  {
    id: 'NAM003',
    name: 'name_hyphen_position',
    description: 'Name starts or ends with hyphen',
    category: 'format',
    severity: 'medium',
    message: 'Name cannot start or end with hyphen',
    suggestion: 'Remove leading/trailing hyphens',
    enabled: true,
    validator: (skill) => {
      if (skill.frontmatter.name && (skill.frontmatter.name.startsWith('-') || skill.frontmatter.name.endsWith('-'))) {
        return {
          ruleId: 'NAM003',
          ruleName: 'name_hyphen_position',
          severity: 'medium',
          category: 'format',
          message: `Name "${skill.frontmatter.name}" cannot start or end with hyphen`,
          suggestion: 'Remove leading/trailing hyphens',
        };
      }
      return null;
    },
  },
  {
    id: 'NAM004',
    name: 'name_consecutive_hyphens',
    description: 'Name contains consecutive hyphens',
    category: 'format',
    severity: 'medium',
    message: 'Name cannot contain consecutive hyphens',
    suggestion: 'Replace consecutive hyphens with single hyphen',
    enabled: true,
    validator: (skill) => {
      if (skill.frontmatter.name && /--/.test(skill.frontmatter.name)) {
        return {
          ruleId: 'NAM004',
          ruleName: 'name_consecutive_hyphens',
          severity: 'medium',
          category: 'format',
          message: `Name "${skill.frontmatter.name}" contains consecutive hyphens`,
          suggestion: 'Replace consecutive hyphens with single hyphen',
        };
      }
      return null;
    },
  },
  {
    id: 'NAM005',
    name: 'name_too_long',
    description: 'Name exceeds 64 characters',
    category: 'format',
    severity: 'medium',
    message: 'Name length exceeds 64 character limit',
    suggestion: 'Shorten name length',
    enabled: true,
    validator: (skill) => {
      if (skill.frontmatter.name && skill.frontmatter.name.length > 64) {
        return {
          ruleId: 'NAM005',
          ruleName: 'name_too_long',
          severity: 'medium',
          category: 'format',
          message: `Name length ${skill.frontmatter.name.length} exceeds 64 character limit`,
          suggestion: 'Shorten name to 64 characters or less',
        };
      }
      return null;
    },
  },
  {
    id: 'DESC001',
    name: 'description_too_short',
    description: 'Description too short',
    category: 'format',
    severity: 'low',
    message: 'Description too short, recommend detailed functionality description',
    suggestion: 'Expand description with functionality and use cases',
    enabled: true,
    validator: (skill) => {
      if (skill.frontmatter.description && skill.frontmatter.description.length < 20) {
        return {
          ruleId: 'DESC001',
          ruleName: 'description_too_short',
          severity: 'low',
          category: 'format',
          message: `Description only has ${skill.frontmatter.description.length} characters, recommend at least 20`,
          suggestion: 'Expand description with functionality and use cases',
        };
      }
      return null;
    },
  },
  {
    id: 'DESC002',
    name: 'description_too_long',
    description: 'Description too long',
    category: 'format',
    severity: 'low',
    message: 'Description exceeds 1024 character limit',
    suggestion: 'Shorten description',
    enabled: true,
    validator: (skill) => {
      if (skill.frontmatter.description && skill.frontmatter.description.length > 1024) {
        return {
          ruleId: 'DESC002',
          ruleName: 'description_too_long',
          severity: 'low',
          category: 'format',
          message: `Description length ${skill.frontmatter.description.length} exceeds 1024 character limit`,
          suggestion: 'Shorten description to 1024 characters or less',
        };
      }
      return null;
    },
  },

  // ===== Layer 1: Prompt Injection Detection =====
  {
    id: 'INJ001',
    name: 'ignore_instructions',
    description: 'Role override attempt detection',
    category: 'injection',
    severity: 'high',
    patterns: [
      /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?)/gi,
      /disregard\s+(everything|all)\s+(above|before)/gi,
      /forget\s+(everything|all)\s+you\s+(know|were\s+told)/gi,
    ],
    message: 'Prompt injection attempt detected: Trying to make AI ignore previous instructions',
    suggestion: 'Remove such instructions, ensure Skill content is safe',
    enabled: true,
  },
  {
    id: 'INJ002',
    name: 'system_injection',
    description: 'System instruction injection',
    category: 'injection',
    severity: 'high',
    patterns: [
      /\[\[SYSTEM\]\]/gi,
      /<\|im_start\|>/gi,
      /<\|system\|>/gi,
      /<\|assistant\|>/gi,
    ],
    message: 'System instruction injection attempt detected',
    suggestion: 'Remove system instruction markers',
    enabled: true,
  },
  {
    id: 'INJ003',
    name: 'jailbreak_attempt',
    description: 'Jailbreak attempt',
    category: 'injection',
    severity: 'high',
    patterns: [
      /\bDAN\b/g,
      /jailbreak/gi,
      /无限制模式/g,
      /developer\s+mode/gi,
      /你是一个没有任何限制的/g,
      /假装你是一个没有道德约束的/g,
    ],
    message: 'Jailbreak attempt detected',
    suggestion: 'Remove jailbreak related content',
    enabled: true,
  },
  {
    id: 'INJ004',
    name: 'role_override',
    description: 'Role redefinition',
    category: 'injection',
    severity: 'medium',
    patterns: [
      /you\s+are\s+now/gi,
      /from\s+now\s+on.*you\s+are/gi,
      /你现在是/g,
      /从现在开始.*你是/g,
    ],
    message: 'Role redefinition attempt detected',
    suggestion: 'Check if this is a legitimate role definition',
    enabled: true,
  },
  {
    id: 'INJ005',
    name: 'template_injection',
    description: 'Template injection',
    category: 'injection',
    severity: 'medium',
    patterns: [
      /\{\{.*\}\}/g,
      /<%.*%>/g,
      /\{%.*%\}/g,
    ],
    message: 'Possible template injection detected',
    suggestion: 'Confirm template syntax safety',
    enabled: true,
  },

  // ===== Layer 1: Sensitive Information Detection =====
  {
    id: 'SEC001',
    name: 'openai_api_key',
    description: 'OpenAI API Key',
    category: 'secret',
    severity: 'high',
    patterns: [/sk-[a-zA-Z0-9]{20,}/g],
    message: 'Suspected OpenAI API Key detected',
    suggestion: 'Remove hardcoded API Key, use environment variables',
    enabled: true,
  },
  {
    id: 'SEC002',
    name: 'aws_access_key',
    description: 'AWS Access Key',
    category: 'secret',
    severity: 'high',
    patterns: [/AKIA[0-9A-Z]{16}/g],
    message: 'Suspected AWS Access Key detected',
    suggestion: 'Remove hardcoded credentials',
    enabled: true,
  },
  {
    id: 'SEC003',
    name: 'private_key',
    description: 'Private Key',
    category: 'secret',
    severity: 'high',
    patterns: [/-----BEGIN.*PRIVATE KEY-----/g],
    message: 'Private key content detected',
    suggestion: 'Remove private key content',
    enabled: true,
  },
  {
    id: 'SEC004',
    name: 'github_token',
    description: 'GitHub Token',
    category: 'secret',
    severity: 'high',
    patterns: [/ghp_[a-zA-Z0-9]{36}/g, /gho_[a-zA-Z0-9]{36}/g],
    message: 'Suspected GitHub Token detected',
    suggestion: 'Remove hardcoded Token',
    enabled: true,
  },
  {
    id: 'SEC005',
    name: 'hardcoded_password',
    description: 'Hardcoded password',
    category: 'secret',
    severity: 'medium',
    patterns: [/password\s*[=:]\s*['"][^'"]{6,}['"]/gi],
    message: 'Hardcoded password detected',
    suggestion: 'Remove hardcoded password, use secure credential management',
    enabled: true,
  },

  // ===== Layer 1: Dangerous Command Detection =====
  {
    id: 'CMD001',
    name: 'recursive_delete',
    description: 'Recursive delete',
    category: 'command',
    severity: 'high',
    patterns: [
      /rm\s+-rf\s+[\/~]/g,
      /rm\s+-r\s+-f\s+[\/~]/g,
      /del\s+\/[sf]/gi,
    ],
    message: 'Dangerous recursive delete command detected',
    suggestion: 'Avoid using recursive delete commands',
    enabled: true,
  },
  {
    id: 'CMD002',
    name: 'disk_format',
    description: 'Disk format',
    category: 'command',
    severity: 'high',
    patterns: [
      /\bformat\s+[a-z]:/gi,
      /\bfdisk\b/g,
      /\bmkfs\b/g,
    ],
    message: 'Disk format command detected',
    suggestion: 'Remove disk operation commands',
    enabled: true,
  },
  {
    id: 'CMD003',
    name: 'remote_execution',
    description: 'Remote download and execute',
    category: 'command',
    severity: 'high',
    patterns: [
      /curl.*\|\s*(ba)?sh/g,
      /wget.*&&.*bash/g,
      /curl.*>\s*\S+\.sh\s*&&/g,
    ],
    message: 'Remote download and execute pattern detected',
    suggestion: 'Avoid downloading and executing remote scripts directly',
    enabled: true,
  },
  {
    id: 'CMD004',
    name: 'dangerous_chmod',
    description: 'Dangerous permission setting',
    category: 'command',
    severity: 'medium',
    patterns: [
      /chmod\s+777/g,
      /chmod\s+-R\s+777/g,
    ],
    message: 'Dangerous permission setting detected',
    suggestion: 'Use safer permission settings',
    enabled: true,
  },
  {
    id: 'CMD005',
    name: 'privilege_escalation',
    description: 'Privilege escalation',
    category: 'command',
    severity: 'medium',
    patterns: [
      /\bsudo\s/g,
      /\bsu\s+root/g,
      /\brunas\b/gi,
    ],
    message: 'Privilege escalation operation detected',
    suggestion: 'Confirm if privilege escalation is needed',
    enabled: true,
  },
  {
    id: 'CMD006',
    name: 'dynamic_execution',
    description: 'Dynamic code execution',
    category: 'command',
    severity: 'medium',
    patterns: [
      /\beval\s*\(/g,
      /\bexec\s*\(/g,
    ],
    message: 'Dynamic code execution detected',
    suggestion: 'Avoid using eval/exec',
    enabled: true,
  },

  // ===== Layer 3: Path Security Detection =====
  {
    id: 'PATH001',
    name: 'ssh_directory',
    description: 'SSH directory access',
    category: 'path',
    severity: 'high',
    patterns: [
      /~\/\.ssh\//g,
      /\.ssh\/id_rsa/g,
      /\.ssh\/id_ed25519/g,
    ],
    message: 'SSH key directory access detected',
    suggestion: 'Avoid accessing SSH keys',
    enabled: true,
  },
  {
    id: 'PATH002',
    name: 'system_passwords',
    description: 'System password files',
    category: 'path',
    severity: 'high',
    patterns: [
      /\/etc\/passwd/g,
      /\/etc\/shadow/g,
    ],
    message: 'System password file access detected',
    suggestion: 'Avoid accessing system password files',
    enabled: true,
  },
  {
    id: 'PATH003',
    name: 'env_file',
    description: 'Environment variable files',
    category: 'path',
    severity: 'medium',
    patterns: [
      /\.env\b/g,
      /\.env\.local/g,
      /\.env\.production/g,
    ],
    message: 'Environment variable file access detected',
    suggestion: 'Confirm if environment variable file access is needed',
    enabled: true,
  },
  {
    id: 'PATH004',
    name: 'aws_credentials',
    description: 'AWS credentials file',
    category: 'path',
    severity: 'high',
    patterns: [
      /~\/\.aws\/credentials/g,
      /\.aws\/config/g,
    ],
    message: 'AWS credentials file access detected',
    suggestion: 'Avoid direct access to credentials files',
    enabled: true,
  },

  // ===== Layer 3: URL Security Detection =====
  {
    id: 'URL001',
    name: 'insecure_http',
    description: 'Non-HTTPS links',
    category: 'url',
    severity: 'medium',
    patterns: [/http:\/\/(?!localhost|127\.0\.0\.1)/g],
    message: 'Non-HTTPS link detected',
    suggestion: 'Use HTTPS instead of HTTP',
    enabled: true,
  },
  {
    id: 'URL002',
    name: 'ip_direct',
    description: 'Direct IP connection',
    category: 'url',
    severity: 'medium',
    patterns: [/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g],
    message: 'Direct IP connection detected',
    suggestion: 'Use domain name instead of direct IP',
    enabled: true,
  },
  {
    id: 'URL003',
    name: 'suspicious_tld',
    description: 'Suspicious top-level domain',
    category: 'url',
    severity: 'medium',
    patterns: [/https?:\/\/[^/]+\.(xyz|tk|ml|ga|cf|gq|top|work)\b/gi],
    message: 'Suspicious top-level domain detected',
    suggestion: 'Verify URL legitimacy',
    enabled: true,
  },
  {
    id: 'URL004',
    name: 'data_exfil_url',
    description: 'Possible data exfiltration URL',
    category: 'url',
    severity: 'high',
    patterns: [
      /https?:\/\/[^/]+\/(upload|exfil|collect|receive)/gi,
      /webhook\.site/gi,
      /ngrok\.io/gi,
      /pipedream\.net/gi,
    ],
    message: 'URL possibly used for data exfiltration detected',
    suggestion: 'Verify the purpose of this URL',
    enabled: true,
  },
  {
    id: 'URL005',
    name: 'encoded_url',
    description: 'Encoded/obfuscated URL',
    category: 'url',
    severity: 'medium',
    patterns: [
      /https?:\/\/[^/]*%[0-9a-fA-F]{2}/g,
      /atob\s*\(\s*['"][A-Za-z0-9+/=]+['"]\s*\)/g,
    ],
    message: 'Encoded or obfuscated URL detected',
    suggestion: 'Check if this is a maliciously hidden URL',
    enabled: true,
  },

  // ===== Layer 3: More Path Security Rules =====
  {
    id: 'PATH005',
    name: 'git_credentials',
    description: 'Git credentials file',
    category: 'path',
    severity: 'high',
    patterns: [
      /\.git\/config/g,
      /\.git-credentials/g,
      /\.gitconfig/g,
    ],
    message: 'Git credentials file access detected',
    suggestion: 'Avoid direct access to Git credentials',
    enabled: true,
  },
  {
    id: 'PATH006',
    name: 'docker_secrets',
    description: 'Docker sensitive files',
    category: 'path',
    severity: 'high',
    patterns: [
      /\/var\/run\/docker\.sock/g,
      /\.docker\/config\.json/g,
    ],
    message: 'Docker sensitive file access detected',
    suggestion: 'Avoid accessing Docker configuration',
    enabled: true,
  },
  {
    id: 'PATH007',
    name: 'npm_tokens',
    description: 'NPM Token file',
    category: 'path',
    severity: 'high',
    patterns: [
      /\.npmrc/g,
      /npm-token/gi,
    ],
    message: 'NPM credentials file access detected',
    suggestion: 'Avoid accessing NPM credentials',
    enabled: true,
  },
  {
    id: 'PATH008',
    name: 'kubernetes_secrets',
    description: 'Kubernetes sensitive files',
    category: 'path',
    severity: 'high',
    patterns: [
      /\.kube\/config/g,
      /kubeconfig/gi,
    ],
    message: 'Kubernetes config file access detected',
    suggestion: 'Avoid accessing K8s credentials',
    enabled: true,
  },
  {
    id: 'PATH009',
    name: 'browser_data',
    description: 'Browser data files',
    category: 'path',
    severity: 'high',
    patterns: [
      /Chrome.*Login Data/gi,
      /Firefox.*logins\.json/gi,
      /\.mozilla\/firefox.*\.default/gi,
    ],
    message: 'Browser sensitive data access detected',
    suggestion: 'Should not access browser-stored credentials',
    enabled: true,
  },
  {
    id: 'PATH010',
    name: 'sensitive_dirs',
    description: 'Sensitive directory access',
    category: 'path',
    severity: 'medium',
    patterns: [
      /\/root\//g,
      /C:\\Users\\Administrator/gi,
      /\/home\/[^/]+\/\./g,
    ],
    message: 'Sensitive directory access detected',
    suggestion: 'Confirm if user sensitive directory access is needed',
    enabled: true,
  },

  // ===== Layer 3: Script Security Detection =====
  {
    id: 'SCR001',
    name: 'script_remote_fetch',
    description: 'Remote fetch in script',
    category: 'script',
    severity: 'high',
    patterns: [
      /urllib\.request\.urlopen/g,
      /requests\.get\s*\(/g,
      /fetch\s*\(\s*['"]/g,
      /axios\.(get|post)\s*\(/g,
    ],
    message: 'Network request code in script',
    suggestion: 'Confirm if network requests in script are necessary and secure',
    enabled: true,
  },
  {
    id: 'SCR002',
    name: 'script_subprocess',
    description: 'Subprocess call in script',
    category: 'script',
    severity: 'high',
    patterns: [
      /subprocess\.(run|call|Popen)\s*\(/g,
      /os\.system\s*\(/g,
      /exec\s*\(\s*['"]/g,
      /child_process\.(exec|spawn)/g,
    ],
    message: 'System command execution in script',
    suggestion: 'Review if command execution in script is secure',
    enabled: true,
  },
  {
    id: 'SCR003',
    name: 'script_env_access',
    description: 'Environment variable access in script',
    category: 'script',
    severity: 'medium',
    patterns: [
      /os\.environ\[/g,
      /process\.env\./g,
      /\$\{?\w*KEY\}?/gi,
      /\$\{?\w*SECRET\}?/gi,
      /\$\{?\w*TOKEN\}?/gi,
    ],
    message: 'Environment variable access in script',
    suggestion: 'Confirm if environment variable access is reasonable',
    enabled: true,
  },
  {
    id: 'SCR004',
    name: 'script_file_operations',
    description: 'Sensitive file operations in script',
    category: 'script',
    severity: 'medium',
    patterns: [
      /open\s*\(\s*['"]\/etc\//g,
      /open\s*\(\s*['"]~\/\./g,
      /fs\.readFileSync\s*\(\s*['"]\/etc\//g,
    ],
    message: 'Sensitive file operations in script',
    suggestion: 'Review script file access permissions',
    enabled: true,
  },
  {
    id: 'SCR005',
    name: 'script_base64_decode',
    description: 'Base64 decoding in script',
    category: 'script',
    severity: 'medium',
    patterns: [
      /base64\.b64decode/g,
      /atob\s*\(/g,
      /Buffer\.from\s*\([^,]+,\s*['"]base64['"]/g,
    ],
    message: 'Base64 decoding operation in script',
    suggestion: 'Check if used to hide malicious code',
    enabled: true,
  },

  // ===== Layer 4: Behavior Pattern Analysis =====
  {
    id: 'BEH001',
    name: 'data_collection',
    description: 'Data collection behavior',
    category: 'behavior',
    severity: 'high',
    patterns: [
      /collect.*user.*data/gi,
      /gather.*information/gi,
      /收集.*信息/g,
      /获取.*用户.*数据/g,
    ],
    message: 'Potential data collection behavior detected',
    suggestion: 'Confirm data collection is compliant and has user consent',
    enabled: true,
  },
  {
    id: 'BEH002',
    name: 'data_exfiltration',
    description: 'Data exfiltration behavior',
    category: 'behavior',
    severity: 'high',
    patterns: [
      /send.*to.*server/gi,
      /upload.*data/gi,
      /transmit.*information/gi,
      /发送.*服务器/g,
      /上传.*数据/g,
    ],
    message: 'Potential data exfiltration behavior detected',
    suggestion: 'Confirm data transmission is necessary and target is trusted',
    enabled: true,
  },
  {
    id: 'BEH003',
    name: 'persistence_mechanism',
    description: 'Persistence mechanism',
    category: 'behavior',
    severity: 'high',
    patterns: [
      /crontab/g,
      /launchd/gi,
      /systemd.*service/gi,
      /Task Scheduler/gi,
      /startup.*script/gi,
      /开机自启/g,
    ],
    message: 'Persistence mechanism detected',
    suggestion: 'Confirm if auto-start is needed',
    enabled: true,
  },
  {
    id: 'BEH004',
    name: 'credential_harvesting',
    description: 'Credential harvesting',
    category: 'behavior',
    severity: 'high',
    patterns: [
      /password.*input/gi,
      /credential.*prompt/gi,
      /login.*form/gi,
      /密码.*输入/g,
      /凭据.*获取/g,
    ],
    message: 'Credential harvesting behavior detected',
    suggestion: 'Confirm password collection is legitimate and securely handled',
    enabled: true,
  },
  {
    id: 'BEH005',
    name: 'network_scanning',
    description: 'Network scanning',
    category: 'behavior',
    severity: 'high',
    patterns: [
      /port\s*scan/gi,
      /nmap/gi,
      /network\s*discovery/gi,
      /端口扫描/g,
    ],
    message: 'Network scanning behavior detected',
    suggestion: 'Network scanning requires authorization',
    enabled: true,
  },
  {
    id: 'BEH006',
    name: 'resource_abuse',
    description: 'Resource abuse',
    category: 'behavior',
    severity: 'medium',
    patterns: [
      /crypto.*mining/gi,
      /bitcoin.*miner/gi,
      /infinite\s*loop/gi,
      /while\s*\(\s*true\s*\)/g,
      /无限循环/g,
      /挖矿/g,
    ],
    message: 'Potential resource abuse detected',
    suggestion: 'Confirm if resource abuse risk exists',
    enabled: true,
  },
  {
    id: 'BEH007',
    name: 'privilege_abuse',
    description: 'Privilege abuse pattern',
    category: 'behavior',
    severity: 'medium',
    patterns: [
      /bypass.*security/gi,
      /disable.*antivirus/gi,
      /turn\s*off.*firewall/gi,
      /绕过.*安全/g,
      /关闭.*防火墙/g,
    ],
    message: 'Privilege abuse pattern detected',
    suggestion: 'Should not attempt to bypass security mechanisms',
    enabled: true,
  },
  {
    id: 'BEH008',
    name: 'unauthorized_access',
    description: 'Unauthorized access',
    category: 'behavior',
    severity: 'high',
    patterns: [
      /brute\s*force/gi,
      /password\s*crack/gi,
      /unauthorized.*access/gi,
      /暴力破解/g,
      /未授权.*访问/g,
    ],
    message: 'Unauthorized access attempt detected',
    suggestion: 'Should not include cracking or unauthorized access behavior',
    enabled: true,
  },
  {
    id: 'BEH009',
    name: 'stealth_behavior',
    description: 'Stealth behavior',
    category: 'behavior',
    severity: 'high',
    patterns: [
      /hide.*activity/gi,
      /clear.*logs/gi,
      /delete.*history/gi,
      /隐藏.*活动/g,
      /清除.*日志/g,
    ],
    message: 'Stealth behavior pattern detected',
    suggestion: 'Should not attempt to hide activity traces',
    enabled: true,
  },
  {
    id: 'BEH010',
    name: 'social_engineering',
    description: 'Social engineering',
    category: 'behavior',
    severity: 'high',
    patterns: [
      /pretend.*to\s*be/gi,
      /impersonate/gi,
      /phishing/gi,
      /假装.*是/g,
      /冒充/g,
      /钓鱼/g,
    ],
    message: 'Social engineering characteristics detected',
    suggestion: 'Should not include deception or impersonation behavior',
    enabled: true,
  },

  // ===== Layer 1: Content Compliance Supplement =====
  {
    id: 'CMP001',
    name: 'illegal_content',
    description: 'Illegal content',
    category: 'compliance',
    severity: 'high',
    patterns: [
      /child\s*porn/gi,
      /illegal.*drug/gi,
      /terrorism/gi,
      /非法.*内容/g,
    ],
    message: 'Possible illegal content detected',
    suggestion: 'Remove illegal or harmful content',
    enabled: true,
  },
  {
    id: 'CMP002',
    name: 'hate_speech',
    description: 'Hate speech',
    category: 'compliance',
    severity: 'high',
    patterns: [
      /hate\s*speech/gi,
      /racial.*slur/gi,
      /仇恨.*言论/g,
    ],
    message: 'Possible hate speech detected',
    suggestion: 'Remove discriminatory or hateful content',
    enabled: true,
  },
  {
    id: 'CMP003',
    name: 'violence_content',
    description: 'Violence content',
    category: 'compliance',
    severity: 'medium',
    patterns: [
      /how\s*to\s*kill/gi,
      /make.*bomb/gi,
      /weapon.*instructions/gi,
      /如何.*杀/g,
      /制作.*炸弹/g,
    ],
    message: 'Violence related content detected',
    suggestion: 'Remove violence related guidance content',
    enabled: true,
  },
  {
    id: 'CMP004',
    name: 'privacy_violation',
    description: 'Privacy violation',
    category: 'compliance',
    severity: 'medium',
    patterns: [
      /track.*user/gi,
      /spy\s*on/gi,
      /surveillance/gi,
      /跟踪.*用户/g,
      /监控.*隐私/g,
    ],
    message: 'Privacy violation related content detected',
    suggestion: 'Ensure compliance with privacy protection regulations',
    enabled: true,
  },
  {
    id: 'CMP005',
    name: 'deceptive_content',
    description: 'Deceptive content',
    category: 'compliance',
    severity: 'medium',
    patterns: [
      /fake.*news/gi,
      /misinformation/gi,
      /虚假.*信息/g,
      /散布.*谣言/g,
    ],
    message: 'Deceptive content detected',
    suggestion: 'Remove false or misleading content',
    enabled: true,
  },
];

/**
 * Tool risk configuration
 */
const TOOL_RISKS: ToolRisk[] = [
  // High risk
  { pattern: /^Bash\s*\(\s*\*\s*\)$/i, severity: 'high', score: 25, description: 'Arbitrary command execution' },
  { pattern: /^Execute$/i, severity: 'high', score: 25, description: 'Arbitrary execution permission' },
  { pattern: /^Shell$/i, severity: 'high', score: 25, description: 'Shell execution permission' },
  { pattern: /^\*$/i, severity: 'high', score: 30, description: 'Unrestricted permission' },
  
  // Medium risk
  { pattern: /^Bash\s*\([^)]+\)$/i, severity: 'medium', score: 15, description: 'Limited command shell execution' },
  { pattern: /^Write$/i, severity: 'medium', score: 10, description: 'File write permission' },
  { pattern: /^Edit$/i, severity: 'medium', score: 10, description: 'File edit permission' },
  { pattern: /^Delete$/i, severity: 'medium', score: 10, description: 'File delete permission' },
  { pattern: /^WebFetch$/i, severity: 'medium', score: 5, description: 'Web fetch permission' },
  { pattern: /^CreateFile$/i, severity: 'medium', score: 10, description: 'File create permission' },
  
  // Low risk
  { pattern: /^Read$/i, severity: 'low', score: 0, description: 'Read-only permission' },
  { pattern: /^Grep$/i, severity: 'low', score: 0, description: 'Content search permission' },
  { pattern: /^Glob$/i, severity: 'low', score: 0, description: 'File pattern matching permission' },
  { pattern: /^ListDir$/i, severity: 'low', score: 0, description: 'Directory listing permission' },
  { pattern: /^WebSearch$/i, severity: 'low', score: 0, description: 'Web search permission' },
];

/**
 * Tool combination risks
 */
const TOOL_COMBINATIONS: { tools: string[]; extraScore: number; description: string }[] = [
  { tools: ['Read', 'WebFetch'], extraScore: 10, description: 'Read local files and potentially exfiltrate' },
  { tools: ['Grep', 'WebFetch'], extraScore: 10, description: 'Search sensitive info and potentially exfiltrate' },
  { tools: ['Read', 'Bash'], extraScore: 15, description: 'Read files and execute commands' },
  { tools: ['Write', 'Bash'], extraScore: 15, description: 'Write files and execute' },
];

/**
 * Rules Engine
 */
export class RulesEngine {
  private rules: Rule[];
  public version = '1.0.0';

  constructor() {
    this.rules = [...BUILTIN_RULES];
  }

  /**
   * Execute rule detection
   */
  check(skill: Skill, options?: { excludeRules?: string[] }): Issue[] {
    const issues: Issue[] = [];
    const excludeRules = new Set(options?.excludeRules || []);

    for (const rule of this.rules) {
      if (!rule.enabled || excludeRules.has(rule.id)) continue;

      // Use validator function for detection
      if (rule.validator) {
        const issue = rule.validator(skill);
        if (issue) {
          issues.push(issue);
        }
      }

      // Use patterns for detection (check body and frontmatter)
      if (rule.patterns) {
        const contentToCheck = skill.body + '\n' + JSON.stringify(skill.frontmatter);
        
        for (const pattern of rule.patterns) {
          const regex = typeof pattern === 'string' ? new RegExp(pattern, 'gi') : pattern;
          const match = regex.exec(contentToCheck);
          
          if (match) {
            // Find line number
            const lines = contentToCheck.split('\n');
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
              ruleName: rule.name,
              severity: rule.severity,
              category: rule.category,
              message: rule.message,
              suggestion: rule.suggestion,
              location: {
                line: lineNum,
                content: match[0].substring(0, 50),
              },
            });
            break; // Report each rule only once
          }
        }
      }
    }

    // Check tool risks
    if (skill.frontmatter.allowedTools) {
      const toolIssues = this.checkToolsRisk(skill.frontmatter.allowedTools);
      issues.push(...toolIssues);
    }

    return issues;
  }

  /**
   * Check tool configuration risks
   */
  checkToolsRisk(tools: string[]): Issue[] {
    const issues: Issue[] = [];
    let hasHighRiskTool = false;

    for (const tool of tools) {
      for (const risk of TOOL_RISKS) {
        const pattern = typeof risk.pattern === 'string' ? new RegExp(risk.pattern) : risk.pattern;
        if (pattern.test(tool)) {
          if (risk.severity === 'high') {
            hasHighRiskTool = true;
            issues.push({
              ruleId: 'TOOL001',
              ruleName: 'high_risk_tool',
              severity: 'high',
              category: 'tool',
              message: `High risk tool "${tool}": ${risk.description}`,
              suggestion: 'Use more precise permission restrictions',
            });
          } else if (risk.severity === 'medium' && risk.score > 0) {
            issues.push({
              ruleId: 'TOOL002',
              ruleName: 'medium_risk_tool',
              severity: 'medium',
              category: 'tool',
              message: `Medium risk tool "${tool}": ${risk.description}`,
              suggestion: 'Confirm if this permission is needed',
            });
          }
          break;
        }
      }
    }

    // Check tool combination risks
    for (const combo of TOOL_COMBINATIONS) {
      const hasAll = combo.tools.every(t => 
        tools.some(tool => tool.toLowerCase().includes(t.toLowerCase()))
      );
      if (hasAll) {
        issues.push({
          ruleId: 'TOOL003',
          ruleName: 'tool_combination_risk',
          severity: 'medium',
          category: 'tool',
          message: `Tool combination risk: ${combo.tools.join(' + ')} - ${combo.description}`,
          suggestion: 'Evaluate if these tools need to be used together',
        });
      }
    }

    return issues;
  }

  /**
   * Analyze tool risks (public API)
   */
  analyzeTools(tools: string[]): ToolCheckResult[] {
    const results: ToolCheckResult[] = [];

    for (const tool of tools) {
      let matched = false;
      for (const risk of TOOL_RISKS) {
        const pattern = typeof risk.pattern === 'string' ? new RegExp(risk.pattern) : risk.pattern;
        if (pattern.test(tool)) {
          results.push({
            tool,
            risk: risk.severity,
            score: risk.score,
            description: risk.description,
          });
          matched = true;
          break;
        }
      }
      if (!matched) {
        results.push({
          tool,
          risk: 'info' as Severity,
          score: 5,
          description: 'Unknown tool',
        });
      }
    }

    return results;
  }

  /**
   * Explain rule
   */
  explain(ruleId: string): string {
    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule) {
      return `Rule ${ruleId} not found`;
    }

    return `📖 Rule Explanation: ${rule.id} - ${rule.name}

❓ What is this?
${rule.description}

⚠️ Severity: ${rule.severity}
📂 Category: ${rule.category}

💬 Issue Description:
${rule.message}

✅ Suggestion:
${rule.suggestion || 'None'}`;
  }

  /**
   * Get all rules list
   */
  listRules(): { id: string; name: string; category: string; severity: string; enabled: boolean }[] {
    return this.rules.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      severity: r.severity,
      enabled: r.enabled,
    }));
  }

  /**
   * Get rule statistics
   */
  getRuleStats(): { total: number; byCategory: Record<string, number>; bySeverity: Record<string, number> } {
    const stats = {
      total: this.rules.length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
    };

    for (const rule of this.rules) {
      stats.byCategory[rule.category] = (stats.byCategory[rule.category] || 0) + 1;
      stats.bySeverity[rule.severity] = (stats.bySeverity[rule.severity] || 0) + 1;
    }

    return stats;
  }

  /**
   * Get tool risk configuration
   */
  getToolRisks(): ToolRisk[] {
    return [...TOOL_RISKS];
  }
}
