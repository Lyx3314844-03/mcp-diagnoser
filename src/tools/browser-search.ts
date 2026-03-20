import { execa } from 'execa';
import chalk from 'chalk';

export interface SearchEngine {
  name: string;
  baseUrl: string;
  searchParam: string;
  description: string;
  region?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  position: number;
  engine?: string;
}

export interface SearchOptions {
  engine?: string;
  limit?: number;
  language?: string;
  region?: string;
  timeRange?: 'any' | 'past_hour' | 'past_day' | 'past_week' | 'past_month' | 'past_year';
  fileType?: string;
  site?: string;
  excludeSites?: string[];
  exactMatch?: boolean;
  safeSearch?: boolean;
}

export interface SearchResults {
  query: string;
  engine: string;
  total: number;
  results: SearchResult[];
  searchTime?: number;
}

export const SEARCH_ENGINES: Record<string, SearchEngine> = {
  google: {
    name: 'Google',
    baseUrl: 'https://www.google.com/search',
    searchParam: 'q',
    description: 'Google Search - 全球最大搜索引擎',
    region: 'global',
  },
  bing: {
    name: 'Bing',
    baseUrl: 'https://www.bing.com/search',
    searchParam: 'q',
    description: 'Microsoft Bing - 微软搜索引擎',
    region: 'global',
  },
  baidu: {
    name: 'Baidu',
    baseUrl: 'https://www.baidu.com/s',
    searchParam: 'wd',
    description: '百度搜索 - 中国最大搜索引擎',
    region: 'cn',
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    baseUrl: 'https://duckduckgo.com/',
    searchParam: 'q',
    description: 'DuckDuckGo - 隐私保护搜索引擎',
    region: 'global',
  },
  yahoo: {
    name: 'Yahoo',
    baseUrl: 'https://search.yahoo.com/search',
    searchParam: 'p',
    description: 'Yahoo Search - 雅虎搜索引擎',
    region: 'us',
  },
  yandex: {
    name: 'Yandex',
    baseUrl: 'https://yandex.com/search/',
    searchParam: 'text',
    description: 'Yandex - 俄罗斯搜索引擎',
    region: 'ru',
  },
  sogou: {
    name: 'Sogou',
    baseUrl: 'https://www.sogou.com/sogou',
    searchParam: 'query',
    description: '搜狗搜索 - 中国搜索引擎',
    region: 'cn',
  },
  so360: {
    name: '360 Search',
    baseUrl: 'https://www.so.com/s',
    searchParam: 'q',
    description: '360 搜索 - 中国搜索引擎',
    region: 'cn',
  },
  github: {
    name: 'GitHub',
    baseUrl: 'https://github.com/search',
    searchParam: 'q',
    description: 'GitHub Code Search - 代码搜索',
    region: 'global',
  },
  stackoverflow: {
    name: 'Stack Overflow',
    baseUrl: 'https://stackoverflow.com/search',
    searchParam: 'q',
    description: 'Stack Overflow - 编程问答搜索',
    region: 'global',
  },
  reddit: {
    name: 'Reddit',
    baseUrl: 'https://www.reddit.com/search',
    searchParam: 'q',
    description: 'Reddit - 社交新闻搜索',
    region: 'global',
  },
  youtube: {
    name: 'YouTube',
    baseUrl: 'https://www.youtube.com/results',
    searchParam: 'search_query',
    description: 'YouTube - 视频搜索',
    region: 'global',
  },
  bilibili: {
    name: 'Bilibili',
    baseUrl: 'https://search.bilibili.com/all',
    searchParam: 'keyword',
    description: '哔哩哔哩 - 中国视频搜索',
    region: 'cn',
  },
  scholarly: {
    name: 'Google Scholar',
    baseUrl: 'https://scholar.google.com/scholar',
    searchParam: 'q',
    description: 'Google Scholar - 学术搜索',
    region: 'global',
  },
  arxiv: {
    name: 'arXiv',
    baseUrl: 'https://arxiv.org/search/',
    searchParam: 'query',
    description: 'arXiv - 物理论文搜索',
    region: 'global',
  },
};

