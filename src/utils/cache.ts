/**
 * 诊断缓存系统
 * 避免重复检查，提升诊断速度
 */

import { access, mkdir, readFile, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { createHash } from 'crypto';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

export interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds (5 minutes)
  cacheDir?: string;
  enabled?: boolean;
  maxCacheSize?: number; // Maximum number of entries
}

export class DiagnosticCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private cacheDir: string;
  private ttl: number;
  private enabled: boolean;
  private maxCacheSize: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.cacheDir = options.cacheDir || join(homedir(), '.mcp-diagnoser', 'cache');
    this.enabled = options.enabled !== false;
    this.maxCacheSize = options.maxCacheSize || 1000;
  }

  /**
   * 生成缓存键
   */
  private generateKey(prefix: string, ...args: any[]): string {
    const data = JSON.stringify({ prefix, args });
    return createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  /**
   * 初始化缓存目录
   */
  private async initCacheDir(): Promise<void> {
    try {
      await access(this.cacheDir);
    } catch {
      await mkdir(this.cacheDir, { recursive: true });
    }
  }

  /**
   * 获取缓存文件路径
   */
  private getCacheFilePath(key: string): string {
    return join(this.cacheDir, `${key}.json`);
  }

  /**
   * 从内存或磁盘获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) {
      return null;
    }

    // 先检查内存缓存
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      if (Date.now() - memoryEntry.timestamp < memoryEntry.ttl) {
        this.hits++;
        return memoryEntry.data as T;
      } else {
        // 过期了，删除
        this.memoryCache.delete(key);
      }
    }

    // 检查磁盘缓存
    try {
      const cacheFile = this.getCacheFilePath(key);
      const content = await readFile(cacheFile, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(content);

      if (Date.now() - entry.timestamp < entry.ttl) {
        // 加载到内存缓存
        this.memoryCache.set(key, entry);
        this.hits++;
        return entry.data;
      } else {
        // 过期了，删除
        await this.delete(key);
      }
    } catch {
      // 文件不存在或读取失败
    }

    this.misses++;
    return null;
  }

  /**
   * 设置缓存
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.ttl,
      key,
    };

    // 保存到内存缓存
    this.memoryCache.set(key, entry);

    // 限制内存缓存大小
    if (this.memoryCache.size > this.maxCacheSize) {
      // 删除最旧的条目
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    // 保存到磁盘缓存
    try {
      await this.initCacheDir();
      const cacheFile = this.getCacheFilePath(key);
      await writeFile(cacheFile, JSON.stringify(entry, null, 2), 'utf-8');
    } catch (error) {
      // 磁盘缓存失败不影响功能
      console.error('Failed to write cache to disk:', error);
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);

    try {
      const cacheFile = this.getCacheFilePath(key);
      await rm(cacheFile, { force: true });
    } catch {
      // 文件不存在忽略
    }
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();

    try {
      await this.initCacheDir();
      const files = await this.getAllCacheFiles();
      for (const file of files) {
        await rm(file, { force: true });
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * 获取所有缓存文件
   */
  private async getAllCacheFiles(): Promise<string[]> {
    try {
      const { readdir } = await import('fs/promises');
      const files = await readdir(this.cacheDir);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => join(this.cacheDir, f));
    } catch {
      return [];
    }
  }

  /**
   * 清理过期缓存
   */
  async cleanup(): Promise<number> {
    let cleaned = 0;
    const now = Date.now();

    // 清理内存缓存
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    // 清理磁盘缓存
    try {
      const files = await this.getAllCacheFiles();
      for (const file of files) {
        try {
          const content = await readFile(file, 'utf-8');
          const entry: CacheEntry<any> = JSON.parse(content);
          if (now - entry.timestamp >= entry.ttl) {
            await rm(file, { force: true });
            cleaned++;
          }
        } catch {
          // 文件损坏，删除
          await rm(file, { force: true });
          cleaned++;
        }
      }
    } catch {
      // 忽略错误
    }

    return cleaned;
  }

  /**
   * 获取缓存统计
   */
  getStats(): {
    enabled: boolean;
    memoryEntries: number;
    hits: number;
    misses: number;
    hitRate: number;
    ttl: number;
  } {
    const total = this.hits + this.misses;
    return {
      enabled: this.enabled,
      memoryEntries: this.memoryCache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      ttl: this.ttl,
    };
  }

  /**
   * 包装一个函数，自动使用缓存
   */
  wrap<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    prefix: string,
    options?: {
      ttl?: number;
      keyFn?: (...args: T) => string;
    }
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      const key = options?.keyFn
        ? options.keyFn(...args)
        : this.generateKey(prefix, ...args);

      const cached = await this.get<R>(key);
      if (cached !== null) {
        return cached;
      }

      const result = await fn(...args);
      await this.set(key, result, options?.ttl);
      return result;
    };
  }

  /**
   * 禁用缓存
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * 启用缓存
   */
  enable(): void {
    this.enabled = true;
  }
}

// 全局缓存实例
const globalCache = new DiagnosticCache();

export const cache = {
  get: <T>(key: string) => globalCache.get<T>(key),
  set: <T>(key: string, data: T, ttl?: number) => globalCache.set(key, data, ttl),
  delete: (key: string) => globalCache.delete(key),
  clear: () => globalCache.clear(),
  cleanup: () => globalCache.cleanup(),
  getStats: () => globalCache.getStats(),
  wrap: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    prefix: string,
    options?: { ttl?: number; keyFn?: (...args: T) => string }
  ) => globalCache.wrap(fn, prefix, options),
  disable: () => globalCache.disable(),
  enable: () => globalCache.enable(),
};
