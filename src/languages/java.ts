import { LanguageChecker, LanguageCheckResult } from './base-checker.js';

export class JavaChecker extends LanguageChecker {
  readonly name = 'java';
  readonly versionArgs = ['-version'];
  readonly packageManagerName = 'mvn';
  readonly packageManagerVersionArgs = ['-version'];

  async check(): Promise<LanguageCheckResult> {
    const baseResult = await super.check();
    
    const issues = [...baseResult.issues];
    const suggestions = [...baseResult.suggestions];

    if (baseResult.available) {
      // Check JAVA_HOME
      if (!process.env.JAVA_HOME) {
        issues.push('JAVA_HOME environment variable is not set');
        suggestions.push('Set JAVA_HOME to your JDK installation directory');
      }

      // Check Java version (should be >= 11 for most modern tools)
      const version = baseResult.version;
      if (version) {
        const match = version.match(/(\d+)/);
        if (match && parseInt(match[1]) < 11) {
          issues.push('Java version is below 11, modern tools may not work');
          suggestions.push('Upgrade to Java 11 or later (LTS recommended: 17, 21)');
        }
      }

      // Check for Maven or Gradle
      try {
        const { execa } = await import('execa');
        await execa('mvn', ['--version'], { timeout: 5000 });
      } catch {
        try {
          const { execa } = await import('execa');
          await execa('gradle', ['--version'], { timeout: 5000 });
        } catch {
          suggestions.push('Consider installing Maven or Gradle for Java project management');
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
      return 'winget install EclipseAdoptium.Temurin.17.JDK';
    } else if (process.platform === 'darwin') {
      return 'brew install openjdk@17';
    } else {
      return 'sudo apt-get install openjdk-17-jdk';
    }
  }

  getCommonIssues(): Array<{ issue: string; solution: string }> {
    return [
      {
        issue: 'JAVA_HOME not set',
        solution: 'Set JAVA_HOME to JDK path and add %JAVA_HOME%\\bin to PATH (Windows) or $JAVA_HOME/bin to PATH (Unix)',
      },
      {
        issue: 'Multiple Java versions conflict',
        solution: 'Use jEnv (macOS/Linux) or update-alternatives (Linux) to manage versions',
      },
      {
        issue: 'Maven build fails',
        solution: 'Check settings.xml, clear ~/.m2/repository cache, or update Maven',
      },
      {
        issue: 'OutOfMemoryError',
        solution: 'Increase heap size: export MAVEN_OPTS="-Xmx2g -XX:MaxPermSize=512m"',
      },
    ];
  }
}
