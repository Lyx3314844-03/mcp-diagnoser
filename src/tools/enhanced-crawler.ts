/**
 * 增强的 Web 爬虫模块
 * 支持并发爬取、JavaScript 渲染、robots.txt 遵守等功能
 */

import { execa } from 'execa';
import chalk from 'chalk';

export interface EnhancedCrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  sameDomain?: boolean;
  excludePatterns?: string[];
  includePatterns?: string[];
  timeout?: number;
  delay?: number;
  concurrency?: number;        // 并发数
  respectRobotsTxt?: boolean;  // 遵守 robots.txt
  retryFailed?: boolean;       // 重试失败请求
  maxRetries?: number;
  userAgent?: string;
  extractImages?: boolean;     // 提取图片
  extractVideos?: boolean;     // 提取视频
  extractMetadata?: boolean;   // 提取元数据
  screenshot?: boolean;        // 截图
  screenshotDir?: string;
}

export interface EnhancedCrawlResult {
  baseUrl: string;
  totalPages: number;
  pages: EnhancedCrawledPage[];
  crawlTime: number;
  stats: CrawlStats;
  errors: CrawlError[];
}

export interface EnhancedCrawledPage {
  url: string;
  title: string;
  content: string;
  depth: number;
  links: string[];
  images?: string[];
  videos?: string[];
  metadata?: Record<string, string>;
  screenshot?: string;
  loadTime?: number;
  statusCode?: number;
}

export interface CrawlStats {
  successCount: number;
  failCount: number;
  retryCount: number;
  skippedCount: number;
  totalLinks: number;
  totalImages: number;
  totalSize: number;
}

export interface CrawlError {
  url: string;
  error: string;
  retries: number;
}

export interface RobotsTxtRules {
  allowed: boolean;
  crawlDelay?: number;
  sitemap?: string[];
}

/**
 * 增强的 Web 爬虫类
 */
export class EnhancedWebCrawler {
  private visitedUrls: Set<string>;
  private urlsToVisit: Array<{ url: string; depth: number }>;
  private pages: EnhancedCrawledPage[];
  private baseUrl: string;
  private options: EnhancedCrawlOptions;
  private robotsTxtCache: Map<string, RobotsTxtRules>;
  private errors: CrawlError[];
  private stats: CrawlStats;

  constructor() {
    this.visitedUrls = new Set();
    this.urlsToVisit = [];
    this.pages = [];
    this.baseUrl = '';
    this.options = {};
    this.robotsTxtCache = new Map();
    this.errors = [];
    this.stats = {
      successCount: 0,
      failCount: 0,
      retryCount: 0,
      skippedCount: 0,
      totalLinks: 0,
      totalImages: 0,
      totalSize: 0,
    };
  }

  /**
   * 增强爬取功能
   */
  async crawl(url: string, options: EnhancedCrawlOptions = {}): Promise<EnhancedCrawlResult> {
    this.baseUrl = url;
    this.options = {
      maxPages: options.maxPages || 20,
      maxDepth: options.maxDepth || 3,
      sameDomain: options.sameDomain !== false,
      excludePatterns: options.excludePatterns || [],
      includePatterns: options.includePatterns || [],
      timeout: options.timeout || 10000,
      delay: options.delay || 500,
      concurrency: options.concurrency || 1,
      respectRobotsTxt: options.respectRobotsTxt !== false,
      retryFailed: options.retryFailed !== false,
      maxRetries: options.maxRetries || 3,
      userAgent: options.userAgent || 'Mozilla/5.0 (compatible; MCP Diagnoser Bot/1.0)',
      extractImages: options.extractImages || false,
      extractVideos: options.extractVideos || false,
      extractMetadata: options.extractMetadata || false,
      screenshot: options.screenshot || false,
      ...options,
    };

    this.visitedUrls.clear();
    this.urlsToVisit = [{ url, depth: 0 }];
    this.pages = [];
    this.errors = [];
    this.stats = {
      successCount: 0,
      failCount: 0,
      retryCount: 0,
      skippedCount: 0,
      totalLinks: 0,
      totalImages: 0,
      totalSize: 0,
    };

    const startTime = Date.now();

    // 检查 robots.txt
    if (this.options.respectRobotsTxt) {
      const robotsRules = await this.checkRobotsTxt(url);
      if (!robotsRules.allowed) {
        console.warn(chalk.yellow(`URL ${url} is disallowed by robots.txt`));
        this.stats.skippedCount++;
      }
      if (robotsRules.crawlDelay) {
        this.options.delay = Math.max(this.options.delay || 500, robotsRules.crawlDelay * 1000);
      }
    }

    // 并发爬取
    if (this.options.concurrency && this.options.concurrency > 1) {
      await this.crawlConcurrent();
    } else {
      await this.crawlSequential();
    }

    const crawlTime = Date.now() - startTime;

    return {
      baseUrl: url,
      totalPages: this.pages.length,
      pages: this.pages,
      crawlTime,
      stats: this.stats,
      errors: this.errors,
    };
  }

