interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private readonly defaultTTL: number

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL
    this.startCleanup()
  }

  set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }
    this.cache.set(key, entry)
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.isValid(key)
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private isValid(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const now = Date.now()
    return now - entry.timestamp <= entry.ttl
  }

  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key)
        }
      }
    }, 60 * 1000) // Clean up every minute
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Create cache instances for different data types
export const productCache = new Cache(10 * 60 * 1000) // 10 minutes for products
export const categoryCache = new Cache(30 * 60 * 1000) // 30 minutes for categories
export const userCache = new Cache(15 * 60 * 1000) // 15 minutes for users

// Cache decorator for functions
export function withCache<T extends any[], R>(
  cache: Cache<R>,
  keyFn: (...args: T) => string,
  ttl?: number
) {
  return function (fn: (...args: T) => Promise<R> | R) {
    return async (...args: T): Promise<R> => {
      const key = keyFn(...args)
      const cached = cache.get(key)
      
      if (cached !== null) {
        return cached
      }

      const result = await fn(...args)
      cache.set(key, result, ttl)
      return result
    }
  }
}

// Cache key generators
export const cacheKeys = {
  product: (id: string) => `product:${id}`,
  productList: (filters: string) => `products:${filters}`,
  category: (id: string) => `category:${id}`,
  categoryList: () => 'categories:all',
  user: (id: string) => `user:${id}`,
  search: (query: string, filters: string) => `search:${query}:${filters}`,
}

// Cache invalidation utilities
export function invalidateProductCache(productId?: string): void {
  if (productId) {
    productCache.delete(cacheKeys.product(productId))
  }
  // Invalidate product lists
  const stats = productCache.getStats()
  stats.keys.forEach(key => {
    if (key.startsWith('products:')) {
      productCache.delete(key)
    }
  })
}

export function invalidateCategoryCache(categoryId?: string): void {
  if (categoryId) {
    categoryCache.delete(cacheKeys.category(categoryId))
  }
  categoryCache.delete(cacheKeys.categoryList())
}

export function invalidateUserCache(userId?: string): void {
  if (userId) {
    userCache.delete(cacheKeys.user(userId))
  }
}

// Memory usage monitoring
export function getCacheMemoryUsage(): Record<string, { size: number; memoryEstimate: number }> {
  const caches = {
    products: productCache,
    categories: categoryCache,
    users: userCache,
  }

  const usage: Record<string, { size: number; memoryEstimate: number }> = {}
  
  for (const [name, cache] of Object.entries(caches)) {
    const stats = cache.getStats()
    // Rough estimate: 1KB per cache entry
    const memoryEstimate = stats.size * 1024
    usage[name] = {
      size: stats.size,
      memoryEstimate
    }
  }

  return usage
}



