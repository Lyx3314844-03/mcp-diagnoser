#!/usr/bin/env node

/**
 * MCP Diagnoser - Comprehensive diagnostic tool for MCP servers
 * Supports 10 mainstream programming languages:
 * JavaScript/TypeScript, Python, Java, Go, Rust, C#, Ruby, PHP, Swift, Kotlin
 */

import { program } from 'commander';
import { MCPDiagnoser } from './core/diagnoser.js';
import { MCPSearcher, PlaywrightDiagnoser } from './tools/mcp-searcher.js';
import { BrowserSearcher, SEARCH_ENGINES } from './tools/browser-search.js';
import { WebCrawler } from './tools/web-crawler.js';
import { PackageDiagnoser } from './tools/package-diagnoser.js';
import { EnhancedSearcher, multiSearch, smartSearch, showCacheStats, clearCache } from './tools/enhanced-search.js';
import { firecrawlSearch } from './tools/firecrawl-search.js';
import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';

const version = '1.3.0';

program
  .name('mcp-diagnoser')
  .version(version)
  .description('Comprehensive MCP diagnostic tool for installation, dependency, connection and error troubleshooting')
  .option('-c, --config <path>', 'Path to MCP config file', '.mcp.json')
  .option('-l, --language <lang>', 'Specific language to check (all by default)')
  .option('-v, --verbose', 'Verbose output', false)
  .option('-j, --json', 'Output results as JSON', false)
  .option('--fix', 'Auto-fix detected issues', false)
  .option('--deep', 'Perform deep diagnostic scan', false);

// Diagnosis commands
program
  .command('check')
  .description('Check all MCP servers for issues')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await runDiagnosis(globalOpts);
  });

program
  .command('server <name>')
  .description('Diagnose a specific MCP server')
  .action(async (name, options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await runDiagnosis(globalOpts, name);
  });

program
  .command('languages')
  .description('Check installed language runtimes and tools')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await checkLanguages(globalOpts);
  });

program
  .command('fix-all')
  .description('Auto-fix all detected issues')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await runDiagnosis({ ...globalOpts, fix: true });
  });

// Search commands
program
  .command('search <query>')
  .description('Search for MCP packages on npm and GitHub')
  .option('-s, --source <source>', 'Search source: npm, github, or all', 'all')
  .option('-n, --limit <number>', 'Maximum results', '20')
  .action(async (query, options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await searchPackages(query, { ...globalOpts, ...options });
  });

program
  .command('popular')
  .description('Show popular/official MCP packages')
  .option('-n, --limit <number>', 'Maximum results', '30')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await showPopularPackages({ ...globalOpts, ...options });
  });

program
  .command('install <package>')
  .description('Install an MCP package')
  .option('-g, --global', 'Install globally', false)
  .action(async (packageName, options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await installPackage(packageName, { ...globalOpts, ...options });
  });

// Playwright commands
program
  .command('playwright')
  .description('Diagnose Playwright installation and browsers')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await diagnosePlaywright(globalOpts);
  });

program
  .command('playwright-install')
  .description('Install Playwright browsers')
  .option('--browsers <browsers>', 'Browsers to install (comma-separated)', 'chromium,firefox,webkit')
  .option('--with-deps', 'Install system dependencies (Linux only)', false)
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await installPlaywright({ ...globalOpts, ...options });
  });

// Package diagnosis commands
program
  .command('packages')
  .description('Diagnose all packages used by MCP servers')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await diagnosePackages(globalOpts);
  });

program
  .command('package <name>')
  .description('Diagnose a specific package')
  .option('-m, --manager <manager>', 'Package manager (npm, pip, cargo, etc.)')
  .action(async (packageName, options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await diagnosePackage(packageName, { ...globalOpts, ...options });
  });

program
  .command('package-managers')
  .description('List all available package managers')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await listPackageManagers(globalOpts);
  });

program
  .command('install-missing')
  .description('Install all missing packages from MCP configuration')
  .option('-f, --force', 'Force installation without confirmation', false)
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await installMissingPackages({ ...globalOpts, ...options });
  });