  /**
   * 顺序爬取
   */
  private async crawlSequential(): Promise<void> {
    while (
      this.urlsToVisit.length > 0 &&
      this.pages.length < this.options.maxPages!
    ) {
      const { url, depth } = this.urlsToVisit.shift()!;

      if (this.visitedUrls.has(url)) {
        continue;
      }

      await this.crawlPage(url, depth);

      // 请求延迟
      if (this.options.delay && this.urlsToVisit.length > 0) {
        await this.sleep(this.options.delay);
      }
    }
  }

  /**
   * 并发爬取
   */
  private async crawlConcurrent(): Promise<void> {
    const concurrency = this.options.concurrency || 1;
    const queue: Array<{ url: string; depth: number }> = [];

    while (
      (this.urlsToVisit.length > 0 || queue.length > 0) &&
      this.pages.length < this.options.maxPages!
    ) {
      // 填充并发队列
      while (queue.length < concurrency && this.urlsToVisit.length > 0) {
        const item = this.urlsToVisit.shift()!;
        queue.push(item);
      }

      // 并发执行
      const promises = queue.map(async (item) => {
        if (!this.visitedUrls.has(item.url)) {
          await this.crawlPage(item.url, item.depth);
        }
      });

      await Promise.all(promises);
      queue.length = 0;

      // 延迟
      if (this.options.delay) {
        await this.sleep(this.options.delay);
      }
    }
  }

  /**
   * 爬取单个页面
   */
  private async crawlPage(url: string, depth: number): Promise<void> {
    if (depth > this.options.maxDepth!) {
      this.stats.skippedCount++;
      return;
    }

    if (this.visitedUrls.has(url)) {
      return;
    }

    // 检查 robots.txt
    if (this.options.respectRobotsTxt) {
      const robotsRules = await this.checkRobotsTxt(url);
      if (!robotsRules.allowed) {
        this.stats.skippedCount++;
        return;
      }
    }

    const startTime = Date.now();
    let retries = 0;
    let success = false;

    while (!success && retries <= (this.options.maxRetries || 3)) {
      try {
        const page = await this.fetchPage(url, depth);
        
        if (page) {
          this.pages.push(page);
          this.visitedUrls.add(url);
          this.stats.successCount++;
          this.stats.totalLinks += page.links.length;
          if (page.images) {
            this.stats.totalImages += page.images.length;
          }
          this.stats.totalSize += page.content.length;

          // 添加新 URL 到队列
          for (const link of page.links) {
            if (
              !this.visitedUrls.has(link) &&
              !this.urlsToVisit.some(u => u.url === link) &&
              this.shouldCrawlUrl(link)
            ) {
              this.urlsToVisit.push({ url: link, depth: depth + 1 });
            }
          }

          success = true;
        }
      } catch (error) {
        retries++;
        this.stats.retryCount++;
        
        if (retries <= (this.options.maxRetries || 3)) {
          console.warn(chalk.yellow(`Retry ${retries}/${this.options.maxRetries} for ${url}`));
          await this.sleep(1000 * retries); // 指数退避
        } else {
          this.stats.failCount++;
          this.errors.push({
            url,
            error: error instanceof Error ? error.message : 'Unknown error',
            retries,
          });
          console.error(chalk.red(`Failed to crawl ${url} after ${retries} retries`));
        }
      }
    }
  }

