# MCP Diagnoser v2.1.0 - 快速开始指南

## 🚀 5 分钟快速开始

### 步骤 1: 安装

```bash
# 进入项目目录
cd mcp-diagnoser/.worktrees/mcp-first-redesign

# 安装依赖
npm install

# 编译
npm run build

# 全局安装（可选）
npm link
```

### 步骤 2: 验证安装

```bash
# 查看版本
mcp-diagnoser --version

# 查看帮助
mcp-diagnoser --help
```

### 步骤 3: 运行诊断

```bash
# 诊断所有 MCP 服务器
mcp-diagnoser check

# 网络诊断
mcp-diagnoser network

# 性能分析
mcp-diagnoser performance
```

---

## 💡 常用命令

### MCP 服务器诊断

```bash
# 快速诊断
mcp-diagnoser check

# 详细诊断
mcp-diagnoser check --verbose

# JSON 输出
mcp-diagnoser check --json > report.json

# 自动修复
mcp-diagnoser fix-all
```

### 网络诊断

```bash
# 检查网络
mcp-diagnoser network

# JSON 输出（用于自动化）
mcp-diagnoser network --json > network.json
```

### 性能分析

```bash
# 分析系统性能
mcp-diagnoser performance

# 查看 Top 进程
# 输出中自动显示
```

### 日志分析

```bash
# 分析应用日志
mcp-diagnoser logs /path/to/app.log

# 限制错误数量
mcp-diagnoser logs /path/to/app.log --max-errors 50
```

### 搜索功能

```bash
# 搜索 MCP 包
mcp-diagnoser search playwright

# 查看热门包
mcp-diagnoser popular --limit 10

# 安装 MCP 包
mcp-diagnoser install @playwright/mcp -g
```

### Playwright

```bash
# 诊断 Playwright
mcp-diagnoser playwright

# 安装浏览器
mcp-diagnoser playwright-install
```

---

## 🔧 配置 MCP 客户端

### Claude Desktop 配置

编辑 `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-diagnoser": {
      "command": "node",
      "args": [
        "C:/path/to/mcp-diagnoser/.worktrees/mcp-first-redesign/dist/bin/mcp-server.js"
      ]
    }
  }
}
```

### 配置路径

| 系统 | 配置文件路径 |
|------|-------------|
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Linux** | `~/.config/claude/claude_desktop_config.json` |

---

## 📊 使用场景

### 场景 1: MCP 服务器无法连接

```bash
# 1. 诊断服务器
mcp-diagnoser check --verbose

# 2. 检查网络
mcp-diagnoser network

# 3. 查看日志
mcp-diagnoser logs /path/to/mcp.log
```

### 场景 2: 系统运行缓慢

```bash
# 1. 分析性能
mcp-diagnoser performance

# 2. 查看高 CPU 进程
# 输出中显示 "Top CPU Consumers"

# 3. 分析系统日志
mcp-diagnoser logs /var/log/syslog --max-errors 100
```

### 场景 3: 研究代码问题

```bash
# 1. 搜索代码
mcp-diagnoser web-search "React useEffect cleanup" \
  --engine github,stackoverflow

# 2. 搜索 MCP 包
mcp-diagnoser search react mcp

# 3. 安装找到的包
mcp-diagnoser install <package-name> -g
```

### 场景 4: 包依赖审计

```bash
# 1. 诊断所有包
mcp-diagnoser packages

# 2. 查看缺失的包
# 输出中显示 "Missing Packages"

# 3. 一键安装
mcp-diagnoser install-missing
```

---

## 🎯 最佳实践

### 1. 定期诊断

```bash
# 每天运行一次诊断
mcp-diagnoser check --json > daily-report.json
```

### 2. 使用缓存

```bash
# 搜索自动使用缓存
# 缓存 TTL: 3600 秒（1 小时）

# 查看缓存统计
mcp-diagnoser search-cache --stats

# 清除缓存
mcp-diagnoser search-cache --clear
```

### 3. 自动化脚本

```bash
#!/bin/bash
# daily-check.sh

DATE=$(date +%Y-%m-%d)
mcp-diagnoser check --json > report-$DATE.json
mcp-diagnoser network --json >> report-$DATE.json
mcp-diagnoser performance --json >> report-$DATE.json
```

### 4. 日志轮转

```bash
# 分析前压缩旧日志
gzip /var/log/app.log.1

# 分析当前日志
mcp-diagnoser logs /var/log/app.log --max-lines 10000
```

---

## ❓ 常见问题

### Q: 安装后命令不可用？

```bash
# 检查 npm 全局路径
npm config get prefix

# 添加到 PATH（Windows）
setx PATH "%PATH%;C:\Users\<user>\AppData\Roaming\npm"
```

### Q: 搜索功能失败？

```bash
# 检查 curl 是否安装
curl --version

# 使用备用引擎
mcp-diagnoser web-search "query" --engine duckduckgo
```

### Q: Playwright 浏览器安装失败？

```bash
# Linux: 安装系统依赖
npx playwright install --with-deps

# Windows/Mac: 直接安装
npx playwright install
```

### Q: 日志分析太慢？

```bash
# 限制分析行数
mcp-diagnoser logs /path/to/log --max-lines 1000

# 只分析错误
mcp-diagnoser logs /path/to/log --max-errors 10
```

---

## 📚 更多资源

- **完整文档**: `FINAL_RELEASE_v2.1.0.md`
- **快速参考**: `QUICK_REFERENCE_v2.1.md`
- **增强文档**: `ENHANCEMENT_DOCUMENTATION.md`
- **示例配置**: `.mcp-server-config.example.json`

---

## 🆘 获取帮助

```bash
# 查看所有命令
mcp-diagnoser --help

# 查看特定命令帮助
mcp-diagnoser <command> --help

# 报告问题
# 收集诊断信息
mcp-diagnoser check --json > issue.json
mcp-diagnoser network --json >> issue.json
```

---

## 📧 联系方式

- **作者**: Lan
- **邮箱**: 3314844@gmail.com
- **版本**: 2.1.0

---

**祝您使用愉快！** 🎉
