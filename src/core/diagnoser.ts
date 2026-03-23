import { readFile, access } from 'fs/promises';
import * as path from 'path';
import { execa } from 'execa';
import chalk from 'chalk';
import { table } from 'table';
import { LanguageChecker } from '../languages/base-checker.js';
import { PackageDiagnoser, PackageInfo, DependencyIssue, InstallError } from '../tools/package-diagnoser.js';

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}
import { JavaScriptChecker } from '../languages/javascript.js';
import { PythonChecker } from '../languages/python.js';
import { JavaChecker } from '../languages/java.js';
import { GoChecker } from '../languages/go.js';
import { RustChecker } from '../languages/rust.js';
import { CSharpChecker } from '../languages/csharp.js';
import { RubyChecker } from '../languages/ruby.js';
import { PHPChecker } from '../languages/php.js';
import { SwiftChecker } from '../languages/swift.js';
import { KotlinChecker } from '../languages/kotlin.js';

export interface MCPServerConfig {
  command: string;
  args?: string[];
  type?: string;
  env?: Record<string, string>;
}

export interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

export interface DiagnosticIssue {
  type: 'error' | 'warning' | 'info';
  category: 'installation' | 'dependency' | 'connection' | 'configuration' | 'runtime' | 'permission' | 'package';
  message: string;
  server?: string;
  suggestion?: string;
  command?: string;
  packageName?: string;
  packageManager?: string;
}

export interface ServerDiagnosticResult {
  name: string;
  status: 'ok' | 'warning' | 'error' | 'unknown';
  issues: DiagnosticIssue[];
  runtime?: string;
  commandFound: boolean;
  dependenciesOk: boolean;
  configValid: boolean;
}

export interface DiagnosticReport {
  timestamp: string;
  summary: {
    total: number;
    ok: number;
    warning: number;
    error: number;
  };
  servers: ServerDiagnosticResult[];
  languageRuntimes: Record<string, any>;
  packages?: {
    totalPackages: number;
    installedPackages: number;
    missingPackages: string[];
    packageDetails: PackageInfo[];
    dependencyIssues: DependencyIssue[];
  };
  hasIssues: boolean;
}

export class MCPDiagnoser {
  private configPath: string;
  private languageCheckers: Map<string, LanguageChecker>;
  private packageDiagnoser: PackageDiagnoser;

  constructor(configPath: string = '.mcp.json') {
    this.configPath = path.resolve(configPath);
    this.languageCheckers = this.initializeLanguageCheckers();
    this.packageDiagnoser = new PackageDiagnoser();
  }

  private initializeLanguageCheckers(): Map<string, LanguageChecker> {
    const checkers = new Map<string, LanguageChecker>();
    checkers.set('javascript', new JavaScriptChecker());
    checkers.set('typescript', new JavaScriptChecker());
    checkers.set('node', new JavaScriptChecker());
    checkers.set('python', new PythonChecker());
    checkers.set('java', new JavaChecker());
    checkers.set('go', new GoChecker());
    checkers.set('rust', new RustChecker());
    checkers.set('csharp', new CSharpChecker());
    checkers.set('dotnet', new CSharpChecker());
    checkers.set('ruby', new RubyChecker());
    checkers.set('php', new PHPChecker());
    checkers.set('swift', new SwiftChecker());
    checkers.set('kotlin', new KotlinChecker());
    return checkers;
  }

