@echo off
REM MCP Diagnoser v3.0.0 npm 发布脚本
REM 自动登录并发布到 npm

chcp 65001 >nul 2>&1

echo ╔══════════════════════════════════════════════════════════╗
echo ║     MCP Diagnoser v3.0.0 npm 发布脚本                    ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo [1/3] 检查 npm 登录状态...
npm whoami >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] 已登录
    goto PUBLISH
)

echo [未登录] 需要登录 npm
echo.
echo 请选择登录方式:
echo   1^) 交互式登录 ^(推荐^)
echo   2^) 使用 token 登录
echo   3^) 跳过 npm 发布
echo.
set /p CHOICE="请选择 [1-3]: "

if "%CHOICE%"=="1" goto LOGIN_INTERACTIVE
if "%CHOICE%"=="2" goto LOGIN_TOKEN
if "%CHOICE%"=="3" goto SKIP

echo [错误] 无效选择
pause
exit /b 1

:LOGIN_INTERACTIVE
echo.
echo [登录] 请使用 npm adduser 登录...
echo.
npm adduser
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 登录失败
    pause
    exit /b 1
)

echo [OK] 登录成功
goto VERIFY

:LOGIN_TOKEN
echo.
echo [登录] 请输入你的 npm token:
set /p NPM_TOKEN=
npm set //registry.npmjs.org/:_authToken=%NPM_TOKEN%
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 设置 token 失败
    pause
    exit /b 1
)

echo [OK] Token 设置成功
goto VERIFY

:VERIFY
echo.
echo [验证] 检查登录状态...
npm whoami
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 验证失败
    pause
    exit /b 1
)

:PUBLISH
echo.
echo [2/3] 构建项目...
call npm run build:all
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 构建失败
    pause
    exit /b 1
)
echo [OK] 构建成功

echo.
echo [3/3] 发布到 npm...
echo.
echo 注意：这将是公开发布 (--access public)
echo.
npm publish --access public
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [警告] 发布失败，可能原因:
    echo   - 版本号已存在
    echo   - 网络问题
    echo   - 权限不足
    echo.
    echo 请检查错误信息并重试。
    pause
    exit /b 1
)

echo.
echo ══════════════════════════════════════════════════════════
echo   发布成功！
echo ══════════════════════════════════════════════════════════
echo.
echo npm 包已发布：https://www.npmjs.com/package/mcp-diagnoser
echo.
echo 安装命令:
echo   npm install -g mcp-diagnoser@3.0.0
echo.

pause

:SKIP
echo.
echo [已跳过] npm 发布已跳过
echo.
echo 手动发布命令:
echo   npm adduser
echo   npm publish --access public
echo.

pause
