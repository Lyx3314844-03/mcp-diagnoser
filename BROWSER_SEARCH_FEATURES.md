# MCP Diagnoser v1.2.0 - 浏览器搜索功能增强

## 🎉 新增功能概览

本次更新为 MCP Diagnoser 添加了强大的**全网搜索**和**网站爬取**功能，支持：

1. **多搜索引擎搜索** - 支持 15+ 个主流搜索引擎
2. **网站内容爬取** - 爬取网站并搜索内容
3. **信息提取** - 提取邮箱、电话、链接等信息
4. **深度搜索** - 在爬取的网站中搜索特定内容

## 🔍 支持的搜索引擎

### 综合搜索引擎

| 引擎 | 命令 | 描述 |
|------|------|------|
| **Google** | `-e google` | 全球最大搜索引擎 |
| **Bing** | `-e bing` | 微软搜索引擎 |
| **Baidu** | `-e baidu` | 百度搜索 - 中国最大 |
| **DuckDuckGo** | `-e duckduckgo` | 隐私保护搜索 |
| **Yahoo** | `-e yahoo` | 雅虎搜索 |
| **Yandex** | `-e yandex` | 俄罗斯搜索引擎 |
| **Sogou** | `-e sogou` | 搜狗搜索 |
| **360 Search** | `-e so360` | 360 搜索 |

### 开发者专用

| 引擎 | 命令 | 描述 |
|------|------|------|
| **GitHub** | `-e github` | 代码搜索 |
| **Stack Overflow** | `-e stackoverflow` | 编程问答搜索 |

### 社交媒体

| 引擎 | 命令 | 描述 |
|------|------|------|
| **Reddit** | `-e reddit` | 社交新闻搜索 |
| **YouTube** | `-e youtube` | 视频搜索 |
| **Bilibili** | `-e bilibili` | 哔哩哔哩视频搜索 |

### 学术搜索

| 引擎 | 命令 | 描述 |
|------|------|------|
| **Google Scholar** | `-e scholarly` | 学术搜索 |
| **arXiv** | `-e arxiv` | 物理论文搜索 |

## 📋 使用指南

### 1. 网页搜索

```bash
# 基本搜索
mcp-diagnoser web-search "MCP protocol"

# 使用特定搜索引擎
mcp-diagnoser web-search "AI tutorial" -e bing
mcp-diagnoser web-search "机器学习" -e baidu

# 高级搜索选项
mcp-diagnoser web-search "python tutorial" -e google \
  --site python.org \
  --time-range past_month \
  --verbose

# 精确匹配
mcp-diagnoser web-search "Model Context Protocol" --exact

# 搜索特定文件类型
mcp-diagnoser web-search "API documentation" --filetype pdf

# 排除特定网站
mcp-diagnoser web-search "tutorial" -e google --exclude-sites reddit.com
```

### 2. 网站爬取

```bash
# 基本爬取
mcp-diagnoser crawl https://example.com

# 自定义爬取选项
mcp-diagnoser crawl https://example.com \
  --max-pages 50 \
  --max-depth 5 \
  --delay 1000

# 仅爬取同域名
mcp-diagnoser crawl https://example.com --same-domain

# 排除特定 URL 模式
mcp-diagnoser crawl https://example.com \
  --exclude "login,signup,admin"
```

### 3. 网站内容搜索

```bash
# 在网站上搜索内容
mcp-diagnoser search-content https://example.com "API documentation"

# 使用正则表达式
mcp-diagnoser search-content https://example.com "v\d+\.\d+\.\d+" --regex

# 显示上下文
mcp-diagnoser search-content https://example.com "installation" --context 5

# 全字匹配
mcp-diagnoser search-content https://example.com "api" --whole-word
```

### 4. 信息提取

```bash
# 提取所有信息
mcp-diagnoser extract-info https://example.com --all

# 仅提取邮箱
mcp-diagnoser extract-info https://example.com --emails

# 仅提取电话
mcp-diagnoser extract-info https://example.com --phones

# 仅提取链接
mcp-diagnoser extract-info https://example.com --links
```

### 5. 列出搜索引擎

```bash
# 查看所有可用搜索引擎
mcp-diagnoser search-engines
```

## 🔧 高级功能

### 搜索引擎参数

| 参数 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| `--engine` | `-e` | 搜索引擎 | google |
| `--limit` | `-n` | 结果数量 | 10 |
| `--language` | `-l` | 语言 | en |
| `--region` | `-r` | 地区 | - |
| `--time-range` | `-t` | 时间范围 | any |
| `--site` | `-s` | 限定网站 | - |
| `--filetype` | - | 文件类型 | - |
| `--exact` | - | 精确匹配 | false |
| `--verbose` | - | 显示摘要 | false |

### 爬取参数

| 参数 | 描述 | 默认值 |
|------|------|--------|
| `--max-pages` | 最大爬取页面数 | 20 |
| `--max-depth` | 最大爬取深度 | 3 |
| `--same-domain` | 仅同域名 | true |
| `--exclude` | 排除的 URL 模式 | - |
| `--delay` | 请求间隔 (ms) | 500 |

### 内容搜索参数

| 参数 | 描述 | 默认值 |
|------|------|--------|
| `--case-sensitive` | 大小写敏感 | false |
| `--whole-word` | 全字匹配 | false |
| `--regex` | 正则表达式 | false |
| `--context` | 上下文行数 | 2 |

## 📊 输出示例