// Search commands
program
  .command('web-search <query>')
  .description('Search the web using various search engines')
  .option('-e, --engine <engine>', 'Search engine (google, bing, baidu, duckduckgo, etc.)', 'google')
  .option('-n, --limit <number>', 'Maximum results', '10')
  .option('-l, --language <lang>', 'Language preference', 'en')
  .option('-r, --region <region>', 'Region preference', '')
  .option('-t, --time-range <range>', 'Time range (past_hour, past_day, past_week, past_month, past_year)', '')
  .option('-s, --site <site>', 'Search within specific site', '')
  .option('--filetype <type>', 'Search for specific file type', '')
  .option('--exact', 'Exact match search', false)
  .option('--verbose', 'Show snippets', false)
  .action(async (query, options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await webSearch(query, { ...globalOpts, ...options });
  });

program
  .command('search-engines')
  .description('List all available search engines')
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await listSearchEngines(globalOpts);
  });

program
  .command('crawl <url>')
  .description('Crawl a website and extract content')
  .option('--max-pages <number>', 'Maximum pages to crawl', '20')
  .option('--max-depth <number>', 'Maximum crawl depth', '3')
  .option('--same-domain', 'Only crawl same domain', true)
  .option('--exclude <patterns>', 'Exclude URL patterns (comma-separated)', '')
  .option('--delay <ms>', 'Delay between requests (ms)', '500')
  .action(async (url, options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await crawlWebsite(url, { ...globalOpts, ...options });
  });

program
  .command('search-content <url> <query>')
  .description('Search for content within a crawled website')
  .option('--case-sensitive', 'Case sensitive search', false)
  .option('--whole-word', 'Match whole words only', false)
  .option('--regex', 'Use regex pattern', false)
  .option('--context <lines>', 'Lines of context', '2')
  .action(async (url, query, options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await searchWebsiteContent(url, query, { ...globalOpts, ...options });
  });

program
  .command('extract-info <url>')
  .description('Extract emails, phone numbers, and other info from a website')
  .option('--emails', 'Extract email addresses', false)
  .option('--phones', 'Extract phone numbers', false)
  .option('--links', 'Extract all links', false)
  .option('--all', 'Extract everything', false)
  .action(async (url, options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await extractWebsiteInfo(url, { ...globalOpts, ...options });
  });

// Enhanced Search commands (NEW!)
program
  .command('multi-search <query>')
  .description('Search across multiple engines simultaneously')
  .option('-e, --engines <engines>', 'Comma-separated list of engines (e.g., google,bing,duckduckgo)', '')
  .option('-n, --limit <number>', 'Maximum total results', '20')
  .option('--max-per-engine <number>', 'Maximum results per engine', '10')
  .option('--no-deduplicate', 'Disable result deduplication')
  .option('--sort-by <sort>', 'Sort by: relevance, date, engine, position', 'relevance')
  .option('--timeout <ms>', 'Timeout per engine in ms', '10000')
  .option('--cache', 'Enable result caching', true)
  .option('--cache-ttl <seconds>', 'Cache TTL in seconds', '3600')
  .option('--verbose', 'Show detailed output', false)
  .action(async (query, options, cmd) => {
    const globalOpts = cmd.parent.opts();
    const engines = options.engines ? options.engines.split(',') : undefined;
    await multiSearch(query, { 
      ...globalOpts, 
      ...options,
      engines,
    });
  });

program
  .command('smart-search <query>')
  .description('Intelligent search with automatic engine selection')
  .option('--query-type <type>', 'Query type: general, code, academic, news, video, auto', 'auto')
  .option('--no-auto-engines', 'Disable automatic engine selection')
  .option('--language-priority <langs>', 'Language priority (comma-separated, e.g., en,zh)', '')
  .option('-n, --limit <number>', 'Maximum results', '20')
  .option('--verbose', 'Show detailed output', false)
  .action(async (query, options, cmd) => {
    const globalOpts = cmd.parent.opts();
    const languagePriority = options.languagePriority ? options.languagePriority.split(',') : undefined;
    await smartSearch(query, {
      ...globalOpts,
      ...options,
      languagePriority,
    });
  });

