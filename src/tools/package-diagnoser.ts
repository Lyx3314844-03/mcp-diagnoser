import { execa } from 'execa';
import chalk from 'chalk';
import { readFile, access } from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export interface PackageManager {
  name: string;
  command: string;
  versionCommand: string[];
  installCommand: string;
  listCommand: string[];
  checkCommand?: string[];
  platform: 'all' | 'windows' | 'macos' | 'linux';
}

export interface PackageInfo {
  name: string;
  version?: string;
  installed: boolean;
  global?: boolean;
  location?: string;
  issues: string[];
}

export interface DependencyIssue {
  type: 'missing' | 'conflict' | 'version_mismatch' | 'peer_dependency' | 'optional_failed';
  package: string;
  requiredBy?: string;
  expectedVersion?: string;
  actualVersion?: string;
  message: string;
  suggestion: string;
}

export interface InstallError {
  type: 'network' | 'permission' | 'version_conflict' | 'missing_runtime' | 'disk_space' | 'unknown';
  message: string;
  details: string;
  suggestion: string;
  errorCode?: string;
}

export interface PackageDiagnosticResult {
  packageManager: string;
  packageManagerVersion?: string;
  packagesChecked: number;
  packagesInstalled: number;
  packagesMissing: number;
  dependencyIssues: DependencyIssue[];
  installErrors: InstallError[];
  suggestions: string[];
}

export class PackageDiagnoser {
  private packageManagers: Map<string, PackageManager>;

  constructor() {
    this.packageManagers = this.initializePackageManagers();
  }

  private initializePackageManagers(): Map<string, PackageManager> {
    const managers = new Map<string, PackageManager>();
    
    // npm/yarn/pnpm
    managers.set('npm', {
      name: 'npm',
      command: 'npm',
      versionCommand: ['--version'],
      installCommand: 'npm install -g',
      listCommand: ['list', '-g', '--depth=0'],
      checkCommand: ['list', '-g', '--json'],
      platform: 'all',
    });
    
    managers.set('yarn', {
      name: 'yarn',
      command: 'yarn',
      versionCommand: ['--version'],
      installCommand: 'yarn global add',
      listCommand: ['global', 'list', '--depth=0'],
      platform: 'all',
    });
    
    managers.set('pnpm', {
      name: 'pnpm',
      command: 'pnpm',
      versionCommand: ['--version'],
      installCommand: 'pnpm add -g',
      listCommand: ['list', '-g', '--depth=0'],
      platform: 'all',
    });
    
    // pip/uv
    managers.set('pip', {
      name: 'pip',
      command: 'pip',
      versionCommand: ['--version'],
      installCommand: 'pip install',
      listCommand: ['list'],
      checkCommand: ['list', '--format=json'],
      platform: 'all',
    });
    
    managers.set('pip3', {
      name: 'pip3',
      command: 'pip3',
      versionCommand: ['--version'],
      installCommand: 'pip3 install',
      listCommand: ['list'],
      checkCommand: ['list', '--format=json'],
      platform: 'all',
    });
    
    managers.set('uv', {
      name: 'uv',
      command: 'uv',
      versionCommand: ['--version'],
      installCommand: 'uv pip install',
      listCommand: ['pip', 'list'],
      platform: 'all',
    });
    
    managers.set('uvx', {
      name: 'uvx',
      command: 'uvx',
      versionCommand: ['--version'],
      installCommand: 'uv tool install',
      listCommand: ['tool', 'list'],
      platform: 'all',
    });
    
    // cargo
    managers.set('cargo', {
      name: 'cargo',
      command: 'cargo',
      versionCommand: ['--version'],
      installCommand: 'cargo install',
      listCommand: ['install', '--list'],
      platform: 'all',
    });
    
    // go
    managers.set('go', {
      name: 'go',
      command: 'go',
      versionCommand: ['version'],
      installCommand: 'go install',
      listCommand: ['list', '-m', 'all'],
      platform: 'all',
    });
    
    // dotnet
    managers.set('dotnet', {
      name: 'dotnet',
      command: 'dotnet',
      versionCommand: ['--version'],
      installCommand: 'dotnet tool install -g',
      listCommand: ['tool', 'list', '-g'],
      platform: 'all',
    });
    
    // gem (Ruby)
    managers.set('gem', {
      name: 'gem',
      command: 'gem',
      versionCommand: ['--version'],
      installCommand: 'gem install',
      listCommand: ['list'],
      platform: 'all',
    });
    
    // composer (PHP)
    managers.set('composer', {
      name: 'composer',
      command: 'composer',
      versionCommand: ['--version'],
      installCommand: 'composer global require',
      listCommand: ['global', 'show'],
      platform: 'all',
    });
    
    return managers;
  }

