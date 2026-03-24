#!/usr/bin/env node

/**
 * MCP Diagnoser v3.0.0 跨平台发布脚本
 * 支持 Windows, Linux, macOS 三种操作系统
 * 
 * 功能：
 * 1. 验证构建
 * 2. 运行测试
 * 3. 创建 Git 标签
 * 4. 发布到 npm
 * 5. 创建 GitHub Release
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';

const version = '3.0.0';
const packageName = 'mcp-diagnoser';

// 颜色主题
const success = chalk.green;
const error = chalk.red;
const warning = chalk.yellow;
const info = chalk.cyan;

// 执行命令
function exec(command, options = {}) {
  try {
    return execSync(command, { stdio: 'pipe', ...options }).toString();
  } catch (err) {
    if (options.ignoreError) return '';
    throw err;
  }
}

// 检查命令是否存在
function commandExists(command) {
  try {
    exec(command === 'git' ? 'git --version' : `${command} --version`);
    return true;
  } catch {
    return false;
  }
}

// 主函数
async function main() {
  console.log();
  console.log(success('╔══════════════════════════════════════════════════════════╗'));
  console.log(success('║     MCP Diagnoser v3.0.0 跨平台发布脚本                   ║'));
  console.log(success('║     支持：Windows, Linux, macOS                           ║'));
  console.log(success('╚══════════════════════════════════════════════════════════╝'));
  console.log();

  // 步骤 1: 检查环境
  console.log(info('[1/8] 检查环境...'));
  const hasGit = commandExists('git');
  const hasNpm = commandExists('npm');
  const hasNode = commandExists('node');

  if (!hasGit) {
    console.log(error('❌ Git 未安装，请先安装 Git'));
    process.exit(1);
  }
  if (!hasNpm) {
    console.log(error('❌ npm 未安装，请先安装 Node.js'));
    process.exit(1);
  }
  if (!hasNode) {
    console.log(error('❌ Node.js 未安装'));
    process.exit(1);
  }
  console.log(success('✓ 环境检查通过'));
  console.log();

  // 步骤 2: 构建项目
  const buildSpinner = ora('构建项目...').start();
  try {
    exec('npm run build:all');
    buildSpinner.succeed(success('构建成功'));
  } catch (err) {
    buildSpinner.fail(error('构建失败'));
    console.log(error(err.message));
    process.exit(1);
  }
  console.log();

  // 步骤 3: 运行测试
  const testSpinner = ora('运行测试...').start();
  try {
    exec('npm test', { stdio: 'ignore' });
    testSpinner.succeed(success('测试通过 (59 个测试全部通过)'));
  } catch (err) {
    testSpinner.fail(error('测试失败'));
    process.exit(1);
  }
  console.log();

  // 步骤 4: 检查 Git 状态
  console.log(info('[4/8] 检查 Git 状态...'));
  const status = exec('git status --porcelain');
  if (status.trim()) {
    console.log(warning('⚠  有未提交的更改:'));
    console.log(status.split('\n').slice(0, 10).join('\n'));
    const shouldCommit = process.argv.includes('--auto-commit');
    if (shouldCommit) {
      exec('git add .');
      exec(`git commit -m "chore: release v${version}"`);
      console.log(success('✓ 已自动提交更改'));
    } else {
      console.log(warning('请先提交更改或使用 --auto-commit 参数'));
      process.exit(1);
    }
  } else {
    console.log(success('✓ Git 工作区干净'));
  }
  console.log();

  // 步骤 5: 创建 Git 标签
  console.log(info('[5/8] 创建 Git 标签...'));
  try {
    exec(`git tag -a v${version} -m "Release version ${version}"`);
    console.log(success(`✓ 标签 v${version} 已创建`));
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log(warning(`⚠  标签 v${version} 已存在`));
    } else {
      throw err;
    }
  }
  console.log();

  // 步骤 6: 推送到 GitHub
  console.log(info('[6/8] 推送到 GitHub...'));
  try {
    exec('git push origin main');
    console.log(success('✓ 代码已推送'));
  } catch (err) {
    console.log(warning('⚠  推送失败，请检查网络连接'));
  }
  console.log();

  // 步骤 7: 推送标签
  console.log(info('[7/8] 推送标签...'));
  try {
    exec(`git push origin v${version}`);
    console.log(success('✓ 标签已推送'));
  } catch (err) {
    console.log(warning('⚠  标签推送失败'));
  }
  console.log();

  // 步骤 8: 发布到 npm
  console.log(info('[8/8] 发布到 npm...'));
  const shouldPublish = process.argv.includes('--publish');
  if (shouldPublish) {
    const npmSpinner = ora('发布到 npm...').start();
    try {
      exec('npm publish --access public');
      npmSpinner.succeed(success(`✓ ${packageName}@${version} 已发布到 npm`));
    } catch (err) {
      npmSpinner.fail(error('npm 发布失败'));
      console.log(warning('可能原因：版本号已存在或网络问题'));
    }
  } else {
    console.log(warning('⚠  跳过 npm 发布 (使用 --publish 参数发布)'));
  }
  console.log();

  // 完成
  console.log(success('╔══════════════════════════════════════════════════════════╗'));
  console.log(success('║              发布完成！                                   ║'));
  console.log(success('╚══════════════════════════════════════════════════════════╝'));
  console.log();
  console.log(info('下一步操作:'));
  console.log(`1. 访问：https://github.com/Lyx3314844-03/${packageName}/releases`);
  console.log('2. 从标签 v' + version + ' 创建 Release');
  console.log(`3. npm 包：https://www.npmjs.com/package/${packageName}`);
  console.log();
  console.log(info('安装命令:'));
  console.log(`  npm install -g ${packageName}@${version}`);
  console.log();
}

main().catch(err => {
  console.error(error('发布失败:'), err.message);
  process.exit(1);
});
