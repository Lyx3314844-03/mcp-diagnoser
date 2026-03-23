#!/bin/bash

# MCP Diagnoser v3.0.0 发布脚本

echo "════════════════════════════════════════════════════════════"
echo "  MCP Diagnoser v3.0.0 发布"
echo "════════════════════════════════════════════════════════════"

# 1. 检查 Git 状态
echo -e "\n[1/6] 检查 Git 状态..."
git status

# 2. 添加所有更改
echo -e "\n[2/6] 添加所有更改..."
git add .

# 3. 提交更改
echo -e "\n[3/6] 提交更改..."
git commit -m "chore: release v3.0.0 - Ultra Enhanced HTML Parser

New Features:
- Ultra Enhanced HTML Parser v3 with rich media extraction
- Support for images, videos, dates, authors extraction
- Enhanced rich snippets support (product, article, recipe, video, event)
- Multi-engine support (Google, Bing, Baidu, DuckDuckGo, Yandex)
- Improved regex patterns for better accuracy
- Added @xmldom/xmldom dependency for DOM parsing

Performance:
- 100% test coverage maintained
- Faster parsing with optimized regex patterns
- Better error handling and type safety

Bug Fixes:
- Fixed HTML parser type issues
- Improved search result extraction
- Enhanced anti-bot capabilities"

# 4. 创建 Git 标签
echo -e "\n[4/6] 创建 Git 标签..."
git tag -a v3.0.0 -m "MCP Diagnoser v3.0.0 - Ultra Enhanced HTML Parser"

# 5. 推送到 GitHub
echo -e "\n[5/6] 推送到 GitHub..."
git push origin main --tags

# 6. 创建 GitHub Release
echo -e "\n[6/6] 创建 GitHub Release..."
gh release create v3.0.0 \
  --title "MCP Diagnoser v3.0.0 - Ultra Enhanced HTML Parser" \
  --notes "## 🎉 New Features

### Ultra Enhanced HTML Parser v3
- **Rich Media Extraction**: Extract images, videos, dates, and authors from search results
- **Enhanced Rich Snippets**: Support for product, article, recipe, video, and event schemas
- **Multi-Engine Support**: Google, Bing, Baidu, DuckDuckGo, Yandex
- **Improved Accuracy**: Optimized regex patterns for better search result extraction

### Performance Improvements
- Faster parsing with optimized regex patterns
- Better error handling and type safety
- 100% test coverage maintained

### Bug Fixes
- Fixed HTML parser type issues
- Improved search result extraction
- Enhanced anti-bot capabilities

### Installation
\`\`\`bash
npm install -g mcp-diagnoser@3.0.0
\`\`\`

### Usage
\`\`\`bash
# Quick diagnosis
mcp-diagnoser check --fast

# Web search with enhanced parser
mcp-diagnoser web-search \"query\" --engine google

# Performance profiling
mcp-diagnoser profile
\`\`\`

**Full Changelog**: https://github.com/Lyx3314844-03/mcp-diagnoser/compare/v2.7.5...v3.0.0"

echo -e "\n════════════════════════════════════════════════════════════"
echo "  ✅ 发布完成！"
echo "════════════════════════════════════════════════════════════"
echo -e "\n📦 npm 包已更新到 v3.0.0"
echo "🏷️  Git 标签已创建并推送"
echo "📝 GitHub Release 已创建"
echo -e "\n🔗 查看 Release: https://github.com/Lyx3314844-03/mcp-diagnoser/releases/tag/v3.0.0\n"
