# MCP Diagnoser 包诊断功能快速参考

## 🚀 快速开始

```bash
# 查看所有可用命令
mcp-diagnoser --help

# 检查所有 MCP 服务器和包
mcp-diagnoser check

# 查看包管理器状态
mcp-diagnoser package-managers

# 诊断所有 MCP 包
mcp-diagnoser packages
```

## 📋 常用命令

### 诊断命令

| 命令 | 用途 | 示例 |
|-----|------|-----|
| `check` | 完整诊断 | `mcp-diagnoser check` |
| `packages` | 诊断所有包 | `mcp-diagnoser packages` |
| `package <名>` | 诊断单个包 | `mcp-diagnoser package requests` |
| `package-managers` | 检查包管理器 | `mcp-diagnoser package-managers` |

### 安装命令

| 命令 | 用途 | 示例 |
|-----|------|-----|
| `install-missing` | 安装缺失包 | `mcp-diagnoser install-missing` |
| `install <包>` | 安装指定包 | `mcp-diagnoser install @playwright/mcp` |
| `playwright-install` | 安装 Playwright | `mcp-diagnoser playwright-install` |

### 搜索命令

| 命令 | 用途 | 示例 |
|-----|------|-----|
| `search <关键词>` | 搜索 MCP 包 | `mcp-diagnoser search github` |
| `popular` | 热门包列表 | `mcp-diagnoser popular` |

## 🔍 诊断场景

### 场景 1: 服务器启动失败

```bash
# 1. 运行诊断
mcp-diagnoser check

# 2. 查看缺失的包（在 Package Status 部分）

# 3. 一键安装
mcp-diagnoser install-missing
```

### 场景 2: 包安装失败

```bash
# 1. 诊断问题包
mcp-diagnoser package 包名

# 2. 查看错误分析和建议

# 3. 根据建议修复（如配置镜像源）
npm config set registry https://registry.npmmirror.com

# 4. 重新安装
npm install -g 包名
```

### 场景 3: 依赖冲突

```bash
# 1. 诊断所有依赖
mcp-diagnoser packages

# 2. 查看 Dependency Issues

# 3. 根据建议修复版本
```

### 场景 4: 新环境配置

```bash
# 1. 检查可用工具
mcp-diagnoser package-managers
mcp-diagnoser languages

# 2. 检查包状态
mcp-diagnoser packages

# 3. 安装缺失的包
mcp-diagnoser install-missing
```

## 💡 常见问题解决

### 网络错误

**症状**: timeout, connection failed, ECONNREFUSED

**解决**:
```bash
# npm 配置镜像
npm config set registry https://registry.npmmirror.com

# pip 配置镜像
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 重试安装
mcp-diagnoser install-missing
```

### 权限错误

**症状**: EACCES, EPERM, access denied

**解决**:
```bash
# Windows: 以管理员身份运行终端

# 或配置 npm 使用用户目录
npm config set prefix %APPDATA%\npm

# 然后重试
mcp-diagnoser install-missing
```

### 版本冲突

**症状**: version conflict, incompatible

**解决**:
```bash
# 1. 诊断查看冲突详情
mcp-diagnoser packages

# 2. 根据建议调整版本
npm install -g 包名@版本号
```

## 📊 输出解读

### 包状态符号

- ✅ - 已安装
- ❌ - 缺失/错误
- ⚠️ - 警告

### 错误类型

- `installation` - 安装问题
- `dependency` - 依赖问题
- `package` - 包问题
- `runtime` - 运行时问题
- `configuration` - 配置问题

### 包管理器状态

- ✓ - 可用（显示版本号）
- ✗ - 不可用

## 🔧 配置选项

### 全局选项

```bash
# 使用自定义配置文件
mcp-diagnoser -c path/to/config.json

# JSON 输出
mcp-diagnoser check --json

# 详细输出
mcp-diagnoser check --verbose

# 自动修复
mcp-diagnoser check --fix
```

### 包诊断选项

```bash
# 指定包管理器
mcp-diagnoser package 包名 -m pip

# 强制安装（无需确认）
mcp-diagnoser install-missing --force
```

## 📦 支持的包格式

### npm 包

```bash
# 标准包
mcp-diagnoser package lodash

# 作用域包
mcp-diagnoser package @playwright/mcp

# 带版本
mcp-diagnoser package package@1.0.0
```

### Python 包

```bash
# 使用 pip
mcp-diagnoser package requests -m pip

# 使用 uv
mcp-diagnoser package requests -m uv
```

### Rust 包

```bash
# cargo 包
mcp-diagnoser package serde -m cargo
```

## 🎯 最佳实践

1. **定期检查**: `mcp-diagnoser check` 每周运行一次
2. **更新前诊断**: 安装新包前先诊断环境
3. **一键修复**: 使用 `install-missing` 快速修复
4. **镜像配置**: 国内用户配置镜像源加速
5. **权限配置**: 避免使用 sudo/admin，配置用户目录

## 📞 获取帮助

```bash
# 查看所有命令
mcp-diagnoser --help

# 查看命令详情
mcp-diagnoser <command> --help

# 查看版本
mcp-diagnoser --version
```

## 🔗 相关文档

- [完整功能文档](PACKAGE_DIAGNOSIS_FEATURES.md)
- [增强总结](ENHANCEMENT_SUMMARY_V2.md)
- [项目 README](README_zh.md)