  /**
   * 诊断所有可用的包管理器
   */
  async diagnoseAllPackageManagers(): Promise<Map<string, PackageManager & { available: boolean; version?: string }>> {
    const results = new Map();
    
    for (const [name, manager] of this.packageManagers.entries()) {
      // 检查平台兼容性
      if (manager.platform !== 'all' && manager.platform !== this.getCurrentPlatform()) {
        continue;
      }
      
      const result = await this.checkPackageManager(manager);
      results.set(name, {
        ...manager,
        available: result.available,
        version: result.version,
      });
    }
    
    return results;
  }

  /**
   * 检查单个包管理器
   */
  async checkPackageManager(manager: PackageManager): Promise<{ available: boolean; version?: string }> {
    try {
      const { stdout } = await execa(manager.command, manager.versionCommand, {
        timeout: 5000,
        shell: true,
      });
      return {
        available: true,
        version: stdout.trim().split('\n')[0],
      };
    } catch {
      return { available: false };
    }
  }

  /**
   * 诊断特定包的安装状态
   */
  async diagnosePackage(packageName: string, packageManager?: string): Promise<PackageInfo> {
    const issues: string[] = [];
    
    // 自动检测包管理器
    const manager = packageManager 
      ? this.packageManagers.get(packageManager)
      : await this.detectPackageManager(packageName);
    
    if (!manager) {
      return {
        name: packageName,
        installed: false,
        issues: ['无法确定包管理器'],
      };
    }
    
    // 检查包是否安装 - 使用快速检查
    const isInstalled = await this.checkPackageInstalledFast(manager, packageName);
    
    if (!isInstalled.installed) {
      issues.push(`包 ${packageName} 未安装`);
    }
    
    return {
      name: packageName,
      version: isInstalled.version,
      installed: isInstalled.installed,
      global: isInstalled.global,
      location: undefined,
      issues,
    };
  }

  /**
   * 快速检查包是否安装（简化版）
   */
  private async checkPackageInstalledFast(
    manager: PackageManager, 
    packageName: string
  ): Promise<{ installed: boolean; version?: string; global?: boolean }> {
    try {
      // 对于 npx 包，直接认为已安装（npx 会自动安装）
      if (manager.name === 'npm' && (packageName.startsWith('@') || packageName.includes('/'))) {
        return { installed: true, version: 'on-demand', global: false };
      }
      
      // 对于 uvx 包，直接认为已安装
      if (manager.name === 'uvx') {
        return { installed: true, version: 'on-demand', global: false };
      }
      
      // 其他情况使用完整检查
      return await this.checkPackageInstalled(manager, packageName);
    } catch {
      return { installed: false };
    }
  }

