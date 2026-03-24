/**
 * DiagnosticCache 单元测试
 */

import { DiagnosticCache } from '../utils/cache';

describe('DiagnosticCache', () => {
  let cache: DiagnosticCache;

  beforeEach(() => {
    cache = new DiagnosticCache({
      enabled: true,
      ttl: 1000, // 1 second for testing
      maxCacheSize: 10,
    });
  });

  afterEach(async () => {
    await cache.clear();
  });

  describe('basic operations', () => {
    it('should set and get cache entry', async () => {
      const key = 'test-key';
      const data = { value: 'test-data' };

      await cache.set(key, data);
      const result = await cache.get(key);

      expect(result).toEqual(data);
    });

    it('should return null for non-existent key', async () => {
      const result = await cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should delete cache entry', async () => {
      const key = 'test-key';
      await cache.set(key, { value: 'test' });
      
      await cache.delete(key);
      const result = await cache.get(key);
      
      expect(result).toBeNull();
    });

    it('should clear all cache entries', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      
      await cache.clear();
      
      const result1 = await cache.get('key1');
      const result2 = await cache.get('key2');
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire entry after TTL', async () => {
      const key = 'expiring-key';
      await cache.set(key, { value: 'test' }, 100); // 100ms

      const beforeExpiry = await cache.get(key);
      expect(beforeExpiry).toBeDefined();

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 150));

      const afterExpiry = await cache.get(key);
      expect(afterExpiry).toBeNull();
    });

    it('should use default TTL when not specified', async () => {
      const cacheWithDefaultTTL = new DiagnosticCache({ ttl: 100 });
      await cacheWithDefaultTTL.set('key', 'value');
      
      const result = await cacheWithDefaultTTL.get('key');
      expect(result).toBe('value');
    });
  });

  describe('cache statistics', () => {
    it('should track hits and misses', async () => {
      await cache.set('hit-key', 'value');
      
      await cache.get('hit-key'); // hit
      await cache.get('hit-key'); // hit
      await cache.get('miss-key'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(66.67, 1);
    });

    it('should track memory entries', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      
      const stats = cache.getStats();
      expect(stats.memoryEntries).toBe(2);
    });
  });

  describe('cache wrapper', () => {
    it('should cache function results', async () => {
      let callCount = 0;
      const expensiveFn = jest.fn().mockImplementation(async (x: number) => {
        callCount++;
        return x * 2;
      });

      const cachedFn = cache.wrap(expensiveFn, 'test-fn');

      const result1 = await cachedFn(5);
      const result2 = await cachedFn(5); // Should use cache

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(callCount).toBe(1); // Only called once
    });

    it('should use custom key function', async () => {
      let callCount = 0;
      const fn = jest.fn().mockImplementation(async (obj: { id: number }) => {
        callCount++;
        return obj.id * 2;
      });

      const cachedFn = cache.wrap(fn, 'test-fn', {
        keyFn: (obj: { id: number }) => `obj:${obj.id}`,
      });

      await cachedFn({ id: 1 });
      await cachedFn({ id: 1 }); // Should use cache

      expect(callCount).toBe(1);
    });
  });

  describe('cache size limit', () => {
    it('should respect max cache size', async () => {
      const smallCache = new DiagnosticCache({ maxCacheSize: 3 });

      await smallCache.set('key1', 'value1');
      await smallCache.set('key2', 'value2');
      await smallCache.set('key3', 'value3');
      await smallCache.set('key4', 'value4'); // Should evict key1

      const stats = smallCache.getStats();
      expect(stats.memoryEntries).toBeLessThanOrEqual(3);
    });
  });

  describe('enable/disable', () => {
    it('should return null when disabled', async () => {
      cache.disable();
      await cache.set('key', 'value');
      const result = await cache.get('key');
      expect(result).toBeNull();
    });

    it('should work when re-enabled', async () => {
      cache.disable();
      cache.enable();
      
      await cache.set('key', 'value');
      const result = await cache.get('key');
      expect(result).toBe('value');
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      const cleanupCache = new DiagnosticCache({ ttl: 50 });
      
      await cleanupCache.set('key1', 'value1');
      await cleanupCache.set('key2', 'value2', 1000); // Longer TTL

      // Wait for first entry to expire
      await new Promise(resolve => setTimeout(resolve, 100));

      const cleaned = await cleanupCache.cleanup();
      expect(cleaned).toBeGreaterThanOrEqual(1);
    });
  });
});
