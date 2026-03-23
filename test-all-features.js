#!/usr/bin/env node

/**
 * 功能测试脚本
 * 测试所有 MCP Diagnoser 功能
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

const tests = [
  {
    name: '帮助命令',
    command: 'node dist/index.js --help',
    expected: 'Usage:',
  },
  {
    name: '版本号',
    command: 'node dist/index.js --version',
    expected: '2.7.0',
  },
  {
    name: '快速诊断',
    command: 'node dist/index.js check --fast --json',
    expected: '"summary"',
  },
  {
    name: 'JSON 输出',
    command: 'node dist/index.js check --fast --json',
    expected: '"servers"',
  },
  {
    name: '优化版本启动',
    command: 'node dist/index-optimized.js --help',
    expected: 'High-performance',
  },
  {
    name: '优化版本诊断',
    command: 'node dist/index-optimized.js check --fast',
    expected: 'MCP Diagnoser',
  },
  {
    name: '性能分析',
    command: 'node dist/index-optimized.js profile',
    expected: 'Performance Profile',
  },
];

let passed = 0;
let failed = 0;

console.log(chalk.cyan('════════════════════════════════════════════════════════════'));
console.log(chalk.cyan('  MCP Diagnoser 功能测试'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

for (const test of tests) {
  process.stdout.write(`测试：${test.name}... `);
  
  try {
    const output = execSync(test.command, { 
      encoding: 'utf-8',
      timeout: 30000,
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // 移除 ANSI 颜色代码
    const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, '');
    
    if (cleanOutput.includes(test.expected)) {
      console.log(chalk.green('✓ 通过'));
      passed++;
    } else {
      console.log(chalk.red(`✗ 失败 - 未找到预期输出 "${test.expected}"`));
      console.log(chalk.gray(`   实际输出：${output.substring(0, 100)}...`));
      failed++;
    }
  } catch (error) {
    console.log(chalk.red(`✗ 失败 - ${error.message}`));
    failed++;
  }
}

console.log('\n' + chalk.cyan('────────────────────────────────────────────────────────────'));
console.log(chalk.cyan(`  测试结果：${passed} 通过，${failed} 失败`));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

process.exit(failed > 0 ? 1 : 0);
