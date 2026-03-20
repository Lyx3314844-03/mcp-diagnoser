# MCP Diagnoser - Linux & macOS 安装指南

本文档提供 MCP Diagnoser 在 Linux 和 macOS 系统上的详细安装说明。

## 📋 系统要求

### 最低要求

| 组件 | 版本 | 说明 |
|-----|------|------|
| Node.js | 18.0+ | **必需** |
| npm | 9.0+ | 随 Node.js 一起安装 |
| 内存 | 512 MB | 最小内存要求 |
| 磁盘空间 | 100 MB | 安装空间 |

### 推荐配置

| 组件 | 版本 | 说明 |
|-----|------|------|
| Node.js | 20.x LTS | 长期支持版本 |
| npm | 10.x | 最新版本 |
| 内存 | 1 GB | 推荐内存 |
| 磁盘空间 | 500 MB | 包含缓存 |

## 🐧 Linux 安装

### Ubuntu / Debian

#### 1. 安装 Node.js

```bash
# 更新包索引
sudo apt-get update

# 安装 curl（如果未安装）
sudo apt-get install -y curl

# 添加 NodeSource 仓库（Node.js 20.x）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 安装 Node.js
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### 2. 安装构建工具（可选，用于编译原生模块）

```bash
sudo apt-get install -y build-essential
```

#### 3. 安装 MCP Diagnoser

**方法一：使用 npm（推荐）**

```bash
sudo npm install -g mcp-diagnoser
```

**方法二：使用安装脚本**

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/install.sh | bash
```

**方法三：从源码安装**

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/mcp-diagnoser.git
cd mcp-diagnoser

# 安装依赖
npm install

# 构建
npm run build

# 全局链接
sudo npm link
```

### Fedora / RHEL / CentOS

#### 1. 安装 Node.js

```bash
# Fedora
sudo dnf install -y nodejs

# RHEL/CentOS (需要 EPEL 仓库)
sudo dnf install -y epel-release
sudo dnf install -y nodejs
```

#### 2. 安装开发工具（可选）

```bash
sudo dnf groupinstall -y "Development Tools"
```

#### 3. 安装 MCP Diagnoser

```bash
sudo npm install -g mcp-diagnoser
```

### Arch Linux

#### 1. 安装 Node.js

```bash
sudo pacman -S nodejs npm
```

#### 2. 安装基础开发工具（可选）

```bash
sudo pacman -S base-devel
```

#### 3. 安装 MCP Diagnoser

```bash
sudo npm install -g mcp-diagnoser
```

### openSUSE

#### 1. 安装 Node.js

```bash
sudo zypper install -y nodejs npm
```

#### 2. 安装开发工具（可选）

```bash
sudo zypper install -y -t pattern devel_basis
```

#### 3. 安装 MCP Diagnoser

```bash
sudo npm install -g mcp-diagnoser
```

## 🍎 macOS 安装

### 系统要求

- macOS 12.0 (Monterey) 或更高版本
- 512 MB 可用磁盘空间

### 方法一：使用 Homebrew（推荐）

#### 1. 安装 Homebrew（如果未安装）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. 安装 Node.js

```bash
brew install node@20
```

#### 3. 安装 MCP Diagnoser

```bash
npm install -g mcp-diagnoser
```

### 方法二：使用官方安装包

#### 1. 下载并安装 Node.js

访问 [Node.js 官网](https://nodejs.org/) 下载 macOS 安装包（.pkg 文件），然后双击安装。

#### 2. 验证安装

```bash
node --version
npm --version
```

#### 3. 安装 MCP Diagnoser

```bash
npm install -g mcp-diagnoser
```

### 方法三：使用安装脚本

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/install.sh | bash
```

### 安装 Xcode 命令行工具

某些功能可能需要 Xcode 命令行工具：

```bash
xcode-select --install
```

## 🔍 验证安装

安装完成后，运行以下命令验证：

```bash
# 检查版本
mcp-diagnoser --version

# 查看帮助
mcp-diagnoser --help

# 运行诊断
mcp-diagnoser check

# 检查包管理器
mcp-diagnoser package-managers
```

## 🛠️ 故障排除

### 问题 1: 权限错误 (EACCES)

**症状**: 安装时出现 `EACCES: permission denied` 错误

**解决方案**:

#### Linux

```bash
# 方法一：使用 sudo
sudo npm install -g mcp-diagnoser

# 方法二：配置 npm 使用用户目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g mcp-diagnoser
```

#### macOS

```bash
# 方法一：使用 sudo
sudo npm install -g mcp-diagnoser

# 方法二：修复 npm 权限
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
npm install -g mcp-diagnoser
```

### 问题 2: Node.js 版本过低

**症状**: 提示需要 Node.js 18+

**解决方案**:

#### 使用 nvm (Node Version Manager)

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 加载 nvm
source ~/.bashrc  # 或 source ~/.zshrc

# 安装 Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# 验证
node --version

# 重新安装 mcp-diagnoser
npm install -g mcp-diagnoser
```

### 问题 3: 网络连接问题

**症状**: npm install 超时或失败

**解决方案**: 使用镜像源

```bash
# 配置淘宝镜像（中国用户）
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry

# 重新安装
npm install -g mcp-diagnoser
```

### 问题 4: 找不到命令

**症状**: `command not found: mcp-diagnoser`

**解决方案**:

```bash
# 检查 npm 全局 bin 目录
npm config get prefix

# 添加到 PATH（根据 shell 类型）
# Bash
echo 'export PATH=$(npm config get prefix)/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Zsh
echo 'export PATH=$(npm config get prefix)/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# 验证
which mcp-diagnoser
```

### 问题 5: 构建失败

**症状**: 安装过程中编译原生模块失败

**解决方案**: 安装构建工具

#### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install -y build-essential python3
```

#### Fedora/RHEL

```bash
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y python3
```

#### macOS

```bash
xcode-select --install
```

## 📝 卸载

如需卸载 MCP Diagnoser：

```bash
# 全局卸载
npm uninstall -g mcp-diagnoser

# 或删除安装文件（如果使用脚本安装）
sudo rm -rf /usr/local/lib/mcp-diagnoser
sudo rm /usr/local/bin/mcp-diagnoser
```

## 🚀 快速开始

安装完成后，运行：

```bash
# 诊断所有 MCP 服务器
mcp-diagnoser check

# 诊断所有包
mcp-diagnoser packages

# 查看包管理器状态
mcp-diagnoser package-managers

# 获取帮助
mcp-diagnoser --help
```

## 📞 获取帮助

如果遇到问题：

1. 查看 [README.md](README.md) 获取使用说明
2. 查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解贡献流程
3. 在 GitHub 创建 Issue 寻求帮助

## 🔄 更新

```bash
# 更新到最新版本
npm update -g mcp-diagnoser

# 或重新安装
npm install -g mcp-diagnoser
```

## 📊 支持的平台

| 平台 | 版本 | 状态 |
|-----|------|------|
| Ubuntu | 20.04, 22.04, 24.04 | ✅ 完全支持 |
| Debian | 11, 12 | ✅ 完全支持 |
| Fedora | 38, 39, 40 | ✅ 完全支持 |
| RHEL/CentOS | 8, 9 | ✅ 完全支持 |
| Arch Linux | Rolling | ✅ 完全支持 |
| openSUSE | Leap, Tumbleweed | ✅ 完全支持 |
| macOS | 12.0+ | ✅ 完全支持 |

---

**最后更新**: 2026-03-20  
**版本**: 1.3.0
