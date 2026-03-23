#!/usr/bin/env node

/**
 * 搜索和爬取功能测试脚本
 */

import { MCPSearcher } from './src/tools/mcp-searcher.js';
import { BrowserSearcher } from './src/tools/browser-search.js';
import { WebCrawler } from './src/tools/web-crawler.js';
import chalk from 'chalk';

const tests = [
  {
    name: 'MCP 包搜索',
    test: async () => {
      const searcher = new MCPSearcher();
      const results = await searcher.searchMCPPackages('instagram scraper');
      return results.length > 0;
    },
  },
  {
    name: 'Web 搜索 (Bing)',
    test: async () => {
      const searcher = new BrowserSearcher();
      const results = await searcher.search('MCP protocol', 'bing', 5);
      return results.length > 0;
    },
  },
  {
    name: 'Web 搜索 (Google)',
    test: async () => {
      const searcher = new BrowserSearcher();
      const results = await searcher.search('MCP protocol', 'google', 5);
      return results.length > 0;
    },
  },
  {
    name: '网站爬取',
    test: async () => {
      const crawler = new WebCrawler();
      const results = await crawler.crawl('https://example.com', { maxDepth: 1, maxPages: 3 });
      return results.pages && results.pages.length > 0;
    },
  },
  {
    name: '信息提取',
    test: async () => {
      const crawler = new WebCrawler();
      const results = await crawler.extractInfo('https://example.com', {
        extractEmails: true,
        extractPhones: true,
        extractLinks: true,
        extractSocial: false,
      });
      return results.links && results.links.length > 0;
    },
  },
];

console.log(chalk.cyan('════════════════════════════════════════════════════════════'));
console.log(chalk.cyan('  搜索和爬取功能测试'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

let passed = 0;
let failed = 0;

for (const test of tests) {
  process.stdout.write(`测试：${test.name}... `);
  
  try {
    const result = await test.test();
    
    if (result) {
      console.log(chalk.green('✓ 通过'));
      passed++;
    } else {
      console.log(chalk.red('✗ 失败 - 结果为空'));
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