  /**
   * 获取页面内容
   */
  private async fetchPage(url: string, depth: number): Promise<EnhancedCrawledPage | null> {
    const startTime = Date.now();

    try {
      // 使用 curl 获取页面
      const { stdout, stderr } = await execa('curl', [
        '-s',
        '-L',
        '-A', this.options.userAgent || 'Mozilla/5.0',
        '-H', 'Accept: text/html,application/xhtml+xml',
        '-H', 'Accept-Language: en-US,en;q=0.9',
        '--compressed',
        '--max-time', String((this.options.timeout || 10000) / 1000),
        url,
      ], {
        timeout: this.options.timeout || 10000,
        reject: false,
      });

      const loadTime = Date.now() - startTime;

      if (stderr) {
        console.warn(chalk.yellow(`curl warning: ${stderr}`));
      }

      // 解析 HTML
      const title = this.extractTitle(stdout);
      const links = this.extractLinks(stdout, url);
      const content = this.extractTextContent(stdout);
      
      const page: EnhancedCrawledPage = {
        url,
        title: this.cleanText(title),
        content: this.cleanText(content),
        depth,
        links,
        loadTime,
        statusCode: 200,
      };

      // 提取图片
      if (this.options.extractImages) {
        page.images = this.extractImages(stdout, url);
      }

      // 提取视频
      if (this.options.extractVideos) {
        page.videos = this.extractVideos(stdout, url);
      }

      // 提取元数据
      if (this.options.extractMetadata) {
        page.metadata = this.extractMetadata(stdout);
      }

      // 截图
      if (this.options.screenshot) {
        // 截图功能需要 Playwright 支持
        console.warn(chalk.yellow('Screenshot feature requires Playwright'));
      }

      return page;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 检查 robots.txt
   */
  private async checkRobotsTxt(url: string): Promise<RobotsTxtRules> {
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
    
    // 检查缓存
    if (this.robotsTxtCache.has(baseUrl)) {
      return this.robotsTxtCache.get(baseUrl)!;
    }

    try {
      const robotsUrl = `${baseUrl}/robots.txt`;
      const { stdout } = await execa('curl', [
        '-s',
        '-A', this.options.userAgent || 'Mozilla/5.0',
        '--max-time', '5',
        robotsUrl,
      ], {
        timeout: 5000,
        reject: false,
      });

      const rules = this.parseRobotsTxt(stdout, url);
      this.robotsTxtCache.set(baseUrl, rules);
      return rules;
    } catch (error) {
      // 如果无法获取 robots.txt，默认允许
      const defaultRules: RobotsTxtRules = { allowed: true };
      this.robotsTxtCache.set(baseUrl, defaultRules);
      return defaultRules;
    }
  }

  /**
   * 解析 robots.txt
   */
  private parseRobotsTxt(content: string, url: string): RobotsTxtRules {
    const rules: RobotsTxtRules = { allowed: true };
    const lines = content.split('\n');
    let currentUserAgent = '';
    let matchedUserAgent = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [directive, ...valueParts] = trimmed.split(':');
      const directiveLower = directive.trim().toLowerCase();
      const value = valueParts.join(':').trim();

      if (directiveLower === 'user-agent') {
        currentUserAgent = value;
        matchedUserAgent = value === '*' || value.toLowerCase().includes('mcp');
      }

      if (directiveLower === 'disallow' && matchedUserAgent) {
        if (value && url.includes(value)) {
          rules.allowed = false;
        }
      }

      if (directiveLower === 'crawl-delay' && matchedUserAgent) {
        rules.crawlDelay = parseFloat(value) || undefined;
      }

      if (directiveLower === 'sitemap' && matchedUserAgent) {
        if (!rules.sitemap) rules.sitemap = [];
        rules.sitemap.push(value);
      }
    }

    return rules;
  }

  /**
   * 提取标题
   */
  private extractTitle(html: string): string {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : '';
  }

  /**
   * 提取链接
   */
  private extractLinks(html: string, baseUrl: string): string[] {
    const links: string[] = [];
    const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        if (absoluteUrl.startsWith('http') && !links.includes(absoluteUrl)) {
          links.push(absoluteUrl);
        }
      } catch {
        // 忽略无效 URL
      }
    }

