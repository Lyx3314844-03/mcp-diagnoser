#!/usr/bin/env node

/**
 * MCP Diagnoser 全面功能测试脚本
 * 测试所有核心功能
 */

import chalk from 'chalk';
import { execa } from 'execa';

const tests = [];
let passed = 0;
let failed = 0;
let total = 0;

/**
 * 添加测试
 */
function addTest(name, command, expectedOutput, timeout = 30000) {
  tests.push({ name, command, expectedOutput, timeout });
}

/**
 * 运行单个测试
 */
async function runTest(test) {
  total++;
  process.stdout.write(chalk.cyan(`\n[${total}] 测试：${test.name}... `));
  
  try {
    // 分割命令和参数
    const parts = test.command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);
    
    const { stdout, stderr } = await execa(cmd, args, {
      cwd: process.cwd(),
      timeout: test.timeout,
      reject: false,
      shell: true,  // 使用 shell 执行
    });
    
    const output = stdout + stderr;
    
    if (test.expectedOutput.test(output)) {
      console.log(chalk.green('✓ 通过'));
      passed++;
      return true;
    } else {
      console.log(chalk.red('✗ 失败'));
      console.log(chalk.gray(`  预期：${test.expectedOutput}`));
      console.log(chalk.gray(`  实际输出：${output.substring(0, 200)}...`));
      failed++;
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`✗ 错误`));
    console.log(chalk.gray(`  ${error.message}`));
    failed++;
    return false;
  }
}

/**
 * 添加所有测试
 */
function addAllTests() {
  console.log(chalk.cyan('════════════════════════════════════════════════════════════'));
  console.log(chalk.cyan('  MCP Diagnoser 全面功能测试'));
  console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));
  
  // ===== 核心诊断功能 =====
  console.log(chalk.yellow('━━━ 核心诊断功能 ━━━'));
  
  addTest(
    '1.1 版本号',
    'node dist/index.js --version',
    /2\.7\.\d/,
  );
  
  addTest(
    '1.2 帮助信息',
    'node dist/index.js --help',
    /Commands:/,
  );
  
  addTest(
    '1.3 快速诊断 (Fast Mode)',
    'node dist/index.js check --fast --json',
    /"summary"/,
    60000
  );
  
  addTest(
    '1.4 JSON 输出',
    'node dist/index.js check --fast --json',
    /"servers":/,
    60000
  );
  
  addTest(
    '1.5 诊断特定服务器',
    'node dist/index.js server diagnoser --fast',
    /diagnoser/,
    30000
  );
  
  // ===== 优化版本 =====
  console.log(chalk.yellow('\n━━━ 优化版本 ━━━'));
  
  addTest(
    '2.1 优化版启动',
    'node dist/index-optimized.js --help',
    /High-performance/,
  );
  
  addTest(
    '2.2 优化版快速检查',
    'node dist/index-optimized.js fast-check',
    /MCP Diagnoser|Diagnosis/,
    60000
  );
  
  addTest(
    '2.3 优化版性能分析',
    'node dist/index-optimized.js profile',
    /Performance Profile/,
    60000
  );
  
  addTest(
    '2.4 优化版缓存预热',
    'node dist/index-optimized.js warmup',
    /Cache warmed up/,
    60000
  );
  
  // ===== 搜索功能 =====
  console.log(chalk.yellow('\n━━━ 搜索功能 ━━━'));
  
  addTest(
    '3.1 MCP 包搜索',
    'node dist/index.js search mcp --limit 3',
    /Found \d+ packages/,
    30000
  );
  
  addTest(
    '3.2 Web 搜索 (Bing)',
    'node dist/index.js web-search "test" --engine bing --limit 3',
    /Search Results/,
    30000
  );
  
  addTest(
    '3.3 搜索引擎列表',
    'node dist/index.js search-engines',
    /Google|Bing|Baidu/,
  );
  
  // ===== 代理检测 =====
  console.log(chalk.yellow('\n━━━ 代理检测 ━━━'));
  
  addTest(
    '4.1 代理检测工具',
    'node test-proxy.js',
    /检测结果总结/,
    60000
  );
  
  // ===== 增强搜索 =====
  console.log(chalk.yellow('\n━━━ 增强搜索 ━━━'));
  
  addTest(
    '5.1 增强搜索测试',
    'node test-enhanced-search.js',
    /测试完成/,
    120000
  );
  
  // ===== 反爬虫功能 =====
  console.log(chalk.yellow('\n━━━ 反爬虫功能 ━━━'));
  
  addTest(
    '6.1 反爬虫模块存在',
    'node -e "import(\'./dist/utils/anti-bot.js\').then(m => console.log(\'OK\'))"',
    /OK/,
  );
  
  // ===== HTML 解析器 =====
  console.log(chalk.yellow('\n━━━ HTML 解析器 ━━━'));
  
  addTest(
    '7.1 解析器模块存在',
    'node -e "import(\'./dist/utils/html-parser.js\').then(m => console.log(\'OK\'))"',
    /OK/,
  );
  
  // ===== 缓存系统 =====
  console.log(chalk.yellow('\n━━━ 缓存系统 ━━━'));
  
  addTest(
    '8.1 缓存模块存在',
    'node -e "import(\'./dist/utils/cache.js\').then(m => console.log(\'OK\'))"',
    /OK/,
  );
  
  // ===== 日志系统 =====
  console.log(chalk.yellow('\n━━━ 日志系统 ━━━'));
  
  addTest(
    '9.1 日志模块存在',
    'node -e "import(\'./dist/utils/logger.js\').then(m => console.log(\'OK\'))"',
    /OK/,
  );
  
  // ===== 错误处理 =====
  console.log(chalk.yellow('\n━━━ 错误处理 ━━━'));
  
  addTest(
    '10.1 错误处理模块存在',
    'node -e "import(\'./dist/utils/error-handler.js\').then(m => console.log(\'OK\'))"',
    /OK/,
  );
}

/**
 * 打印测试结果
 */
function printResults() {
  console.log(chalk.cyan('\n════════════════════════════════════════════════════════════'));
  console.log(chalk.cyan('  测试结果汇总'));
  console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));
  
  console.log(chalk.white(`  总测试数：${total}`));
  console.log(chalk.green(`  通过：${passed}`));
  console.log(chalk.red(`  失败：${failed}`));
  console.log(chalk.gray(`  通过率：${((passed / total) * 100).toFixed(1)}%`));
  
  console.log(chalk.cyan('\n────────────────────────────────────────────────────────────\n'));
  
  if (failed === 0) {
    console.log(chalk.green('  🎉 所有测试通过！\n'));
  } else {
    console.log(chalk.yellow(`  ⚠️  有 ${failed} 个测试失败，请检查输出。\n`));
  }
  
  console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));
}

/**
 * 主函数
 */
async function main() {
  const startTime = Date.now();
  
  // 添加所有测试
  addAllTests();
  
  // 运行所有测试
  for (const test of tests) {
    await runTest(test);
    // 测试间延迟，避免过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 打印结果
  printResults();
  
  // 计算总耗时
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(chalk.gray(`  总耗时：${totalTime}秒\n`));
  
  // 退出码
  process.exit(failed > 0 ? 1 : 0);
}

// 运行测试
main().catch(error => {
  console.error(chalk.red('测试执行失败:'), error);
  process.exit(1);
});
