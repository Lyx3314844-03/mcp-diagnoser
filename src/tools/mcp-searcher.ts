import { execa } from 'execa';
import chalk from 'chalk';

export interface MCPPackage {
  name: string;
  description: string;
  version?: string;
  author?: string;
  downloads?: number;
  keywords?: string[];
  repository?: string;
}

export interface SearchResults {
  query: string;
  total: number;
  packages: MCPPackage[];
}

export interface PlaywrightDiagnostic {
  browser: 'chromium' | 'firefox' | 'webkit';
  installed: boolean;
  version?: string;
  issues: string[];
}

export class MCPSearcher {
  /**
   * Search for MCP packages on npm
   */
  async searchNPM(query: string, limit: number = 20): Promise<SearchResults> {
    const searchTerms = [
      `mcp-${query}`,
      `${query}-mcp`,
      `@modelcontextprotocol/${query}`,
      `mcp-server-${query}`,
    ];

    const allPackages: MCPPackage[] = [];

    for (const term of searchTerms) {
      try {
        const packages = await this.searchNPMSingle(term, limit);
        allPackages.push(...packages);
      } catch {
        // Continue to next search term
      }
    }

    // Also search for generic mcp packages
    if (!query.toLowerCase().includes('mcp')) {
      try {
        const genericPackages = await this.searchNPMSingle('mcp-server', limit);
        allPackages.push(...genericPackages);
      } catch {
        // Ignore
      }
    }

    // Deduplicate by name
    const uniquePackages = allPackages.filter(
      (pkg, index, self) => index === self.findIndex((p) => p.name === pkg.name)
    );

    return {
      query,
      total: uniquePackages.length,
      packages: uniquePackages.slice(0, limit),
    };
  }

  private async searchNPMSingle(term: string, limit: number = 10): Promise<MCPPackage[]> {
    try {
      const { stdout } = await execa('npm', ['search', term, '--json', '--limit', String(limit)], {
        timeout: 15000,
      });

      const results = JSON.parse(stdout);
      if (Array.isArray(results)) {
        return results.map((pkg: any) => ({
          name: pkg.name,
          description: pkg.description || 'No description',
          version: pkg.version,
          author: pkg.author?.name || pkg.maintainers?.[0]?.name,
          downloads: pkg.downloads,
          keywords: pkg.keywords,
          repository: pkg.links?.repository,
        }));
      }

      return [];
    } catch (error) {
      // Try alternative search via registry API
      return this.searchNPMRegistry(term, limit);
    }
  }

  private async searchNPMRegistry(term: string, limit: number = 10): Promise<MCPPackage[]> {
    try {
      const { stdout } = await execa(
        'curl',
        ['-s', `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(term)}&size=${limit}`],
        { timeout: 10000 }
      );

      const data = JSON.parse(stdout);
      return data.objects?.map((obj: any) => ({
        name: obj.package.name,
        description: obj.package.description || 'No description',
        version: obj.package.version,
        author: obj.package.publisher?.username,
        keywords: obj.package.keywords,
        repository: obj.package.links?.repository,
      })) || [];
    } catch {
      return [];
    }
  }

  /**
   * Search for MCP packages on GitHub
   */
  async searchGitHub(query: string, limit: number = 20): Promise<SearchResults> {
    try {
      const searchQuery = `mcp ${query} server`;
      const { stdout } = await execa(
        'curl',
        [
          '-s',
          '-H', 'Accept: application/vnd.github.v3+json',
          `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=${limit}`,
        ],
        { timeout: 10000 }
      );

      const data = JSON.parse(stdout);
      const packages: MCPPackage[] = (data.items || []).map((repo: any) => ({
        name: repo.full_name,
        description: repo.description || 'No description',
        author: repo.owner?.login,
        downloads: repo.stargazers_count,
        repository: repo.html_url,
        keywords: repo.topics,
      }));

      return {
        query,
        total: data.total_count || 0,
        packages,
      };
    } catch {
      return { query, total: 0, packages: [] };
    }
  }

