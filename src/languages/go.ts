import { LanguageChecker, LanguageCheckResult } from './base-checker.js';

export class GoChecker extends LanguageChecker {
  readonly name = 'go';
  readonly versionArgs = ['version'];
  readonly packageManagerName = 'go';
  readonly packageManagerVersionArgs = ['version'];

  async check(): Promise<LanguageCheckResult> {
    const baseResult = await super.check();
    
    const issues = [...baseResult.issues];
    const suggestions = [...baseResult.suggestions];

    if (baseResult.available) {
      // Check GOPATH
      if (!process.env.GOPATH) {
        issues.push('GOPATH environment variable is not set');
        suggestions.push('Set GOPATH to your Go workspace directory');
      }

      // Check GO111MODULE
      if (!process.env.GO111MODULE) {
        suggestions.push('Consider setting GO111MODULE=on for module support');
      }

      // Check Go version (should be >= 1.20)
      const version = baseResult.version;
      if (version) {
        const match = version.match(/go(\d+)\.(\d+)/);
        if (match && (parseInt(match[1]) < 1 || (parseInt(match[1]) === 1 && parseInt(match[2]) < 20))) {
          issues.push('Go version is below 1.20, consider upgrading');
          suggestions.push('Upgrade to Go 1.20 or later');
        }
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
      return 'winget install GoLang.Go';
    } else if (process.platform === 'darwin') {
      return 'brew install go';
    } else {
      return 'sudo apt-get install golang-go';
    }
  }

  getCommonIssues(): Array<{ issue: string; solution: string }> {
    return [
      {
        issue: 'go mod download fails',
        solution: 'Check network, try: go mod download -x or use GOPROXY=https://goproxy.io',
      },
      {
        issue: 'command not found after install',
        solution: 'Add $GOPATH/bin to PATH: export PATH=$PATH:$(go env GOPATH)/bin',
      },
      {
        issue: 'build fails with import errors',
        solution: 'Run: go mod tidy to clean up dependencies',
      },
      {
        issue: 'cgo errors',
        solution: 'Install GCC: winget install MSYS2.MSYS2 (Windows) or build-essential (Linux)',
      },
    ];
  }
}
