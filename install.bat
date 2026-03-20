@echo off
echo ========================================
echo MCP Diagnoser Installation
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    exit /b 1
)

echo.
echo [2/3] Building TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build
    exit /b 1
)

echo.
echo [3/3] Installing globally...
call npm install -g .
if %errorlevel% neq 0 (
    echo WARNING: Global installation failed, you can still use locally
    echo.
    echo To use locally, run: npm start
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Usage:
echo   mcp-diagnoser check          - Diagnose all MCP servers
echo   mcp-diagnoser languages      - Check language runtimes
echo   mcp-diagnoser fix-all        - Auto-fix all issues
echo.
echo Or locally:
echo   npm start -- check
echo.

pause
