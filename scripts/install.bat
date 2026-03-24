@echo off
REM MCP Diagnoser v3.0.0 Windows 安装脚本
REM 支持：Windows 10/11

chcp 65001 >nul 2>&1

set VERSION=3.0.0
set PACKAGE_NAME=mcp-diagnoser
set REPO_URL=https://github.com/Lyx3314844-03/mcp-diagnoser.git

echo ╔══════════════════════════════════════════════════════════╗
echo ║     MCP Diagnoser v%VERSION% Windows 安装脚本             ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM 检查 Node.js
echo [检查] 检查 Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] Node.js 未安装
    echo 请先安装 Node.js 18+: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=2 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=1 delims=." %%j in ("%NODE_VERSION%") do set NODE_MAJOR=%%j

if %NODE_MAJOR% LSS 18 (
    echo [错误] Node.js 版本过低 (需要 18+, 当前：%NODE_VERSION%)
    pause
    exit /b 1
)

echo [OK] Node.js %NODE_VERSION% 已安装
echo.

REM 检查 npm
echo [检查] 检查 npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] npm 未安装
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% 已安装
echo.

REM 选择安装方式
echo 选择安装方式:
echo   1^) 从 npm 全局安装 ^(推荐^)
echo   2^) 从源码安装
echo   3^) 仅检查环境
echo.
set /p CHOICE="请选择 [1-3]: "

if "%CHOICE%"=="1" goto INSTALL_GLOBAL
if "%CHOICE%"=="2" goto INSTALL_SOURCE
if "%CHOICE%"=="3" goto VERIFY_ONLY

echo [错误] 无效选择
pause
exit /b 1

:INSTALL_GLOBAL
echo.
echo [安装] 正在全局安装 %PACKAGE_NAME%@%VERSION%...
call npm install -g %PACKAGE_NAME%@%VERSION%
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 安装失败
    pause
    exit /b 1
)
echo [OK] 安装成功
goto VERIFY

:INSTALL_SOURCE
echo.
echo [安装] 正在从源码安装...

if exist %PACKAGE_NAME% (
    echo [提示] 目录已存在，正在更新...
    cd %PACKAGE_NAME%
    git pull
) else (
    git clone %REPO_URL%
    cd %PACKAGE_NAME%
)

echo [安装] 正在安装依赖...
call npm install

echo [构建] 正在构建...
call npm run build:all

echo [链接] 正在创建全局链接...
call npm link

echo [OK] 从源码安装成功
cd ..
goto VERIFY

:VERIFY_ONLY
echo.
echo [OK] 环境检查通过
pause
exit /b 0

:VERIFY
echo.
echo [验证] 验证安装...
where mcp-diagnoser >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 验证失败
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('mcp-diagnoser --version') do set INSTALLED_VERSION=%%i
echo [OK] mcp-diagnoser %INSTALLED_VERSION% 已安装

echo.
echo ══════════════════════════════════════════════════════════
echo   安装完成！
echo ══════════════════════════════════════════════════════════
echo.
echo 使用方法:
echo   mcp-diagnoser check          诊断所有 MCP 服务器
echo   mcp-diagnoser languages      检查语言环境
echo   mcp-diagnoser --help         显示帮助
echo.

pause
