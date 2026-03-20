# MCP Diagnoser - 功能展示

**作者**: Lan <3314844@gmail.com>  
**版本**: 1.3.0  
**最后更新**: 2026-03-20

---

## 📋 目录

1. [核心功能](#核心功能)
2. [实际应用场景](#实际应用场景)
3. [使用示例](#使用示例)
4. [与其他工具对比](#与其他工具对比)
5. [性能指标](#性能指标)

---

## 🎯 核心功能

### 1. MCP 服务器诊断

**能做什么**:
- ✅ 自动检测所有 MCP 服务器的安装状态
- ✅ 检查服务器配置是否正确
- ✅ 诊断连接问题
- ✅ 检测依赖项缺失
- ✅ 检查运行时环境（Node.js, Python 等）
- ✅ 提供自动修复建议

**实际场景**:
```
场景：你的 MCP 服务器无法启动
解决：运行诊断，自动发现问题并修复
```

**示例输出**:
```
📊 Summary
╔═══════════════╤════╗
║ Total Servers │ 33 ║
╟───────────────┼────╢
║ ✅ OK         │ 32 ║
╟───────────────┼────╢
║ ⚠️  Warnings  │ 0  ║
╟───────────────┼────╢
║ ❌ Errors     │ 1  ║
╚═══════════════╧════╝

💡 Recommendations
  Critical Issues:
    • pipedream-remote: Command not found
      → Use SSE transport instead
```

---

### 2. 包管理诊断

**能做什么**:
- ✅ 检测 12 种包管理器的安装状态
- ✅ 检查 MCP 配置中使用的包
- ✅ 识别缺失的包
- ✅ 检测版本冲突
- ✅ 检测依赖问题
- ✅ 一键安装缺失包

**支持的包管理器**:
- npm, yarn, pnpm
- pip, pip3, uv, uvx
- cargo, go, dotnet
- gem, composer

**实际场景**:
```
场景：新电脑上配置 MCP 环境
解决：运行包诊断，一键安装所有缺失包
```

**示例输出**:
```
📦 Package Status
╔════════════════╤════╗
║ Total Packages │ 33 ║
╟────────────────┼────╢
║ ✅ Installed   │ 30 ║
╟────────────────┼────╢
║ ❌ Missing     │ 3  ║
╚════════════════╧════╝

Missing Packages:
  • @playwright/mcp
  • requests
  • github-mcp-server

💡 Install with:
  npm install -g @playwright/mcp
  pip install requests
```

---

### 3. 编程语言环境检查

**能做什么**:
- ✅ 检查 10 种编程语言运行时
- ✅ 显示版本信息
- ✅ 显示安装路径
- ✅ 提供安装建议

**支持的语言**:
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

**实际场景**:
```
场景：开发新项目，需要检查环境
解决：运行语言检查，了解已安装的语言
```

**示例输出**:
```
╔══════════╤════════╤══════════╤═════════════════════════╗
║ Language │ Status │ Version  │ Path                    ║
╟──────────┼────────┼──────────┼─────────────────────────╢
║ node     │ ✓      │ v22.22.1 │ C:\Program Files\nodejs ║
╟──────────┼────────┼──────────┼─────────────────────────╢
║ python   │ ✓      │ 3.13.12  │ C:\Python313\python.exe ║
╟──────────┼────────┼──────────┼─────────────────────────╢
║ java     │ ✓      │ 25.0.2   │ C:\Java\jdk\bin\java    ║
╟──────────┼────────┼──────────┼─────────────────────────╢
║ go       │ ✓      │ 1.26.1   │ C:\Go\bin\go.exe        ║
╟──────────┼────────┼──────────┼─────────────────────────╢
║ cargo    │ ✓      │ 1.94.0   │ C:\Rust\bin\cargo.exe   ║
╚══════════╧════════╧══════════╧═════════════════════════╝

  5/10 languages available
```

---

### 4. MCP 包搜索

**能做什么**:
- ✅ 搜索 npm 上的 MCP 包
- ✅ 搜索 GitHub 上的 MCP 项目
- ✅ 显示包的详细信息
- ✅ 显示下载量和星标
- ✅ 提供一键安装

**实际场景**:
```
场景：需要找 GitHub 相关的 MCP 包
解决：搜索 "github"，找到相关包并安装
```

**示例输出**:
```
🔍 Search Results: "github"
Found 2536 packages

  @modelcontextprotocol/server-github
    GitHub's Official MCP Server
    Author: github
    Downloads: 28024
    Repository: github/github-mcp-server

  idosal/git-mcp
    GitMCP remote MCP server
    Author: idosal
    Downloads: 7791
    Repository: idosal/git-mcp
```

---

### 5. Playwright 诊断

**能做什么**:
- ✅ 检查 Playwright 安装状态
- ✅ 检查浏览器（Chromium/Firefox/WebKit）
- ✅ 检查配置文件
- ✅ 检查系统依赖（Linux）
- ✅ 一键安装浏览器

**实际场景**:
```
场景：Playwright MCP 无法启动
解决：诊断发现浏览器未安装，一键安装
```

**示例输出**:
```
🎭 Playwright Diagnosis

✓ Playwright installed Version 1.58.2

🌐 Browsers:
  ✗ chromium
  ✗ firefox
  ✗ webkit

⚠️  Issues:
  • chromium browser is not installed
  • firefox browser is not installed
  • webkit browser is not installed

💡 Suggestions:
  • Run: npx playwright install
```

---

### 6. 网络搜索和爬取

**能做什么**:
- ✅ 多引擎搜索（Google, Bing, Baidu, DuckDuckGo）
- ✅ 爬取网站内容
- ✅ 搜索网站内内容
- ✅ 提取邮箱、电话、链接
- ✅ 支持正则表达式

**实际场景**:
```
场景：需要查找某个技术的最新信息
解决：使用网络搜索，爬取相关网站
```

**示例**:
```bash
# 搜索网络
mcp-diagnoser web-search "MCP protocol" --engine google

# 爬取网站
mcp-diagnoser crawl https://example.com

# 搜索网站内容
mcp-diagnoser search-content https://example.com "API"

# 提取信息
mcp-diagnoser extract-info https://example.com --emails --phones
```

---

## 🎬 实际应用场景

### 场景 1: 新环境配置

**问题**: 刚买了新电脑，需要配置 MCP 环境

**解决步骤**:
```bash
# 1. 安装 mcp-diagnoser
npm install -g mcp-diagnoser

# 2. 检查语言环境
mcp-diagnoser languages
# 输出：显示已安装的语言

# 3. 检查包管理器
mcp-diagnoser package-managers
# 输出：显示可用的包管理器

# 4. 诊断所有包
mcp-diagnoser packages
# 输出：显示缺失的包

# 5. 安装缺失包
mcp-diagnoser install-missing
# 输出：自动安装所有缺失包
```

**结果**: ✅ 5 分钟完成环境配置

---

### 场景 2: 服务器故障排查

**问题**: MCP 服务器突然无法启动

**解决步骤**:
```bash
# 1. 诊断所有服务器
mcp-diagnoser check
# 输出：发现 playwright 服务器有问题

# 2. 诊断特定服务器
mcp-diagnoser server playwright
# 输出：浏览器未安装

# 3. 自动修复
mcp-diagnoser fix-all
# 输出：安装浏览器，修复成功
```

**结果**: ✅ 2 分钟定位并解决问题

---

### 场景 3: 查找和安装 MCP 包

**问题**: 需要找操作数据库的 MCP 包

**解决步骤**:
```bash
# 1. 搜索 MCP 包
mcp-diagnoser search database
# 输出：找到相关包列表

# 2. 查看热门包
mcp-diagnoser popular
# 输出：显示热门 MCP 包

# 3. 安装包
mcp-diagnoser install @modelcontextprotocol/server-github
# 输出：安装成功
```

**结果**: ✅ 快速找到并安装包

---

### 场景 4: 项目依赖检查

**问题**: 项目依赖复杂，不确定是否都安装了

**解决步骤**:
```bash
# 1. 诊断所有包
mcp-diagnoser packages --json
# 输出：JSON 格式的包状态

# 2. 检查依赖冲突
mcp-diagnoser check --deep
# 输出：深度检查结果

# 3. 生成报告
mcp-diagnoser check --json > report.json
# 输出：保存报告到文件
```

**结果**: ✅ 完整的依赖状态报告

---

### 场景 5: AI 助手集成

**问题**: AI 助手需要诊断 MCP 环境问题

**解决步骤**:
```
用户：我的 MCP 服务器有问题

AI 助手：让我帮你诊断
[调用 diagnose_all 工具]

AI 助手：发现以下问题...
- Playwright 浏览器未安装
- 2 个 npm 包缺失

正在修复...
[调用 fix_server 工具]

AI 助手：已修复所有问题！
```

**结果**: ✅ AI 助手自动诊断和修复

---

## 📊 与其他工具对比

### 功能对比表

| 功能 | MCP Diagnoser | npm check | pip check | 其他工具 |
|-----|---------------|-----------|-----------|---------|
| 多包管理器支持 | ✅ 12 种 | ❌ 仅 npm | ❌ 仅 pip | ❌ 单一 |
| 多语言支持 | ✅ 10 种 | ❌ 仅 JS | ❌ 仅 Python | ❌ 单一 |
| MCP 服务器诊断 | ✅ | ❌ | ❌ | ❌ |
| 自动修复 | ✅ | ⚠️ 部分 | ⚠️ 部分 | ❌ |
| 包搜索 | ✅ | ⚠️ 仅 npm | ⚠️ 仅 PyPI | ❌ |
| 网络搜索 | ✅ | ❌ | ❌ | ❌ |
| 网站爬取 | ✅ | ❌ | ❌ | ❌ |
| Playwright 诊断 | ✅ | ❌ | ❌ | ❌ |
| MCP 工具支持 | ✅ 14 个 | ❌ | ❌ | ❌ |

### 优势

1. **一站式解决方案**
   - 一个工具解决所有诊断需求
   - 无需安装多个工具

2. **跨平台支持**
   - Windows, Linux, macOS
   - 统一的使用体验

3. **智能诊断**
   - 自动发现问题
   - 提供修复建议
   - 一键修复

4. **MCP 集成**
   - 14 个 MCP 工具
   - AI 助手可直接调用
   - 自动化诊断

---

## 📈 性能指标

### 诊断速度

| 操作 | 平均时间 | 说明 |
|-----|---------|------|
| 诊断所有服务器 | ~5 秒 | 33 个服务器 |
| 检查所有语言 | ~3 秒 | 10 种语言 |
| 诊断所有包 | ~2 秒 | 33 个包 |
| 搜索 MCP 包 | ~2 秒 | npm + GitHub |
| 网络搜索 | ~1 秒 | 单个引擎 |
| 网站爬取 | ~10 秒 | 20 页 |

### 资源使用

| 模式 | 内存 | CPU | 启动时间 |
|-----|------|-----|---------|
| CLI | ~50MB | <5% | <1 秒 |
| MCP Server | ~80MB | <10% | <2 秒 |
| 网络工具 | ~60MB | <15% | <1 秒 |

### 支持规模

| 项目 | 数量 |
|-----|------|
| MCP 工具 | 14 个 |
| CLI 命令 | 18 个 |
| 支持语言 | 10 种 |
| 包管理器 | 12 种 |
| 搜索引擎 | 14 个 |
| 诊断服务器 | 无限制 |

---

## 🎓 学习资源

### 快速开始

```bash
# 安装
npm install -g mcp-diagnoser

# 查看帮助
mcp-diagnoser --help

# 运行诊断
mcp-diagnoser check

# 查看语言
mcp-diagnoser languages

# 搜索包
mcp-diagnoser search mcp
```

### 文档

- [README.md](README.md) - 主文档
- [MCP_SERVER_GUIDE.md](MCP_SERVER_GUIDE.md) - MCP 指南
- [QUICK_REFERENCE_CARD.md](QUICK_REFERENCE_CARD.md) - 快速参考
- [FULL_TEST_REPORT.md](FULL_TEST_REPORT.md) - 测试报告

### 示例

更多示例请查看：
- [examples/](examples/) - 代码示例
- [tutorials/](tutorials/) - 教程

---

## 📞 联系支持

**作者**: Lan  
**邮箱**: 3314844@gmail.com  
**GitHub**: https://github.com/YOUR_USERNAME

---

**最后更新**: 2026-03-20  
**版本**: 1.3.0
