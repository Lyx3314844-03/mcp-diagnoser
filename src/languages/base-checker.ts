import { execa } from 'execa';

export interface LanguageRuntime {
  name: string;
  available: boolean;
  version?: string;
  path?: string;
  packageManager?: {
    name: string;
    available: boolean;
    version?: string;
  };
}

export interface LanguageCheckResult {
  available: boolean;
  version?: string;
  path?: string;
  issues: string[];
  suggestions: string[];
}

export abstract class LanguageChecker {
  abstract readonly name: string;
  abstract readonly versionArgs: string[];
  abstract readonly packageManagerName?: string;
  abstract readonly packageManagerVersionArgs?: string[];

  async check(): Promise<LanguageCheckResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check runtime availability
    const runtimeCheck = await this.checkCommand(this.versionArgs);
    if (!runtimeCheck.found) {
      issues.push(`${this.name} runtime is not installed or not in PATH`);
      suggestions.push(this.getInstallCommand());
      return {
        available: false,
        issues,
        suggestions,
      };
    }

    // Check package manager
    let packageManager: { name: string; available: boolean; version?: string } | undefined;
    if (this.packageManagerName && this.packageManagerVersionArgs) {
      const pmCheck = await this.checkCommand(this.packageManagerVersionArgs);
      packageManager = {
        name: this.packageManagerName,
        available: pmCheck.found,
        version: pmCheck.version,
      };
      if (!pmCheck.found) {
        issues.push(`${this.packageManagerName} is not available`);
      }
    }

    return {
      available: true,
      version: runtimeCheck.version,
      path: runtimeCheck.path,
      issues,
      suggestions,
    };
  }

  async checkAll(): Promise<Record<string, LanguageRuntime>> {
    const result: Record<string, LanguageRuntime> = {};
    const checkResult = await this.check();
    
    result[this.name] = {
      name: this.name,
      available: checkResult.available,
      version: checkResult.version,
      path: checkResult.path,
      packageManager: checkResult.available && this.packageManagerName ? {
        name: this.packageManagerName,
        available: checkResult.issues.length === 0,
        version: undefined,
      } : undefined,
    };
    
    return result;
  }

  protected async checkCommand(args: string[]): Promise<{ found: boolean; version?: string; path?: string }> {
    try {
      const command = this.name.toLowerCase();
      const { stdout, stderr } = await execa(command, args, { timeout: 5000 });
      const version = this.extractVersion(stdout || stderr);
      return { found: true, version, path: await this.findCommandPath(command) };
    } catch {
      return { found: false };
    }
  }

  protected async findCommandPath(command: string): Promise<string | undefined> {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execa('where', [command], { timeout: 3000 });
        return stdout.split('\n')[0].trim() || undefined;
      } else {
        const { stdout } = await execa('which', [command], { timeout: 3000 });
        return stdout.trim() || undefined;
      }
    } catch {
      return undefined;
    }
  }

  protected extractVersion(output: string): string {
    // Common version patterns
    const patterns = [
      /v?(\d+\.\d+\.\d+)/,
      /version\s+v?(\d+\.\d+\.\d+)/i,
      /(\d+\.\d+\.\d+)/,
    ];

    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return output.split('\n')[0].trim().substring(0, 50);
  }

  abstract getInstallCommand(): string;
  abstract getCommonIssues(): Array<{ issue: string; solution: string }>;
}
