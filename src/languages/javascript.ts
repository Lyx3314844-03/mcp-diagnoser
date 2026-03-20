import { LanguageChecker, LanguageCheckResult } from './base-checker.js';

export class JavaScriptChecker extends LanguageChecker {
  readonly name = 'node';
  readonly versionArgs = ['--version'];
  readonly packageManagerName = 'npm';
  readonly packageManagerVersionArgs = ['--version'];

  async check(): Promise<LanguageCheckResult> {
    const baseResult = await super.check();
    
    // Additional checks for Node.js
    const issues = [...baseResult.issues];
    const suggestions = [...baseResult.suggestions];

    if (baseResult.available) {
      // Check Node.js version (should be >= 18 for MCP)
      const version = baseResult.version;
      if (version) {
        const match = version.match(/v?(\d+)/);
        if (match && parseInt(match[1]) < 18) {
          issues.push('Node.js version is below 18, MCP may not work properly');
          suggestions.push('Upgrade to Node.js 18 or later');
        }
      }

      // Check for npx
      try {
        const { stdout } = await this.exec(['npx', '--version']);
        if (!stdout) {
          issues.push('npx is not available');
          suggestions.push('Ensure Node.js is properly installed');
        }
      } catch {
        issues.push('npx is not available');
        suggestions.push('Reinstall Node.js');
      }
    }

    return {
      ...baseResult,
      issues,
      suggestions,
    };
  }

  private async exec(args: string[]): Promise<{ stdout: string }> {
    const { execa } = await import('execa');
    return execa(args[0], args.slice(1), { timeout: 5000 });
  }

  getInstallCommand(): string {
    if (process.platform === 'win32') {
      return 'winget install OpenJS.NodeJS.LTS';
    } else if (process.platform === 'darwin') {
      return 'brew install node';
    } else {
      return 'curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs';
    }
  }

  getCommonIssues(): Array<{ issue: string; solution: string }> {
    return [
      {
        issue: 'npm install fails with EACCES',
        solution: 'Run: npm config set prefix ~/.npm-global && export PATH=~/.npm-global/bin:$PATH',
      },
      {
        issue: 'npx command not found',
        solution: 'Reinstall Node.js or ensure npm is in PATH',
      },
      {
        issue: 'Module not found errors',
        solution: 'Delete node_modules and package-lock.json, then run npm install',
      },
    ];
  }
}
