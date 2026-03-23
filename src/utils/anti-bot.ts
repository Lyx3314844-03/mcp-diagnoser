/**
 * 反反爬虫模块
 * 提供 User-Agent 轮换、请求头模拟、Cookie 管理、请求延迟等功能
 */

import { execa } from 'execa';

/**
 * User-Agent 池
 */
export const USER_AGENTS = [
  // Chrome Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  
  // Chrome macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  
  // Chrome Linux
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  
  // Firefox Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  
  // Firefox macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  
  // Safari macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  
  // Edge Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  
  // Mobile
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36',
];

/**
 * 接受语言头
 */
export const ACCEPT_LANGUAGES = [
  'en-US,en;q=0.9',
  'en-GB,en;q=0.9',
  'zh-CN,zh;q=0.9',
  'zh-TW,zh;q=0.9',
  'ja-JP,ja;q=0.9',
  'de-DE,de;q=0.9',
  'fr-FR,fr;q=0.9',
  'es-ES,es;q=0.9',
];

/**
 * 浏览器配置池
 */
export interface BrowserProfile {
  userAgent: string;
  acceptLanguage: string;
  platform: string;
  screenResolution: string;
  timezone: string;
}

export const BROWSER_PROFILES: BrowserProfile[] = [
  {
    userAgent: USER_AGENTS[0],
    acceptLanguage: 'en-US,en;q=0.9',
    platform: 'Win32',
    screenResolution: '1920x1080',
    timezone: 'America/New_York',
  },
  {
    userAgent: USER_AGENTS[4],
    acceptLanguage: 'en-US,en;q=0.9',
    platform: 'MacIntel',
    screenResolution: '2560x1440',
    timezone: 'America/Los_Angeles',
  },
  {
    userAgent: USER_AGENTS[8],
    acceptLanguage: 'en-GB,en;q=0.9',
    platform: 'Linux x86_64',
    screenResolution: '1920x1080',
    timezone: 'Europe/London',
  },
  {
    userAgent: USER_AGENTS[12],
    acceptLanguage: 'zh-CN,zh;q=0.9',
    platform: 'Win32',
    screenResolution: '1920x1080',
    timezone: 'Asia/Shanghai',
  },
];

/**
 * Cookie 管理器
 */
export class CookieManager {
  private cookies: Map<string, Map<string, string>> = new Map();

  /**
   * 设置 Cookie
   */
  set(domain: string, name: string, value: string, options?: {
    path?: string;
    expires?: Date;
    secure?: boolean;
    httpOnly?: boolean;
  }): void {
    if (!this.cookies.has(domain)) {
      this.cookies.set(domain, new Map());
    }
    this.cookies.get(domain)!.set(name, value);
  }

  /**
   * 获取 Cookie
   */
  get(domain: string): string {
    const domainCookies = this.cookies.get(domain);
    if (!domainCookies) return '';

    return Array.from(domainCookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  /**
   * 清除 Cookie
   */
  clear(domain?: string): void {
    if (domain) {
      this.cookies.delete(domain);
    } else {
      this.cookies.clear();
    }
  }

  /**
   * 从响应头解析 Cookie
   */
  parseFromHeader(setCookieHeader: string | string[], domain: string): void {
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    
    for (const cookie of cookies) {
      const match = cookie.match(/^([^=;]+)=([^;]+)/);
      if (match) {
        this.set(domain, match[1], match[2]);
      }
    }
  }
}

/**
 * 请求头生成器
 */
export class HeaderGenerator {
  private profile: BrowserProfile;
  private cookieManager: CookieManager;

  constructor(profile?: BrowserProfile) {
    this.profile = profile || BROWSER_PROFILES[Math.floor(Math.random() * BROWSER_PROFILES.length)];
    this.cookieManager = new CookieManager();
  }

  /**
   * 生成请求头
   */
  generateHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': this.profile.userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': this.profile.acceptLanguage,
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': this.getSecChUa(),
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': this.profile.platform,
      ...customHeaders,
    };

    return headers;
  }

