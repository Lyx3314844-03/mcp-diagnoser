/**
 * 增强的 HTML 解析器 v2
 * 更强大的搜索引擎结果提取
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
 * 增强的 HTML 解析器类 v2
 */
export class EnhancedHtmlParser {
  private config: ParserConfig;
  private html: string = '';

  constructor(config: ParserConfig) {
    this.config = config;
  }

  /**
   * 解析 HTML 提取搜索结果
   */
  parse(html: string): SearchResultSet[] {
    this.html = html;
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
   * 解析 Google 搜索结果
   * 使用多种策略提取结果
   */
  private parseGoogle(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // 策略 1: 查找包含链接的 div 容器
    const divsWithLinks = this.html.match(/<div[^>]*>[\s\S]{0,5000}?<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>[\s\S]{0,200}?<h[34][^>]*>([^<]+)<\/h[34]>[\s\S]{0,500}?<\/div>/gi);
    
    if (divsWithLinks) {
      for (const div of divsWithLinks) {
        const result = this.extractResultFromHtml(div, 'google');
        if (result && result.title && result.url) {
          results.push(result);
        }
      }
    }

    // 策略 2: 直接查找 h3 标签和链接
    if (results.length === 0) {
      const h3Pattern = /<h3[^>]*>[\s\S]{0,200}?<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]+)<\/a>/gi;
      let match;
      
      while ((match = h3Pattern.exec(this.html)) !== null) {
        const url = match[1];
        const title = match[2];
        
        if (url && title && url.startsWith('http')) {
          // 查找相邻的摘要
          const snippet = this.findNearbySnippet(match[0], 500);
          
          results.push({
            title: this.cleanText(title),
            url: this.cleanUrl(url),
            snippet: this.cleanText(snippet),
            position: results.length + 1,
          });
        }
      }
    }

