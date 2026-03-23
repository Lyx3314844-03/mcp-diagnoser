/**
 * 增强的搜索模块
 * 改进搜索准确性和添加缓存功能
 */

import { BrowserSearcher, SEARCH_ENGINES, SearchResult, SearchOptions, SearchResults } from './browser-search.js';
import { cache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';

/**
 * 增强搜索选项
 */
export interface EnhancedSearchOptions extends SearchOptions {
  useCache?: boolean;        // 使用缓存
  deduplicate?: boolean;     // 去重
  sortByRelevance?: boolean; // 按相关性排序
  minQuality?: number;       // 最小质量分数 (0-1)
  maxAge?: number;           // 最大缓存年龄 (分钟)
}

/**
 * 搜索结果质量评分
 */
interface QualityScore {
  url: string;
  score: number;
  factors: {
    domainAuthority: number;
    contentRelevance: number;
    freshness: number;
    userEngagement: number;
  };
}

/**
 * 增强搜索器
 */
export class EnhancedSearcher extends BrowserSearcher {
  private qualityThresholds: Record<string, number> = {
    'google.com': 0.8,
    'bing.com': 0.75,
    'duckduckgo.com': 0.7,
    'baidu.com': 0.7,
    'github.com': 0.9,
    'stackoverflow.com': 0.85,
    'medium.com': 0.75,
    'dev.to': 0.75,
    'reddit.com': 0.6,
  };

  /**
   * 增强搜索
   */
  async enhancedSearch(query: string, options: EnhancedSearchOptions = {}): Promise<SearchResults> {
    const useCache = options.useCache !== false;
    const cacheKey = `search:${options.engine || 'google'}:${query}`;

    logger.info('Starting enhanced search', { query, engine: options.engine, useCache });

    // 尝试从缓存获取
    if (useCache) {
      const cachedResult = await cache.get<SearchResults>(cacheKey);
      if (cachedResult) {
        logger.info('Search result from cache', { query });
        return {
          ...cachedResult,
          fromCache: true,
        } as SearchResults;
      }
    }

    // 执行搜索
    const results = await this.search(query, options);

    // 去重
    if (options.deduplicate !== false) {
      results.results = this.deduplicateResults(results.results);
      results.total = results.results.length;
    }

    // 按相关性排序
    if (options.sortByRelevance !== false) {
      results.results = this.sortByRelevance(results.results, query);
    }

    // 过滤低质量结果
    if (options.minQuality) {
      results.results = this.filterByQuality(results.results, options.minQuality);
      results.total = results.results.length;
    }

    // 保存到缓存
    if (useCache) {
      const cacheTTL = (options.maxAge || 60) * 60 * 1000; // 默认 60 分钟
      await cache.set(cacheKey, results, cacheTTL);
      logger.info('Search result cached', { query, ttl: cacheTTL });
    }

    logger.info('Enhanced search completed', { 
      query, 
      totalResults: results.total, 
      searchTime: results.searchTime 
    });

    return results;
  }

  /**
   * 智能搜索 - 自动选择最佳引擎
   */
  async smartSearch(query: string, options: EnhancedSearchOptions = {}): Promise<SearchResults> {
    logger.info('Starting smart search', { query });

    // 分析查询类型
    const queryType = this.analyzeQueryType(query);
    
    // 根据查询类型选择最佳引擎
    const bestEngine = this.selectBestEngine(queryType, query);
    
    logger.info('Smart search selected engine', { engine: bestEngine, queryType });

    // 使用选定的引擎搜索
    return this.enhancedSearch(query, {
      ...options,
      engine: bestEngine,
    });
  }

  /**
   * 多引擎并行搜索
   */
  async multiSearch(query: string, engines: string[] = ['google', 'bing'], options: EnhancedSearchOptions = {}): Promise<SearchResults> {
    logger.info('Starting multi-engine search', { query, engines });

    const startTime = Date.now();
    const allResults: SearchResult[] = [];

    // 并行搜索多个引擎
    const promises = engines.map(async (engine) => {
      try {
        const results = await this.search(query, { ...options, engine });
        return results.results;
      } catch (error) {
        logger.warn(`Search engine ${engine} failed`, { error });
        return [];
      }
    });

    const engineResults = await Promise.all(promises);
    
    // 合并结果
    engineResults.forEach(results => {
      allResults.push(...results);
    });

    // 去重
    const deduplicatedResults = this.deduplicateResults(allResults);

    // 按相关性排序
    const sortedResults = this.sortByRelevance(deduplicatedResults, query);

    const searchTime = Date.now() - startTime;

    const finalResults: SearchResults = {
      query,
      engine: `multi (${engines.join(', ')})`,
      total: sortedResults.length,
      results: sortedResults.slice(0, options.limit || 10),
      searchTime,
    };

    // 缓存结果
    if (options.useCache !== false) {
      const cacheKey = `multi-search:${engines.join('-')}:${query}`;
      const cacheTTL = (options.maxAge || 60) * 60 * 1000;
      await cache.set(cacheKey, finalResults, cacheTTL);
    }

    logger.info('Multi-engine search completed', { 
      query, 
      totalResults: finalResults.total, 
      searchTime 
    });

    return finalResults;
  }

  /**
   * 分析查询类型
   */
  private analyzeQueryType(query: string): string {
    const lowerQuery = query.toLowerCase();

    // 技术相关
    if (/\b(code|api|sdk|library|package|npm|python|javascript|typescript|rust|go|java)\b/i.test(lowerQuery)) {
      return 'technical';
    }

    // 产品相关
    if (/\b(buy|price|review|best|top|compare|vs)\b/i.test(lowerQuery)) {
      return 'product';
    }

    // 教程相关
    if (/\b(how|tutorial|guide|learn|example|demo)\b/i.test(lowerQuery)) {
      return 'tutorial';
    }

    // 新闻相关
    if (/\b(news|latest|recent|update|announcement)\b/i.test(lowerQuery)) {
      return 'news';
    }

    // 学术相关
    if (/\b(paper|research|study|academic|scholar)\b/i.test(lowerQuery)) {
      return 'academic';
    }

    return 'general';
  }

  /**
   * 选择最佳引擎
   */
  private selectBestEngine(queryType: string, query: string): string {
    switch (queryType) {
      case 'technical':
        // 技术查询优先使用 GitHub 和 Google
        if (/\b(github|repository|source|code)\b/i.test(query)) {
          return 'github';
        }
        return 'google';

      case 'product':
        // 产品查询使用 Google 或 Bing
        return 'google';

      case 'tutorial':
        // 教程查询使用 Google 或 YouTube
        return 'google';

      case 'news':
        // 新闻查询使用 Google News 或 Bing
        return 'google';

      case 'academic':
        // 学术查询使用 Google Scholar 或 Bing
        return 'google';

      default:
        return 'google';
    }
  }

  /**
   * 去重搜索结果
   */
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seenDomains = new Set<string>();
    const uniqueResults: SearchResult[] = [];

    for (const result of results) {
      try {
        const url = new URL(result.url);
        const domain = url.hostname;

        // 允许每个域名最多 3 个结果
        const count = seenDomains.has(domain) ? 
          uniqueResults.filter(r => new URL(r.url).hostname === domain).length : 0;

        if (count < 3) {
          uniqueResults.push(result);
          seenDomains.add(domain);
        }
      } catch {
        // URL 解析失败，直接添加
        uniqueResults.push(result);
      }
    }

    return uniqueResults;
  }

  /**
   * 按相关性排序
   */
  private sortByRelevance(results: SearchResult[], query: string): SearchResult[] {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    return results.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, queryTerms);
      const scoreB = this.calculateRelevanceScore(b, queryTerms);
      return scoreB - scoreA;
    });
  }

  /**
   * 计算相关性分数
   */
  private calculateRelevanceScore(result: SearchResult, queryTerms: string[]): number {
    let score = 0;

    const titleLower = result.title.toLowerCase();
    const snippetLower = result.snippet.toLowerCase();
    const urlLower = result.url.toLowerCase();

    // 标题匹配 (权重最高)
    for (const term of queryTerms) {
      if (titleLower.includes(term)) {
        score += 3;
      }
      if (titleLower.startsWith(term)) {
        score += 2;
      }
    }

    // 摘要匹配
    for (const term of queryTerms) {
      if (snippetLower.includes(term)) {
        score += 1;
      }
    }

    // URL 匹配
    for (const term of queryTerms) {
      if (urlLower.includes(term)) {
        score += 1.5;
      }
    }

    // 域名权威性
    const domain = new URL(result.url).hostname;
    const domainScore = this.qualityThresholds[domain] || 0.5;
    score *= (domainScore + 0.5);

    // 位置权重 (排名靠前的结果)
    score *= (1 / Math.sqrt(result.position || 1));

    return score;
  }

  /**
   * 按质量过滤
   */
  private filterByQuality(results: SearchResult[], minQuality: number): SearchResult[] {
    return results.filter(result => {
      const domain = new URL(result.url).hostname;
      const domainQuality = this.qualityThresholds[domain] || 0.5;
      return domainQuality >= minQuality;
    });
  }

  /**
   * 清除搜索缓存
   */
  async clearSearchCache(): Promise<void> {
    await cache.clear();
    logger.info('Search cache cleared');
  }

  /**
   * 获取搜索缓存统计
   */
  getCacheStats() {
    return cache.getStats();
  }
}

// 导出单例
export const enhancedSearcher = new EnhancedSearcher();