  async loadConfig(): Promise<MCPConfig | null> {
    const paths = [
      this.configPath,
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

  async diagnoseAll(config: MCPConfig, fastMode = false): Promise<DiagnosticReport> {
    const servers = Object.keys(config.mcpServers);
    const results: ServerDiagnosticResult[] = [];

    // 并行诊断所有服务器
    const promises = servers.map(serverName => this.diagnoseServer(serverName, config, fastMode));
    const resolvedResults = await Promise.all(promises);
    results.push(...resolvedResults);

    const languageRuntimes = await this.checkAllLanguages();
    
    // 快速模式下跳过包检查
    const packageDiagnosis = fastMode ? {
      totalPackages: 0,
      installedPackages: 0,
      missingPackages: [],
      packageDetails: [],
      dependencyIssues: [],
    } : await this.diagnoseAllPackages(config);

    return this.compileReport(results, languageRuntimes, packageDiagnosis);
  }

  async diagnoseServer(serverName: string, config: MCPConfig, fastMode = false): Promise<ServerDiagnosticResult> {
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

    // HTTP 类型服务器跳过检查
    if (!serverConfig.command) {
      return {
        name: serverName,
        status: 'ok',
        issues: [],
        commandFound: true,
        dependenciesOk: true,
        configValid: true,
        runtime: 'http',
      };
    }

    // 快速模式下只检查基本配置
    if (fastMode) {
      return {
        name: serverName,
        status: 'ok',
        issues: [],
        commandFound: true,
        dependenciesOk: true,
        configValid: true,
        runtime: this.detectRuntime(serverConfig),
      };
    }

    // 完整模式下的详细检查
    // Check configuration validity
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

    // Check if command exists
    if (serverConfig.command) {
      const commandCheck = await this.checkCommand(serverConfig.command);
      if (!commandCheck.found) {
        commandFound = false;
        issues.push({
          type: 'error',
          category: 'installation',
          message: `Command "${serverConfig.command}" not found`,
          server: serverName,
          suggestion: this.getSuggestionForCommand(serverConfig.command),
          command: this.getInstallCommand(serverConfig.command),
        });
        status = 'error';
      }
    }

    // Check arguments for npx/uvx commands
    if (serverConfig.args && serverConfig.args.length > 0) {
      const pkgArg = serverConfig.args.find(arg => arg.startsWith('@') || arg.includes('/') || arg.includes('mcp'));
      if (pkgArg) {
        // Clean package name (remove @latest, @version, etc.)
        const cleanPkgName = pkgArg.replace(/@latest$/i, '').replace(/@[0-9].*$/i, '');

        // Diagnose the package
        const pkgDiagnosis = await this.packageDiagnoser.diagnosePackage(cleanPkgName);

        if (!pkgDiagnosis.installed) {
          dependenciesOk = false;
          issues.push({
            type: 'warning',
            category: 'package',
            message: `包 "${cleanPkgName}" 未安装`,
            server: serverName,
            packageName: cleanPkgName,
            suggestion: '安装包或使用 npx/uvx 自动安装',
            command: `npx -y ${cleanPkgName}@latest --version`,
          });
          if (status === 'ok') status = 'warning';
        } else if (pkgDiagnosis.issues.length > 0) {
          for (const issue of pkgDiagnosis.issues) {
            issues.push({
              type: 'warning',
              category: 'package',
              message: issue,
              server: serverName,
              packageName: cleanPkgName,
              suggestion: '检查包状态',
            });
          }
          if (status === 'ok') status = 'warning';
        }
      }
    }

    // Detect runtime language and check it
    const runtime = this.detectRuntime(serverConfig);
    if (runtime) {
      const checker = this.languageCheckers.get(runtime.toLowerCase());
      if (checker) {
        const runtimeCheck = await checker.check();
        if (!runtimeCheck.available) {
          issues.push({
            type: 'error',
            category: 'runtime',
            message: `${runtime} runtime is not available`,
            server: serverName,
            suggestion: `Install ${runtime} runtime`,
            command: checker.getInstallCommand(),
          });
          status = 'error';
        }
      }
    }

    // Check for common issues
    if (serverConfig.command === 'npx' || serverConfig.command === 'uvx') {
      // Check npm/uv version
      const npmCheck = await this.checkCommand('npm');
      if (!npmCheck.found && serverConfig.command === 'npx') {
        issues.push({
          type: 'warning',
          category: 'dependency',
          message: 'npm is not installed, npx may fail',
          server: serverName,
          suggestion: 'Install Node.js which includes npm',
        });
      }
    }

    // Check environment variables
    if (serverConfig.env) {
      for (const [key, value] of Object.entries(serverConfig.env)) {
        if (!process.env[key] && value.startsWith('$')) {
          issues.push({
            type: 'warning',
            category: 'configuration',
            message: `Environment variable ${key} may not be set`,
            server: serverName,
            suggestion: `Set ${key} environment variable`,
          });
          if (status === 'ok') status = 'warning';
        }
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

  async checkAllLanguages(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const [name, checker] of this.languageCheckers.entries()) {
      // Only check unique checkers
      if (name === checker.name.toLowerCase() || !results[checker.name.toLowerCase()]) {
        const checkResult = await checker.check();
        results[checker.name.toLowerCase()] = {
          name: checker.name,
          available: checkResult.available,
          version: checkResult.version,
          path: checkResult.path,
        };
      }
    }

    return results;
  }

  /**
   * 诊断所有 MCP 服务器配置中使用的包
   */
  async diagnoseAllPackages(config: MCPConfig): Promise<{
    totalPackages: number;
    installedPackages: number;
    missingPackages: string[];
    packageDetails: PackageInfo[];
    dependencyIssues: DependencyIssue[];
  }> {
    const packagesToCheck = new Set<string>();
    const packageDetails: PackageInfo[] = [];
    
    // 从所有服务器配置中提取包名
    for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
      if (serverConfig.args) {
        for (const arg of serverConfig.args) {
          // 提取包名
          if (arg.startsWith('@') || arg.includes('/') || arg.includes('mcp')) {
            const cleanName = arg.replace(/@latest$/i, '').replace(/@[0-9].*$/i, '');
            if (cleanName && !cleanName.startsWith('-') && !cleanName.includes('.')) {
              // 跳过 npx/uvx 按需安装的包
              if (serverConfig.command === 'npx' || serverConfig.command === 'uvx') {
                packageDetails.push({
                  name: cleanName,
                  version: 'on-demand',
                  installed: true,
                  issues: [],
                });
                continue;
              }
              packagesToCheck.add(cleanName);
            }
          }
        }
      }
      // 检查命令本身
      if (serverConfig.command && 
          !['node', 'python', 'python3', 'npx', 'uvx', 'uv', 'cargo', 'dotnet'].includes(serverConfig.command)) {
        packagesToCheck.add(serverConfig.command);
      }
    }
    
    // 诊断每个包
    for (const pkgName of packagesToCheck) {
      const details = await this.packageDiagnoser.diagnosePackage(pkgName);
      packageDetails.push(details);
    }
    
    const installedCount = packageDetails.filter(p => p.installed).length;
    const missingPackages = packageDetails.filter(p => !p.installed).map(p => p.name);
    
    // 诊断依赖问题（可选，可能较慢）
    const dependencyIssues: DependencyIssue[] = [];
    
    return {
      totalPackages: packageDetails.length,
      installedPackages: installedCount,
      missingPackages,
      packageDetails,
      dependencyIssues,
    };
  }

  private detectRuntime(serverConfig: MCPServerConfig): string | undefined {
    // HTTP 类型服务器没有 command，直接返回 undefined
    if (!serverConfig.command) {
      return undefined;
    }

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

  private async checkCommand(command: string): Promise<{ found: boolean; version?: string }> {
    try {
      const { stdout } = await execa(command, ['--version'], { timeout: 5000 });
      return { found: true, version: stdout.split('\n')[0] };
    } catch {
      try {
        const { stdout } = await execa(command, ['-version'], { timeout: 5000 });
        return { found: true, version: stdout.split('\n')[0] };
      } catch {
        try {
          const { stdout } = await execa('where', [command], { timeout: 5000, shell: true });
          return { found: stdout.trim().length > 0, version: undefined };
        } catch {
          return { found: false };
        }
      }
    }
  }

  private async checkPackage(packageName: string): Promise<{ installed: boolean; version?: string }> {
    try {
      // Try to get package version
      const cleanName = packageName.replace(/^-y$/, '').trim();
      if (!cleanName) return { installed: true };

      // For npx packages, try to run with --version
      if (packageName.startsWith('@') || packageName.includes('/')) {
        try {
          const { stdout } = await execa('npx', ['-y', cleanName, '--version'], { timeout: 10000 });
          return { installed: true, version: stdout.trim() };
        } catch {
          // Package might still be installable via npx
          return { installed: true }; // npx will install on demand
        }
      }

      return { installed: true };
    } catch {
      return { installed: false };
    }
  }

  private getSuggestionForCommand(command: string): string {
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

  private getInstallCommand(command: string): string | undefined {
    const commands: Record<string, string> = {
      'node': 'winget install OpenJS.NodeJS.LTS',
      'npm': 'winget install OpenJS.NodeJS.LTS',
      'python': 'winget install Python.Python.3.12',
      'uv': 'pip install uv',
      'java': 'winget install EclipseAdoptium.Temurin.17.JDK',
      'go': 'winget install GoLang.Go',
      'cargo': 'winget install Rustlang.Rustup',
      'dotnet': 'winget install Microsoft.DotNet.SDK.8',
      'ruby': 'winget install RubyInstallerTeam.Ruby',
      'php': 'winget install PHP.PHP',
      'swift': 'winget install Swiftlang.Swift.RELEASE',
      'kotlin': 'winget install JetBrains.Kotlin',
    };

    return commands[command];
  }

  private compileReport(
    results: ServerDiagnosticResult[],
    languageRuntimes: Record<string, any>,
    packageDiagnosis: {
      totalPackages: number;
      installedPackages: number;
      missingPackages: string[];
      packageDetails: PackageInfo[];
      dependencyIssues: DependencyIssue[];
    }
  ): DiagnosticReport {
    const ok = results.filter(r => r.status === 'ok').length;
    const warning = results.filter(r => r.status === 'warning').length;
    const error = results.filter(r => r.status === 'error' || r.status === 'unknown').length;

    return {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        ok,
        warning,
        error,
      },
      servers: results,
      languageRuntimes,
      packages: packageDiagnosis,
      hasIssues: error > 0 || warning > 0 || packageDiagnosis.missingPackages.length > 0,
    };
  }

  printReport(report: DiagnosticReport, verbose: boolean = false): void {
    console.log('\n' + chalk.bold.cyan('═'.repeat(60)));
    console.log(chalk.bold.cyan('  MCP Diagnoser - Diagnostic Report'));
    console.log(chalk.bold.cyan('═'.repeat(60)));
    console.log(chalk.gray(`  Generated: ${report.timestamp}`));
    console.log(chalk.bold.cyan('─'.repeat(60)) + '\n');

    // Summary
    console.log(chalk.bold('📊 Summary'));
    const summaryData = [
      ['Total Servers', report.summary.total.toString()],
      ['✅ OK', chalk.green(report.summary.ok.toString())],
      ['⚠️  Warnings', chalk.yellow(report.summary.warning.toString())],
      ['❌ Errors', chalk.red(report.summary.error.toString())],
    ];
    console.log(table(summaryData));

    // Language Runtimes
    console.log('\n' + chalk.bold('🔧 Language Runtimes'));
    const runtimeData = Object.entries(report.languageRuntimes).map(([name, runtime]: [string, any]) => [
      name,
      runtime.available ? chalk.green('✓') : chalk.red('✗'),
      runtime.version || 'N/A',
      runtime.path || 'Not found',
    ]);
    console.log(table([['Language', 'Status', 'Version', 'Path'], ...runtimeData]));

    // Package Status
    if (report.packages) {
      console.log('\n' + chalk.bold('📦 Package Status'));
      const packageData = [
        ['Total Packages', report.packages.totalPackages.toString()],
        ['✅ Installed', chalk.green(report.packages.installedPackages.toString())],
        ['❌ Missing', chalk.red(report.packages.missingPackages.length.toString())],
      ];
      console.log(table(packageData));

      if (report.packages.missingPackages.length > 0) {
        console.log(chalk.yellow('\n  Missing Packages:'));
        for (const pkg of report.packages.missingPackages) {
          console.log(chalk.yellow(`    • ${pkg}`));
        }
      }

      if (report.packages.dependencyIssues.length > 0) {
        console.log(chalk.yellow('\n  Dependency Issues:'));
        for (const issue of report.packages.dependencyIssues) {
          console.log(chalk.yellow(`    • ${issue.message}`));
          console.log(chalk.gray(`      → ${issue.suggestion}`));
        }
      }
    }

    // Server Details
    console.log('\n' + chalk.bold('🔍 Server Diagnostics'));
    for (const server of report.servers) {
      const icon = server.status === 'ok' ? chalk.green('✓') :
                   server.status === 'warning' ? chalk.yellow('⚠') : chalk.red('✗');
      console.log(`\n${icon} ${chalk.bold(server.name)}`);

      if (server.runtime) {
        console.log(chalk.gray(`  Runtime: ${server.runtime}`));
      }
      console.log(chalk.gray(`  Command Found: ${server.commandFound ? 'Yes' : 'No'}`));
      console.log(chalk.gray(`  Dependencies OK: ${server.dependenciesOk ? 'Yes' : 'No'}`));
      console.log(chalk.gray(`  Config Valid: ${server.configValid ? 'Yes' : 'No'}`));

      if (server.issues.length > 0 && (verbose || server.status !== 'ok')) {
        console.log(chalk.yellow('  Issues:'));
        for (const issue of server.issues) {
          const issueIcon = issue.type === 'error' ? chalk.red('✗') :
                           issue.type === 'warning' ? chalk.yellow('⚠') : chalk.blue('ℹ');
          console.log(`    ${issueIcon} [${issue.category}] ${issue.message}`);
          if (issue.suggestion) {
            console.log(chalk.gray(`      → ${issue.suggestion}`));
          }
          if (issue.command) {
            console.log(chalk.gray(`      → Command: ${issue.command}`));
          }
        }
      }
    }

    // Recommendations
    if (report.hasIssues) {
      console.log('\n' + chalk.bold.cyan('─'.repeat(60)));
      console.log(chalk.bold('💡 Recommendations'));

      const errorServers = report.servers.filter(s => s.status === 'error' || s.status === 'unknown');
      const warningServers = report.servers.filter(s => s.status === 'warning');

      if (errorServers.length > 0) {
        console.log(chalk.red('\n  Critical Issues (fix first):'));
        for (const server of errorServers) {
          const errors = server.issues.filter(i => i.type === 'error');
          for (const error of errors) {
            console.log(chalk.red(`    • ${server.name}: ${error.message}`));
            if (error.command) {
              console.log(chalk.gray(`      Run: ${error.command}`));
            }
          }
        }
      }

      if (warningServers.length > 0) {
        console.log(chalk.yellow('\n  Warnings:'));
        for (const server of warningServers) {
          const warnings = server.issues.filter(i => i.type === 'warning');
          for (const warning of warnings) {
            console.log(chalk.yellow(`    • ${server.name}: ${warning.message}`));
          }
        }
      }

      if (report.packages && report.packages.missingPackages.length > 0) {
        console.log(chalk.yellow('\n  Missing Packages (install with):'));
        for (const pkg of report.packages.missingPackages) {
          if (pkg.startsWith('@') || pkg.includes('/')) {
            console.log(chalk.yellow(`    • npm install -g ${pkg}`));
          } else {
            console.log(chalk.yellow(`    • pip install ${pkg} 或 npm install -g ${pkg}`));
          }
        }
      }
    } else {
      console.log(chalk.green('\n  ✅ All MCP servers are healthy!'));
    }

    console.log('\n' + chalk.bold.cyan('═'.repeat(60)) + '\n');
  }

  async applyFixes(report: DiagnosticReport): Promise<void> {
    console.log(chalk.bold('\n🔧 Applying automatic fixes...\n'));

    const fixableIssues = report.servers.flatMap(s => 
      s.issues.filter(i => i.command && i.category === 'installation')
    );

    for (const issue of fixableIssues) {
      if (issue.command) {
        console.log(chalk.cyan(`  Running: ${issue.command}`));
        try {
          await execa(issue.command.split(' ')[0], issue.command.split(' ').slice(1), { stdio: 'inherit', shell: true });
          console.log(chalk.green('  ✓ Fix applied successfully\n'));
        } catch (error) {
          console.log(chalk.red(`  ✗ Failed to apply fix: ${error instanceof Error ? error.message : error}\n`));
        }
      }
    }

    console.log(chalk.bold.cyan('Fix application complete. Run diagnosis again to verify.\n'));
  }
}
