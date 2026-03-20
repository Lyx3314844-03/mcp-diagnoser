/**
 * Firecrawl-based Enhanced Search
 * Uses Firecrawl API for better search results without anti-bot issues
 */

import chalk from 'chalk';
import { execa } from 'execa';

export interface FirecrawlSearchResult {
  title: string;
  url: string;
  description: string;
  position: number;
}

export interface FirecrawlSearchOptions {
  query?: string;
  limit?: number;
  lang?: string;
  country?: string;
}

export class FirecrawlSearcher {
  private apiKey?: string;
  private apiUrl = 'https://api.firecrawl.dev/v0';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FIRECRAWL_API_KEY;
  }

  /**
   * Search using Firecrawl API
   */
  async search(query: string, options: FirecrawlSearchOptions = {}): Promise<FirecrawlSearchResult[]> {
    if (!this.apiKey) {
      console.warn(chalk.yellow('Firecrawl API key not set. Using fallback search.'));
      return this.fallbackSearch(query, options);
    }

    try {
      const { stdout } = await execa('curl', [
        '-s',
        '-X', 'POST',
        `${this.apiUrl}/search`,
        '-H', `Authorization: Bearer ${this.apiKey}`,
        '-H', 'Content-Type: application/json',
        '-d', JSON.stringify({
          query: options.query || query,
          limit: options.limit || 10,
          lang: options.lang || 'zh',
          country: options.country || 'cn',
        }),
      ], { timeout: 30000 });

      const response = JSON.parse(stdout);
      
      if (response.success && response.data) {
        return response.data.map((item: any, index: number) => ({
          title: item.title || item.url || 'Untitled',
          url: item.url,
          description: item.description || '',
          position: index + 1,
        }));
      }

      return [];
    } catch (error) {
      console.warn(chalk.yellow(`Firecrawl search failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return this.fallbackSearch(query, options);
    }
  }

  /**
   * Fallback search using native tools
   */
  private async fallbackSearch(query: string, options: FirecrawlSearchOptions = {}): Promise<FirecrawlSearchResult[]> {
    console.log(chalk.cyan('Using fallback search...'));
    
    // Use DuckDuckGo (less anti-bot protection)
    const duckduckgoUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    try {
      const { stdout } = await execa('curl', [
        '-s',
        '-L',
        '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        '--max-time', '10',
        duckduckgoUrl,
      ], { timeout: 15000 });

      return this.parseDuckDuckGoResults(stdout);
    } catch (error) {
      console.warn(chalk.yellow(`Fallback search failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return [];
    }
  }

  /**
   * Parse DuckDuckGo HTML results
   */
  private parseDuckDuckGoResults(html: string): FirecrawlSearchResult[] {
    const results: FirecrawlSearchResult[] = [];
    const seenUrls = new Set<string>();

    // DuckDuckGo result pattern
    const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]{0,200}?)<\/a>/gi;
    const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([\s\S]{0,300}?)<\/a>/gi;
    
    let match;
    const titles: string[] = [];
    
    while ((match = resultRegex.exec(html)) !== null) {
      titles.push(match[2].replace(/<[^>]*>/g, '').trim());
    }
    
    const snippets: string[] = [];
    while ((match = snippetRegex.exec(html)) !== null) {
      snippets.push(match[1].replace(/<[^>]*>/g, '').trim());
    }

    // Extract URLs from result links
    const urlRegex = /<a[^>]*class="result__a"[^>]*href="https:\/\/[^"]+"/gi;
    const urls: string[] = [];
    
    while ((match = urlRegex.exec(html)) !== null) {
      const urlMatch = match[0].match(/href="(https:\/\/[^"]+)"/);
      if (urlMatch) {
        const url = urlMatch[1]
          .replace(/uddg=/, '')
          .replace(/&rut=.*/, '');
        urls.push(url);
      }
    }

    for (let i = 0; i < Math.min(urls.length, titles.length, 10); i++) {
      const url = urls[i];
      if (!seenUrls.has(url) && url.includes('duckduckgo.com') === false) {
        seenUrls.add(url);
        results.push({
          title: titles[i] || url,
          url,
          description: snippets[i] || '',
          position: results.length + 1,
        });
      }
    }

    return results;
  }

  /**
   * Print search results
   */
  printResults(results: FirecrawlSearchResult[], query: string): void {
    console.log(chalk.bold.cyan(`\n  Search Results: "${query}"`));
    console.log(chalk.gray(`  Found ${results.length} results\n`));
    console.log('─'.repeat(80));

    results.forEach((result, i) => {
      console.log(chalk.gray(`${i + 1}.`));
      console.log(chalk.cyan(`   ${result.title}`));
      console.log(chalk.blue(`   ${result.url}`));
      if (result.description) {
        console.log(chalk.gray(`   ${result.description}`));
      }
      console.log('');
    });

    if (results.length === 0) {
      console.log(chalk.yellow('  No results found. Try different keywords.\n'));
    }
  }
}

// CLI helper
export async function firecrawlSearch(query: string, options: FirecrawlSearchOptions): Promise<void> {
  const searcher = new FirecrawlSearcher();
  
  const spinner = ora(`Searching for "${query}"...`).start();
  
  try {
    const results = await searcher.search(query, options);
    spinner.succeed('Search complete');
    searcher.printResults(results, query);
  } catch (error) {
    spinner.fail('Search failed');
    console.error(chalk.red(error instanceof Error ? error.message : error));
    process.exit(1);
  }
}

// Simple spinner
function ora(text: string) {
  return {
    start: () => {
      process.stdout.write(`⠋ ${text}...`);
      return {
        succeed: (msg?: string) => process.stdout.write(`\r✅ ${msg || text}\n`),
        fail: (msg?: string) => process.stdout.write(`\r❌ ${msg || text}\n`),
      };
    },
  };
}
