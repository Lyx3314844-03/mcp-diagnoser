# MCP Diagnoser - 快速参考卡片

**作者**: Lan | **邮箱**: 3314844@gmail.com | **版本**: 1.3.0

---

## 🚀 快速安装

```bash
# 一键安装（推荐）
npm install -g mcp-diagnoser

# 验证安装
mcp-diagnoser --version
```

---

## 📋 MCP 配置

### 基础配置 (~/.mcp.json)

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "mcp-diagnoser",
      "args": ["check"]
    }
  }
}
```

### 高级配置

```json
{
  "mcpServers": {
    "diagnoser": {
      "command": "mcp-diagnoser",
      "args": ["check", "--verbose"],
      "type": "stdio",
      "env": {
        "FORCE_COLOR": "1"
      }
    }
  }
}
```

---

## 🛠️ 常用命令

### 诊断命令

| 命令 | 说明 | 示例 |
|-----|------|------|
| `check` | 诊断所有服务器 | `mcp-diagnoser check` |
| `server <名>` | 诊断特定服务器 | `mcp-diagnoser server playwright` |
| `languages` | 检查语言运行时 | `mcp-diagnoser languages` |
| `fix-all` | 自动修复所有问题 | `mcp-diagnoser fix-all` |

### 包管理命令

| 命令 | 说明 | 示例 |
|-----|------|------|
| `packages` | 诊断所有包 | `mcp-diagnoser packages` |
| `package <名>` | 诊断特定包 | `mcp-diagnoser package requests` |
| `package-managers` | 列出包管理器 | `mcp-diagnoser package-managers` |
| `install-missing` | 安装缺失包 | `mcp-diagnoser install-missing` |

### 搜索命令

| 命令 | 说明 | 示例 |
|-----|------|------|
| `search <词>` | 搜索 MCP 包 | `mcp-diagnoser search github` |
| `popular` | 显示热门包 | `mcp-diagnoser popular` |
| `install <包>` | 安装包 | `mcp-diagnoser install @playwright/mcp` |

### Playwright 命令

| 命令 | 说明 | 示例 |
|-----|------|------|
| `playwright` | 诊断 Playwright | `mcp-diagnoser playwright` |
| `playwright-install` | 安装浏览器 | `mcp-diagnoser playwright-install` |

### 网络搜索命令

| 命令 | 说明 | 示例 |
|-----|------|------|
| `web-search <词>` | 搜索网页 | `mcp-diagnoser web-search "MCP"` |
| `crawl <url>` | 爬取网站 | `mcp-diagnoser crawl https://example.com` |

---

## 🌍 支持的语言

| 语言 | 运行时 | 状态 |
|-----|------|------|
| JavaScript/TypeScript | Node.js 18+ | ✅ |
| Python | Python 3.8+ | ✅ |
| Java | JDK 11+ | ✅ |
| Go | Go 1.20+ | ✅ |
| Rust | Cargo 1.70+ | ✅ |
| C#/.NET | .NET 6+ | ✅ |
| Ruby | Ruby 3.0+ | ✅ |
| PHP | PHP 8.0+ | ✅ |
| Swift | Swift 5.8+ | ✅ |
| Kotlin | Kotlin 1.8+ | ✅ |

---

## 📦 支持的包管理器

| 包管理器 | 命令 | 平台 |
|---------|------|------|
| npm | npm install -g | 所有 |
| yarn | yarn global add | 所有 |
| pnpm | pnpm add -g | 所有 |
| pip | pip install | 所有 |
| pip3 | pip3 install | 所有 |
| uv | uv pip install | 所有 |
| uvx | uv tool install | 所有 |
| cargo | cargo install | 所有 |
| go | go install | 所有 |
| dotnet | dotnet tool install -g | 所有 |
| gem | gem install | 所有 |
| composer | composer global require | 所有 |

---

## 💡 常用场景

### 场景 1: 新环境检查

```bash
# 完整诊断
mcp-diagnoser check

# 检查语言
mcp-diagnoser languages

# 检查包
mcp-diagnoser packages
```

### 场景 2: 服务器故障

```bash
# 诊断特定服务器
mcp-diagnoser server <服务器名>

# 自动修复
mcp-diagnoser fix-all
```

### 场景 3: 包问题

```bash
# 诊断所有包
mcp-diagnoser packages

# 安装缺失包
mcp-diagnoser install-missing

# 诊断特定包
mcp-diagnoser package <包名>
```

### 场景 4: 查找 MCP 包

```bash
# 搜索包
mcp-diagnoser search <关键词>

# 查看热门包
mcp-diagnoser popular

# 安装包
mcp-diagnoser install <包名>
```

---

## 🔧 全局选项

```bash
-c, --config <path>     # 配置文件路径
-v, --verbose          # 详细输出
-j, --json             # JSON 格式输出
--fix                  # 自动修复
--deep                 # 深度诊断
```

---

## 🌐 平台安装

### Windows

```powershell
npm install -g mcp-diagnoser
```

### macOS

```bash
# 使用 Homebrew
brew install node@20
npm install -g mcp-diagnoser

# 或使用安装脚本
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/install.sh | bash
```

### Linux

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g mcp-diagnoser

# 通用脚本
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/install.sh | bash
```

---

## 🐛 故障排除

### 权限错误

```bash
# Linux/macOS
sudo npm install -g mcp-diagnoser

# 或配置用户目录
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### 网络问题

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
```

### 版本过低

```bash
# 使用 nvm 升级 Node.js
nvm install 20
nvm use 20
npm install -g mcp-diagnoser
```

---

## 📞 获取帮助

```bash
# 显示帮助
mcp-diagnoser --help

# 显示版本
mcp-diagnoser --version

# 查看命令详情
mcp-diagnoser <command> --help
```

---

## 🔗 相关链接

- **GitHub**: https://github.com/YOUR_USERNAME/mcp-diagnoser
- **npm**: https://www.npmjs.com/package/mcp-diagnoser
- **问题反馈**: https://github.com/YOUR_USERNAME/mcp-diagnoser/issues
- **详细文档**: 参见 README.md 和 MCP_SERVER_GUIDE.md

---

## 📊 快速对照表

### 诊断输出符号

| 符号 | 含义 |
|-----|------|
| ✅ | 正常/已安装 |
| ❌ | 错误/缺失 |
| ⚠️ | 警告 |
| ℹ️ | 信息 |

### 状态码

| 状态 | 含义 |
|-----|------|
| ok | 正常 |
| warning | 警告 |
| error | 错误 |
| unknown | 未知 |

---

**最后更新**: 2026-03-20  
**版本**: 1.3.0  
**作者**: Lan
