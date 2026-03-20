# GitHub 发布前检查清单

## 📋 必须完成的项目

### 1. 更新配置文件
- [x] 更新 `package.json` 中的版本号
- [ ] 更新 `package.json` 中的作者信息（替换 YOUR_USERNAME 和邮箱）
- [ ] 更新 `package.json` 中的仓库 URL（替换 YOUR_USERNAME）
- [ ] 更新 `README.md` 中的仓库 URL（替换 YOUR_USERNAME）
- [ ] 更新 `CONTRIBUTING.md` 中的仓库 URL（替换 YOUR_USERNAME）
- [ ] 更新 `package.json` 中的 bugs 和 homepage URL

### 2. 文档检查
- [x] README.md - 英文主文档
- [x] README_zh.md - 中文文档（可选保留）
- [x] LICENSE - 许可证文件
- [x] CHANGELOG.md - 更新日志
- [x] CONTRIBUTING.md - 贡献指南
- [ ] 删除或整理临时文档（ENHANCEMENT_SUMMARY*.md 等）

### 3. 代码检查
- [ ] 运行 `npm run build` 确保编译成功
- [ ] 运行 `npm test` 确保测试通过
- [ ] 检查是否有硬编码的本地路径
- [ ] 移除所有调试代码和 console.log
- [ ] 检查 TypeScript 类型定义

### 4. .gitignore 检查
- [x] 确保不包含 node_modules/
- [x] 确保不包含 dist/
- [x] 确保不包含 .env 文件
- [x] 确保不包含 .mcp.json（可能包含敏感信息）
- [ ] 确保不包含 logs/ 目录

### 5. 敏感信息检查
- [ ] 检查代码中是否有 API 密钥
- [ ] 检查是否有硬编码的密码
- [ ] 检查是否有个人访问令牌
- [ ] 检查是否有私有仓库 URL
- [ ] 检查 .mcp.json 是否已添加到 .gitignore

### 6. GitHub 设置
- [ ] 创建 GitHub 仓库
- [ ] 添加仓库描述
- [ ] 添加主题标签（mcp, diagnostic, typescript 等）
- [ ] 设置默认分支为 main
- [ ] 配置 GitHub Pages（可选）
- [ ] 添加 Issue 模板
- [ ] 添加 Pull Request 模板

### 7. npm 发布准备（如果要发布到 npm）
- [ ] 确保 npm 用户名可用
- [ ] 运行 `npm login`
- [ ] 测试 `npm pack` 确保包正确
- [ ] 配置 npm token 用于 CI/CD

## 🧹 需要清理的文件

以下文件建议删除或移到 docs/ 目录：

### 可以删除的文件
- [ ] ENHANCEMENT_SUMMARY.md - 临时增强总结
- [ ] ENHANCEMENT_SUMMARY_V2.md - 临时增强总结 v2
- [ ] PACKAGE_DIAGNOSIS_FEATURES.md - 可移到 docs/
- [ ] QUICK_REFERENCE.md - 可移到 docs/
- [ ] PROJECT_STRUCTURE.md - 内部文档
- [ ] QUICKSTART.md - 内容已整合到 README
- [ ] QWEN_CLI_SETUP.md - 内部设置文档
- [ ] test.bat - 本地测试脚本
- [ ] install.bat - 本地安装脚本
- [ ] verify-qwen-config.bat - 本地验证脚本

### 保留的文件
- [x] README.md - 主文档
- [x] README_zh.md - 中文文档
- [x] LICENSE - 许可证
- [x] CHANGELOG.md - 更新日志
- [x] CONTRIBUTING.md - 贡献指南
- [x] .gitignore - Git 忽略配置
- [x] package.json - 项目配置
- [x] tsconfig.json - TypeScript 配置

## 🚀 发布步骤

### 1. 本地准备
```bash
# 清理不必要的文件
# （手动删除或使用下面的清理脚本）

# 安装依赖
npm install

# 构建项目
npm run build

# 测试
npm test

# 本地打包测试
npm pack

# 检查打包内容
tar -tvf mcp-diagnoser-*.tgz
```

### 2. Git 提交
```bash
# 初始化 git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "chore: prepare for GitHub release v1.3.0"

# 添加标签
git tag v1.3.0
```

### 3. 推送到 GitHub
```bash
# 添加远程仓库（替换为你的仓库 URL）
git remote add origin https://github.com/YOUR_USERNAME/mcp-diagnoser.git

# 推送
git push origin main --tags
```

### 4. 发布到 npm（可选）
```bash
# 发布
npm publish --access public
```

### 5. 创建 GitHub Release
1. 访问 https://github.com/YOUR_USERNAME/mcp-diagnoser/releases
2. 点击 "Create a new release"
3. 选择标签 v1.3.0
4. 填写发布说明（可从 CHANGELOG.md 复制）
5. 点击 "Publish release"

## 📝 发布后检查

- [ ] 检查 npm 包是否正确发布
- [ ] 检查 GitHub Actions 是否运行成功
- [ ] 测试 `npm install -g mcp-diagnoser`
- [ ] 验证所有 CLI 命令正常工作
- [ ] 检查 README 中的链接是否正确

## 🔗 有用的链接

- [npm 发布指南](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [语义化版本规范](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

**最后更新**: 2026-03-20
**版本**: 1.3.0
