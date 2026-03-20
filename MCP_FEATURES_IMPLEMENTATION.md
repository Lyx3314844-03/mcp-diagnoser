# MCP Diagnoser - 功能实现清单

**作者**: Lan <3314844@gmail.com>  
**版本**: 1.3.0  
**最后更新**: 2026-03-20

---

## 📋 功能总览

MCP Diagnoser 实现了 **5 大类** 功能，共计 **10+ 个工具**，支持 **12 种包管理器** 和 **10 种编程语言**。

### 功能分类

| 类别 | 工具数 | 功能说明 | 状态 |
|-----|--------|---------|------|
| 🔍 诊断工具 | 5 | MCP 服务器诊断、语言检查 | ✅ 完整 |
| 📦 包管理工具 | 3 | 包诊断、包管理器检查 | ✅ 完整 |
| 🔎 搜索工具 | 1 | MCP 包搜索 | ✅ 完整 |
| 🎭 Playwright 工具 | 1 | Playwright 诊断 | ✅ 完整 |
| 🌐 网络工具 | 4+ | 网络搜索、网页爬取 | ✅ 完整 |

---

## 🔍 诊断工具（5 个）

### 1. diagnose_all - 诊断所有 MCP 服务器

**功能描述**: 对所有配置的 MCP 服务器进行全面诊断

**实现细节**:
- ✅ 检查服务器命令是否存在
- ✅ 检查运行时环境（Node.js, Python 等）
- ✅ 检查包依赖（npx/uvx 包）
- ✅ 检查配置文件有效性
- ✅ 检查环境变量
- ✅ 生成详细诊断报告

**返回内容**:
```json
{
  "summary": {
    "total": 33,
    "ok": 32,
    "warning": 0,
    "error": 1
  },
  "languageRuntimes": {
    "node": { "available": true, "version": "v22.22.1" },
    "python": { "available": true, "version": "3.13.12" }
  },
  "packages": {
    "totalPackages": 33,
    "installedPackages": 33,
    "missingPackages": []
  },
  "servers": [...]
}
```

**使用示例**:
```
请诊断所有 MCP 服务器
```

### 2. diagnose_server - 诊断特定服务器

**功能描述**: 诊断指定的 MCP 服务器

**实现细节**:
- ✅ 检查命令安装状态
- ✅ 检查运行时版本
- ✅ 检查包依赖
- ✅ 检查配置参数
- ✅ 提供修复建议

**支持的诊断项**:
- 命令是否存在
- 运行时是否可用
- 包是否已安装
- 配置是否有效
- 环境变量是否设置

**使用示例**:
```
诊断 playwright 服务器
诊断 github 服务器
```

### 3. fix_server - 自动修复服务器

**功能描述**: 自动修复 MCP 服务器的问题

**实现细节**:
- ✅ 识别可自动修复的问题
- ✅ 执行安装命令
- ✅ 配置环境变量
- ✅ 修复权限问题
- ✅ 清理缓存

**可修复的问题**:
- 缺失的命令（自动安装）
- 缺失的包（npm/pip install）
- 权限问题（自动修复）
- 配置错误（自动修正）

**使用示例**:
```
修复 playwright 服务器
修复所有 MCP 服务器问题
```

### 4. check_language - 检查特定语言

**功能描述**: 检查特定编程语言的运行时环境

**实现细节**:
- ✅ 检查命令是否存在
- ✅ 获取版本信息
- ✅ 检查安装路径
- ✅ 验证可用性

**支持的语言**:
| 语言 | 检查命令 | 版本要求 |
|-----|---------|---------|
| JavaScript/TypeScript | node, npm | 18.0+ |
| Python | python, pip | 3.8+ |
| Java | java, javac | 11+ |
| Go | go | 1.20+ |
| Rust | cargo, rustc | 1.70+ |
| C#/.NET | dotnet | 6.0+ |
| Ruby | ruby, gem | 3.0+ |
| PHP | php, composer | 8.0+ |
| Swift | swift | 5.8+ |
| Kotlin | kotlinc | 1.8+ |

**返回内容**:
```json
{
  "name": "Python",
  "available": true,
  "version": "3.13.12",
  "path": "/usr/bin/python3"
}
```

**使用示例**:
```
检查 Python 运行时
检查 Node.js 版本
```

### 5. check_all_languages - 检查所有语言

