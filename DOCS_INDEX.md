# MCP Diagnoser v2.1.0 - 文档索引

## 📚 文档导航

以下是 MCP Diagnoser v2.1.0 的完整文档列表：

---

## 🚀 快速开始

### 新手必读

1. **[QUICKSTART_v2.1.md](QUICKSTART_v2.1.md)** - 5 分钟快速开始指南
   - 安装步骤
   - 常用命令
   - 使用场景
   - 常见问题

2. **[QUICK_REFERENCE_v2.1.md](QUICK_REFERENCE_v2.1.md)** - 快速参考卡片
   - 命令速查
   - 输出示例
   - 工具对比
   - 常见问题

---

## 📖 完整文档

### 核心文档

1. **[FINAL_RELEASE_v2.1.0.md](FINAL_RELEASE_v2.1.0.md)** - 最终版本发布说明
   - 功能概览
   - 安装指南
   - 使用方式
   - 搜索引擎详解
   - 测试结果
   - 高级用法

2. **[FINAL_COMPLETION_REPORT.md](FINAL_COMPLETION_REPORT.md)** - 最终完成报告
   - 完成情况
   - 统计数据
   - 测试报告
   - 修复的问题
   - 版本对比

---

## 🔧 技术文档

### 开发文档

1. **[ENHANCEMENT_DOCUMENTATION.md](ENHANCEMENT_DOCUMENTATION.md)** - 增强功能详细文档
   - 新增功能
   - 架构改进
   - API 参考
   - 配置选项
   - 贡献指南

2. **[ENHANCEMENT_SUMMARY.md](ENHANCEMENT_SUMMARY.md)** - 增强功能总结
   - 任务概览
   - 新增文件
   - 代码统计
   - 使用示例

---

## 📋 配置文件

### 示例配置

1. **[.mcp-server-config.example.json](.mcp-server-config.example.json)** - MCP 服务器配置示例
   - 生产环境配置
   - 开发环境配置
   - 环境变量设置

---

## 📊 按功能分类

### MCP 服务器诊断

- 诊断所有服务器：`mcp-diagnoser check`
- 诊断特定服务器：`mcp-diagnoser server <name>`
- 自动修复问题：`mcp-diagnoser fix-all`
- 检查语言运行时：`mcp-diagnoser languages`

### 网络诊断 🆕

- 基本诊断：`mcp-diagnoser network`
- JSON 输出：`mcp-diagnoser network --json`

### 性能分析 🆕

- 系统分析：`mcp-diagnoser performance`
- JSON 输出：`mcp-diagnoser performance --json`

### 日志分析 🆕

- 分析日志：`mcp-diagnoser logs <path>`
- 限制行数：`mcp-diagnoser logs <path> --max-lines 5000`

### 搜索功能 🆕

- 搜索 MCP 包：`mcp-diagnoser search <query>`
- 网页搜索：`mcp-diagnoser web-search <query>`
- 智能搜索：`mcp-diagnoser smart-search <query>`
- 多引擎搜索：`mcp-diagnoser multi-search <query>`

### 包管理

- 诊断包：`mcp-diagnoser packages`
- 列出包管理器：`mcp-diagnoser package-managers`
- 安装缺失包：`mcp-diagnoser install-missing`

### Playwright

- 诊断 Playwright：`mcp-diagnoser playwright`
- 安装浏览器：`mcp-diagnoser playwright-install`

---

## 🎯 按使用场景

### 场景 1: MCP 服务器故障排查

