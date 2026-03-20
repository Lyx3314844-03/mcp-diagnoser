# GitHub 发布指南

**作者**: Lan <3314844@gmail.com>  
**版本**: 1.3.0  
**发布日期**: 2026-03-20

---

## 📋 发布前检查清单

### ✅ 必须完成的项目

#### 1. 代码准备
- [x] TypeScript 编译成功
- [x] 所有测试通过（59/59）
- [x] 无安全漏洞（npm audit: 0 vulnerabilities）
- [x] 代码质量优秀（98/100, A+）

#### 2. 文档准备
- [x] README.md - 英文主文档
- [x] README_zh.md - 中文文档
- [x] LICENSE - MIT 许可证
- [x] CHANGELOG.md - 更新日志
- [x] CONTRIBUTING.md - 贡献指南
- [x] SECURITY.md - 安全政策
- [x] CODE_QUALITY_REPORT.md - 代码质量报告
- [x] FULL_TEST_REPORT.md - 测试报告
- [x] SECURITY_AUDIT_REPORT.md - 安全审计报告

#### 3. 配置准备
- [ ] 更新 package.json 中的作者信息
- [ ] 更新 package.json 中的仓库 URL
- [ ] 更新所有文档中的 YOUR_USERNAME 占位符
- [ ] 创建 .github 目录结构
- [ ] 配置 GitHub Actions

#### 4. Git 准备
- [ ] 初始化 Git 仓库
- [ ] 创建 .gitignore
- [ ] 清理不必要的文件
- [ ] 创建初始提交

---

## 🚀 发布步骤

### 步骤 1: 更新配置信息

#### 1.1 更新 package.json

打开 `package.json`，替换以下占位符：

```json
{
  "author": "Lan <3314844@gmail.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/mcp-diagnoser.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/mcp-diagnoser/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/mcp-diagnoser#readme"
}
```

**替换为实际信息**:
```json
{
  "author": "Lan <3314844@gmail.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/你的 GitHub 用户名/mcp-diagnoser.git"
  },
  "bugs": {
    "url": "https://github.com/你的 GitHub 用户名/mcp-diagnoser/issues"
  },
  "homepage": "https://github.com/你的 GitHub 用户名/mcp-diagnoser#readme"
}
```

#### 1.2 更新文档中的链接

搜索并替换所有文档中的 `YOUR_USERNAME`：

**文件列表**:
- README.md
- CONTRIBUTING.md
- SECURITY.md
- INSTALLATION_LINUX_MACOS.md
- 其他文档...

**命令** (PowerShell):
```powershell
(Get-Content README.md) -replace 'YOUR_USERNAME', '你的 GitHub 用户名' | Set-Content README.md
```

---

### 步骤 2: 清理项目

#### 2.1 运行清理脚本

**Windows**:
```cmd
cleanup-for-github.bat
```

**Linux/macOS**:
```bash
# 手动删除
rm -rf ENHANCEMENT_SUMMARY*.md
rm -rf PACKAGE_DIAGNOSIS_FEATURES.md
rm -rf QUICK_REFERENCE.md
rm -rf PROJECT_STRUCTURE.md
rm -rf QUICKSTART.md
rm -rf QWEN_CLI_SETUP.md
rm -rf BROWSER_SEARCH_FEATURES.md
rm -rf test.bat install.bat verify-qwen-config.bat
rm -rf logs/
```

#### 2.2 验证清理

确保以下文件**保留**:
- ✅ README.md
- ✅ README_zh.md
- ✅ LICENSE
- ✅ CHANGELOG.md
- ✅ CONTRIBUTING.md
- ✅ SECURITY.md
- ✅ 所有功能文档
- ✅ 所有报告文档

---

### 步骤 3: 初始化 Git

#### 3.1 初始化仓库

```bash
cd C:\Users\Administrator\mcp-diagnoser
git init
```

#### 3.2 添加所有文件

```bash
git add .
```

#### 3.3 创建初始提交

```bash
git commit -m "chore: initial release v1.3.0

Features:
- 14 MCP tools for diagnosis and troubleshooting
- Support for 12 package managers
- Support for 10 programming languages
- Web search and crawling capabilities
- Playwright diagnosis and installation
- Automatic fix for common issues

Documentation:
- Complete README with examples
- Security audit report
- Code quality report
- Full test report (100% pass)
- Installation guides for all platforms

Security:
- No known vulnerabilities
- All dependencies audited
- No hardcoded credentials
- Complete .gitignore"
```