export class BrowserSearcher {
  private userAgent: string;

  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * Search using specified engine
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResults> {
    const engine = options.engine || 'google';
    const engineConfig = SEARCH_ENGINES[engine.toLowerCase()];

    if (!engineConfig) {
      throw new Error(`Unknown search engine: ${engine}. Available: ${Object.keys(SEARCH_ENGINES).join(', ')}`);
    }

    const startTime = Date.now();
    
    // Build search URL
    const searchUrl = this.buildSearchUrl(engineConfig, query, options);
    
    // Perform search
    const results = await this.performSearch(searchUrl, engine);
    
    const searchTime = Date.now() - startTime;
    
    return {
      query,
      engine: engineConfig.name,
      total: results.length,
      results: results.map((r, i) => ({ ...r, position: i + 1, engine: engineConfig.name })),
      searchTime,
    };
  }

  /**
   * Search across multiple engines simultaneously
   */
  async searchAll(query: string, options: SearchOptions = {}): Promise<Record<string, SearchResults>> {
    const engines = options.engine ? [options.engine] : ['google', 'bing', 'baidu'];
    
    const results: Record<string, SearchResults> = {};
    
    const promises = engines.map(async (engine) => {
      try {
        results[engine] = await this.search(query, { ...options, engine });
      } catch (error) {
        results[engine] = {
          query,
          engine,
          total: 0,
          results: [],
          searchTime: 0,
        };
      }
    });
    
    await Promise.all(promises);
    
    return results;
  }

  /**
   * Build search URL with parameters
   */
  private buildSearchUrl(engine: SearchEngine, query: string, options: SearchOptions): string {
    const url = new URL(engine.baseUrl);
    
    // Add search query
    let searchQuery = query;
    
    // Add advanced search operators
    if (options.exactMatch) {
      searchQuery = `"${searchQuery}"`;
    }
    
    if (options.site) {
      searchQuery = `site:${options.site} ${searchQuery}`;
    }
    
    if (options.excludeSites && options.excludeSites.length > 0) {
      options.excludeSites.forEach(site => {
        searchQuery = `${searchQuery} -site:${site}`;
      });
    }
    
    if (options.fileType) {
      searchQuery = `${searchQuery} filetype:${options.fileType}`;
    }
    
    // Time range operators
    if (options.timeRange && options.timeRange !== 'any') {
      const timeOperators: Record<string, string> = {
        'past_hour': 'qdr:h',
        'past_day': 'qdr:d',
        'past_week': 'qdr:w',
        'past_month': 'qdr:m',
        'past_year': 'qdr:y',
      };
      if (engine.name === 'Google' && timeOperators[options.timeRange]) {
        searchQuery = `${searchQuery} ${timeOperators[options.timeRange]}`;
      }
    }
    
    url.searchParams.set(engine.searchParam, searchQuery);
    
    // Add engine-specific parameters
    if (engine.name === 'Google') {
      url.searchParams.set('hl', options.language || 'en');
      if (options.region) {
        url.searchParams.set('gl', options.region);
      }
      url.searchParams.set('safe', options.safeSearch === false ? 'off' : 'active');
    } else if (engine.name === 'Bing') {
      url.searchParams.set('cc', options.region || 'US');
      url.searchParams.set('setlang', options.language || 'en');
    }
    
    return url.toString();
  }

  /**
   * Perform search and extract results
   */
  private async performSearch(url: string, engine: string): Promise<SearchResult[]> {
    try {
      // Use curl to fetch search results
      const { stdout } = await execa('curl', [
        '-s',
        '-L',
        '-A', this.userAgent,
        '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        '-H', 'Accept-Language: en-US,en;q=0.9',
        '--compressed',
        '--max-time', '15',
        url,
      ], {
        timeout: 20000,
      });
      
      // Parse HTML results
      return this.parseSearchResults(stdout, engine);
    } catch (error) {
      console.warn(chalk.yellow(`Search failed for ${engine}: ${error instanceof Error ? error.message : error}`));
      return [];
    }
  }

  /**
   * Parse search results from HTML
   */
  private parseSearchResults(html: string, engine: string): SearchResult[] {
    const results: SearchResult[] = [];
    
    // Normalize HTML
    const normalizedHtml = html.replace(/\s+/g, ' ');
    
    // Try to find search result containers
    const resultContainers = this.extractResultContainers(normalizedHtml, engine);
    
    for (const container of resultContainers) {
      const title = this.extractTitleFromContainer(container);
      const url = this.extractUrlFromContainer(container);
      const snippet = this.extractSnippetFromContainer(container);
      
      // Filter out navigation and irrelevant results
      if (title && url && 
          title.length > 5 && 
          title.length < 200 &&
          !title.includes('Images') && 
          !title.includes('Videos') && 
          !title.includes('News') &&
          !title.includes('Maps') &&
          url.startsWith('http')) {
        
        results.push({
          title: this.cleanText(title),
          url: this.cleanUrl(url),
          snippet: this.cleanText(snippet),
          position: results.length + 1,
        });
      }
    }
    
    return results.slice(0, 10); // Return top 10 results
  }

