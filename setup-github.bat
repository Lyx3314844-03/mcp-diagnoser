@echo off
REM MCP Diagnoser - GitHub CLI Setup and Repo Creation
REM Author: Lan <3314844@gmail.com>

echo ╔══════════════════════════════════════════════════════════╗
echo ║     GitHub CLI Setup and Repository Creation             ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Set gh path
set GH_PATH=C:\Program Files\GitHub CLI\gh.exe

echo === Step 1: Verify GitHub CLI Installation ===
echo.

if not exist "%GH_PATH%" (
    echo [ERROR] GitHub CLI not found at %GH_PATH%
    echo Please install it manually from https://cli.github.com/
    pause
    exit /b 1
)

echo [OK] GitHub CLI found
"%GH_PATH%" --version
echo.

echo === Step 2: Authenticate with GitHub ===
echo.

echo Please complete authentication in your browser...
"%GH_PATH%" auth login

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Authentication failed
    pause
    exit /b 1
)

echo [OK] Authentication successful
echo.

echo === Step 3: Create GitHub Repository ===
echo.

cd /d C:\Users\Administrator\mcp-diagnoser

echo Creating repository: Lan/mcp-diagnoser
"%GH_PATH%" repo create Lan/mcp-diagnoser --public --source=. --remote=origin --push

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Repository creation failed
    echo Repository might already exist
    echo.
    echo Trying to push to existing repository...
    "%GH_PATH%" repo sync Lan/mcp-diagnoser
    git push -u origin master
) else (
    echo [OK] Repository created and code pushed
)

echo.

echo === Step 4: Push Version Tag ===
echo.

"%GH_PATH%" release create v1.3.0 --title "v1.3.0 - Initial Release" --notes "Initial release of MCP Diagnoser v1.3.0"

echo.

echo ╔══════════════════════════════════════════════════════════╗
echo ║              Setup Complete!                             ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo Repository URL: https://github.com/Lan/mcp-diagnoser
echo.
echo Next steps:
echo 1. Visit the repository on GitHub
echo 2. Verify all files are uploaded
echo 3. Create a Release if not created automatically
echo.

pause