#### 3.4 创建版本标签

```bash
git tag -a v1.3.0 -m "Release version 1.3.0

Major Features:
- Package diagnosis for 12 package managers
- Web tools with MCP support
- Complete documentation (19 documents)
- Security audit passed (A+ rating)
- Code quality excellent (98/100)"
```

---

### 步骤 4: 创建 GitHub 仓库

#### 4.1 访问 GitHub

打开 https://github.com/new

#### 4.2 填写仓库信息

- **Repository name**: `mcp-diagnoser`
- **Description**: `Comprehensive MCP diagnostic tool with 14 tools for troubleshooting, package management, and web search`
- **Visibility**: Public（推荐）或 Private
- **Initialize**: ❌ 不要勾选（我们已有代码）

#### 4.3 创建仓库

点击 "Create repository"

---

### 步骤 5: 推送代码到 GitHub

#### 5.1 添加远程仓库

```bash
git remote add origin https://github.com/你的 GitHub 用户名/mcp-diagnoser.git
```

#### 5.2 推送代码

```bash
git push -u origin main
git push origin v1.3.0
```

**如果有多个分支**:
```bash
git push -u origin --all
git push origin --tags
```

---

### 步骤 6: 创建 GitHub Release

#### 6.1 访问 Releases 页面

打开 https://github.com/你的 GitHub 用户名/mcp-diagnoser/releases

#### 6.2 创建新 Release

1. 点击 "Create a new release"
2. 选择标签：`v1.3.0`
3. 填写 Release 标题：`v1.3.0 - Initial Release`
4. 填写发布说明（见下方模板）
5. 点击 "Publish release"

#### 6.3 Release 模板

```markdown
## 🎉 MCP Diagnoser v1.3.0

Initial release of MCP Diagnoser - Comprehensive diagnostic tool for MCP servers.

### ✨ Features

#### 🔍 Diagnosis Tools (5 Tools)
- Diagnose all MCP servers
- Diagnose specific server
- Auto-fix server issues
- Check language runtimes (10 languages)
- Check all languages at once

#### 📦 Package Management (3 Tools)
- Diagnose all packages (12 package managers)
- Check package managers
- Diagnose specific package

#### 🔎 Search Tools (1 Tool)
- Search MCP packages on npm & GitHub

#### 🎭 Playwright Tools (1 Tool)
- Diagnose Playwright and browsers

#### 🌐 Web Tools (4 Tools) - NEW!
- Multi-engine web search
- Crawl websites
- Search within website
- Extract emails, phones, links

### 📊 Statistics

- **MCP Tools**: 14
- **CLI Commands**: 18
- **Package Managers**: 12
- **Languages**: 10
- **Search Engines**: 14

### 🔒 Security

- ✅ No known vulnerabilities
- ✅ All dependencies audited
- ✅ Code quality: A+ (98/100)
- ✅ Test coverage: 100%

### 📚 Documentation

- [README.md](https://github.com/你的 GitHub 用户名/mcp-diagnoser#readme) - Main documentation
- [WHAT_MCP_CAN_DO.md](https://github.com/你的 GitHub 用户名/mcp-diagnoser/blob/main/WHAT_MCP_CAN_DO.md) - Feature showcase
- [EXAMPLES.md](https://github.com/你的 GitHub 用户名/mcp-diagnoser/blob/main/EXAMPLES.md) - Usage examples
- [SECURITY.md](https://github.com/你的 GitHub 用户名/mcp-diagnoser/blob/main/SECURITY.md) - Security policy

### 🚀 Installation

```bash
# Global installation
npm install -g mcp-diagnoser

# Or from source
git clone https://github.com/你的 GitHub 用户名/mcp-diagnoser.git
cd mcp-diagnoser
npm install
npm run build
npm link
```

### 📝 Changelog

See [CHANGELOG.md](https://github.com/你的 GitHub 用户名/mcp-diagnoser/blob/main/CHANGELOG.md) for full changelog.

### 👨‍💻 Author

**Lan**
- Email: 3314844@gmail.com
- GitHub: @你的 GitHub 用户名

### 📄 License

MIT License - see [LICENSE](https://github.com/你的 GitHub 用户名/mcp-diagnoser/blob/main/LICENSE) for details.
```

---

### 步骤 7: 发布到 npm（可选）

#### 7.1 登录 npm

```bash
npm login
```

