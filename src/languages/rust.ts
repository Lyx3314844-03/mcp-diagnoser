import { LanguageChecker, LanguageCheckResult } from './base-checker.js';

export class RustChecker extends LanguageChecker {
  readonly name = 'cargo';
  readonly versionArgs = ['--version'];
  readonly packageManagerName = 'cargo';
  readonly packageManagerVersionArgs = ['--version'];

  async check(): Promise<LanguageCheckResult> {
    const baseResult = await super.check();
    
    const issues = [...baseResult.issues];
    const suggestions = [...baseResult.suggestions];

    if (baseResult.available) {
      // Check rustc
      try {
        const { execa } = await import('execa');
        const { stdout } = await execa('rustc', ['--version'], { timeout: 5000 });
        // rustc is available
      } catch {
        issues.push('rustc is not available, Cargo installation may be incomplete');
        suggestions.push('Reinstall Rust using rustup');
      }

      // Check for rustfmt and clippy (common tools)
      try {
        const { execa } = await import('execa');
        await execa('cargo', ['fmt', '--version'], { timeout: 5000 });
      } catch {
        suggestions.push('Run: rustup component add rustfmt');
      }

      try {
        const { execa } = await import('execa');
        await execa('cargo', ['clippy', '--version'], { timeout: 5000 });
      } catch {
        suggestions.push('Run: rustup component add clippy');
      }

      // Check Rust version (should be reasonably recent)
      const version = baseResult.version;
      if (version) {
        const match = version.match(/(\d+)\.(\d+)/);
        if (match && parseInt(match[1]) < 1) {
          issues.push('Rust version is below 1.0, this should not happen');
          suggestions.push('Reinstall Rust using rustup');
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
      return 'winget install Rustlang.Rustup';
    } else if (process.platform === 'darwin') {
      return 'brew install rustup-init && rustup-init -y';
    } else {
      return 'curl --proto \'=https\' --tlsv1.2 -sSf https://sh.rustup.rs | sh';
    }
  }

  getCommonIssues(): Array<{ issue: string; solution: string }> {
    return [
      {
        issue: 'cargo build fails with linker errors',
        solution: 'Install build tools: winget install Microsoft.VisualStudio.2022.BuildTools (Windows)',
      },
      {
        issue: 'crate download is slow',
        solution: 'Use mirror: cargo config set source.crates-io.replace-with \'mirror\' with https://mirrors.tuna.tsinghua.edu.cn/crates.io',
      },
      {
        issue: 'rustup update fails',
        solution: 'Run: rustup self update && rustup update',
      },
      {
        issue: 'permission denied in ~/.cargo',
        solution: 'Run: sudo chown -R $USER:$USER ~/.cargo',
      },
    ];
  }
}
