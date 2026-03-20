@echo off
REM 清理不必要的文件，准备发布到 GitHub

echo ========================================
echo MCP Diagnoser - 发布前清理脚本
echo ========================================
echo.

echo 以下文件将被删除:
echo.
echo - ENHANCEMENT_SUMMARY.md
echo - ENHANCEMENT_SUMMARY_V2.md
echo - PACKAGE_DIAGNOSIS_FEATURES.md
echo - QUICK_REFERENCE.md
echo - PROJECT_STRUCTURE.md
echo - QUICKSTART.md
echo - QWEN_CLI_SETUP.md
echo - BROWSER_SEARCH_FEATURES.md
echo - test.bat
echo - install.bat
echo - verify-qwen-config.bat
echo - logs\ 目录
echo.

set /p confirm="确认清理？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo.
    echo 清理已取消
    pause
    exit /b 0
)

echo.
echo 正在清理...

del /q ENHANCEMENT_SUMMARY.md 2>nul
del /q ENHANCEMENT_SUMMARY_V2.md 2>nul
del /q PACKAGE_DIAGNOSIS_FEATURES.md 2>nul
del /q QUICK_REFERENCE.md 2>nul
del /q PROJECT_STRUCTURE.md 2>nul
del /q QUICKSTART.md 2>nul
del /q QWEN_CLI_SETUP.md 2>nul
del /q BROWSER_SEARCH_FEATURES.md 2>nul
del /q test.bat 2>nul
del /q install.bat 2>nul
del /q verify-qwen-config.bat 2>nul

if exist logs (
    rmdir /s /q logs 2>nul
)

echo.
echo 清理完成!
echo.
echo 保留的重要文件:
echo - README.md (英文主文档)
echo - README_zh.md (中文文档)
echo - LICENSE (许可证)
echo - CHANGELOG.md (更新日志)
echo - CONTRIBUTING.md (贡献指南)
echo - RELEASE_CHECKLIST.md (发布检查清单)
echo.

echo 下一步:
echo 1. 更新 package.json 中的作者信息和仓库 URL
echo 2. 更新 README.md 中的仓库 URL
echo 3. 运行 npm run build 确保编译成功
echo 4. 运行 git add . 和 git commit
echo 5. 推送到 GitHub
echo.

pause
