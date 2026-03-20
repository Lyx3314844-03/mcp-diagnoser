import { LanguageChecker, LanguageCheckResult } from './base-checker.js';

export class CSharpChecker extends LanguageChecker {
  readonly name = 'dotnet';
  readonly versionArgs = ['--version'];
  readonly packageManagerName = 'dotnet';
  readonly packageManagerVersionArgs = ['--version'];

  async check(): Promise<LanguageCheckResult> {
    const baseResult = await super.check();
    
    const issues = [...baseResult.issues];
    const suggestions = [...baseResult.suggestions];

    if (baseResult.available) {
      // Check .NET SDK version
      const version = baseResult.version;
      if (version) {
        const match = version.match(/(\d+)\.(\d+)/);
        if (match && parseInt(match[1]) < 6) {
          issues.push('.NET version is below 6.0, modern features may not work');
          suggestions.push('Upgrade to .NET 6.0 or later (LTS recommended: 6, 8)');
        }
      }

      // Check for specific workloads
      try {
        const { execa } = await import('execa');
        const { stdout } = await execa('dotnet', ['workload', 'list'], { timeout: 5000 });
        if (stdout.includes('No workloads installed')) {
          suggestions.push('Consider installing additional workloads: dotnet workload search');
        }
      } catch {
        // workload command may not be available in older versions
      }

      // Check DOTNET_ROOT
      if (!process.env.DOTNET_ROOT && !process.env.DOTNET_INSTALL_DIR) {
        suggestions.push('Consider setting DOTNET_ROOT for consistent behavior');
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
      return 'winget install Microsoft.DotNet.SDK.8';
    } else if (process.platform === 'darwin') {
      return 'brew install --cask dotnet-sdk';
    } else {
      return 'wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb && sudo dpkg -i packages-microsoft-prod.deb && sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0';
    }
  }

  getCommonIssues(): Array<{ issue: string; solution: string }> {
    return [
      {
        issue: 'dotnet command not found',
        solution: 'Add dotnet to PATH or reinstall .NET SDK',
      },
      {
        issue: 'NuGet restore fails',
        solution: 'Run: dotnet nuget locals all --clear && dotnet restore',
      },
      {
        issue: 'SDK version mismatch',
        solution: 'Create global.json with required SDK version or install the required version',
      },
      {
        issue: 'build fails with MSBxxxx errors',
        solution: 'Check project file syntax, run: dotnet clean && dotnet build --verbosity detailed',
      },
    ];
  }
}
