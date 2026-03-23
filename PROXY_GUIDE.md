# 代理/VPN 检测功能使用指南

**版本**: v2.7.1  
**更新日期**: 2026 年 3 月 23 日

---

## 📋 功能概述

MCP Diagnoser 现在支持完整的代理/VPN 检测功能，帮助您：

- ✅ 检测系统代理配置
- ✅ 测试 Google/Bing 可访问性
- ✅ 扫描本地代理端口
- ✅ 测试代理连接性
- ✅ 获取外部 IP 地址

---

## 🚀 快速开始

### 运行代理检测

```bash
# 运行代理检测工具
node test-proxy.js
```

### 输出示例

```
════════════════════════════════════════════════════════════
  代理/VPN 检测工具
════════════════════════════════════════════════════════════

1. 检测系统代理配置...
  未检测到系统代理配置

2. 测试直接连接 Google...
✓ Google 可访问 (901ms)

3. 测试直接连接 Bing...
✓ Bing 可访问 (1238ms)

4. 获取外部 IP 地址...
✓ 外部 IP: 23.237.197.22

5. 扫描本地常见代理端口...
  未发现常见代理端口

════════════════════════════════════════════════════════════
  检测结果总结
════════════════════════════════════════════════════════════

✓ 您的网络可以直接访问 Google 和 Bing
  无需使用代理
```

---

## 💡 使用场景

### 场景 1: 直接使用 VPN 软件

如果您使用 Clash、V2Ray 等 VPN 软件：

1. **启动 VPN 软件**
2. **运行检测**:
   ```bash
   node test-proxy.js
   ```
3. **查看结果**:
   - 如果显示"发现开放的代理端口"，说明 VPN 正常工作
   - 会自动测试该端口的代理功能

### 场景 2: 手动配置代理

如果您需要手动配置代理：

```bash
# 设置环境变量
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 然后运行搜索
node dist/index.js web-search "MCP protocol" --engine google
```

### 场景 3: 临时使用代理

在代码中使用代理：

```typescript
import { proxyChecker } from './dist/utils/proxy-checker.js';

// 设置代理
proxyChecker.setEnvironmentProxy({
  protocol: 'http',
  host: '127.0.0.1',
  port: 7890,
});

// 测试 Google
const result = await proxyChecker.testGoogle();
console.log(result.success ? '✓ Google 可访问' : '✗ Google 不可访问');

// 清除代理
proxyChecker.clearEnvironmentProxy();
```

---

## 🔧 代理配置方式

### 方式 1: 环境变量（推荐）

```bash
# Windows PowerShell
$env:HTTP_PROXY="http://127.0.0.1:7890"
$env:HTTPS_PROXY="http://127.0.0.1:7890"

# Linux/macOS
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
```

### 方式 2: 在搜索命令中使用

```bash
# 设置代理后搜索
export HTTPS_PROXY=http://127.0.0.1:7890
node dist/index.js web-search "MCP protocol" --engine google --limit 10
```

### 方式 3: 代码中配置

```typescript
import { proxyChecker } from './dist/utils/proxy-checker.js';

// 配置代理
proxyChecker.setEnvironmentProxy({
  protocol: 'http',
  host: '127.0.0.1',
  port: 7890,
});
```

---

## 📊 检测项目说明

### 1. 系统代理配置检测

检测以下内容：
- 环境变量代理设置
- Windows 注册表代理设置
- macOS 网络代理设置
- Linux GSettings 代理设置

### 2. Google/Bing 连接测试

- 测试直接连接能力
- 测量响应时间
- 检测连接错误

### 3. 外部 IP 获取

- 通过 ipify API 获取
- 显示当前出口 IP
- 帮助判断代理是否生效

### 4. 本地代理端口扫描

扫描的常见端口：
- **7890/7891** - Clash
- **1080/10808** - SOCKS
- **8080/8888** - HTTP
- **9090** - HTTP
- **2333** - V2Ray
- **10809** - SOCKS

---

## 🛠️ API 参考

### ProxyChecker 类

#### detectSystemProxy()

检测系统代理配置

```typescript
const config = await proxyChecker.detectSystemProxy();
console.log(config.httpProxy); // HTTP 代理地址
```

#### testGoogle(proxyConfig?)

测试 Google 连接

```typescript
const result = await proxyChecker.testGoogle();
console.log(result.success); // true/false
console.log(result.responseTime); // 响应时间 (ms)
```

#### testBing(proxyConfig?)

测试 Bing 连接

```typescript
const result = await proxyChecker.testBing();
```

#### getExternalIp(proxyConfig?)

获取外部 IP

```typescript
const ip = await proxyChecker.getExternalIp();
console.log(ip); // "23.237.197.22"
```

#### scanCommonPorts(host)

扫描常见代理端口

```typescript
const ports = await proxyChecker.scanCommonPorts('127.0.0.1');
console.log(ports); // [7890, 1080]
```

#### testProxy(proxyConfig, targetUrl)

测试代理连接

```typescript
const result = await proxyChecker.testProxy({
  protocol: 'http',
  host: '127.0.0.1',
  port: 7890,
}, 'https://www.google.com');

console.log(result.success); // true/false
```

#### setEnvironmentProxy(proxyConfig)

设置环境变量代理

```typescript
proxyChecker.setEnvironmentProxy({
  protocol: 'http',
  host: '127.0.0.1',
  port: 7890,
});
```

#### clearEnvironmentProxy()

清除环境变量代理

```typescript
proxyChecker.clearEnvironmentProxy();
```

---

## 🎯 常见问题

### Q1: 检测不到代理端口怎么办？

**A**: 检查 VPN 软件是否启动，确认代理端口配置：
- Clash: 默认 7890
- V2Ray: 默认 10808
- Shadowsocks: 默认 1080

### Q2: Google 可以访问但搜索结果为空？

**A**: 这可能是 HTML 解析问题，不是代理问题。尝试：
1. 使用百度搜索（已验证可用）
2. 使用增强搜索模块的缓存功能
3. 更新搜索解析器

### Q3: 如何设置永久代理？

**A**: 
```bash
# Linux/macOS - 添加到 ~/.bashrc 或 ~/.zshrc
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port

# Windows - 系统属性 > 环境变量 > 用户变量
```

### Q4: 代理认证如何使用？

**A**:
```bash
# 带认证的代理
export HTTP_PROXY=http://username:password@proxy-host:port
export HTTPS_PROXY=http://username:password@proxy-host:port
```

---

## 📁 相关文件

- **`src/utils/proxy-checker.ts`** - 代理检测核心模块
- **`test-proxy.js`** - 代理检测工具
- **`PROXY_GUIDE.md`** - 本文档

---

## 🎉 总结

### 功能完整性

| 功能 | 状态 | 说明 |
|------|------|------|
| 系统代理检测 | ✅ | 支持 Windows/macOS/Linux |
| Google 测试 | ✅ | 可测试直接连接 |
| Bing 测试 | ✅ | 可测试直接连接 |
| IP 地址获取 | ✅ | 获取外部 IP |
| 端口扫描 | ✅ | 扫描常见代理端口 |
| 代理测试 | ✅ | 测试代理连接性 |
| 环境变量设置 | ✅ | 设置/清除代理 |

### 使用建议

1. **先运行检测**: `node test-proxy.js`
2. **根据结果配置**: 按提示设置代理
3. **测试搜索功能**: 确认代理生效
4. **保存配置**: 添加到环境变量

---

*最后更新：2026 年 3 月 23 日*  
*版本：v2.7.1*
