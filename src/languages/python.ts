import { LanguageChecker, LanguageCheckResult } from './base-checker.js';

export class PythonChecker extends LanguageChecker {
  readonly name = 'python';
  readonly versionArgs = ['--version'];
  readonly packageManagerName = 'pip';
  readonly packageManagerVersionArgs = ['--version'];

  async check(): Promise<LanguageCheckResult> {
    const baseResult = await super.check();
    
    const issues = [...baseResult.issues];
    const suggestions = [...baseResult.suggestions];

    if (baseResult.available) {
      // Check Python version (should be >= 3.8)
      const version = baseResult.version;
      if (version) {
        const match = version.match(/(\d+)\.(\d+)/);
        if (match && (parseInt(match[1]) < 3 || (parseInt(match[1]) === 3 && parseInt(match[2]) < 8))) {
          issues.push('Python version is below 3.8, some features may not work');
          suggestions.push('Upgrade to Python 3.8 or later');
        }
      }

      // Check for uv (modern Python package manager)
      try {
        const { execa } = await import('execa');
        const { stdout } = await execa('uv', ['--version'], { timeout: 5000 });
        // uv is available
      } catch {
        suggestions.push('Consider installing uv for faster Python package management: pip install uv');
      }

      // Check for virtual environment
      const hasVenv = process.env.VIRTUAL_ENV || process.env.CONDA_DEFAULT_ENV;
      if (!hasVenv) {
        suggestions.push('Consider using a virtual environment for isolated dependencies');
      }
    } else {
      // Try python3
      try {
        const { execa } = await import('execa');
        const { stdout } = await execa('python3', ['--version'], { timeout: 5000 });
        baseResult.available = true;
        baseResult.version = stdout.trim();
        baseResult.path = await this.findCommandPath('python3');
      } catch {
        // Neither python nor python3 found
      }
    }

    return {
      ...baseResult,
      issues,
      suggestions,
    };
  }

  getInstallCommand(): string {
    if (process.platform === 'win32') {
      return 'winget install Python.Python.3.12';
    } else if (process.platform === 'darwin') {
      return 'brew install python@3.12';
    } else {
      return 'sudo apt-get install python3 python3-pip python3-venv';
    }
  }

  getCommonIssues(): Array<{ issue: string; solution: string }> {
    return [
      {
        issue: 'pip install fails with permission denied',
        solution: 'Use: pip install --user <package> or use virtual environment',
      },
      {
        issue: 'ModuleNotFoundError',
        solution: 'Run: pip install -r requirements.txt or pip install <package-name>',
      },
      {
        issue: 'Python 2 vs Python 3 conflicts',
        solution: 'Always use python3 and pip3 explicitly, or set up aliases',
      },
      {
        issue: 'uv command not found',
        solution: 'Run: pip install uv',
      },
    ];
  }
}
