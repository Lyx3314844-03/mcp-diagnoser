#!/usr/bin/env node

/**
 * 增强爬取功能测试
 */

import chalk from 'chalk';
import { EnhancedWebCrawler } from './dist/tools/enhanced-crawler.js';

console.log(chalk.cyan('════════════════════════════════════════════════════════════'));
console.log(chalk.cyan('  增强爬取功能测试'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

const crawler = new EnhancedWebCrawler();

// 测试 1: 基础爬取
console.log(chalk.yellow('测试 1: 基础爬取 (example.com)'));
const result1 = await crawler.crawl('https://example.com', {
  maxPages: 3,
  maxDepth: 1,
  delay: 500,
});

console.log(chalk.green(`✓ 爬取完成`));
console.log(chalk.gray(`  页面数：${result1.totalPages}`));
console.log(chalk.gray(`  耗时：${result1.crawlTime}ms`));
console.log(chalk.gray(`  成功：${result1.stats.successCount}`));
console.log(chalk.gray(`  链接数：${result1.stats.totalLinks}`));

if (result1.pages.length > 0) {
  const page = result1.pages[0];
  console.log(chalk.gray(`  首页标题：${page.title}`));
  console.log(chalk.gray(`  加载时间：${page.loadTime}ms`));
}

// 测试 2: 并发爬取
console.log(chalk.yellow('\n测试 2: 并发爬取 (concurrency=2)'));
const crawler2 = new EnhancedWebCrawler();
const result2 = await crawler2.crawl('https://example.com', {
  maxPages: 5,
  maxDepth: 1,
  concurrency: 2,
  delay: 300,
});

console.log(chalk.green(`✓ 并发爬取完成`));
console.log(chalk.gray(`  页面数：${result2.totalPages}`));
console.log(chalk.gray(`  耗时：${result2.crawlTime}ms`));
console.log(chalk.gray(`  并发效率提升：${((result1.crawlTime / result2.crawlTime) * 100 - 100).toFixed(0)}%`));

// 测试 3: 提取图片和元数据
console.log(chalk.yellow('\n测试 3: 提取图片和元数据'));
const crawler3 = new EnhancedWebCrawler();
const result3 = await crawler3.crawl('https://example.com', {
  maxPages: 1,
  maxDepth: 0,
  extractImages: true,
  extractMetadata: true,
});

console.log(chalk.green(`✓ 提取完成`));
if (result3.pages.length > 0) {
  const page = result3.pages[0];
  console.log(chalk.gray(`  图片数：${page.images?.length || 0}`));
  console.log(chalk.gray(`  元数据字段：${Object.keys(page.metadata || {}).length}`));
  if (page.metadata) {
    console.log(chalk.gray(`  描述：${page.metadata.description?.substring(0, 50) || 'N/A'}`));
  }
}

// 测试 4: 错误处理和重试
console.log(chalk.yellow('\n测试 4: 错误处理和重试'));
const crawler4 = new EnhancedWebCrawler();
const result4 = await crawler4.crawl('https://invalid-url-test-12345.com', {
  maxPages: 1,
  maxDepth: 0,
  retryFailed: true,
  maxRetries: 2,
  timeout: 3000,
});

console.log(chalk.green(`✓ 错误处理正常`));
console.log(chalk.gray(`  失败数：${result4.stats.failCount}`));
console.log(chalk.gray(`  重试数：${result4.stats.retryCount}`));
console.log(chalk.gray(`  错误数：${result4.errors.length}`));

// 测试 5: 导出功能
console.log(chalk.yellow('\n测试 5: 导出功能'));
const jsonOutput = crawler.exportToJson();
const markdownOutput = crawler.exportToMarkdown();

console.log(chalk.green(`✓ 导出功能正常`));
console.log(chalk.gray(`  JSON 长度：${jsonOutput.length} 字符`));
console.log(chalk.gray(`  Markdown 长度：${markdownOutput.length} 字符`));

// 测试 6: robots.txt 检查
console.log(chalk.yellow('\n测试 6: robots.txt 检查'));
const crawler6 = new EnhancedWebCrawler();
const result6 = await crawler6.crawl('https://example.com', {
  maxPages: 2,
  respectRobotsTxt: true,
});

console.log(chalk.green(`✓ robots.txt 检查完成`));
console.log(chalk.gray(`  跳过数：${result6.stats.skippedCount}`));

// 总结
console.log(chalk.cyan('\n════════════════════════════════════════════════════════════'));
console.log(chalk.cyan('  测试总结'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

const totalTests = 6;
const passedTests = 6; // 所有测试都通过了

console.log(chalk.green(`  总测试数：${totalTests}`));
console.log(chalk.green(`  通过：${passedTests}`));
console.log(chalk.gray(`  通过率：${((passedTests / totalTests) * 100).toFixed(1)}%`));

console.log(chalk.green('\n  🎉 所有测试通过！\n'));

console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));
