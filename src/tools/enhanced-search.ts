/**
 * Enhanced Multi-Engine Search with Caching and Smart Features
 */

import { execa } from 'execa';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { 
  SEARCH_ENGINES, 
  SearchEngine, 
  SearchResult, 
  SearchOptions, 
  SearchResults 
} from './browser-search';

// ==================== Interfaces ====================

export interface MultiEngineSearchOptions extends SearchOptions {
  engines?: string[];
  deduplicate?: boolean;
  dedupMethod?: 'exact' | 'fuzzy';
  dedupThreshold?: number;
  sortBy?: 'relevance' | 'date' | 'engine' | 'position';
  mergeResults?: boolean;
  maxResultsPerEngine?: number;
  timeout?: number;
  failover?: boolean;
  useCache?: boolean;
  cacheTTL?: number;
  verbose?: boolean;
}

export interface AggregatedSearchResults {
  query: string;
  engines: string[];
  totalResults: number;
  results: SearchResult[];
  engineBreakdown: {
    [engine: string]: {
      count: number;
      searchTime: number;
      success: boolean;
      error?: string;
    };
  };
  duplicates: number;
  searchTime: number;
  cacheHit?: boolean;
}

export interface SearchCacheEntry {
  key: string;
  results: AggregatedSearchResults;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

export interface SmartSearchOptions {
  queryType?: 'general' | 'code' | 'academic' | 'news' | 'video' | 'auto';
  autoSelectEngines?: boolean;
  preferRegions?: string[];
  languagePriority?: string[];
  verbose?: boolean;
}

// ==================== Search Cache Manager ====================

export class SearchCacheManager {
  private cacheDir: string;
  private statsFile: string;
  private stats: { hits: number; misses: number };
  private defaultTTL: number;

  constructor(cacheDir?: string, defaultTTL: number = 3600) {
    this.cacheDir = cacheDir || path.join(process.cwd(), '.search-cache');
    this.defaultTTL = defaultTTL;
    this.statsFile = path.join(this.cacheDir, 'stats.json');
    this.stats = { hits: 0, misses: 0 };
    
    this.init();
  }

  private async init(): Promise<void> {
    await fs.ensureDir(this.cacheDir);
    
    try {
      if (await fs.pathExists(this.statsFile)) {
        this.stats = await fs.readJson(this.statsFile);
      }
    } catch (error) {
      this.stats = { hits: 0, misses: 0 };
    }
  }

  generateKey(query: string, options: MultiEngineSearchOptions): string {
    const keyData = {
      query,
      engines: options.engines?.sort(),
      limit: options.limit,
      language: options.language,
      region: options.region,
      timeRange: options.timeRange,
    };
    return require('crypto').createHash('md5').update(JSON.stringify(keyData)).digest('hex');
  }

  async get(key: string): Promise<AggregatedSearchResults | null> {
    const cacheFile = path.join(this.cacheDir, `${key}.json`);
    
    try {
      if (!await fs.pathExists(cacheFile)) {
        this.stats.misses++;
        await this.saveStats();
        return null;
      }

      const cached: SearchCacheEntry = await fs.readJson(cacheFile);
      const now = Date.now();

      if (now - cached.timestamp > cached.ttl * 1000) {
        await fs.remove(cacheFile);
        this.stats.misses++;
        await this.saveStats();
        return null;
      }

      this.stats.hits++;
      await this.saveStats();
      return cached.results;
    } catch (error) {
      return null;
    }
  }

  async set(key: string, results: AggregatedSearchResults, ttl?: number): Promise<void> {
    const cacheFile = path.join(this.cacheDir, `${key}.json`);
    const entry: SearchCacheEntry = {
      key,
      results,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    await fs.writeJson(cacheFile, entry, { spaces: 2 });
  }

  async clear(): Promise<void> {
    const files = await fs.readdir(this.cacheDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.remove(path.join(this.cacheDir, file));
      }
    }
    this.stats = { hits: 0, misses: 0 };
    await this.saveStats();
  }

