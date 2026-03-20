@echo off
REM MCP Diagnoser - Installation Test Script (Windows)
REM Author: Lan <3314844@gmail.com>
REM Version: 1.3.0

setlocal enabledelayedexpansion

set TESTS_PASSED=0
set TESTS_FAILED=0

echo ╔══════════════════════════════════════════════════════════╗
echo ║        MCP Diagnoser - Installation Test Suite           ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Test function
:TEST
echo Testing: %~1
%~2 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] %~1
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] %~1
    set /a TESTS_FAILED+=1
)
goto :EOF

echo === Prerequisites Check ===
echo.

call :TEST "Node.js installation" "node --version"
node --version >nul 2>&1 && set NODE_VER=%ERRORLEVEL% || set NODE_VER=failed
echo   Node.js: %NODE_VER%

call :TEST "npm installation" "npm --version"
npm --version >nul 2>&1 && set NPM_VER=%ERRORLEVEL% || set NPM_VER=failed
echo   npm: %NPM_VER%

echo.
echo === Build Test ===
echo.

echo Building project...
call npm run build >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Build successful
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] Build failed
    set /a TESTS_FAILED+=1
    exit /b 1
)

echo.
echo === Local Execution Tests ===
echo.

call :TEST "Direct execution (npm start)" "npm start -- --version"
call :TEST "Direct execution (node dist/index.js)" "node dist/index.js --version"

echo.
echo === CLI Commands Tests ===
echo.

call :TEST "Command: --help" "node dist/index.js --help"
call :TEST "Command: --version" "node dist/index.js --version"
call :TEST "Command: check (JSON)" "node dist/index.js check --json"
call :TEST "Command: languages" "node dist/index.js languages --json"
call :TEST "Command: packages" "node dist/index.js packages --json"
call :TEST "Command: package-managers" "node dist/index.js package-managers"
call :TEST "Command: search" "node dist/index.js search mcp --limit 1 --json"
call :TEST "Command: popular" "node dist/index.js popular --limit 1"

echo.
echo === Package Configuration Tests ===
echo.

call :TEST "package.json validity" "node -e "require('./package.json')""
call :TEST "package.json: name field" "node -e "require('./package.json').name""
call :TEST "package.json: version field" "node -e "require('./package.json').version""
call :TEST "package.json: author field" "node -e "require('./package.json').author""

echo.
echo === File Structure Tests ===
echo.

for %%f in (package.json README.md LICENSE dist\index.js src\index.ts) do (
    if exist "%%f" (
        echo [PASS] File exists: %%f
        set /a TESTS_PASSED+=1
    ) else (
        echo [FAIL] File missing: %%f
        set /a TESTS_FAILED+=1
    )
)

echo.
echo === Scripts Tests ===
echo.

for %%f in (scripts\install.sh scripts\check-deps.sh scripts\postinstall.js) do (
    if exist "%%f" (
        echo [PASS] Script exists: %%f
        set /a TESTS_PASSED+=1
    ) else (
        echo [FAIL] Script missing: %%f
        set /a TESTS_FAILED+=1
    )
)

echo.
echo === Documentation Tests ===
echo.

for %%f in (README.md README_zh.md CHANGELOG.md CONTRIBUTING.md MCP_SERVER_GUIDE.md QUICK_REFERENCE_CARD.md INSTALLATION_LINUX_MACOS.md DOCS_INDEX.md) do (
    if exist "%%f" (
        echo [PASS] Doc exists: %%f
        set /a TESTS_PASSED+=1
    ) else (
        echo [FAIL] Doc missing: %%f
        set /a TESTS_FAILED+=1
    )
)

echo.
echo === Summary ===
echo.

set /a TOTAL_TESTS=TESTS_PASSED + TESTS_FAILED

echo Tests Passed: %TESTS_PASSED%
echo Tests Failed: %TESTS_FAILED%
echo Total Tests: %TOTAL_TESTS%
echo.

if %TESTS_FAILED% EQU 0 (
    echo ╔══════════════════════════════════════════════════════════╗
    echo ║              All Tests Passed!                           ║
    echo ╚══════════════════════════════════════════════════════════╝
    exit /b 0
) else (
    echo ╔══════════════════════════════════════════════════════════╗
    echo ║              Some Tests Failed!                          ║
    echo ╚══════════════════════════════════════════════════════════╝
    exit /b 1
)
