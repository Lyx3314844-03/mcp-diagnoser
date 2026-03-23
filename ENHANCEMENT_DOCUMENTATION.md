# MCP Diagnoser 增强功能文档

## 概述

本次增强为 mcp-diagnoser 项目添加了多个新功能和改进，使其成为一个更全面的 MCP 服务器诊断和监控工具。

## 新增功能

### 1. 工具注册和调度系统 (`src/mcp/tool-registry.ts`)

**功能描述：**
- 集中化的工具注册和管理系统
- 支持工具分类（diagnosis、package、search、playwright、web、monitoring、config）
- 自动参数验证
- 统一的错误处理

**核心类：**
- `ToolRegistry` - 工具注册表
- `ToolDefinition` - 工具定义接口
- `ToolCategory` - 工具分类接口

**使用示例：**
```typescript
import { globalToolRegistry } from './tool-registry';

// 注册新工具
globalToolRegistry.register({
  name: 'my_tool',
  description: 'My custom tool',
  inputSchema: { ... },
  handler: async (args) => { ... }
}, 'diagnosis');
```

---

### 2. 网络诊断工具 (`src/tools/network-diagnoser.ts`)

**功能描述：**
- 互联网连接测试
- DNS 解析测试
- 延迟测试（Google DNS、Cloudflare DNS、本地）
- DNS 服务器检测
- 自动问题检测和建议生成

**诊断项目：**
| 项目 | 说明 |
|------|------|
| 本地连接 | 测试 127.0.0.1 可访问性 |
| DNS 解析 | 测试域名解析功能 |
| 互联网连接 | 测试外网连通性 |
| 延迟测试 | 测量到公共 DNS 的延迟 |
| DNS 服务器 | 列出配置的 DNS 服务器 |

**CLI 使用：**
```bash
mcp-diagnoser network
mcp-diagnoser network --json
```

**MCP 工具：**
```json
{
  "name": "diagnose_network",
  "arguments": {
    "includeSuggestions": true
  }
}
```

---

### 3. 性能分析工具 (`src/tools/performance-analyzer.ts`)

**功能描述：**
- CPU 使用率和负载分析
- 内存使用分析
- 磁盘使用分析
- 网络接口检测
- 进程分析（Top CPU 消费者）
- Node.js 内存指标
- 自动问题检测和优化建议

**监控指标：**
| 指标 | 说明 |
|------|------|
| CPU 使用率 | 实时 CPU 使用百分比 |
| CPU 负载 | 系统平均负载（Unix） |
| 内存使用 | 总内存、已用、剩余、使用率 |
| 磁盘使用 | 总空间、已用、剩余、使用率 |
| 网络接口 | 列出所有网络接口 |
| 进程信息 | 总进程数、Top CPU 消费者 |
| Node.js 内存 | 堆内存、RSS 等 |

**CLI 使用：**
```bash
mcp-diagnoser performance
mcp-diagnoser performance --json
```

**MCP 工具：**
```json
{
  "name": "analyze_performance",
  "arguments": {
    "includeProcesses": true,
    "includeNodejs": true
  }
}
```

---

### 4. 日志分析工具 (`src/tools/log-analyzer.ts`)

**功能描述：**
- 多格式日志解析
- 错误/警告/信息分类统计
- 重复错误模式检测
- 错误峰值检测
- 日志文件目录批量分析
- 自动生成修复建议

**分析能力：**
| 功能 | 说明 |
|------|------|
| 日志解析 | 支持多种日志格式 |
| 级别统计 | ERROR、WARN、INFO、DEBUG、TRACE |
| 模式检测 | 识别重复出现的错误 |
| 问题检测 | 大文件、错误峰值、缺失日志 |
| 批量分析 | 支持分析整个目录的日志文件 |

**CLI 使用：**
```bash
mcp-diagnoser logs /path/to/app.log
mcp-diagnoser logs /var/log --max-lines 5000
mcp-diagnoser logs /path/to/app.log --json
```

**MCP 工具：**
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

### 5. 增强的 MCP 服务器 (`src/mcp/server-enhanced.ts`)

**功能描述：**
- 集成所有新工具
- 统一的工具注册
- 完整的工具列表和调用处理

**可用工具列表：**

| 工具名称 | 分类 | 描述 |
|----------|------|------|
| `diagnose_all` | diagnosis | 诊断所有 MCP 服务器 |
| `diagnose_server` | diagnosis | 诊断特定 MCP 服务器 |
| `check_all_languages` | diagnosis | 检查 10 种编程语言运行时 |
| `diagnose_network` | diagnosis | 网络诊断 |
| `analyze_performance` | diagnosis | 性能分析 |
| `analyze_logs` | diagnosis | 日志分析 |
| `diagnose_packages` | package | 包依赖诊断 |
| `search_mcp_packages` | search | 搜索 MCP 包 |
| `diagnose_playwright` | playwright | Playwright 诊断 |
| `install_playwright_browsers` | playwright | 安装 Playwright 浏览器 |

---

## CLI 新增命令

### network - 网络诊断
```bash
# 基本用法
mcp-diagnoser network

# JSON 输出
mcp-diagnoser network --json
```

### performance - 性能分析
```bash
# 基本用法
mcp-diagnoser performance

# JSON 输出
mcp-diagnoser performance --json
```

### logs - 日志分析
```bash
# 分析单个日志文件
mcp-diagnoser logs /path/to/app.log

# 自定义参数
mcp-diagnoser logs /path/to/app.log --max-lines 5000 --max-errors 50

# JSON 输出
mcp-diagnoser logs /path/to/app.log --json
```