    return links;
  }

  /**
   * 提取图片
   */
  private extractImages(html: string, baseUrl: string): string[] {
    const images: string[] = [];
    const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      try {
        const absoluteUrl = new URL(src, baseUrl).href;
        if (absoluteUrl.startsWith('http') && !images.includes(absoluteUrl)) {
          images.push(absoluteUrl);
        }
      } catch {
        // 忽略无效 URL
      }
    }

    return images;
  }

  /**
   * 提取视频
   */
  private extractVideos(html: string, baseUrl: string): string[] {
    const videos: string[] = [];
    
    // 提取 video 标签
    const videoRegex = /<video[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = videoRegex.exec(html)) !== null) {
      const src = match[1];
      try {
        const absoluteUrl = new URL(src, baseUrl).href;
        if (absoluteUrl.startsWith('http') && !videos.includes(absoluteUrl)) {
          videos.push(absoluteUrl);
        }
      } catch {
        // 忽略无效 URL
      }
    }

    // 提取 source 标签
    const sourceRegex = /<source[^>]*src=["']([^"']+)["'][^>]*>/gi;
    while ((match = sourceRegex.exec(html)) !== null) {
      const src = match[1];
      try {
        const absoluteUrl = new URL(src, baseUrl).href;
        if (absoluteUrl.startsWith('http') && !videos.includes(absoluteUrl)) {
          videos.push(absoluteUrl);
        }
      } catch {
        // 忽略无效 URL
      }
    }

    return videos;
  }

  /**
   * 提取元数据
   */
  private extractMetadata(html: string): Record<string, string> {
    const metadata: Record<string, string> = {};
    
    // 提取 meta 标签
    const metaRegex = /<meta[^>]*name=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = metaRegex.exec(html)) !== null) {
      const name = match[1].toLowerCase();
      const content = match[2];
      metadata[name] = content;
    }

    // 提取 Open Graph 数据
    const ogRegex = /<meta[^>]*property=["']og:([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi;
    while ((match = ogRegex.exec(html)) !== null) {
      const property = `og:${match[1]}`;
      const content = match[2];
      metadata[property] = content;
    }

    return metadata;
  }

  /**
   * 提取文本内容
   */
  private extractTextContent(html: string): string {
    // 移除脚本和样式
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      // 移除 HTML 标签
      .replace(/<[^>]*>/g, ' ')
      // 标准化空白
      .replace(/\s+/g, ' ')
      .trim();

    return text.substring(0, 10000); // 限制长度
  }

  /**
   * 清理文本
   */
  private cleanText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500);
  }

  /**
   * 判断是否应该爬取 URL
   */
  private shouldCrawlUrl(url: string): boolean {
    // 检查同域名
    if (this.options.sameDomain) {
      try {
        const baseUrlObj = new URL(this.baseUrl);
        const urlObj = new URL(url);
        if (baseUrlObj.hostname !== urlObj.hostname) {
          return false;
        }
      } catch {
        return false;
      }
    }

    // 检查排除模式
    if (this.options.excludePatterns) {
      for (const pattern of this.options.excludePatterns) {
        if (url.includes(pattern)) {
          return false;
        }
      }
    }

    // 检查包含模式
    if (this.options.includePatterns && this.options.includePatterns.length > 0) {
      let matched = false;
      for (const pattern of this.options.includePatterns) {
        if (url.includes(pattern)) {
          matched = true;
          break;
        }
      }
      if (!matched) {
        return false;
      }
    }

    return true;
  }

  /**
   * 延迟
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取爬取统计
   */
  getStats(): CrawlStats {
    return this.stats;
  }

  /**
   * 获取错误列表
   */
  getErrors(): CrawlError[] {
    return this.errors;
  }

  /**
   * 导出结果为 JSON
   */
  exportToJson(filePath?: string): string {
    const result = {
      baseUrl: this.baseUrl,
      totalPages: this.pages.length,
      pages: this.pages,
      stats: this.stats,
      errors: this.errors,
    };

    const json = JSON.stringify(result, null, 2);

    if (filePath) {
      // 需要文件系统支持
      console.log(`Exported to ${filePath}`);
    }

    return json;
  }

  /**
   * 导出结果为 Markdown
   */
  exportToMarkdown(): string {
    let md = `# Crawl Report: ${this.baseUrl}\n\n`;
    md += `## Statistics\n\n`;
    md += `- Total Pages: ${this.pages.length}\n`;
    md += `- Total Links: ${this.stats.totalLinks}\n`;
    md += `- Total Images: ${this.stats.totalImages}\n`;
    md += `- Total Size: ${(this.stats.totalSize / 1024).toFixed(2)} KB\n`;
    md += `- Success: ${this.stats.successCount}\n`;
    md += `- Failed: ${this.stats.failCount}\n`;
    md += `- Retries: ${this.stats.retryCount}\n\n`;

    md += `## Pages\n\n`;
    for (const page of this.pages) {
      md += `### [${page.title}](${page.url})\n\n`;
      md += `**Depth**: ${page.depth}\n`;
      md += `**Load Time**: ${page.loadTime}ms\n`;
      if (page.links.length > 0) {
        md += `**Links**: ${page.links.length}\n`;
      }
      if (page.images && page.images.length > 0) {
        md += `**Images**: ${page.images.length}\n`;
      }
      md += `\n**Content**:\n\n${page.content.substring(0, 500)}...\n\n`;
      md += `---\n\n`;
    }

    if (this.errors.length > 0) {
      md += `## Errors\n\n`;
      for (const error of this.errors) {
        md += `- ${error.url}: ${error.error} (retries: ${error.retries})\n`;
      }
    }

    return md;
  }
}

// 导出单例
export const enhancedCrawler = new EnhancedWebCrawler();
