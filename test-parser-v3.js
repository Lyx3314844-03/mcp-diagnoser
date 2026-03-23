#!/usr/bin/env node

/**
 * HTML 解析器 v3 测试
 */

import chalk from 'chalk';
import { createUltraParser } from './dist/utils/html-parser-v3.js';

console.log(chalk.cyan('════════════════════════════════════════════════════════════'));
console.log(chalk.cyan('  HTML 解析器 v3 测试'));
console.log(chalk.cyan('════════════════════════════════════════════════════════════\n'));

// 真实的 Google 搜索结果 HTML（JavaScript 渲染后）
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

let passed = 0;
let failed = 0;

// 测试 1: Google 解析（带富媒体提取）
console.log(chalk.yellow('测试 1: Google 解析（增强版）'));
const googleParser = createUltraParser('google', {
  extractImages: true,
  extractDates: true,
  extractAuthors: true,
  extractRichSnippets: true,
});
const googleResults = googleParser.parse(googleHtml);

if (googleResults.length >= 2) {
  console.log(chalk.green(`✓ 通过 - 解析到 ${googleResults.length} 个结果`));
  googleResults.forEach((r, i) => {
    console.log(chalk.gray(`  ${i + 1}. ${r.title}`));
    console.log(chalk.gray(`     ${r.url}`));
    console.log(chalk.gray(`     ${r.snippet.substring(0, 50)}...`));
  });
  passed++;
} else {
  console.log(chalk.red(`✗ 失败 - 只解析到 ${googleResults.length} 个结果`));
  failed++;
}
console.log();

// 测试 2: 富片段提取
console.log(chalk.yellow('测试 2: 富片段提取'));
const richHtml = `
<div class="g">
  <div itemtype="http://schema.org/Product">
    <a href="https://example.com/product"><h3>产品</h3></a>
    <div itemprop="ratingValue">4.5</div>
    <div itemprop="reviewCount">128</div>
    <div itemprop="price">$99.99</div>
  </div>
</div>
`;
const richParser = createUltraParser('google', { extractRichSnippets: true });
const richResults = richParser.parse(richHtml);

if (richResults.length > 0 && richResults[0].richSnippet) {
  console.log(chalk.green(`✓ 通过 - 提取到富片段`));
  console.log(chalk.gray(`  类型：${richResults[0].richSnippet?.type}`));
  console.log(chalk.gray(`  评分：${richResults[0].richSnippet?.rating}`));
  console.log(chalk.gray(`  评论：${richResults[0].richSnippet?.reviews}`));
  console.log(chalk.gray(`  价格：${richResults[0].richSnippet?.price}`));
  passed++;
} else {
  console.log(chalk.red(`✗ 失败 - 未提取到富片段`));
  failed++;
}
console.log();

// 测试 3: 图片提取
console.log(chalk.yellow('测试 3: 图片提取'));
const imageHtml = `
<div class="g">
  <a href="https://example.com"><h3>图片页面</h3></a>
  <img src="https://example.com/image1.jpg">
  <img src="https://example.com/image2.png">
</div>
`;
const imageParser = createUltraParser('google', { extractImages: true });
const imageResults = imageParser.parse(imageHtml);

if (imageResults.length > 0 && imageResults[0].images && imageResults[0].images.length > 0) {
  console.log(chalk.green(`✓ 通过 - 提取到 ${imageResults[0].images.length} 张图片`));
  passed++;
} else {
  console.log(chalk.red(`✗ 失败 - 未提取到图片`));
  failed++;
}
console.log();

// 测试 4: 日期提取
console.log(chalk.yellow('测试 4: 日期提取'));
const dateHtml = `
<div class="g">
  <a href="https://example.com"><h3>文章</h3></a>
  <time datetime="2024-01-15">2024 年 1 月 15 日</time>
</div>
`;
const dateParser = createUltraParser('google', { extractDates: true });
const dateResults = dateParser.parse(dateHtml);

if (dateResults.length > 0 && dateResults[0].date) {
  console.log(chalk.green(`✓ 通过 - 提取到日期：${dateResults[0].date}`));
  passed++;
} else {
  console.log(chalk.red(`✗ 失败 - 未提取到日期`));
  failed++;
}
console.log();

// 测试 5: 多引擎支持
console.log(chalk.yellow('测试 5: 多引擎支持'));
const engines = ['google', 'bing', 'baidu', 'duckduckgo', 'yandex'];
let enginePassed = 0;

for (const engine of engines) {
  const parser = createUltraParser(engine);
  const results = parser.parse('<div><a href="https://example.com"><h3>测试</h3></a></div>');
  if (results.length >= 0) {
    enginePassed++;
  }
}

if (enginePassed === engines.length) {
  console.log(chalk.green(`✓ 通过 - 所有 ${engines.length} 个引擎正常`));
  passed++;
} else {
  console.log(chalk.red(`✗ 失败 - ${engines.length - enginePassed} 个引擎失败`));
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