program
  .command('search-cache')
  .description('Search cache management')
  .option('--stats', 'Show cache statistics', false)
  .option('--clear', 'Clear all cached results', false)
  .action(async (options, cmd) => {
    const globalOpts = cmd.parent.opts();
    
    if (options.clear) {
      await clearCache();
    } else if (options.stats || !options.clear) {
      await showCacheStats();
    }
  });

program
  .command('firecrawl-search <query>')
  .description('Search using Firecrawl API for better results')
  .option('-n, --limit <number>', 'Maximum results', '10')
  .option('-l, --lang <lang>', 'Language preference', 'zh')
  .option('-c, --country <country>', 'Country preference', 'cn')
  .action(async (query, options, cmd) => {
    const globalOpts = cmd.parent.opts();
    await firecrawlSearch(query, { ...globalOpts, ...options });
  });

program.parse(process.argv);

async function runDiagnosis(options: any, serverName?: string) {
  const spinner = ora('Initializing MCP Diagnoser...').start();
  
  try {
    const diagnoser = new MCPDiagnoser(options.config);
    spinner.text = 'Loading MCP configuration...';
    
    const config = await diagnoser.loadConfig();
    if (!config) {
      spinner.fail('No MCP configuration found');
      console.log(chalk.yellow('\nNo MCP configuration file found.'));
      console.log('Please create a .mcp.json or mcp.json file in your home directory.');
      process.exit(1);
    }
    
    spinner.text = 'Analyzing MCP servers...';
    
    const results = serverName 
      ? await diagnoser.diagnoseServer(serverName, config)
      : await diagnoser.diagnoseAll(config);
    
    spinner.succeed('Diagnosis complete');
    
    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      if ('servers' in results) {
        diagnoser.printReport(results, options.verbose);
      } else {
        // Single server result
        const report = {
          timestamp: new Date().toISOString(),
          summary: {
            total: 1,
            ok: results.status === 'ok' ? 1 : 0,
            warning: results.status === 'warning' ? 1 : 0,
            error: results.status === 'error' || results.status === 'unknown' ? 1 : 0,
          },
          servers: [results],
          languageRuntimes: {},
          hasIssues: results.status !== 'ok',
        };
        diagnoser.printReport(report, options.verbose);
      }
    }
    
    if (options.fix && 'servers' in results) {
      await diagnoser.applyFixes(results);
    }
    
    process.exit('hasIssues' in results ? (results.hasIssues ? 1 : 0) : 0);
  } catch (error) {
    spinner.fail('Diagnosis failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    if (options.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

async function checkLanguages(options: any) {
  const spinner = ora('Checking language runtimes...').start();
  
  try {
    const diagnoser = new MCPDiagnoser(options.config);
    const results = await diagnoser.checkAllLanguages();
    
    spinner.succeed('Language check complete');
    
    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log('\n' + chalk.bold.cyan('═'.repeat(60)));
      console.log(chalk.bold.cyan('  Language Runtime Check'));
      console.log(chalk.bold.cyan('═'.repeat(60)) + '\n');
      
      const tableData = Object.entries(results).map(([name, runtime]: [string, any]) => [
        name,
        runtime.available ? chalk.green('✓') : chalk.red('✗'),
        runtime.version || 'N/A',
        runtime.path || 'Not found',
      ]);
      
      console.log(
        require('table').table([['Language', 'Status', 'Version', 'Path'], ...tableData])
      );
      
      const available = Object.values(results).filter((r: any) => r.available).length;
      const total = Object.keys(results).length;
      
      console.log(chalk.green(`\n  ${available}/${total} languages available\n`));
    }
    
    process.exit(0);
  } catch (error) {
    spinner.fail('Language check failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function searchPackages(query: string, options: any) {
  const spinner = ora(`Searching for MCP packages: ${query}...`).start();
  
  try {
    const searcher = new MCPSearcher();
    const source = options.source || 'all';
    const limit = parseInt(options.limit) || 20;

    let results;
    if (source === 'npm') {
      results = await searcher.searchNPM(query, limit);
    } else if (source === 'github') {
      results = await searcher.searchGitHub(query, limit);
    } else {
      // Search both
      const [npmResults, githubResults] = await Promise.all([
        searcher.searchNPM(query, limit / 2),
        searcher.searchGitHub(query, limit / 2),
      ]);
      results = {
        query,
        total: npmResults.total + githubResults.total,
        packages: [...npmResults.packages, ...githubResults.packages].slice(0, limit),
      };
    }

    spinner.succeed(`Found ${results.total} packages`);
    searcher.printResults(results);

    process.exit(0);
  } catch (error) {
    spinner.fail('Search failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function showPopularPackages(options: any) {
  const spinner = ora('Fetching popular MCP packages...').start();
  
  try {
    const searcher = new MCPSearcher();
    const limit = parseInt(options.limit) || 30;
    
    const packages = await searcher.getPopularPackages(limit);
    
    spinner.succeed(`Found ${packages.length} popular packages`);
    
    console.log(chalk.bold.cyan('\n═'.repeat(60)));
    console.log(chalk.bold.cyan('  Popular MCP Packages'));
    console.log(chalk.bold.cyan('═'.repeat(60)) + '\n');

    for (const pkg of packages) {
      console.log(chalk.bold.green(`  ${pkg.name}`));
      console.log(chalk.gray(`    ${pkg.description}`));
      if (pkg.version) {
        console.log(chalk.blue(`    Version: ${pkg.version}`));
      }
      console.log();
    }

    process.exit(0);
  } catch (error) {
    spinner.fail('Failed to fetch packages');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function installPackage(packageName: string, options: any) {
  const spinner = ora(`Installing ${packageName}...`).start();
  
  try {
    const searcher = new MCPSearcher();
    const result = await searcher.installPackage(packageName, options.global);
    
    if (result.success) {
      spinner.succeed(result.message);
    } else {
      spinner.fail(result.message);
      process.exit(1);
    }
  } catch (error) {
    spinner.fail('Installation failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function diagnosePlaywright(options: any) {
  const spinner = ora('Diagnosing Playwright...').start();
  
  try {
    const diagnoser = new PlaywrightDiagnoser();
    const result = await diagnoser.diagnose();
    
    spinner.succeed('Diagnosis complete');
    diagnoser.printDiagnosis(result);

    process.exit(result.issues.length > 0 ? 1 : 0);
  } catch (error) {
    spinner.fail('Diagnosis failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function installPlaywright(options: any) {
  const spinner = ora('Installing Playwright browsers...').start();
  
  try {
    const diagnoser = new PlaywrightDiagnoser();
    const browsers = options.browsers ? options.browsers.split(',') : ['chromium', 'firefox', 'webkit'];
    
    const result = await diagnoser.install({
      browsers,
      withDeps: options.withDeps,
    });
    
    if (result.success) {
      spinner.succeed(result.message);
    } else {
      spinner.fail(result.message);
      process.exit(1);
    }
  } catch (error) {
    spinner.fail('Installation failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Search functions
async function webSearch(query: string, options: any) {
  const spinner = ora(`Searching ${options.engine || 'google'}...`).start();
  
  try {
    const searcher = new BrowserSearcher();
    
    const searchOptions = {
      engine: options.engine,
      limit: parseInt(options.limit) || 10,
      language: options.language,
      region: options.region || undefined,
      timeRange: options.timeRange || undefined,
      site: options.site || undefined,
      fileType: options.filetype || undefined,
      exactMatch: options.exact || false,
    };
    
    const results = await searcher.search(query, searchOptions);
    
    spinner.succeed(`Found ${results.total} results in ${results.searchTime}ms`);
    searcher.printResults(results, options.verbose);
    
    process.exit(0);
  } catch (error) {
    spinner.fail('Search failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function listSearchEngines(options: any) {
  const searcher = new BrowserSearcher();
  searcher.listEngines();
  process.exit(0);
}

async function crawlWebsite(url: string, options: any) {
  const spinner = ora(`Crawling ${url}...`).start();
  
  try {
    const crawler = new WebCrawler();
    
    const crawlOptions = {
      maxPages: parseInt(options.maxPages) || 20,
      maxDepth: parseInt(options.maxDepth) || 3,
      sameDomain: options.sameDomain !== false,
      excludePatterns: options.exclude ? options.exclude.split(',') : [],
      delay: parseInt(options.delay) || 500,
    };
    
    const results = await crawler.crawl(url, crawlOptions);
    
    spinner.succeed(`Crawled ${results.totalPages} pages in ${results.crawlTime}ms`);
    crawler.printResults(results);
    
    process.exit(0);
  } catch (error) {
    spinner.fail('Crawl failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function searchWebsiteContent(url: string, query: string, options: any) {
  const spinner = ora(`Crawling and searching ${url}...`).start();
  
  try {
    const crawler = new WebCrawler();
    
    // First crawl the website
    const crawlOptions = {
      maxPages: 20,
      maxDepth: 2,
      sameDomain: true,
      delay: 300,
    };
    
    const crawlResults = await crawler.crawl(url, crawlOptions);
    
    if (crawlResults.totalPages === 0) {
      spinner.fail('No pages crawled');
      process.exit(1);
    }
    
    spinner.text = 'Searching content...';
    
    // Then search within crawled content
    const searchOptions = {
      query,
      caseSensitive: options.caseSensitive || false,
      wholeWord: options.wholeWord || false,
      regex: options.regex || false,
      contextLines: parseInt(options.context) || 2,
    };
    
    const matches = crawler.searchContent(crawlResults, searchOptions);
    
    spinner.succeed(`Found ${matches.length} matches`);
    crawler.printMatches(matches, parseInt(options.context) || 2);
    
    process.exit(matches.length > 0 ? 0 : 1);
  } catch (error) {
    spinner.fail('Search failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function extractWebsiteInfo(url: string, options: any) {
  const spinner = ora(`Extracting information from ${url}...`).start();
  
  try {
    const crawler = new WebCrawler();
    
    // Crawl the homepage
    const crawlOptions = {
      maxPages: 5,
      maxDepth: 1,
      sameDomain: true,
      delay: 300,
    };
    
    const crawlResults = await crawler.crawl(url, crawlOptions);
    
    spinner.succeed(`Extracted information from ${crawlResults.totalPages} pages`);
    
    const extractEmails = options.emails || options.all;
    const extractPhones = options.phones || options.all;
    const extractLinks = options.links || options.all;
    
    if (extractEmails || options.all) {
      const emails = crawler.extractEmails(crawlResults);
      console.log(chalk.bold.cyan('\n═'.repeat(70)));
      console.log(chalk.bold.cyan('  Email Addresses'));
      console.log(chalk.bold.cyan('═'.repeat(70)));
      if (emails.length > 0) {
        emails.forEach(email => console.log(chalk.green(`  ✓ ${email}`)));
      } else {
        console.log(chalk.yellow('  No email addresses found'));
      }
    }
    
    if (extractPhones || options.all) {
      const phones = crawler.extractPhoneNumbers(crawlResults);
      console.log(chalk.bold.cyan('\n═'.repeat(70)));
      console.log(chalk.bold.cyan('  Phone Numbers'));
      console.log(chalk.bold.cyan('═'.repeat(70)));
      if (phones.length > 0) {
        phones.forEach(phone => console.log(chalk.green(`  ✓ ${phone}`)));
      } else {
        console.log(chalk.yellow('  No phone numbers found'));
      }
    }
    
    if (extractLinks || options.all) {
      const allLinks = new Set<string>();
      crawlResults.pages.forEach(page => {
        page.links.forEach(link => allLinks.add(link));
      });
      
      console.log(chalk.bold.cyan('\n═'.repeat(70)));
      console.log(chalk.bold.cyan(`  Links (${allLinks.size} found)`));
      console.log(chalk.bold.cyan('═'.repeat(70)));
      Array.from(allLinks).slice(0, 50).forEach(link => {
        console.log(chalk.cyan(`  → ${link}`));
      });
      if (allLinks.size > 50) {
        console.log(chalk.gray(`  ... and ${allLinks.size - 50} more links`));
      }
    }
    
    console.log();
    process.exit(0);
  } catch (error) {
    spinner.fail('Extraction failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Package diagnosis functions
async function diagnosePackages(options: any) {
  const spinner = ora('Diagnosing MCP packages...').start();

  try {
    const diagnoser = new MCPDiagnoser(options.config);
    spinner.text = 'Loading MCP configuration...';

    const config = await diagnoser.loadConfig();
    if (!config) {
      spinner.fail('No MCP configuration found');
      console.log(chalk.yellow('\nNo MCP configuration file found.'));
      process.exit(1);
    }

    spinner.text = 'Analyzing packages...';
    const packageDiagnosis = await diagnoser.diagnoseAllPackages(config);

    spinner.succeed(`Diagnosed ${packageDiagnosis.totalPackages} packages`);

    // Print results
    console.log(chalk.bold.cyan('\n═'.repeat(60)));
    console.log(chalk.bold.cyan('  MCP Package Diagnosis'));
    console.log(chalk.bold.cyan('═'.repeat(60)));

    console.log(chalk.bold('\n📊 Summary:'));
    console.log(`   Total Packages: ${packageDiagnosis.totalPackages}`);
    console.log(chalk.green(`   Installed: ${packageDiagnosis.installedPackages}`));
    console.log(chalk.red(`   Missing: ${packageDiagnosis.missingPackages.length}`));

    if (packageDiagnosis.missingPackages.length > 0) {
      console.log(chalk.bold.yellow('\n❌ Missing Packages:'));
      for (const pkg of packageDiagnosis.missingPackages) {
        console.log(chalk.yellow(`   • ${pkg}`));
      }

      console.log(chalk.bold.cyan('\n💡 Install with:'));
      for (const pkg of packageDiagnosis.missingPackages) {
        if (pkg.startsWith('@') || pkg.includes('/')) {
          console.log(chalk.cyan(`   npm install -g ${pkg}`));
        } else {
          console.log(chalk.cyan(`   pip install ${pkg} 或 npm install -g ${pkg}`));
        }
      }
    }

    if (packageDiagnosis.dependencyIssues.length > 0) {
      console.log(chalk.bold.yellow('\n⚠️  Dependency Issues:'));
      for (const issue of packageDiagnosis.dependencyIssues) {
        console.log(chalk.yellow(`   • ${issue.message}`));
        console.log(chalk.gray(`     → ${issue.suggestion}`));
      }
    }

    if (packageDiagnosis.packageDetails.length > 0) {
      console.log(chalk.bold('\n📦 Package Details:'));
      for (const pkg of packageDiagnosis.packageDetails) {
        const icon = pkg.installed ? chalk.green('✓') : chalk.red('✗');
        console.log(`   ${icon} ${pkg.name}${pkg.version ? chalk.gray(`@${pkg.version}`) : ''}`);
        if (pkg.issues.length > 0) {
          for (const issue of pkg.issues) {
            console.log(chalk.gray(`     ${issue}`));
          }
        }
      }
    }

    console.log();
    process.exit(packageDiagnosis.missingPackages.length > 0 ? 1 : 0);
  } catch (error) {
    spinner.fail('Diagnosis failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function diagnosePackage(packageName: string, options: any) {
  const spinner = ora(`Diagnosing package: ${packageName}...`).start();

  try {
    const packageDiagnoser = new PackageDiagnoser();
    const result = await packageDiagnoser.diagnosePackage(packageName, options.manager);

    spinner.succeed('Package diagnosis complete');

    console.log(chalk.bold.cyan('\n═'.repeat(60)));
    console.log(chalk.bold.cyan(`  Package: ${packageName}`));
    console.log(chalk.bold.cyan('═'.repeat(60)));

    const installedIcon = result.installed ? chalk.green('✓') : chalk.red('✗');
    console.log(`\n${installedIcon} Status: ${result.installed ? 'Installed' : 'Not Installed'}`);

    if (result.version) {
      console.log(chalk.blue(`   Version: ${result.version}`));
    }
    if (result.global !== undefined) {
      console.log(chalk.gray(`   Global: ${result.global ? 'Yes' : 'No'}`));
    }
    if (result.location) {
      console.log(chalk.gray(`   Location: ${result.location}`));
    }

    if (result.issues.length > 0) {
      console.log(chalk.bold.yellow('\n⚠️  Issues:'));
      for (const issue of result.issues) {
        console.log(chalk.yellow(`   • ${issue}`));
      }
    }

    if (!result.installed) {
      console.log(chalk.bold.cyan('\n💡 Suggestion:'));
      if (packageName.startsWith('@') || packageName.includes('/')) {
        console.log(chalk.cyan(`   npm install -g ${packageName}`));
      } else {
        console.log(chalk.cyan(`   pip install ${packageName} 或 npm install -g ${packageName}`));
      }
    }

    console.log();
    process.exit(result.installed ? 0 : 1);
  } catch (error) {
    spinner.fail('Diagnosis failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function listPackageManagers(options: any) {
  const spinner = ora('Checking package managers...').start();

  try {
    const packageDiagnoser = new PackageDiagnoser();
    const results = await packageDiagnoser.diagnoseAllPackageManagers();

    spinner.succeed('Package manager check complete');

    console.log(chalk.bold.cyan('\n═'.repeat(60)));
    console.log(chalk.bold.cyan('  Available Package Managers'));
    console.log(chalk.bold.cyan('═'.repeat(60)) + '\n');

    let availableCount = 0;
    for (const [name, manager] of results.entries()) {
      const icon = manager.available ? chalk.green('✓') : chalk.red('✗');
      console.log(`${icon} ${chalk.bold(name.padEnd(10))} ${manager.version ? chalk.gray(manager.version) : ''}`);
      if (manager.available) {
        availableCount++;
        console.log(chalk.gray(`     Install: ${manager.installCommand} <package>`));
      }
      console.log();
    }

    console.log(chalk.green(`\n  ${availableCount}/${results.size} package managers available\n`));
    process.exit(0);
  } catch (error) {
    spinner.fail('Check failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function installMissingPackages(options: any) {
  const spinner = ora('Finding missing packages...').start();

  try {
    const diagnoser = new MCPDiagnoser(options.config);
    spinner.text = 'Loading MCP configuration...';

    const config = await diagnoser.loadConfig();
    if (!config) {
      spinner.fail('No MCP configuration found');
      console.log(chalk.yellow('\nNo MCP configuration file found.'));
      process.exit(1);
    }

    spinner.text = 'Analyzing packages...';
    const packageDiagnosis = await diagnoser.diagnoseAllPackages(config);

    if (packageDiagnosis.missingPackages.length === 0) {
      spinner.succeed('No missing packages found');
      console.log(chalk.green('\n  All packages are installed!\n'));
      process.exit(0);
    }

    spinner.stop();
    console.log(chalk.bold.cyan('\n═'.repeat(60)));
    console.log(chalk.bold.cyan(`  Install ${packageDiagnosis.missingPackages.length} Missing Packages`));
    console.log(chalk.bold.cyan('═'.repeat(60)));

    console.log(chalk.yellow('\n  Packages to install:'));
    for (const pkg of packageDiagnosis.missingPackages) {
      console.log(chalk.yellow(`   • ${pkg}`));
    }

    if (!options.force) {
      console.log();
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>(resolve => {
        rl.question(chalk.cyan('  Continue installation? (y/n): '), resolve);
        rl.close();
      });

      if (answer.toLowerCase() !== 'y') {
        console.log(chalk.yellow('\n  Installation cancelled.\n'));
        process.exit(0);
      }
    }

    // Install packages
    console.log(chalk.bold('\n📦 Installing packages...\n'));
    let successCount = 0;
    let failCount = 0;

    for (const pkg of packageDiagnosis.missingPackages) {
      process.stdout.write(chalk.cyan(`  Installing ${pkg}... `));
      try {
        let cmd: string;
        let args: string[];

        if (pkg.startsWith('@') || pkg.includes('/')) {
          cmd = 'npm';
          args = ['install', '-g', pkg];
        } else {
          // Try pip first, then npm
          cmd = 'pip';
          args = ['install', pkg];
        }

        await execa(cmd, args, { stdio: 'pipe', timeout: 60000, shell: true });
        console.log(chalk.green('✓'));
        successCount++;
      } catch (error) {
        console.log(chalk.red('✗'));
        failCount++;
        console.log(chalk.gray(`    Error: ${error instanceof Error ? error.message : error}`));
      }
    }

    console.log(chalk.bold.cyan('\n─'.repeat(60)));
    console.log(chalk.green(`  Successfully installed: ${successCount}`));
    if (failCount > 0) {
      console.log(chalk.red(`  Failed: ${failCount}`));
    }
    console.log();

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    spinner.fail('Installation failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
