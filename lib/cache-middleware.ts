import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

export interface CacheConfig {
  enabled: boolean
  ttl: number // Time to live in seconds
  maxSize: number // Maximum number of cached items
  includeQueryParams: boolean
  includeHeaders: boolean
  cacheableMethods: string[]
  cacheableStatusCodes: number[]
  keyPrefix: string
}

const defaultConfig: CacheConfig = {
  enabled: true,
  ttl: 300, // 5 minutes
  maxSize: 1000,
  includeQueryParams: true,
  includeHeaders: false,
  cacheableMethods: ['GET'],
  cacheableStatusCodes: [200, 201, 204],
  keyPrefix: 'api_cache'
}

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
  headers: Record<string, string>
}

class APICache {
  private cache = new Map<string, CacheEntry>()
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.startCleanup()
  }

  generateKey(req: NextRequest): string {
    const url = new URL(req.url)
    let key = `${this.config.keyPrefix}:${req.method}:${url.pathname}`
    
    if (this.config.includeQueryParams && url.search) {
      key += url.search
    }
    
    if (this.config.includeHeaders) {
      const relevantHeaders = ['accept', 'accept-language', 'authorization']
      const headerValues = relevantHeaders
        .map(h => req.headers.get(h))
        .filter(Boolean)
        .join('|')
      if (headerValues) {
        key += `:${headerValues}`
      }
    }
    
    return key
  }

  isCacheable(req: NextRequest, response: NextResponse): boolean {
    if (!this.config.enabled) return false
    if (!this.config.cacheableMethods.includes(req.method)) return false
    if (!this.config.cacheableStatusCodes.includes(response.status)) return false
    
    // Check cache-control headers
    const cacheControl = response.headers.get('cache-control')
    if (cacheControl && (cacheControl.includes('no-cache') || cacheControl.includes('no-store'))) {
      return false
    }
    
    return true
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key)
      return null
    }
    
    return entry
  }

  set(key: string, data: any, headers: Record<string, string>, ttl?: number): void {
    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const toRemove = Math.ceil(this.config.maxSize * 0.1) // Remove 10% of oldest entries
      entries.slice(0, toRemove).forEach(([key]) => this.cache.delete(key))
    }
    
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      headers
    }
    
    this.cache.set(key, entry)
    logger.debug('Cache entry created', { key, ttl: entry.ttl })
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    logger.info('Cache cleared')
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0 // TODO: Implement hit rate tracking
    }
  }

  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now()
      let cleaned = 0
      
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl * 1000) {
          this.cache.delete(key)
          cleaned++
        }
      }
      
      if (cleaned > 0) {
        logger.debug('Cache cleanup completed', { cleaned, remaining: this.cache.size })
      }
    }, 60000) // Run every minute
  }
}

// Global cache instance
export const apiCache = new APICache()

export function withCaching(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: Partial<CacheConfig> = {}
) {
  const finalConfig = { ...defaultConfig, ...config }
  
  return async (req: NextRequest) => {
    if (!finalConfig.enabled) {
      return handler(req)
    }

    const cacheKey = apiCache.generateKey(req)
    
    // Try to get from cache
    const cached = apiCache.get(cacheKey)
    if (cached) {
      logger.debug('Cache hit', { key: cacheKey })
      
      // Create response from cached data
      const response = NextResponse.json(cached.data)
      
      // Restore cached headers
      Object.entries(cached.headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      // Add cache headers
      response.headers.set('x-cache', 'HIT')
      response.headers.set('x-cache-age', String(Math.floor((Date.now() - cached.timestamp) / 1000)))
      
      return response
    }

    // Cache miss, execute handler
    logger.debug('Cache miss', { key: cacheKey })
    
    try {
      const response = await handler(req)
      
      // Check if response is cacheable
      if (apiCache.isCacheable(req, response)) {
        // Clone response to get body
        const clonedResponse = response.clone()
        const data = await clonedResponse.json().catch(() => null)
        
        if (data !== null) {
          // Cache the response
          const headers: Record<string, string> = {}
          response.headers.forEach((value, key) => {
            headers[key] = value
          })
          
          apiCache.set(cacheKey, data, headers, finalConfig.ttl)
          
          // Add cache headers
          response.headers.set('x-cache', 'MISS')
          response.headers.set('cache-control', `public, max-age=${finalConfig.ttl}`)
        }
      }
      
      return response
      
    } catch (error) {
      logger.error('Handler execution failed', error instanceof Error ? error : undefined, { cacheKey })
      throw error
    }
  }
}

// Caching decorator for API routes
export function cached(config?: Partial<CacheConfig>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = withCaching(originalMethod, config)
    
    return descriptor
  }
}

// Utility functions for manual cache management
export function invalidateCache(pattern: string): number {
  let invalidated = 0
  
  for (const key of apiCache['cache'].keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key)
      invalidated++
    }
  }
  
  logger.info('Cache invalidation completed', { pattern, invalidated })
  return invalidated
}

export function getCacheStats() {
  return apiCache.getStats()
}



