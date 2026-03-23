# MCP Diagnoser v2.1 增强功能快速参考

## 🎯 新增功能一览

本次增强为 mcp-diagnoser 添加了 3 个核心诊断工具和 1 个工具注册系统：

| 工具 | 类型 | 描述 |
|------|------|------|
| **network** | CLI/MCP | 网络连通性诊断 |
| **performance** | CLI/MCP | 系统性能分析 |
| **logs** | CLI/MCP | 日志文件分析 |
| **tool-registry** | 系统 | 工具注册和调度 |

---

## 📦 快速安装

```bash
cd mcp-diagnoser/.worktrees/mcp-first-redesign
npm install
npm run build
npm link  # 全局安装（可选）
```

---

## 🚀 CLI 命令

### 1️⃣ 网络诊断 (`network`)

诊断网络连通性、DNS、延迟等问题。

```bash
# 基本用法
mcp-diagnoser network

# JSON 输出
mcp-diagnoser network --json
```

**输出示例：**
```
🌐 Network Diagnostic Report

📡 Connectivity Status:
  Internet: ✅
  DNS: ✅
  Localhost: ✅

🔧 DNS Servers:
  - 8.8.8.8
  - 1.1.1.1

⏱️  Latency:
  Google: 25ms
  Cloudflare: 18ms
```

---

### 2️⃣ 性能分析 (`performance`)

分析 CPU、内存、磁盘、进程等系统资源。

```bash
# 基本用法
mcp-diagnoser performance

# JSON 输出
mcp-diagnoser performance --json
```

**输出示例：**
```
⚡ Performance Analysis Report

🖥️  CPU:
  Usage: 45%
  Cores: 8
  Load Avg: 1.25, 1.50, 1.30

💾 Memory:
  Total: 16.00 GB
  Used: 8.50 GB (53%)

💿 Disk:
  Used: 256.00 GB (50%)
```

---

### 3️⃣ 日志分析 (`logs`)

分析日志文件中的错误、警告和模式。

```bash
# 分析单个文件
mcp-diagnoser logs /path/to/app.log

# 限制分析行数
mcp-diagnoser logs /path/to/app.log --max-lines 5000

# 限制错误数量
mcp-diagnoser logs /path/to/app.log --max-errors 50

# JSON 输出
mcp-diagnoser logs /path/to/app.log --json
```

**输出示例：**
```
📋 Log Analysis Report

📊 Statistics:
  Total Lines: 15234
  Parsed Entries: 14890

📈 Log Levels:
  ERROR: 45
  WARN:  123
  INFO:  12000

🔁 Repeated Patterns:
  1. 🟡 (25x) Connection timeout...
```

---

## 🔧 MCP 工具

在 MCP 客户端中可用的新工具：

### diagnose_network
```json
{
  "name": "diagnose_network",
  "arguments": {
    "includeSuggestions": true
  }
}
```

### analyze_performance
```json
{
  "name": "analyze_performance",
  "arguments": {
    "includeProcesses": true,
    "includeNodejs": true
  }
}
```

### analyze_logs
```json
{
  "name": "analyze_logs",
  "arguments": {
    "logPath": "/path/to/log",
    "maxLines": 10000,
    "maxErrors": 100
  }
}
```

---

## 📁 新增文件

```
src/
├── mcp/
│   ├── tool-registry.ts         # ✨ 新工具注册表
│   └── server-enhanced.ts       # ✨ 新增强服务器
├── tools/
│   ├── network-diagnoser.ts     # ✨ 新网络诊断
│   ├── performance-analyzer.ts  # ✨ 新性能分析
│   └── log-analyzer.ts          # ✨ 新日志分析
└── index.ts                     # 已更新（添加新命令）
```

---

## 🛠️ 使用场景

### 场景 1：MCP 服务器无法连接

```bash
# 1. 检查网络
mcp-diagnoser network

# 2. 检查系统资源
mcp-diagnoser performance

# 3. 查看日志
mcp-diagnoser logs /path/to/mcp.log
```

### 场景 2：系统运行缓慢

```bash
# 1. 分析性能瓶颈
mcp-diagnoser performance

# 2. 查看错误日志
mcp-diagnoser logs /var/log/syslog --max-errors 100
```

### 场景 3：应用崩溃排查

```bash
# 1. 检查网络连通性
mcp-diagnoser network

# 2. 分析应用日志
mcp-diagnoser logs ./logs/app.log --json > crash-report.json
```

---

## 🎨 输出格式

### 人类可读格式（默认）
```bash
mcp-diagnoser network
```

### JSON 格式（用于自动化）
```bash
mcp-diagnoser network --json > network-status.json
```

---

## 📊 工具对比

| 特性 | network | performance | logs |
|------|---------|-------------|------|
| **CLI** | ✅ | ✅ | ✅ |
| **MCP** | ✅ | ✅ | ✅ |
| **JSON 输出** | ✅ | ✅ | ✅ |
| **自动修复建议** | ✅ | ✅ | ✅ |
| **问题检测** | ✅ | ✅ | ✅ |

---

## 🔍 常见问题

### Q: 为什么网络诊断显示 DNS 失败？
A: 检查你的 DNS 设置，可以尝试使用公共 DNS（8.8.8.8 或 1.1.1.1）。

### Q: 性能分析显示内存使用率高怎么办？
A: 查看 Top CPU 消费者列表，关闭不必要的进程或增加系统内存。

### Q: 日志分析提示文件太大？
A: 使用 `--max-lines` 参数限制分析行数，或先压缩/轮转日志文件。

---

## 📝 待实现功能

以下功能已在计划中，将在未来版本实现：

- [ ] 更多搜索引擎支持
- [ ] 依赖关系可视化
- [ ] MCP 服务器健康监控
- [ ] 配置自动修复
- [ ] 错误趋势分析

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 报告问题
```bash
# 收集诊断信息
mcp-diagnoser network --json > issue-network.json
mcp-diagnoser performance --json > issue-performance.json
```

### 添加新工具
1. 在 `src/tools/` 创建工具
2. 在 `src/mcp/tool-registry.ts` 注册
3. 在 `src/index.ts` 添加 CLI 命令

---

## 📧 联系方式

- **作者**: Lan
- **邮箱**: 3314844@gmail.com
- **版本**: 2.1.0

---

## 📄 许可证

MIT License
