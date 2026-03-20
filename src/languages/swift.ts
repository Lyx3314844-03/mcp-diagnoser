import { LanguageChecker, LanguageCheckResult } from './base-checker.js';

export class SwiftChecker extends LanguageChecker {
  readonly name = 'swift';
  readonly versionArgs = ['--version'];
  readonly packageManagerName = 'swift';
  readonly packageManagerVersionArgs = ['package', '--version'];

  async check(): Promise<LanguageCheckResult> {
    const baseResult = await super.check();
    
    const issues = [...baseResult.issues];
    const suggestions = [...baseResult.suggestions];

    if (baseResult.available) {
      // Check Swift version (should be >= 5.7)
      const version = baseResult.version;
      if (version) {
        const match = version.match(/(\d+)\.(\d+)/);
        if (match && (parseInt(match[1]) < 5 || (parseInt(match[1]) === 5 && parseInt(match[2]) < 7))) {
          issues.push('Swift version is below 5.7, consider upgrading');
          suggestions.push('Upgrade to Swift 5.7 or later (5.9+ recommended)');
        }
      }

      // Check for Xcode command line tools (macOS)
      if (process.platform === 'darwin') {
        try {
          const { execa } = await import('execa');
          await execa('xcode-select', ['-p'], { timeout: 5000 });
        } catch {
          issues.push('Xcode command line tools are not installed');
          suggestions.push('Run: xcode-select --install');
        }
      }

      // Check for Swift Package Manager
      try {
        const { execa } = await import('execa');
        await execa('swift', ['package', '--version'], { timeout: 5000 });
      } catch {
        suggestions.push('Swift Package Manager may not be available');
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
      return 'winget install Swiftlang.Swift.RELEASE';
    } else if (process.platform === 'darwin') {
      return 'xcode-select --install && brew install swift';
    } else {
      return 'Download from https://swift.org/download/ and follow installation instructions';
    }
  }

  getCommonIssues(): Array<{ issue: string; solution: string }> {
    return [
      {
        issue: 'swift command not found',
        solution: 'Ensure Swift is in PATH or reinstall from swift.org',
      },
      {
        issue: 'package resolve fails',
        solution: 'Run: swift package reset && swift package resolve',
      },
      {
        issue: 'build fails on Linux',
        solution: 'Install dependencies: sudo apt-get install libcurl4-openssl-dev libssl-dev',
      },
      {
        issue: 'Xcode version conflicts',
        solution: 'Run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer',
      },
    ];
  }
}
