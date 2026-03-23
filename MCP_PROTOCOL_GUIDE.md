# MCP Diagnoser - 真 MCP 协议使用指南

## 🎯 什么是 MCP 协议

**MCP (Model Context Protocol)** 是一种开放的 AI 模型上下文协议，用于标准化 AI 助手与外部工具/服务的通信。

**MCP Diagnoser v2.1.0** 完全实现了 MCP 协议规范，支持：
- ✅ Stdio 传输
- ✅ SSE (Server-Sent Events) 传输
- ✅ 工具调用 (Tools)
- ✅ 资源读取 (Resources)
- ✅ 订阅机制 (Subscriptions)

---

## 🚀 快速开始

### 1. 编译项目

```bash
cd mcp-diagnoser/.worktrees/mcp-first-redesign
npm install
npm run build
```

### 2. 启动 MCP 服务器

```bash
# 生产模式
npm run mcp-server

# 或开发模式
npm run mcp-server:dev
```

### 3. 配置 MCP 客户端

#### Claude Desktop 配置

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-diagnoser": {
      "command": "node",
      "args": [
        "C:/Users/Administrator/mcp-diagnoser/.worktrees/mcp-first-redesign/dist/mcp/server-true-mcp.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

---

## 📡 MCP 协议详解

### 协议架构

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │ ←JSON→  │  MCP Server  │ ←JSON→  │   Tools     │
│  (Claude)   │  RPC    │  (Diagnoser) │  Calls  │ (17 Tools)  │
└─────────────┘         └──────────────┘         └─────────────┘
```

### 消息格式

**请求**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

**响应**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [...]
  }
}
```

---

## 🔧 可用工具 (17 个)

### 诊断工具 (6 个)

#### 1. diagnose_all

诊断所有 MCP 服务器。

```json
{
  "name": "diagnose_all",
  "arguments": {
    "configPath": ".mcp.json",
    "verbose": false
  }
}
```

#### 2. diagnose_server

诊断特定 MCP 服务器。

```json
{
  "name": "diagnose_server",
  "arguments": {
    "serverName": "my-server",
    "configPath": ".mcp.json"
  }
}
```

#### 3. check_all_languages

检查 10 种编程语言运行时。

```json
{
  "name": "check_all_languages",
  "arguments": {}
}
```

#### 4. diagnose_network

诊断网络连通性。

```json
{
  "name": "diagnose_network",
  "arguments": {
    "includeSuggestions": true
  }
}
```

#### 5. analyze_performance

分析系统性能。

```json
{
  "name": "analyze_performance",
  "arguments": {
    "includeProcesses": true,
    "includeNodejs": true
  }
}
```

#### 6. analyze_logs

分析日志文件。

```json
{
  "name": "analyze_logs",
  "arguments": {
    "logPath": "/path/to/app.log",
    "maxLines": 10000,
    "maxErrors": 100
  }
}
```

---

### 包管理工具 (4 个)

#### 7. diagnose_packages

诊断包依赖和漏洞。

```json
{
  "name": "diagnose_packages",
  "arguments": {
    "path": "./package.json",
    "projectRoot": ".",
    "includeDev": true,
    "scanVulnerabilities": true,
    "timeout": 30
  }
}
```

#### 8. search_mcp_packages

搜索 MCP 包。

```json
{
  "name": "search_mcp_packages",
  "arguments": {
    "query": "playwright",
    "limit": 20,
    "source": "all"
  }
}
```

#### 9. list_package_managers

列出包管理器。

```json
{
  "name": "list_package_managers",
  "arguments": {}
}
```

#### 10. diagnose_playwright

诊断 Playwright。

```json
{
  "name": "diagnose_playwright",
  "arguments": {}
}
```

---

### 搜索工具 (5 个)

#### 11. web_search

多引擎网页搜索 (12 个引擎)。

```json
{
  "name": "web_search",
  "arguments": {
    "query": "React hooks",
    "engines": ["google", "bing"],
    "limit": 10,
    "language": "en",
    "useCache": true
  }
}
```

#### 12. smart_search

智能搜索 (自动选择引擎)。

```json
{
  "name": "smart_search",
  "arguments": {
    "query": "useEffect cleanup",
    "queryType": "code",
    "limit": 10
  }
}
```

#### 13. crawl_website

爬取网站。

```json
{
  "name": "crawl_website",
  "arguments": {
    "url": "https://example.com",
    "maxPages": 20,
    "maxDepth": 3,
    "sameDomain": true
  }
}
```

#### 14. search_website

搜索网站内容。

```json
{
  "name": "search_website",
  "arguments": {
    "url": "https://example.com",
    "query": "API documentation",
    "caseSensitive": false,
    "contextLines": 2
  }
}
```

#### 15. extract_website_info

提取网站信息。

```json
{
  "name": "extract_website_info",
  "arguments": {
    "url": "https://example.com",
    "extractEmails": true,
    "extractPhones": true,
    "extractLinks": true
  }
}
```

---

### 工具工具 (2 个)

#### 16. clear_search_cache

清除搜索缓存。

```json
{
  "name": "clear_search_cache",
  "arguments": {}
}
```

#### 17. get_search_cache_stats

获取缓存统计。

```json
{
  "name": "get_search_cache_stats",
  "arguments": {}
}
```

---

## 📚 资源 (Resources)

MCP Diagnoser 提供 3 个内置资源：

### 1. diagnoser://status

服务器状态。

```json
{
  "uri": "diagnoser://status"
}
```

**响应**:
```json
{
  "contents": [{
    "uri": "diagnoser://status",
    "mimeType": "application/json",
    "text": {
      "status": "ok",
      "version": "2.1.0",
      "tools": 17,
      "timestamp": "2026-03-22T12:00:00Z"
    }
  }]
}
```

### 2. diagnoser://tools

工具列表。

```json
{
  "uri": "diagnoser://tools"
}
```

### 3. diagnoser://cache/stats

缓存统计。

```json
{
  "uri": "diagnoser://cache/stats"
}
```

---

## 🔍 使用示例

### 示例 1: 诊断 MCP 服务器

**用户**: "帮我检查所有 MCP 服务器"

**Claude**:
```json
{
  "method": "tools/call",
  "params": {
    "name": "diagnose_all",
    "arguments": {
      "verbose": true
    }
  }
}
```

**响应**:
```json
{
  "content": [{
    "type": "text",
    "text": "{\n  \"servers\": [...],\n  \"hasIssues\": false\n}"
  }]
}
```

---

### 示例 2: 搜索代码

**用户**: "搜索 React useEffect 的最佳实践"

**Claude**:
```json
{
  "method": "tools/call",
  "params": {
    "name": "smart_search",
    "arguments": {
      "query": "React useEffect best practices",
      "queryType": "code",
      "limit": 10
    }
  }
}
```

**响应**: 返回 GitHub、Stack Overflow 的搜索结果

---

### 示例 3: 分析性能

**用户**: "我的电脑很慢，帮我分析一下"

**Claude**:
```json
{
  "method": "tools/call",
  "params": {
    "name": "analyze_performance",
    "arguments": {
      "includeProcesses": true
    }
  }
}
```

**响应**:
```
⚡ Performance Analysis Report

🖥️  CPU: 80%
💾 Memory: 94%
💿 Disk: 53%

Top CPU Consumers:
1. Chrome - 25%
2. Node - 15%
```

---

## 🛠️ 开发指南

### 添加新工具

1. **定义工具**:

```typescript
const MY_TOOL: Tool = {
  name: 'my_tool',
  description: 'My custom tool',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string' },
    },
  },
};
```

2. **实现处理器**:

```typescript
case 'my_tool':
  const result = await doSomething(args.param1);
  return {
    content: [{ type: 'text', text: result }],
  };
```

3. **添加到 TOOLS 数组**:

```typescript
const TOOLS: Tool[] = [
  // ... existing tools
  MY_TOOL,
];
```

---

## 📊 性能基准

| 工具 | 平均耗时 | 评级 |
|------|----------|------|
| diagnose_network | ~276ms | ⚡ 优秀 |
| analyze_performance | ~6,800ms | ✅ 良好 |
| analyze_logs (1K 行) | ~12ms | ⚡ 优秀 |
| search_mcp_packages | ~11,000ms | ✅ 良好 |
| get_search_cache_stats | ~2ms | ⚡ 优秀 |

**总体评分**: 85/100 ✅

---

## 🐛 故障排查

### 问题 1: 服务器无法启动

**检查**:
```bash
# 验证 Node.js 版本
node --version  # 需要 >= 18.0.0

# 验证编译
npm run build

# 检查文件存在
ls dist/mcp/server-true-mcp.js
```

### 问题 2: 工具调用失败

**检查 MCP 日志**:
```bash
# 开发模式查看详细日志
npm run mcp-server:dev
```

### 问题 3: 连接超时

**增加超时时间**:
```json
{
  "mcpServers": {
    "mcp-diagnoser": {
      "timeout": 60000
    }
  }
}
```

---

## 📧 支持

- **文档**: 查看项目根目录的文档
- **性能报告**: `PERFORMANCE_TEST_REPORT.md`
- **快速开始**: `QUICKSTART_v2.1.md`
- **完整文档**: `FINAL_RELEASE_v2.1.0.md`

---

## 🎉 总结

**MCP Diagnoser v2.1.0** 是一个完全符合 MCP 协议规范的诊断工具，提供：

- ✅ **17 个工具** - 覆盖所有诊断需求
- ✅ **真 MCP 协议** - 完全兼容 MCP 规范
- ✅ **高性能** - 通过所有性能测试
- ✅ **易于使用** - 简单的配置和调用

**立即开始使用**:

```bash
npm run mcp-server
```

---

**作者**: Lan <3314844@gmail.com>  
**版本**: 2.1.0  
**许可证**: MIT