  async getStats(): Promise<CacheStats> {
    const files = await fs.readdir(this.cacheDir);
    const cacheFiles = files.filter(f => f.endsWith('.json') && f !== 'stats.json');
    
    const total = this.stats.hits + this.stats.misses;
    
    return {
      size: cacheFiles.length,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? Math.round((this.stats.hits / total) * 100) : 0,
    };
  }

  private async saveStats(): Promise<void> {
    await fs.writeJson(this.statsFile, this.stats, { spaces: 2 });
  }
}

// ==================== Enhanced Multi-Engine Searcher ====================

export class EnhancedSearcher {
  private cacheManager: SearchCacheManager;

  constructor(cacheDir?: string) {
    this.cacheManager = new SearchCacheManager(cacheDir);
  }

  /**
   * Search across multiple engines with advanced features
   */
  async searchMultiEngine(
    query: string,
    options: MultiEngineSearchOptions = {}
  ): Promise<AggregatedSearchResults> {
    const startTime = Date.now();
    
    // Check cache first
    if (options.useCache !== false) {
      const cacheKey = this.cacheManager.generateKey(query, options);
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        cached.cacheHit = true;
        return cached;
      }
    }

    // Default engines
    const engines = options.engines || ['google', 'bing', 'duckduckgo'];
    const results: Record<string, SearchResults> = {};
    const engineStats: Record<string, { count: number; searchTime: number; success: boolean; error?: string }> = {};

    // Search all engines in parallel
    const searchPromises = engines.map(async (engine) => {
      const engineStart = Date.now();
      try {
        const engineConfig = SEARCH_ENGINES[engine.toLowerCase()];
        if (!engineConfig) {
          throw new Error(`Unknown engine: ${engine}`);
        }

        const searchResults = await this.performSearch(
          query,
          engineConfig,
          { ...options, limit: options.maxResultsPerEngine || options.limit || 10 }
        );

        results[engine] = searchResults;
        engineStats[engine] = {
          count: searchResults.results.length,
          searchTime: Date.now() - engineStart,
          success: true,
        };
      } catch (error) {
        engineStats[engine] = {
          count: 0,
          searchTime: Date.now() - engineStart,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };

        // Failover to next engine if enabled
        if (options.failover && engines.indexOf(engine) < engines.length - 1) {
          console.warn(chalk.yellow(`Engine ${engine} failed, trying next...`));
        }
      }
    });

    await Promise.all(searchPromises);

    // Merge all results
    const allResults = Object.values(results)
      .flatMap(r => r.results);

    // Deduplicate
    let deduplicated = allResults;
    let duplicates = 0;
    
    if (options.deduplicate !== false) {
      const beforeDedup = allResults.length;
      deduplicated = this.deduplicateResults(allResults, {
        method: options.dedupMethod || 'exact',
        threshold: options.dedupThreshold || 0.9,
      });
      duplicates = beforeDedup - deduplicated.length;
    }

    // Sort results
    const sorted = this.sortResults(deduplicated, options.sortBy || 'relevance');

    // Limit total results
    const finalResults = sorted.slice(0, options.limit || 20);

    const searchTime = Date.now() - startTime;

    const aggregated: AggregatedSearchResults = {
      query,
      engines,
      totalResults: finalResults.length,
      results: finalResults,
      engineBreakdown: engineStats,
      duplicates,
      searchTime,
    };

    // Cache the results
    if (options.useCache !== false) {
      const cacheKey = this.cacheManager.generateKey(query, options);
      await this.cacheManager.set(cacheKey, aggregated, options.cacheTTL);
    }

    return aggregated;
  }

