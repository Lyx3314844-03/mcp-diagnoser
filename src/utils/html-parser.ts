/**
 * 增强的 HTML 解析器
 * 支持多种搜索引擎的搜索结果提取
 */

export interface SearchResultSet {
  title: string;
  url: string;
  snippet: string;
  position: number;
  sitelinks?: SearchResultSet[];
  richSnippet?: RichSnippet;
}

export interface RichSnippet {
  type?: 'article' | 'product' | 'recipe' | 'video' | 'event';
  image?: string;
  rating?: number;
  reviews?: number;
  price?: string;
  date?: string;
  author?: string;
}

export interface ParserConfig {
  engine: string;
  strictMode?: boolean;
  extractSitelinks?: boolean;
  extractRichSnippets?: boolean;
  maxResults?: number;
}

/**
 * 增强的 HTML 解析器类
 */
export class EnhancedHtmlParser {
  private config: ParserConfig;
  private html: string = '';
  private normalizedHtml: string = '';

  constructor(config: ParserConfig) {
    this.config = config;
  }

  /**
   * 解析 HTML 提取搜索结果
   */
  parse(html: string): SearchResultSet[] {
    this.html = html;
    this.normalizedHtml = this.normalizeHtml(html);

    const results: SearchResultSet[] = [];

    // 根据搜索引擎选择解析策略
    switch (this.config.engine.toLowerCase()) {
      case 'google':
        results.push(...this.parseGoogle());
        break;
      case 'bing':
        results.push(...this.parseBing());
        break;
      case 'baidu':
        results.push(...this.parseBaidu());
        break;
      case 'duckduckgo':
        results.push(...this.parseDuckDuckGo());
        break;
      default:
        results.push(...this.parseGeneric());
    }

    // 限制结果数量
    const maxResults = this.config.maxResults || 10;
    return results.slice(0, maxResults);
  }

  /**
   * 标准化 HTML
   */
  private normalizeHtml(html: string): string {
    // 移除脚本和样式
    let normalized = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      // 移除注释
      .replace(/<!--[\s\S]*?-->/g, '')
      // 标准化空白
      .replace(/\s+/g, ' ')
      // 移除多余空格
      .replace(/>\s+</g, '><');

    return normalized;
  }

  /**
   * 解析 Google 搜索结果
   */
  private parseGoogle(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // Google 搜索结果容器选择器（多个备选）
    const selectors = [
      /<div[^>]*class="[^"]*(?:g|tF2Cxc|yuRUbf)[^"]*"[^>]*>[\s\S]{0,3000}?<\/div>/gi,
      /<div[^>]*data-href="[^"]*"[^>]*>[\s\S]{0,3000}?<\/div>/gi,
      /<li[^>]*class="[^"]*b_algo[^"]*"[^>]*>[\s\S]{0,3000}?<\/li>/gi,
    ];

    for (const selector of selectors) {
      const matches = this.extractAllMatches(this.normalizedHtml, selector);
      
      for (const match of matches) {
        const result = this.parseGoogleResult(match);
        if (result && result.title && result.url) {
          results.push(result);
        }
      }

      if (results.length > 0) break;
    }