  /**
   * Get popular/official MCP packages
   */
  async getPopularPackages(limit: number = 30): Promise<MCPPackage[]> {
    const officialPackages = [
      { name: '@modelcontextprotocol/server-github', description: 'Official GitHub MCP Server' },
      { name: '@modelcontextprotocol/server-puppeteer', description: 'Official Puppeteer MCP Server' },
      { name: '@playwright/mcp', description: 'Official Playwright MCP Server' },
      { name: '@upstash/context7-mcp', description: 'Context7 MCP for documentation' },
      { name: 'firecrawl-mcp', description: 'Firecrawl web scraping MCP' },
      { name: 'search1api-mcp', description: 'Search1API MCP Server' },
      { name: 'exa-mcp-server', description: 'Exa AI Search MCP' },
      { name: 'yt-dlp-mcp', description: 'YouTube download MCP' },
      { name: 'code-review-mcp-server', description: 'Code review MCP Server' },
      { name: 'terminal-mcp-server', description: 'Terminal access MCP' },
      { name: 'fetch-mcp', description: 'Web fetch MCP' },
      { name: 'gitnexus', description: 'Git operations MCP' },
      { name: 'chrome-devtools-mcp', description: 'Chrome DevTools MCP' },
      { name: 'owlex', description: 'OpenAI Codex MCP' },
      { name: 'codescalpel', description: 'Code analysis MCP' },
    ];

    // Try to get version info
    const packagesWithVersions: MCPPackage[] = [];
    for (const pkg of officialPackages.slice(0, limit)) {
      try {
        const { stdout } = await execa('npm', ['view', pkg.name, 'version'], { timeout: 5000 });
        packagesWithVersions.push({
          ...pkg,
          version: stdout.trim(),
        });
      } catch {
        packagesWithVersions.push(pkg);
      }
    }

    return packagesWithVersions;
  }

  /**
   * Install an MCP package
   */
  async installPackage(packageName: string, global: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
      const args = global ? ['install', '-g', packageName] : ['install', packageName];
      await execa('npm', args, { stdio: 'inherit', timeout: 120000 });
      return {
        success: true,
        message: `Successfully installed ${packageName}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to install ${packageName}: ${error instanceof Error ? error.message : error}`,
      };
    }
  }

  /**
   * Print search results
   */
  printResults(results: SearchResults): void {
    console.log(chalk.bold.cyan('\n═'.repeat(60)));
    console.log(chalk.bold.cyan(`  MCP Package Search: "${results.query}"`));
    console.log(chalk.bold.cyan('═'.repeat(60)));
    console.log(chalk.gray(`  Found ${results.total} packages\n`));

    for (const pkg of results.packages) {
      console.log(chalk.bold.green(`  ${pkg.name}`));
      console.log(chalk.gray(`    ${pkg.description}`));
      
      if (pkg.version) {
        console.log(chalk.blue(`    Version: ${pkg.version}`));
      }
      if (pkg.author) {
        console.log(chalk.gray(`    Author: ${pkg.author}`));
      }
      if (pkg.downloads) {
        console.log(chalk.gray(`    Downloads/Stars: ${pkg.downloads}`));
      }
      if (pkg.repository) {
        console.log(chalk.cyan(`    Repository: ${pkg.repository}`));
      }
      if (pkg.keywords && pkg.keywords.length > 0) {
        console.log(chalk.gray(`    Keywords: ${pkg.keywords.slice(0, 5).join(', ')}`));
      }
      console.log();
    }

    if (results.packages.length === 0) {
      console.log(chalk.yellow('  No packages found. Try different keywords.\n'));
    }
  }
}

export class PlaywrightDiagnoser {
  /**
   * Diagnose Playwright installation and browsers
   */
  async diagnose(): Promise<{
    playwrightInstalled: boolean;
    playwrightVersion?: string;
    browsers: PlaywrightDiagnostic[];
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check if Playwright is installed
    let playwrightVersion: string | undefined;
    let playwrightInstalled = false;

    try {
      const { stdout } = await execa('npx', ['playwright', '--version'], { timeout: 10000 });
      playwrightInstalled = true;
      playwrightVersion = stdout.trim();
    } catch {
      issues.push('Playwright is not installed');
      suggestions.push('Run: npm install -D @playwright/mcp or npx playwright install');
    }

    // Check browsers
    const browsers: PlaywrightDiagnostic[] = [];
    const browserNames: Array<'chromium' | 'firefox' | 'webkit'> = ['chromium', 'firefox', 'webkit'];

    for (const browser of browserNames) {
      const diag = await this.checkBrowser(browser);
      browsers.push(diag);
      if (!diag.installed) {
        issues.push(`${browser} browser is not installed`);
      }
    }

    // Check Playwright config
    if (playwrightInstalled) {
      const configIssues = await this.checkConfig();
      issues.push(...configIssues);
    }

    // Check system dependencies
    if (process.platform === 'linux') {
      const sysDeps = await this.checkSystemDependencies();
      if (sysDeps.length > 0) {
        issues.push('Missing system dependencies');
        suggestions.push(`Install: ${sysDeps.join(' ')}`);
      }
    }

    return {
      playwrightInstalled,
      playwrightVersion,
      browsers,
      issues,
      suggestions,
    };
  }

