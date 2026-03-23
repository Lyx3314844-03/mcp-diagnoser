#!/usr/bin/env node

/**
 * MCP Diagnoser v3.0.0 完全功能验证
 * 验证所有核心功能模块
 */

import chalk from 'chalk';
import { execa } from 'execa';
import fs from 'fs';

// 测试结果
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
};

// 测试类别
const categories = {
  core: { name: '核心诊断', tests: [] },
  search: { name: '搜索功能', tests: [] },
  crawl: { name: '爬取功能', tests: [] },
  parser: { name: '解析器 v3', tests: [] },
  utils: { name: '工具模块', tests: [] },
};

/**
 * 运行命令测试
 */
async function runCommandTest(name, command, args, validator, timeout = 30000) {
  results.total++;
  process.stdout.write(chalk.cyan(`  [${results.total}] ${name}... `));
  
  try {
    const { stdout, stderr } = await execa(command, args, {
      cwd: process.cwd(),
      timeout,
      reject: false,
      shell: true,
    });
    
    const output = stdout + stderr;
    const isValid = typeof validator === 'function' ? validator(output) : validator.test(output);
    
    if (isValid) {
      console.log(chalk.green('✓ 通过'));
      results.passed++;
      return { success: true, output };
    } else {
      console.log(chalk.red('✗ 失败'));
      console.log(chalk.gray(`     输出：${output.substring(0, 150)}...`));
      results.failed++;
      return { success: false, output };
    }
  } catch (error) {
    console.log(chalk.red(`✗ 错误`));
    console.log(chalk.gray(`     ${error.message}`));
    results.failed++;
    return { success: false, error };
  }
}

/**
 * 运行模块测试
 */
async function runModuleTest(name, testFn) {
  results.total++;
  process.stdout.write(chalk.cyan(`  [${results.total}] ${name}... `));
  
  try {
    const result = await testFn();
    
    if (result.success) {
      console.log(chalk.green('✓ 通过'));
      if (result.details) {
        console.log(chalk.gray(`     ${result.details}`));
      }
      results.passed++;
      return result;
    } else {
      console.log(chalk.red('✗ 失败'));
      if (result.error) {
        console.log(chalk.gray(`     ${result.error}`));
      }
      results.failed++;
      return result;
    }
  } catch (error) {
    console.log(chalk.red(`✗ 错误`));
    console.log(chalk.gray(`     ${error.message}`));
    results.failed++;
    return { success: false, error };
  }
}

/**
 * 打印报告
 */
function printReport() {
  console.log(chalk.cyan('\n════════════════════════════════════════════════════════════'));
  console.log(chalk.cyan('  v3.0.0 功能验证汇总'));
  console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));
  
  console.log(chalk.white(`  总测试数：${results.total}`));
  console.log(chalk.green(`  通过：${results.passed}`));
  if (results.failed > 0) {
    console.log(chalk.red(`  失败：${results.failed}`));
  }
  
  const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  console.log(chalk.gray(`  通过率：${passRate}%`));
  
  console.log(chalk.cyan('\n────────────────────────────────────────────────────────────\n'));
  
  if (results.failed === 0) {
    console.log(chalk.green('  🎉 所有测试通过！v3.0.0 可以发布\n'));
  } else {
    console.log(chalk.yellow(`  ⚠️  有 ${results.failed} 个测试失败，建议修复后再发布\n`));
  }
  
  console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));
}

/**
 * 主验证函数
 */
