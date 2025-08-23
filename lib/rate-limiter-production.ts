/**
 * Production Rate Limiting System
 * Comprehensive rate limiting with Redis backend and multiple strategies
 */

import { NextRequest, NextResponse } from 'next/server'
import { productionLogger } from './logger-production'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
  onLimitReached?: (req: NextRequest) => void
  whitelist?: string[]
  message?: string
}

interface RateLimitResult {
  isAllowed: boolean
  remainingRequests: number
  resetTime: number
  totalRequests: number
}

// In-memory store for development/fallback
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    
    // Clean up expired entries
    if (Date.now() > entry.resetTime) {
      this.store.delete(key)
      return null
    }
    
    return entry
  }

  async set(key: string, value: { count: number; resetTime: number }): Promise<void> {
    this.store.set(key, value)
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const existing = await this.get(key)
    
    if (existing) {
      existing.count++
      await this.set(key, existing)
      return existing
    } else {
      const newEntry = { count: 1, resetTime: Date.now() + windowMs }
      await this.set(key, newEntry)
      return newEntry
    }
  }

  async cleanup(): Promise<void> {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Redis store for production
class RedisStore {
  private redis: any = null

  constructor() {
    this.initializeRedis()
  }

  private async initializeRedis(): Promise<void> {
    if (typeof window !== 'undefined') return
    
    try {
      if (process.env.REDIS_URL) {
        const Redis = await import('ioredis')
        this.redis = new Redis.default(process.env.REDIS_URL)
        
        this.redis.on('error', (error: Error) => {
          productionLogger.error('Redis connection error', error)
        })
      }
    } catch (error) {
      productionLogger.warn('Redis not available, falling back to memory store', { error })
    }
  }

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    if (!this.redis) return null
    
    try {
      const data = await this.redis.hgetall(`ratelimit:${key}`)
      if (!data.count) return null
      
      return {
        count: parseInt(data.count),
        resetTime: parseInt(data.resetTime)
      }
    } catch (error) {
      productionLogger.error('Redis get error', error as Error)
      return null
    }
  }

  async set(key: string, value: { count: number; resetTime: number }): Promise<void> {
    if (!this.redis) return
    
    try {
      const ttl = Math.ceil((value.resetTime - Date.now()) / 1000)
      await this.redis.hmset(`ratelimit:${key}`, 'count', value.count, 'resetTime', value.resetTime)
      await this.redis.expire(`ratelimit:${key}`, ttl)
    } catch (error) {
      productionLogger.error('Redis set error', error as Error)
    }
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    if (!this.redis) {
      throw new Error('Redis not available')
    }
    
    try {
      const redisKey = `ratelimit:${key}`
      const now = Date.now()
      const resetTime = now + windowMs
      
      // Use Lua script for atomic operation
      const luaScript = `
        local key = KEYS[1]
        local resetTime = tonumber(ARGV[1])
        local windowMs = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        
        local current = redis.call('HMGET', key, 'count', 'resetTime')
        local count = tonumber(current[1]) or 0
        local existingResetTime = tonumber(current[2]) or 0
        
        if existingResetTime > now then
          count = count + 1
          redis.call('HMSET', key, 'count', count, 'resetTime', existingResetTime)
          local ttl = math.ceil((existingResetTime - now) / 1000)
          redis.call('EXPIRE', key, ttl)
          return {count, existingResetTime}
        else
          count = 1
          redis.call('HMSET', key, 'count', count, 'resetTime', resetTime)
          local ttl = math.ceil(windowMs / 1000)
          redis.call('EXPIRE', key, ttl)
          return {count, resetTime}
        end
      `
      
      const result = await this.redis.eval(luaScript, 1, redisKey, resetTime, windowMs, now)
      
      return {
        count: parseInt(result[0]),
        resetTime: parseInt(result[1])
      }
    } catch (error) {
      productionLogger.error('Redis increment error', error as Error)
      throw error
    }
  }
}

