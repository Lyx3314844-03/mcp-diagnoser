# MCP Diagnoser - Qwen CLI 配置指南

## ✅ 配置完成

MCP Diagnoser 已成功添加到 Qwen CLI 配置中！

## 📍 配置位置

配置文件：`C:\Users\Administrator\.qwen\settings.json`

配置内容：
```json
{
  "mcp-diagnoser": {
    "command": "node",
    "args": ["C:\\Users\\Administrator\\mcp-diagnoser\\server\\dist\\server.js"],
    "description": "MCP 诊断工具 - 支持 10 种语言、包搜索、浏览器搜索、网站爬取"
  }
}
```

## 🚀 使用方法

### 1. 重启 Qwen CLI

配置完成后，需要重启 Qwen CLI 以加载新的 MCP 服务器。

### 2. 可用工具

MCP Diagnoser 提供以下 **8 个工具**：

#### 🔍 诊断工具

**diagnose_all** - 诊断所有 MCP 服务器
```
诊断所有已配置的 MCP 服务器，检查安装、依赖、连接和配置问题
```

**diagnose_server** - 诊断特定服务器
```
参数：serverName (必需)
示例：诊断 "playwright" 服务器
```

**check_all_languages** - 检查所有语言运行时
```
检查 10 种编程语言环境：
- JavaScript/TypeScript (Node.js)
- Python
- Java
- Go
- Rust
- C#/.NET
- Ruby
- PHP
- Swift
- Kotlin
```

#### 🔎 搜索工具

**search_mcp_packages** - 搜索 MCP 包
```
参数：
- query (必需): 搜索关键词
- source (可选): npm, github, 或 all (默认：all)
- limit (可选): 结果数量 (默认：20)

示例：搜索 "github" 相关的 MCP 包
```

**get_popular_mcp_packages** - 获取热门 MCP 包
```
参数：
- limit (可选): 结果数量 (默认：30)

返回官方和流行的 MCP 包列表
```

**install_mcp_package** - 安装 MCP 包
```
参数：
- packageName (必需): 包名称
- global (可选): 全局安装 (默认：false)

示例：安装 "@playwright/mcp"
```

#### 🌐 浏览器工具

**diagnose_playwright** - 诊断 Playwright
```
检查 Playwright 安装状态和浏览器配置
```

**install_playwright_browsers** - 安装 Playwright 浏览器
```
参数：
- browsers (可选): 浏览器列表 (默认：["chromium", "firefox", "webkit"])
- withDeps (可选): 安装系统依赖 (默认：false)
```

## 💡 使用示例

### 示例 1: 诊断所有 MCP 服务器

```
请帮我诊断所有 MCP 服务器，看看有什么问题
```

### 示例 2: 检查语言环境

```
检查所有编程语言运行时是否安装
```

### 示例 3: 搜索 MCP 包

```
搜索 GitHub 相关的 MCP 包
```

### 示例 4: 诊断 Playwright

```
诊断 Playwright 是否正常安装
```

### 示例 5: 安装 MCP 包

```
帮我安装 @playwright/mcp 包
```

## 📊 工具输出

### 诊断报告示例

```json
{
  "summary": {
    "total": 30,
    "ok": 28,
    "warning": 1,
    "error": 1
  },
  "servers": [...],
  "languageRuntimes": {
    "node": {"available": true, "version": "v22.22.1"},
    "python": {"available": true, "version": "3.13.12"},
    ...
  }
}
```

### 搜索结果示例

```json
{
  "query": "github",
  "total": 2536,
  "packages": [
    {
      "name": "github/github-mcp-server",
      "description": "GitHub's Official MCP Server",
      "downloads": 28024
    },
    ...
  ]
}
```

## 🔧 命令行使用

除了通过 Qwen CLI 使用，你还可以直接使用命令行：

```bash
cd C:\Users\Administrator\mcp-diagnoser

# 诊断所有服务器
node dist/index.js check

# 检查语言
node dist/index.js languages

# 搜索 MCP 包
node dist/index.js search github

# 网页搜索
node dist/index.js web-search "AI tutorial" -e google

# 爬取网站
node dist/index.js crawl https://example.com

# 提取信息
node dist/index.js extract-info https://example.com --emails --phones
```

## 📋 完整命令列表

### CLI 命令

```
诊断命令:
  check                    诊断所有 MCP 服务器
  server <name>            诊断特定服务器
  languages                检查语言运行时
  fix-all                  自动修复问题

搜索命令:
  search <query>           搜索 MCP 包
  popular                  热门包列表
  install <package>        安装包
  web-search <query>       全网搜索
  search-engines           列出搜索引擎
  crawl <url>              爬取网站
  search-content <url>     搜索网站内容
  extract-info <url>       提取网站信息

Playwright 命令:
  playwright               诊断 Playwright
  playwright-install       安装浏览器
```

### MCP 工具

```
1. diagnose_all
2. diagnose_server
3. check_all_languages
4. search_mcp_packages
5. get_popular_mcp_packages
6. install_mcp_package
7. diagnose_playwright
8. install_playwright_browsers
```

## 🐛 故障排除

### 问题 1: MCP 服务器未加载

**解决方案**:
1. 重启 Qwen CLI
2. 检查配置文件语法是否正确
3. 确认路径 `C:\Users\Administrator\mcp-diagnoser\server\dist\server.js` 存在

### 问题 2: 工具不可用

**解决方案**:
```bash
# 重新编译
cd C:\Users\Administrator\mcp-diagnoser\server
npm run build

# 测试服务器
node dist/server.js
```

### 问题 3: 诊断失败

**解决方案**:
```bash
# 检查 MCP 配置
node dist/index.js check --verbose

# 查看错误详情
```

## 📚 更多资源

- **README_zh.md** - 完整中文文档
- **QUICKSTART.md** - 快速开始指南
- **BROWSER_SEARCH_FEATURES.md** - 浏览器搜索功能
- **ENHANCEMENT_SUMMARY.md** - 增强功能总结

## ✨ 功能亮点

1. **10 种语言支持** - JavaScript, Python, Java, Go, Rust, C#, Ruby, PHP, Swift, Kotlin
2. **15+ 搜索引擎** - Google, Bing, Baidu, DuckDuckGo, GitHub, Stack Overflow 等
3. **网站爬取** - 自动爬取网站并搜索内容
4. **信息提取** - 提取邮箱、电话、链接等
5. **MCP 包管理** - 搜索、安装 MCP 包
6. **Playwright 诊断** - 专业的 Playwright 诊断和安装

---

**配置日期**: 2026-03-18  
**版本**: v1.2.0  
**状态**: ✅ 已配置并测试通过
