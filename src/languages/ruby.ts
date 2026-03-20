import { LanguageChecker, LanguageCheckResult } from './base-checker.js';

export class RubyChecker extends LanguageChecker {
  readonly name = 'ruby';
  readonly versionArgs = ['--version'];
  readonly packageManagerName = 'gem';
  readonly packageManagerVersionArgs = ['--version'];

  async check(): Promise<LanguageCheckResult> {
    const baseResult = await super.check();
    
    const issues = [...baseResult.issues];
    const suggestions = [...baseResult.suggestions];

    if (baseResult.available) {
      // Check Ruby version (should be >= 2.7)
      const version = baseResult.version;
      if (version) {
        const match = version.match(/(\d+)\.(\d+)/);
        if (match && (parseInt(match[1]) < 2 || (parseInt(match[1]) === 2 && parseInt(match[2]) < 7))) {
          issues.push('Ruby version is below 2.7, consider upgrading');
          suggestions.push('Upgrade to Ruby 2.7 or later (3.x recommended)');
        }
      }

      // Check for bundler
      try {
        const { execa } = await import('execa');
        await execa('bundle', ['--version'], { timeout: 5000 });
      } catch {
        issues.push('Bundler is not installed');
        suggestions.push('Run: gem install bundler');
      }

      // Check for rbenv or rvm
      const hasVersionManager = process.env.RBENV_VERSION || process.env.RVM_VERSION || process.env.ASDF_DEFAULT_TOOL_VERSION;
      if (!hasVersionManager) {
        suggestions.push('Consider using rbenv or rvm for Ruby version management');
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
      return 'winget install RubyInstallerTeam.Ruby';
    } else if (process.platform === 'darwin') {
      return 'brew install ruby';
    } else {
      return 'sudo apt-get install ruby-full';
    }
  }

  getCommonIssues(): Array<{ issue: string; solution: string }> {
    return [
      {
        issue: 'gem install fails with permission denied',
        solution: 'Use: gem install --user-install <gem> or use rbenv/rvm',
      },
      {
        issue: 'bundle install fails',
        solution: 'Run: bundle config set --local path \'vendor/bundle\' && bundle install',
      },
      {
        issue: 'Ruby version mismatch',
        solution: 'Use rbenv: rbenv install <version> && rbenv local <version>',
      },
      {
        issue: 'native extension build fails',
        solution: 'Install build tools: winget install MSYS2.MSYS2 (Windows) or build-essential (Linux)',
      },
    ];
  }
}
