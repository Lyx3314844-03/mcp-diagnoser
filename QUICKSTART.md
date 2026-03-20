# MCP Diagnoser - 快速开始指南

## 🚀 5 分钟快速上手

### 1. 安装

```bash
cd C:\Users\Administrator\mcp-diagnoser
npm install -g .
```

### 2. 基本使用

```bash
# 诊断所有 MCP 服务器
mcp-diagnoser check

# 检查语言环境
mcp-diagnoser languages
```

## 📋 主要功能

### 🔍 诊断功能

```bash
# 完整诊断
mcp-diagnoser check

# 诊断特定服务器
mcp-diagnoser server playwright

# 详细模式
mcp-diagnoser check --verbose

# JSON 输出
mcp-diagnoser check --json
```

### 🔎 搜索 MCP 包

```bash
# 搜索 GitHub MCP 包
mcp-diagnoser search github

# 搜索 Playwright 相关
mcp-diagnoser search playwright

# 仅搜索 npm
mcp-diagnoser search python --source npm

# 仅搜索 GitHub
mcp-diagnoser search code --source github

# 查看热门包
mcp-diagnoser popular
```

### 🎭 Playwright 诊断

```bash
# 诊断 Playwright
mcp-diagnoser playwright

# 安装浏览器
mcp-diagnoser playwright-install

# 只安装 Chromium
mcp-diagnoser playwright-install --browsers chromium

# Linux 安装系统依赖
mcp-diagnoser playwright-install --with-deps
```

### 🌍 语言检查

```bash
# 检查所有 10 种语言
mcp-diagnoser languages

# JSON 格式
mcp-diagnoser languages --json
```

### 🛠️ 自动修复

```bash
# 自动修复所有问题
mcp-diagnoser fix-all

# 安装缺失的包
mcp-diagnoser install @playwright/mcp
```

## 📊 输出示例

### 诊断报告

```
════════════════════════════════════════════════════════════
  MCP Diagnoser - Diagnostic Report
════════════════════════════════════════════════════════════

📊 Summary
╔═══════════════╤════╗
║ Total Servers │ 29 ║
╟───────────────┼────╢
║ ✅ OK         │ 28 ║
╟───────────────┼────╢
║ ❌ Errors     │ 1  ║
╚═══════════════╧════╝

🔧 Language Runtimes
╔══════════╤════════╤══════════╤════════════════════════╗
║ Language │ Status │ Version  │ Path                   ║
╟──────────┼────────┼──────────┼────────────────────────╢
║ node     │ ✓      │ v22.22.1 │ C:\Program Files\...   ║
║ python   │ ✓      │ 3.13.12  │ C:\Program Files\...   ║
║ java     │ ✓      │ 25.0.2   │ C:\Program Files\...   ║
╚══════════╧════════╧══════════╧════════════════════════╝
```

### Playwright 诊断

```
════════════════════════════════════════════════════════════
  Playwright Diagnosis
════════════════════════════════════════════════════════════

✓ Playwright installed Version 1.58.2

🌐 Browsers:
  ✗ chromium
  ✗ firefox
  ✗ webkit

⚠️  Issues:
  • chromium browser is not installed
  • firefox browser is not installed
  • webkit browser is not installed
```

## 🎯 常见用例

### 用例 1: 新机器设置

```bash
# 1. 检查语言环境
mcp-diagnoser languages

# 2. 诊断现有 MCP 配置
mcp-diagnoser check

# 3. 搜索并安装需要的包
mcp-diagnoser search github
mcp-diagnoser install @playwright/mcp

# 4. 安装 Playwright 浏览器
mcp-diagnoser playwright-install
```

### 用例 2: 故障排查

```bash
# 1. 运行详细诊断
mcp-diagnoser check --verbose

# 2. 查看特定服务器问题
mcp-diagnoser server <problematic-server>

# 3. 自动修复
mcp-diagnoser fix-all
```

### 用例 3: 查找新工具

```bash
# 1. 查看热门包
mcp-diagnoser popular

# 2. 搜索特定功能
mcp-diagnoser search scraping
mcp-diagnoser search code-review

# 3. 安装找到的包
mcp-diagnoser install firecrawl-mcp
```

## 🔧 作为 MCP 服务器使用

在 `.mcp.json` 中添加：

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "node",
      "args": ["C:/Users/Administrator/mcp-diagnoser/server/dist/server.js"]
    }
  }
}
```

### 可用工具

1. **diagnose_all** - 诊断所有 MCP 服务器
2. **diagnose_server** - 诊断特定服务器
3. **check_all_languages** - 检查 10 种语言运行时
4. **search_mcp_packages** - 搜索 MCP 包
5. **get_popular_mcp_packages** - 获取热门包
6. **install_mcp_package** - 安装包
7. **diagnose_playwright** - 诊断 Playwright
8. **install_playwright_browsers** - 安装浏览器

## 📝 支持的编程语言

✅ JavaScript/TypeScript (Node.js)
✅ Python
✅ Java
✅ Go
✅ Rust
✅ C#/.NET
✅ Ruby
✅ PHP
✅ Swift
✅ Kotlin

## 💡 提示

1. **首次运行**: 建议先运行 `mcp-diagnoser languages` 检查环境
2. **定期诊断**: 使用 `mcp-diagnoser check` 定期检查 MCP 服务器状态
3. **搜索技巧**: 使用简短关键词搜索，如 `github` 而非 `github mcp server`
4. **Playwright**: 在 Linux 上使用 `--with-deps` 自动安装系统依赖

## 🐛 遇到问题？

```bash
# 查看详细错误
mcp-diagnoser check --verbose

# 检查特定服务器
mcp-diagnoser server <name>

# JSON 输出用于调试
mcp-diagnoser check --json
```

## 📚 更多资源

- 完整文档：README_zh.md
- GitHub: https://github.com/your-repo/mcp-diagnoser
- 报告问题：https://github.com/your-repo/mcp-diagnoser/issues