  /**
   * Smart search with automatic engine selection
   */
  async smartSearch(
    query: string,
    options: SmartSearchOptions & MultiEngineSearchOptions = {}
  ): Promise<AggregatedSearchResults> {
    let queryType = options.queryType || 'auto';
    
    // Auto-detect query type if not specified
    if (queryType === 'auto') {
      queryType = this.detectQueryType(query);
    }

    // Auto-select engines based on query type
    let engines = options.engines;
    if (options.autoSelectEngines !== false || !engines) {
      engines = this.recommendEngines(query, queryType, options);
    }

    // Perform multi-engine search
    return this.searchMultiEngine(query, {
      ...options,
      engines,
    });
  }

  /**
   * Detect query type automatically
   */
  private detectQueryType(query: string): 'general' | 'code' | 'academic' | 'news' | 'video' {
    const lowerQuery = query.toLowerCase();

    // Code-related keywords
    const codeKeywords = ['code', 'github', 'programming', 'api', 'library', 'package', 'npm', 'python', 'javascript', 'typescript', 'rust', 'go', 'java'];
    if (codeKeywords.some(k => lowerQuery.includes(k))) {
      return 'code';
    }

    // Academic-related keywords
    const academicKeywords = ['paper', 'research', 'study', 'academic', 'scholar', 'journal', 'citation', 'arxiv', 'pubmed'];
    if (academicKeywords.some(k => lowerQuery.includes(k))) {
      return 'academic';
    }

    // News-related keywords
    const newsKeywords = ['news', 'latest', 'breaking', 'today', 'recent', 'announcement'];
    if (newsKeywords.some(k => lowerQuery.includes(k))) {
      return 'news';
    }

    // Video-related keywords
    const videoKeywords = ['video', 'tutorial', 'demo', 'youtube', 'watch', 'stream'];
    if (videoKeywords.some(k => lowerQuery.includes(k))) {
      return 'video';
    }

    return 'general';
  }

  /**
   * Recommend engines based on query type
   */
  private recommendEngines(
    query: string,
    queryType: string,
    options: SmartSearchOptions
  ): string[] {
    const recommendations: string[] = [];

    switch (queryType) {
      case 'code':
        recommendations.push('github', 'stackoverflow');
        break;
      case 'academic':
        recommendations.push('scholar', 'arxiv');
        break;
      case 'news':
        recommendations.push('google', 'bing');
        break;
      case 'video':
        recommendations.push('youtube', 'bilibili');
        break;
      default:
        recommendations.push('google', 'bing', 'duckduckgo');
    }

    // Add regional engines based on language priority
    if (options.languagePriority?.includes('zh')) {
      recommendations.push('baidu', 'sogou');
    }
    if (options.languagePriority?.includes('ru')) {
      recommendations.push('yandex');
    }

    return [...new Set(recommendations)];
  }

  /**
   * Deduplicate search results
   */
  private deduplicateResults(
    results: SearchResult[],
    options: { method: 'exact' | 'fuzzy'; threshold: number }
  ): SearchResult[] {
    const unique: SearchResult[] = [];
    const seenUrls = new Set<string>();

    for (const result of results) {
      // Exact deduplication by URL
      if (seenUrls.has(result.url)) {
        continue;
      }

      // Fuzzy deduplication by title similarity
      if (options.method === 'fuzzy') {
        const isDuplicate = unique.some(existing => {
          const similarity = this.calculateSimilarity(result.title, existing.title);
          return similarity >= options.threshold;
        });

        if (isDuplicate) {
          continue;
        }
      }

      unique.push(result);
      seenUrls.add(result.url);
    }

    return unique;
  }

  /**
   * Calculate string similarity (Levenshtein distance based)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;

    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return 1 - (distance / maxLength);
  }

  /**
   * Sort results by specified criteria
   */
  private sortResults(results: SearchResult[], sortBy: string): SearchResult[] {
    return results.sort((a, b) => {
      switch (sortBy) {
        case 'position':
          return (a.position || 0) - (b.position || 0);
        case 'engine':
          return (a.engine || '').localeCompare(b.engine || '');
        case 'relevance':
        default:
          // Higher position = more relevant (assuming position 1 is best)
          return (a.position || 0) - (b.position || 0);
      }
    });
  }

