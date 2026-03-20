# MCP Diagnoser - MCP 服务器完整指南

**作者**: Lan  
**邮箱**: 3314844@gmail.com  
**版本**: 1.3.0

## 📖 目录

1. [什么是 MCP Diagnoser](#什么是-mcp-diagnoser)
2. [快速开始](#快速开始)
3. [MCP 服务器配置](#mcp-服务器配置)
4. [可用工具](#可用工具)
5. [使用示例](#使用示例)
6. [最佳实践](#最佳实践)
7. [故障排除](#故障排除)

---

## 什么是 MCP Diagnoser

**MCP Diagnoser** 是一个功能强大的 Model Context Protocol (MCP) 服务器，专为诊断和故障排除设计。它可以帮助开发者和 AI 助手：

- 🔍 **诊断 MCP 服务器问题** - 检测安装、依赖、配置问题
- 📦 **包管理诊断** - 支持 12 种包管理器（npm, pip, cargo 等）
- 🌐 **网络搜索** - 多引擎搜索、网页爬取
- 🎭 **Playwright 诊断** - 浏览器自动化问题检测
- 🛠️ **自动修复** - 智能建议和一键修复
- 🌍 **多语言支持** - 支持 10 种编程语言运行时检查

### 核心特性

| 功能 | 描述 | 状态 |
|-----|------|------|
| 服务器诊断 | 检查 MCP 服务器配置和连接 | ✅ |
| 包诊断 | 诊断 12 种包管理器的包状态 | ✅ |
| 语言检查 | 检查 10 种编程语言运行时 | ✅ |
| 自动修复 | 提供修复建议并执行 | ✅ |
| 网络搜索 | 多引擎搜索和网页爬取 | ✅ |
| Playwright | 浏览器诊断和安装 | ✅ |

---

## 快速开始

### 1. 安装

```bash
# 全局安装（推荐）
npm install -g mcp-diagnoser

# 或从源码安装
git clone https://github.com/YOUR_USERNAME/mcp-diagnoser.git
cd mcp-diagnoser
npm install
npm run build
npm link
```

### 2. 配置 MCP

在你的 MCP 配置文件（`~/.mcp.json` 或项目中的 `.mcp.json`）中添加：

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "mcp-diagnoser",
      "args": ["check"],
      "type": "stdio"
    }
  }
}
```

### 3. 验证

在支持 MCP 的客户端（如 Claude Desktop）中，请求诊断：

```
请帮我诊断所有 MCP 服务器
```

---

## MCP 服务器配置

### 基础配置

#### 最小配置

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "mcp-diagnoser"
    }
  }
}
```

#### 推荐配置

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "mcp-diagnoser",
      "args": ["check"],
      "type": "stdio",
      "env": {
        "FORCE_COLOR": "1"
      }
    }
  }
}
```

### 高级配置

#### 使用自定义配置文件

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "mcp-diagnoser",
      "args": ["check", "--config", "/path/to/custom/.mcp.json"],
      "type": "stdio"
    }
  }
}
```

#### 启用详细模式

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "mcp-diagnoser",
      "args": ["check", "--verbose"],
      "type": "stdio"
    }
  }
}
```

#### JSON 输出模式

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "mcp-diagnoser",
      "args": ["check", "--json"],
      "type": "stdio"
    }
  }
}
```

### 平台特定配置

#### Windows

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": ["C:\\Users\\YourName\\AppData\\Roaming\\npm\\node_modules\\mcp-diagnoser\\dist\\index.js", "check"]
    }
  }
}
```

#### macOS

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "/usr/local/bin/mcp-diagnoser",
      "args": ["check"]
    }
  }
}
```

