#!/usr/bin/env node

/**
 * 搜索调试脚本 - 查看实际返回的 HTML
 */

import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs';

const query = '奥特曼';
const engine = 'baidu';

console.log(chalk.cyan('════════════════════════════════════════════════════════════'));
console.log(chalk.cyan('  搜索调试'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

console.log(chalk.yellow(`搜索词：${query}`));
console.log(chalk.yellow(`引擎：${engine}\n`));

// 构建搜索 URL
const searchUrl = `https://www.${engine === 'google' ? 'google.com' : engine === 'bing' ? 'bing.com' : 'baidu.com'}/search?q=${encodeURIComponent(query)}`;

console.log(chalk.gray(`URL: ${searchUrl}\n`));

try {
  // 获取页面
  const { stdout } = await execa('curl', [
    '-s',
    '-L',
    '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    '-H', 'Accept-Language: en-US,en;q=0.9',
    '-H', 'Accept-Encoding: gzip, deflate, br',
    '--compressed',
    '--max-time', '15',
    searchUrl,
  ], {
    timeout: 20000,
  });

  console.log(chalk.green(`✓ 获取成功`));
  console.log(chalk.gray(`HTML 长度：${stdout.length} 字符\n`));

  // 保存 HTML 到文件
  const htmlFile = 'search-debug.html';
  fs.writeFileSync(htmlFile, stdout);
  console.log(chalk.green(`✓ HTML 已保存到：${htmlFile}\n`));

  // 分析 HTML 结构
  console.log(chalk.yellow('════════════════════════════════════════════════════════════'));
  console.log(chalk.yellow('  HTML 结构分析'));
  console.log(chalk.yellow('════════════════════════════════════════════════════════════\n'));

  // 查找 h3 标签
  const h3Matches = stdout.match(/<h3[^>]*>[\s\S]{0,200}?<\/h3>/gi);
  console.log(chalk.cyan(`h3 标签数：${h3Matches ? h3Matches.length : 0}`));

  // 查找链接
  const linkMatches = stdout.match(/<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>/gi);
  console.log(chalk.cyan(`链接数：${linkMatches ? linkMatches.length : 0}`));

  // 查找可能的结果容器
  const divMatches = stdout.match(/<div[^>]*class="[^"]*[^"]*"[^>]*>[\s\S]{0,1000}?<h[34]/gi);
  console.log(chalk.cyan(`可能的结果容器：${divMatches ? divMatches.length : 0}\n`));

  // 显示前 5 个 h3 内容
  if (h3Matches && h3Matches.length > 0) {
    console.log(chalk.yellow('前 5 个 h3 内容:'));
    for (let i = 0; i < Math.min(5, h3Matches.length); i++) {
      const text = h3Matches[i].replace(/<[^>]*>/g, '').trim();
      console.log(chalk.gray(`  ${i + 1}. ${text}`));
    }
    console.log();
  }

  // 显示前 5 个链接
  if (linkMatches && linkMatches.length > 0) {
    console.log(chalk.yellow('前 5 个链接:'));
    for (let i = 0; i < Math.min(5, linkMatches.length); i++) {
      const hrefMatch = linkMatches[i].match(/href=["'](https?:\/\/[^"']+)["']/i);
      if (hrefMatch) {
        console.log(chalk.gray(`  ${i + 1}. ${hrefMatch[1]}`));
      }
    }
    console.log();
  }

  // 查找 class 包含 g、yuRUbf、tF2Cxc 等的 div
  const googleClasses = ['g', 'yuRUbf', 'tF2Cxc', 'LC20lb', 'VwiC3b'];
  console.log(chalk.yellow('Google 特定 class 检查:'));
  for (const cls of googleClasses) {
    const classMatches = stdout.match(new RegExp(`class="[^"]*${cls}[^"]*"`, 'gi'));
    console.log(chalk.gray(`  ${cls}: ${classMatches ? classMatches.length : 0}`));
  }

  console.log('\n' + chalk.cyan('════════════════════════════════════════════════════════════'));
  console.log(chalk.cyan('  调试完成'));
  console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

} catch (error) {
  console.error(chalk.red('✗ 错误:'), error.message);
  process.exit(1);
}