  /**
   * Perform search on a single engine
   */
  private async performSearch(
    query: string,
    engine: SearchEngine,
    options: SearchOptions
  ): Promise<SearchResults> {
    // Build search URL
    const url = this.buildSearchUrl(engine, query, options);

    let html = '';
    
    // Try Playwright first for JavaScript-rendered pages
    try {
      html = await this.fetchWithPlaywright(url);
    } catch (playwrightError) {
      // Fallback to curl
      try {
        const { stdout } = await execa('curl', [
          '-s',
          '-L',
          '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          '--max-time', '10',
          url,
        ], { timeout: 15000 });
        html = stdout;
      } catch (curlError) {
        throw new Error(`Both Playwright and curl failed: ${curlError instanceof Error ? curlError.message : 'Unknown error'}`);
      }
    }

    // Parse results
    const results = this.parseSearchResults(html, engine.name);

    return {
      query,
      engine: engine.name,
      total: results.length,
      results: results.map((r, i) => ({ ...r, position: i + 1 })),
      searchTime: 0,
    };
  }

  /**
   * Fetch page content using Playwright for JavaScript-rendered pages
   */
  private async fetchWithPlaywright(url: string): Promise<string> {
    const { chromium } = await import('playwright');
    
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
      });
      
      const page = await context.newPage();
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Wait for search results to load
      await page.waitForTimeout(2000);
      
      const html = await page.content();
      await browser.close();
      return html;
    } catch (error) {
      await browser.close().catch(() => {});
      throw error;
    }
  }

  /**
   * Build search URL with parameters
   */
  private buildSearchUrl(engine: SearchEngine, query: string, options: SearchOptions): string {
    const url = new URL(engine.baseUrl);
    let searchQuery = query;

    // Advanced search operators
    if (options.exactMatch) {
      searchQuery = `"${searchQuery}"`;
    }
    if (options.site) {
      searchQuery = `site:${options.site} ${searchQuery}`;
    }
    if (options.excludeSites) {
      options.excludeSites.forEach(site => {
        searchQuery = `${searchQuery} -site:${site}`;
      });
    }
    if (options.fileType) {
      searchQuery = `${searchQuery} filetype:${options.fileType}`;
    }

    url.searchParams.set(engine.searchParam, searchQuery);

    // Engine-specific parameters
    if (engine.name === 'Google') {
      url.searchParams.set('hl', options.language || 'en');
      if (options.region) url.searchParams.set('gl', options.region);
    } else if (engine.name === 'Bing') {
      url.searchParams.set('cc', options.region || 'US');
      url.searchParams.set('setlang', options.language || 'en');
    }

    return url.toString();
  }

  /**
   * Parse search results from HTML (Improved version)
   */
  private parseSearchResults(html: string, engine: string): SearchResult[] {
    const results: SearchResult[] = [];
    const normalizedHtml = html.replace(/\s+/g, ' ').toLowerCase();
    
    // Different engines have different result containers
    const selectors: Record<string, { pattern: RegExp; title: RegExp; url: RegExp; snippet: RegExp }> = {
      'Google': {
        pattern: /<div[^>]*class="[^"]*g[^"]*"[^>]*>[\s\S]{0,3000}?<\/div>/gi,
        title: /<h3[^>]*>([\s\S]{0,200}?)<\/h3>/i,
        url: /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>/i,
        snippet: /<div[^>]*class="[^"]*[Vv]004[^"]*"[^>]*>([\s\S]{0,300}?)<\/div>/i,
      },
      'Bing': {
        pattern: /<li[^>]*class="[^"]*b_algo[^"]*"[^>]*>[\s\S]{0,3000}?<\/li>/gi,
        title: /<h2[^>]*>([\s\S]{0,200}?)<\/h2>/i,
        url: /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>/i,
        snippet: /<p[^>]*>([\s\S]{0,300}?)<\/p>/i,
      },
      'DuckDuckGo': {
        pattern: /<div[^>]*class="[^"]*result[^"]*"[^>]*>[\s\S]{0,3000}?<\/div>/gi,
        title: /<a[^>]*class="[^"]*result__a[^"]*"[^>]*>([\s\S]{0,200}?)<\/a>/i,
        url: /<a[^>]*data-testid="[^"]*"[^>]*href="(https?:\/\/[^"]+)"[^>]*>/i,
        snippet: /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]{0,300}?)<\/a>/i,
      },
    };
    
    const selector = selectors[engine] || {
      pattern: /<(div|li|article)[^>]*>[\s\S]{0,3000}?<\/\1>/gi,
      title: /<(h[1-6])[^>]*>([\s\S]{0,200}?)<\/\1>/i,
      url: /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>/i,
      snippet: /<(p|span|div)[^>]*>([\s\S]{0,300}?)<\/\1>/i,
    };
    
    // Extract result containers
    let match;
    const containers: string[] = [];
    
    while ((match = selector.pattern.exec(html)) !== null) {
      containers.push(match[0]);
      if (containers.length >= 15) break; // Limit containers
    }
    
    // Extract data from each container
    const seenUrls = new Set<string>();
    
    for (const container of containers) {
      try {
        // Extract title
        let title = '';
        const titleMatch = container.match(selector.title);
        if (titleMatch) {
          title = titleMatch[1]
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
        }
        
        // Extract URL
        let url = '';
        const urlMatch = container.match(selector.url);
        if (urlMatch) {
          url = urlMatch[1]
            .replace(/&amp;/g, '&')
            .split('&')[0]; // Remove tracking params
        }
        
        // Extract snippet
        let snippet = '';
        const snippetMatch = container.match(selector.snippet);
        if (snippetMatch) {
          snippet = snippetMatch[1]
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .trim();
        }
        
        // Validate and add result
        if (url && 
            url.startsWith('http') && 
            !url.includes('google.') && 
            !url.includes('bing.') &&
            !url.includes('duckduckgo.') &&
            !seenUrls.has(url) &&
            title.length > 0) {
          
          seenUrls.add(url);
          results.push({
            title: title.substring(0, 200),
            url,
            snippet: snippet.substring(0, 300),
            position: results.length + 1,
            engine,
          });
        }
      } catch (error) {
        // Skip malformed results
        continue;
      }
    }
    
    // Fallback: extract any valid URLs with titles
    if (results.length === 0) {
      const urlRegex = /https?:\/\/[^\s"'<>)]+/g;
      const urls = html.match(urlRegex) || [];
      
      for (const url of urls) {
        const cleanUrl = url
          .replace(/[)]$/, '')
          .replace(/&sa=[^&]+/, '')
          .split('&')[0];
        
        if (!seenUrls.has(cleanUrl) &&
            !cleanUrl.includes('google.') &&
            !cleanUrl.includes('bing.') &&
            !cleanUrl.includes('duckduckgo.') &&
            cleanUrl.startsWith('http')) {
          seenUrls.add(cleanUrl);
          results.push({
            title: cleanUrl.split('/')[2] || cleanUrl,
            url: cleanUrl,
            snippet: '',
            position: results.length + 1,
            engine,
          });
          
          if (results.length >= 10) break;
        }
      }
    }
    
    return results.slice(0, 10);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    return this.cacheManager.getStats();
  }

  /**
   * Clear search cache
   */
  async clearCache(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * Print search results
   */
  printResults(results: AggregatedSearchResults, verbose: boolean = false): void {
    console.log(chalk.bold.cyan(`\n  Multi-Engine Search Results: "${results.query}"`));
    console.log(chalk.bold.cyan(`  Engines: ${results.engines.join(', ')}`));
    console.log(chalk.gray(`  Found ${results.totalResults} results in ${results.searchTime}ms`));
    
    if (results.cacheHit) {
      console.log(chalk.green('  ⚡ Cached results\n'));
    } else {
      console.log('');
    }

    // Engine breakdown
    console.log(chalk.bold('📊 Engine Breakdown:'));
    for (const [engine, stats] of Object.entries(results.engineBreakdown)) {
      const icon = stats.success ? '✅' : '❌';
      console.log(`  ${icon} ${engine}: ${stats.count} results (${stats.searchTime}ms)`);
      if (stats.error) {
        console.log(chalk.red(`     Error: ${stats.error}`));
      }
    }

    console.log(chalk.bold(`\n📋 Results (${results.totalResults} total, ${results.duplicates} duplicates removed):`));
    console.log('─'.repeat(80));

    results.results.forEach((result, i) => {
      console.log(chalk.gray(`${i + 1}.`));
      console.log(chalk.cyan(`   ${result.title}`));
      console.log(chalk.blue(`   ${result.url}`));
      if (verbose && result.snippet) {
        console.log(chalk.gray(`   ${result.snippet}`));
      }
      console.log(chalk.yellow(`   [${result.engine}]`));
      console.log('');
    });

    if (results.results.length === 0) {
      console.log(chalk.yellow('  No results found. Try different keywords or search engines.\n'));
    }
  }
}

