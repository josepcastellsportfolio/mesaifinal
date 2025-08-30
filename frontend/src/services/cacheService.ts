interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

class CacheService {
  private cache = new Map<string, CacheItem<unknown>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly defaultMaxSize = 100;

  private options: CacheOptions;

  constructor(options: CacheOptions = {}) {
    this.options = options;
    this.options.ttl = options.ttl || this.defaultTTL;
    this.options.maxSize = options.maxSize || this.defaultMaxSize;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Clean expired items before adding new one
    this.cleanup();

    // Remove oldest items if cache is full
    if (this.cache.size >= (this.options.maxSize || this.defaultMaxSize)) {
      this.evictOldest();
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || (this.options.ttl || this.defaultTTL),
    };

    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;

    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  keys(): string[] {
    this.cleanup();
    return Array.from(this.cache.keys());
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Get cache statistics
  getStats() {
    this.cleanup();
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      keys: this.keys(),
    };
  }
}

// Create singleton instances for different cache types
export const apiCache = new CacheService({ ttl: 5 * 60 * 1000, maxSize: 50 }); // 5 minutes
export const uiCache = new CacheService({ ttl: 30 * 60 * 1000, maxSize: 20 }); // 30 minutes
export const sessionCache = new CacheService({ ttl: 24 * 60 * 60 * 1000, maxSize: 10 }); // 24 hours

// Cache decorator for functions
export function withCache<T extends (...args: unknown[]) => unknown>(
  cache: CacheService,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
) {
  return (fn: T): T => {
    return ((...args: Parameters<T>) => {
      const key = keyGenerator(...args);
      const cached = cache.get(key);
      
      if (cached !== null) {
        return cached;
      }

      const result = fn(...args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result.then((data) => {
          cache.set(key, data, ttl);
          return data;
        });
      }

      cache.set(key, result, ttl);
      return result;
    }) as T;
  };
}

// Utility functions for common cache operations
export const cacheUtils = {
  // Generate cache key from object
  generateKey: (prefix: string, data: Record<string, unknown>): string => {
    const sortedKeys = Object.keys(data).sort();
    const keyString = sortedKeys.map(key => `${key}:${data[key]}`).join('|');
    return `${prefix}:${keyString}`;
  },

  // Cache API responses with automatic key generation
  cacheApiResponse: <T>(
    cache: CacheService,
    key: string,
    response: T,
    ttl?: number
  ): void => {
    cache.set(key, response, ttl);
  },

  // Get cached API response
  getCachedApiResponse: <T>(cache: CacheService, key: string): T | null => {
    return cache.get<T>(key);
  },

  // Invalidate cache by pattern
  invalidateByPattern: (cache: CacheService, pattern: string): void => {
    const keys = cache.keys();
    keys.forEach(key => {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    });
  },
};
