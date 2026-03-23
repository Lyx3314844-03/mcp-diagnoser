# MCP Diagnoser v2.1.0 - 使用示例大全

## 📖 目录

1. [真实搜索示例](#1-真实搜索示例)
2. [日志诊断示例](#2-日志诊断示例)
3. [MCP 工具调用示例](#3-mcp-工具调用示例)
4. [实际应用场景](#4-实际应用场景)

---

## 1. 真实搜索示例

### 1.1 基本网页搜索

**MCP 工具调用**:
```json
{
  "name": "web_search",
  "arguments": {
    "query": "TypeScript tutorial",
    "limit": 10,
    "useCache": true
  }
}
```

**输出示例**:
```
🔍 Search Results for: "TypeScript tutorial"

⏱️  Search Time: 2181ms
📊 Total Results: 10
🌐 Engines: duckduckgo

────────────────────────────────────────────────────────

1. TypeScript Tutorial - W3Schools
   URL: https://www.w3schools.com/typescript/index.php
   Snippet: Learn TypeScript programming with interactive examples
   Engine: duckduckgo

2. The starting point for learning TypeScript
   URL: https://www.typescriptlang.org/docs/
   Snippet: Official TypeScript documentation
   Engine: duckduckgo

3. TypeScript Tutorial
   URL: https://www.typescripttutorial.net/
   Snippet: Comprehensive TypeScript learning resources
   Engine: duckduckgo
```

### 1.2 多引擎搜索

**MCP 工具调用**:
```json
{
  "name": "web_search",
  "arguments": {
    "query": "React hooks best practices",
    "engines": ["duckduckgo", "bing"],
    "limit": 15
  }
}
```

### 1.3 智能搜索

**MCP 工具调用**:
```json
{
  "name": "smart_search",
  "arguments": {
    "query": "useEffect cleanup function",
    "limit": 10
  }
}
```

**说明**: 自动选择 DuckDuckGo 和 Bing 两个引擎进行搜索

---

## 2. 日志诊断示例

### 2.1 基本日志分析

**MCP 工具调用**:
```json
{
  "name": "analyze_logs",
  "arguments": {
    "logPath": "/var/log/app.log",
    "maxLines": 10000,
    "maxErrors": 100
  }
}
```

**输出示例**:
```
📋 Log Analysis Report

📊 Statistics:
  Total Lines: 5000
  Parsed Entries: 4890
  ERROR: 45
  WARN:  123
  INFO:  4500
  DEBUG: 222

🔁 Repeated Patterns:
  1. 🟡 (25x) Connection timeout to database...
  2. 🟡 (12x) Failed to parse JSON response...
```

### 2.2 完整日志诊断（推荐）

**MCP 工具调用**:
```json
{
  "name": "diagnose_logs",
  "arguments": {
    "logPath": "/var/log/app.log",
    "maxLines": 50000,
    "includePatterns": true
  }
}
```

**输出示例**:
```
📋 Log Diagnostic Report

File: /var/log/app.log
Analyzed: 2026-03-22T05:30:00.000Z
Time Range: 2026-03-21 00:00:00 to 2026-03-22 05:30:00

⚠️ Health Score: 65/100

📊 Statistics:
  Total Lines: 50,000
  Total Entries: 48,500
  Errors: 450
  Warnings: 650
  Info: 47,400
  Debug: 0

⚠️  Issues Detected:

  1. 🟠 [APPLICATION] Repeated error detected (150 times)
     Count: 150
     Evidence: Database connection failed - timeout after 30000ms
     💡 Check network connectivity and service availability

  2. 🟡 [APPLICATION] Repeated error detected (85 times)
     Count: 85
     Evidence: Failed to execute query: SELECT * FROM users
     💡 Investigate the root cause and implement error handling

  3. 🟡 [PERFORMANCE] Performance-related events detected (120 events)
     Count: 120
     Evidence: Slow query detected: 2500ms, Memory leak detected...
     💡 Investigate performance bottlenecks and optimize

🔁 Detected Patterns:

  1. repeated_error (frequent)
     Count: 150
     Example: Database connection timeout...

  2. repeated_error (occasional)
     Count: 85
     Example: Query execution failed...

  3. repeated_warning (frequent)
     Count: 200
     Example: High memory usage detected...

💡 Recommendations:

  1. 🚨 [URGENT] High Error Rate Detected
     Error rate is 0.9%, which is above the 5% threshold
     Action: Investigate and fix the root causes of frequent errors
     Impact: Improved system stability and user experience

  2. ⚠️ [HIGH] Performance Issues Detected
     1 performance-related issue(s) found
     Action: Profile application and optimize slow operations
     Impact: Improved response times and resource utilization

  3. 💡 [MEDIUM] Implement Log Rotation
     Log file is very large and may cause disk space issues
     Action: Configure log rotation with size and time-based policies
     Impact: Better disk space management and easier log analysis
```

### 2.3 应用日志诊断

**场景**: 诊断 Node.js 应用日志

**日志文件内容示例**:
```
[2026-03-22 10:00:00] INFO: Server started on port 3000
[2026-03-22 10:01:00] INFO: Request processed - GET /api/users
[2026-03-22 10:02:00] ERROR: Database connection failed - timeout
[2026-03-22 10:02:05] ERROR: Failed to fetch users
[2026-03-22 10:03:00] WARNING: High memory usage - 85%
[2026-03-22 10:04:00] ERROR: Database connection failed - timeout
...
```

**MCP 工具调用**:
```json
{
  "name": "diagnose_logs",
  "arguments": {
    "logPath": "./logs/app.log",
    "maxLines": 10000,
    "includePatterns": true
  }
}
```

**诊断结果**:
```
⚠️ Health Score: 55/100

Issues:
1. Database connection errors (50 times)
2. Memory warnings (25 times)
3. Request failures (30 times)

Recommendations:
1. Check database connectivity
2. Investigate memory leaks
3. Implement retry logic
```

### 2.4 安全日志诊断

**场景**: 诊断安全相关日志

**MCP 工具调用**:
```json
{
  "name": "diagnose_logs",
  "arguments": {
    "logPath": "/var/log/auth.log",
    "maxLines": 5000
  }
}
```

**输出示例**:
```
🚨 Health Score: 30/100

⚠️  Issues Detected:

  1. 🔴 [SECURITY] Security-related events detected (45 events)
     Count: 45
     Evidence: 
       - unauthorized access attempt from 192.168.1.100
       - Failed login for user admin
       - Brute force attack detected
     💡 Review security events immediately

💡 Recommendations:

  1. 🚨 [URGENT] Security Issues Detected
     1 security-related issue(s) found in logs
     Action: Immediately review and address security events
     Impact: Enhanced system security and reduced risk of breaches
```

---

## 3. MCP 工具调用示例

### 3.1 Claude Desktop 使用示例

**用户**: "帮我搜索 TypeScript 教程"

**Claude**:
```json
{
  "method": "tools/call",
  "params": {
    "name": "web_search",
    "arguments": {
      "query": "TypeScript tutorial for beginners",
      "limit": 10
    }
  }
}
```

**用户**: "分析一下这个日志文件的问题"

**Claude**:
```json
{
  "method": "tools/call",
  "params": {
    "name": "diagnose_logs",
    "arguments": {
      "logPath": "/var/log/app.log"
    }
  }
}
```

### 3.2 组合工具使用

**场景**: 全面诊断系统问题

**步骤 1**: 搜索相关错误
```json
{
  "name": "web_search",
  "arguments": {
    "query": "database connection timeout fix",
    "limit": 5
  }
}
```

**步骤 2**: 分析日志
```json
{
  "name": "diagnose_logs",
  "arguments": {
    "logPath": "/var/log/app.log"
  }
}
```

**步骤 3**: 检查性能
```json
{
  "name": "analyze_performance",
  "arguments": {
    "includeProcesses": true
  }
}
```

---

## 4. 实际应用场景

### 场景 1: Web 应用故障排查

**问题**: 用户报告网站访问缓慢

**诊断步骤**:

1. **搜索类似问题**:
```json
{
  "name": "web_search",
  "arguments": {
    "query": "website slow performance troubleshooting",
    "limit": 5
  }
}
```

2. **分析访问日志**:
```json
{
  "name": "diagnose_logs",
  "arguments": {
    "logPath": "/var/log/nginx/access.log",
    "maxLines": 10000
  }
}
```

3. **分析错误日志**:
```json
{
  "name": "diagnose_logs",
  "arguments": {
    "logPath": "/var/log/nginx/error.log"
  }
}
```

4. **检查系统性能**:
```json
{
  "name": "analyze_performance",
  "arguments": {}
}
```

### 场景 2: 安全事件调查

**问题**: 检测到可疑登录尝试

**诊断步骤**:

1. **分析安全日志**:
```json
{
  "name": "diagnose_logs",
  "arguments": {
    "logPath": "/var/log/auth.log",
    "maxLines": 5000
  }
}
```

2. **搜索安全最佳实践**:
```json
{
  "name": "web_search",
  "arguments": {
    "query": "server security best practices 2024",
    "limit": 5
  }
}
```

### 场景 3: 应用性能优化

**问题**: API 响应时间过长

**诊断步骤**:

1. **分析应用日志**:
```json
{
  "name": "diagnose_logs",
  "arguments": {
    "logPath": "./logs/api.log",
    "includePatterns": true
  }
}
```

2. **搜索优化方案**:
```json
{
  "name": "smart_search",
  "arguments": {
    "query": "API performance optimization techniques",
    "limit": 10
  }
}
```

3. **检查系统资源**:
```json
{
  "name": "analyze_performance",
  "arguments": {
    "includeProcesses": true,
    "includeNodejs": true
  }
}
```

### 场景 4: 开发环境搭建

**问题**: 新项目需要学习新技术

**诊断步骤**:

1. **搜索教程**:
```json
{
  "name": "web_search",
  "arguments": {
    "query": "React Next.js tutorial 2024",
    "engines": ["duckduckgo", "bing"],
    "limit": 10
  }
}
```

2. **搜索最佳实践**:
```json
{
  "name": "smart_search",
  "arguments": {
    "query": "Next.js best practices production",
    "limit": 5
  }
}
```

---

## 📊 性能基准

### 搜索性能

| 查询类型 | 平均耗时 | 结果数 |
|----------|----------|--------|
| 简单查询 | ~2,000ms | 10 |
| 复杂查询 | ~2,500ms | 10 |
| 多引擎 | ~4,000ms | 20 |

### 日志诊断性能

| 日志大小 | 分析耗时 | 健康评分精度 |
|----------|----------|--------------|
| 1K 行 | ~5ms | 高 |
| 10K 行 | ~15ms | 高 |
| 50K 行 | ~50ms | 高 |
| 100K 行 | ~100ms | 高 |

---

## 🎯 最佳实践

### 1. 搜索最佳实践

- ✅ 使用具体明确的查询词
- ✅ 限制结果数量（5-10 个）
- ✅ 启用缓存提高重复搜索速度
- ✅ 使用智能搜索自动选择引擎

### 2. 日志诊断最佳实践

- ✅ 定期分析日志（每天/每周）
- ✅ 设置合理的 maxLines（避免过大）
- ✅ 关注健康评分变化趋势
- ✅ 优先处理紧急和高优先级建议

### 3. 性能优化建议

- ✅ 组合使用多个工具获取全面信息
- ✅ 使用缓存减少重复请求
- ✅ 定期清理日志文件
- ✅ 监控关键指标变化

---

## 📧 支持

- **文档**: 查看项目根目录的文档
- **性能报告**: `PERFORMANCE_TEST_REPORT.md`
- **MCP 指南**: `MCP_PROTOCOL_GUIDE.md`
- **快速开始**: `QUICKSTART_v2.1.md`

---

**作者**: Lan <3314844@gmail.com>  
**版本**: 2.1.0  
**许可证**: MIT