// ==================== CLI Helper Functions ====================

export async function multiSearch(query: string, options: MultiEngineSearchOptions): Promise<void> {
  const searcher = new EnhancedSearcher();
  
  const spinner = ora(`Searching ${options.engines?.join(', ') || 'multiple engines'}...`).start();
  
  try {
    const results = await searcher.searchMultiEngine(query, options);
    spinner.succeed('Search complete');
    searcher.printResults(results, options.verbose);
  } catch (error) {
    spinner.fail('Search failed');
    console.error(chalk.red(error instanceof Error ? error.message : error));
    process.exit(1);
  }
}

export async function smartSearch(query: string, options: SmartSearchOptions & MultiEngineSearchOptions): Promise<void> {
  const searcher = new EnhancedSearcher();
  
  const spinner = ora('Analyzing query and selecting engines...').start();
  
  try {
    const results = await searcher.smartSearch(query, options);
    spinner.succeed('Smart search complete');
    searcher.printResults(results, options.verbose);
    
    // Show query type detection
    const queryType = searcher['detectQueryType'](query);
    console.log(chalk.green(`\n💡 Query type detected: ${queryType}`));
    console.log(chalk.green(`   Auto-selected engines: ${results.engines.join(', ')}\n`));
  } catch (error) {
    spinner.fail('Search failed');
    console.error(chalk.red(error instanceof Error ? error.message : error));
    process.exit(1);
  }
}

