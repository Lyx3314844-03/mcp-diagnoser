#!/usr/bin/env node

/**
 * HTML 解析器测试 - 使用真实搜索结果 HTML
 */

import chalk from 'chalk';
import { createParser } from './dist/utils/html-parser-v2.js';

console.log(chalk.cyan('════════════════════════════════════════════════════════════'));
console.log(chalk.cyan('  HTML 解析器测试'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

// 真实的 Google 搜索结果 HTML 示例
const googleHtml = `
<!DOCTYPE html>
<html>
<head><title>Google Search Results</title></head>
<body>
<div id="search">
  <div class="g">
    <div class="yuRUbf">
      <a href="https://baike.baidu.com/item/奥特曼/19604">
        <h3>奥特曼 - 百度百科</h3>
      </a>
    </div>
    <div class="VwiC3b">奥特曼是日本圆谷制作公司制作的特摄电视剧系列中的巨大英雄角色。</div>
  </div>
  <div class="g">
    <div class="yuRUbf">
      <a href="https://m-78.jp/">
        <h3>ウルトラマン公式サイト | 圆谷制作</h3>
      </a>
    </div>
    <div class="VwiC3b">奥特曼官方网站 - 来自 M78 星云光之国的宇宙警备队成员</div>
  </div>
  <div class="g">
    <div class="yuRUbf">
      <a href="https://zh.wikipedia.org/wiki/奥特曼">
        <h3>奥特曼 - 维基百科</h3>
      </a>
    </div>
    <div class="VwiC3b">奥特曼系列是以奥特曼为主角的特摄电视剧系列</div>
  </div>
</div>
</body>
</html>
`;

// 真实的 Bing 搜索结果 HTML 示例
const bingHtml = `
<!DOCTYPE html>
<html>
<head><title>Bing Search Results</title></head>
<body>
<ol id="b_results">
  <li class="b_algo">
    <h2><a href="https://baike.baidu.com/item/奥特曼/19604">奥特曼 - 百度百科</a></h2>
    <div class="b_caption"><p>奥特曼是日本圆谷制作公司制作的特摄电视剧系列中的巨大英雄角色。</p></div>
  </li>
  <li class="b_algo">
    <h2><a href="https://m-78.jp/">奥特曼官方网站</a></h2>
    <div class="b_caption"><p>来自 M78 星云光之国的宇宙警备队成员，保护地球免受怪兽侵袭。</p></div>
  </li>
</ol>
</body>
</html>
`;

// 真实的百度搜索结果 HTML 示例
const baiduHtml = `
<!DOCTYPE html>
<html>
<head><title>百度搜索结果</title></head>
<body>
<div id="content_left">
  <div class="result c-container">
    <h3 class="t"><a href="https://baike.baidu.com/item/奥特曼/19604">奥特曼 - 百度百科</a></h3>
    <div class="c-abstract">奥特曼是日本圆谷制作公司制作的特摄电视剧系列中的巨大英雄角色...</div>
  </div>
  <div class="result c-container">
    <h3 class="t"><a href="https://m-78.jp/">ウルトラマン公式サイト | 圆谷制作</a></h3>
    <div class="c-abstract">奥特曼官方网站，来自 M78 星云光之国的宇宙警备队成员</div>
  </div>
</div>
</body>
</html>
`;

let passed = 0;
let failed = 0;

// 测试 Google 解析
console.log(chalk.yellow('测试 1: Google 解析'));
const googleParser = createParser('google');
const googleResults = googleParser.parse(googleHtml);

if (googleResults.length >= 2) {
  console.log(chalk.green(`✓ 通过 - 解析到 ${googleResults.length} 个结果`));
  googleResults.forEach((r, i) => {
    console.log(chalk.gray(`  ${i + 1}. ${r.title} - ${r.url}`));
  });
  passed++;
} else {
  console.log(chalk.red(`✗ 失败 - 只解析到 ${googleResults.length} 个结果`));
  failed++;
}
console.log();

// 测试 Bing 解析
console.log(chalk.yellow('测试 2: Bing 解析'));
const bingParser = createParser('bing');
const bingResults = bingParser.parse(bingHtml);

if (bingResults.length >= 1) {
  console.log(chalk.green(`✓ 通过 - 解析到 ${bingResults.length} 个结果`));
  bingResults.forEach((r, i) => {
    console.log(chalk.gray(`  ${i + 1}. ${r.title} - ${r.url}`));
  });
  passed++;
} else {
  console.log(chalk.red(`✗ 失败 - 只解析到 ${bingResults.length} 个结果`));
  failed++;
}
console.log();

// 测试百度解析
console.log(chalk.yellow('测试 3: 百度解析'));
const baiduParser = createParser('baidu');
const baiduResults = baiduParser.parse(baiduHtml);

if (baiduResults.length >= 2) {
  console.log(chalk.green(`✓ 通过 - 解析到 ${baiduResults.length} 个结果`));
  baiduResults.forEach((r, i) => {
    console.log(chalk.gray(`  ${i + 1}. ${r.title} - ${r.url}`));
  });
  passed++;
} else {
  console.log(chalk.red(`✗ 失败 - 只解析到 ${baiduResults.length} 个结果`));
  failed++;
}
console.log();

// 测试文本清理
console.log(chalk.yellow('测试 4: 文本清理'));
const testParser = createParser('google');
const cleanedText = testParser.cleanText('<h3>测试 &amp; 清理</h3>');

if (cleanedText === '测试 & 清理') {
  console.log(chalk.green(`✓ 通过 - 文本清理正常`));
  passed++;
} else {
  console.log(chalk.red(`✗ 失败 - 清理结果：${cleanedText}`));
  failed++;
}
console.log();

// 测试 URL 清理
console.log(chalk.yellow('测试 5: URL 清理'));
const cleanedUrl = testParser.cleanUrl('https://www.google.com/url?q=https://example.com/page&sa=D');

if (cleanedUrl.includes('example.com')) {
  console.log(chalk.green(`✓ 通过 - URL 清理正常`));
  passed++;
} else {
  console.log(chalk.red(`✗ 失败 - 清理结果：${cleanedUrl}`));
  failed++;
}
console.log();

// 总结
console.log(chalk.cyan('════════════════════════════════════════════════════════════'));
console.log(chalk.cyan('  测试结果汇总'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

const total = passed + failed;
console.log(chalk.white(`  总测试数：${total}`));
console.log(chalk.green(`  通过：${passed}`));
if (failed > 0) {
  console.log(chalk.red(`  失败：${failed}`));
}
console.log(chalk.gray(`  通过率：${((passed / total) * 100).toFixed(1)}%\n`));

if (failed === 0) {
  console.log(chalk.green('  🎉 所有测试通过！\n'));
} else {
  console.log(chalk.yellow(`  ⚠️  有 ${failed} 个测试失败\n`));
}

console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

process.exit(failed > 0 ? 1 : 0);
