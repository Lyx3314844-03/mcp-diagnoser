# MCP Diagnoser 依赖包说明文档

## 📦 依赖包总览

MCP Diagnoser 使用现代化的 Node.js 技术栈，依赖包分为**运行时依赖**和**开发依赖**两类。

---

## 🔧 运行时依赖 (Runtime Dependencies)

这些是程序运行所必需的依赖包。

### 1. **@modelcontextprotocol/sdk** `^1.27.1`
- **用途**: MCP (Model Context Protocol) 官方 SDK
- **功能**: 
  - 提供 MCP 服务器的标准接口
  - 支持 MCP 客户端和服务端通信
  - 实现 MCP 协议规范
- **必需性**: ⭐⭐⭐⭐⭐ 核心依赖
- **官网**: https://modelcontextprotocol.io/

### 2. **chalk** `^4.1.2`
- **用途**: 终端字符串样式库
- **功能**:
  - 彩色终端输出
  - 支持 ANSI 颜色代码
  - 链式 API 调用
- **示例**: `chalk.red('错误'), chalk.green('成功')`
- **必需性**: ⭐⭐⭐⭐ 提升用户体验

### 3. **commander** `^11.1.0`
- **用途**: 命令行接口 (CLI) 框架
- **功能**:
  - 解析命令行参数
  - 自动生成帮助信息
  - 支持子命令和选项
- **必需性**: ⭐⭐⭐⭐⭐ CLI 核心

### 4. **execa** `^8.0.1`
- **用途**: 增强版 child_process
- **功能**:
  - 执行系统命令
  - 更好的错误处理
  - 支持 Promise 和 async/await
  - 跨平台兼容
- **示例**: `await execa('npm', ['install', '-g', 'package'])`
- **必需性**: ⭐⭐⭐⭐⭐ 系统交互核心

### 5. **fs-extra** `^11.2.0`
- **用途**: 文件系统操作增强库
- **功能**:
  - 扩展 Node.js fs 模块
  - 支持 async/await
  - 额外的文件操作方法 (copy, move, ensureDir 等)
- **必需性**: ⭐⭐⭐⭐ 文件操作核心

### 6. **hpagent** `^1.2.0`
- **用途**: HTTP/HTTPS 代理代理
- **功能**:
  - 支持通过代理发送 HTTP 请求
  - 兼容 http.Agent 接口
  - 支持认证代理
- **必需性**: ⭐⭐⭐ 网络功能

### 7. **ora** `^5.4.1`
- **用途**: 终端加载动画库
- **功能**:
  - 显示旋转加载动画
  - 支持成功/失败/警告状态
  - 提升命令行交互体验
- **示例**: 安装过程中的"正在安装..."动画
- **必需性**: ⭐⭐⭐ 用户体验

### 8. **semver** `^7.5.4`
- **用途**: 语义版本解析和比较
- **功能**:
  - 解析版本号 (如 1.2.3)
  - 版本范围比较
  - 检查版本兼容性
- **必需性**: ⭐⭐⭐⭐ 版本管理核心

### 9. **table** `^6.8.1`
- **用途**: 终端表格生成库
- **功能**:
  - 生成格式化的表格输出
  - 支持边框、对齐、颜色
  - 自动调整列宽
- **必需性**: ⭐⭐⭐ 数据展示

### 10. **tslib** `^2.8.1`
- **用途**: TypeScript 运行时库
- **功能**:
  - 提供 TypeScript 辅助函数
  - 减少编译后代码体积
  - 支持 TypeScript 新特性
- **必需性**: ⭐⭐⭐ TypeScript 项目必需

### 11. **yaml** `^2.3.4`
- **用途**: YAML 解析和生成库
- **功能**:
  - 解析 YAML 配置文件
  - 生成 YAML 输出
  - 支持 YAML 1.2 规范
- **必需性**: ⭐⭐⭐⭐ 配置文件处理

### 12. **@xmldom/xmldom** `^0.8.11`
- **用途**: XML DOM 解析器
- **功能**:
  - 解析 XML 文档
  - 提供 DOM API 接口
  - 跨平台兼容
- **必需性**: ⭐⭐ XML 处理

---

## 🛠️ 开发依赖 (Dev Dependencies)

这些是开发和构建过程中使用的依赖包。

### 1. **typescript** `^5.3.3`
- **用途**: TypeScript 编译器
- **功能**:
  - 将 TypeScript 编译为 JavaScript
  - 类型检查和类型推断
  - 支持最新 ECMAScript 特性