#### Linux

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "/usr/local/bin/mcp-diagnoser",
      "args": ["check"]
    }
  }
}
```

---

## 可用工具

MCP Diagnoser 提供以下工具供 AI 助手调用：

### 诊断工具（5 个）

| 工具 | CLI | MCP | 描述 |
|-----|-----|-----|------|
| **diagnose_all** | ✅ | ✅ | 诊断所有 MCP 服务器 |
| **diagnose_server** | ✅ | ✅ | 诊断特定服务器 |
| **fix_server** | ✅ | ✅ | 自动修复服务器问题 |
| **check_language** | ✅ | ✅ | 检查特定语言运行时 |
| **check_all_languages** | ✅ | ✅ | 检查所有 10 种语言 |

### 包管理工具（3 个）

| 工具 | CLI | MCP | 描述 |
|-----|-----|-----|------|
| **diagnose_packages** | ✅ | ✅ | 诊断所有包（12 种包管理器） |
| **check_package_managers** | ✅ | ✅ | 列出可用包管理器 |
| **diagnose_package** | ✅ | ✅ | 诊断特定包 |

### 搜索工具（1 个）

| 工具 | CLI | MCP | 描述 |
|-----|-----|-----|------|
| **search_mcp_packages** | ✅ | ✅ | 搜索 MCP 包 |

### Playwright 工具（1 个）

| 工具 | CLI | MCP | 描述 |
|-----|-----|-----|------|
| **diagnose_playwright** | ✅ | ✅ | 诊断 Playwright |

### 网络工具（4 个）- 新增！

| 工具 | CLI | MCP | 描述 |
|-----|-----|-----|------|
| **web_search** | ✅ | ✅ | 多引擎网络搜索 |
| **crawl_website** | ✅ | ✅ | 爬取网站 |
| **search_website_content** | ✅ | ✅ | 搜索网站内容 |
| **extract_website_info** | ✅ | ✅ | 提取网站信息 |

**MCP 工具总数**: 14 个 ✅

---

## 使用示例

### 场景 1: 新环境设置

**用户**: 我刚安装了 MCP，如何检查一切正常？

**AI 助手**:
```
我来帮你检查 MCP 环境。

正在运行全面诊断...

[调用 diagnose_all 工具]

诊断结果：
✅ 33 个服务器中 32 个正常
✅ 8/10 编程语言可用
✅ 33 个包已安装

建议：
- 安装 .NET 运行时（可选）
- 配置 npm 镜像源加速
```

### 场景 2: 服务器启动失败

**用户**: playwright 服务器无法启动

**AI 助手**:
```
让我诊断 playwright 服务器的问题。

[调用 diagnose_server 工具，参数：server_name="playwright"]

发现问题：
❌ Playwright 未安装
❌ Chromium 浏览器缺失

正在修复...

[调用 fix_server 工具]

✅ 已安装 Playwright
✅ 已安装 Chromium 浏览器

现在可以正常使用了！
```

### 场景 3: 包依赖冲突

**用户**: 安装包时出现依赖冲突

**AI 助手**:
```
我来检查包依赖问题。

[调用 diagnose_packages 工具]

发现依赖冲突：
⚠️ requests 需要 urllib3<3, 但已安装 3.0.0

建议修复：
pip install "urllib3<3"
```

### 场景 4: 查找 MCP 包

**用户**: 有没有操作 GitHub 的 MCP 包？

**AI 助手**:
```
让我搜索 GitHub 相关的 MCP 包。

[调用 search_mcp_packages 工具，参数：query="github"]

找到以下包：

1. @modelcontextprotocol/server-github
   - GitHub 官方 MCP 服务器
   - 28k+ 下载
   - 仓库：github/github-mcp-server

2. idosal/git-mcp
   - GitMCP 远程 MCP 服务器
   - 7.7k+ 下载
   - 仓库：idosal/git-mcp

推荐安装第一个官方包。
```

### 场景 5: 检查编程语言环境

**用户**: 我的系统支持哪些编程语言？

**AI 助手**:
```
让我检查所有编程语言环境。

[调用 check_all_languages 工具]

结果：
✅ JavaScript/TypeScript (Node.js v22.22.1)
✅ Python (3.13.12)
✅ Java (25.0.2)
✅ Go (1.26.1)
✅ Rust/Cargo (1.94.0)
❌ .NET (未安装)
❌ Ruby (未安装)
❌ PHP (未安装)
❌ Swift (未安装)
❌ Kotlin (未安装)

5/10 种语言可用
```

---

## 最佳实践

### 1. 配置优化

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "mcp-diagnoser",
      "args": ["check", "--verbose"],
      "type": "stdio",
      "env": {
        "FORCE_COLOR": "1",
        "NO_COLOR": "0"
      }
    }
  }
}
```

### 2. 定期诊断

