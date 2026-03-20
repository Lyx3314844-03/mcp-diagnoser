#!/bin/bash

# MCP Diagnoser - System Dependency Checker
# For Linux and macOS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}        MCP Diagnoser - System Dependency Check       ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    OS_NAME="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "linux-musl"* ]]; then
    OS="linux"
    OS_NAME="Linux"
else
    echo -e "${RED}Unsupported operating system: $OSTYPE${NC}"
    exit 1
fi

echo -e "${BLUE}Detected OS: $OS_NAME${NC}"
echo

# Check functions
check_command() {
    local cmd=$1
    local name=$2
    local install_hint=$3
    
    if command -v $cmd &> /dev/null; then
        version=$($cmd --version 2>&1 | head -n 1 || $cmd -v 2>&1 | head -n 1 || echo "installed")
        echo -e "${GREEN}✓ $name${NC} - $version"
        return 0
    else
        echo -e "${RED}✗ $name${NC} - Not found"
        if [ -n "$install_hint" ]; then
            echo -e "  ${YELLOW}Install: $install_hint${NC}"
        fi
        return 1
    fi
}

# Track missing dependencies
MISSING=0

echo -e "${BLUE}=== Core Dependencies ===${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    NODE_PATH=$(which node)
    echo -e "${GREEN}✓ Node.js${NC} - $NODE_VERSION at $NODE_PATH"
    
    # Check version >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ $NODE_MAJOR -lt 18 ]; then
        echo -e "  ${RED}✗ Version too old. Need Node.js 18+${NC}"
        MISSING=1
    fi
else
    echo -e "${RED}✗ Node.js${NC} - Not found"
    if [[ "$OS" == "macos" ]]; then
        echo -e "  ${YELLOW}Install: brew install node@20${NC}"
    else
        echo -e "  ${YELLOW}Install: See https://nodejs.org/${NC}"
    fi
    MISSING=1
fi

# Check npm
check_command "npm" "npm" "Included with Node.js"

echo
echo -e "${BLUE}=== Optional Package Managers ===${NC}"

# Check various package managers
check_command "pip" "pip" "python3 -m pip install pip" || true
check_command "pip3" "pip3" "python3 -m pip install pip" || true
check_command "uv" "uv" "curl -LsSf https://astral.sh/uv/install.sh | sh" || true
check_command "cargo" "Cargo" "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh" || true
check_command "go" "Go" "See https://golang.org/dl/" || true

if [[ "$OS" == "linux" ]]; then
    echo
    echo -e "${BLUE}=== Linux Build Tools ===${NC}"
    
    # Check for package manager
    if command -v apt-get &> /dev/null; then
        echo -e "${GREEN}✓ apt${NC} - Debian/Ubuntu package manager"
        check_command "make" "make" "sudo apt-get install build-essential" || true
        check_command "g++" "g++" "sudo apt-get install build-essential" || true
    elif command -v dnf &> /dev/null; then
        echo -e "${GREEN}✓ dnf${NC} - Fedora/RHEL package manager"
        check_command "make" "make" "sudo dnf groupinstall 'Development Tools'" || true
        check_command "g++" "g++" "sudo dnf groupinstall 'Development Tools'" || true
    elif command -v pacman &> /dev/null; then
        echo -e "${GREEN}✓ pacman${NC} - Arch Linux package manager"
        check_command "make" "make" "sudo pacman -S base-devel" || true
        check_command "g++" "g++" "sudo pacman -S base-devel" || true
    fi
fi

if [[ "$OS" == "macos" ]]; then
    echo
    echo -e "${BLUE}=== macOS Tools ===${NC}"
    
    # Check Xcode Command Line Tools
    if xcode-select -v &> /dev/null; then
        XCODE_VERSION=$(xcode-select -v 2>&1)
        echo -e "${GREEN}✓ Xcode Command Line Tools${NC} - $XCODE_VERSION"
    else
        echo -e "${RED}✗ Xcode Command Line Tools${NC} - Not found"
        echo -e "  ${YELLOW}Install: xcode-select --install${NC}"
    fi
    
    # Check Homebrew
    check_command "brew" "Homebrew" "/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"" || true
fi

echo
echo -e "${BLUE}=== Python Environment ===${NC}"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python 3${NC} - $PYTHON_VERSION"
else
    echo -e "${YELLOW}⚠ Python 3${NC} - Not found (optional)"
fi

echo
echo -e "${BLUE}=== Summary ===${NC}"

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✓ All core dependencies are installed!${NC}"
    echo
    echo "You can now install MCP Diagnoser:"
    echo "  npm install -g mcp-diagnoser"
    echo "  # or"
    echo "  bash scripts/install.sh"
else
    echo -e "${RED}✗ Some core dependencies are missing${NC}"
    echo
    echo "Please install Node.js 18+ first, then run:"
    echo "  npm install -g mcp-diagnoser"
fi

echo
