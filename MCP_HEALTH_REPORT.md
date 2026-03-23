# MCP 服务器全面诊断报告

**诊断日期**: 2026-03-20  
**诊断工具**: MCP Diagnoser v2.0.0  
**环境**: Windows 11, Node.js v22.22.1

---

## 📊 诊断总览

### 服务器状态
- **总服务器数**: 34 个
- **✅ 正常**: 33 个 (97%)
- **⚠️ 警告**: 0 个
- **❌ 错误**: 1 个 (3%)

### 语言运行时
- **已安装**: 5/10 (50%)
- **未安装**: 5/10 (50%)

### 包状态
- **总包数**: 33 个
- **已安装**: 33 个 (100%)
- **缺失**: 0 个

---

## ✅ 正常的 MCP 服务器 (33 个)

### Node.js 运行时 (22 个)

| # | 服务器名称 | 状态 | 命令 | 依赖 | 配置 |
|---|-----------|------|------|------|------|
| 1 | diagnoser | ✅ | ✅ | ✅ | ✅ |
| 2 | playwright | ✅ | ✅ | ✅ | ✅ |
| 3 | chrome-devtools | ✅ | ✅ | ✅ | ✅ |
| 4 | github | ✅ | ✅ | ✅ | ✅ |
| 5 | context7 | ✅ | ✅ | ✅ | ✅ |
| 6 | apify | ✅ | ✅ | ✅ | ✅ |
| 7 | puppeteer | ✅ | ✅ | ✅ | ✅ |
| 8 | exa | ✅ | ✅ | ✅ | ✅ |
| 9 | search1api | ✅ | ✅ | ✅ | ✅ |
| 10 | yt-dlp | ✅ | ✅ | ✅ | ✅ |
| 11 | owlex | ✅ | ✅ | ✅ | ✅ |
| 12 | code-review | ✅ | ✅ | ✅ | ✅ |
| 13 | js-reverse | ✅ | ✅ | ✅ | ✅ |
| 14 | video-fetch | ✅ | ✅ | ✅ | ✅ |
| 15 | terminal | ✅ | ✅ | ✅ | ✅ |
| 16 | fetch | ✅ | ✅ | ✅ | ✅ |
| 17 | codegraph | ✅ | ✅ | ✅ | ✅ |
| 18 | firecrawl | ✅ | ✅ | ✅ | ✅ |
| 19 | codescalpel | ✅ | ✅ | ✅ | ✅ |
| 20 | dependency-mcp | ✅ | ✅ | ✅ | ✅ |
| 21 | gitnexus | ✅ | ✅ | ✅ | ✅ |
| 22 | ai-cli-communicator | ✅ | ✅ | ✅ | ✅ |

### Python 运行时 (10 个)

| # | 服务器名称 | 状态 | 命令 | 依赖 | 配置 |
|---|-----------|------|------|------|------|
| 1 | DrissionPageMCP | ✅ | ✅ | ✅ | ✅ |
| 2 | windows-mcp | ✅ | ✅ | ✅ | ✅ |
| 3 | serena | ✅ | ✅ | ✅ | ✅ |
| 4 | travel-flight | ✅ | ✅ | ✅ | ✅ |
| 5 | travel-hotel | ✅ | ✅ | ✅ | ✅ |
| 6 | travel-event | ✅ | ✅ | ✅ | ✅ |
| 7 | travel-geocoder | ✅ | ✅ | ✅ | ✅ |
| 8 | travel-weather | ✅ | ✅ | ✅ | ✅ |
| 9 | travel-finance | ✅ | ✅ | ✅ | ✅ |
| 10 | agent-reach | ✅ | ✅ | ✅ | ✅ |

### 其他 (1 个)

| # | 服务器名称 | 状态 | 命令 | 依赖 | 配置 |
|---|-----------|------|------|------|------|
| 1 | rag | ✅ | ✅ | ✅ | ✅ |

---

## ❌ 有问题的 MCP 服务器 (1 个)

### 1. pipedream-remote ❌

**问题**: 命令未找到

**详情**:
- **Runtime**: 远程 URL
- **Command Found**: ❌ No
- **Dependencies OK**: ✅ Yes
- **Config Valid**: ✅ Yes

**错误信息**:
```
✗ [installation] Command "https://mcp.pipedream.com/mcp" not found
  → Ensure https://mcp.pipedream.com/mcp is installed and in PATH
```

**原因分析**:
- 这是一个远程 MCP 服务器配置
- 配置中使用了 URL 作为命令 (`https://mcp.pipedream.com/mcp`)
- 这不是一个本地可执行文件，而是一个远程端点
- 需要特殊的 MCP 客户端支持远程服务器

**解决方案**:

**方案 1: 使用 HTTP 传输的 MCP 客户端**
```json
{
  "mcpServers": {
    "pipedream-remote": {
      "type": "http",
      "url": "https://mcp.pipedream.com/mcp"
    }
  }
}
```

**方案 2: 移除该配置**
如果不需要使用 Pipedream 远程服务器，可以从配置中移除：
```bash
# 编辑 .mcp.json 文件，删除 pipedream-remote 配置
```

**方案 3: 安装 MCP 代理**
如果确实需要使用，可能需要安装支持 HTTP 传输的 MCP 代理工具。

---

## 🔧 语言运行时状态

### 已安装 (5 个) ✅

