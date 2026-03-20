# MCP Diagnoser - 项目结构

## 📁 目录结构

```
mcp-diagnoser/
├── src/                          # 源代码目录
│   ├── index.ts                  # CLI 主入口 (增强版)
│   ├── core/                     # 核心模块
│   │   └── diagnoser.ts          # MCP 诊断器
│   ├── languages/                # 语言检查器
│   │   ├── index.ts              # 导出所有检查器
│   │   ├── base-checker.ts       # 抽象基类
│   │   ├── javascript.ts         # JavaScript/TypeScript 检查器
│   │   ├── python.ts             # Python 检查器
│   │   ├── java.ts               # Java 检查器
│   │   ├── go.ts                 # Go 检查器
│   │   ├── rust.ts               # Rust 检查器
│   │   ├── csharp.ts             # C#/.NET 检查器
│   │   ├── ruby.ts               # Ruby 检查器
│   │   ├── php.ts                # PHP 检查器
│   │   ├── swift.ts              # Swift 检查器
│   │   └── kotlin.ts             # Kotlin 检查器
│   └── tools/                    # 工具模块
│       └── mcp-searcher.ts       # MCP 包搜索和 Playwright 诊断
│
├── server/                       # MCP 服务器
│   ├── package.json              # 服务器依赖
│   ├── tsconfig.json             # TypeScript 配置
│   └── server.ts                 # MCP 服务器实现
│
├── package.json                  # 项目依赖
├── tsconfig.json                 # TypeScript 配置
├── install.bat                   # Windows 安装脚本
├── test.bat                      # Windows 测试脚本
├── README_zh.md                  # 中文文档
├── QUICKSTART.md                 # 快速开始指南
├── ENHANCEMENT_SUMMARY.md        # 增强功能总结
└── PROJECT_STRUCTURE.md          # 本文件
```

## 📦 模块说明

### 核心模块 (src/core/)

**diagnoser.ts** - MCPDiagnoser 类
- 加载 MCP 配置文件
- 诊断所有服务器
- 诊断特定服务器
- 检查语言运行时
- 生成诊断报告
- 应用自动修复

### 语言检查器 (src/languages/)

**base-checker.ts** - LanguageChecker 抽象类
- 定义检查器接口
- 提供通用检查逻辑
- 版本提取方法
- 命令路径查找

**各语言检查器**:
- `javascript.ts` - Node.js, npm, npx 检查
- `python.ts` - Python, pip, uv 检查
- `java.ts` - Java, Maven, Gradle 检查
- `go.ts` - Go, go mod 检查
- `rust.ts` - Rust, Cargo 检查
- `csharp.ts` - .NET, dotnet CLI 检查
- `ruby.ts` - Ruby, gem, bundler 检查
- `php.ts` - PHP, composer 检查
- `swift.ts` - Swift, SPM 检查
- `kotlin.ts` - Kotlin, Gradle/Maven 检查

### 工具模块 (src/tools/)

**mcp-searcher.ts** - MCPSearcher 和 PlaywrightDiagnoser 类

MCPSearcher:
- `searchNPM()` - 搜索 npm 包
- `searchGitHub()` - 搜索 GitHub 项目
- `getPopularPackages()` - 获取热门包
- `installPackage()` - 安装包

PlaywrightDiagnoser:
- `diagnose()` - 诊断 Playwright
- `checkBrowser()` - 检查浏览器
- `checkConfig()` - 检查配置文件
- `checkSystemDependencies()` - 检查系统依赖
- `install()` - 安装浏览器
- `printDiagnosis()` - 打印诊断报告

### MCP 服务器 (server/)

**server.ts** - MCP 服务器实现
- 实现 8 个 MCP 工具
- 处理工具调用
- 提供标准输出传输

## 🔧 工具依赖

### 运行时依赖

```json
{
  "chalk": "^4.1.2",        // 彩色终端输出
  "commander": "^11.1.0",   // CLI 框架
  "execa": "^8.0.1",        // 命令执行
  "fs-extra": "^11.2.0",    // 文件系统操作
  "ora": "^5.4.1",          // 加载动画
  "semver": "^7.5.4",       // 版本比较
  "table": "^6.8.1",        // 表格输出
  "yaml": "^2.3.4"          // YAML 解析
}
```