  /**
   * 检测包应该使用哪个包管理器
   */
  private async detectPackageManager(packageName: string): Promise<PackageManager | undefined> {
    // 根据包名特征检测
    if (packageName.startsWith('@') || packageName.includes('/')) {
      // npm 包
      const npm = this.packageManagers.get('npm');
      if (npm && (await this.checkPackageManager(npm)).available) {
        return npm;
      }
    }
    
    // Python 包
    if (!packageName.includes('/')) {
      const pip = this.packageManagers.get('pip');
      if (pip && (await this.checkPackageManager(pip)).available) {
        return pip;
      }
      const pip3 = this.packageManagers.get('pip3');
      if (pip3 && (await this.checkPackageManager(pip3)).available) {
        return pip3;
      }
      const uv = this.packageManagers.get('uv');
      if (uv && (await this.checkPackageManager(uv)).available) {
        return uv;
      }
    }
    
    // Rust 包
    if (this.packageManagers.get('cargo')) {
      const cargo = this.packageManagers.get('cargo')!;
      if ((await this.checkPackageManager(cargo)).available) {
        return cargo;
      }
    }
    
    // Go 包
    if (this.packageManagers.get('go')) {
      const go = this.packageManagers.get('go')!;
      if ((await this.checkPackageManager(go)).available) {
        return go;
      }
    }
    
    // 默认返回 npm
    return this.packageManagers.get('npm');
  }

  /**
   * 检查包是否安装
   */
  private async checkPackageInstalled(
    manager: PackageManager, 
    packageName: string
  ): Promise<{ installed: boolean; version?: string; global?: boolean }> {
    try {
      // 使用包管理器的 list 命令检查
      if (manager.checkCommand) {
        const { stdout } = await execa(manager.command, manager.checkCommand, {
          timeout: 10000,
          shell: true,
        });
        
        // 尝试解析 JSON 输出
        try {
          const json = JSON.parse(stdout);
          const found = this.findPackageInJson(json, packageName);
          if (found) {
            return {
              installed: true,
              version: found.version,
              global: found.global,
            };
          }
        } catch {
          // 不是 JSON 格式，检查文本输出
          if (stdout.includes(packageName)) {
            const version = this.extractVersion(stdout, packageName);
            return { installed: true, version };
          }
        }
      }
      
      // 备用方法：尝试获取包版本
      const versionCmd = this.getPackageVersionCommand(manager, packageName);
      if (versionCmd) {
        const { stdout } = await execa(manager.command, versionCmd, {
          timeout: 5000,
          shell: true,
          reject: false,
        });
        
        if (!stdout.includes('error') && !stdout.includes('not found')) {
          return { installed: true, version: stdout.trim() };
        }
      }
      
      return { installed: false };
    } catch {
      return { installed: false };
    }
  }

  /**
   * 在 JSON 输出中查找包
   */
  private findPackageInJson(json: any, packageName: string): { version?: string; global?: boolean } | null {
    // npm 的 JSON 输出格式
    if (json.dependencies) {
      const pkg = json.dependencies[packageName];
      if (pkg) {
        return { version: pkg.version, global: true };
      }
    }
    
    // pip 的 JSON 输出格式
    if (Array.isArray(json)) {
      const pkg = json.find((p: any) => p.name === packageName);
      if (pkg) {
        return { version: pkg.version };
      }
    }
    
    return null;
  }