**功能描述**: 一次性检查所有 10 种编程语言环境

**实现细节**:
- ✅ 并行检查所有语言
- ✅ 生成汇总报告
- ✅ 显示版本和路径
- ✅ 统计可用数量

**返回内容**:
```json
{
  "node": { "available": true, "version": "v22.22.1" },
  "python": { "available": true, "version": "3.13.12" },
  "java": { "available": true, "version": "25.0.2" },
  "go": { "available": true, "version": "1.26.1" },
  "cargo": { "available": true, "version": "1.94.0" },
  "dotnet": { "available": false },
  ...
}
```

**使用示例**:
```
检查所有编程语言环境
我的系统支持哪些编程语言
```

---

## 📦 包管理工具（3 个）

### 6. diagnose_packages - 诊断所有包

**功能描述**: 诊断 MCP 配置中使用的所有包

**实现细节**:
- ✅ 从配置中提取包名
- ✅ 检查包安装状态
- ✅ 检测依赖冲突
- ✅ 分析版本兼容性
- ✅ 识别按需安装的包（npx/uvx）

**支持的包管理器**:
| 包管理器 | 命令 | 检查方式 |
|---------|------|---------|
| npm | npm | npm list -g |
| yarn | yarn | yarn global list |
| pnpm | pnpm | pnpm list -g |
| pip | pip | pip show |
| pip3 | pip3 | pip3 show |
| uv | uv | uv pip list |
| uvx | uvx | uv tool list |
| cargo | cargo | cargo install --list |
| go | go | go list -m |
| dotnet | dotnet | dotnet tool list -g |
| gem | gem | gem list |
| composer | composer | composer global show |

**返回内容**:
```json
{
  "totalPackages": 33,
  "installedPackages": 33,
  "missingPackages": [],
  "packageDetails": [
    {
      "name": "@playwright/mcp",
      "installed": true,
      "version": "on-demand"
    }
  ]
}
```

**使用示例**:
```
诊断所有安装包
检查 MCP 包的依赖
```

### 7. check_package_managers - 检查包管理器

**功能描述**: 检查系统中可用的包管理器

**实现细节**:
- ✅ 检查 12 种包管理器
- ✅ 获取版本信息
- ✅ 显示安装命令
- ✅ 统计可用数量

**返回内容**:
```json
{
  "npm": {
    "available": true,
    "version": "10.9.4",
    "installCommand": "npm install -g"
  },
  "pip": {
    "available": true,
    "version": "26.0.1",
    "installCommand": "pip install"
  }
}
```

**使用示例**:
```
检查包管理器状态
我的系统有哪些包管理器
```

### 8. diagnose_package - 诊断特定包

**功能描述**: 诊断指定的包

**实现细节**:
- ✅ 检查包是否安装
- ✅ 获取版本信息
- ✅ 检查安装位置
- ✅ 识别全局/本地安装
- ✅ 检测版本问题

**参数**:
- `package_name` (string): 包名称
- `manager` (string, optional): 包管理器

**返回内容**:
```json
{
  "name": "requests",
  "installed": true,
  "version": "2.31.0",
  "global": false,
  "location": "/usr/local/lib/python3.13/site-packages",
  "issues": []
}
```

**使用示例**:
```
诊断 @playwright/mcp 包
诊断 requests 包，使用 pip
```

---

## 🔎 搜索工具（1 个）

### 9. search_mcp_packages - 搜索 MCP 包

**功能描述**: 在 npm 和 GitHub 上搜索 MCP 相关包

**实现细节**:
- ✅ 搜索 npm  registry
- ✅ 搜索 GitHub API
- ✅ 合并搜索结果
- ✅ 去重和排序
- ✅ 显示详细信息

**参数**:
- `query` (string): 搜索关键词
- `source` (string, optional): 搜索源（npm/github/all）
- `limit` (number, optional): 结果数量

**返回内容**:
```json
{
  "query": "github",
  "total": 2536,
  "packages": [
    {
      "name": "@modelcontextprotocol/server-github",
      "description": "GitHub's Official MCP Server",
      "version": "1.0.0",
      "author": "github",
      "downloads": 28024,
      "repository": "https://github.com/github/github-mcp-server"
    }
  ]
}
```