---

## 输出示例

### 网络诊断输出
```
🌐 Network Diagnostic Report

📡 Connectivity Status:
  Internet: ✅
  DNS: ✅
  Localhost: ✅

🔧 DNS Servers:
  - 8.8.8.8
  - 8.8.4.4

⏱️  Latency:
  Google (8.8.8.8): 25ms
  Cloudflare (1.1.1.1): 18ms
  Localhost: 1ms

💡 Suggestions:
  1. Network is healthy
```

### 性能分析输出
```
⚡ Performance Analysis Report

🖥️  CPU:
  Usage: 45%
  Cores: 8
  Model: Intel Core i7
  Speed: 2800 MHz
  Load Avg: 1.25, 1.50, 1.30

💾 Memory:
  Total: 16.00 GB
  Used: 8.50 GB (53%)
  Free: 7.50 GB

💿 Disk:
  Total: 512.00 GB
  Used: 256.00 GB (50%)
  Free: 256.00 GB

📊 Processes:
  Total: 156
  Top CPU Consumers:
    1. chrome - CPU: 15.2%, Memory: 1024.5MB
    2. node - CPU: 8.5%, Memory: 512.3MB
```

### 日志分析输出
```
📋 Log Analysis Report

📊 Statistics:
  Total Lines: 15234
  Parsed Entries: 14890
  Time Range: 2024-01-01 00:00:00 to 2024-01-01 23:59:59

📈 Log Levels:
  ERROR: 45
  WARN:  123
  INFO:  12000
  DEBUG: 2500
  TRACE: 222

🔁 Repeated Patterns:
  1. 🟡 (25x) Connection timeout to database...
  2. 🟡 (12x) Failed to parse JSON response...

⚠️  Issues Detected:
  1. 🟡 [repeated_errors] Repeated error detected (25 times)
     💡 Fix the underlying issue causing this error
```

---

## 架构改进

### 模块化设计
```
src/
├── mcp/
│   ├── server.ts           # 原服务器
│   ├── server-enhanced.ts  # 增强服务器
│   └── tool-registry.ts    # 工具注册表 (NEW)
├── tools/
│   ├── network-diagnoser.ts     # 网络诊断 (NEW)
│   ├── performance-analyzer.ts  # 性能分析 (NEW)
│   ├── log-analyzer.ts          # 日志分析 (NEW)
│   ├── package-diagnoser.ts     # 包诊断
│   ├── browser-search.ts        # 浏览器搜索
│   ├── enhanced-search.ts       # 增强搜索
│   ├── firecrawl-search.ts      # Firecrawl 搜索
│   ├── mcp-searcher.ts          # MCP 搜索器
│   └── web-crawler.ts           # 网页爬虫
├── core/
│   └── diagnoser.ts        # 核心诊断器
└── index.ts                # CLI 入口 (已更新)
```

---

## 配置选项

### 网络诊断配置
```typescript
{
  includeSuggestions: boolean  // 包含修复建议
}
```

### 性能分析配置
```typescript
{
  includeProcesses: boolean,   // 包含进程信息
  includeNodejs: boolean       // 包含 Node.js 指标
}
```

### 日志分析配置
```typescript
{
  logPath: string,             // 日志文件路径
  maxLines: number,            // 最大分析行数
  maxErrors: number            // 最大收集错误数
}
```

---

## 未来计划

### 待实现功能

1. **增强搜索功能**
   - 添加更多搜索引擎（Yahoo、Yandex 等）
   - 优化结果排序算法
   - 添加搜索结果聚类和去重

2. **改进包诊断功能**
   - 添加更多包管理器支持（nuget、hex 等）
   - 依赖关系可视化
   - 自动修复依赖冲突

3. **MCP 服务器健康监控**
   - 实时监控服务器状态
   - 自动重启故障服务器
   - 性能指标收集和分析

4. **配置验证和自动修复**
   - 验证 MCP 配置文件
   - 自动修复常见配置错误
   - 配置模板生成

5. **增强的错误报告**
   - 结构化错误日志
   - 错误趋势分析
   - 自动上报和统计

---

## 快速开始

### 安装
```bash
cd mcp-diagnoser/.worktrees/mcp-first-redesign
npm install
npm run build
npm link  # 全局安装
```

### 使用示例
```bash
# 网络诊断
mcp-diagnoser network

# 性能分析
mcp-diagnoser performance

# 日志分析
mcp-diagnoser logs /path/to/server.log

# MCP 服务器诊断
mcp-diagnoser check

# 搜索 MCP 包
mcp-diagnoser search playwright
```

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 添加新工具
1. 在 `src/tools/` 创建新工具文件
2. 在 `src/mcp/tool-registry.ts` 注册工具
3. 在 `src/index.ts` 添加 CLI 命令
4. 更新本文档

### 测试
```bash
npm test
```

---

## 变更日志

### v2.1.0 (本次增强)
- ✅ 新增工具注册和调度系统
- ✅ 新增网络诊断工具
- ✅ 新增性能分析工具
- ✅ 新增日志分析工具
- ✅ 增强 MCP 服务器集成
- ✅ 新增 CLI 命令（network、performance、logs）

### v2.0.0
- 多引擎搜索支持
- Playwright 诊断
- 包管理诊断
- 网页爬虫功能

---

## 许可证

MIT License

## 作者

Lan <3314844@gmail.com>