#### 7.2 测试打包

```bash
npm pack
tar -tvf mcp-diagnoser-1.3.0.tgz
```

**检查内容**:
- ✅ dist/ 目录
- ✅ scripts/ 目录
- ✅ README.md
- ✅ LICENSE
- ✅ package.json

#### 7.3 发布

```bash
npm publish --access public
```

#### 7.4 验证发布

打开 https://www.npmjs.com/package/mcp-diagnoser

检查:
- ✅ 版本号：1.3.0
- ✅ 描述正确
- ✅ 关键词正确
- ✅ 作者信息正确

---

### 步骤 8: 配置 GitHub Actions

#### 8.1 验证工作流

检查 `.github/workflows/ci.yml` 是否存在

#### 8.2 触发工作流

推送代码后，GitHub Actions 会自动运行

访问 https://github.com/你的 GitHub 用户名/mcp-diagnoser/actions

检查:
- ✅ Build 工作流运行成功
- ✅ 所有测试通过
- ✅ 编译成功

---

### 步骤 9: 完善仓库页面

#### 9.1 添加 Topics

在仓库页面右侧，添加 topics:
- `mcp`
- `diagnostic`
- `troubleshooting`
- `typescript`
- `nodejs`
- `cli`
- `developer-tools`
- `mcp-server`

#### 9.2 添加网站链接

在仓库描述中添加:
- 🌐 npm: https://www.npmjs.com/package/mcp-diagnoser
- 📚 Docs: [Documentation](WHAT_MCP_CAN_DO.md)

#### 9.3 固定仓库

如果是重要项目，可以 Pin 到个人主页

---

### 步骤 10: 宣传和分享

#### 10.1 社交媒体

分享你的发布:
- Twitter/X
- LinkedIn
- 技术社区（知乎、掘金等）

#### 10.2 技术社区

- Reddit: r/node, r/typescript
- Dev.to
- Hashnode
- 中文社区：知乎、SegmentFault

#### 10.3 MCP 社区

- MCP Discord 服务器
- MCP GitHub Discussions

---

## 📊 发布后验证

### GitHub 验证

- [ ] 仓库页面正常显示
- [ ] README 渲染正确
- [ ] 所有文档链接有效
- [ ] Release 创建成功
- [ ] GitHub Actions 运行成功

### npm 验证

- [ ] 包页面正常显示
- [ ] 版本正确
- [ ] 安装测试通过

```bash
npm install -g mcp-diagnoser
mcp-diagnoser --version
```

### 功能验证

- [ ] 所有 CLI 命令正常
- [ ] MCP 服务器正常
- [ ] 文档示例可运行

---

## 🐛 问题排查

### 问题 1: 推送失败

**错误**: `remote: Repository not found`

**解决**:
```bash
# 检查远程仓库 URL
git remote -v

# 如果错误，删除并重新添加
git remote remove origin
git remote add origin https://github.com/你的 GitHub 用户名/mcp-diagnoser.git
```

### 问题 2: npm 发布失败

**错误**: `npm ERR! 403 Forbidden`

**解决**:
```bash
# 确认登录
npm whoami

# 如果未登录
npm login

# 检查包名是否已存在
npm view mcp-diagnoser
```

### 问题 3: GitHub Actions 失败

**检查**:
1. 查看 Actions 日志
2. 检查 .github/workflows/ci.yml
3. 验证 Node.js 版本

---

## 📝 发布清单

### 发布前

- [x] 代码编译成功
- [x] 所有测试通过
- [x] 安全审计通过
- [x] 文档完整
- [ ] 更新占位符
- [ ] 清理临时文件
- [ ] Git 初始化

### 发布中

- [ ] 创建 GitHub 仓库
- [ ] 推送代码
- [ ] 创建 Release
- [ ] 发布到 npm
- [ ] 配置 Actions

### 发布后

- [ ] 验证 GitHub 页面
- [ ] 验证 npm 页面
- [ ] 测试安装
- [ ] 测试功能
- [ ] 分享宣传

---

## 🎉 完成！

发布成功后，你的 MCP Diagnoser 将可以:

- ✅ 在 GitHub 上被发现和 star
- ✅ 通过 npm 全球安装
- ✅ 被 AI 助手和 MCP 客户端使用
- ✅ 获得社区反馈和贡献

**祝发布成功！** 🚀

---

**最后更新**: 2026-03-20  
**版本**: 1.3.0
