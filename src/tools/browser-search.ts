import { execa } from 'execa';
import chalk from 'chalk';
import { antiBotManager, delayManager } from '../utils/anti-bot.js';
import { createUltraParser } from '../utils/html-parser-v3.js';

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
  // ========== 通用搜索引擎 ==========
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
  duckduckgo: {
    name: 'DuckDuckGo',
    baseUrl: 'https://duckduckgo.com/',
    searchParam: 'q',
    description: 'DuckDuckGo - 隐私保护搜索引擎',
    region: 'global',
  },
  baidu: {
    name: 'Baidu',
    baseUrl: 'https://www.baidu.com/s',
    searchParam: 'wd',
    description: '百度搜索 - 中国最大搜索引擎',
    region: 'cn',
  },
  yandex: {
    name: 'Yandex',
    baseUrl: 'https://yandex.com/search/',
    searchParam: 'text',
    description: 'Yandex - 俄罗斯搜索引擎',
    region: 'ru',
  },
  yahoo: {
    name: 'Yahoo',
    baseUrl: 'https://search.yahoo.com/search',
    searchParam: 'p',
    description: 'Yahoo Search - 雅虎搜索引擎',
    region: 'us',
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
  
  // ========== 中文搜索引擎 ==========
  wechat: {
    name: 'WeChat',
    baseUrl: 'https://weixin.sogou.com/weixin',
    searchParam: 'query',
    description: '微信搜索 - 公众号文章搜索',
    region: 'cn',
  },
  zhihu: {
    name: 'Zhihu',
    baseUrl: 'https://www.zhihu.com/search',
    searchParam: 'q',
    description: '知乎 - 中文问答社区',
    region: 'cn',
  },
  weibo: {
    name: 'Weibo',
    baseUrl: 'https://s.weibo.com/weibo',
    searchParam: 'q',
    description: '微博搜索 - 社交媒体搜索',
    region: 'cn',
  },
  douban: {
    name: 'Douban',
    baseUrl: 'https://search.douban.com/book/subject_search',
    searchParam: 'search_text',
    description: '豆瓣搜索 - 书籍/电影/音乐搜索',
    region: 'cn',
  },
  tmall: {
    name: 'Tmall',
    baseUrl: 'https://list.tmall.com/search_product.htm',
    searchParam: 'q',
    description: '天猫搜索 - 电商搜索',
    region: 'cn',
  },
  jd: {
    name: 'JD',
    baseUrl: 'https://search.jd.com/Search',
    searchParam: 'keyword',
    description: '京东搜索 - 电商搜索',
    region: 'cn',
  },
  
  // ========== 代码/技术搜索 ==========
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
  npm: {
    name: 'npm',
    baseUrl: 'https://www.npmjs.com/search',
    searchParam: 'q',
    description: 'npm Search - Node.js 包搜索',
    region: 'global',
  },
  pypi: {
    name: 'PyPI',
    baseUrl: 'https://pypi.org/search/',
    searchParam: 'q',
    description: 'PyPI Search - Python 包搜索',
    region: 'global',
  },
  mdn: {
    name: 'MDN',
    baseUrl: 'https://developer.mozilla.org/zh-CN/search',
    searchParam: 'q',
    description: 'MDN Web Docs - Web 开发文档',
    region: 'global',
  },
  
  // ========== 视频搜索 ==========
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
  vimeo: {
    name: 'Vimeo',
    baseUrl: 'https://vimeo.com/search',
    searchParam: 'q',
    description: 'Vimeo - 高清视频搜索',
    region: 'global',
  },
  youku: {
    name: 'Youku',
    baseUrl: 'https://so.youku.com/',
    searchParam: 'keyword',
    description: '优酷搜索 - 中国视频搜索',
    region: 'cn',
  },
  iqiyi: {
    name: 'iQiyi',
    baseUrl: 'https://so.iqiyi.com/so/q',
    searchParam: 'keyword',
    description: '爱奇艺搜索 - 中国视频搜索',
    region: 'cn',
  },
  
  // ========== 学术搜索 ==========
  scholar: {
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
  cnki: {
    name: 'CNKI',
    baseUrl: 'https://search.cnki.com.cn/Search.aspx',
    searchParam: 'q',
    description: 'CNKI 知网 - 中国学术论文搜索',
    region: 'cn',
  },
  pubmed: {
    name: 'PubMed',
    baseUrl: 'https://pubmed.ncbi.nlm.nih.gov/',
    searchParam: 'term',
    description: 'PubMed - 生物医学文献搜索',
    region: 'global',
  },
  semantic_scholar: {
    name: 'Semantic Scholar',
    baseUrl: 'https://www.semanticscholar.org/search',
    searchParam: 'q',
    description: 'Semantic Scholar - AI 驱动学术搜索',
    region: 'global',
  },
  
  // ========== 新闻搜索 ==========
  google_news: {
    name: 'Google News',
    baseUrl: 'https://news.google.com/search',
    searchParam: 'q',
    description: 'Google News - 新闻搜索',
    region: 'global',
  },
  baidu_news: {
    name: 'Baidu News',
    baseUrl: 'https://news.baidu.com/ns',
    searchParam: 'word',
    description: '百度新闻 - 新闻搜索',
    region: 'cn',
  },
  sina: {
    name: 'Sina',
    baseUrl: 'https://search.sina.com.cn/',
    searchParam: 'q',
    description: '新浪搜索 - 新闻搜索',
    region: 'cn',
  },
  
  // ========== 社交/社区搜索 ==========
  reddit: {
    name: 'Reddit',
    baseUrl: 'https://www.reddit.com/search',
    searchParam: 'q',
    description: 'Reddit - 社交新闻搜索',
    region: 'global',
  },
  twitter: {
    name: 'Twitter',
    baseUrl: 'https://twitter.com/search',
    searchParam: 'q',
    description: 'Twitter Search - 社交媒体搜索',
    region: 'global',
  },
  telegram: {
    name: 'Telegram',
    baseUrl: 'https://t.me/s',
    searchParam: 'q',
    description: 'Telegram Search - 频道搜索',
    region: 'global',
  },
  quora: {
    name: 'Quora',
    baseUrl: 'https://www.quora.com/search',
    searchParam: 'q',
    description: 'Quora - 问答搜索',
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

    // Wait for appropriate delay
    const domain = new URL(searchUrl).hostname;
    await delayManager.wait(domain);

    // Perform search with anti-bot headers
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
      // Generate anti-bot headers
      const headers = antiBotManager.generateHeaders();
      const domain = new URL(url).hostname;

      // Use curl to fetch search results with anti-bot headers
      const { stdout, stderr } = await execa('curl', [
        '-s',
        '-L',
        '-A', headers['User-Agent'],
        '-H', `Accept: ${headers['Accept']}`,
        '-H', `Accept-Language: ${headers['Accept-Language']}`,
        '-H', `Accept-Encoding: ${headers['Accept-Encoding']}`,
        '-H', `Connection: ${headers['Connection']}`,
        '-H', `Upgrade-Insecure-Requests: ${headers['Upgrade-Insecure-Requests']}`,
        '-H', `Sec-Fetch-Dest: ${headers['Sec-Fetch-Dest']}`,
        '-H', `Sec-Fetch-Mode: ${headers['Sec-Fetch-Mode']}`,
        '-H', `Sec-Fetch-Site: ${headers['Sec-Fetch-Site']}`,
        '-H', `sec-ch-ua: ${headers['sec-ch-ua']}`,
        '-H', `sec-ch-ua-mobile: ${headers['sec-ch-ua-mobile']}`,
        '-H', `sec-ch-ua-platform: ${headers['sec-ch-ua-platform']}`,
        '-H', `Cookie: ${antiBotManager.getCookie(domain)}`,
        '--compressed',
        '--max-time', '15',
        '--referer', 'https://www.google.com/',
        url,
      ], {
        timeout: 20000,
        reject: false,
      });

      // Check for errors
      if (stderr) {
        console.warn(chalk.yellow(`curl warning: ${stderr}`));
      }

      // Check if response looks like a block page
      if (stdout.includes('captcha') || 
          stdout.includes('unusual traffic') ||
          stdout.includes('robot verification') ||
          stdout.includes('access denied')) {
        console.warn(chalk.yellow(`Search engine may have blocked the request`));
        // Rotate User-Agent for next request
        antiBotManager.rotateUserAgent();
        return [];
      }

      // Parse HTML results using enhanced parser v3
      const parser = createUltraParser(engine, {
        extractRichSnippets: true,
        extractImages: true,
        extractDates: true,
        maxResults: 10,
      });
      const results = parser.parse(stdout);

      // Log parsing results
      if (results.length === 0) {
        console.warn(chalk.yellow(`Parser extracted 0 results from ${engine} search`));
      }

      // Update cookies if present in response
      // (In a real implementation, you'd capture Set-Cookie headers)

      return results;
    } catch (error) {
      console.warn(chalk.yellow(`Search failed for ${engine}: ${error instanceof Error ? error.message : error}`));

      // Rotate User-Agent on error
      antiBotManager.rotateUserAgent();

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
      '🌐 通用搜索引擎': ['google', 'bing', 'duckduckgo', 'baidu', 'yandex', 'yahoo', 'sogou', 'so360'],
      '🇨🇳 中文搜索引擎': ['wechat', 'zhihu', 'weibo', 'douban', 'tmall', 'jd'],
      '💻 代码/技术搜索': ['github', 'stackoverflow', 'npm', 'pypi', 'mdn'],
      '🎬 视频搜索': ['youtube', 'bilibili', 'vimeo', 'youku', 'iqiyi'],
      '📚 学术搜索': ['scholar', 'arxiv', 'cnki', 'pubmed', 'semantic_scholar'],
      '📰 新闻搜索': ['google_news', 'baidu_news', 'sina'],
      '💬 社交/社区搜索': ['reddit', 'twitter', 'telegram', 'quora'],
    };

    for (const [category, engines] of Object.entries(categories)) {
      console.log(chalk.bold.yellow(`  ${category}:`));
      console.log(chalk.gray('  ' + '─'.repeat(40)));
      for (const engineKey of engines) {
        const engine = SEARCH_ENGINES[engineKey];
        if (engine) {
          console.log(chalk.gray(`    ${engine.name.padEnd(20)} - ${engine.description}`));
        }
      }
      console.log();
    }
    
    console.log(chalk.bold.cyan('═'.repeat(70)));
    console.log(chalk.yellow('\n  Usage Examples:'));
    console.log(chalk.gray('    mcp-diagnoser multi-search "query" --engines google,bing'));
    console.log(chalk.gray('    mcp-diagnoser multi-search "query" --engines github,stackoverflow'));
    console.log(chalk.gray('    mcp-diagnoser multi-search "query" --engines zhihu,wechat'));
    console.log(chalk.gray('    mcp-diagnoser smart-search "query" --query-type code'));
    console.log(chalk.gray('    mcp-diagnoser smart-search "query" --query-type video'));
    console.log('');
  }
}
