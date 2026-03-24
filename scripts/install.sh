#!/bin/bash

# MCP Diagnoser v3.0.0 安装脚本
# 支持：Linux, macOS

set -e

VERSION="3.0.0"
PACKAGE_NAME="mcp-diagnoser"
REPO_URL="https://github.com/Lyx3314844-03/mcp-diagnoser.git"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     MCP Diagnoser v${VERSION} 安装脚本                    ║${NC}"
echo -e "${GREEN}║     支持：Linux, macOS                                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# 检测操作系统
detect_os() {
    case "$(uname -s)" in
        Linux*)     OS="Linux";;
        Darwin*)    OS="macOS";;
        *)          OS="Unknown";;
    esac
    echo -e "${BLUE}检测到操作系统：${OS}${NC}"
}

# 检查 Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        echo "请先安装 Node.js 18+: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js 版本过低 (需要 18+, 当前：$(node -v))${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Node.js $(node -v) 已安装${NC}"
}

# 检查 npm
check_npm() {
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ npm $(npm -v) 已安装${NC}"
}

# 安装 Node.js (Linux)
install_node_linux() {
    echo -e "${YELLOW}正在安装 Node.js 20.x...${NC}"
    
    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command -v dnf &> /dev/null; then
        # Fedora/RHEL
        sudo dnf install -y nodejs
    elif command -v yum &> /dev/null; then
        # CentOS
        sudo yum install -y nodejs
    elif command -v pacman &> /dev/null; then
        # Arch Linux
        sudo pacman -S nodejs npm
    elif command -v zypper &> /dev/null; then
        # openSUSE
        sudo zypper install -y nodejs npm
    else
        echo -e "${RED}❌ 不支持的 Linux 发行版${NC}"
        exit 1
    fi
}

# 安装 Node.js (macOS)
install_node_macos() {
    echo -e "${YELLOW}正在安装 Node.js...${NC}"
    
    if command -v brew &> /dev/null; then
        brew install node@20
    else
        echo -e "${RED}❌ Homebrew 未安装${NC}"
        echo "请先安装 Homebrew: https://brew.sh/"
        exit 1
    fi
}

# 全局安装 mcp-diagnoser
install_globally() {
    echo ""
    echo -e "${BLUE}正在全局安装 ${PACKAGE_NAME}@${VERSION}...${NC}"
    npm install -g ${PACKAGE_NAME}@${VERSION}
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 安装成功！${NC}"
    else
        echo -e "${RED}✗ 安装失败${NC}"
        exit 1
    fi
}

# 从源码安装
install_from_source() {
    echo ""
    echo -e "${BLUE}正在从源码安装...${NC}"
    
    # 克隆仓库
    if [ -d "${PACKAGE_NAME}" ]; then
        echo -e "${YELLOW}⚠  目录已存在，正在更新...${NC}"
        cd ${PACKAGE_NAME}
        git pull
    else
        git clone ${REPO_URL}
        cd ${PACKAGE_NAME}
    fi
    
    # 安装依赖
    echo -e "${YELLOW}正在安装依赖...${NC}"
    npm install
    
    # 构建
    echo -e "${YELLOW}正在构建...${NC}"
    npm run build:all
    
    # 链接
    echo -e "${YELLOW}正在创建全局链接...${NC}"
    sudo npm link
    
    echo -e "${GREEN}✓ 从源码安装成功！${NC}"
}

# 验证安装
verify_installation() {
    echo ""
    echo -e "${BLUE}验证安装...${NC}"
    
    if command -v mcp-diagnoser &> /dev/null; then
        VERSION_INSTALLED=$(mcp-diagnoser --version)
        echo -e "${GREEN}✓ mcp-diagnoser ${VERSION_INSTALLED} 已安装${NC}"
        
        echo ""
        echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}  安装完成！${NC}"
        echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${BLUE}使用方法:${NC}"
        echo "  mcp-diagnoser check          # 诊断所有 MCP 服务器"
        echo "  mcp-diagnoser languages      # 检查语言环境"
        echo "  mcp-diagnoser --help         # 显示帮助"
        echo ""
    else
        echo -e "${RED}✗ 验证失败${NC}"
        exit 1
    fi
}

# 主函数
main() {
    detect_os
    
    echo ""
    echo -e "${BLUE}检查依赖...${NC}"
    check_node
    check_npm
    
    echo ""
    echo -e "${BLUE}选择安装方式:${NC}"
    echo "  1) 从 npm 全局安装 (推荐)"
    echo "  2) 从源码安装"
    echo "  3) 仅检查环境"
    echo ""
    read -p "请选择 [1-3]: " choice
    
    case $choice in
        1)
            install_globally
            verify_installation
            ;;
        2)
            install_from_source
            verify_installation
            ;;
        3)
            echo -e "${GREEN}✓ 环境检查通过${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}✗ 无效选择${NC}"
            exit 1
            ;;
    esac
}

# 运行
main