**搜索源**:
| 源 | 说明 | API |
|---|------|-----|
| npm | npm 包仓库 | registry.npmjs.org |
| GitHub | GitHub 仓库 | api.github.com |
| all | 两者都搜索 | 两者都用 |

**使用示例**:
```
搜索 GitHub MCP 包
搜索 playwright 相关的包
```

---

## 🎭 Playwright 工具（1 个）

### 10. diagnose_playwright - 诊断 Playwright

**功能描述**: 诊断 Playwright 安装状态和浏览器

**实现细节**:
- ✅ 检查 Playwright 是否安装
- ✅ 检查浏览器状态（Chromium/Firefox/WebKit）
- ✅ 检查配置文件
- ✅ 检查系统依赖（Linux）
- ✅ 提供安装建议

**检查项**:
| 检查项 | 说明 | 状态 |
|-------|------|------|
| Playwright 安装 | 检查是否安装 | ✅ |
| Chromium | 检查 Chromium 浏览器 | ✅ |
| Firefox | 检查 Firefox 浏览器 | ✅ |
| WebKit | 检查 WebKit 浏览器 | ✅ |
| 配置文件 | 检查 playwright.config | ✅ |
| 系统依赖 | 检查 Linux 依赖 | ✅ |

**返回内容**:
```json
{
  "playwrightInstalled": true,
  "playwrightVersion": "1.58.2",
  "browsers": [
    {
      "browser": "chromium",
      "installed": false,
      "issues": ["browser needs to be installed"]
    }
  ],
  "issues": ["chromium browser is not installed"],
  "suggestions": ["Run: npx playwright install"]
}
```

**使用示例**:
```
诊断 Playwright
检查 Playwright 浏览器状态
```

---

## 🌐 网络工具（4+ 个）

### 11. web_search - 网络搜索

**功能描述**: 使用多个搜索引擎搜索网页

**支持的搜索引擎**:
- Google
- Bing
- Baidu
- DuckDuckGo
- Yahoo

**参数**:
- `query` (string): 搜索词
- `engine` (string, optional): 搜索引擎
- `limit` (number, optional): 结果数量
- `time_range` (string, optional): 时间范围

**使用示例**:
```
搜索 MCP 协议相关信息
搜索最新的 AI 新闻
```

### 12. crawl - 爬取网站

**功能描述**: 爬取网站并提取内容

**实现细节**:
- ✅ 递归爬取
- ✅ 同域限制
- ✅ 深度控制
- ✅ 延迟控制
- ✅ URL 过滤

**参数**:
- `url` (string): 网站 URL
- `max_pages` (number): 最大页数
- `max_depth` (number): 最大深度
- `same_domain` (boolean): 同域限制

**使用示例**:
```
爬取 https://example.com
爬取并提取内容
```

### 13. search_content - 搜索网站内容

**功能描述**: 在爬取的网站中搜索内容

**实现细节**:
- ✅ 支持正则表达式
- ✅ 支持大小写控制
- ✅ 支持全文匹配
- ✅ 显示上下文

**参数**:
- `url` (string): 网站 URL
- `query` (string): 搜索词
- `case_sensitive` (boolean): 大小写敏感
- `regex` (boolean): 正则表达式

**使用示例**:
```
在 example.com 中搜索 keyword
```

### 14. extract_info - 提取信息

**功能描述**: 从网站提取结构化信息

**可提取的信息**:
- ✅ 电子邮件地址
- ✅ 电话号码
- ✅ 所有链接
- ✅ 社交媒体链接

**参数**:
- `url` (string): 网站 URL
- `emails` (boolean): 提取邮件
- `phones` (boolean): 提取电话
- `links` (boolean): 提取链接
- `all` (boolean): 提取所有

**使用示例**:
```
从 example.com 提取邮箱和电话
```

---

## 🛠️ CLI 命令（15+ 个）

### 诊断命令

| 命令 | 功能 | 参数 |
|-----|------|------|
| `check` | 诊断所有服务器 | -c, -v, -j, --fix |
| `server <名>` | 诊断特定服务器 | 服务器名 |
| `languages` | 检查语言运行时 | - |
| `fix-all` | 自动修复所有 | - |

### 包管理命令

| 命令 | 功能 | 参数 |
|-----|------|------|
| `packages` | 诊断所有包 | - |
| `package <名>` | 诊断特定包 | 包名，-m |
| `package-managers` | 列出包管理器 | - |
| `install-missing` | 安装缺失包 | -f |