建议定期运行诊断：
- 每天：快速检查 (`diagnose_all`)
- 每周：完整检查 (`check_all_languages` + `diagnose_packages`)
- 安装新包后：包诊断 (`diagnose_packages`)

### 3. 自动修复

对于常见问题，可以直接使用自动修复：
```
修复所有 MCP 服务器问题
```

### 4. 使用 JSON 输出

在自动化脚本中使用 JSON 输出：
```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "mcp-diagnoser",
      "args": ["check", "--json"]
    }
  }
}
```

### 5. 组合使用

组合多个工具获得完整信息：
```
1. 先运行 diagnose_all 获取总体状态
2. 对问题服务器运行 diagnose_server
3. 使用 fix_server 修复
4. 最后运行 check_all_languages 验证环境
```

---

## 故障排除

### 问题 1: MCP 服务器未响应

**症状**: AI 助手无法调用诊断工具

**解决方案**:
1. 检查 MCP 配置是否正确
2. 验证 mcp-diagnoser 是否全局安装
3. 运行 `mcp-diagnoser --version` 测试
4. 查看日志文件

### 问题 2: 诊断结果不准确

**症状**: 显示包已安装但实际未安装

**解决方案**:
1. 使用 `--verbose` 模式查看详细日志
2. 手动运行 `mcp-diagnoser package 包名` 验证
3. 清除 npm 缓存：`npm cache clean --force`

### 问题 3: 自动修复失败

**症状**: fix_server 命令执行失败

**解决方案**:
1. 检查是否有管理员权限
2. 手动执行建议的命令
3. 查看详细错误信息

### 问题 4: 搜索结果为空

**症状**: search_mcp_packages 返回空结果

**解决方案**:
1. 尝试不同的关键词
2. 更换搜索源（npm/github）
3. 检查网络连接

### 问题 5: 输出乱码

**症状**: 中文输出显示乱码

**解决方案**:
1. 设置环境变量：`export LANG=zh_CN.UTF-8`
2. 使用 `--no-color` 禁用颜色
3. 检查终端编码设置

---

## 命令参考

### CLI 命令

```bash
# 诊断命令
mcp-diagnoser check              # 诊断所有服务器
mcp-diagnoser server <name>      # 诊断特定服务器
mcp-diagnoser languages          # 检查语言运行时
mcp-diagnoser fix-all            # 自动修复所有问题

# 包诊断
mcp-diagnoser packages           # 诊断所有包
mcp-diagnoser package <name>     # 诊断特定包
mcp-diagnoser package-managers   # 列出包管理器
mcp-diagnoser install-missing    # 安装缺失的包

# 搜索
mcp-diagnoser search <query>     # 搜索 MCP 包
mcp-diagnoser popular            # 显示热门包
mcp-diagnoser install <package>  # 安装包

# Playwright
mcp-diagnoser playwright         # 诊断 Playwright
mcp-diagnoser playwright-install # 安装浏览器

# 网络搜索
mcp-diagnoser web-search <query> # 搜索网页
mcp-diagnoser crawl <url>        # 爬取网站
```

### 全局选项

```bash
-c, --config <path>     # 配置文件路径
-v, --verbose          # 详细输出
-j, --json             # JSON 输出
--fix                  # 自动修复
--deep                 # 深度诊断
```

---

## 更新日志

### v1.3.0 (当前版本)
- ✅ 新增包诊断功能（12 种包管理器）
- ✅ 新增依赖冲突检测
- ✅ 新增安装错误分析
- ✅ 新增一键安装缺失包
- ✅ 增强 MCP 服务器说明文档

### v1.2.0
- ✅ MCP 包搜索功能
- ✅ Playwright 诊断
- ✅ 网络搜索和爬取

### v1.0.0
- ✅ 初始版本
- ✅ 10 种语言支持
- ✅ 自动修复功能

---

## 支持

- **作者**: Lan
- **GitHub**: https://github.com/YOUR_USERNAME/mcp-diagnoser
- **npm**: https://www.npmjs.com/package/mcp-diagnoser
- **问题反馈**: https://github.com/YOUR_USERNAME/mcp-diagnoser/issues

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**最后更新**: 2026-03-20  
**版本**: 1.3.0  
**作者**: Lan
