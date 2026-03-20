# MCP Diagnoser - 使用示例库

**作者**: Lan <3314844@gmail.com>  
**版本**: 1.3.0

---

## 📋 目录

1. [基础示例](#基础示例)
2. [诊断示例](#诊断示例)
3. [包管理示例](#包管理示例)
4. [搜索示例](#搜索示例)
5. [MCP 工具示例](#mcp 工具示例)
6. [自动化示例](#自动化示例)

---

## 🔰 基础示例

### 1. 查看版本

```bash
mcp-diagnoser --version
# 输出：1.3.0
```

### 2. 查看帮助

```bash
mcp-diagnoser --help
# 输出：所有可用命令和选项
```

### 3. 详细模式

```bash
mcp-diagnoser check --verbose
# 输出：详细的诊断信息
```

### 4. JSON 输出

```bash
mcp-diagnoser check --json
# 输出：JSON 格式的诊断报告
```

---

## 🔍 诊断示例

### 1. 诊断所有 MCP 服务器

```bash
mcp-diagnoser check
```

**输出示例**:
```
════════════════════════════════════════════════════════════
  MCP Diagnoser - Diagnostic Report
════════════════════════════════════════════════════════════

📊 Summary
  Total Servers: 33
  ✅ OK: 32
  ⚠️  Warnings: 0
  ❌ Errors: 1

🔧 Language Runtimes
  node: ✓ v22.22.1
  python: ✓ 3.13.12
  java: ✓ 25.0.2

🔍 Server Diagnostics
  ✓ DrissionPageMCP
  ✓ diagnoser
  ✗ pipedream-remote
    → Command not found
```

### 2. 诊断特定服务器

```bash
mcp-diagnoser server playwright
```

**输出示例**:
```
✓ playwright
  Runtime: node
  Command Found: Yes
  Dependencies OK: No
  
  Issues:
    ⚠️ [package] @playwright/mcp browsers not installed
```

### 3. 检查所有语言

```bash
mcp-diagnoser languages
```

**输出示例**:
```
╔══════════╤════════╤══════════╤═════════════════════════╗
║ Language │ Status │ Version  │ Path                    ║
╟──────────┼────────┼──────────┼─────────────────────────╢
║ node     │ ✓      │ v22.22.1 │ C:\Program Files\nodejs ║
╟──────────┼────────┼──────────┼─────────────────────────╢
║ python   │ ✓      │ 3.13.12  │ C:\Python313\python.exe ║
╟──────────┼────────┼──────────┼─────────────────────────╢
║ java     │ ✓      │ 25.0.2   │ C:\Java\jdk\bin\java    ║
╚══════════╧════════╧══════════╧═════════════════════════╝
```

### 4. 自动修复所有问题

```bash
mcp-diagnoser fix-all
```

**输出示例**:
```
🔧 Applying automatic fixes...

  Running: npx playwright install
  ✓ Fix applied successfully

Fix application complete.
```

---

## 📦 包管理示例

### 1. 诊断所有包

```bash
mcp-diagnoser packages
```

**输出示例**:
```
📦 Package Status
  Total Packages: 33
  ✅ Installed: 33
  ❌ Missing: 0
```

### 2. 诊断特定包

```bash
mcp-diagnoser package @playwright/mcp
```

**输出示例**:
```
✓ Status: Installed
   Version: on-demand
```

### 3. 检查包管理器

```bash
mcp-diagnoser package-managers
```

**输出示例**:
```
✓ npm        10.9.4
✓ pnpm       10.32.1
✓ pip        26.0.1
✓ cargo      1.94.0
✓ go         1.26.1
```

### 4. 安装缺失的包

```bash
mcp-diagnoser install-missing
```

**输出示例**:
```
Packages to install:
  • @playwright/mcp
  • requests

Continue installation? (y/n): y

Installing @playwright/mcp... ✓
Installing requests... ✓

Successfully installed: 2
```

### 5. 使用特定包管理器

```bash
mcp-diagnoser package requests -m pip
```

---

## 🔎 搜索示例

### 1. 搜索 MCP 包

```bash
mcp-diagnoser search github
```

**输出示例**:
```
Found 2536 packages

  @modelcontextprotocol/server-github
    GitHub's Official MCP Server
    Downloads: 28024
```

### 2. 搜索特定包

```bash
mcp-diagnoser search playwright
```

### 3. 仅搜索 npm

```bash
mcp-diagnoser search mcp --source npm
```

### 4. 仅搜索 GitHub

```bash
mcp-diagnoser search mcp --source github
```

### 5. 限制结果数量

```bash
mcp-diagnoser search mcp --limit 5
```

### 6. 查看热门包

```bash
mcp-diagnoser popular
```

**输出示例**:
```
Popular MCP Packages

  @modelcontextprotocol/server-github
    Version: 2025.4.8

  @playwright/mcp
    Version: 0.0.68

  firecrawl-mcp
    Version: 3.11.0
```

### 7. 安装包

```bash
mcp-diagnoser install @playwright/mcp
```

### 8. 全局安装

```bash
mcp-diagnoser install @playwright/mcp --global
```

---

## 🌐 网络工具示例

### 1. 网络搜索

```bash
# 使用 Google 搜索
mcp-diagnoser web-search "MCP protocol" --engine google

# 使用 Bing 搜索
mcp-diagnoser web-search "AI tools" --engine bing

# 限制结果数量
mcp-diagnoser web-search "MCP" --limit 5

# 设置时间范围
mcp-diagnoser web-search "AI news" --time-range past_week
```

### 2. 爬取网站

```bash
# 基本爬取
mcp-diagnoser crawl https://example.com

# 限制页数
mcp-diagnoser crawl https://example.com --max-pages 10

# 限制深度
mcp-diagnoser crawl https://example.com --max-depth 2

# 允许外部链接
mcp-diagnoser crawl https://example.com --allow-external
```

### 3. 搜索网站内容

```bash
# 搜索内容
mcp-diagnoser search-content https://example.com "API"

# 使用正则表达式
mcp-diagnoser search-content https://example.com "v\d+\.\d+" --regex

# 显示上下文
mcp-diagnoser search-content https://example.com "keyword" --context 3
```

### 4. 提取网站信息

```bash
# 提取所有信息
mcp-diagnoser extract-info https://example.com --all

# 仅提取邮箱
mcp-diagnoser extract-info https://example.com --emails

# 提取邮箱和电话
mcp-diagnoser extract-info https://example.com --emails --phones

# 提取链接
mcp-diagnoser extract-info https://example.com --links
```

---

## 🎭 Playwright 示例

### 1. 诊断 Playwright

```bash
mcp-diagnoser playwright
```

**输出示例**:
```
✓ Playwright installed Version 1.58.2

🌐 Browsers:
  ✓ chromium
  ✗ firefox
  ✗ webkit
```

### 2. 安装浏览器

```bash
# 安装所有浏览器
mcp-diagnoser playwright-install

# 安装特定浏览器
mcp-diagnoser playwright-install --browsers chromium,firefox

# Linux 安装系统依赖
mcp-diagnoser playwright-install --with-deps
```

---

## 🤖 MCP 工具示例

### 1. 诊断所有服务器 (MCP)

```json
{
  "name": "diagnose_all",
  "arguments": {}
}
```

**返回**:
```json
{
  "summary": {
    "total": 33,
    "ok": 32,
    "error": 1
  },
  "servers": [...]
}
```

### 2. 诊断特定服务器 (MCP)

```json
{
  "name": "diagnose_server",
  "arguments": {
    "serverName": "playwright"
  }
}
```

### 3. 检查语言 (MCP)

```json
{
  "name": "check_language",
  "arguments": {
    "language": "python"
  }
}
```

### 4. 检查所有语言 (MCP)

```json
{
  "name": "check_all_languages",
  "arguments": {}
}
```

### 5. 搜索 MCP 包 (MCP)

```json
{
  "name": "search_mcp_packages",
  "arguments": {
    "query": "github",
    "limit": 10
  }
}
```

### 6. 网络搜索 (MCP)

```json
{
  "name": "web_search",
  "arguments": {
    "query": "MCP protocol",
    "engine": "google",
    "limit": 10
  }
}
```

### 7. 爬取网站 (MCP)

```json
{
  "name": "crawl_website",
  "arguments": {
    "url": "https://example.com",
    "maxPages": 20,
    "maxDepth": 3
  }
}
```

### 8. 提取网站信息 (MCP)

```json
{
  "name": "extract_website_info",
  "arguments": {
    "url": "https://example.com",
    "extractEmails": true,
    "extractPhones": true
  }
}
```

---

## ⚡ 自动化示例

### 1. CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Test
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install mcp-diagnoser
        run: npm install -g mcp-diagnoser
      - name: Run diagnosis
        run: mcp-diagnoser check --json > report.json
```

### 2. 定期健康检查脚本

```bash
#!/bin/bash
# health-check.sh

echo "Running MCP health check..."
mcp-diagnoser check --json > health-$(date +%Y%m%d).json

if [ $? -ne 0 ]; then
  echo "Issues found! Check report."
  exit 1
else
  echo "All healthy!"
  exit 0
fi
```

### 3. 自动安装脚本

```bash
#!/bin/bash
# setup-mcp.sh

echo "Setting up MCP environment..."

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install mcp-diagnoser
npm install -g mcp-diagnoser

# Diagnose and fix
mcp-diagnoser check
mcp-diagnoser install-missing --force

echo "Setup complete!"
```

### 4. 批量诊断脚本

```bash
#!/bin/bash
# batch-diagnose.sh

for server in github playwright puppeteer; do
  echo "Diagnosing $server..."
  mcp-diagnoser server $server --json >> reports.json
done
```

---

## 📊 输出格式示例

### JSON 输出

```bash
mcp-diagnoser check --json
```

**输出**:
```json
{
  "timestamp": "2026-03-20T12:00:00Z",
  "summary": {
    "total": 33,
    "ok": 32,
    "warning": 0,
    "error": 1
  },
  "servers": [
    {
      "name": "github",
      "status": "ok",
      "issues": []
    }
  ],
  "languageRuntimes": {
    "node": {
      "available": true,
      "version": "v22.22.1"
    }
  }
}
```

### 表格输出

```bash
mcp-diagnoser languages
```

**输出**: 格式化的表格（见上方）

---

## 📞 更多帮助

查看完整文档：
- [README.md](README.md) - 主文档
- [WHAT_MCP_CAN_DO.md](WHAT_MCP_CAN_DO.md) - 功能展示
- [MCP_SERVER_GUIDE.md](MCP_SERVER_GUIDE.md) - MCP 指南

---

**最后更新**: 2026-03-20  
**版本**: 1.3.0
