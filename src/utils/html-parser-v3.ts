/**
 * 超增强 HTML 解析器 v3
 * 支持 JavaScript 渲染内容、智能识别、富媒体提取
 * 使用纯正则表达式，不依赖 DOMParser
 */

export interface SearchResultSet {
  title: string;
  url: string;
  snippet: string;
  position: number;
  sitelinks?: SearchResultSet[];
  richSnippet?: RichSnippet;
  images?: string[];
  videos?: string[];
  date?: string;
  author?: string;
}

export interface RichSnippet {
  type?: 'article' | 'product' | 'recipe' | 'video' | 'event' | 'job' | 'review';
  image?: string;
  rating?: number;
  reviews?: number;
  price?: string;
  date?: string;
  author?: string;
  publisher?: string;
}

export interface ParserConfig {
  engine: string;
  strictMode?: boolean;
  extractSitelinks?: boolean;
  extractRichSnippets?: boolean;
  extractImages?: boolean;
  extractVideos?: boolean;
  extractDates?: boolean;
  extractAuthors?: boolean;
  maxResults?: number;
  language?: string;
}

/**
 * 超增强 HTML 解析器类 v3
 */
export class UltraEnhancedHtmlParser {
  private config: ParserConfig;
  private html: string = '';

  constructor(config: ParserConfig) {
    this.config = {
      strictMode: false,
      extractSitelinks: false,
      extractRichSnippets: true,
      extractImages: false,
      extractVideos: false,
      extractDates: false,
      extractAuthors: false,
      maxResults: 10,
      language: 'zh-CN',
      ...config,
    };
  }

  /**
   * 解析 HTML 提取搜索结果（支持 JavaScript 渲染后的 HTML）
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
      case 'yandex':
        results.push(...this.parseYandex());
        break;
      default:
        results.push(...this.parseGeneric());
    }

    // 限制结果数量
    const maxResults = this.config.maxResults || 10;
    return results.slice(0, maxResults);
  }

  /**
   * 解析 Google 搜索结果（增强版）
   */
  private parseGoogle(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // 策略 1: 查找包含链接和标题的 div.g 容器
    const containerPattern = /<div[^>]*class="[^"]*g[^"]*"[^>]*>[\s\S]{0,5000}?<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>[\s\S]{0,300}?<h3[^>]*>([^<]+)<\/h3>/gi;
    let match;

    while ((match = containerPattern.exec(this.html)) !== null) {
      const url = match[1];
      const title = match[2];
      const container = match[0];

      // 查找摘要
      const snippetMatch = container.match(/<div[^>]*class="[^"]*VwiC3b[^"]*"[^>]*>([^<]{10,300})<\/div>/i);
      const snippet = snippetMatch ? snippetMatch[1] : '';

      const images = this.config.extractImages ? this.extractImagesFromHtml(container) : [];
      const date = this.config.extractDates ? this.extractDateFromHtml(container) : undefined;
      const author = this.config.extractAuthors ? this.extractAuthorFromHtml(container) : undefined;
      const richSnippet = this.config.extractRichSnippets ? this.extractRichSnippetData(container) : undefined;

      if (url && title && url.startsWith('http')) {
        results.push({
          title: this.cleanText(title),
          url: this.cleanUrl(url),
          snippet: this.cleanText(snippet),
          position: results.length + 1,
          images,
          date,
          author,
          richSnippet,
        });
      }
    }

    // 策略 2: 查找 h3 和链接组合
    if (results.length === 0) {
      const h3Pattern = /<h3[^>]*>[\s\S]{0,200}?<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]+)<\/a>/gi;
      
