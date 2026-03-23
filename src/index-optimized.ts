#!/usr/bin/env node

/**
 * MCP Diagnoser - 性能优化启动脚本
 * 使用延迟加载和并行初始化加速启动
 */

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

const version = '3.0.0';
const perfMetrics = { startTime: Date.now(), moduleLoadTime: {} as Record<string, number> };

// 延迟加载模块缓存
const lazyModules: Record<string, any> = {};

async function lazyImport(moduleName: string, importFn: () => Promise<any>) {
  const start = Date.now();
  if (lazyModules[moduleName]) return lazyModules[moduleName];
  const module = await importFn();
  lazyModules[moduleName] = module;
  perfMetrics.moduleLoadTime[moduleName] = Date.now() - start;
  return module;
}

program
  .name('mcp-diagnoser')
  .version(version)
  .description('High-performance MCP diagnostic tool')
  .option('-c, --config <path>', 'Path to MCP config file', '.mcp.json')
  .option('-v, --verbose', 'Verbose output', false)
  .option('-j, --json', 'Output results as JSON', false)
  .option('--fast', 'Fast mode - skip package and runtime checks', false)
  .option('--profile', 'Show performance profile', false)
  .option('--no-cache', 'Disable cache', false);

program
  .command('check')
  .description('Check all MCP servers for issues')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent.opts();
    if (globalOpts.profile) showPerformanceProfile();
    await runDiagnosis(globalOpts);
  });

program
  .command('fast-check')
  .description('Quick check with cache (fastest)')
  .action(runFastCheck);

program
  .command('warmup')
  .description('Warmup cache for faster subsequent runs')
  .action(warmupCache);

program
  .command('profile')
  .description('Run performance profile')
  .action(runPerformanceProfile);

program
  .command('server <name>')
  .description('Diagnose a specific MCP server')
  .action(async (name, options, cmd) => {
    await runDiagnosis(cmd.parent.opts(), name);
  });

program.parse(process.argv);

async function runDiagnosis(options: any, serverName?: string) {
  const spinner = ora('Initializing...').start();
  try {
    const { MCPDiagnoser } = await lazyImport('diagnoser', () => import('./core/diagnoser.js'));
    spinner.text = 'Loading configuration...';
    const diagnoser = new MCPDiagnoser(options.config);
    const config = await diagnoser.loadConfig();
    
    if (!config) {
      spinner.fail('No MCP configuration found');
      console.log(chalk.yellow('\nNo MCP configuration file found.'));
      process.exit(1);
    }

    spinner.text = options.fast ? 'Quick scan...' : 'Analyzing...';
    const results = serverName
      ? await diagnoser.diagnoseServer(serverName, config, options.fast)
      : await diagnoser.diagnoseAll(config, options.fast);

    spinner.succeed('Diagnosis complete');

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      if ('servers' in results) {
        diagnoser.printReport(results, options.verbose);
      }
    }

    process.exit('hasIssues' in results ? (results.hasIssues ? 1 : 0) : 0);
  } catch (error) {
    spinner.fail('Diagnosis failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function runFastCheck() {
  const spinner = ora('Running fast check...').start();
  try {
    const { MCPDiagnoser } = await import('./core/diagnoser.js');
    const diagnoser = new MCPDiagnoser('.mcp.json');
    const config = await diagnoser.loadConfig();
    if (!config) { spinner.fail('No configuration found'); process.exit(1); }

    const results = await diagnoser.diagnoseAll(config, true);
    spinner.succeed('Fast check complete');
    diagnoser.printReport(results, false);
    process.exit(results.hasIssues ? 1 : 0);
  } catch (error) {
    spinner.fail('Fast check failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function warmupCache() {
  const spinner = ora('Warming up cache...').start();
  try {
    const { MCPDiagnoser } = await import('./core/diagnoser.js');
    const diagnoser = new MCPDiagnoser('.mcp.json');
    const config = await diagnoser.loadConfig();
    if (config) await diagnoser.diagnoseAll(config, true);

    spinner.succeed('Cache warmed up');
    console.log(chalk.green('\nSubsequent runs will be faster!'));
    console.log(chalk.cyan('\n⏱️  Load Times:'));
    Object.entries(perfMetrics.moduleLoadTime).forEach(([name, time]) => {
      console.log(chalk.gray(`  ${name}: ${time}ms`));
    });
  } catch (error) {
    spinner.fail('Warmup failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function showPerformanceProfile() {
  const totalTime = Date.now() - perfMetrics.startTime;
  console.log(chalk.cyan('\n⏱️  Performance Profile'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.gray(`  Total: ${totalTime}ms`));
  Object.entries(perfMetrics.moduleLoadTime).forEach(([name, time]) => {
    console.log(chalk.gray(`  ${name}: ${time}ms`));
  });
  console.log(chalk.gray('─'.repeat(60)));
}

async function runPerformanceProfile() {
  console.log(chalk.cyan('⏱️  MCP Diagnoser Performance Profile'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const startTime = Date.now();
  console.log(chalk.yellow('\n📊 Cold Start Test'));
  const coldStartStart = Date.now();
  
  const { cache } = await import('./utils/cache.js');
  await cache.clear();
  
  const moduleLoadStart = Date.now();
  await import('./core/diagnoser.js');
  const moduleLoadTime = Date.now() - moduleLoadStart;
  
  const coldStartTime = Date.now() - coldStartStart;
  console.log(chalk.gray(`  Cold start: ${coldStartTime}ms`));
  console.log(chalk.gray(`  Module loading: ${moduleLoadTime}ms`));
  
  console.log(chalk.yellow('\n📊 Hot Start Test (with cache)'));
  const hotStartStart = Date.now();
  
  const diagnoser = new (await import('./core/diagnoser.js')).MCPDiagnoser('.mcp.json');
  const config = await diagnoser.loadConfig();
  if (config) await diagnoser.diagnoseAll(config, true);
  
  const hotStartTime = Date.now() - hotStartStart;
  console.log(chalk.gray(`  Hot start: ${hotStartTime}ms`));
  console.log(chalk.gray(`  Speedup: ${(coldStartTime / hotStartTime).toFixed(2)}x faster`));
  
  console.log(chalk.yellow('\n📊 Cache Statistics'));
  const cacheStats = cache.getStats();
  console.log(chalk.gray(`  Enabled: ${cacheStats.enabled}`));
  console.log(chalk.gray(`  Memory entries: ${cacheStats.memoryEntries}`));
  console.log(chalk.gray(`  Hit rate: ${cacheStats.hitRate.toFixed(1)}%`));
  
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.green(`\nProfile completed in ${Date.now() - startTime}ms`));
}
