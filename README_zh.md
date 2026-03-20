# MCP Diagnoser

全面的 MCP（Model Context Protocol）诊断工具，支持检测安装、依赖、连接和配置问题，并支持自动修复。支持 **10 种主流编程语言**，内置 **MCP 包搜索**和 **Playwright 诊断**功能。

## 🚀 核心功能

### 🔍 诊断能力

- **安装检查**: 检测命令是否安装、是否在 PATH 中
- **依赖检查**: 验证 npm/Python/Java 等包依赖
- **连接检查**: 测试服务器连接性
- **配置检查**: 验证 MCP 配置文件格式
- **运行时检查**: 检查 10 种语言运行时环境
- **权限检查**: 检测文件权限问题

### 🔎 MCP 包搜索

- **npm 搜索**: 搜索 npm 上的 MCP 相关包
- **GitHub 搜索**: 搜索 GitHub 上的 MCP 项目
- **热门包推荐**: 显示官方和流行的 MCP 包
- **一键安装**: 直接安装找到的包

### 🎭 Playwright 诊断

- **安装检测**: 检查 Playwright 是否安装
- **浏览器状态**: 检测 Chromium/Firefox/WebKit 安装情况
- **配置检查**: 验证 playwright.config 文件
- **系统依赖**: 检查 Linux 系统依赖
- **自动安装**: 一键安装浏览器

### 🛠️ 自动修复

- 自动安装缺失的命令
- 修复常见的配置错误
- 设置环境变量
- 清理缓存和临时文件

### 🌍 支持的编程语言

1. **JavaScript/TypeScript** (Node.js) ✅
2. **Python** ✅
3. **Java** ✅
4. **Go** ✅
5. **Rust** ✅
6. **C#/.NET**
7. **Ruby**
8. **PHP**
9. **Swift**
10. **Kotlin**

## 📦 安装

### 方式一：全局安装（推荐）

```bash
cd mcp-diagnoser
npm install -g .
```

### 方式二：本地使用

```bash
cd mcp-diagnoser
npm install
npm run build
npm start -- check
```

### 方式三：作为 MCP 服务器

```bash
cd mcp-diagnoser/server
npm install
npm run build
```

然后在 `.mcp.json` 中添加：

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

## 💻 使用方法

### CLI 命令

```bash
# ========== 诊断命令 ==========
# 诊断所有 MCP 服务器
mcp-diagnoser check

# 诊断特定服务器
mcp-diagnoser server playwright

# 检查所有语言运行时
mcp-diagnoser languages

# 自动修复所有问题
mcp-diagnoser fix-all

# 详细输出
mcp-diagnoser check --verbose

# JSON 格式输出
mcp-diagnoser check --json

# ========== 搜索命令 ==========
# 搜索 MCP 包
mcp-diagnoser search github
mcp-diagnoser search playwright
mcp-diagnoser search python

# 仅搜索 npm
mcp-diagnoser search github --source npm

# 仅搜索 GitHub
mcp-diagnoser search github --source github

# 显示热门 MCP 包
mcp-diagnoser popular

# 安装 MCP 包
mcp-diagnoser install @playwright/mcp
mcp-diagnoser install @playwright/mcp --global

# ========== Playwright 命令 ==========
# 诊断 Playwright
mcp-diagnoser playwright

# 安装 Playwright 浏览器
mcp-diagnoser playwright-install
mcp-diagnoser playwright-install --browsers chromium,firefox
mcp-diagnoser playwright-install --with-deps  # Linux 安装系统依赖
```

### MCP 工具

作为 MCP 服务器运行时，提供以下工具：

1. **diagnose_all**: 诊断所有 MCP 服务器
2. **diagnose_server**: 诊断特定服务器
3. **fix_server**: 自动修复服务器问题
4. **check_language**: 检查特定语言运行时
5. **check_all_languages**: 检查所有 10 种语言
6. **search_mcp_packages**: 搜索 MCP 包
7. **diagnose_playwright**: 诊断 Playwright

### 示例输出

#### 语言检查

```
╔══════════╤════════╤══════════╤═════════════════════════════════════════════════════════════╗
║ Language │ Status │ Version  │ Path                                                        ║
╟──────────┼────────┼──────────┼─────────────────────────────────────────────────────────────╢
║ node     │ ✓      │ v22.22.1 │ C:\Program Files\nodejs\node.exe                            ║
╟──────────┼────────┼──────────┼─────────────────────────────────────────────────────────────╢
║ python   │ ✓      │ 3.13.12  │ C:\Program Files\Python313\python.exe                       ║
╟──────────┼────────┼──────────┼─────────────────────────────────────────────────────────────╢
║ java     │ ✓      │ 25.0.2   │ C:\Program Files\Common Files\Oracle\Java\javapath\java.exe ║
╟──────────┼────────┼──────────┼─────────────────────────────────────────────────────────────╢
║ go       │ ✓      │ 1.26.1   │ C:\Program Files\Go\bin\go.exe                              ║
╟──────────┼────────┼──────────┼─────────────────────────────────────────────────────────────╢
║ cargo    │ ✓      │ 1.94.0   │ C:\Program Files\Rust stable MSVC 1.94\bin\cargo.exe        ║
╟──────────┼────────┼──────────┼─────────────────────────────────────────────────────────────╢
║ dotnet   │ ✗      │ N/A      │ Not found                                                   ║
╚══════════╧════════╧══════════╧═════════════════════════════════════════════════════════════╝

  5/10 languages available
```