- **必需性**: ⭐⭐⭐⭐⭐ 开发必需

### 2. **ts-node** `^10.9.2`
- **用途**: TypeScript 执行引擎
- **功能**:
  - 直接运行 TypeScript 代码
  - 无需预先编译
  - 支持 REPL
- **必需性**: ⭐⭐⭐⭐ 开发调试

### 3. **@types/node** `^20.10.5`
- **用途**: Node.js 类型定义
- **功能**:
  - 提供 Node.js API 的 TypeScript 类型
  - 支持智能提示和类型检查
- **必需性**: ⭐⭐⭐⭐ TypeScript 开发必需

### 4. **@types/jest** `^29.5.14`
- **用途**: Jest 测试框架类型定义
- **必需性**: ⭐⭐⭐ 测试开发

### 5. **@types/semver** `^7.5.6`
- **用途**: semver 库类型定义
- **必需性**: ⭐⭐⭐ 类型安全

### 6. **@types/fs-extra** `^11.0.4`
- **用途**: fs-extra 库类型定义
- **必需性**: ⭐⭐⭐ 类型安全

### 7. **jest** `^29.7.0`
- **用途**: JavaScript 测试框架
- **功能**:
  - 单元测试
  - 集成测试
  - 代码覆盖率
  - 快照测试
- **必需性**: ⭐⭐⭐⭐ 测试必需

### 8. **ts-jest** `^29.4.6`
- **用途**: Jest 的 TypeScript 预处理器
- **功能**:
  - 在 Jest 测试中使用 TypeScript
  - 无需预先编译测试代码
- **必需性**: ⭐⭐⭐⭐ TypeScript 测试必需

### 9. **playwright** `^1.58.2`
- **用途**: 浏览器自动化库
- **功能**:
  - 控制 Chromium/Firefox/WebKit
  - 网页爬虫和测试
  - 截图和 PDF 生成
  - 网络请求拦截
- **必需性**: ⭐⭐⭐⭐ 高级功能

---

## 📋 系统依赖 (System Dependencies)

### Node.js
- **最低版本**: 18.0.0
- **推荐版本**: 20.x LTS
- **安装方式**:
  - **Windows**: `winget install OpenJS.NodeJS.LTS` 或访问 https://nodejs.org/
  - **macOS**: `brew install node@20`
  - **Linux**: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs`

### Git (可选，用于源码安装)
- **用途**: 版本控制和源码安装
- **安装方式**:
  - **Windows**: https://git-scm.com/download/win
  - **macOS**: `xcode-select --install`
  - **Linux**: `sudo apt-get install git`

### Playwright 浏览器 (可选)
- **用途**: 网页爬虫和自动化
- **安装命令**: `npx playwright install`
- **系统依赖 (Linux)**:
  ```bash
  npx playwright install --with-deps
  ```

---

## 🔍 依赖包管理

### 查看所有依赖
```bash
npm list --depth=0
```

### 检查过时依赖
```bash
npm outdated
```

### 更新依赖
```bash
# 更新所有依赖
npm update

# 更新特定依赖
npm update chalk
```

### 安装依赖
```bash
# 安装所有依赖
npm install

# 生产环境安装 (跳过 devDependencies)
npm install --production
```

### 清理缓存
```bash
npm cache clean --force
```

---

## 🚨 常见问题

### 1. 安装失败 - 网络问题
**症状**: `npm install` 卡住或超时

**解决方案**:
```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 或使用代理
npm config set proxy http://proxy.example.com:8080
```

### 2. 权限错误 (Linux/macOS)
**症状**: `EACCES: permission denied`

**解决方案**:
```bash
# 修复 npm 全局目录权限
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 3. 版本冲突
**症状**: `ERESOLVE unable to resolve dependency tree`

**解决方案**:
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 4. Playwright 浏览器下载失败
**症状**: 浏览器安装超时

**解决方案**:
```bash
# 使用国内镜像
export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright
npx playwright install
```

---

## 📊 依赖包大小统计

| 类别 | 数量 | 总大小 (约) |
|------|------|------------|
| 运行时依赖 | 12 | 5 MB |
| 开发依赖 | 9 | 150 MB |
| **总计** | **21** | **155 MB** |

---

## 🔗 相关链接

- [npm 官方文档](https://docs.npmjs.com/)
- [Node.js 官方文档](https://nodejs.org/docs)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Playwright 官方文档](https://playwright.dev/)

---

**最后更新**: 2026 年 3 月 28 日  
**版本**: 3.0.0  
**维护者**: Lan <3314844@gmail.com>
