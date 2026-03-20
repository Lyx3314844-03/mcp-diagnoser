import { LanguageChecker, LanguageCheckResult } from './base-checker.js';

export class PHPChecker extends LanguageChecker {
  readonly name = 'php';
  readonly versionArgs = ['--version'];
  readonly packageManagerName = 'composer';
  readonly packageManagerVersionArgs = ['--version'];

  async check(): Promise<LanguageCheckResult> {
    const baseResult = await super.check();
    
    const issues = [...baseResult.issues];
    const suggestions = [...baseResult.suggestions];

    if (baseResult.available) {
      // Check PHP version (should be >= 8.0)
      const version = baseResult.version;
      if (version) {
        const match = version.match(/(\d+)\.(\d+)/);
        if (match && parseInt(match[1]) < 8) {
          issues.push('PHP version is below 8.0, consider upgrading');
          suggestions.push('Upgrade to PHP 8.0 or later (8.2+ recommended)');
        }
      }

      // Check for Composer
      try {
        const { execa } = await import('execa');
        await execa('composer', ['--version'], { timeout: 5000 });
      } catch {
        issues.push('Composer is not installed');
        suggestions.push('Install Composer from https://getcomposer.org/');
      }

      // Check for common extensions
      const requiredExtensions = ['mbstring', 'xml', 'curl', 'json'];
      const missingExtensions: string[] = [];
      
      try {
        const { execa } = await import('execa');
        const { stdout } = await execa('php', ['-m'], { timeout: 5000 });
        const installedModules = stdout.toLowerCase().split('\n').map(m => m.trim());
        
        for (const ext of requiredExtensions) {
          if (!installedModules.includes(ext)) {
            missingExtensions.push(ext);
          }
        }
        
        if (missingExtensions.length > 0) {
          issues.push(`Missing PHP extensions: ${missingExtensions.join(', ')}`);
          suggestions.push(`Install missing extensions: apt-get install php-${missingExtensions.join(' php-')}`);
        }
      } catch {
        // Can't check extensions
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
      return 'winget install PHP.PHP';
    } else if (process.platform === 'darwin') {
      return 'brew install php';
    } else {
      return 'sudo apt-get install php php-cli php-mbstring php-xml php-curl';
    }
  }

  getCommonIssues(): Array<{ issue: string; solution: string }> {
    return [
      {
        issue: 'composer install fails',
        solution: 'Run: composer clear-cache && composer install --no-cache',
      },
      {
        issue: 'memory_limit exceeded',
        solution: 'Increase memory_limit in php.ini: memory_limit = 512M',
      },
      {
        issue: 'extension not found',
        solution: 'Enable in php.ini: extension=mbstring, then restart web server',
      },
      {
        issue: 'composer permission denied',
        solution: 'Run: sudo chown -R $USER ~/.composer',
      },
    ];
  }
}
