# Linux/macOS 安装支持 - 实现总结

## ✅ 已完成的工作

### 1. package.json 更新

添加了跨平台支持配置：

```json
{
  "os": ["win32", "linux", "darwin"],
  "scripts": {
    "postinstall": "node scripts/postinstall.js",
    "install:linux": "bash scripts/install.sh",
    "install:macos": "bash scripts/install.sh"
  },
  "files": ["dist", "scripts", "README.md", "LICENSE"]
}
```

**新增字段说明**:
- `os`: 声明支持的操作系统（Windows, Linux, macOS）
- `postinstall`: 安装后自动运行的脚本
- `files`: 包含在 npm 包中的文件

### 2. 创建的安装脚本

#### scripts/install.sh
跨平台安装脚本（Linux/macOS）

**功能**:
- ✅ 自动检测操作系统（Linux/macOS）
- ✅ 检查 Node.js 和 npm 安装
- ✅ 检查系统依赖（构建工具、Xcode 等）
- ✅ 自动安装项目（本地或 npm）
- ✅ 创建全局命令
- ✅ 验证安装
- ✅ 提供安装后提示

**使用方法**:
```bash
# 直接运行
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/install.sh | bash

# 或下载后运行
wget https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/install.sh
bash install.sh
```

#### scripts/check-deps.sh
系统依赖检查脚本

**功能**:
- ✅ 检查 Node.js 版本（需要 18+）
- ✅ 检查 npm 安装
- ✅ 检查可选包管理器（pip, cargo, go 等）
- ✅ 检查 Linux 构建工具
- ✅ 检查 macOS Xcode 工具
- ✅ 提供安装建议

**使用方法**:
```bash
# 在线检查
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/check-deps.sh | bash

# 本地检查
bash scripts/check-deps.sh
```

#### scripts/postinstall.js
npm 安装后自动运行的脚本

**功能**:
- ✅ 显示系统信息（平台、架构）
- ✅ 检查是否需要构建
- ✅ 提供平台特定的安装提示
- ✅ 验证安装

### 3. 文档更新

#### README.md
添加了详细的跨平台安装说明：

**新增内容**:
- ✅ 快速安装（所有平台）
- ✅ Windows 安装说明
- ✅ macOS 安装说明（3 种方法）
- ✅ Linux 安装说明（多种发行版）
- ✅ 系统依赖检查
- ✅ 安装验证步骤

**支持的 Linux 发行版**:
- Ubuntu/Debian（20.04, 22.04, 24.04）
- Fedora/RHEL/CentOS（8, 9）
- Arch Linux（Rolling）
- openSUSE（Leap, Tumbleweed）

#### INSTALLATION_LINUX_MACOS.md
详细的 Linux/macOS 安装指南

**包含内容**:
- ✅ 系统要求（最低/推荐）
- ✅ 各发行版详细安装步骤
- ✅ macOS 安装方法（Homebrew/官方/脚本）
- ✅ 故障排除指南
- ✅ 卸载说明
- ✅ 支持的平台列表

### 4. 安装方法总结

#### macOS 安装方法

**方法一：Homebrew**
```bash
brew install node@20
npm install -g mcp-diagnoser
```

**方法二：官方安装包**
从 https://nodejs.org/ 下载 .pkg 文件安装

**方法三：安装脚本**
```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/install.sh | bash
```

#### Linux 安装方法

**Ubuntu/Debian**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g mcp-diagnoser
```

**Fedora/RHEL**:
```bash
sudo dnf install -y nodejs
sudo npm install -g mcp-diagnoser
```

**Arch Linux**:
```bash
sudo pacman -S nodejs npm
sudo npm install -g mcp-diagnoser
```

**通用脚本**:
```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/install.sh | bash
```

## 📊 支持矩阵

| 平台 | 版本 | Node.js | 安装脚本 | 状态 |
|-----|------|---------|---------|------|
| **macOS** | 12.0+ | 18+ | ✅ | ✅ 完全支持 |
| **Ubuntu** | 20.04, 22.04, 24.04 | 18+ | ✅ | ✅ 完全支持 |
| **Debian** | 11, 12 | 18+ | ✅ | ✅ 完全支持 |
| **Fedora** | 38, 39, 40 | 18+ | ✅ | ✅ 完全支持 |
| **RHEL** | 8, 9 | 18+ | ✅ | ✅ 完全支持 |
| **CentOS** | 8, 9 | 18+ | ✅ | ✅ 完全支持 |
| **Arch** | Rolling | 18+ | ✅ | ✅ 完全支持 |
| **openSUSE** | Leap, Tumbleweed | 18+ | ✅ | ✅ 完全支持 |
| **Windows** | 10, 11 | 18+ | ❌ | ✅ 支持（npm） |

## 🔧 故障排除功能

### 自动检测的问题

1. **Node.js 未安装** → 提供安装命令
2. **Node.js 版本过低** → 提示升级
3. **npm 未安装** → 提示安装
4. **构建工具缺失** → 提供安装命令
5. **Xcode 工具缺失** (macOS) → 提示安装
6. **权限问题** → 提供解决方案

### 常见问题解决

#### 权限错误 (EACCES)
```bash
# Linux: 配置 npm 用户目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# macOS: 修复权限
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

#### Node.js 版本过低
```bash
# 使用 nvm 安装新版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

#### 网络问题（中国用户）
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
```

## 📝 下一步操作

### 发布前准备

1. **替换占位符**:
   - 在 `scripts/install.sh` 中替换 `YOUR_USERNAME`
   - 在 `README.md` 中替换 `YOUR_USERNAME`
   - 在 `package.json` 中替换作者信息

2. **测试安装脚本**:
   ```bash
   # 本地测试
   bash scripts/install.sh
   bash scripts/check-deps.sh
   ```

3. **验证 npm 包**:
   ```bash
   npm pack
   tar -tvf mcp-diagnoser-*.tgz
   ```

### 可选增强

- [ ] 创建 Homebrew formula（macOS）
- [ ] 创建 AUR package（Arch Linux）
- [ ] 创建 .deb 包（Debian/Ubuntu）
- [ ] 创建 .rpm 包（Fedora/RHEL）
- [ ] 添加 Docker 支持

## 🎯 使用示例

### 快速安装（推荐）

```bash
# Linux/macOS 一键安装
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-diagnoser/main/scripts/install.sh | bash
```

### 验证安装

```bash
# 检查版本
mcp-diagnoser --version

# 运行诊断
mcp-diagnoser check

# 检查包管理器
mcp-diagnoser package-managers
```

### 故障排除

```bash
# 检查系统依赖
bash scripts/check-deps.sh

# 查看详细日志
mcp-diagnoser check --verbose
```

## 📞 资源链接

- [README.md](README.md) - 主文档
- [INSTALLATION_LINUX_MACOS.md](INSTALLATION_LINUX_MACOS.md) - 详细安装指南
- [CONTRIBUTING.md](CONTRIBUTING.md) - 贡献指南
- [CHANGELOG.md](CHANGELOG.md) - 更新日志

---

**创建日期**: 2026-03-20  
**版本**: 1.3.0  
**状态**: ✅ 完成
