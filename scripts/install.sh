#!/bin/bash

# MCP Diagnoser Installation Script
# Supports: Linux, macOS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PACKAGE_NAME="mcp-diagnoser"
NODE_MIN_VERSION="18.0.0"
INSTALL_DIR="/usr/local/lib/$PACKAGE_NAME"
BIN_DIR="/usr/local/bin"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}       MCP Diagnoser Installation Script              ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo

# Detect OS
detect_os() {
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
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        echo -e "${YELLOW}Warning: Running as root. Consider using a regular user account.${NC}"
    fi
}

# Check Node.js installation
check_nodejs() {
    echo -e "${BLUE}Checking Node.js installation...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js is not installed!${NC}"
        echo
        echo "Please install Node.js ${NODE_MIN_VERSION} or higher:"
        echo
        if [[ "$OS" == "macos" ]]; then
            echo "  macOS:"
            echo "    brew install node@20"
            echo "    # or download from https://nodejs.org/"
        elif [[ "$OS" == "linux" ]]; then
            echo "  Ubuntu/Debian:"
            echo "    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
            echo "    sudo apt-get install -y nodejs"
            echo
            echo "  Fedora/RHEL:"
            echo "    sudo dnf install -y nodejs"
            echo
            echo "  Arch Linux:"
            echo "    sudo pacman -S nodejs npm"
        fi
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"
    
    # Check minimum version
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm is not installed!${NC}"
        exit 1
    fi
    
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm $NPM_VERSION found${NC}"
}

# Check system dependencies
check_system_deps() {
    echo
    echo -e "${BLUE}Checking system dependencies...${NC}"
    
    # Check for build tools (needed for some npm packages)
    if [[ "$OS" == "linux" ]]; then
        if ! command -v make &> /dev/null || ! command -v g++ &> /dev/null; then
            echo -e "${YELLOW}⚠ Build tools not found. Some features may not work.${NC}"
            echo "  Install with:"
            echo "    Ubuntu/Debian: sudo apt-get install -y build-essential"
            echo "    Fedora/RHEL: sudo dnf groupinstall 'Development Tools'"
            echo "    Arch: sudo pacman -S base-devel"
        else
            echo -e "${GREEN}✓ Build tools found${NC}"
        fi
    fi
    
    if [[ "$OS" == "macos" ]]; then
        if ! xcode-select -v &> /dev/null; then
            echo -e "${YELLOW}⚠ Xcode Command Line Tools not found.${NC}"
            echo "  Install with: xcode-select --install"
        else
            echo -e "${GREEN}✓ Xcode Command Line Tools found${NC}"
        fi
    fi
}

# Install global npm packages
install_npm_packages() {
    echo
    echo -e "${BLUE}Installing $PACKAGE_NAME globally...${NC}"
    
    # Get the directory where this script is located
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
    
    # Check if we're installing from local source or npm
    if [[ -f "$PROJECT_ROOT/package.json" ]]; then
        echo -e "${BLUE}Installing from local source...${NC}"
        cd "$PROJECT_ROOT"
        npm install
        npm run build
        npm link
    else
        echo -e "${BLUE}Installing from npm...${NC}"
        npm install -g "$PACKAGE_NAME"
    fi
    
    echo -e "${GREEN}✓ Installation complete${NC}"
}

# Create wrapper script
create_wrapper() {
    echo
    echo -e "${BLUE}Creating wrapper script...${NC}"
    
    # The npm link should have created the binary
    if command -v $PACKAGE_NAME &> /dev/null; then
        echo -e "${GREEN}✓ Binary created at: $(which $PACKAGE_NAME)${NC}"
    else
        echo -e "${YELLOW}⚠ Binary not found in PATH${NC}"
        echo "  You may need to add npm global bin directory to PATH:"
        echo "    export PATH=\$PATH:$(npm config get prefix)/bin"
    fi
}

# Verify installation
verify_installation() {
    echo
    echo -e "${BLUE}Verifying installation...${NC}"
    
    if command -v $PACKAGE_NAME &> /dev/null; then
        VERSION=$($PACKAGE_NAME --version)
        echo -e "${GREEN}✓ $PACKAGE_NAME $VERSION installed successfully${NC}"
        
        echo
        echo -e "${BLUE}Testing basic commands...${NC}"
        $PACKAGE_NAME --help > /dev/null 2>&1 && echo -e "${GREEN}✓ Help command works${NC}"
        
        echo
        echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║${NC}              Installation Successful!                ${GREEN}║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
        echo
        echo -e "${BLUE}Usage:${NC}"
        echo "  $PACKAGE_NAME check          # Diagnose all MCP servers"
        echo "  $PACKAGE_NAME packages       # Diagnose all packages"
        echo "  $PACKAGE_NAME --help         # Show all commands"
        echo
    else
        echo -e "${RED}✗ Installation verification failed${NC}"
        echo "  Please check the error messages above"
        exit 1
    fi
}

# Show post-installation tips
show_tips() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}              Post-Installation Tips                  ${BLUE}║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
    echo
    
    echo -e "${YELLOW}1. Configure npm mirror (China users):${NC}"
    echo "   npm config set registry https://registry.npmmirror.com"
    echo
    
    echo -e "${YELLOW}2. Add MCP Diagnoser to your MCP configuration:${NC}"
    echo "   Add to ~/.mcp.json:"
    echo '   {'
    echo '     "mcpServers": {'
    echo '       "diagnoser": {'
    echo '         "command": "mcp-diagnoser",'
    echo '         "args": ["check"]'
    echo '       }'
    echo '     }'
    echo '   }'
    echo
    
    echo -e "${YELLOW}3. Quick start:${NC}"
    echo "   mcp-diagnoser check          # Run full diagnosis"
    echo "   mcp-diagnoser packages       # Check all packages"
    echo "   mcp-diagnoser package-managers  # List package managers"
    echo
}

# Main installation function
main() {
    detect_os
    echo -e "${BLUE}Detected OS: $OS_NAME${NC}"
    echo
    
    check_root
    check_nodejs
    check_system_deps
    install_npm_packages
    create_wrapper
    verify_installation
    show_tips
    
    echo -e "${GREEN}Installation completed successfully!${NC}"
    echo -e "${BLUE}Happy diagnosing! 🎉${NC}"
}

# Run main function
main "$@"