export async function showCacheStats(): Promise<void> {
  const searcher = new EnhancedSearcher();
  const stats = await searcher.getCacheStats();
  
  console.log(chalk.bold.cyan('\n  Search Cache Statistics'));
  console.log('─'.repeat(40));
  console.log(`  Cache size:    ${stats.size} entries`);
  console.log(`  Cache hits:    ${stats.hits}`);
  console.log(`  Cache misses:  ${stats.misses}`);
  console.log(`  Hit rate:      ${stats.hitRate}%`);
  console.log('─'.repeat(40) + '\n');
}

export async function clearCache(): Promise<void> {
  const searcher = new EnhancedSearcher();
  
  const spinner = ora('Clearing search cache...').start();
  
  try {
    await searcher.clearCache();
    spinner.succeed('Cache cleared');
  } catch (error) {
    spinner.fail('Failed to clear cache');
    console.error(chalk.red(error instanceof Error ? error.message : error));
    process.exit(1);
  }
}

// Simple spinner implementation
function ora(text: string) {
  return {
    start: () => {
      process.stdout.write(`⠋ ${text}...`);
      return {
        succeed: (msg?: string) => {
          process.stdout.write(`\r✅ ${msg || text}\n`);
        },
        fail: (msg?: string) => {
          process.stdout.write(`\r❌ ${msg || text}\n`);
        },
      };
    },
  };
}