  private async checkBrowser(browser: 'chromium' | 'firefox' | 'webkit'): Promise<PlaywrightDiagnostic> {
    const issues: string[] = [];
    let installed = false;
    let version: string | undefined;

    try {
      // Check if browser is installed via Playwright
      const { stdout } = await execa('npx', ['playwright', 'install', browser, '--dry-run'], {
        timeout: 10000,
        reject: false,
      });

      if (stdout.includes('already installed') || stdout.includes('Installation complete')) {
        installed = true;
      } else if (stdout.includes('not installed') || stdout.includes('Installing')) {
        installed = false;
        issues.push(`${browser} needs to be installed`);
      }
    } catch {
      installed = false;
      issues.push(`Failed to check ${browser} status`);
    }

    return {
      browser,
      installed,
      version,
      issues,
    };
  }

  private async checkConfig(): Promise<string[]> {
    const issues: string[] = [];

    // Check for playwright.config file
    const configPaths = [
      'playwright.config.ts',
      'playwright.config.js',
      'playwright.config.mjs',
    ];

    const fs = await import('fs-extra');
    const hasConfig = configPaths.some((p) => fs.existsSync(p));

    if (!hasConfig) {
      issues.push('No playwright.config file found');
    }

    return issues;
  }

  private async checkSystemDependencies(): Promise<string[]> {
    const missing: string[] = [];

    // Common Linux dependencies for Playwright
    const deps = [
      'libnss3',
      'libnspr4',
      'libatk1.0-0',
      'libatk-bridge2.0-0',
      'libcups2',
      'libdrm2',
      'libxkbcommon0',
      'libxcomposite1',
      'libxdamage1',
      'libxfixes3',
      'libxrandr2',
      'libgbm1',
      'libasound2',
    ];

    try {
      const { stdout } = await execa('dpkg', ['-l', ...deps], { timeout: 5000 });
      // Check which ones are not installed
      for (const dep of deps) {
        if (!stdout.includes(`ii  ${dep}`)) {
          missing.push(dep);
        }
      }
    } catch {
      // Can't check, assume all might be needed
    }

    return missing;
  }

  /**
   * Install Playwright and browsers
   */
  async install(options: { browsers?: string[]; withDeps?: boolean } = {}): Promise<{ success: boolean; message: string }> {
    try {
      const browsers = options.browsers || ['chromium', 'firefox', 'webkit'];
      const withDeps = options.withDeps || false;

      console.log(chalk.cyan('Installing Playwright browsers...'));
      
      const args = ['playwright', 'install', ...browsers];
      if (withDeps && process.platform === 'linux') {
        args.push('--with-deps');
      }

      await execa('npx', args, { stdio: 'inherit', timeout: 300000 });

      return {
        success: true,
        message: 'Playwright browsers installed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Installation failed: ${error instanceof Error ? error.message : error}`,
      };
    }
  }

  /**
   * Print Playwright diagnosis results
   */
  printDiagnosis(result: Awaited<ReturnType<typeof this.diagnose>>): void {
    console.log(chalk.bold.cyan('\n═'.repeat(60)));
    console.log(chalk.bold.cyan('  Playwright Diagnosis'));
    console.log(chalk.bold.cyan('═'.repeat(60)) + '\n');

    // Playwright status
    if (result.playwrightInstalled) {
      console.log(chalk.green('✓ Playwright installed'), chalk.gray(result.playwrightVersion || ''));
    } else {
      console.log(chalk.red('✗ Playwright not installed'));
    }

    // Browser status
    console.log(chalk.bold('\n🌐 Browsers:'));
    for (const browser of result.browsers) {
      const icon = browser.installed ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${icon} ${browser.browser}`);
      for (const issue of browser.issues) {
        console.log(chalk.gray(`      ${issue}`));
      }
    }

    // Issues
    if (result.issues.length > 0) {
      console.log(chalk.bold.yellow('\n⚠️  Issues:'));
      for (const issue of result.issues) {
        console.log(chalk.yellow(`  • ${issue}`));
      }
    }

    // Suggestions
    if (result.suggestions.length > 0) {
      console.log(chalk.bold.cyan('\n💡 Suggestions:'));
      for (const suggestion of result.suggestions) {
        console.log(chalk.cyan(`  • ${suggestion}`));
      }
    }

    console.log();
  }
}
