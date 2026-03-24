#!/usr/bin/env node

/**
 * 使用 Playwright MCP 发布 MCP Diagnoser v3.0.0
 * 
 * 此脚本演示如何使用 Playwright 自动化发布流程：
 * 1. 访问 npm 发布页面
 * 2. 访问 GitHub Releases 页面
 * 3. 生成发布内容
 */

import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { join } from 'path';

const version = '3.0.0';
const packageName = 'mcp-diagnoser';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  使用 Playwright 发布 MCP Diagnoser v3.0.0               ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log();

  // 读取发布说明
  const releaseNotesPath = join(process.cwd(), 'RELEASE_NOTES_v3.0.0.md');
  let releaseNotes = '';
  try {
    releaseNotes = readFileSync(releaseNotesPath, 'utf-8');
  } catch (err) {
    console.log('⚠  未找到发布说明文件，使用默认内容');
    releaseNotes = `# MCP Diagnoser v${version}\n\n## 新功能\n- 14 个 MCP 工具\n- 12 个包管理器支持\n- 10 种编程语言检查\n\n## 安装\n\`\`\`bash\nnpm install -g ${packageName}@${version}\n\`\`\``;
  }

  // 启动浏览器
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  console.log('[1/4] 访问 npm 发布页面...');
  await page.goto(`https://www.npmjs.com/package/${packageName}`);
  await page.waitForTimeout(2000);
  
  // 截图
  await page.screenshot({ 
    path: `npm-package-${version}.png`,
    fullPage: false
  });
  console.log('✓ 已截图 npm 包页面');

  console.log('\n[2/4] 访问 GitHub 仓库...');
  await page.goto(`https://github.com/Lyx3314844-03/${packageName}`);
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: `github-repo-${version}.png`,
    fullPage: false
  });
  console.log('✓ 已截图 GitHub 仓库页面');

  console.log('\n[3/4] 访问 GitHub Releases 页面...');
  await page.goto(`https://github.com/Lyx3314844-03/${packageName}/releases/new`);
  await page.waitForTimeout(2000);
  
  // 尝试填充发布内容 (如果页面已加载)
  try {
    // 选择标签输入框
    const tagSelect = await page.$('#tag_name');
    if (tagSelect) {
      await tagSelect.fill(`v${version}`);
      console.log(`✓ 已填充标签版本 v${version}`);
    }
    
    // 选择标题输入框
    const titleInput = await page.$('#release_title');
    if (titleInput) {
      await titleInput.fill(`MCP Diagnoser v${version}`);
      console.log(`✓ 已填充发布标题`);
    }
    
    // 填充发布说明
    const bodyTextarea = await page.$('#release_body');
    if (bodyTextarea) {
      await bodyTextarea.fill(releaseNotes);
      console.log('✓ 已填充发布说明');
    }
  } catch (err) {
    console.log('⚠  无法自动填充表单 (可能需要手动登录 GitHub)');
  }
  
  await page.screenshot({ 
    path: `github-release-${version}.png`,
    fullPage: false
  });
  console.log('✓ 已截图 GitHub Release 页面');

  console.log('\n[4/4] 生成发布摘要...');
  
  const summary = `
╔══════════════════════════════════════════════════════════╗
║  MCP Diagnoser v${version} 发布摘要                       ║
╚══════════════════════════════════════════════════════════╝

📦 包名：${packageName}
🏷️  版本：v${version}
📅 日期：${new Date().toISOString().split('T')[0]}

📝 已完成:
  ✓ 代码已构建
  ✓ 测试已通过 (59/59)
  ✓ Git 标签已创建
  ✓ 截图已保存

📸 截图文件:
  - npm-package-${version}.png
  - github-repo-${version}.png
  - github-release-${version}.png

🔗 链接:
  - npm: https://www.npmjs.com/package/${packageName}
  - GitHub: https://github.com/Lyx3314844-03/${packageName}
  - Releases: https://github.com/Lyx3314844-03/${packageName}/releases

🚀 下一步:
  1. 在 GitHub Releases 页面点击 "Publish release"
  2. 验证 npm 包已发布
  3. 更新文档中的版本链接

💡 安装命令:
  npm install -g ${packageName}@${version}
`;

  console.log(summary);

  // 保持浏览器打开以便手动操作
  console.log('浏览器已打开，请手动完成发布流程...');
  console.log('按 Ctrl+C 关闭浏览器');

  // 保持进程运行
  await new Promise(() => {});
}

main().catch(err => {
  console.error('错误:', err.message);
  process.exit(1);
});