### 开发依赖

```json
{
  "@types/fs-extra": "^11.0.4",
  "@types/jest": "^29.5.11",
  "@types/node": "^20.10.5",
  "@types/semver": "^7.5.6",
  "jest": "^29.7.0",
  "ts-jest": "^29.1.1",
  "ts-node": "^10.9.2",
  "typescript": "^5.3.3"
}
```

## 🎯 设计模式

### 策略模式 (Strategy Pattern)

每种语言检查器都是 Strategy 的具体实现：

```
LanguageChecker (抽象策略)
├── JavaScriptChecker (具体策略)
├── PythonChecker
├── JavaChecker
├── GoChecker
├── RustChecker
├── CSharpChecker
├── RubyChecker
├── PHPChecker
├── SwiftChecker
└── KotlinChecker
```

### 工厂模式 (Factory Pattern)

`initializeLanguageCheckers()` 创建检查器实例

### 单例模式 (Singleton Pattern)

MCP 服务器实例在进程中保持单例

## 📊 数据流

### 诊断流程

```
用户命令 → CLI 解析 → MCPDiagnoser
                      ↓
                加载配置文件
                      ↓
                遍历服务器列表
                      ↓
                逐个诊断服务器
                ├─ 检查命令
                ├─ 检查依赖
                ├─ 检查运行时
                └─ 检查配置
                      ↓
                生成诊断报告
                      ↓
                打印/输出结果
```

### 搜索流程

```
搜索命令 → 解析查询
              ↓
        并发搜索
        ├─ npm API
        └─ GitHub API
              ↓
        合并结果
              ↓
        去重和排序
              ↓
        格式化输出
```

### Playwright 诊断流程

```
诊断命令 → 检查 Playwright
              ↓
        检查浏览器
        ├─ Chromium
        ├─ Firefox
        └─ WebKit
              ↓
        检查配置文件
              ↓
        检查系统依赖 (Linux)
              ↓
        生成诊断报告
```

## 🔐 安全考虑

1. **命令执行安全**
   - 使用 execa 而非 child_process
   - 设置超时限制
   - 捕获所有异常

2. **文件系统安全**
   - 只读配置文件
   - 不修改用户文件 (除非 --fix)
   - 路径验证

3. **网络安全**
   - 仅访问官方 API
   - 设置请求超时
   - 不存储凭证

## 🧪 测试策略

### 单元测试

- 语言检查器测试
- 搜索功能测试
- 诊断逻辑测试

### 集成测试

- CLI 命令测试
- MCP 服务器测试
- 端到端流程测试

### 手动测试

```bash
# 语言检查
npm start -- languages

# 诊断测试
npm start -- check

# 搜索测试
npm start -- search github

# Playwright 测试
npm start -- playwright
```

## 📈 性能优化

1. **并发执行**
   - 语言检查并行
   - 搜索多源并发

2. **缓存机制**
   - 命令路径缓存
   - 版本信息缓存

3. **超时控制**
   - 命令执行超时
   - 网络请求超时

## 🚀 扩展性

### 添加新语言检查器

1. 继承 `LanguageChecker`
2. 实现抽象方法
3. 添加到 `initializeLanguageCheckers()`

### 添加新工具

1. 在 `tools/` 创建模块
2. 在 CLI 添加命令
3. 在服务器添加工具定义

### 添加新诊断

1. 在 `diagnoser.ts` 添加方法
2. 定义诊断逻辑
3. 集成到报告生成

## 📝 编码规范

- **TypeScript**: 严格模式
- **命名**: camelCase (变量), PascalCase (类)
- **错误处理**: try-catch, 返回错误对象
- **日志**: 使用 chalk 彩色输出
- **文档**: JSDoc 注释

## 🎨 UI/UX

### 终端输出

- ✅ 使用表格展示数据
- ✅ 彩色状态指示
- ✅ 进度动画 (ora)
- ✅ 清晰的层次结构

### 错误信息

- ✅ 明确的错误类型
- ✅ 可执行的建议
- ✅ 相关命令提示

---

**版本**: v1.1.0  
**维护者**: MCP Diagnoser Team  
**最后更新**: 2026-03-18
