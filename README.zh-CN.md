# 🛡️ Skills Guard

> Anthropic Agent Skills 安全检测工具

[English](./README.md) | **[简体中文](./README.zh-CN.md)**

[![NPM Version](https://img.shields.io/npm/v/skills-guard)](https://www.npmjs.com/package/skills-guard)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/node/v/skills-guard)](package.json)

**文档：** [安全标准](./SECURITY_STANDARD.md) | [贡献指南](./CONTRIBUTING.md) | [更新日志](./CHANGELOG.md)

Skills Guard 是一个专门为 **Anthropic Agent Skills 规范** 设计的安全检测工具，帮助开发者和用户识别 Skill 中的潜在安全风险。

## ✨ 特性

- 🔍 **5 层深度检测** - 格式合规 → Prompt 安全 → 工具风险 → 资源安全 → 行为分析
- 📊 **62+ 检测规则** - 覆盖注入攻击、敏感信息、危险命令等主流风险
- 🎯 **量化评分** - 0-100 分直观呈现风险等级
- 🔌 **多形态支持** - CLI / MCP Server / REST API / SDK / IDE Plugin

## 📦 安装

### CLI 命令行工具

```bash
# 全局安装
npm install -g skills-guard

# 或使用 npx
npx skills-guard scan ./my-skill
```

### MCP Server

```bash
# 直接运行
npx skills-guard-mcp

# 或全局安装
npm install -g skills-guard-mcp
skills-guard-mcp
```

### REST API Server

```bash
# 启动服务
npx skills-guard-server

# 自定义端口
npx skills-guard-server -p 8080

# 启用 API 认证
npx skills-guard-server -k your-api-key
```

### SDK 客户端

```bash
npm install @skills-guard/sdk
```

### Core 核心库

```bash
npm install @skills-guard/core
```

## 🚀 快速开始

### CLI 使用

```bash
# 扫描 Skill 目录
sg scan ./my-skill

# 扫描单个 SKILL.md 文件
sg scan ./my-skill/SKILL.md

# 验证格式合规性
sg validate ./my-skill

# 检查工具配置风险
sg check-tools "Bash(*)" Read Write WebFetch

# 查看所有规则
sg rules

# 解释特定规则
sg explain INJ001

# 输出为 JSON（供 AI Agent 消费）
sg scan ./my-skill --format json
```

### SDK 使用

```typescript
import { SkillsGuardClient, quickCheck } from '@skills-guard/sdk';

// 创建客户端
const client = new SkillsGuardClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key', // 可选
});

// 扫描 Skill
const result = await client.scan(skillContent);
console.log(`安全评分: ${result.score}/100`);
console.log(`风险等级: ${result.level}`);

// 快速检查
const check = await client.quickCheck(skillContent);
if (check.safe) {
  console.log('Skill 安全！');
}

// 检查工具风险
const tools = await client.checkTools('Bash(git:*) Read WebFetch');
console.log(`总扣分: ${tools.totalScore}`);
```

### REST API 使用

```bash
# 扫描 Skill
curl -X POST http://localhost:3000/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"content": "---\nname: test\ndescription: Test skill\n---\n\n# Test"}'

# 检查工具风险
curl -X POST http://localhost:3000/api/v1/check-tools \
  -H "Content-Type: application/json" \
  -d '{"tools": "Bash(git:*) Read Write"}'

# 获取规则列表
curl http://localhost:3000/api/v1/rules

# API 文档
open http://localhost:3000/docs
```

### Core 库使用

```typescript
import { SkillsGuardScanner } from '@skills-guard/core';

const scanner = new SkillsGuardScanner();

// 扫描内容
const result = await scanner.scan(skillContent);
console.log(`安全评分: ${result.score}/100`);
console.log(`风险等级: ${result.level}`);
console.log(`问题数量: ${result.issues.length}`);

// 检查工具风险
const toolRisks = scanner.checkTools(['Bash(*)', 'Read', 'Write']);
```

### MCP 配置

在 Claude Desktop / Cursor / CodeBuddy 中配置：

```json
{
  "mcpServers": {
    "skills-guard": {
      "command": "npx",
      "args": ["skills-guard-mcp"]
    }
  }
}
```

## 📋 检测能力

### 规则分布

| 层级 | 类别 | 规则数 | 示例 |
|------|------|--------|------|
| Layer 0 | 格式合规 | 11 | 缺少 name/description、命名不规范 |
| Layer 1 | Prompt 注入 | 5 | "忽略之前的指令"、系统指令注入 |
| Layer 1 | 敏感信息 | 5 | API Key、私钥、硬编码密码 |
| Layer 1 | 危险命令 | 6 | `rm -rf /`、磁盘格式化 |
| Layer 1 | 内容合规 | 5 | 非法内容、仇恨言论、暴力内容 |
| Layer 2 | 工具风险 | 15+ | `Bash(*)`、工具组合风险 |
| Layer 3 | 路径安全 | 10 | SSH 密钥、AWS 凭据、浏览器数据 |
| Layer 3 | URL 安全 | 5 | 非 HTTPS、IP 直连、可疑域名 |
| Layer 3 | 脚本安全 | 5 | 子进程调用、远程执行、环境变量 |
| Layer 4 | 行为分析 | 10 | 数据收集、持久化、暴力破解 |

### 评分算法

```
基础分 = 100

扣分规则：
- 每个 🔴 高危问题：-30 分
- 每个 🟠 中危问题：-15 分  
- 每个 🟡 低危问题：-5 分

风险等级判定：
- 90-100 → 🟢 安全
- 70-89  → 🟡 低风险
- 40-69  → 🟠 中风险
- 0-39   → 🔴 高风险
```

## 🛠️ CLI 命令

| 命令 | 说明 |
|------|------|
| `sg scan <path>` | 扫描 Skill 安全风险 |
| `sg validate <path>` | 格式合规性校验 |
| `sg check-tools <tools...>` | 工具配置风险分析 |
| `sg rules` | 列出所有检测规则 |
| `sg explain <ruleId>` | 解释规则详情 |
| `sg quick` | 从 stdin 快速扫描 |

### 扫描选项

```bash
sg scan ./skill [options]

Options:
  -f, --format <format>   输出格式 (json|text|markdown)
  -o, --output <file>     输出到文件
  --min-score <score>     最低通过分数（不通过返回 exit 1）
  --exclude <rules>       排除的规则 ID，逗号分隔
  --layers <layers>       检测层级，逗号分隔 (0,1,2,3,4)
  --no-scripts            不扫描 scripts/ 目录
  -q, --quiet             简洁输出
```

## 🔌 MCP 工具

| 工具 | 说明 |
|------|------|
| `scan_skill` | 扫描 Skill 内容 |
| `scan_file` | 扫描本地文件/目录 |
| `validate_skill` | 格式合规性校验 |
| `check_tools` | 工具配置风险分析 |
| `explain_issue` | 解释安全规则 |
| `suggest_fix` | 生成修复建议 |

## 📁 项目结构

```
packages/
├── core/           # @skills-guard/core - 核心引擎
│   ├── src/
│   │   ├── types.ts       # 类型定义
│   │   ├── parser.ts      # Skill 解析器
│   │   ├── rules/         # 规则引擎 (62+ 规则)
│   │   ├── scanner.ts     # 主扫描器
│   │   ├── scorer.ts      # 评分器
│   │   └── reporter.ts    # 报告生成器
│   └── tests/             # 单元测试
│
├── cli/            # skills-guard - CLI 工具
│   └── src/index.ts
│
├── mcp/            # skills-guard-mcp - MCP Server
│   └── src/index.ts
│
├── server/         # @skills-guard/server - REST API
│   ├── src/
│   │   ├── index.ts       # Express 应用
│   │   ├── routes.ts      # API 路由
│   │   ├── middleware.ts  # 中间件
│   │   └── openapi.ts     # Swagger 文档
│   └── tests/
│
├── sdk/            # @skills-guard/sdk - 客户端 SDK
│   └── src/
│       ├── client.ts      # HTTP 客户端
│       └── types.ts       # 类型定义
│
└── plugin-claude/  # Claude Code Plugin
    ├── .claude-plugin/
    ├── commands/          # 斜杠命令
    ├── hooks/             # 安全检测 Hook
    ├── agents/            # 安全分析 Agent
    └── skills/            # 安全知识库
```

## 🧪 开发

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 运行测试
pnpm test

# 本地测试 CLI
node packages/cli/dist/index.js scan examples/safe-skill
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

- 发现漏报/误报？[提交 Issue](https://github.com/skills-guard/skills-guard/issues)
- 想添加新规则？查看 [贡献指南](CONTRIBUTING.md)

---

Made with ❤️ by Skills Guard Team
