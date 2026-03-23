#!/usr/bin/env node

/**
 * 代理检测工具
 * 测试 VPN/代理是否可用
 */

import { proxyChecker } from './dist/utils/proxy-checker.js';
import chalk from 'chalk';

console.log(chalk.cyan('════════════════════════════════════════════════════════════'));
console.log(chalk.cyan('  代理/VPN 检测工具'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

// 1. 检测系统代理配置
console.log(chalk.yellow('1. 检测系统代理配置...'));
const systemProxy = await proxyChecker.detectSystemProxy();

if (systemProxy.httpProxy || systemProxy.httpsProxy || systemProxy.autoDetect) {
  console.log(chalk.green('✓ 检测到代理配置'));
  if (systemProxy.httpProxy) {
    console.log(chalk.gray(`  HTTP 代理：${systemProxy.httpProxy}`));
  }
  if (systemProxy.httpsProxy) {
    console.log(chalk.gray(`  HTTPS 代理：${systemProxy.httpsProxy}`));
  }
  if (systemProxy.autoDetect) {
    console.log(chalk.gray(`  自动检测：启用`));
  }
} else {
  console.log(chalk.gray('  未检测到系统代理配置'));
}

// 2. 测试直接连接 Google
console.log(chalk.yellow('\n2. 测试直接连接 Google...'));
const directGoogle = await proxyChecker.testGoogle();
if (directGoogle.success) {
  console.log(chalk.green(`✓ Google 可访问 (${directGoogle.responseTime}ms)`));
} else {
  console.log(chalk.red(`✗ Google 无法访问: ${directGoogle.error}`));
}

// 3. 测试直接连接 Bing
console.log(chalk.yellow('\n3. 测试直接连接 Bing...'));
const directBing = await proxyChecker.testBing();
if (directBing.success) {
  console.log(chalk.green(`✓ Bing 可访问 (${directBing.responseTime}ms)`));
} else {
  console.log(chalk.red(`✗ Bing 无法访问：${directBing.error}`));
}

// 4. 获取外部 IP
console.log(chalk.yellow('\n4. 获取外部 IP 地址...'));
const ip = await proxyChecker.getExternalIp();
if (ip) {
  console.log(chalk.green(`✓ 外部 IP: ${ip}`));
} else {
  console.log(chalk.gray('  无法获取外部 IP'));
}

// 5. 扫描本地常见代理端口
console.log(chalk.yellow('\n5. 扫描本地常见代理端口...'));
const openPorts = await proxyChecker.scanCommonPorts('127.0.0.1');
if (openPorts.length > 0) {
  console.log(chalk.green(`✓ 发现开放的代理端口：${openPorts.join(', ')}`));
  
  // 测试每个开放的端口
  for (const port of openPorts) {
    console.log(chalk.gray(`\n  测试端口 ${port}...`));
    
    // 测试 HTTP 代理
    const httpResult = await proxyChecker.testProxy({
      protocol: 'http',
      host: '127.0.0.1',
      port,
    });
    
    if (httpResult.success) {
      console.log(chalk.green(`  ✓ HTTP 代理可用 (${httpResult.responseTime}ms)`));
    } else {
      console.log(chalk.gray(`  ✗ HTTP 代理不可用：${httpResult.error}`));
    }
    
    // 测试 SOCKS5 代理
    const socksResult = await proxyChecker.testProxy({
      protocol: 'socks5',
      host: '127.0.0.1',
      port,
    });
    
    if (socksResult.success) {
      console.log(chalk.green(`  ✓ SOCKS5 代理可用 (${socksResult.responseTime}ms)`));
    } else {
      console.log(chalk.gray(`  ✗ SOCKS5 代理不可用：${socksResult.error}`));
    }
  }
} else {
  console.log(chalk.gray('  未发现常见代理端口'));
}

// 6. 总结
console.log(chalk.cyan('\n════════════════════════════════════════════════════════════'));
console.log(chalk.cyan('  检测结果总结'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

const canAccessGoogle = directGoogle.success;
const canAccessBing = directBing.success;

if (canAccessGoogle && canAccessBing) {
  console.log(chalk.green('✓ 您的网络可以直接访问 Google 和 Bing'));
  console.log(chalk.gray('  无需使用代理'));
} else if (openPorts.length > 0) {
  console.log(chalk.green('✓ 检测到本地代理服务'));
  console.log(chalk.gray(`  开放端口：${openPorts.join(', ')}`));
  console.log(chalk.yellow('\n💡 建议:'));
  console.log(chalk.gray('  使用以下命令设置代理:'));
  console.log(chalk.gray(`  export HTTP_PROXY=http://127.0.0.1:${openPorts[0]}`));
  console.log(chalk.gray(`  export HTTPS_PROXY=http://127.0.0.1:${openPorts[0]}`));
} else {
  console.log(chalk.red('✗ 无法访问 Google/Bing，且未检测到本地代理'));
  console.log(chalk.yellow('\n💡 建议:'));
  console.log(chalk.gray('  1. 检查 VPN/代理软件是否已启动'));
  console.log(chalk.gray('  2. 确认代理端口配置'));
  console.log(chalk.gray('  3. 设置环境变量:'));
  console.log(chalk.gray('     export HTTP_PROXY=http://your-proxy:port'));
  console.log(chalk.gray('     export HTTPS_PROXY=http://your-proxy:port'));
}

console.log();
