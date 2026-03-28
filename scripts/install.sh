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
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印横幅
print_banner() {
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     MCP Diagnoser v${VERSION} 安装脚本                    ║${NC}"
    echo -e "${GREEN}║     支持：Linux, macOS                                   ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# 检测操作系统
detect_os() {
    case "$(uname -s)" in
        Linux*)     
            OS="Linux"
            # 检测 Linux 发行版
            if [ -f /etc/os-release ]; then
                . /etc/os-release
                DISTRO=$NAME
            else
                DISTRO="Unknown Linux"
            fi
            ;;
        Darwin*)    
            OS="macOS"
            DISTRO="macOS $(sw_vers -productVersion)"
            ;;
        *)          
            OS="Unknown"
            DISTRO="Unknown"
            ;;
    esac
    echo -e "${BLUE}检测到操作系统：${OS} - ${DISTRO}${NC}"
}

# 检查先决条件
check_prerequisites() {
    echo ""
    echo -e "${BLUE}检查先决条件...${NC}"
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        echo -e "${YELLOW}提示：${NC}"
        if [ "$OS" == "macOS" ]; then
            echo "  macOS: brew install node@20"
        else
            echo "  Linux: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
        fi
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js 版本过低 (需要 18+, 当前：$(node -v))${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js $(node -v) 已安装${NC}"

    # 检查 npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ npm $(npm -v) 已安装${NC}"

    # 检查 git
    if ! command -v git &> /dev/null; then
        echo -e "${YELLOW}⚠ git 未安装（从源码安装需要）${NC}"
    else
        echo -e "${GREEN}✓ git $(git --version | cut -d' ' -f3) 已安装${NC}"
    fi
}

# 安装系统依赖 (Linux)
install_linux_deps() {
    if [ "$OS" != "Linux" ]; then
        return
    fi

    echo ""
    echo -e "${BLUE}检查系统依赖...${NC}"
    
    # 检查 Playwright 系统依赖
    MISSING_DEPS=()
    
    # 检查常见依赖
    for cmd in curl wget ca-certificates; do
        if ! command -v $cmd &> /dev/null; then
            MISSING_DEPS+=($cmd)
        fi
    done

    if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
        echo -e "${YELLOW}发现缺失的依赖：${MISSING_DEPS[*]}${NC}"
        echo -e "${YELLOW}是否自动安装？(y/n)${NC}"
        read -p "> " install_deps
        
        if [ "$install_deps" == "y" ] || [ "$install_deps" == "Y" ]; then
            if command -v apt-get &> /dev/null; then
                sudo apt-get update && sudo apt-get install -y "${MISSING_DEPS[@]}"
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y "${MISSING_DEPS[@]}"
            elif command -v yum &> /dev/null; then
                sudo yum install -y "${MISSING_DEPS[@]}"
            elif command -v pacman &> /dev/null; then
                sudo pacman -S --noconfirm "${MISSING_DEPS[@]}"
            fi
            echo -e "${GREEN}✓ 系统依赖安装完成${NC}"
        fi
    else
        echo -e "${GREEN}✓ 系统依赖完整${NC}"
    fi
}

# 全局安装
install_globally() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}正在全局安装 ${PACKAGE_NAME}@${VERSION}...${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    
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
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}正在从源码安装...${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

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

# 安装 Playwright 浏览器
install_playwright_browsers() {
    echo ""
    echo -e "${BLUE}是否安装 Playwright 浏览器？(推荐)${NC}"
    echo "  这将安装 Chromium, Firefox, WebKit (需要约 500MB 空间)"
    echo -e "${YELLOW}是否继续？(y/n)${NC}"
    read -p "> " install_pw
    
    if [ "$install_pw" == "y" ] || [ "$install_pw" == "Y" ]; then
        echo -e "${BLUE}正在安装 Playwright 浏览器...${NC}"
        npx playwright install
        
        # Linux 系统依赖
        if [ "$OS" == "Linux" ]; then
            echo -e "${BLUE}是否安装 Playwright 系统依赖？(需要 sudo 权限)${NC}"
            echo -e "${YELLOW}是否继续？(y/n)${NC}"
            read -p "> " install_pw_deps
            
            if [ "$install_pw_deps" == "y" ] || [ "$install_pw_deps" == "Y" ]; then
                npx playwright install --with-deps
            fi
        fi
        
        echo -e "${GREEN}✓ Playwright 浏览器安装完成${NC}"
    fi
}

# 验证安装
verify_installation() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}验证安装...${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

    if command -v mcp-diagnoser &> /dev/null; then
        VERSION_INSTALLED=$(mcp-diagnoser --version)
        echo -e "${GREEN}✓ mcp-diagnoser ${VERSION_INSTALLED} 已安装${NC}"
        
        # 测试基本功能
        echo ""
        echo -e "${BLUE}运行快速诊断测试...${NC}"
        mcp-diagnoser --help > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ 命令执行正常${NC}"
        else
            echo -e "${YELLOW}⚠  命令执行异常${NC}"
        fi

        echo ""
        echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  安装完成！${NC}                                        ║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${CYAN}使用方法:${NC}"
        echo "  mcp-diagnoser check          # 诊断所有 MCP 服务器"
        echo "  mcp-diagnoser languages      # 检查语言环境"
        echo "  mcp-diagnoser search <query> # 搜索 MCP 包"
        echo "  mcp-diagnoser --help         # 显示帮助"
        echo ""
        echo -e "${CYAN}常用命令:${NC}"
        echo "  mcp-diagnoser server <name>  # 诊断特定服务器"
        echo "  mcp-diagnoser packages       # 诊断所有包"
        echo "  mcp-diagnoser playwright     # 检查 Playwright"
        echo ""
    else
        echo -e "${RED}✗ 验证失败${NC}"
        exit 1
    fi
}

# 显示使用说明
show_usage_guide() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}使用指南${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}1. 诊断所有 MCP 服务器:${NC}"
    echo "   mcp-diagnoser check"
    echo ""
    echo -e "${YELLOW}2. 诊断特定服务器:${NC}"
    echo "   mcp-diagnoser server <server-name>"
    echo ""
    echo -e "${YELLOW}3. 检查编程语言环境:${NC}"
    echo "   mcp-diagnoser languages"
    echo ""
    echo -e "${YELLOW}4. 搜索 MCP 包:${NC}"
    echo "   mcp-diagnoser search <keyword>"
    echo ""
    echo -e "${YELLOW}5. 安装 MCP 包:${NC}"
    echo "   mcp-diagnoser install <package-name>"
    echo ""
    echo -e "${YELLOW}6. 诊断包依赖:${NC}"
    echo "   mcp-diagnoser packages"
    echo ""
    echo -e "${YELLOW}7. 自动修复问题:${NC}"
    echo "   mcp-diagnoser fix-all"
    echo ""
    echo -e "${YELLOW}8. 检查 Playwright:${NC}"
    echo "   mcp-diagnoser playwright"
    echo ""
}

# 主函数
main() {
    print_banner
    detect_os
    check_prerequisites
    
    if [ "$OS" == "Linux" ]; then
        install_linux_deps
    fi

    echo ""
    echo -e "${BLUE}选择安装方式:${NC}"
    echo "  1) 从 npm 全局安装 (推荐) - 快速简单"
    echo "  2) 从源码安装 - 适合开发"
    echo "  3) 仅检查环境"
    echo ""
    read -p "请选择 [1-3]: " choice

    case $choice in
        1)
            install_globally
            verify_installation
            show_usage_guide
            ;;
        2)
            install_from_source
            verify_installation
            install_playwright_browsers
            show_usage_guide
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