### 网页搜索结果

```
══════════════════════════════════════════════════════════════════════
  Search Results: "MCP protocol"
  Engine: Google
══════════════════════════════════════════════════════════════════════
  Found 10 results in 1234ms

1. Model Context Protocol (MCP) - Official Documentation
   https://modelcontextprotocol.io/
   The Model Context Protocol (MCP) is an open standard that enables 
   AI models to interact with external tools and data sources...

2. Understanding MCP: A Complete Guide
   https://example.com/mcp-guide
   Learn about the Model Context Protocol and how to integrate it 
   into your AI applications...
```

### 网站爬取结果

```
══════════════════════════════════════════════════════════════════════
  Web Crawl Results: https://example.com
══════════════════════════════════════════════════════════════════════
  Crawled 15 pages in 8500ms

[0] Example Domain
   https://example.com
   Links: 5

[1] About Us
   https://example.com/about
   Links: 3

[2] Contact
   https://example.com/contact
   Links: 2
```

### 信息提取结果

```
══════════════════════════════════════════════════════════════════════
  Email Addresses
══════════════════════════════════════════════════════════════════════
  ✓ contact@example.com
  ✓ support@example.com
  ✓ info@example.com

══════════════════════════════════════════════════════════════════════
  Phone Numbers
══════════════════════════════════════════════════════════════════════
  ✓ +1-555-123-4567
  ✓ (555) 987-6543

══════════════════════════════════════════════════════════════════════
  Links (25 found)
══════════════════════════════════════════════════════════════════════
  → https://example.com/about
  → https://example.com/contact
  → https://example.com/products
  ...
```

## 🎯 使用场景

### 场景 1: 市场调研

```bash
# 搜索竞争对手信息
mcp-diagnoser web-search "competitor name" -e google --time-range past_month

# 爬取竞争对手网站
mcp-diagnoser crawl https://competitor.com --max-pages 50

# 提取联系方式
mcp-diagnoser extract-info https://competitor.com --emails --phones
```

### 场景 2: 技术调研

```bash
# 搜索技术文档
mcp-diagnoser web-search "API documentation" -e github --site github.io

# 在文档网站搜索特定内容
mcp-diagnoser search-content https://docs.example.com "authentication"

# 搜索 Stack Overflow
mcp-diagnoser web-search "python async await" -e stackoverflow
```

### 场景 3: 学术研究

```bash
# 搜索学术论文
mcp-diagnoser web-search "machine learning" -e scholarly

# 搜索 arXiv
mcp-diagnoser web-search "neural networks" -e arxiv

# 爬取大学网站
mcp-diagnoser crawl https://cs.stanford.edu --max-pages 100
```

### 场景 4: 线索挖掘

```bash
# 搜索潜在客户
mcp-diagnoser web-search "SaaS company" -e google

# 提取邮箱地址
mcp-diagnoser extract-info https://target-company.com --emails

# 搜索公司新闻
mcp-diagnoser web-search "target company" --time-range past_year
```

## 🔐 注意事项

1. **遵守 robots.txt**: 爬取前请检查网站的 robots.txt 文件
2. **请求频率**: 设置合适的 delay 避免给服务器造成压力
3. **使用限制**: 某些搜索引擎可能有 API 调用限制
4. **隐私保护**: 提取的个人信息请合法使用
5. **版权尊重**: 爬取的内容请遵守版权法规

## 🚀 性能优化

### 提高搜索速度

```bash
# 减少结果数量
mcp-diagnoser web-search "query" -n 5

# 使用更快的搜索引擎
mcp-diagnoser web-search "query" -e duckduckgo

# 限制爬取深度
mcp-diagnoser crawl https://example.com --max-depth 2
```

### 提高结果质量

```bash
# 使用精确匹配
mcp-diagnoser web-search "exact phrase" --exact

# 限定时间范围
mcp-diagnoser web-search "news" --time-range past_week

# 限定特定网站
mcp-diagnoser web-search "tutorial" --site github.com
```

## 📝 高级搜索技巧

### Google 搜索运算符

```bash
# 站内搜索
mcp-diagnoser web-search "tutorial" -s python.org

# 文件类型
mcp-diagnoser web-search "documentation" --filetype pdf

# 精确匹配
mcp-diagnoser web-search "exact phrase" --exact

# 排除词语
mcp-diagnoser web-search "python -snake"

# 相关网站
mcp-diagnoser web-search "related:github.com"
```

### 组合搜索

```bash
# 搜索特定时间的特定文件
mcp-diagnoser web-search "API reference" \
  --filetype pdf \
  --time-range past_year \
  --site docs.example.com

# 多引擎对比
mcp-diagnoser web-search "AI trends" -e google
mcp-diagnoser web-search "AI trends" -e bing
mcp-diagnoser web-search "AI trends" -e baidu
```

## 🆕 版本历史

### v1.2.0 (2026-03-18)

**新增功能**:
- ✅ 支持 15+ 个搜索引擎
- ✅ 网站爬取功能
- ✅ 网站内容搜索
- ✅ 信息提取（邮箱、电话、链接）
- ✅ 高级搜索选项
- ✅ 多引擎并行搜索

**改进**:
- 🔧 优化搜索结果解析
- 🔧 改进 URL 提取逻辑
- 🔧 添加请求延迟控制
- 🔧 增强错误处理

---

**版本**: v1.2.0  
**更新日期**: 2026-03-18  
**许可证**: MIT
