# MCP Diagnoser

[![npm version](https://img.shields.io/npm/v/mcp-diagnoser.svg)](https://www.npmjs.com/package/mcp-diagnoser)
[![Node.js version](https://img.shields.io/node/v/mcp-diagnoser.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Author: Lan](https://img.shields.io/badge/Author-Lan-blue.svg)](https://github.com/YOUR_USERNAME)
[![Email: 3314844@gmail.com](https://img.shields.io/badge/Email-3314844@gmail.com-red.svg)](mailto:3314844@gmail.com)
[![Security](https://img.shields.io/badge/security-audited-green.svg)](SECURITY.md)

**Comprehensive diagnostic tool for MCP (Model Context Protocol) servers** - Created by **Lan**. Detect installation, dependency, connection, configuration, and package issues with automatic fix suggestions.

> **Author**: Lan
> **Email**: 3314844@gmail.com
> **Version**: 2.7.0
> **License**: MIT
> **Security**: ✅ Audited

## 🚀 Features

### 🔍 Diagnostic Capabilities

- **Installation Check**: Detects missing commands and PATH issues
- **Dependency Check**: Verifies npm/Python/Java package dependencies
- **Connection Check**: Tests server connectivity
- **Configuration Check**: Validates MCP configuration files
- **Runtime Check**: Checks 10 programming language runtimes
- **Permission Check**: Detects file permission issues
- **Package Check**: **NEW** Diagnoses package installation status for 12 package managers

### 📦 Package Management (New!)

- **12 Package Managers**: npm, yarn, pnpm, pip, pip3, uv, uvx, cargo, go, dotnet, gem, composer
- **Package Status**: Detect installed/missing packages
- **Dependency Analysis**: Find version conflicts and peer dependency issues
- **Error Analysis**: Automatic diagnosis of installation failures (network, permission, version conflicts)
- **One-Click Install**: Install all missing packages automatically

### 🎭 Playwright Diagnosis

- **Installation Detection**: Check if Playwright is installed
- **Browser Status**: Detect Chromium/Firefox/WebKit installation
- **Configuration Check**: Verify playwright.config file
- **System Dependencies**: Check Linux system dependencies
- **Auto Installation**: One-click browser installation

### 🌐 Web Search & Crawling

- **Multi-Engine Search**: Google, Bing, Baidu, DuckDuckGo
- **Web Crawling**: Extract content from websites
- **Content Search**: Search within crawled content
- **Information Extraction**: Extract emails, phone numbers, links

### 🛠️ Auto-Fix

- Install missing commands automatically
- Fix common configuration errors
- Set environment variables
- Clean cache and temporary files
- Install missing packages

### 🌍 Supported Languages

1. **JavaScript/TypeScript** (Node.js) ✅
2. **Python** ✅
3. **Java** ✅
4. **Go** ✅
5. **Rust** ✅
6. **C#/.NET** ✅
7. **Ruby** ✅
8. **PHP** ✅
9. **Swift** ✅
10. **Kotlin** ✅

## 🛠️ Implemented Features

### 🔍 Diagnosis Tools (5 Tools)

| Tool | CLI | MCP | Description |
|------|-----|-----|-------------|
| **diagnose_all** | ✅ | ✅ | Diagnose all MCP servers |
| **diagnose_server** | ✅ | ✅ | Diagnose specific server |
| **fix_server** | ✅ | ✅ | Auto-fix server issues |
| **check_language** | ✅ | ✅ | Check specific language runtime |
| **check_all_languages** | ✅ | ✅ | Check all 10 languages |

### 📦 Package Management Tools (3 Tools)

| Tool | CLI | MCP | Description |
|------|-----|-----|-------------|
| **diagnose_packages** | ✅ | ✅ | Diagnose all packages (12 package managers) |
| **check_package_managers** | ✅ | ✅ | List available package managers |
| **diagnose_package** | ✅ | ✅ | Diagnose specific package |

### 🔎 Search Tools (1 Tool)

| Tool | CLI | MCP | Description |
|------|-----|-----|-------------|
| **search_mcp_packages** | ✅ | ✅ | Search MCP packages on npm & GitHub |

### 🎭 Playwright Tools (1 Tool)

| Tool | CLI | MCP | Description |
|------|-----|-----|-------------|
| **diagnose_playwright** | ✅ | ✅ | Diagnose Playwright & browsers |

### 🌐 Web Tools (4+ Tools)

| Tool | CLI | MCP | Description |
|------|-----|-----|-------------|
| **web_search** | ✅ | ✅ | Multi-engine web search (Google, Bing, etc.) |
| **crawl** | ✅ | ✅ | Crawl websites |
| **search_content** | ✅ | ✅ | Search within website |
| **extract_info** | ✅ | ✅ | Extract emails, phones, links |

### 📊 Supported Package Managers (12)

npm, yarn, pnpm, pip, pip3, uv, uvx, cargo, go, dotnet, gem, composer

### 🌍 Supported Languages (10)

JavaScript/TypeScript, Python, Java, Go, Rust, C#/.NET, Ruby, PHP, Swift, Kotlin

> 📖 **Detailed Features**: See [MCP_FEATURES_IMPLEMENTATION.md](MCP_FEATURES_IMPLEMENTATION.md) for complete feature list and implementation details.

## 📦 Installation

### Quick Install (All Platforms)

```bash
# Global installation (recommended)
npm install -g mcp-diagnoser

# Or use the installation script (Linux/macOS)
bash <(curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/install.sh)
```

### Platform-Specific Installation

#### Windows

```powers
# Using npm
npm install -g mcp-diagnoser

# Or from source
git clone https://github.com/YOUR_USERNAME/mcp-diagnoser.git
cd mcp-diagnoser
npm install
npm run build
npm link
```

#### macOS

```bash
# Method 1: Using npm (requires Node.js)
npm install -g mcp-diagnoser

# Method 2: Using installation script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/install.sh | bash

# Method 3: Using Homebrew (if available)
brew install mcp-diagnoser

# Install Node.js if not installed
brew install node@20
```

**macOS Requirements:**
- macOS 12.0 or later
- Xcode Command Line Tools: `xcode-select --install`
- Node.js 18+ (install with Homebrew: `brew install node@20`)

#### Linux

```bash
# Method 1: Using npm
npm install -g mcp-diagnoser

# Method 2: Using installation script (recommended)
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/install.sh | bash

# Method 3: From source
git clone https://github.com/YOUR_USERNAME/mcp-diagnoser.git
cd mcp-diagnoser
npm install
npm run build
sudo npm link
```

**Linux Requirements by Distribution:**

<details>
<summary><strong>Ubuntu/Debian</strong></summary>

```bash
# Update package list
sudo apt-get update

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build tools (optional, for compiling native modules)
sudo apt-get install -y build-essential

# Install mcp-diagnoser
npm install -g mcp-diagnoser
```

</details>

<details>
<summary><strong>Fedora/RHEL/CentOS</strong></summary>

```bash
# Install Node.js 20.x
sudo dnf install -y nodejs

# Install development tools (optional)
sudo dnf groupinstall -y "Development Tools"

# Install mcp-diagnoser
npm install -g mcp-diagnoser
```

</details>

<details>
<summary><strong>Arch Linux</strong></summary>

```bash
# Install Node.js and npm
sudo pacman -S nodejs npm

# Install base-devel (optional)
sudo pacman -S base-devel

# Install mcp-diagnoser
npm install -g mcp-diagnoser
```

</details>

<details>
<summary><strong>openSUSE</strong></summary>

```bash
# Install Node.js
sudo zypper install -y nodejs npm

# Install development tools (optional)
sudo zypper install -y -t pattern devel_basis

# Install mcp-diagnoser
npm install -g mcp-diagnoser
```

</details>

### Check System Dependencies

Before installation, you can check if your system has all required dependencies:

```bash
# Linux/macOS
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/check-deps.sh | bash

# Or run locally after cloning
bash scripts/check-deps.sh
```

### Verify Installation

```bash
# Check version
mcp-diagnoser --version

# Show help
mcp-diagnoser --help

# Run diagnosis
mcp-diagnoser check
```
```

## 💻 Usage

### CLI Commands

```bash
# ========== Diagnosis Commands ==========
# Diagnose all MCP servers
mcp-diagnoser check

# Diagnose specific server
mcp-diagnoser server playwright

# Check all language runtimes
mcp-diagnoser languages

# Auto-fix all issues
mcp-diagnoser fix-all

# Verbose output
mcp-diagnoser check --verbose

# JSON output
mcp-diagnoser check --json

# ========== Package Commands (NEW!) ==========
# Diagnose all packages used by MCP servers
mcp-diagnoser packages

# Diagnose specific package
mcp-diagnoser package @playwright/mcp
mcp-diagnoser package requests -m pip

# List available package managers
mcp-diagnoser package-managers

# Install missing packages
mcp-diagnoser install-missing
mcp-diagnoser install-missing --force  # Skip confirmation

# ========== Search Commands ==========
# Search MCP packages
mcp-diagnoser search github
mcp-diagnoser search playwright

# Search npm only
mcp-diagnoser search github --source npm

# Search GitHub only
mcp-diagnoser search github --source github

# Show popular MCP packages
mcp-diagnoser popular

# Install MCP package
mcp-diagnoser install @playwright/mcp
mcp-diagnoser install @playwright/mcp --global

# ========== Playwright Commands ==========
# Diagnose Playwright
mcp-diagnoser playwright

# Install Playwright browsers
mcp-diagnoser playwright-install
mcp-diagnoser playwright-install --browsers chromium,firefox
mcp-diagnoser playwright-install --with-deps  # Linux system deps

# ========== Web Search Commands ==========
# Search the web
mcp-diagnoser web-search "MCP protocol"
mcp-diagnoser web-search "MCP" --engine google
mcp-diagnoser web-search "MCP" --limit 20

# List search engines
mcp-diagnoser search-engines

# Crawl website
mcp-diagnoser crawl https://example.com

# Search within website
mcp-diagnoser search-content https://example.com "keyword"

# Extract information
mcp-diagnoser extract-info https://example.com --emails --phones
```

### MCP Tools

When running as MCP server, MCP Diagnoser provides the following tools for AI assistants:

#### 🔍 Diagnosis Tools

| Tool | Description | Example |
|------|-------------|---------|
| **diagnose_all** | Diagnose all MCP servers | "诊断所有 MCP 服务器" |
| **diagnose_server** | Diagnose specific server | "诊断 playwright 服务器" |
| **fix_server** | Auto-fix server issues | "修复 github 服务器" |
| **check_language** | Check specific language runtime | "检查 Python 运行时" |
| **check_all_languages** | Check all 10 languages | "检查所有编程语言环境" |

#### 📦 Package Tools

| Tool | Description | Example |
|------|-------------|---------|
| **diagnose_packages** | Diagnose all packages | "诊断所有安装包" |
| **check_package_managers** | List available package managers | "检查包管理器状态" |
| **diagnose_package** | Diagnose specific package | "诊断 @playwright/mcp 包" |

#### 🔎 Search Tools

| Tool | Description | Example |
|------|-------------|---------|
| **search_mcp_packages** | Search MCP packages | "搜索 GitHub MCP 包" |

#### 🎭 Playwright Tools

| Tool | Description | Example |
|------|-------------|---------|
| **diagnose_playwright** | Diagnose Playwright | "诊断 Playwright" |

> 📖 **Detailed MCP Guide**: See [MCP_SERVER_GUIDE.md](MCP_SERVER_GUIDE.md) for complete MCP server documentation and usage examples.
> 
> 📋 **Quick Reference**: See [QUICK_REFERENCE_CARD.md](QUICK_REFERENCE_CARD.md) for a quick reference card.

### Example Output

#### Package Status

```
════════════════════════════════════════════════════════════
  MCP Package Diagnosis
════════════════════════════════════════════════════════════

📊 Summary:
   Total Packages: 33
   Installed: 33
   Missing: 0

📦 Package Details:
   ✓ @playwright/mcp@1.0.0
   ✓ @modelcontextprotocol/server-github@1.0.0
   ✓ requests@2.31.0
```

#### Package Managers

```
════════════════════════════════════════════════════════════
  Available Package Managers
════════════════════════════════════════════════════════════

✓ npm        10.9.4
     Install: npm install -g <package>

✓ pip        pip 26.0.1
     Install: pip install <package>

✓ cargo      cargo 1.94.0
     Install: cargo install <package>

  8/12 package managers available
```

#### Language Check

```
╔══════════╤════════╤══════════╤═════════════════════════════════════════════╗
║ Language │ Status │ Version  │ Path                                        ║
╟──────────┼────────┼──────────┼─────────────────────────────────────────────╢
║ node     │ ✓      │ v22.22.1 │ C:\Program Files\nodejs\node.exe            ║
╟──────────┼────────┼──────────┼─────────────────────────────────────────────╢
║ python   │ ✓      │ 3.13.12  │ C:\Program Files\Python313\python.exe       ║
╟──────────┼────────┼──────────┼─────────────────────────────────────────────╢
║ java     │ ✓      │ 25.0.2   │ C:\Program Files\Java\jdk-25\bin\java.exe   ║
╟──────────┼────────┼──────────┼─────────────────────────────────────────────╢
║ go       │ ✓      │ 1.26.1   │ C:\Program Files\Go\bin\go.exe              ║
╟──────────┼────────┼──────────┼─────────────────────────────────────────────╢
║ cargo    │ ✓      │ 1.94.0   │ C:\Program Files\Rust\bin\cargo.exe         ║
╟──────────┼────────┼──────────┼─────────────────────────────────────────────╢
║ dotnet   │ ✗      │ N/A      │ Not found                                   ║
╚══════════╧════════╧══════════╧═════════════════════════════════════════════╝

  5/10 languages available
```

## 🔧 Diagnosed Issue Types

### Installation Issues
- Command not installed
- Executable not in PATH
- Corrupted installation

### Package Issues (NEW!)
- Package not installed
- Version outdated
- Dependency conflicts
- Peer dependency missing
- Installation errors (network, permission, version)

### Dependency Issues
- npm packages missing
- Python packages missing
- Java dependencies missing
- Playwright browsers not installed

### Connection Issues
- Cannot connect to remote server
- Proxy configuration errors
- Network timeout

### Configuration Issues
- JSON format errors
- Missing required fields
- Environment variables not set
- Playwright config missing

### Runtime Issues
- Language version too old
- Runtime not installed
- Version incompatibility

### Permission Issues
- No execute permission
- No write permission
- Requires admin rights

## 🤖 Auto-Fix Features

Using `--fix` or `fix-all` command attempts to fix:

1. **Install Missing Commands**: Using winget/brew/apt
2. **Set Environment Variables**: Auto-configure PATH
3. **Clean Cache**: npm cache, pip cache, gradle cache
4. **Update Packages**: Outdated npm/Python packages
5. **Install Playwright Browsers**: Auto-download and install
6. **Install Missing Packages**: **NEW** One-click package installation

## 📝 Configuration

Default config file locations:
- `.mcp.json` (current directory)
- `~/.mcp.json` (user home directory)
- `~/mcp.json` (user home directory)

Config format:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@org/package"],
      "type": "stdio",
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

## 🧪 Development

### Build

```bash
npm install
npm run build
```

### Development Mode

```bash
npm run dev
```

### Test

```bash
npm test
```

## 🐛 Troubleshooting

### Common Issues

**Q: All servers show errors?**
A: Node.js or npm may not be installed correctly. Install Node.js 18+ first.

**Q: Python server diagnosis fails?**
A: Ensure Python 3.8+ is installed and pip is in PATH.

**Q: Java server errors?**
A: Set JAVA_HOME environment variable to JDK installation directory.

**Q: Playwright browser installation fails?**
A: Linux users, use `--with-deps` to install system dependencies.

**Q: Package installation fails?**
A: Configure mirror registry:
```bash
# npm
npm config set registry https://registry.npmmirror.com

# pip
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

**Q: Permission errors?**
A: Run terminal as administrator or fix npm prefix:
```bash
npm config set prefix %APPDATA%\npm
```

### Logs

Use `--verbose` for detailed diagnostic logs:

```bash
mcp-diagnoser check --verbose
```

## 📚 Popular MCP Packages

Run `mcp-diagnoser popular` to see:

```
@modelcontextprotocol/server-github  - GitHub MCP Server
@modelcontextprotocol/server-puppeteer - Puppeteer MCP Server
@playwright/mcp - Playwright MCP Server
@upstash/context7-mcp - Documentation MCP
firecrawl-mcp - Web scraping MCP
search1api-mcp - Search API MCP
exa-mcp-server - AI Search MCP
yt-dlp-mcp - YouTube download MCP
code-review-mcp-server - Code review MCP
terminal-mcp-server - Terminal access MCP
```

## 🔄 Changelog

### v1.3.0 (Latest)
- ✅ **NEW** Package diagnosis for 12 package managers
- ✅ **NEW** Dependency conflict detection
- ✅ **NEW** Installation error analysis
- ✅ **NEW** One-click missing package installation
- ✅ **NEW** Package manager availability check
- ✅ Integrated package diagnosis into main check command
- ✅ Enhanced diagnostic reports with package status

### v1.2.0
- ✅ MCP package search (npm + GitHub)
- ✅ Playwright diagnosis and installation
- ✅ Popular package recommendations
- ✅ One-click package installation
- ✅ Improved report formatting

### v1.0.0
- Initial release
- Support for 10 programming languages
- CLI and MCP server modes
- Auto-fix functionality
- Detailed report generation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Lan**

- Email: **3314844@gmail.com**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- npm: [mcp-diagnoser](https://www.npmjs.com/package/mcp-diagnoser)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

### Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/mcp-diagnoser.git
cd mcp-diagnoser
npm install
npm run build
npm test
```

## 📞 Support

- **Documentation**: 
  - 🇬🇧 [README.md](README.md) - English documentation
  - 🇨🇳 [README_zh.md](README_zh.md) - 中文文档
- **Guides**:
  - [MCP_SERVER_GUIDE.md](MCP_SERVER_GUIDE.md) - Complete MCP server guide
  - [QUICK_REFERENCE_CARD.md](QUICK_REFERENCE_CARD.md) - Quick reference card
  - [INSTALLATION_LINUX_MACOS.md](INSTALLATION_LINUX_MACOS.md) - Linux/macOS installation
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/mcp-diagnoser/issues)

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- All MCP server contributors

## 📊 Package Managers Supported

| # | Package Manager | Command | Install Command | Status |
|---|----------------|---------|----------------|--------|
| 1 | npm | npm | npm install -g | ✅ |
| 2 | yarn | yarn | yarn global add | ✅ |
| 3 | pnpm | pnpm | pnpm add -g | ✅ |
| 4 | pip | pip | pip install | ✅ |
| 5 | pip3 | pip3 | pip3 install | ✅ |
| 6 | uv | uv | uv pip install | ✅ |
| 7 | uvx | uvx | uv tool install | ✅ |
| 8 | cargo | cargo | cargo install | ✅ |
| 9 | go | go | go install | ✅ |
| 10 | dotnet | dotnet | dotnet tool install -g | ✅ |
| 11 | gem | gem | gem install | ✅ |
| 12 | composer | composer | composer global require | ✅ |

---

**Made with ❤️ for the MCP community**