      while ((match = h3Pattern.exec(this.html)) !== null) {
        const url = match[1];
        const title = match[2];

        if (url && title && url.startsWith('http')) {
          const snippet = this.findNearbyText(match[0], 300);
          const images = this.config.extractImages ? this.extractImagesFromHtml(match[0]) : [];
          const date = this.config.extractDates ? this.extractDateFromHtml(match[0]) : undefined;
          const richSnippet = this.config.extractRichSnippets ? this.extractRichSnippetData(match[0]) : undefined;

          results.push({
            title: this.cleanText(title),
            url: this.cleanUrl(url),
            snippet: this.cleanText(snippet),
            position: results.length + 1,
            images,
            date,
            richSnippet,
          });
        }
      }
    }

    // 策略 3: 查找所有链接
    if (results.length === 0) {
      const linkPattern = /<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]{5,200})<\/a>/gi;
      
      while ((match = linkPattern.exec(this.html)) !== null) {
        const url = match[1];
        const title = match[2];

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
   * 解析 Bing 搜索结果（增强版）
   */
  private parseBing(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // 查找 b_algo 容器
    const pattern = /<li[^>]*class="[^"]*b_algo[^"]*"[^>]*>[\s\S]{0,5000}?<h2[^>]*>[\s\S]{0,200}?<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]+)<\/a>[\s\S]{0,500}?<div[^>]*class="[^"]*b_caption[^"]*"[^>]*>([^<]{10,300})<\/div>[\s\S]{0,200}?<\/li>/gi;
    let match;

    while ((match = pattern.exec(this.html)) !== null) {
      const url = match[1];
      const title = match[2];
      const snippet = match[3];
      const container = match[0];

      const images = this.config.extractImages ? this.extractImagesFromHtml(container) : [];
      const date = this.config.extractDates ? this.extractDateFromHtml(container) : undefined;
      const richSnippet = this.config.extractRichSnippets ? this.extractRichSnippetData(container) : undefined;

      if (url && title && url.startsWith('http')) {
        results.push({
          title: this.cleanText(title),
          url: this.cleanUrl(url),
          snippet: this.cleanText(snippet),
          position: results.length + 1,
          images,
          date,
          richSnippet,
        });
      }
    }

    return results;
  }

  /**
   * 解析百度搜索结果（增强版）
   */
  private parseBaidu(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // 查找 c-container 容器
    const pattern = /<div[^>]*class="[^"]*c-container[^"]*"[^>]*>[\s\S]{0,5000}?<h3[^>]*class="[^"]*t[^"]*"[^>]*>[\s\S]{0,200}?<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]+)<\/a>[\s\S]{0,500}?<div[^>]*class="[^"]*c-abstract[^"]*"[^>]*>([^<]{10,300})<\/div>[\s\S]{0,200}?<\/div>/gi;
    let match;

    while ((match = pattern.exec(this.html)) !== null) {
      const url = match[1];
      const title = match[2];
      const snippet = match[3];
      const container = match[0];

      const images = this.config.extractImages ? this.extractImagesFromHtml(container) : [];
      const date = this.config.extractDates ? this.extractDateFromHtml(container) : undefined;

      if (url && title && url.startsWith('http')) {
        results.push({
          title: this.cleanText(title),
          url: this.cleanUrl(url),
          snippet: this.cleanText(snippet),
          position: results.length + 1,
          images,
          date,
        });
      }
    }

    return results;
  }

  /**
   * 解析 DuckDuckGo 搜索结果
   */
  private parseDuckDuckGo(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    const pattern = /<div[^>]*class="[^"]*result[^"]*"[^>]*>[\s\S]{0,5000}?<a[^>]*class="[^"]*result__a[^"]*"[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]+)<\/a>[\s\S]{0,500}?<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([^<]{10,300})<\/a>[\s\S]{0,200}?<\/div>/gi;
    let match;

    while ((match = pattern.exec(this.html)) !== null) {
      const url = match[1];
      const title = match[2];
      const snippet = match[3];

      if (url && title && url.startsWith('http')) {
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
   * 解析 Yandex 搜索结果
   */
  private parseYandex(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    const pattern = /<li[^>]*class="[^"]*serp-item[^"]*"[^>]*>[\s\S]{0,5000}?<a[^>]*class="[^"]*link[^"]*"[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]+)<\/a>[\s\S]{0,500}?<div[^>]*class="[^"]*OrganicText[^"]*"[^>]*>([^<]{10,300})<\/div>[\s\S]{0,200}?<\/li>/gi;
    let match;

    while ((match = pattern.exec(this.html)) !== null) {
      const url = match[1];
      const title = match[2];
      const snippet = match[3];

      if (url && title && url.startsWith('http')) {
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
   * 通用解析策略
   */
  private parseGeneric(): SearchResultSet[] {
    const results: SearchResultSet[] = [];

    // 查找所有标题和链接组合
    const pattern = /<(?:h[1-6])[^>]*>[\s\S]{0,200}?<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]{5,200})<\/a>/gi;
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
   * 从 HTML 中提取富片段数据
   */
  private extractRichSnippetData(html: string): RichSnippet | undefined {
    const richSnippet: RichSnippet = {};

    // 提取评分
    const ratingMatch = html.match(/itemprop=["']ratingValue["'][^>]*>([\d.]+)/i);
    if (ratingMatch) {
      richSnippet.rating = parseFloat(ratingMatch[1]);
    }

    // 提取评论数
    const reviewsMatch = html.match(/itemprop=["']reviewCount["'][^>]*>(\d+)/i);
    if (reviewsMatch) {
      richSnippet.reviews = parseInt(reviewsMatch[1]);
    }

    // 提取价格
    const priceMatch = html.match(/itemprop=["']price["'][^>]*>([\d.$,]+)/i);
    if (priceMatch) {
      richSnippet.price = priceMatch[1];
    }

    // 提取图片
    const imageMatch = html.match(/<img[^>]*src=["'](https?:\/\/[^"']+)["']/i);
    if (imageMatch) {
      richSnippet.image = imageMatch[1];
    }

    // 提取类型
    if (html.includes('itemtype="http://schema.org/Product"')) richSnippet.type = 'product';
    else if (html.includes('itemtype="http://schema.org/Article"')) richSnippet.type = 'article';
    else if (html.includes('itemtype="http://schema.org/Recipe"')) richSnippet.type = 'recipe';
    else if (html.includes('itemtype="http://schema.org/VideoObject"')) richSnippet.type = 'video';
    else if (html.includes('itemtype="http://schema.org/Event"')) richSnippet.type = 'event';

    if (Object.keys(richSnippet).length > 0) {
      return richSnippet;
    }

    return undefined;
  }

  /**
   * 从 HTML 中提取图片
   */
  private extractImagesFromHtml(html: string): string[] {
    const images: string[] = [];
    const imgPattern = /<img[^>]*src=["'](https?:\/\/[^"']+)["']/gi;
    let match;

    while ((match = imgPattern.exec(html)) !== null) {
      const src = match[1];
      if (src && src.startsWith('http') && !images.includes(src)) {
        images.push(src);
      }
    }

    return images;
  }

  /**
   * 提取日期信息
   */
  private extractDateFromHtml(html: string): string | undefined {
    // 查找 time 标签
    const timeMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i);
    if (timeMatch) {
      return timeMatch[1];
    }

    // 查找日期格式
    const dateMatch = html.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
    if (dateMatch) {
      return dateMatch[1];
    }

    return undefined;
  }

  /**
   * 提取作者信息
   */
  private extractAuthorFromHtml(html: string): string | undefined {
    const authorMatch = html.match(/itemprop=["']author["'][^>]*>([^<]+)<\//i);
    if (authorMatch) {
      return authorMatch[1].trim();
    }

    return undefined;
  }

  /**
   * 在附近查找文本
   */
  private findNearbyText(html: string, maxLength: number): string {
    // 查找段落文本
    const pMatch = html.match(/<p[^>]*>([^<]{50,300})<\/p>/i);
    if (pMatch && pMatch[1]) {
      return pMatch[1].trim();
    }

    // 查找 div 文本
    const divMatch = html.match(/<div[^>]*>([^<]{50,300})<\/div>/i);
    if (divMatch && divMatch[1]) {
      return divMatch[1].trim();
    }

    return '';
  }

  /**
   * 清理文本
   */
  private cleanText(text: string): string {
    if (!text) return '';

    let cleaned = text.replace(/<[^>]*>/g, '');

    cleaned = cleaned
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&hellip;/g, '…');

    cleaned = cleaned.trim().replace(/\s+/g, ' ');

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
      const decoded = decodeURIComponent(url);
      
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
export function createUltraParser(engine: string, options?: Partial<ParserConfig>): UltraEnhancedHtmlParser {
  return new UltraEnhancedHtmlParser({
    engine,
    strictMode: false,
    extractSitelinks: false,
    extractRichSnippets: true,
    extractImages: false,
    extractVideos: false,
    extractDates: false,
    extractAuthors: false,
    maxResults: 10,
    language: 'zh-CN',
    ...options,
  });
}