  /**
   * 从文本中提取版本号
   */
  private extractVersion(text: string, packageName: string): string | undefined {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes(packageName)) {
        const match = line.match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : undefined;
      }
    }
    return undefined;
  }

  /**
   * 获取包的版本检查命令
   */
  private getPackageVersionCommand(manager: PackageManager, packageName: string): string[] | null {
    switch (manager.name) {
      case 'npm':
        return ['list', '-g', packageName, '--depth=0'];
      case 'pip':
      case 'pip3':
        return ['show', packageName];
      case 'cargo':
        return ['install', '--list'];
      case 'go':
        return ['list', '-m', packageName];
      case 'dotnet':
        return ['tool', 'list', '-g'];
      default:
        return null;
    }
  }

  /**
   * 检查包版本是否有问题
   */
  private async checkPackageVersion(
    manager: PackageManager,
    packageName: string,
    version: string
  ): Promise<{ hasIssue: boolean; message: string }> {
    // 检查是否是旧版本
    try {
      const latestVersion = await this.getLatestVersion(manager, packageName);
      if (latestVersion && this.isVersionOutdated(version, latestVersion)) {
        return {
          hasIssue: true,
          message: `版本过旧：当前 ${version}, 最新 ${latestVersion}`,
        };
      }
    } catch {
      // 无法获取最新版本，跳过检查
    }
    
    return { hasIssue: false, message: '' };
  }

  /**
   * 获取包的最新版本
   */
  private async getLatestVersion(manager: PackageManager, packageName: string): Promise<string | null> {
    try {
      let cmd: string[];
      switch (manager.name) {
        case 'npm':
          cmd = ['view', packageName, 'version'];
          break;
        case 'pip':
        case 'pip3':
          cmd = ['index', 'versions', packageName];
          break;
        case 'cargo':
          cmd = ['search', packageName, '--limit', '1'];
          break;
        default:
          return null;
      }
      
      const { stdout } = await execa(manager.command, cmd, {
        timeout: 10000,
        shell: true,
      });
      
      return stdout.trim();
    } catch {
      return null;
    }
  }

  /**
   * 检查版本是否过旧
   */
  private isVersionOutdated(current: string, latest: string): boolean {
    try {
      const currentParts = current.split('.').map(Number);
      const latestParts = latest.split('.').map(Number);
      
      for (let i = 0; i < Math.min(currentParts.length, latestParts.length); i++) {
        if (latestParts[i] > currentParts[i]) {
          return true;
        }
        if (latestParts[i] < currentParts[i]) {
          return false;
        }
      }
      
      return latestParts.length > currentParts.length;
    } catch {
      return false;
    }
  }

  /**
   * 获取包的安装位置
   */
  private async getPackageLocation(manager: PackageManager, packageName: string): Promise<string | null> {
    try {
      let cmd: string[];
      switch (manager.name) {
        case 'npm':
          cmd = ['root', '-g'];
          break;
        case 'pip':
        case 'pip3':
          cmd = ['show', '-f', packageName];
          break;
        default:
          return null;
      }
      
      const { stdout } = await execa(manager.command, cmd, {
        timeout: 5000,
        shell: true,
      });
      
      return stdout.trim().split('\n')[0];
    } catch {
      return null;
    }
  }

  /**
   * 诊断依赖冲突
   */
  async diagnoseDependencies(packageManager?: string): Promise<DependencyIssue[]> {
    const issues: DependencyIssue[] = [];
    const manager = packageManager 
      ? this.packageManagers.get(packageManager)
      : this.packageManagers.get('npm');
    
    if (!manager) return issues;
    
    try {
      // 检查依赖树
      if (manager.name === 'npm') {
        const npmIssues = await this.diagnoseNpmDependencies();
        issues.push(...npmIssues);
      } else if (manager.name === 'pip' || manager.name === 'pip3') {
        const pipIssues = await this.diagnosePipDependencies();
        issues.push(...pipIssues);
      }
    } catch (error) {
      issues.push({
        type: 'missing',
        package: 'unknown',
        message: `依赖检查失败：${error instanceof Error ? error.message : error}`,
        suggestion: '手动检查依赖关系',
      });
    }
    
    return issues;
  }

  /**
   * 诊断 npm 依赖问题
   */
  private async diagnoseNpmDependencies(): Promise<DependencyIssue[]> {
    const issues: DependencyIssue[] = [];
    
    try {
      // 检查 npm ls 输出
      const { stdout, stderr } = await execa('npm', ['ls', '--json'], {
        timeout: 30000,
        shell: true,
        reject: false,
      });
      
      // 分析错误输出
      if (stderr) {
        const peerDepsMatch = stderr.match(/UNMET PEER DEPENDENCY\s+(\S+)@(\S+)/g);
        if (peerDepsMatch) {
          for (const match of peerDepsMatch) {
            const [_, pkg, version] = match.split(/\s+/);
            issues.push({
              type: 'peer_dependency',
              package: pkg,
              expectedVersion: version,
              message: `未满足的同伴依赖：${pkg}@${version}`,
              suggestion: `安装正确的版本：npm install ${pkg}@${version}`,
            });
          }
        }
        
        const missingMatch = stderr.match(/ERROR\s+Could not resolve dependency:\s+(\S+)/g);
        if (missingMatch) {
          for (const match of missingMatch) {
            issues.push({
              type: 'missing',
              package: match,
              message: `无法解析依赖：${match}`,
              suggestion: '尝试删除 node_modules 并重新安装',
            });
          }
        }
      }
      
      // 检查 JSON 输出中的冲突
      if (stdout) {
        try {
          const json = JSON.parse(stdout);
          if (json.error) {
            issues.push({
              type: 'conflict',
              package: json.error.code || 'unknown',
              message: json.error.summary || '依赖冲突',
              suggestion: '检查 package.json 中的版本要求',
            });
          }
        } catch {
          // 忽略 JSON 解析错误
        }
      }
    } catch {
      // 忽略错误
    }
    
    return issues;
  }

  /**
   * 诊断 Python 依赖问题
   */
  private async diagnosePipDependencies(): Promise<DependencyIssue[]> {
    const issues: DependencyIssue[] = [];
    
    try {
      // 检查 pip check
      const { stdout, stderr } = await execa('pip', ['check'], {
        timeout: 30000,
        shell: true,
        reject: false,
      });
      
      if (stdout.includes('No broken requirements found')) {
        return issues;
      }
      
      // 解析冲突信息
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes('has requirement')) {
          const match = line.match(/(\S+)\s+has requirement\s+(\S+)\s+(.+)/);
          if (match) {
            const [_, pkg, required, constraint] = match;
            issues.push({
              type: 'version_mismatch',
              package: required,
              requiredBy: pkg,
              message: `${pkg} 需要 ${required} ${constraint}`,
              suggestion: `安装兼容版本：pip install "${required}${constraint}"`,
            });
          }
        }
      }
    } catch {
      // 忽略错误
    }
    
    return issues;
  }

  /**
   * 分析安装错误
   */
  analyzeInstallError(errorMessage: string, errorCode?: string): InstallError {
    const errorLower = errorMessage.toLowerCase();
    
    // 网络错误
    if (errorLower.includes('network') || 
        errorLower.includes('timeout') || 
        errorLower.includes('connection') ||
        errorLower.includes('fetch failed') ||
        errorLower.includes('econnrefused') ||
        errorLower.includes('enotfound')) {
      return {
        type: 'network',
        message: '网络连接失败',
        details: errorMessage,
        errorCode,
        suggestion: '检查网络连接，或配置镜像源',
      };
    }
    
    // 权限错误
    if (errorLower.includes('permission') || 
        errorLower.includes('eacces') ||
        errorLower.includes('epERM') ||
        errorLower.includes('access denied')) {
      return {
        type: 'permission',
        message: '权限不足',
        details: errorMessage,
        errorCode,
        suggestion: '使用管理员权限运行，或修复目录权限',
      };
    }
    
    // 版本冲突
    if (errorLower.includes('version') || 
        errorLower.includes('conflict') ||
        errorLower.includes('incompatible')) {
      return {
        type: 'version_conflict',
        message: '版本冲突',
        details: errorMessage,
        errorCode,
        suggestion: '检查依赖版本要求，尝试更新或删除冲突包',
      };
    }
    
    // 运行时缺失
    if (errorLower.includes('runtime') || 
        errorLower.includes('not found') ||
        errorLower.includes('missing')) {
      return {
        type: 'missing_runtime',
        message: '缺少运行时环境',
        details: errorMessage,
        errorCode,
        suggestion: '安装所需的运行时环境',
      };
    }
    
    // 磁盘空间
    if (errorLower.includes('disk') || 
        errorLower.includes('space') ||
        errorLower.includes('enospc')) {
      return {
        type: 'disk_space',
        message: '磁盘空间不足',
        details: errorMessage,
        errorCode,
        suggestion: '清理磁盘空间后重试',
      };
    }
    
    // 未知错误
    return {
      type: 'unknown',
      message: '未知错误',
      details: errorMessage,
      errorCode,
      suggestion: '查看详细错误日志，或尝试重新安装',
    };
  }

  /**
   * 生成修复建议
   */
  generateSuggestions(
    packageInfo: PackageInfo,
    dependencyIssues: DependencyIssue[],
    installErrors: InstallError[]
  ): string[] {
    const suggestions: string[] = [];
    
    // 包未安装
    if (!packageInfo.installed) {
      suggestions.push(`安装包：${packageInfo.name}`);
    }
    
    // 依赖问题
    for (const issue of dependencyIssues) {
      suggestions.push(issue.suggestion);
    }
    
    // 安装错误
    for (const error of installErrors) {
      if (error.type === 'network') {
        suggestions.push('配置镜像源：npm config set registry https://registry.npmmirror.com');
        suggestions.push('配置镜像源：pip install -i https://pypi.tuna.tsinghua.edu.cn/simple');
      } else if (error.type === 'permission') {
        suggestions.push('Windows: 以管理员身份运行终端');
        suggestions.push('修复 npm 权限：npm config set prefix %APPDATA%\\npm');
      }
    }
    
    return suggestions;
  }

  /**
   * 获取当前平台
   */
  private getCurrentPlatform(): 'windows' | 'macos' | 'linux' {
    const platform = os.platform();
    if (platform === 'win32') return 'windows';
    if (platform === 'darwin') return 'macos';
    return 'linux';
  }

  /**
   * 打印诊断结果
   */
  printDiagnosticResult(result: PackageDiagnosticResult): void {
    console.log(chalk.bold.cyan('\n═'.repeat(60)));
    console.log(chalk.bold.cyan('  包安装诊断报告'));
    console.log(chalk.bold.cyan('═'.repeat(60)));
    
    // 包管理器信息
    console.log(chalk.bold(`\n📦 包管理器：${chalk.green(result.packageManager)}`));
    if (result.packageManagerVersion) {
      console.log(chalk.gray(`   版本：${result.packageManagerVersion}`));
    }
    
    // 统计信息
    console.log(chalk.bold('\n📊 统计:'));
    console.log(`   检查包数：${result.packagesChecked}`);
    console.log(`   已安装：${chalk.green(result.packagesInstalled.toString())}`);
    console.log(`   缺失：${chalk.red(result.packagesMissing.toString())}`);
    
    // 依赖问题
    if (result.dependencyIssues.length > 0) {
      console.log(chalk.bold.yellow('\n⚠️  依赖问题:'));
      for (const issue of result.dependencyIssues) {
        const icon = issue.type === 'conflict' ? '❌' : '⚠️';
        console.log(`   ${icon} ${issue.message}`);
        console.log(chalk.gray(`      建议：${issue.suggestion}`));
      }
    }
    
    // 安装错误
    if (result.installErrors.length > 0) {
      console.log(chalk.bold.red('\n❌ 安装错误:'));
      for (const error of result.installErrors) {
        console.log(chalk.red(`   ${error.message}`));
        console.log(chalk.gray(`      详情：${error.details}`));
        console.log(chalk.cyan(`      建议：${error.suggestion}`));
      }
    }
    
    // 建议
    if (result.suggestions.length > 0) {
      console.log(chalk.bold.cyan('\n💡 建议:'));
      for (const suggestion of result.suggestions) {
        console.log(chalk.cyan(`   • ${suggestion}`));
      }
    }
    
    console.log();
  }
}
