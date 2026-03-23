#!/usr/bin/env node

/**
 * 测试搜索功能并输出详细调试信息
 */

import { BrowserSearcher } from './dist/tools/browser-search.js';
import chalk from 'chalk';

const searcher = new BrowserSearcher();

console.log(chalk.cyan('════════════════════════════════════════════════════════════'));
console.log(chalk.cyan('  搜索引擎功能测试'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

const tests = [
  { name: 'Google', engine: 'google', query: 'MCP protocol' },
  { name: 'Bing', engine: 'bing', query: 'AI tools' },
  { name: 'DuckDuckGo', engine: 'duckduckgo', query: 'web scraping' },
  { name: 'Baidu', engine: 'baidu', query: '人工智能' },
];

for (const test of tests) {
  console.log(chalk.yellow(`\n测试：${test.name} 搜索 "${test.query}"`));
  
  try {
    const results = await searcher.search(test.query, { 
      engine: test.engine,
      limit: 10 
    });
    
    console.log(chalk.green(`✓ 搜索成功`));
    console.log(chalk.gray(`  引擎：${results.engine}`));
    console.log(chalk.gray(`  结果数：${results.total}`));
    console.log(chalk.gray(`  耗时：${results.searchTime}ms`));
    
    if (results.results.length > 0) {
      console.log(chalk.gray(`\n  前 3 个结果:`));
      results.results.slice(0, 3).forEach((r, i) => {
        console.log(chalk.gray(`    ${i + 1}. ${r.title}`));
        console.log(chalk.gray(`       ${r.url}`));
      });
    } else {
      console.log(chalk.red(`  ✗ 未找到结果`));
      console.log(chalk.gray(`  可能原因:`));
      console.log(chalk.gray(`    1. 搜索引擎反爬虫保护`));
      console.log(chalk.gray(`    2. HTML 结构变化`));
      console.log(chalk.gray(`    3. 网络连接问题`));
    }
  } catch (error) {
    console.log(chalk.red(`✗ 搜索失败`));
    console.log(chalk.gray(`  错误：${error.message}`));
  }
}

console.log('\n' + chalk.cyan('────────────────────────────────────────────────────────────'));
console.log(chalk.cyan('  测试完成!'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));
