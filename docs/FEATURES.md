# MCP Diagnoser 完整功能说明文档

## 📖 目录

1. [概述](#概述)
2. [核心功能](#核心功能)
3. [CLI 命令详解](#cli-命令详解)
4. [MCP 服务器功能](#mcp 服务器功能)
5. [搜索功能](#搜索功能)
6. [包管理功能](#包管理功能)
7. [Playwright 功能](#playwright 功能)
8. [使用示例](#使用示例)
9. [最佳实践](#最佳实践)

---

## 🎯 概述

**MCP Diagnoser** 是一个全面的 MCP (Model Context Protocol) 服务器诊断工具，提供以下核心能力：

- 🔍 **多引擎搜索**: Google, Bing, Baidu, DuckDuckGo 等
- 🕷️ **网页爬虫**: 智能爬取和 content 提取
- 📦 **包管理**: 支持 12 种包管理器
- 🌐 **语言检测**: 10 种编程语言环境检查
- 🛠️ **自动修复**: 智能诊断和修复建议
- 🎭 **Playwright**: 浏览器自动化和测试

---

## 🔧 核心功能

### 1. MCP 服务器诊断

#### 功能列表

| 功能 | 描述 | CLI 命令 | MCP Tool |
|------|------|----------|----------|
| **全面诊断** | 诊断所有 MCP 服务器 | `check` | `diagnose_all` |
| **单服务器诊断** | 诊断特定服务器 | `server <name>` | `diagnose_server` |
| **自动修复** | 修复检测到的问题 | `fix-all` | `fix_server` |
| **深度扫描** | 执行深度诊断 | `check --deep` | - |
| **快速模式** | 跳过包和运行时检查 | `check --fast` | - |

#### 诊断内容

- ✅ **安装检查**: 检测命令是否存在、PATH 配置
- ✅ **依赖检查**: npm/Python/Java 包依赖验证
- ✅ **连接检查**: 服务器连通性测试
- ✅ **配置检查**: MCP 配置文件验证
- ✅ **运行时检查**: 10 种编程语言运行时
- ✅ **权限检查**: 文件权限问题检测
- ✅ **包检查**: 12 种包管理器支持

---

### 2. 编程语言支持

支持检测以下 **10 种** 编程语言：

| 语言 | 检测内容 | 状态 |
|------|----------|------|
| **JavaScript/TypeScript** | Node.js, npm, npx, yarn, pnpm | ✅ |
| **Python** | python, python3, pip, pip3 | ✅ |
| **Java** | java, javac, mvn, gradle | ✅ |
| **Go** | go, gofmt | ✅ |
| **Rust** | rustc, cargo, rustup | ✅ |
| **C#/.NET** | dotnet, csc, msbuild | ✅ |
| **Ruby** | ruby, gem, bundle | ✅ |
| **PHP** | php, composer | ✅ |
| **Swift** | swift, swiftc | ✅ |
| **Kotlin** | kotlinc, kotlin | ✅ |

#### 使用示例

```bash
# 检查所有语言
mcp-diagnoser languages

# 检查特定语言
mcp-diagnoser -l python languages

# 深度检查
mcp-diagnoser languages --deep
```

---

### 3. 包管理功能

#### 支持的包管理器 (12 种)

| 包管理器 | 语言/平台 | 诊断命令 |
|----------|-----------|----------|
| **npm** | JavaScript/Node.js | `diagnose_package` |
| **yarn** | JavaScript | `diagnose_package` |
| **pnpm** | JavaScript | `diagnose_package` |
| **pip** | Python 2 | `diagnose_package` |
| **pip3** | Python 3 | `diagnose_package` |
| **uv** | Python (现代) | `diagnose_package` |
| **uvx** | Python (现代) | `diagnose_package` |
| **cargo** | Rust | `diagnose_package` |
| **go** | Go | `diagnose_package` |
| **dotnet** | C#/.NET | `diagnose_package` |
| **gem** | Ruby | `diagnose_package` |
| **composer** | PHP | `diagnose_package` |

#### 功能特性

- ✅ **状态检测**: 已安装/缺失检测
- ✅ **依赖分析**: 版本冲突和 peer 依赖检查
- ✅ **错误分析**: 安装失败自动诊断
- ✅ **一键安装**: 自动安装缺失包

#### 使用示例

```bash
# 诊断所有包
mcp-diagnoser packages

# 诊断特定包
mcp-diagnoser package playwright

# 指定包管理器
mcp-diagnoser package -m pip pandas

# 安装缺失包
mcp-diagnoser install-missing

# 列出包管理器
mcp-diagnoser package-managers
```

---

## 🔍 搜索功能

### 1. 多引擎搜索

#### 支持的搜索引擎

| 引擎 | CLI 名称 | 特点 |
|------|----------|------|
| **Google** | `google` | 全球最大搜索引擎 |
| **Bing** | `bing` | 微软搜索引擎 |
| **Baidu** | `baidu` | 中文搜索 |
| **DuckDuckGo** | `duckduckgo` | 隐私保护搜索 |
| **Yahoo** | `yahoo` | 综合门户搜索 |
| **X (Twitter)** | `x` | 社交媒体搜索 |
| **Reddit** | `reddit` | 社区讨论搜索 |
| **GitHub** | `github` | 代码仓库搜索 |
| **YouTube** | `youtube` | 视频搜索 |
| **arXiv** | `arxiv` | 学术论文搜索 |
| **微信** | `wechat` | 中文内容搜索 |
| **Bilibili** | `bilibili` | 中文视频搜索 |
| **IMDb** | `imdb` | 电影数据库 |
| **Wikipedia** | `wikipedia` | 百科全书 |

#### 搜索命令

```bash
# 基本搜索
mcp-diagnoser search "MCP server"

# 指定来源
mcp-diagnoser search "MCP" -s npm

# 限制结果数
mcp-diagnoser search "MCP" -n 10

# 搜索所有来源
mcp-diagnoser search "MCP" -s all
```

---

### 2. 高级搜索功能

#### multi-search (多引擎同时搜索)

同时在多个搜索引擎中搜索，获取更全面的结果。

```bash
# 同时使用 Google 和 Bing 搜索
mcp-diagnoser multi-search "AI tools" -e google,bing

# 自定义参数
mcp-diagnoser multi-search "TypeScript" \
  --engines google,bing,duckduckgo \
  --limit 30 \
  --sort-by relevance
```

**参数说明**:
- `--engines`: 逗号分隔的引擎列表
- `--limit`: 最大结果数
- `--max-per-engine`: 每个引擎的最大结果
- `--sort-by`: 排序方式 (relevance, date, engine, position)
- `--timeout`: 每个引擎的超时时间 (ms)

#### smart-search (智能搜索)

自动选择最适合的搜索引擎。

```bash
# 自动模式
mcp-diagnoser smart-search "React hooks tutorial"

# 指定查询类型
mcp-diagnoser smart-search "Python async await" --query-type code

# 新闻搜索
mcp-diagnoser smart-search "AI breakthrough" --query-type news
```

**支持的查询类型**:
- `general`: 一般查询
- `code`: 代码和技术
- `academic`: 学术论文
- `news`: 新闻资讯
- `video`: 视频内容
- `auto`: 自动识别

---

### 3. 网页爬虫

#### crawl (爬取网站)

```bash
# 基本爬取
mcp-diagnoser crawl https://example.com

# 自定义参数
mcp-diagnoser crawl https://docs.example.com \
  --max-pages 50 \
  --max-depth 5 \
  --exclude "login,admin"
```

**参数说明**:
- `--max-pages`: 最大爬取页面数 (默认 20)
- `--max-depth`: 最大爬取深度 (默认 3)
- `--same-domain`: 仅爬取同域名 (默认 true)
- `--exclude`: 排除的 URL 模式

#### search-content (搜索网站内容)

在已爬取的网站中搜索特定内容。

```bash
# 搜索网站内容
mcp-diagnoser search-content https://docs.example.com "API endpoint"

# 正则表达式搜索
mcp-diagnoser search-content https://docs.example.com "function\s+\w+" --regex

# 全词匹配
mcp-diagnoser search-content https://docs.example.com "authentication" --whole-word
```

#### extract-info (提取网站信息)

从网站提取结构化信息。

```bash
# 提取所有信息
mcp-diagnoser extract-info https://example.com --all

# 仅提取邮箱
mcp-diagnoser extract-info https://example.com --emails

# 提取电话和链接
mcp-diagnoser extract-info https://example.com --phones --links
```

---

### 4. Firecrawl 搜索

使用 Firecrawl API 进行更智能的搜索。

```bash
# 基本搜索
mcp-diagnoser firecrawl-search "MCP protocol"

# 自定义参数
mcp-diagnoser firecrawl-search "TypeScript tutorial" \
  --limit 15 \
  --lang en \
  --country us
```

---

## 🎭 Playwright 功能

### Playwright 诊断

```bash
# 检查 Playwright 安装状态
mcp-diagnoser playwright

# 深度检查
mcp-diagnoser playwright --deep
```

**检测内容**:
- ✅ Playwright 安装状态
- ✅ 浏览器状态 (Chromium/Firefox/WebKit)
- ✅ 配置文件检查
- ✅ 系统依赖 (Linux)

### Playwright 浏览器安装

```bash
# 安装所有浏览器
mcp-diagnoser playwright-install

# 安装特定浏览器
mcp-diagnoser playwright-install --browsers chromium,firefox

# Linux 系统依赖
mcp-diagnoser playwright-install --with-deps
```

---

## 🛠️ CLI 命令详解

### 全局选项

```bash
mcp-diagnoser [command] [options]

选项:
  -c, --config <path>    MCP 配置文件路径 (默认：.mcp.json)
  -l, --language <lang>  指定检查的语言
  -v, --verbose          详细输出
  -j, --json             JSON 格式输出
  --fix                  自动修复问题
  --deep                 深度扫描
  --fast                 快速模式
  -h, --help             显示帮助
  -V, --version          显示版本号
```

### 诊断命令

| 命令 | 描述 | 示例 |
|------|------|------|
| `check` | 诊断所有 MCP 服务器 | `mcp-diagnoser check` |
| `server <name>` | 诊断特定服务器 | `mcp-diagnoser server my-server` |
| `languages` | 检查语言环境 | `mcp-diagnoser languages` |
| `fix-all` | 自动修复所有问题 | `mcp-diagnoser fix-all` |

### 搜索命令

| 命令 | 描述 | 示例 |
|------|------|------|
| `search <query>` | 搜索 MCP 包 | `mcp-diagnoser search "web scraper"` |
| `popular` | 显示热门包 | `mcp-diagnoser popular` |
| `install <package>` | 安装 MCP 包 | `mcp-diagnoser install apify/rag-web-browser` |
| `web-search <query>` | 网页搜索 | `mcp-diagnoser web-search "AI tools"` |
| `multi-search <query>` | 多引擎搜索 | `mcp-diagnoser multi-search "React"` |
| `smart-search <query>` | 智能搜索 | `mcp-diagnoser smart-search "Python"` |
| `search-engines` | 列出搜索引擎 | `mcp-diagnoser search-engines` |

### 爬虫命令

| 命令 | 描述 | 示例 |
|------|------|------|
| `crawl <url>` | 爬取网站 | `mcp-diagnoser crawl https://example.com` |
| `search-content <url> <query>` | 搜索网站内容 | `mcp-diagnoser search-content https://docs.example.com "API"` |
| `extract-info <url>` | 提取网站信息 | `mcp-diagnoser extract-info https://example.com --emails` |

### 包管理命令

| 命令 | 描述 | 示例 |
|------|------|------|
| `packages` | 诊断所有包 | `mcp-diagnoser packages` |
| `package <name>` | 诊断特定包 | `mcp-diagnoser package playwright` |
| `package-managers` | 列出包管理器 | `mcp-diagnoser package-managers` |
| `install-missing` | 安装缺失包 | `mcp-diagnoser install-missing` |

### Playwright 命令

| 命令 | 描述 | 示例 |
|------|------|------|
| `playwright` | 检查 Playwright | `mcp-diagnoser playwright` |
| `playwright-install` | 安装浏览器 | `mcp-diagnoser playwright-install` |

---

## 📚 使用示例

### 场景 1: 新 MCP 服务器故障排查

```bash
# 1. 诊断所有服务器
mcp-diagnoser check

# 2. 查看详细报告
mcp-diagnoser check -v

# 3. 自动修复问题
mcp-diagnoser fix-all

# 4. 验证修复
mcp-diagnoser check
```

### 场景 2: 查找和安装 MCP 包

```bash
# 1. 搜索相关包
mcp-diagnoser search "web scraper"

# 2. 查看热门包
mcp-diagnoser popular

# 3. 安装包
mcp-diagnoser install apify/rag-web-browser

# 4. 验证安装
mcp-diagnoser check
```

### 场景 3: 开发环境检查

```bash
# 1. 检查所有语言环境
mcp-diagnoser languages

# 2. 检查包依赖
mcp-diagnoser packages

# 3. 生成 JSON 报告
mcp-diagnoser languages -j > languages.json
```

### 场景 4: 研究和信息收集

```bash
# 1. 多引擎搜索
mcp-diagnoser multi-search "AI development tools" \
  --engines google,bing,github \
  --limit 30

# 2. 爬取文档网站
mcp-diagnoser crawl https://docs.example.com \
  --max-pages 50

# 3. 搜索特定内容
mcp-diagnoser search-content https://docs.example.com "API endpoint"
```

---

## 🎯 最佳实践

### 1. 日常诊断

```bash
# 每天快速检查
mcp-diagnoser check --fast

# 每周深度检查
mcp-diagnoser check --deep --verbose
```

### 2. CI/CD 集成

```bash
# JSON 输出便于 CI 处理
mcp-diagnoser check -j > report.json

# 失败时退出码非零
mcp-diagnoser check || echo "发现问题"
```

### 3. 性能优化

```bash
# 使用快速模式跳过非必要检查
mcp-diagnoser check --fast

# 使用缓存减少重复搜索
mcp-diagnoser multi-search "query" --cache
```

### 4. 问题排查流程

```
1. mcp-diagnoser check          # 全面诊断
2. mcp-diagnoser server <name>  # 定位问题服务器
3. mcp-diagnoser packages       # 检查包依赖
4. mcp-diagnoser languages      # 检查语言环境
5. mcp-diagnoser fix-all        # 自动修复
6. mcp-diagnoser check          # 验证修复
```

---

## 📊 输出格式

### 标准输出

```
╔══════════════════════════════════════════════════════════╗
║     MCP Diagnoser v3.0.0 诊断报告                        ║
╚══════════════════════════════════════════════════════════╝

诊断时间：2026-03-28T12:00:00.000Z

服务器状态:
  ✓ server-1  [OK]
  ⚠ server-2  [WARNING] - 配置问题
  ✗ server-3  [ERROR] - 连接失败

总计：3 个服务器 | 1 正常 | 1 警告 | 1 错误
```

### JSON 输出

```json
{
  "timestamp": "2026-03-28T12:00:00.000Z",
  "summary": {
    "total": 3,
    "ok": 1,
    "warning": 1,
    "error": 1
  },
  "servers": [...]
}
```

---

## 🔗 相关资源

- [GitHub 仓库](https://github.com/Lyx3314844-03/mcp-diagnoser)
- [npm 包页面](https://www.npmjs.com/package/mcp-diagnoser)
- [依赖包文档](./DEPENDENCIES.md)
- [安装指南](../INSTALLATION.md)

---

**版本**: 3.0.0  
**最后更新**: 2026 年 3 月 28 日  
**维护者**: Lan <3314844@gmail.com>