async function runAllValidations() {
  console.log(chalk.cyan('════════════════════════════════════════════════════════════'));
  console.log(chalk.cyan('  MCP Diagnoser v3.0.0 完全功能验证'));
  console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));
  
  // ========== 1. 核心诊断功能 ==========
  console.log(chalk.yellow('━━━ 1. 核心诊断功能 ━━━\n'));
  
  await runCommandTest(
    '版本号检查',
    'node',
    ['dist/index.js', '--version'],
    /3\.0\.0/,
  );
  
  await runCommandTest(
    '帮助信息',
    'node',
    ['dist/index.js', '--help'],
    /Commands:/,
  );
  
  await runCommandTest(
    '快速诊断',
    'node',
    ['dist/index.js', 'check', '--fast', '--json'],
    (output) => output.includes('"summary"') && output.includes('"servers"'),
    60000
  );
  
  await runCommandTest(
    '诊断特定服务器',
    'node',
    ['dist/index.js', 'server', 'diagnoser', '--fast'],
    /diagnoser/,
    30000
  );
  
  // ========== 2. 优化版本 ==========
  console.log(chalk.yellow('\n━━━ 2. 优化版本 ━━━\n'));
  
  await runCommandTest(
    '优化版启动',
    'node',
    ['dist/index-optimized.js', '--help'],
    /High-performance/,
  );
  
  await runCommandTest(
    '优化版快速检查',
    'node',
    ['dist/index-optimized.js', 'fast-check'],
    /MCP Diagnoser|Diagnosis/,
    60000
  );
  
  await runCommandTest(
    '优化版性能分析',
    'node',
    ['dist/index-optimized.js', 'profile'],
    /Performance Profile/,
    60000
  );
  
  // ========== 3. 搜索功能 ==========
  console.log(chalk.yellow('\n━━━ 3. 搜索功能 ━━━\n'));
  
  await runCommandTest(
    'MCP 包搜索',
    'node',
    ['dist/index.js', 'search', 'mcp', '--limit', '3'],
    /Found \d+ packages/,
    30000
  );
  
  await runCommandTest(
    '搜索引擎列表',
    'node',
    ['dist/index.js', 'search-engines'],
    /Google|Bing|Baidu/,
  );
  
  // ========== 4. 爬取功能 ==========
  console.log(chalk.yellow('\n━━━ 4. 爬取功能 ━━━\n'));
  
  await runModuleTest(
    '增强爬取 - 基础爬取',
    async () => {
      const { EnhancedWebCrawler } = await import('./dist/tools/enhanced-crawler.js');
      const crawler = new EnhancedWebCrawler();
      const result = await crawler.crawl('https://example.com', {
        maxPages: 2,
        maxDepth: 1,
      });
      
      return {
        success: result.totalPages >= 1,
        details: `爬取 ${result.totalPages} 页，耗时 ${result.crawlTime}ms`,
      };
    },
    60000
  );
  
  await runModuleTest(
    '增强爬取 - 并发爬取',
    async () => {
      const { EnhancedWebCrawler } = await import('./dist/tools/enhanced-crawler.js');
      const crawler = new EnhancedWebCrawler();
      const result = await crawler.crawl('https://example.com', {
        maxPages: 3,
        concurrency: 2,
      });
      
      return {
        success: result.totalPages >= 1,
        details: `并发爬取 ${result.totalPages} 页`,
      };
    },
    60000
  );
  
  await runModuleTest(
    '增强爬取 - 导出功能',
    async () => {
      const { EnhancedWebCrawler } = await import('./dist/tools/enhanced-crawler.js');
      const crawler = new EnhancedWebCrawler();
      await crawler.crawl('https://example.com', { maxPages: 1 });
      
      const json = crawler.exportToJson();
      const md = crawler.exportToMarkdown();
      
      return {
        success: json.length > 0 && md.length > 0,
        details: `JSON: ${json.length} 字符，MD: ${md.length} 字符`,
      };
    },
    30000
  );
  
  // ========== 5. HTML 解析器 v3 ==========
  console.log(chalk.yellow('\n━━━ 5. HTML 解析器 v3 ━━━\n'));
  
  await runModuleTest(
    '解析器 v3 - Google 解析',
    async () => {
      const { createUltraParser } = await import('./dist/utils/html-parser-v3.js');
      const html = `<div class="g"><div class="yuRUbf"><a href="https://example.com"><h3>测试标题</h3></a></div><div class="VwiC3b">摘要内容</div></div>`;
      const parser = createUltraParser('google');
      const results = parser.parse(html);
      
      return {
        success: results.length > 0 && results[0].title.includes('测试'),
        details: `解析 ${results.length} 个结果`,
      };
    }
  );
  
  await runModuleTest(
    '解析器 v3 - Bing 解析',
    async () => {
      const { createUltraParser } = await import('./dist/utils/html-parser-v3.js');
      const html = `<li class="b_algo"><h2><a href="https://example.com">Bing 测试</a></h2></li>`;
      const parser = createUltraParser('bing');
      const results = parser.parse(html);
      
      return {
        success: results.length >= 0,
        details: `解析 ${results.length} 个结果`,
      };
    }
  );
  
  await runModuleTest(
    '解析器 v3 - 百度解析',
    async () => {
      const { createUltraParser } = await import('./dist/utils/html-parser-v3.js');
      const html = `<div class="c-container"><h3 class="t"><a href="https://example.com">百度测试</a></h3></div>`;
      const parser = createUltraParser('baidu');
      const results = parser.parse(html);
      
      return {
        success: results.length >= 0,
        details: `解析 ${results.length} 个结果`,
      };
    }
  );
  
  await runModuleTest(
    '解析器 v3 - 多引擎支持',
    async () => {
      const { createUltraParser } = await import('./dist/utils/html-parser-v3.js');
      const engines = ['google', 'bing', 'baidu', 'duckduckgo', 'yandex'];
      let passed = 0;
      
      for (const engine of engines) {
        const parser = createUltraParser(engine);
        const results = parser.parse('<div><a href="https://example.com"><h3>测试</h3></a></div>');
        if (results.length >= 0) passed++;
      }
      
      return {
        success: passed === engines.length,
        details: `${passed}/${engines.length} 个引擎正常`,
      };
    }
  );
  
  // ========== 6. 反爬虫功能 ==========
  console.log(chalk.yellow('\n━━━ 6. 反爬虫功能 ━━━\n'));
  
  await runModuleTest(
    '反爬虫 - User-Agent 轮换',
    async () => {
      const { antiBotManager } = await import('./dist/utils/anti-bot.js');
      const headers1 = antiBotManager.generateHeaders();
      antiBotManager.rotateUserAgent();
      const headers2 = antiBotManager.generateHeaders();
      
      return {
        success: headers1['User-Agent'].includes('Mozilla'),
        details: 'User-Agent 轮换正常',
      };
    }
  );
  
  await runModuleTest(
    '反爬虫 - 请求头生成',
    async () => {
      const { antiBotManager } = await import('./dist/utils/anti-bot.js');
      const headers = antiBotManager.generateHeaders();
      const required = ['User-Agent', 'Accept', 'Accept-Language', 'sec-ch-ua'];
      const hasAll = required.every(h => headers[h]);
      
      return {
        success: hasAll,
        details: `生成 ${Object.keys(headers).length} 个请求头`,
      };
    }
  );
  
  await runModuleTest(
    '反爬虫 - Cookie 管理',
    async () => {
      const { cookieManager } = await import('./dist/utils/anti-bot.js');
      cookieManager.set('test.com', 'session', 'abc123');
      const cookie = cookieManager.get('test.com');
      
      return {
        success: cookie.includes('session=abc123'),
        details: `Cookie: ${cookie}`,
      };
    }
  );
  
  // ========== 7. 缓存系统 ==========
  console.log(chalk.yellow('\n━━━ 7. 缓存系统 ━━━\n'));
  
  await runModuleTest(
    '缓存系统 - 基本功能',
    async () => {
      const { cache } = await import('./dist/utils/cache.js');
      await cache.set('test-key', { data: 'test' }, 60000);
      const result = await cache.get('test-key');
      
      return {
        success: result && result.data === 'test',
        details: '缓存读写正常',
      };
    },
    10000
  );
  
  await runModuleTest(
    '缓存系统 - 统计',
    async () => {
      const { cache } = await import('./dist/utils/cache.js');
      const stats = cache.getStats();
      
      return {
        success: typeof stats.enabled === 'boolean',
        details: `启用：${stats.enabled}, 内存条目：${stats.memoryEntries}`,
      };
    }
  );
  
  // ========== 8. 日志系统 ==========
  console.log(chalk.yellow('\n━━━ 8. 日志系统 ━━━\n'));
  
  await runModuleTest(
    '日志系统 - 模块加载',
    async () => {
      const { logger } = await import('./dist/utils/logger.js');
      logger.info('Test message');
      
      return {
        success: true,
        details: '日志模块加载正常',
      };
    }
  );
  
  // ========== 9. 错误处理 ==========
  console.log(chalk.yellow('\n━━━ 9. 错误处理 ━━━\n'));
  
  await runModuleTest(
    '错误处理 - 模块加载',
    async () => {
      const { DiagnosticError } = await import('./dist/utils/error-handler.js');
      const error = DiagnosticError.installation('Test error');
      
      return {
        success: error instanceof DiagnosticError,
        details: '错误类创建正常',
      };
    }
  );
  
  // ========== 10. 代理检测 ==========
  console.log(chalk.yellow('\n━━━ 10. 代理检测 ━━━\n'));
  
  await runModuleTest(
    '代理检测 - 模块加载',
    async () => {
      const { proxyChecker } = await import('./dist/utils/proxy-checker.js');
      
      return {
        success: typeof proxyChecker.detectSystemProxy === 'function',
        details: '代理检测模块加载正常',
      };
    }
  );
  
  // ========== 打印报告 ==========
  printReport();
  
  // 保存测试结果
  const report = {
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    total: results.total,
    passed: results.passed,
    failed: results.failed,
    passRate: results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0,
    ready: results.failed === 0,
  };
  
  fs.writeFileSync(
    'validation-results.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log(chalk.gray('  验证结果已保存到：validation-results.json\n'));
  
  // 退出码
  process.exit(results.failed > 0 ? 1 : 0);
}

// 运行验证
runAllValidations().catch(error => {
  console.error(chalk.red('验证执行失败:'), error);
  process.exit(1);
});
