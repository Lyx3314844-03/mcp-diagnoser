# MCP Diagnoser 包安装诊断功能增强

## 新增功能概述

本次增强为 mcp-diagnoser MCP Server 添加了全面的包安装诊断功能，能够诊断各种安装包出错的情况，并给出修复意见。

## 主要功能

### 1. 多包管理器支持

支持诊断 12 种主流包管理器：

| 包管理器 | 命令 | 支持平台 |
|---------|------|---------|
| npm | `npm` | 全平台 |
| yarn | `yarn` | 全平台 |
| pnpm | `pnpm` | 全平台 |
| pip | `pip` | 全平台 |
| pip3 | `pip3` | 全平台 |
| uv | `uv` | 全平台 |
| uvx | `uvx` | 全平台 |
| cargo | `cargo` | 全平台 |
| go | `go` | 全平台 |
| dotnet | `dotnet` | 全平台 |
| gem | `gem` | 全平台 |
| composer | `composer` | 全平台 |

### 2. 包安装状态检测

- ✅ 检测包是否已安装
- ✅ 获取包的版本信息
- ✅ 识别全局安装 vs 本地安装
- ✅ 检测包安装位置
- ✅ 智能识别 npx/uvx 按需安装的包

### 3. 依赖冲突检测

- 🔍 npm 依赖树分析
- 🔍 pip 依赖冲突检查
- 🔍 同伴依赖 (peer dependency) 检测
- 🔍 版本不匹配问题识别

### 4. 安装失败原因分析

自动分析安装错误，识别以下问题类型：

| 错误类型 | 识别特征 | 建议修复 |
|---------|---------|---------|
| 网络错误 | timeout, connection, fetch failed, ECONNREFUSED | 配置镜像源 |
| 权限错误 | EACCES, EPERM, access denied | 管理员权限运行 |
| 版本冲突 | version, conflict, incompatible | 检查版本要求 |
| 运行时缺失 | runtime, not found, missing | 安装运行时 |
| 磁盘空间 | disk, space, ENOSPC | 清理磁盘空间 |

### 5. 自动修复建议

根据诊断结果提供针对性的修复建议：

- 📦 包安装命令
- 🔧 镜像源配置
- 👤 权限修复方法
- 📋 依赖版本调整

## 新增 CLI 命令

### `packages` - 诊断所有 MCP 包

诊断 MCP 配置中使用的所有包：

```bash
mcp-diagnoser packages
```

输出示例：
```
════════════════════════════════════════════════════════════
  MCP Package Diagnosis
════════════════════════════════════════════════════════════

📊 Summary:
   Total Packages: 33
   Installed: 33
   Missing: 0
```

### `package <name>` - 诊断特定包

诊断指定的包：

```bash
mcp-diagnoser package @playwright/mcp
mcp-diagnoser package requests -m pip
```

选项：
- `-m, --manager <manager>` - 指定包管理器 (npm, pip, cargo 等)

### `package-managers` - 列出所有包管理器

检查系统中可用的包管理器：

```bash
mcp-diagnoser package-managers
```

输出示例：
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

### `install-missing` - 安装缺失的包

一键安装所有缺失的包：

```bash
mcp-diagnoser install-missing
mcp-diagnoser install-missing --force  # 无需确认
```

## 集成到主诊断流程

包诊断已集成到 `check` 命令中，运行时会同时检查：

```bash
mcp-diagnoser check
mcp-diagnoser check --verbose  # 详细输出
```

诊断报告包含：
1. 📊 服务器状态摘要
2. 🔧 语言运行时状态
3. 📦 包状态（新增）
4. 🔍 各服务器详细诊断
5. 💡 修复建议

## 包诊断 API

### PackageDiagnoser 类

```typescript
import { PackageDiagnoser } from './tools/package-diagnoser.js';

const diagnoser = new PackageDiagnoser();

// 诊断单个包
const result = await diagnoser.diagnosePackage('package-name');
// 返回：PackageInfo { name, version, installed, issues }

// 诊断所有包管理器
const managers = await diagnoser.diagnoseAllPackageManagers();
// 返回：Map<name, PackageManager & { available, version }>

// 诊断依赖问题
const issues = await diagnoser.diagnoseDependencies();
// 返回：DependencyIssue[]

// 分析安装错误
const error = diagnoser.analyzeInstallError(errorMessage, errorCode);
// 返回：InstallError { type, message, suggestion }
```

### 接口定义

```typescript
interface PackageInfo {
  name: string;
  version?: string;
  installed: boolean;
  global?: boolean;
  location?: string;
  issues: string[];
}

interface DependencyIssue {
  type: 'missing' | 'conflict' | 'version_mismatch' | 'peer_dependency';
  package: string;
  requiredBy?: string;
  expectedVersion?: string;
  actualVersion?: string;
  message: string;
  suggestion: string;
}

interface InstallError {
  type: 'network' | 'permission' | 'version_conflict' | 'missing_runtime' | 'disk_space' | 'unknown';
  message: string;
  details: string;
  suggestion: string;
  errorCode?: string;
}
```

## 使用场景

### 场景 1: MCP 服务器启动失败

当 MCP 服务器因包缺失无法启动时：

```bash
# 运行诊断
mcp-diagnoser check

# 查看缺失的包
# 在输出的 "Package Status" 部分查看

# 一键安装缺失的包
mcp-diagnoser install-missing
```

### 场景 2: 包安装失败

当安装包时遇到错误：

```bash
# 诊断特定包
mcp-diagnoser package problematic-package

# 查看详细的错误分析
# 输出会包含错误类型和修复建议
```

### 场景 3: 依赖冲突

当遇到依赖冲突时：

```bash
# 诊断所有包的依赖关系
mcp-diagnoser packages

# 查看 "Dependency Issues" 部分
# 会显示冲突的包和解决方法
```

### 场景 4: 检查环境配置

在新环境中设置 MCP 时：

```bash
# 检查所有可用的包管理器
mcp-diagnoser package-managers

# 检查所有 MCP 包的状态
mcp-diagnoser packages

# 根据需要安装缺失的组件
```

## 配置镜像源

### npm 镜像

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry
```

### pip 镜像

```bash
# 使用清华镜像
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple <package>

# 或永久配置
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### cargo 镜像

```bash
# 使用中科大镜像
cargo config set source.crates-io.replace-with 'ustc'
```

## 故障排除

### 问题：诊断速度较慢

**原因**：某些包管理器检查需要查询系统

**解决**：
- npx/uvx 包会自动跳过检查（按需安装）
- 使用 `--verbose` 查看详细进度

### 问题：误报包缺失

**原因**：包可能通过其他方式安装

**解决**：
- 手动验证包是否可用
- 使用 `package` 命令单独诊断

### 问题：权限错误

**原因**：全局安装需要管理员权限

**解决**：
- Windows: 以管理员身份运行终端
- 配置 npm 使用用户目录：`npm config set prefix %APPDATA%\npm`

## 版本历史

### v1.3.0 (本次更新)

- ✅ 新增 PackageDiagnoser 模块
- ✅ 支持 12 种包管理器
- ✅ 集成到主诊断流程
- ✅ 新增 4 个 CLI 命令
- ✅ 依赖冲突检测
- ✅ 安装错误分析
- ✅ 自动修复建议

## 贡献

欢迎提交 Issue 和 Pull Request 来改进包诊断功能！

## 许可证

MIT License