#### Playwright 诊断

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
  • No playwright.config file found

💡 Suggestions:
  • Run: npx playwright install
```

#### MCP 包搜索

```
════════════════════════════════════════════════════════════
  MCP Package Search: "github"
════════════════════════════════════════════════════════════
  Found 2536 packages

  github/github-mcp-server
    GitHub's Official MCP Server
    Author: github
    Downloads/Stars: 28024
    Repository: https://github.com/github/github-mcp-server

  idosal/git-mcp
    Put an end to code hallucinations! GitMCP is a free, open-source, remote MCP server
    Author: idosal
    Downloads/Stars: 7791
    Repository: https://github.com/idosal/git-mcp
```

## 🔧 诊断的问题类型

### 安装问题 (Installation)
- 命令未安装
- 可执行文件不在 PATH 中
- 安装包损坏

### 依赖问题 (Dependency)
- npm 包未安装
- Python 包缺失
- Java 依赖缺失
- Playwright 浏览器未安装

### 连接问题 (Connection)
- 无法连接到远程服务器
- 代理配置错误
- 网络超时

### 配置问题 (Configuration)
- JSON 格式错误
- 缺少必需字段
- 环境变量未设置
- Playwright 配置文件缺失

### 运行时问题 (Runtime)
- 语言版本过低
- 运行时未安装
- 版本不兼容

### 权限问题 (Permission)
- 文件无执行权限
- 目录无写入权限
- 需要管理员权限

## 🤖 自动修复功能

使用 `--fix` 或 `fix-all` 命令时，工具会尝试自动修复以下问题：

1. **安装缺失命令**: 使用 winget/brew/apt 安装
2. **设置环境变量**: 自动配置 PATH 等
3. **清理缓存**: npm cache, pip cache, gradle cache
4. **更新包**: 过时的 npm/Python 包
5. **安装 Playwright 浏览器**: 自动下载并安装

## 📝 配置文件

默认读取以下位置的配置文件：
- `.mcp.json` (当前目录)
- `~/.mcp.json` (用户主目录)
- `~/mcp.json` (用户主目录)

配置格式：

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@org/package"],
      "type": "stdio",
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

## 🧪 开发

### 构建

```bash
npm run build
```

### 开发模式

```bash
npm run dev
```

### 测试

```bash
npm test
```

## 🐛 故障排除

### 常见问题

**Q: 诊断显示所有服务器都有问题？**
A: 可能是 Node.js 或 npm 未正确安装，请先安装 Node.js 18+

**Q: Python 服务器诊断失败？**
A: 确保 Python 3.8+ 已安装，并且 pip 在 PATH 中

**Q: Java 服务器报错？**
A: 设置 JAVA_HOME 环境变量到 JDK 安装目录

**Q: Playwright 浏览器安装失败？**
A: Linux 用户请使用 `--with-deps` 参数安装系统依赖

**Q: 自动修复失败？**
A: 以管理员身份运行终端，或手动执行建议的命令

### 日志

使用 `--verbose` 参数查看详细诊断日志：

```bash
mcp-diagnoser check --verbose
```

## 📚 热门 MCP 包推荐

运行 `mcp-diagnoser popular` 查看：

```
@modelcontextprotocol/server-github  - GitHub MCP 服务器
@modelcontextprotocol/server-puppeteer - Puppeteer MCP 服务器
@playwright/mcp - Playwright MCP 服务器
@upstash/context7-mcp - 文档查询 MCP
firecrawl-mcp - 网页爬取 MCP
search1api-mcp - 搜索 API MCP
exa-mcp-server - AI 搜索 MCP
yt-dlp-mcp - YouTube 下载 MCP
code-review-mcp-server - 代码审查 MCP
terminal-mcp-server - 终端访问 MCP
```

## 🔄 更新日志

### v1.1.0
- ✅ 新增 MCP 包搜索功能（npm + GitHub）
- ✅ 新增 Playwright 诊断和安装功能
- ✅ 新增热门包推荐
- ✅ 新增一键安装包功能
- ✅ 修复 TypeScript 编译错误
- ✅ 改进报告输出格式

### v1.0.0
- 初始版本
- 支持 10 种编程语言
- CLI 和 MCP 服务器两种模式
- 自动修复功能
- 详细报告生成

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持的语言检查器

每种语言都有专门的检查器：

- `JavaScriptChecker`: Node.js, npm, npx, Playwright
- `PythonChecker`: Python, pip, uv
- `JavaChecker`: Java, Maven, Gradle
- `GoChecker`: Go, go mod
- `RustChecker`: Rust, Cargo, rustup
- `CSharpChecker`: .NET, dotnet CLI
- `RubyChecker`: Ruby, gem, bundler
- `PHPChecker`: PHP, composer
- `SwiftChecker`: Swift, Swift Package Manager
- `KotlinChecker`: Kotlin, Gradle, Maven