    return results;
  }

  /**
   * 解析单个 Google 结果
   */
  private parseGoogleResult(html: string): SearchResultSet | null {
    // 提取标题
    const title = this.extractGoogleTitle(html);
    
    // 提取 URL
    const url = this.extractGoogleUrl(html);
    
    // 提取摘要
    const snippet = this.extractGoogleSnippet(html);
    
    // 提取富片段
    const richSnippet = this.config.extractRichSnippets ? 
      this.extractRichSnippet(html) : undefined;

    if (!title || !url) return null;

    return {
      title: this.cleanText(title),
      url: this.cleanUrl(url),
      snippet: this.cleanText(snippet),
      position: 0,
      richSnippet,
    };
  }

  /**
   * 提取 Google 标题
   */
  private extractGoogleTitle(html: string): string {
    // 多种标题提取策略
    const patterns = [
      /<h3[^>]*class="[^"]*LC20lb[^"]*"[^>]*>([^<]+)<\/h3>/i,
      /<h3[^>]*>([^<]+)<\/h3>/i,
      /<a[^>]*>[^<]*<h3[^>]*>([^<]+)<\/h3>/i,
      /<div[^>]*class="[^"]*vBJApp[^"]*"[^>]*>([^<]+)<\/div>/i,
      /<a[^>]*href="[^"]*"[^>]*>([^<]{5,200})<\/a>/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  /**
   * 提取 Google URL
   */
  private extractGoogleUrl(html: string): string {
    // 提取主链接
    const patterns = [
      /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*class="[^"]*yuRUbf[^"]*"/i,
      /<a[^>]*class="[^"]*yuRUbf[^"]*"[^>]*href="(https?:\/\/[^"]+)"/i,
      /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>/i,
      /<cite[^>]*>([^<]+)<\/cite>/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  /**
   * 提取 Google 摘要
   */
  private extractGoogleSnippet(html: string): string {
    const patterns = [
      /<div[^>]*class="[^"]*VwiC3b[^"]*"[^>]*>([^<]{10,300})<\/div>/i,
      /<span[^>]*class="[^"]*aCOpRe[^"]*"[^>]*>([^<]{10,300})<\/span>/i,
      /<div[^>]*class="[^"]*IsZvec[^"]*"[^>]*>([^<]{10,300})<\/div>/i,
      /<p[^>]*>([^<]{50,300})<\/p>/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  /**
   * 解析 Bing 搜索结果
   */
  private parseBing(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // Bing 搜索结果容器
    const bingPattern = /<li[^>]*class="[^"]*b_algo[^"]*"[^>]*>[\s\S]{0,3000}?<\/li>/gi;
    const matches = this.extractAllMatches(this.normalizedHtml, bingPattern);

    for (const match of matches) {
      const result = this.parseBingResult(match);
      if (result && result.title && result.url) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * 解析单个 Bing 结果
   */
  private parseBingResult(html: string): SearchResultSet | null {
    // 提取标题
    const titleMatch = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
    const title = titleMatch ? titleMatch[1] : '';

    // 提取 URL
    const urlMatch = html.match(/<h2[^>]*><a[^>]*href="(https?:\/\/[^"]+)"/i);
    const url = urlMatch ? urlMatch[1] : '';

    // 提取摘要
    const snippetMatch = html.match(/<p[^>]*>([^<]{50,300})<\/p>/i);
    const snippet = snippetMatch ? snippetMatch[1] : '';

    if (!title || !url) return null;

    return {
      title: this.cleanText(title),
      url: this.cleanUrl(url),
      snippet: this.cleanText(snippet),
      position: 0,
    };
  }

  /**
   * 解析百度搜索结果
   */
  private parseBaidu(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // 百度搜索结果容器
    const baiduPattern = /<div[^>]*class="[^"]*(?:result|c-container)[^"]*"[^>]*>[\s\S]{0,3000}?<\/div>/gi;
    const matches = this.extractAllMatches(this.normalizedHtml, baiduPattern);

    for (const match of matches) {
      const result = this.parseBaiduResult(match);
      if (result && result.title && result.url) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * 解析单个百度结果
   */
  private parseBaiduResult(html: string): SearchResultSet | null {
    // 提取标题
    const titleMatch = html.match(/<h3[^>]*class="[^"]*t[^"]*"[^>]*>([^<]+)<\/h3>/i);
    const title = titleMatch ? titleMatch[1] : '';

    // 提取 URL
    const urlMatch = html.match(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*class="[^"]*c-title[^"]*"/i);
    const url = urlMatch ? urlMatch[1] : '';

    // 提取摘要
    const snippetMatch = html.match(/<div[^>]*class="[^"]*c-abstract[^"]*"[^>]*>([^<]{50,300})<\/div>/i);
    const snippet = snippetMatch ? snippetMatch[1] : '';

    if (!title || !url) return null;

    return {
      title: this.cleanText(title),
      url: this.cleanUrl(url),
      snippet: this.cleanText(snippet),
      position: 0,
    };
  }

  /**
   * 解析 DuckDuckGo 搜索结果
   */
  private parseDuckDuckGo(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // DuckDuckGo 搜索结果容器
    const ddgPattern = /<div[^>]*class="[^"]*result[^"]*"[^>]*>[\s\S]{0,3000}?<\/div>/gi;
    const matches = this.extractAllMatches(this.normalizedHtml, ddgPattern);

    for (const match of matches) {
      const result = this.parseDuckDuckGoResult(match);
      if (result && result.title && result.url) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * 解析单个 DuckDuckGo 结果
   */
  private parseDuckDuckGoResult(html: string): SearchResultSet | null {
    // 提取标题
    const titleMatch = html.match(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*>([^<]+)<\/a>/i);
    const title = titleMatch ? titleMatch[1] : '';

    // 提取 URL
    const urlMatch = html.match(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*class="[^"]*result__a[^"]*"/i);
    const url = urlMatch ? urlMatch[1] : '';

    // 提取摘要
    const snippetMatch = html.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([^<]{50,300})<\/a>/i);
    const snippet = snippetMatch ? snippetMatch[1] : '';

    if (!title || !url) return null;

    return {
      title: this.cleanText(title),
      url: this.cleanUrl(url),
      snippet: this.cleanText(snippet),
      position: 0,
    };
  }

  /**
   * 通用解析策略（备用）
   */
  private parseGeneric(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // 查找所有包含链接的标题
    const patterns = [
      /<(?:h[1-3]|a)[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]{5,200})<\/(?:h[1-3]|a)>/gi,
      /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]{5,200})<\/a>/gi,
    ];

    for (const pattern of patterns) {
      const matches = this.extractAllMatches(this.normalizedHtml, pattern);
      
      for (const match of matches) {
        const urlMatch = match.match(/href="(https?:\/\/[^"]+)"/i);
        const textMatch = match.match(/>([^<]{5,200})</i);
        
        if (urlMatch && textMatch) {
          results.push({
            title: this.cleanText(textMatch[1]),
            url: this.cleanUrl(urlMatch[1]),
            snippet: '',
            position: 0,
          });
        }
      }

      if (results.length >= 10) break;
    }

    return results;
  }

  /**
   * 提取富片段信息
   */
  private extractRichSnippet(html: string): RichSnippet | undefined {
    const richSnippet: RichSnippet = {};

    // 提取图片
    const imageMatch = html.match(/<img[^>]*src="(https?:\/\/[^"]+)"[^>]*>/i);
    if (imageMatch) {
      richSnippet.image = imageMatch[1];
    }

    // 提取评分
    const ratingMatch = html.match(/(?:rating|stars)[^0-9]*([0-9]\.[0-9])/i);
    if (ratingMatch) {
      richSnippet.rating = parseFloat(ratingMatch[1]);
    }

    // 提取评论数
    const reviewsMatch = html.match(/([0-9,]+)\s*(?:reviews?|评价)/i);
    if (reviewsMatch) {
      richSnippet.reviews = parseInt(reviewsMatch[1].replace(/,/g, ''));
    }

    // 提取价格
    const priceMatch = html.match(/(\$?[0-9,]+(?:\.[0-9]{2})?)/i);
    if (priceMatch) {
      richSnippet.price = priceMatch[1];
    }

    // 提取日期
    const dateMatch = html.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i);
    if (dateMatch) {
      richSnippet.date = dateMatch[1];
    }

    // 提取作者
    const authorMatch = html.match(/(?:by|作者)[：:]\s*([^<]+)/i);
    if (authorMatch) {
      richSnippet.author = this.cleanText(authorMatch[1]);
    }

    // 如果有富片段信息，返回
    if (Object.keys(richSnippet).length > 0) {
      return richSnippet;
    }

    return undefined;
  }

  /**
   * 提取所有正则匹配
   */
  private extractAllMatches(html: string, regex: RegExp): string[] {
    const matches: string[] = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      matches.push(match[0]);
    }

    return matches;
  }

  /**
   * 清理文本
   */
  private cleanText(text: string): string {
    if (!text) return '';

    // 移除 HTML 标签
    let cleaned = text.replace(/<[^>]*>/g, '');

    // 解码 HTML 实体
    cleaned = cleaned
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');

    // 清理空白字符
    cleaned = cleaned.trim().replace(/\s+/g, ' ');

    // 限制长度
    if (cleaned.length > 500) {
      cleaned = cleaned.substring(0, 500) + '...';
    }

    return cleaned;
  }

  /**
   * 清理 URL
   */
  private cleanUrl(url: string): string {
    if (!url) return '';

    try {
      // 解码 URL
      const decoded = decodeURIComponent(url);
      
      // 清理 Google 重定向链接
      if (decoded.includes('/url?q=')) {
        const match = decoded.match(/\/url\?q=([^&]+)/);
        if (match) {
          return decodeURIComponent(match[1]);
        }
      }

      return decoded.trim();
    } catch {
      return url;
    }
  }
}

/**
 * 创建解析器实例
 */
export function createParser(engine: string, options?: Partial<ParserConfig>): EnhancedHtmlParser {
  return new EnhancedHtmlParser({
    engine,
    strictMode: false,
    extractSitelinks: false,
    extractRichSnippets: true,
    maxResults: 10,
    ...options,
  });
}
