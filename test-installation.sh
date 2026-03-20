#!/bin/bash

# MCP Diagnoser - Installation Test Script
# Tests all installation methods and verifies functionality

# Author: Lan <3314844@gmail.com>
# Version: 1.3.0

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}        MCP Diagnoser - Installation Test Suite       ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo

# Test function
test_command() {
    local test_name=$1
    local command=$2
    
    echo -e "${BLUE}Testing: ${test_name}${NC}"
    
    if eval $command > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}: ${test_name}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}: ${test_name}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Test function with output
test_command_output() {
    local test_name=$1
    local command=$2
    
    echo -e "${BLUE}Testing: ${test_name}${NC}"
    
    if output=$(eval $command 2>&1); then
        echo -e "${GREEN}✓ PASS${NC}: ${test_name}"
        echo -e "${GRAY}  Output: $(echo $output | head -c 100)${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}: ${test_name}"
        echo -e "${YELLOW}  Error: $output${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo -e "${YELLOW}=== Prerequisites Check ===${NC}"
echo

# Check Node.js
test_command "Node.js installation" "node --version"
NODE_VERSION=$(node --version 2>&1 || echo "not installed")
echo "  Version: $NODE_VERSION"

# Check npm
test_command "npm installation" "npm --version"
NPM_VERSION=$(npm --version 2>&1 || echo "not installed")
echo "  Version: $NPM_VERSION"

echo
echo -e "${YELLOW}=== Build Test ===${NC}"
echo

# Clean and rebuild
cd "$(dirname "$0")"
echo -e "${BLUE}Cleaning build artifacts...${NC}"
rm -rf dist/ 2>/dev/null || true

echo -e "${BLUE}Building project...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Build failed${NC}"
    ((TESTS_FAILED++))
    exit 1
fi

echo
echo -e "${YELLOW}=== Local Execution Tests ===${NC}"
echo

# Test direct execution
test_command "Direct execution (npm start)" "npm start -- --version"
test_command "Direct execution (node dist/index.js)" "node dist/index.js --version"

echo
echo -e "${YELLOW}=== CLI Commands Tests ===${NC}"
echo

# Test all major commands
test_command "Command: --help" "node dist/index.js --help"
test_command "Command: --version" "node dist/index.js --version"
test_command "Command: check" "node dist/index.js check --json"
test_command "Command: languages" "node dist/index.js languages --json"
test_command "Command: packages" "node dist/index.js packages --json"
test_command "Command: package-managers" "node dist/index.js package-managers"
test_command "Command: search" "node dist/index.js search mcp --limit 1 --json"
test_command "Command: popular" "node dist/index.js popular --limit 1"

echo
echo -e "${YELLOW}=== MCP Server Tests ===${NC}"
echo

# Test MCP server if available
if [ -f "server/dist/server.js" ]; then
    test_command "MCP Server execution" "node server/dist/server.js --help"
else
    echo -e "${YELLOW}⚠ MCP Server not built (optional)${NC}"
fi

echo
echo -e "${YELLOW}=== Package Configuration Tests ===${NC}"
echo

# Test package.json validity
test_command "package.json validity" "node -e \"require('./package.json')\""

# Check required fields
test_command "package.json: name field" "node -e \"require('./package.json').name\""
test_command "package.json: version field" "node -e \"require('./package.json').version\""
test_command "package.json: author field" "node -e \"require('./package.json').author\""
test_command "package.json: bin field" "node -e \"require('./package.json').bin['mcp-diagnoser']\""

echo
echo -e "${YELLOW}=== Scripts Tests ===${NC}"
echo

test_command "Script: build" "npm run build"
test_command "Script: start" "npm start -- --version"

echo
echo -e "${YELLOW}=== File Structure Tests ===${NC}"
echo

# Check required files exist
for file in "package.json" "README.md" "LICENSE" "dist/index.js" "src/index.ts"; do
    test_command "File exists: $file" "test -f $file"
done

# Check scripts directory
for file in "scripts/install.sh" "scripts/check-deps.sh" "scripts/postinstall.js"; do
    test_command "Script exists: $file" "test -f $file"
done

echo
echo -e "${YELLOW}=== Documentation Tests ===${NC}"
echo

# Check documentation files
for doc in "README.md" "README_zh.md" "CHANGELOG.md" "CONTRIBUTING.md" \
           "MCP_SERVER_GUIDE.md" "QUICK_REFERENCE_CARD.md" \
           "INSTALLATION_LINUX_MACOS.md" "DOCS_INDEX.md"; do
    test_command "Doc exists: $doc" "test -f $doc"
done

echo
echo -e "${YELLOW}=== Summary ===${NC}"
echo

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo -e "${BLUE}Tests Passed:${NC} ${GREEN}$TESTS_PASSED${NC}"
echo -e "${BLUE}Tests Failed:${NC} ${RED}$TESTS_FAILED${NC}"
echo -e "${BLUE}Total Tests:${NC} $TOTAL_TESTS"
echo

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}              All Tests Passed! ✓                     ${GREEN}║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║${NC}              Some Tests Failed! ✗                    ${RED}║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