  /**
   * Extract result containers from HTML
   */
  private extractResultContainers(html: string, engine: string): string[] {
    const containers: string[] = [];
    
    // Google: div.g, div.tF2Cxc
    if (engine === 'Google') {
      const googleRegex = /<div[^>]*class="[^"]*g[^"]*"[^>]*>[\s\S]{0,2000}?<\/div>/gi;
      let match;
      while ((match = googleRegex.exec(html)) !== null) {
        containers.push(match[0]);
      }
    }
    // Bing: li.b_algo
    else if (engine === 'Bing') {
      const bingRegex = /<li[^>]*class="[^"]*b_algo[^"]*"[^>]*>[\s\S]{0,2000}?<\/li>/gi;
      let match;
      while ((match = bingRegex.exec(html)) !== null) {
        containers.push(match[0]);
      }
    }
    // Baidu: div.result, div.c-container
    else if (engine === 'Baidu') {
      const baiduRegex = /<div[^>]*class="[^"]*(?:result|c-container)[^"]*"[^>]*>[\s\S]{0,2000}?<\/div>/gi;
      let match;
      while ((match = baiduRegex.exec(html)) !== null) {
        containers.push(match[0]);
      }
    }
    // DuckDuckGo: div.result
    else if (engine === 'DuckDuckGo') {
      const ddgRegex = /<div[^>]*class="[^"]*result[^"]*"[^>]*>[\s\S]{0,2000}?<\/div>/gi;
      let match;
      while ((match = ddgRegex.exec(html)) !== null) {
        containers.push(match[0]);
      }
    }
    
    // Fallback: Try to find any h2/h3 with links
    if (containers.length === 0) {
      const linkRegex = /<(?:h[23]|a)[^>]*>[\s\S]{0,500}?<\/(?:h[23]|a)>/gi;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        if (match[0].includes('href=')) {
          containers.push(match[0]);
        }
      }
    }
    
