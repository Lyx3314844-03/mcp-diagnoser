@echo off
echo ========================================
echo MCP Diagnoser - Qwen CLI 配置完成!
echo ========================================
echo.

echo 配置文件：C:\Users\Administrator\.qwen\settings.json
echo 服务器路径：C:\Users\Administrator\mcp-diagnoser\server\dist\server.js
echo.

echo 验证配置...
node -e "const fs=require('fs'); const config=JSON.parse(fs.readFileSync('.qwen/settings.json')); console.log('MCP Diagnoser 配置状态:', config.mcpServers['mcp-diagnoser'] ? '成功!' : '失败!');"
echo.

echo ========================================
echo 使用方法
echo ========================================
echo.
echo 1. 重启 Qwen CLI
echo    qwen
echo.
echo 2. 在 Qwen CLI 中可以使用以下命令:
echo.
echo    - 诊断所有 MCP 服务器
echo      "请帮我诊断所有 MCP 服务器"
echo.
echo    - 检查语言环境
echo      "检查所有编程语言运行时"
echo.
echo    - 搜索 MCP 包
echo      "搜索 GitHub 相关的 MCP 包"
echo.
echo    - 诊断 Playwright
echo      "诊断 Playwright 是否正常安装"
echo.
echo    - 安装 MCP 包
echo      "帮我安装 @playwright/mcp 包"
echo.
echo ========================================
echo 可用工具 (8 个)
echo ========================================
echo.
echo 诊断工具:
echo   1. diagnose_all           - 诊断所有 MCP 服务器
echo   2. diagnose_server        - 诊断特定服务器
echo   3. check_all_languages    - 检查 10 种语言运行时
echo.
echo 搜索工具:
echo   4. search_mcp_packages    - 搜索 MCP 包
echo   5. get_popular_mcp_packages - 获取热门包
echo   6. install_mcp_package    - 安装 MCP 包
echo.
echo 浏览器工具:
echo   7. diagnose_playwright    - 诊断 Playwright
echo   8. install_playwright_browsers - 安装浏览器
echo.
echo ========================================
echo 命令行直接使用
echo ========================================
echo.
echo cd C:\Users\Administrator\mcp-diagnoser
echo node dist/index.js check          # 诊断所有服务器
echo node dist/index.js languages      # 检查语言
echo node dist/index.js search github  # 搜索 MCP 包
echo node dist/index.js web-search "AI tutorial"  # 网页搜索
echo node dist/index.js crawl https://example.com # 爬取网站
echo.
echo ========================================
echo 配置成功!
echo ========================================
echo.
echo 详细文档：C:\Users\Administrator\mcp-diagnoser\QWEN_CLI_SETUP.md
echo.

pause
