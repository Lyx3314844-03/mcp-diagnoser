# Changelog

All notable changes to MCP Diagnoser will be documented in this file.

**Author**: Lan  
**Email**: 3314844@gmail.com  
**Project**: MCP Diagnoser  
**License**: MIT

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Add support for more package managers (NuGet, Composer)
- Add interactive TUI mode
- Add configuration file validation
- Add performance profiling for slow diagnostics
- Add plugin system for custom diagnostics

## [1.3.0] - 2026-03-20

### Added
- **Package Diagnosis Module** - Complete package installation diagnostic system
- **Support for 12 Package Managers**: npm, yarn, pnpm, pip, pip3, uv, uvx, cargo, go, dotnet, gem, composer
- **Package Status Detection** - Check if packages are installed, version info, location
- **Dependency Conflict Detection** - Find version conflicts and peer dependency issues
- **Installation Error Analysis** - Automatic diagnosis of installation failures:
  - Network errors (timeout, connection failed)
  - Permission errors (EACCES, EPERM)
  - Version conflicts
  - Missing runtime
  - Disk space issues
- **One-Click Installation** - Install all missing packages automatically
- **Package Manager Check** - List all available package managers with versions
- **New CLI Commands**:
  - `packages` - Diagnose all packages used by MCP servers
  - `package <name>` - Diagnose specific package
  - `package-managers` - List available package managers
  - `install-missing` - Install all missing packages
- **Enhanced Diagnostic Reports** - Now include package status section
- **Auto-fix Suggestions** - Context-aware repair recommendations

### Changed
- Updated version to 1.3.0
- Enhanced `check` command to include package diagnosis
- Improved diagnostic performance with smart caching
- Updated package.json with repository and author information

### Fixed
- Fixed package detection for npx/uvx on-demand packages
- Optimized package checking to skip on-demand packages

### Documentation
- Added PACKAGE_DIAGNOSIS_FEATURES.md - Detailed package diagnosis documentation
- Added ENHANCEMENT_SUMMARY_V2.md - Enhancement summary
- Added QUICK_REFERENCE.md - Quick reference guide
- Updated README.md with package diagnosis features

## [1.2.0] - 2026-03-19

### Added
- **MCP Package Search** - Search npm and GitHub for MCP packages
- **Popular Packages** - Show popular and official MCP packages
- **One-Click Installation** - Install packages directly from search results
- **Playwright Diagnosis**:
  - Playwright installation detection
  - Browser status (Chromium, Firefox, WebKit)
  - Configuration file check
  - System dependency check (Linux)
- **Web Search Tools**:
  - Multi-engine search (Google, Bing, Baidu, DuckDuckGo)
  - Web crawling capabilities
  - Content search within crawled pages
  - Information extraction (emails, phones, links)
- **New CLI Commands**:
  - `search` - Search for MCP packages
  - `popular` - Show popular MCP packages
  - `install` - Install MCP packages
  - `playwright` - Diagnose Playwright
  - `playwright-install` - Install Playwright browsers
  - `web-search` - Search the web
  - `crawl` - Crawl websites
  - `search-content` - Search within website content
  - `extract-info` - Extract information from websites

### Changed
- Enhanced diagnostic report formatting
- Improved error messages and suggestions
- Updated search result display

### Fixed
- Fixed TypeScript compilation errors
- Improved error handling for network requests

## [1.1.0] - 2026-03-18

### Added
- MCP package search functionality
- Playwright browser diagnosis
- Popular package recommendations
- One-click package installation

### Changed
- Improved report output formatting
- Enhanced error detection

## [1.0.0] - 2026-03-17

### Added
- Initial release
- Support for 10 programming languages:
  - JavaScript/TypeScript (Node.js)
  - Python
  - Java
  - Go
  - Rust
  - C#/.NET
  - Ruby
  - PHP
  - Swift
  - Kotlin
- CLI and MCP server modes
- Automatic fix functionality
- Detailed diagnostic reports
- Language runtime checking
- Installation verification
- Dependency checking
- Connection testing
- Configuration validation
- Permission checking

### MCP Tools
- `diagnose_all` - Diagnose all MCP servers
- `diagnose_server` - Diagnose specific server
- `fix_server` - Auto-fix server issues
- `check_language` - Check language runtime
- `check_all_languages` - Check all supported languages
- `search_mcp_packages` - Search MCP packages
- `diagnose_playwright` - Diagnose Playwright

---

## Version History

- **v1.3.0** - Package diagnosis enhancement (Latest)
- **v1.2.0** - Search and Playwright features
- **v1.1.0** - Package search addition
- **v1.0.0** - Initial release

---

## Migration Guide

### From v1.2.x to v1.3.0

No breaking changes. New features are additive:

1. **New Commands Available**:
   ```bash
   mcp-diagnoser packages
   mcp-diagnoser package <name>
   mcp-diagnoser package-managers
   mcp-diagnoser install-missing
   ```

2. **Enhanced Check Command**:
   The `check` command now includes package diagnosis automatically.

3. **API Changes** (for developers):
   - New `PackageDiagnoser` class in `src/tools/package-diagnoser.ts`
   - New `diagnoseAllPackages()` method in `MCPDiagnoser`
   - Updated `DiagnosticReport` interface with `packages` field

### From v1.1.x to v1.2.0

No breaking changes. All new features are additive.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.