  /**
   * 获取 Sec-Ch-Ua 头
   */
  private getSecChUa(): string {
    const ua = this.profile.userAgent;
    if (ua.includes('Chrome')) {
      const match = ua.match(/Chrome\/(\d+)/);
      if (match) {
        return `"Not_A Brand";v="8", "Chromium";v="${match[1]}", "Google Chrome";v="${match[1]}"`;
      }
    }
    return '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
  }

  /**
   * 设置 Cookie
   */
  setCookie(domain: string, name: string, value: string): void {
    this.cookieManager.set(domain, name, value);
  }

  /**
   * 获取 Cookie 头
   */
  getCookieHeader(domain: string): string {
    return this.cookieManager.get(domain);
  }
}

/**
 * 请求延迟管理器
 */
export class RequestDelayManager {
  private baseDelay: number;
  private randomFactor: number;
  private requestCount: Map<string, number> = new Map();
  private lastRequestTime: Map<string, number> = new Map();

  constructor(baseDelay: number = 1000, randomFactor: number = 0.5) {
    this.baseDelay = baseDelay;
    this.randomFactor = randomFactor;
  }

  /**
   * 计算延迟时间
   */
  calculateDelay(domain: string): number {
    const count = this.requestCount.get(domain) || 0;
    
    // 指数退避
    const exponentialDelay = this.baseDelay * Math.pow(1.5, Math.min(count, 5));
    
    // 添加随机因子
    const randomDelay = exponentialDelay * (1 + this.randomFactor * (Math.random() - 0.5));
    
    return Math.round(randomDelay);
  }

  /**
   * 等待延迟
   */
  async wait(domain: string): Promise<void> {
    const count = this.requestCount.get(domain) || 0;
    const lastTime = this.lastRequestTime.get(domain) || 0;
    const now = Date.now();
    
    if (count > 0) {
      const elapsed = now - lastTime;
      const requiredDelay = this.calculateDelay(domain);
      
      if (elapsed < requiredDelay) {
        await this.sleep(requiredDelay - elapsed);
      }
    }
    
    this.requestCount.set(domain, count + 1);
    this.lastRequestTime.set(domain, Date.now());
  }

  /**
   * 重置计数
   */
  reset(domain: string): void {
    this.requestCount.set(domain, 0);
    this.lastRequestTime.delete(domain);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 反反爬虫管理器
 */
export class AntiBotManager {
  private headerGenerator: HeaderGenerator;
  private delayManager: RequestDelayManager;
  private cookieManager: CookieManager;
  private currentProfile: BrowserProfile;

  constructor() {
    this.currentProfile = BROWSER_PROFILES[Math.floor(Math.random() * BROWSER_PROFILES.length)];
    this.headerGenerator = new HeaderGenerator(this.currentProfile);
    this.delayManager = new RequestDelayManager(1000, 0.5);
    this.cookieManager = new CookieManager();
  }

  /**
   * 生成反反爬虫请求头
   */
  generateHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return this.headerGenerator.generateHeaders(customHeaders);
  }

  /**
   * 等待请求延迟
   */
  async waitRequest(domain: string): Promise<void> {
    await this.delayManager.wait(domain);
  }

  /**
   * 获取 Cookie
   */
  getCookie(domain: string): string {
    return this.cookieManager.get(domain);
  }

  /**
   * 设置 Cookie
   */
  setCookie(domain: string, name: string, value: string): void {
    this.cookieManager.set(domain, name, value);
  }

  /**
   * 轮换 User-Agent
   */
  rotateUserAgent(): void {
    const newProfile = BROWSER_PROFILES[Math.floor(Math.random() * BROWSER_PROFILES.length)];
    this.currentProfile = newProfile;
    this.headerGenerator = new HeaderGenerator(newProfile);
  }

  /**
   * 重置所有状态
   */
  reset(): void {
    this.rotateUserAgent();
    this.cookieManager.clear();
  }

  /**
   * 获取当前配置
   */
  getCurrentProfile(): BrowserProfile {
    return this.currentProfile;
  }
}

// 导出单例
export const antiBotManager = new AntiBotManager();
export const cookieManager = new CookieManager();
export const headerGenerator = new HeaderGenerator();
export const delayManager = new RequestDelayManager();
