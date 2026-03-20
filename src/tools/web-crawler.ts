import { execa } from 'execa';
import chalk from 'chalk';

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  sameDomain?: boolean;
  excludePatterns?: string[];
  includePatterns?: string[];
  timeout?: number;
  delay?: number;
}

export interface CrawledPage {
  url: string;
  title: string;
  content: string;
  depth: number;
  links: string[];
}

export interface CrawlResults {
  baseUrl: string;
  totalPages: number;
  pages: CrawledPage[];
  crawlTime: number;
}

export interface ContentSearchOptions {
  query: string;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
  contextLines?: number;
}

export interface ContentMatch {
  url: string;
  line: number;
  content: string;
  context?: string;
}

export class WebCrawler {
  private visitedUrls: Set<string>;
  private urlsToVisit: string[];
  private pages: CrawledPage[];
  private baseUrl: string;
  private options: CrawlOptions;

  constructor() {
    this.visitedUrls = new Set();
    this.urlsToVisit = [];
    this.pages = [];
    this.baseUrl = '';
    this.options = {};
  }

  /**
   * Crawl a website
   */
  async crawl(url: string, options: CrawlOptions = {}): Promise<CrawlResults> {
    this.baseUrl = url;
    this.options = {
      maxPages: options.maxPages || 20,
      maxDepth: options.maxDepth || 3,
      sameDomain: options.sameDomain !== false,
      excludePatterns: options.excludePatterns || [],
      includePatterns: options.includePatterns || [],
      timeout: options.timeout || 10000,
      delay: options.delay || 500,
    };

    this.visitedUrls.clear();
    this.urlsToVisit = [url];
    this.pages = [];

    const startTime = Date.now();

    while (
      this.urlsToVisit.length > 0 &&
      this.pages.length < this.options.maxPages!
    ) {
      const currentUrl = this.urlsToVisit.shift()!;
      
      if (this.visitedUrls.has(currentUrl)) {
        continue;
      }

      try {
        const page = await this.fetchPage(currentUrl, 0);
        if (page) {
          this.pages.push(page);
          this.visitedUrls.add(currentUrl);

          // Add new URLs to visit
          for (const link of page.links) {
            if (
              !this.visitedUrls.has(link) &&
              !this.urlsToVisit.includes(link) &&
              this.shouldCrawl(link)
            ) {
              this.urlsToVisit.push(link);
            }
          }

          // Respect delay
          if (this.options.delay && this.urlsToVisit.length > 0) {
            await this.sleep(this.options.delay);
          }
        }
      } catch (error) {
        console.warn(chalk.yellow(`Failed to crawl ${currentUrl}: ${error instanceof Error ? error.message : error}`));
      }
    }

    const crawlTime = Date.now() - startTime;

    return {
      baseUrl: url,
      totalPages: this.pages.length,
      pages: this.pages,
      crawlTime,
    };
  }

  /**
   * Fetch and parse a single page
   */
  private async fetchPage(url: string, depth: number): Promise<CrawledPage | null> {
    if (depth > this.options.maxDepth!) {
      return null;
    }

    try {
      const { stdout } = await execa('curl', [
        '-s',
        '-L',
        '-A', 'Mozilla/5.0 (compatible; WebCrawler/1.0)',
        '-H', 'Accept: text/html,application/xhtml+xml',
        '--compressed',
        '--max-time', String(this.options.timeout! / 1000),
        url,
      ], {
        timeout: this.options.timeout!,
      });

      const title = this.extractTitle(stdout);
      const content = this.extractTextContent(stdout);
      const links = this.extractLinks(stdout, url);

      return {
        url,
        title: title || url,
        content,
        depth,
        links,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Search within crawled content
   */
  searchContent(crawlResults: CrawlResults, options: ContentSearchOptions): ContentMatch[] {
    const matches: ContentMatch[] = [];
    const { query, caseSensitive = false, wholeWord = false, regex = false, contextLines = 0 } = options;

    for (const page of crawlResults.pages) {
      const lines = page.content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let matched = false;

        if (regex) {
          try {
            const flags = caseSensitive ? 'g' : 'gi';
            const pattern = new RegExp(query, flags);
            matched = pattern.test(line);
          } catch {
            // Invalid regex
          }
        } else {
          const searchLine = caseSensitive ? line : line.toLowerCase();
          const searchQuery = caseSensitive ? query : query.toLowerCase();

          if (wholeWord) {
            const wordBoundary = '\\b';
            const pattern = new RegExp(`${wordBoundary}${this.escapeRegex(searchQuery)}${wordBoundary}`, caseSensitive ? 'g' : 'gi');
            matched = pattern.test(searchLine);
          } else {
            matched = searchLine.includes(searchQuery);
          }
        }

        if (matched) {
          let context = line;
          if (contextLines > 0) {
            const start = Math.max(0, i - contextLines);
            const end = Math.min(lines.length, i + contextLines + 1);
            context = lines.slice(start, end).join('\n');
          }

          matches.push({
            url: page.url,
            line: i + 1,
            content: line.trim(),
            context: contextLines > 0 ? context : undefined,
          });
        }
      }
    }

    return matches;
  }

  /**
   * Search for specific information patterns
   */
  async searchPatterns(url: string, patterns: string[]): Promise<Record<string, string[]>> {
    const results: Record<string, string[]> = {};
    
    try {
      const { stdout } = await execa('curl', [
        '-s',
        '-L',
        '-A', 'Mozilla/5.0 (compatible; PatternSearch/1.0)',
        '--compressed',
        '--max-time', '10',
        url,
      ], {
        timeout: 15000,
      });

      for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'gi');
        const matches: string[] = [];
        let match;

        while ((match = regex.exec(stdout)) !== null) {
          if (match[0] && !matches.includes(match[0])) {
            matches.push(match[0]);
          }
        }

        results[pattern] = matches.slice(0, 20); // Limit to 20 matches per pattern
      }
    } catch (error) {
      console.warn(chalk.yellow(`Pattern search failed: ${error instanceof Error ? error.message : error}`));
    }

    return results;
  }