    // 策略 3: 查找所有链接和标题组合
    if (results.length === 0) {
      const linkPattern = /<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]{0,200}?)<\/a>/gi;
      let match;
      
      while ((match = linkPattern.exec(this.html)) !== null) {
        const url = match[1];
        const content = match[2];
        
        // 检查是否包含标题标签
        const titleMatch = content.match(/<h[34][^>]*>([^<]+)<\/h[34]>/i);
        const title = titleMatch ? titleMatch[1] : content.replace(/<[^>]*>/g, '').trim();
        
        if (url && title && url.startsWith('http') && title.length > 5 && title.length < 200) {
          results.push({
            title: this.cleanText(title),
            url: this.cleanUrl(url),
            snippet: '',
            position: results.length + 1,
          });
        }
      }
    }

    return results;
  }

  /**
   * 解析 Bing 搜索结果
   */
  private parseBing(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // 策略 1: 查找 b_algo 容器
    const bAlgoPattern = /<li[^>]*class="[^"]*b_algo[^"]*"[^>]*>[\s\S]{0,5000}?<h2[^>]*>[\s\S]{0,200}?<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]+)<\/a>[\s\S]{0,500}?<\/li>/gi;
    let match;
    
    while ((match = bAlgoPattern.exec(this.html)) !== null) {
      const url = match[1];
      const title = match[2];
      const container = match[0];
      
      const snippet = this.findSnippetInContainer(container, 'b_caption');
      
      results.push({
        title: this.cleanText(title),
        url: this.cleanUrl(url),
        snippet: this.cleanText(snippet),
        position: results.length + 1,
      });
    }

    // 策略 2: 查找 article 标签
    if (results.length === 0) {
      const articlePattern = /<article[^>]*>[\s\S]{0,5000}?<h2[^>]*>[\s\S]{0,200}?<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]+)<\/a>[\s\S]{0,500}?<\/article>/gi;
      
      while ((match = articlePattern.exec(this.html)) !== null) {
        const url = match[1];
        const title = match[2];
        const container = match[0];
        
        const snippet = this.findSnippetInContainer(container, 'p');
        
        results.push({
          title: this.cleanText(title),
          url: this.cleanUrl(url),
          snippet: this.cleanText(snippet),
          position: results.length + 1,
        });
      }
    }

    return results;
  }

  /**
   * 解析百度搜索结果
   */
  private parseBaidu(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // 策略 1: 查找 c-container 容器
    const containerPattern = /<div[^>]*class="[^"]*c-container[^"]*"[^>]*>[\s\S]{0,5000}?<h3[^>]*class="[^"]*t[^"]*"[^>]*>[\s\S]{0,200}?<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]+)<\/a>[\s\S]{0,500}?<\/div>/gi;
    let match;
    
    while ((match = containerPattern.exec(this.html)) !== null) {
      const url = match[1];
      const title = match[2];
      const container = match[0];
      
      const snippet = this.findSnippetInContainer(container, 'c-abstract');
      
      results.push({
        title: this.cleanText(title),
        url: this.cleanUrl(url),
        snippet: this.cleanText(snippet),
        position: results.length + 1,
      });
    }

    // 策略 2: 查找 result 容器
    if (results.length === 0) {
      const resultPattern = /<div[^>]*class="[^"]*result[^"]*"[^>]*>[\s\S]{0,5000}?<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]{5,200})<\/a>[\s\S]{0,500}?<\/div>/gi;
      
      while ((match = resultPattern.exec(this.html)) !== null) {
        const url = match[1];
        const title = match[2];
        
        if (url && title && url.startsWith('http')) {
          results.push({
            title: this.cleanText(title),
            url: this.cleanUrl(url),
            snippet: '',
            position: results.length + 1,
          });
        }
      }
    }

    return results;
  }

  /**
   * 解析 DuckDuckGo 搜索结果
   */
  private parseDuckDuckGo(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // 查找 result 容器
    const resultPattern = /<div[^>]*class="[^"]*result[^"]*"[^>]*>[\s\S]{0,5000}?<a[^>]*class="[^"]*result__a[^"]*"[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]+)<\/a>[\s\S]{0,500}?<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([^<]{10,300})<\/a>[\s\S]{0,200}?<\/div>/gi;
    let match;
    
    while ((match = resultPattern.exec(this.html)) !== null) {
      const url = match[1];
      const title = match[2];
      const snippet = match[3];
      
      results.push({
        title: this.cleanText(title),
        url: this.cleanUrl(url),
        snippet: this.cleanText(snippet),
        position: results.length + 1,
      });
    }

    return results;
  }

  /**
   * 通用解析策略
   */
  private parseGeneric(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // 查找所有包含标题的链接
    const pattern = /<(?:h[1-6]|a)[^>]*>(?:[\s\S]{0,200}?)<(?:a)[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]{5,200})<\/a>/gi;
    let match;
    
    while ((match = pattern.exec(this.html)) !== null) {
      const url = match[1];
      const title = match[2];
      
      if (url && title && url.startsWith('http')) {
        results.push({
          title: this.cleanText(title),
          url: this.cleanUrl(url),
          snippet: '',
          position: results.length + 1,
        });
      }
    }

    return results;
  }

  /**
   * 从 HTML 片段提取结果
   */
  private extractResultFromHtml(html: string, engine: string): SearchResultSet | null {
    // 提取 URL
    const urlMatch = html.match(/href=["'](https?:\/\/[^"']+)["']/i);
    const url = urlMatch ? urlMatch[1] : '';

    // 提取标题
    const titleMatch = html.match(/<h[34][^>]*>([^<]+)<\/h[34]>/i);
    const title = titleMatch ? titleMatch[1] : '';

    // 提取摘要
    const snippet = this.findNearbySnippet(html, 500);

    if (!url || !title) return null;

    return {
      title: this.cleanText(title),
      url: this.cleanUrl(url),
      snippet: this.cleanText(snippet),
      position: 0,
    };
  }

  /**
   * 在容器中查找摘要
   */
  private findSnippetInContainer(container: string, className: string): string {
    // 尝试通过类名查找
    const classPattern = new RegExp(`<[^>]*class="[^"]*${className}[^"]*"[^>]*>([^<]{10,300})<\\/`, 'i');
    let match = container.match(classPattern);
    
    if (match && match[1]) {
      return match[1];
    }

    // 尝试通过标签名查找
    const tagPattern = /<(?:p|div|span)[^>]*>([^<]{50,300})<\/(?:p|div|span)>/i;
    match = container.match(tagPattern);
    
    if (match && match[1]) {
      return match[1];
    }

    return '';
  }

  /**
   * 在附近查找摘要
   */
  private findNearbySnippet(html: string, range: number): string {
    // 在 HTML 中查找附近的文本内容
    const textPattern = />([^<]{50,300})</g;
    let match;
    
    while ((match = textPattern.exec(html)) !== null) {
      const text = match[1].trim();
      if (text.length > 50 && text.length < 300 && !text.startsWith('<')) {
        return text;
      }
    }

    return '';
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