### 搜索命令

| 命令 | 功能 | 参数 |
|-----|------|------|
| `search <词>` | 搜索 MCP 包 | 关键词，-s, -n |
| `popular` | 显示热门包 | -n |
| `install <包>` | 安装包 | 包名，-g |

### Playwright 命令

| 命令 | 功能 | 参数 |
|-----|------|------|
| `playwright` | 诊断 Playwright | - |
| `playwright-install` | 安装浏览器 | --browsers, --with-deps |

### 网络命令

| 命令 | 功能 | 参数 |
|-----|------|------|
| `web-search <词>` | 搜索网页 | -e, -n, -l, -t |
| `crawl <url>` | 爬取网站 | --max-pages, --depth |
| `search-content <url> <词>` | 搜索内容 | --regex, --context |
| `extract-info <url>` | 提取信息 | --emails, --phones |

---

## 📊 功能矩阵

### 完整实现 ✅

| 功能 | CLI | MCP 工具 | API | 文档 |
|-----|-----|---------|-----|------|
| 服务器诊断 | ✅ | ✅ | ✅ | ✅ |
| 包诊断 | ✅ | ✅ | ✅ | ✅ |
| 语言检查 | ✅ | ✅ | ✅ | ✅ |
| 自动修复 | ✅ | ✅ | ✅ | ✅ |
| 包搜索 | ✅ | ✅ | ✅ | ✅ |
| Playwright | ✅ | ✅ | ✅ | ✅ |
| 网络搜索 | ✅ | ❌ | ✅ | ✅ |
| 网页爬取 | ✅ | ❌ | ✅ | ✅ |

### 部分实现 ⚠️

| 功能 | 状态 | 说明 |
|-----|------|------|
| 依赖冲突检测 | ⚠️ | 支持 npm 和 pip |
| 系统依赖检查 | ⚠️ | 仅 Linux |

### 计划中 📋

| 功能 | 优先级 | 说明 |
|-----|--------|------|
| Docker 支持 | 中 | 容器化部署 |
| 自定义规则 | 低 | 用户自定义诊断规则 |
| 报告导出 | 中 | PDF/HTML 格式 |

---

## 🔧 技术实现

### 核心模块

```
src/
├── core/
│   └── diagnoser.ts      # 核心诊断器
├── tools/
│   ├── mcp-searcher.ts   # MCP 包搜索
│   ├── browser-search.ts # 网络搜索
│   ├── web-crawler.ts    # 网页爬取
│   └── package-diagnoser.ts  # 包诊断器
├── languages/
│   ├── base-checker.ts   # 语言检查基类
│   ├── javascript.ts     # JS 检查器
│   ├── python.ts         # Python 检查器
│   ├── java.ts           # Java 检查器
│   └── ...               # 其他语言
└── index.ts              # CLI 入口
```

### 关键技术

| 技术 | 用途 | 版本 |
|-----|------|------|
| TypeScript | 主要编程语言 | 5.3+ |
| Node.js | 运行时 | 18+ |
| @modelcontextprotocol/sdk | MCP 协议 | 1.27+ |
| execa | 命令执行 | 8.0+ |
| chalk | 终端着色 | 4.1+ |
| ora | 加载动画 | 5.4+ |
| table | 表格输出 | 6.8+ |

---

## 📈 性能指标

### 诊断速度

| 操作 | 平均时间 | 说明 |
|-----|---------|------|
| 诊断所有服务器 | ~5 秒 | 33 个服务器 |
| 检查所有语言 | ~3 秒 | 10 种语言 |
| 诊断所有包 | ~2 秒 | 33 个包 |
| 搜索 MCP 包 | ~2 秒 | npm + GitHub |

### 支持规模

| 项目 | 数量 |
|-----|------|
| MCP 工具 | 10+ |
| CLI 命令 | 15+ |
| 支持语言 | 10 |
| 包管理器 | 12 |
| 搜索引擎 | 5 |

---

## 📞 联系信息

**作者**: Lan  
**邮箱**: 3314844@gmail.com  
**GitHub**: https://github.com/YOUR_USERNAME  
**npm**: https://www.npmjs.com/package/mcp-diagnoser

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**最后更新**: 2026-03-20  
**版本**: 1.3.0