  /**
   * Extract emails from crawled pages
   */
  extractEmails(crawlResults: CrawlResults): string[] {
    const emails = new Set<string>();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    for (const page of crawlResults.pages) {
      const matches = page.content.match(emailRegex);
      if (matches) {
        matches.forEach(email => emails.add(email.toLowerCase()));
      }
    }

    return Array.from(emails);
  }

  /**
   * Extract phone numbers from crawled pages
   */
  extractPhoneNumbers(crawlResults: CrawlResults): string[] {
    const phones = new Set<string>();
    // Common phone number patterns
    const phoneRegexes = [
      /\+?[\d\s-()]{10,}/g,
      /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g,
      /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/g,
    ];

    for (const page of crawlResults.pages) {
      for (const regex of phoneRegexes) {
        const matches = page.content.match(regex);
        if (matches) {
          matches.forEach(phone => {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length >= 10 && cleaned.length <= 15) {
              phones.add(phone);
            }
          });
        }
      }
    }

    return Array.from(phones);
  }

  /**
   * Extract links from HTML
   */
  private extractLinks(html: string, baseUrl: string): string[] {
    const links: string[] = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    let match;

    const baseDomain = new URL(baseUrl).hostname;

    while ((match = linkRegex.exec(html)) !== null) {
      let href = match[1];

      // Skip anchors and javascript
      if (href.startsWith('#') || href.startsWith('javascript:')) {
        continue;
      }

      // Convert relative URLs to absolute
      if (href.startsWith('/')) {
        try {
          const base = new URL(baseUrl);
          href = `${base.protocol}//${base.hostname}${href}`;
        } catch {
          continue;
        }
      } else if (!href.startsWith('http://') && !href.startsWith('https://')) {
        continue;
      }

      // Filter same domain if requested
      if (this.options.sameDomain) {
        try {
          const linkDomain = new URL(href).hostname;
          if (linkDomain !== baseDomain) {
            continue;
          }
        } catch {
          continue;
        }
      }

      links.push(href);
    }

    return links;
  }

  /**
   * Extract title from HTML
   */
  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  /**
   * Extract text content from HTML
   */
  private extractTextContent(html: string): string {
    // Remove script and style tags
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  }

  /**
   * Check if URL should be crawled
   */
  private shouldCrawl(url: string): boolean {
    // Check exclude patterns
    for (const pattern of this.options.excludePatterns || []) {
      if (url.includes(pattern)) {
        return false;
      }
    }

    // Check include patterns
    if (this.options.includePatterns && this.options.includePatterns.length > 0) {
      for (const pattern of this.options.includePatterns) {
        if (url.includes(pattern)) {
          return true;
        }
      }
      return false;
    }

    return true;
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Print crawl results
   */
  printResults(crawlResults: CrawlResults): void {
    console.log(chalk.bold.cyan('\n═'.repeat(70)));
    console.log(chalk.bold.cyan(`  Web Crawl Results: ${crawlResults.baseUrl}`));
    console.log(chalk.bold.cyan('═'.repeat(70)));
    console.log(chalk.gray(`  Crawled ${crawlResults.totalPages} pages in ${crawlResults.crawlTime}ms\n`));

    for (const page of crawlResults.pages) {
      console.log(chalk.bold.green(`[${page.depth}] ${page.title || page.url}`));
      console.log(chalk.cyan(`   ${page.url}`));
      console.log(chalk.gray(`   Links: ${page.links.length}\n`));
    }
  }

  /**
   * Print content search matches
   */
  printMatches(matches: ContentMatch[], maxContextLines: number = 2): void {
    console.log(chalk.bold.cyan('\n═'.repeat(70)));
    console.log(chalk.bold.cyan(`  Content Search Matches: ${matches.length} found`));
    console.log(chalk.bold.cyan('═'.repeat(70)) + '\n');

    for (const match of matches.slice(0, 50)) { // Limit to 50 matches
      console.log(chalk.bold.green(`URL: ${match.url}`));
      console.log(chalk.gray(`Line ${match.line}:`));
      
      if (match.context) {
        const lines = match.context.split('\n');
        lines.forEach((line, idx) => {
          const lineNum = match.line! - (match.context!.split('\n').indexOf(match.content) || 0) + idx;
          const isMatch = line === match.content;
          console.log(chalk[isMatch ? 'yellow' : 'gray'](`  ${lineNum} | ${line.substring(0, 150)}`));
        });
      } else {
        console.log(chalk.yellow(`  ${match.content.substring(0, 150)}\n`));
      }
      
      console.log();
    }

    if (matches.length > 50) {
      console.log(chalk.gray(`  ... and ${matches.length - 50} more matches\n`));
    }
  }
}
