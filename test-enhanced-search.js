#!/usr/bin/env node

/**
 * 测试增强搜索功能
 */

import { enhancedSearcher } from './dist/tools/enhanced-search-v2.js';
import chalk from 'chalk';

console.log(chalk.cyan('════════════════════════════════════════════════════════════'));
console.log(chalk.cyan('  增强搜索功能测试'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

// 测试 1: 增强搜索
console.log(chalk.yellow('测试 1: 增强搜索 (带缓存)'));
const result1 = await enhancedSearcher.enhancedSearch('MCP protocol', {
  engine: 'google',
  limit: 5,
  useCache: true,
  deduplicate: true,
  sortByRelevance: true,
});
console.log(chalk.green(`✓ 找到 ${result1.total} 个结果，耗时 ${result1.searchTime}ms`));
console.log(chalk.gray(`  引擎：${result1.engine}`));
console.log(chalk.gray(`  缓存：${result1.fromCache ? '是' : '否'}\n`));

// 测试 2: 智能搜索
console.log(chalk.yellow('测试 2: 智能搜索 (自动选择引擎)'));
const result2 = await enhancedSearcher.smartSearch('typescript sdk github', {
  limit: 5,
  useCache: true,
});
console.log(chalk.green(`✓ 找到 ${result2.total} 个结果，耗时 ${result2.searchTime}ms`));
console.log(chalk.gray(`  引擎：${result2.engine}\n`));

// 测试 3: 多引擎搜索
console.log(chalk.yellow('测试 3: 多引擎搜索'));
const result3 = await enhancedSearcher.multiSearch('AI tools', ['google', 'bing'], {
  limit: 10,
  useCache: true,
});
console.log(chalk.green(`✓ 找到 ${result3.total} 个结果，耗时 ${result3.searchTime}ms`));
console.log(chalk.gray(`  引擎：${result3.engine}\n`));

// 测试 4: 缓存统计
console.log(chalk.yellow('测试 4: 缓存统计'));
const stats = enhancedSearcher.getCacheStats();
console.log(chalk.green(`✓ 缓存状态:`));
console.log(chalk.gray(`  启用：${stats.enabled}`));
console.log(chalk.gray(`  内存条目：${stats.memoryEntries}`));
console.log(chalk.gray(`  命中率：${stats.hitRate.toFixed(1)}%\n`));

// 测试 5: 第二次搜索 (应该使用缓存)
console.log(chalk.yellow('测试 5: 第二次搜索 (使用缓存)'));
const result5 = await enhancedSearcher.enhancedSearch('MCP protocol', {
  engine: 'google',
  limit: 5,
  useCache: true,
});
console.log(chalk.green(`✓ 找到 ${result5.total} 个结果，耗时 ${result5.searchTime}ms`));
console.log(chalk.gray(`  缓存：${result5.fromCache ? '是' : '否'}\n`));

console.log(chalk.cyan('────────────────────────────────────────────────────────────'));
console.log(chalk.cyan('  测试完成!'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));
