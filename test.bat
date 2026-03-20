@echo off
echo ========================================
echo MCP Diagnoser - Quick Test
echo ========================================
echo.

cd /d "%~dp0"

echo Running diagnosis...
echo.

call npm start -- check --verbose

echo.
echo ========================================
echo Test Complete
echo ========================================

pause