| 语言 | 状态 | 版本 | 路径 |
|------|------|------|------|
| Node.js | ✅ | v22.22.1 | C:\Program Files\nodejs\node.exe |
| Python | ✅ | 3.13.12 | C:\Program Files\Python313\python.exe |
| Java | ✅ | 25.0.2 | C:\Program Files\Common Files\Oracle\Java\javapath\java.exe |
| Go | ✅ | 1.26.1 | C:\Program Files\Go\bin\go.exe |
| Rust/Cargo | ✅ | 1.94.0 | C:\Program Files\Rust stable MSVC 1.94\bin\cargo.exe |

### 未安装 (5 个) ⚠️

| 语言 | 状态 | 建议 |
|------|------|------|
| .NET (dotnet) | ❌ | 可选安装，如需要 C# 开发 |
| Ruby | ❌ | 可选安装，如需要 Ruby 开发 |
| PHP | ❌ | 可选安装，如需要 PHP 开发 |
| Swift | ❌ | 可选安装，如需要 iOS/macOS 开发 |
| Kotlin | ❌ | 可选安装，如需要 Kotlin 开发 |

**建议**: 这些语言运行时是可选的，只有在你需要运行对应语言的 MCP 服务器时才需要安装。

---

## 📦 包管理器状态

### 已安装 (8 个) ✅

| 包管理器 | 状态 | 版本 |
|---------|------|------|
| npm | ✅ | 10.9.4 |
| pnpm | ✅ | 10.32.1 |
| pip | ✅ | pip 26.0.1 |
| pip3 | ✅ | pip 26.0.1 |
| uv | ✅ | uv 0.10.10 |
| uvx | ✅ | uvx 0.10.10 |
| cargo | ✅ | cargo 1.94.0 |
| go | ✅ | go 1.26.1 |

### 未安装 (4 个) ⚠️

| 包管理器 | 状态 | 建议 |
|---------|------|------|
| yarn | ❌ | 可选，npm 已满足需求 |
| dotnet | ❌ | 需要 .NET 运行时 |
| gem | ❌ | 需要 Ruby 运行时 |
| composer | ❌ | 需要 PHP 运行时 |

---

## 📊 已安装的 MCP 包 (33 个)

所有必需的 MCP 包都已正确安装：

1. ✅ @playwright/mcp@on-demand
2. ✅ chrome-devtools-mcp@on-demand
3. ✅ windows-mcp@on-demand
4. ✅ @modelcontextprotocol/server-github@on-demand
5. ✅ @upstash/context7-mcp@on-demand
6. ✅ start-mcp-server@on-demand
7. ✅ @apify/actors-mcp-server@on-demand
8. ✅ @modelcontextprotocol/server-puppeteer@on-demand
9. ✅ exa-mcp-server@on-demand
10. ✅ search1api-mcp@on-demand
11. ✅ yt-dlp-mcp@on-demand
12. ✅ code-review-mcp-server@on-demand
13. ✅ @pickstar-2002/video-fetch-mcp@on-demand
14. ✅ terminal-mcp-server@on-demand
15. ✅ fetch-mcp@on-demand
16. ✅ @optave/codegraph@on-demand
17. ✅ mcp@on-demand
18. ✅ firecrawl-mcp@on-demand
19. ✅ codescalpel
20. ✅ owlex-server
21. ✅ js-reverse-mcp
22. ✅ mcp-rag-server
23. ✅ 旅行系列服务器 (5 个)
24. ✅ agent-reach
25. ✅ 其他自定义服务器

**状态**: 所有包都已正确安装，无缺失！

---

## 💡 建议和推荐

### 立即处理

1. **pipedream-remote 配置问题**
   - **优先级**: 中
   - **影响**: 无法使用 Pipedream 远程服务器
   - **建议**: 如果不使用，从配置中移除

### 可选优化

2. **安装更多语言运行时**
   - 如果需要更多 MCP 服务器支持
   - 建议安装：.NET, PHP (根据需求)

3. **性能优化**
   - 使用缓存功能加速重复搜索
   - 配置常用搜索引擎组合

---

## 🎯 健康度评分

| 指标 | 得分 | 评级 |
|------|------|------|
| 服务器可用性 | 33/34 | ⭐⭐⭐⭐⭐ (97%) |
| 语言运行时 | 5/10 | ⭐⭐⭐ (50%) |
| 包管理器 | 8/12 | ⭐⭐⭐⭐ (67%) |
| MCP 包安装 | 33/33 | ⭐⭐⭐⭐⭐ (100%) |
| **总体评分** | - | **⭐⭐⭐⭐⭐ (优秀)** |

---

## ✅ 总结

### 整体状态：**优秀** ✅

- **34 个 MCP 服务器**中 **33 个正常工作** (97%)
- **所有必需的包**都已正确安装
- **核心语言运行时** (Node.js, Python, Java, Go, Rust) 都已安装
- **只有 1 个配置问题** (pipedream-remote - 远程服务器配置)

### 可以正常使用的功能

✅ 多引擎搜索 (37+ 搜索引擎)  
✅ 智能搜索 (自动分类)  
✅ 网站爬取  
✅ 信息提取  
✅ Playwright 浏览器自动化  
✅ Chrome DevTools  
✅ GitHub 集成  
✅ 代码分析和审查  
✅ 视频下载  
✅ 旅行服务 (机票/酒店/活动等)  
✅ 文档查询  
✅ 终端执行  
✅ 依赖分析  
✅ 代码图谱  

### 需要注意的问题

⚠️ pipedream-remote 配置需要调整（如果不使用可移除）

---

**诊断完成时间**: 2026-03-20T11:00:45Z  
**诊断工具版本**: MCP Diagnoser v2.0.0  
**下次诊断建议**: 1 周后或添加新服务器时
