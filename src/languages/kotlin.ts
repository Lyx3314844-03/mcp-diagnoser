import { LanguageChecker, LanguageCheckResult } from './base-checker.js';

export class KotlinChecker extends LanguageChecker {
  readonly name = 'kotlinc';
  readonly versionArgs = ['-version'];
  readonly packageManagerName = 'gradle';
  readonly packageManagerVersionArgs = ['--version'];

  async check(): Promise<LanguageCheckResult> {
    const baseResult = await super.check();
    
    const issues = [...baseResult.issues];
    const suggestions = [...baseResult.suggestions];

    if (baseResult.available) {
      // Check Kotlin version (should be >= 1.8)
      const version = baseResult.version;
      if (version) {
        const match = version.match(/(\d+)\.(\d+)/);
        if (match && (parseInt(match[1]) < 1 || (parseInt(match[1]) === 1 && parseInt(match[2]) < 8))) {
          issues.push('Kotlin version is below 1.8, consider upgrading');
          suggestions.push('Upgrade to Kotlin 1.8 or later (1.9+ recommended)');
        }
      }

      // Check for Java (Kotlin requires JVM)
      try {
        const { execa } = await import('execa');
        await execa('java', ['-version'], { timeout: 5000 });
      } catch {
        issues.push('Java is not installed, Kotlin requires JVM');
        suggestions.push('Install Java JDK: winget install EclipseAdoptium.Temurin.17.JDK');
      }

      // Check for build tool (Gradle or Maven)
      const hasBuildTool = await this.checkBuildTool();
      if (!hasBuildTool) {
        suggestions.push('Consider installing Gradle or Maven for Kotlin project management');
      }
    } else {
      // Try kotlin (some installations use 'kotlin' instead of 'kotlinc')
      try {
        const { execa } = await import('execa');
        const { stdout } = await execa('kotlin', ['-version'], { timeout: 5000 });
        baseResult.available = true;
        baseResult.version = stdout.trim();
        baseResult.path = await this.findCommandPath('kotlin');
      } catch {
        // Neither kotlinc nor kotlin found
      }
    }

    return {
      ...baseResult,
      issues,
      suggestions,
    };
  }

  private async checkBuildTool(): Promise<boolean> {
    try {
      const { execa } = await import('execa');
      try {
        await execa('gradle', ['--version'], { timeout: 5000 });
        return true;
      } catch {
        await execa('mvn', ['--version'], { timeout: 5000 });
        return true;
      }
    } catch {
      return false;
    }
  }

  getInstallCommand(): string {
    if (process.platform === 'win32') {
      return 'winget install JetBrains.Kotlin';
    } else if (process.platform === 'darwin') {
      return 'brew install kotlin';
    } else {
      return 'sudo apt-get install kotlin';
    }
  }

  getCommonIssues(): Array<{ issue: string; solution: string }> {
    return [
      {
        issue: 'kotlinc command not found',
        solution: 'Ensure Kotlin is in PATH or use SDKMAN: sdk install kotlin',
      },
      {
        issue: 'Java version incompatibility',
        solution: 'Ensure Java 8 or later is installed and JAVA_HOME is set',
      },
      {
        issue: 'Gradle build fails',
        solution: 'Run: gradle clean build --refresh-dependencies',
      },
      {
        issue: 'Kotlin stdlib not found',
        solution: 'Add dependency: implementation "org.jetbrains.kotlin:kotlin-stdlib"',
      },
    ];
  }
}