    return containers;
  }

  /**
   * Extract title from container
   */
  private extractTitleFromContainer(container: string): string {
    // Try h3, h2, a tags
    const titleRegex = /<(?:h[23]|a)[^>]*>([^<]+)<\/(?:h[23]|a)>/i;
    const match = container.match(titleRegex);
    return match ? match[1] : '';
  }

  /**
   * Extract URL from container
   */
  private extractUrlFromContainer(container: string): string {
    // Find first href
    const hrefRegex = /href="(https?:\/\/[^"]+)"/i;
    const match = container.match(hrefRegex);
    return match ? match[1] : '';
  }

  /**
   * Extract snippet from container
   */
  private extractSnippetFromContainer(container: string): string {
    // Look for paragraph or div with text content
    const snippetRegex = /<(?:p|div|span)[^>]*>([^<]{20,300})<\/(?:p|div|span)>/i;
    const match = container.match(snippetRegex);
    return match ? match[1] : '';
  }

  /**
   * Extract matches using regex
   */
  private extractMatches(html: string, regex: RegExp): string[] {
    const matches: string[] = [];
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      if (match[1]) {
        matches.push(match[1]);
      }
    }
    
    return matches;
  }

  /**
   * Clean extracted text
   */
  private cleanText(text: string): string {
    if (!text) return '';
    
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    cleaned = cleaned
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    // Trim and normalize whitespace
    return cleaned.trim().replace(/\s+/g, ' ');
  }

  /**
   * Clean URL
   */
  private cleanUrl(url: string): string {
    if (!url) return '';
    
    try {
      // Handle encoded URLs
      if (url.startsWith('http://www.google.com/url?q=')) {
        const parsed = new URL(url);
        return parsed.searchParams.get('q') || url;
      }
      
      return url;
    } catch {
      return url;
    }
  }

  /**
   * Search with Playwright for JavaScript-rendered pages
   */
  async searchWithPlaywright(query: string, options: SearchOptions = {}): Promise<SearchResults> {
    const engine = options.engine || 'google';
    const engineConfig = SEARCH_ENGINES[engine.toLowerCase()];
    
    if (!engineConfig) {
      throw new Error(`Unknown search engine: ${engine}`);
    }
    
    const startTime = Date.now();
    const searchUrl = this.buildSearchUrl(engineConfig, query, options);
    
    try {
      // Try to use Playwright if available
      const { execa } = await import('execa');
      
      // Create a simple Node.js script to run Playwright
      const script = `
        const { chromium } = require('playwright');
        
        (async () => {
          const browser = await chromium.launch({ headless: true });
          const page = await browser.newPage();
          await page.goto('${searchUrl.replace(/'/g, "\\'")}', { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(2000);
          
          const results = await page.evaluate(() => {
            const items = [];
            const resultElements = document.querySelectorAll('div.g, div.b_algo, div.result, div.vk_b');
            
            resultElements.forEach((el, idx) => {
              const titleEl = el.querySelector('h3, h2 a, a.result__title');
              const urlEl = el.querySelector('a, h3 a, h2 a');
              const snippetEl = el.querySelector('.VwiC3b, .b_caption, .c-abstract, .result__snippet');
              
              if (titleEl && urlEl) {
                items.push({
                  title: titleEl.textContent?.trim() || '',
                  url: urlEl.href || '',
                  snippet: snippetEl?.textContent?.trim() || '',
                  position: idx + 1
                });
              }
            });
            
            return items.slice(0, 10);
          });
          
          await browser.close();
          console.log(JSON.stringify(results));
        })();
      `;
      
      const { stdout } = await execa('node', ['-e', script], {
        timeout: 40000,
        env: { ...process.env, NODE_PATH: 'global' },
      });
      
      const results = JSON.parse(stdout);
      const searchTime = Date.now() - startTime;
      
      return {
        query,
        engine: engineConfig.name,
        total: results.length,
        results: results.map((r: any) => ({ ...r, engine: engineConfig.name })),
        searchTime,
      };
    } catch (error) {
      // Fallback to regular search
      console.warn(chalk.yellow('Playwright search failed, falling back to regular search'));
      return this.search(query, options);
    }
  }

  /**
   * Print search results
   */
  printResults(results: SearchResults, verbose: boolean = false): void {
    console.log(chalk.bold.cyan('\n═'.repeat(70)));
    console.log(chalk.bold.cyan(`  Search Results: "${results.query}"`));
    console.log(chalk.bold.cyan(`  Engine: ${results.engine}`));
    console.log(chalk.bold.cyan('═'.repeat(70)));
    console.log(chalk.gray(`  Found ${results.total} results in ${results.searchTime}ms\n`));
    
    for (const result of results.results) {
      console.log(chalk.bold.green(`${result.position}. ${result.title}`));
      console.log(chalk.cyan(`   ${result.url}`));
      
      if (result.snippet && verbose) {
        console.log(chalk.gray(`   ${result.snippet.substring(0, 200)}${result.snippet.length > 200 ? '...' : ''}`));
      }
      
      console.log();
    }
    
    if (results.results.length === 0) {
      console.log(chalk.yellow('  No results found. Try different keywords or search engine.\n'));
    }
  }

  /**
   * List available search engines
   */
  listEngines(): void {
    console.log(chalk.bold.cyan('\n═'.repeat(70)));
    console.log(chalk.bold.cyan('  Available Search Engines'));
    console.log(chalk.bold.cyan('═'.repeat(70)) + '\n');
    
    const categories = {
      'General': ['google', 'bing', 'baidu', 'duckduckgo', 'yahoo', 'yandex', 'sogou', 'so360'],
      'Developer': ['github', 'stackoverflow'],
      'Social': ['reddit', 'youtube', 'bilibili'],
      'Academic': ['scholarly', 'arxiv'],
    };
    
    for (const [category, engines] of Object.entries(categories)) {
      console.log(chalk.bold.yellow(`  ${category}:`));
      for (const engineKey of engines) {
        const engine = SEARCH_ENGINES[engineKey];
        if (engine) {
          console.log(chalk.gray(`    ${engine.name.padEnd(15)} - ${engine.description}`));
        }
      }
      console.log();
    }
  }
}