class ProductionRateLimiter {
  private memoryStore = new MemoryStore()
  private redisStore = new RedisStore()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start cleanup interval for memory store
    this.cleanupInterval = setInterval(() => {
      this.memoryStore.cleanup()
    }, 60000) // Clean up every minute
  }

  private getStore() {
    return process.env.REDIS_URL ? this.redisStore : this.memoryStore
  }

  private getClientIdentifier(req: NextRequest): string {
    // Priority order for client identification
    const ip = req.ip || 
               req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') ||
               'unknown'
    
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const authorization = req.headers.get('authorization')
    
    // If authenticated, use user token hash
    if (authorization) {
      const tokenHash = this.hashString(authorization)
      return `auth:${tokenHash}`
    }
    
    // For anonymous users, combine IP and User-Agent
    const fingerprint = this.hashString(`${ip}:${userAgent}`)
    return `anon:${fingerprint}`
  }

  private hashString(str: string): string {
    // Simple hash function (use crypto.createHash in production)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  private isWhitelisted(req: NextRequest, whitelist?: string[]): boolean {
    if (!whitelist || whitelist.length === 0) return false
    
    const ip = req.ip || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    return ip ? whitelist.includes(ip) : false
  }

  async checkLimit(
    req: NextRequest,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    // Check whitelist
    if (this.isWhitelisted(req, config.whitelist)) {
      return {
        isAllowed: true,
        remainingRequests: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        totalRequests: 0
      }
    }

    // Generate key
    const key = config.keyGenerator ? config.keyGenerator(req) : this.getClientIdentifier(req)
    const fullKey = `${req.url}:${key}`

    try {
      const store = this.getStore()
      const result = await store.increment(fullKey, config.windowMs)
      
      const isAllowed = result.count <= config.maxRequests
      const remainingRequests = Math.max(0, config.maxRequests - result.count)

      // Log rate limit events
      if (!isAllowed) {
        productionLogger.warn('Rate limit exceeded', {
          key: fullKey,
          count: result.count,
          maxRequests: config.maxRequests,
          ip: req.ip || req.headers.get('x-forwarded-for'),
          userAgent: req.headers.get('user-agent'),
          url: req.url,
          method: req.method
        }, req)

        // Call custom handler if provided
        if (config.onLimitReached) {
          config.onLimitReached(req)
        }
      }

      return {
        isAllowed,
        remainingRequests,
        resetTime: result.resetTime,
        totalRequests: result.count
      }
    } catch (error) {
      productionLogger.error('Rate limiter error', error as Error, {
        key: fullKey,
        url: req.url
      }, req)

      // Fail open in case of errors
      return {
        isAllowed: true,
        remainingRequests: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        totalRequests: 0
      }
    }
  }

  createMiddleware(config: RateLimitConfig) {
    return async (req: NextRequest): Promise<NextResponse | null> => {
      const result = await this.checkLimit(req, config)

      if (!result.isAllowed) {
        const resetTimeSeconds = Math.ceil((result.resetTime - Date.now()) / 1000)
        
        return new NextResponse(
          JSON.stringify({
            error: config.message || 'Too many requests',
            retryAfter: resetTimeSeconds
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': result.remainingRequests.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': resetTimeSeconds.toString(),
            }
          }
        )
      }

      return null // Allow request to proceed
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  // General API rate limiting
  api: new ProductionRateLimiter(),
  
  // Authentication endpoints
  auth: new ProductionRateLimiter(),
  
  // Search endpoints  
  search: new ProductionRateLimiter(),
  
  // File upload endpoints
  upload: new ProductionRateLimiter(),
  
  // Contact/support endpoints
  contact: new ProductionRateLimiter(),
}

// Pre-configured middleware
export const rateLimitMiddleware = {
  api: rateLimiters.api.createMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many API requests, please try again later'
  }),

  auth: rateLimiters.auth.createMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    skipSuccessfulRequests: true,
    message: 'Too many authentication attempts, please try again later'
  }),

  search: rateLimiters.search.createMiddleware({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'Too many search requests, please slow down'
  }),

  upload: rateLimiters.upload.createMiddleware({
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 10,
    message: 'Too many upload requests, please try again later'
  }),

  contact: rateLimiters.contact.createMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    skipSuccessfulRequests: true,
    message: 'Too many contact form submissions, please try again later'
  }),
}

// Export main class and utilities
export { ProductionRateLimiter, type RateLimitConfig, type RateLimitResult }