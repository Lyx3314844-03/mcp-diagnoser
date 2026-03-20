#!/usr/bin/env node

/**
 * MCP Diagnoser Server
 * Provides MCP tools for diagnosing and fixing MCP server issues
 * Includes: diagnosis, language check, package search, Playwright diagnosis
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs-extra';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { execa } from 'execa';
import {
  WEB_SEARCH_TOOL,
  CRAWL_WEBSITE_TOOL,
  SEARCH_WEBSITE_CONTENT_TOOL,
  EXTRACT_WEBSITE_INFO_TOOL,
  executeWebSearch,
  executeWebsiteCrawl,
  executeWebsiteSearch,
  executeWebsiteInfoExtraction,
} from './web-tools.js';

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

interface MCPServerConfig {
  command: string;
  args?: string[];
  type?: string;
  env?: Record<string, string>;
}

interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

interface DiagnosticIssue {
  type: 'error' | 'warning' | 'info';
  category: 'installation' | 'dependency' | 'connection' | 'configuration' | 'runtime' | 'permission';
  message: string;
  server?: string;
  suggestion?: string;
  command?: string;
}

interface ServerDiagnosticResult {
  name: string;
  status: 'ok' | 'warning' | 'error' | 'unknown';
  issues: DiagnosticIssue[];
  runtime?: string;
  commandFound: boolean;
  dependenciesOk: boolean;
  configValid: boolean;
}

interface MCPPackage {
  name: string;
  description: string;
  version?: string;
  author?: string;
  downloads?: number;
  keywords?: string[];
  repository?: string;
}

interface PlaywrightDiagnostic {
  browser: 'chromium' | 'firefox' | 'webkit';
  installed: boolean;
  version?: string;
  issues: string[];
}

// Define tools
const DIAGNOSE_ALL_TOOL: Tool = {
  name: 'diagnose_all',
  description: 'Diagnose all MCP servers for installation, dependency, connection, and configuration issues. Supports 10 programming languages.',
  inputSchema: {
    type: 'object',
    properties: {
      configPath: {
        type: 'string',
        description: 'Path to MCP config file (default: .mcp.json)',
      },
      verbose: {
        type: 'boolean',
        description: 'Enable verbose output',
        default: false,
      },
    },
  },
};

const DIAGNOSE_SERVER_TOOL: Tool = {
  name: 'diagnose_server',
  description: 'Diagnose a specific MCP server',
  inputSchema: {
    type: 'object',
    properties: {
      serverName: {
        type: 'string',
        description: 'Name of the MCP server to diagnose',
      },
      configPath: {
        type: 'string',
        description: 'Path to MCP config file',
      },
    },
    required: ['serverName'],
  },
};

const CHECK_ALL_LANGUAGES_TOOL: Tool = {
  name: 'check_all_languages',
  description: 'Check all 10 supported language runtimes (JavaScript, Python, Java, Go, Rust, C#, Ruby, PHP, Swift, Kotlin)',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

const SEARCH_MCP_PACKAGES_TOOL: Tool = {
  name: 'search_mcp_packages',
  description: 'Search for MCP packages on npm and GitHub',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query (e.g., "github", "playwright", "python")',
      },
      source: {
        type: 'string',
        description: 'Search source: npm, github, or all',
        enum: ['npm', 'github', 'all'],
        default: 'all',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results',
        default: 20,
      },
    },
    required: ['query'],
  },
};

const GET_POPULAR_MCP_PACKAGES_TOOL: Tool = {
  name: 'get_popular_mcp_packages',
  description: 'Get list of popular and official MCP packages',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of results',
        default: 30,
      },
    },
  },
};

const INSTALL_MCP_PACKAGE_TOOL: Tool = {
  name: 'install_mcp_package',
  description: 'Install an MCP package via npm',
  inputSchema: {
    type: 'object',
    properties: {
      packageName: {
        type: 'string',
        description: 'Name of the package to install',
      },
      global: {
        type: 'boolean',
        description: 'Install globally',
        default: false,
      },
    },
    required: ['packageName'],
  },
};

const DIAGNOSE_PLAYWRIGHT_TOOL: Tool = {
  name: 'diagnose_playwright',
  description: 'Diagnose Playwright installation and browser status',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

const INSTALL_PLAYWRIGHT_BROWSERS_TOOL: Tool = {
  name: 'install_playwright_browsers',
  description: 'Install Playwright browsers (chromium, firefox, webkit)',
  inputSchema: {
    type: 'object',
    properties: {
      browsers: {
        type: 'array',
        items: { type: 'string', enum: ['chromium', 'firefox', 'webkit'] },
        description: 'Browsers to install',
        default: ['chromium', 'firefox', 'webkit'],
      },
      withDeps: {
        type: 'boolean',
        description: 'Install system dependencies (Linux only)',
        default: false,
      },
    },
  },
};

// Create server
const server = new Server(
  {
    name: 'mcp-diagnoser',
    version: '1.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Load config
async function loadConfig(configPath: string = '.mcp.json'): Promise<MCPConfig | null> {
  const paths = [
    path.resolve(configPath as string),
    path.join(process.env.HOME || process.env.USERPROFILE || '', '.mcp.json'),
    path.join(process.env.HOME || process.env.USERPROFILE || '', 'mcp.json'),
  ];

  for (const p of paths) {
    if (await exists(p)) {
      try {
        const content = await readFile(p, 'utf-8');
        return JSON.parse(content) as MCPConfig;
      } catch (error) {
        throw new Error(`Failed to parse config file ${p}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }

  return null;
}

// Check command
async function checkCommand(command: string): Promise<{ found: boolean; version?: string; path?: string }> {
  try {
    const { stdout } = await execa(command, ['--version'], { timeout: 5000 });
    return { found: true, version: stdout.split('\n')[0], path: undefined };
  } catch {
    try {
      const { stdout } = await execa(command, ['-version'], { timeout: 5000 });
      return { found: true, version: stdout.split('\n')[0], path: undefined };
    } catch {
      return { found: false, path: undefined };
    }
  }
}

// Detect runtime
function detectRuntime(serverConfig: MCPServerConfig): string | undefined {
  const command = serverConfig.command.toLowerCase();
  const args = serverConfig.args?.join(' ') || '';

  if (command === 'node' || command === 'npx' || args.includes('.js') || args.includes('.ts')) {
    return 'node';
  }
  if (command === 'python' || command === 'python3' || command === 'uv' || command === 'uvx' || args.includes('.py')) {
    return 'python';
  }
  if (command === 'java' || command === 'mvn' || command === 'gradle' || args.includes('.jar')) {
    return 'java';
  }
  if (command === 'go' || args.includes('.go')) {
    return 'go';
  }
  if (command === 'cargo' || args.includes('.rs')) {
    return 'rust';
  }
  if (command === 'dotnet' || args.includes('.cs') || args.includes('.dll')) {
    return 'dotnet';
  }
  if (command === 'ruby' || args.includes('.rb')) {
    return 'ruby';
  }
  if (command === 'php' || args.includes('.php')) {
    return 'php';
  }
  if (command === 'swift' || args.includes('.swift')) {
    return 'swift';
  }
  if (command === 'kotlinc' || command === 'kotlin' || args.includes('.kt')) {
    return 'kotlin';
  }

  return undefined;
}

// Diagnose server
async function diagnoseServer(serverName: string, config: MCPConfig): Promise<ServerDiagnosticResult> {
  const serverConfig = config.mcpServers[serverName];
  if (!serverConfig) {
    return {
      name: serverName,
      status: 'unknown',
      issues: [{
        type: 'error',
        category: 'configuration',
        message: `Server "${serverName}" not found in configuration`,
      }],
      commandFound: false,
      dependenciesOk: false,
      configValid: false,
    };
  }

  const issues: DiagnosticIssue[] = [];
  let status: 'ok' | 'warning' | 'error' = 'ok';
  let commandFound = true;
  let dependenciesOk = true;
  let configValid = true;

  // Check configuration
  if (!serverConfig.command) {
    issues.push({
      type: 'error',
      category: 'configuration',
      message: 'Missing command in server configuration',
      server: serverName,
      suggestion: 'Add a "command" field to the server configuration',
    });
    configValid = false;
    status = 'error';
  }

  // Check command
  if (serverConfig.command) {
    const commandCheck = await checkCommand(serverConfig.command);
    if (!commandCheck.found) {
      commandFound = false;
      issues.push({
        type: 'error',
        category: 'installation',
        message: `Command "${serverConfig.command}" not found`,
        server: serverName,
        suggestion: getSuggestionForCommand(serverConfig.command),
        command: getInstallCommand(serverConfig.command),
      });
      status = 'error';
    }
  }

  // Check package in args
  if (serverConfig.args && serverConfig.args.length > 0) {
    const pkgArg = serverConfig.args.find(arg => arg.startsWith('@') || arg.includes('/'));
    if (pkgArg) {
      issues.push({
        type: 'warning',
        category: 'dependency',
        message: `Package "${pkgArg}" will be installed on-demand via npx`,
        server: serverName,
        suggestion: 'Ensure you have good internet connection for first run',
      });
    }
  }

  // Check runtime
  const runtime = detectRuntime(serverConfig);
  if (runtime) {
    const runtimeCheck = await checkCommand(runtime === 'node' ? 'node' : runtime);
    if (!runtimeCheck.found) {
      issues.push({
        type: 'error',
        category: 'runtime',
        message: `${runtime} runtime is not available`,
        server: serverName,
        suggestion: `Install ${runtime} runtime`,
        command: getInstallCommand(runtime),
      });
      status = 'error';
    }
  }

  return {
    name: serverName,
    status,
    issues,
    runtime,
    commandFound,
    dependenciesOk,
    configValid,
  };
}

function getSuggestionForCommand(command: string): string {
  const suggestions: Record<string, string> = {
    'node': 'Install Node.js from https://nodejs.org/',
    'npm': 'Install Node.js from https://nodejs.org/',
    'npx': 'Install Node.js from https://nodejs.org/',
    'python': 'Install Python from https://www.python.org/',
    'python3': 'Install Python from https://www.python.org/',
    'uv': 'Install uv with: pip install uv',
    'uvx': 'Install uv with: pip install uv',
    'java': 'Install Java JDK from https://adoptium.net/',
    'mvn': 'Install Maven from https://maven.apache.org/',
    'go': 'Install Go from https://golang.org/',
    'cargo': 'Install Rust from https://rustup.rs/',
    'dotnet': 'Install .NET from https://dotnet.microsoft.com/',
    'ruby': 'Install Ruby from https://www.ruby-lang.org/',
    'php': 'Install PHP from https://www.php.net/',
    'swift': 'Install Swift from https://swift.org/',
    'kotlinc': 'Install Kotlin from https://kotlinlang.org/',
  };

  return suggestions[command] || `Ensure ${command} is installed and in PATH`;
}

function getInstallCommand(command: string): string | undefined {
  const isWindows = process.platform === 'win32';
  const commands: Record<string, string> = {
    'node': isWindows ? 'winget install OpenJS.NodeJS.LTS' : 'brew install node',
    'python': isWindows ? 'winget install Python.Python.3.12' : 'brew install python@3.12',
    'java': isWindows ? 'winget install EclipseAdoptium.Temurin.17.JDK' : 'brew install openjdk@17',
    'go': isWindows ? 'winget install GoLang.Go' : 'brew install go',
    'rust': isWindows ? 'winget install Rustlang.Rustup' : 'rustup install',
    'dotnet': isWindows ? 'winget install Microsoft.DotNet.SDK.8' : 'brew install --cask dotnet-sdk',
    'ruby': isWindows ? 'winget install RubyInstallerTeam.Ruby' : 'brew install ruby',
    'php': isWindows ? 'winget install PHP.PHP' : 'brew install php',
    'swift': isWindows ? 'winget install Swiftlang.Swift.RELEASE' : 'xcode-select --install',
    'kotlin': isWindows ? 'winget install JetBrains.Kotlin' : 'brew install kotlin',
  };

  return commands[command];
}

// Check all languages
async function checkAllLanguages(): Promise<Record<string, { available: boolean; version?: string; path?: string }>> {
  const languages = [
    { name: 'javascript', command: 'node' },
    { name: 'python', command: 'python' },
    { name: 'java', command: 'java' },
    { name: 'go', command: 'go' },
    { name: 'rust', command: 'cargo' },
    { name: 'csharp', command: 'dotnet' },
    { name: 'ruby', command: 'ruby' },
    { name: 'php', command: 'php' },
    { name: 'swift', command: 'swift' },
    { name: 'kotlin', command: 'kotlinc' },
  ];
  
  const results: Record<string, { available: boolean; version?: string; path?: string }> = {};
  
  for (const lang of languages) {
    const result = await checkCommand(lang.command);
    results[lang.name] = {
      available: result.found,
      version: result.version,
      path: result.path,
    };
  }
  
  return results;
}

// Search MCP packages
async function searchMCPPackages(query: string, source: string = 'all', limit: number = 20): Promise<{ query: string; total: number; packages: MCPPackage[] }> {
  const searchNPM = async (term: string, lim: number): Promise<MCPPackage[]> => {
    try {
      const { stdout } = await execa('npm', ['search', term, '--json', '--limit', String(lim)], {
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
    } catch {
      return [];
    }
  };

  const searchGitHub = async (term: string, lim: number): Promise<MCPPackage[]> => {
    try {
      const { stdout } = await execa(
        'curl',
        [
          '-s',
          '-H', 'Accept: application/vnd.github.v3+json',
          `https://api.github.com/search/repositories?q=${encodeURIComponent(term)}&sort=stars&order=desc&per_page=${lim}`,
        ],
        { timeout: 10000 }
      );
      const data = JSON.parse(stdout);
      return (data.items || []).map((repo: any) => ({
        name: repo.full_name,
        description: repo.description || 'No description',
        author: repo.owner?.login,
        downloads: repo.stargazers_count,
        repository: repo.html_url,
        keywords: repo.topics,
      }));
    } catch {
      return [];
    }
  };

  let packages: MCPPackage[] = [];
  if (source === 'npm') {
    packages = await searchNPM(query, limit);
  } else if (source === 'github') {
    packages = await searchGitHub(query, limit);
  } else {
    const [npmPkgs, githubPkgs] = await Promise.all([
      searchNPM(query, Math.floor(limit / 2)),
      searchGitHub(query, Math.floor(limit / 2)),
    ]);
    packages = [...npmPkgs, ...githubPkgs].slice(0, limit);
  }

  return {
    query,
    total: packages.length,
    packages,
  };
}

// Get popular packages
async function getPopularPackages(limit: number = 30): Promise<MCPPackage[]> {
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

// Install package
async function installPackage(packageName: string, global: boolean = false): Promise<{ success: boolean; message: string }> {
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

// Diagnose Playwright
async function diagnosePlaywright(): Promise<{
  playwrightInstalled: boolean;
  playwrightVersion?: string;
  browsers: PlaywrightDiagnostic[];
  issues: string[];
  suggestions: string[];
}> {
  const issues: string[] = [];
  const suggestions: string[] = [];

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

  const browsers: PlaywrightDiagnostic[] = [];
  const browserNames: Array<'chromium' | 'firefox' | 'webkit'> = ['chromium', 'firefox', 'webkit'];

  for (const browser of browserNames) {
    browsers.push({
      browser,
      installed: false,
      issues: [`${browser} browser needs installation`],
    });
  }

  if (playwrightInstalled) {
    const fs = await import('fs-extra');
    const configPaths = ['playwright.config.ts', 'playwright.config.js', 'playwright.config.mjs'];
    const hasConfig = configPaths.some((p) => fs.existsSync(p));
    if (!hasConfig) {
      issues.push('No playwright.config file found');
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

// Install Playwright browsers
async function installPlaywrightBrowsers(browsers: string[] = ['chromium', 'firefox', 'webkit'], withDeps: boolean = false): Promise<{ success: boolean; message: string }> {
  try {
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

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'diagnose_all') {
      const config = await loadConfig((args as any)?.configPath);
      if (!config) {
        return {
          content: [
            {
              type: 'text',
              text: 'No MCP configuration found. Please create a .mcp.json or mcp.json file.',
            },
          ],
        };
      }

      const results: ServerDiagnosticResult[] = [];
      for (const serverName of Object.keys(config.mcpServers)) {
        results.push(await diagnoseServer(serverName, config));
      }

      const languages = await checkAllLanguages();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: {
                total: results.length,
                ok: results.filter(r => r.status === 'ok').length,
                warning: results.filter(r => r.status === 'warning').length,
                error: results.filter(r => r.status === 'error' || r.status === 'unknown').length,
              },
              servers: results,
              languageRuntimes: languages,
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'diagnose_server') {
      const serverName = (args as any)?.serverName as string;
      if (!serverName) {
        throw new Error('serverName is required');
      }

      const config = await loadConfig((args as any)?.configPath);
      if (!config) {
        return {
          content: [
            {
              type: 'text',
              text: 'No MCP configuration found',
            },
          ],
        };
      }

      const result = await diagnoseServer(serverName, config);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'check_all_languages') {
      const results = await checkAllLanguages();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: {
                total: 10,
                available: Object.values(results).filter(r => r.available).length,
                unavailable: Object.values(results).filter(r => !r.available).length,
              },
              languages: results,
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'search_mcp_packages') {
      const query = (args as any)?.query as string;
      if (!query) {
        throw new Error('query is required');
      }

      const source = ((args as any)?.source as string) || 'all';
      const limit = ((args as any)?.limit as number) || 20;

      const results = await searchMCPPackages(query, source, limit);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    if (name === 'get_popular_mcp_packages') {
      const limit = ((args as any)?.limit as number) || 30;
      const packages = await getPopularPackages(limit);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ packages }, null, 2),
          },
        ],
      };
    }

    if (name === 'install_mcp_package') {
      const packageName = (args as any)?.packageName as string;
      if (!packageName) {
        throw new Error('packageName is required');
      }

      const global = (args as any)?.global as boolean || false;
      const result = await installPackage(packageName, global);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'diagnose_playwright') {
      const result = await diagnosePlaywright();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'install_playwright_browsers') {
      const browsers = ((args as any)?.browsers as string[]) || ['chromium', 'firefox', 'webkit'];
      const withDeps = (args as any)?.withDeps as boolean || false;

      const result = await installPlaywrightBrowsers(browsers, withDeps);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    // Web tools
    if (name === 'web_search') {
      const query = (args as any)?.query as string;
      const engine = (args as any)?.engine as string || 'google';
      const limit = (args as any)?.limit as number || 10;
      const language = (args as any)?.language as string || 'en';
      const timeRange = (args as any)?.timeRange as string | undefined;

      const result = await executeWebSearch(query, engine, limit, language, timeRange);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'crawl_website') {
      const url = (args as any)?.url as string;
      const maxPages = (args as any)?.maxPages as number || 20;
      const maxDepth = (args as any)?.maxDepth as number || 3;
      const sameDomain = (args as any)?.sameDomain as boolean ?? true;
      const excludePatterns = (args as any)?.excludePatterns as string[] || [];

      const result = await executeWebsiteCrawl(url, maxPages, maxDepth, sameDomain, excludePatterns);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'search_website_content') {
      const url = (args as any)?.url as string;
      const query = (args as any)?.query as string;
      const caseSensitive = (args as any)?.caseSensitive as boolean || false;
      const wholeWord = (args as any)?.wholeWord as boolean || false;
      const regex = (args as any)?.regex as boolean || false;
      const contextLines = (args as any)?.contextLines as number || 2;

      const result = await executeWebsiteSearch(url, query, caseSensitive, wholeWord, regex, contextLines);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'extract_website_info') {
      const url = (args as any)?.url as string;
      const extractEmails = (args as any)?.extractEmails as boolean ?? true;
      const extractPhones = (args as any)?.extractPhones as boolean ?? true;
      const extractLinks = (args as any)?.extractLinks as boolean ?? true;
      const extractSocial = (args as any)?.extractSocial as boolean ?? true;

      const result = await executeWebsiteInfoExtraction(url, extractEmails, extractPhones, extractLinks, extractSocial);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : error}`,
        },
      ],
      isError: true,
    };
  }
});

// Handle tool list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      DIAGNOSE_ALL_TOOL,
      DIAGNOSE_SERVER_TOOL,
      CHECK_ALL_LANGUAGES_TOOL,
      SEARCH_MCP_PACKAGES_TOOL,
      GET_POPULAR_MCP_PACKAGES_TOOL,
      INSTALL_MCP_PACKAGE_TOOL,
      DIAGNOSE_PLAYWRIGHT_TOOL,
      INSTALL_PLAYWRIGHT_BROWSERS_TOOL,
      // Web tools
      WEB_SEARCH_TOOL,
      CRAWL_WEBSITE_TOOL,
      SEARCH_WEBSITE_CONTENT_TOOL,
      EXTRACT_WEBSITE_INFO_TOOL,
    ],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Diagnoser server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