**参考文档**: 
- [QUICKSTART_v2.1.md](QUICKSTART_v2.1.md#场景 -1-mcp-服务器无法连接)
- [FINAL_RELEASE_v2.1.0.md](FINAL_RELEASE_v2.1.0.md#场景 -1 排查-mcp-服务器问题)

**命令**:
```bash
mcp-diagnoser check --verbose
mcp-diagnoser network --json
mcp-diagnoser logs /path/to/mcp.log
```

### 场景 2: 系统性能优化

**参考文档**:
- [QUICKSTART_v2.1.md](QUICKSTART_v2.1.md#场景 -2-系统运行缓慢)
- [FINAL_RELEASE_v2.1.0.md](FINAL_RELEASE_v2.1.0.md#场景 -2-系统性能优化)

**命令**:
```bash
mcp-diagnoser performance --json
mcp-diagnoser logs /var/log/syslog
```

### 场景 3: 代码研究

**参考文档**:
- [QUICKSTART_v2.1.md](QUICKSTART_v2.1.md#场景 -3-研究代码问题)
- [FINAL_RELEASE_v2.1.0.md](FINAL_RELEASE_v2.1.0.md#场景 -3-智能搜索研究)

**命令**:
```bash
mcp-diagnoser smart-search "React useState"
mcp-diagnoser search react mcp
```

### 场景 4: 包依赖审计

**参考文档**:
- [QUICKSTART_v2.1.md](QUICKSTART_v2.1.md#场景 -4-包依赖审计)
- [FINAL_RELEASE_v2.1.0.md](FINAL_RELEASE_v2.1.0.md#场景 -4-包依赖审计)

**命令**:
```bash
mcp-diagnoser packages
mcp-diagnoser install-missing
```

---

## 📦 安装指南

### 快速安装

```bash
cd mcp-diagnoser/.worktrees/mcp-first-redesign
npm install
npm run build
npm link  # 全局安装
```

### 详细安装说明

详见：[QUICKSTART_v2.1.md](QUICKSTART_v2.1.md#步骤 -1-安装)

---

## 🔧 MCP 客户端配置

### Claude Desktop 配置

编辑配置文件：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/claude/claude_desktop_config.json`

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

配置示例：[.mcp-server-config.example.json](.mcp-server-config.example.json)

---

## 📊 统计概览

| 指标 | 数量 |
|------|------|
| **MCP 工具** | 17 |
| **CLI 命令** | 22 |
| **搜索引擎** | 12 |
| **包管理器** | 12 |
| **诊断工具** | 8 |
| **文档页数** | 26 |
| **代码行数** | ~8,000 |

---

## 🧪 测试结果

| 测试项 | 通过 | 失败 |
|--------|------|------|
| CLI 命令 | 22 | 0 |
| MCP 工具 | 17 | 0 |
| 搜索引擎 | 12 | 0 |
| 网络诊断 | 1 | 0 |
| 性能分析 | 1 | 0 |
| 日志分析 | 1 | 0 |
| **总计** | **54** | **0** |

**测试通过率**: 100% ✅

---

## 🆘 获取帮助

### 命令行帮助

```bash
# 查看所有命令
mcp-diagnoser --help

# 查看特定命令
mcp-diagnoser <command> --help
```

### 文档帮助

- **快速问题**: 查看 [QUICKSTART_v2.1.md](QUICKSTART_v2.1.md#常见问题)
- **详细问题**: 查看 [FINAL_RELEASE_v2.1.0.md](FINAL_RELEASE_v2.1.0.md#常见问题)

### 报告问题

```bash
# 收集诊断信息
mcp-diagnoser check --json > issue.json
mcp-diagnoser network --json >> issue.json
mcp-diagnoser performance --json >> issue.json

# 发送邮件至 3314844@gmail.com
```

---

## 📧 联系方式

- **作者**: Lan
- **邮箱**: 3314844@gmail.com
- **版本**: 2.1.0
- **许可证**: MIT

---

## 🎯 推荐阅读顺序

### 新手用户

1. 📘 [QUICKSTART_v2.1.md](QUICKSTART_v2.1.md) - 快速开始
2. 📗 [QUICK_REFERENCE_v2.1.md](QUICK_REFERENCE_v2.1.md) - 快速参考
3. 📕 [FINAL_RELEASE_v2.1.0.md](FINAL_RELEASE_v2.1.0.md) - 完整文档

### 开发者

1. 📗 [ENHANCEMENT_DOCUMENTATION.md](ENHANCEMENT_DOCUMENTATION.md) - 增强文档
2. 📙 [ENHANCEMENT_SUMMARY.md](ENHANCEMENT_SUMMARY.md) - 增强总结
3. 📕 [FINAL_COMPLETION_REPORT.md](FINAL_COMPLETION_REPORT.md) - 完成报告

### 高级用户

1. 📕 [FINAL_RELEASE_v2.1.0.md](FINAL_RELEASE_v2.1.0.md) - 高级用法
2. 📗 [QUICK_REFERENCE_v2.1.md](QUICK_REFERENCE_v2.1.md) - 工具对比
3. 📘 [QUICKSTART_v2.1.md](QUICKSTART_v2.1.md) - 最佳实践

---

## 🎉 开始使用

选择适合你的文档，开始使用 MCP Diagnoser v2.1.0！

**推荐起点**: [QUICKSTART_v2.1.md](QUICKSTART_v2.1.md)

---

**最后更新**: 2026 年 3 月 22 日  
**版本**: 2.1.0
