type RateLimitRecord = {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitRecord> = new Map()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.limits.get(identifier)

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (record.count >= this.maxRequests) {
      return false
    }

    record.count++
    return true
  }

  getRemaining(identifier: string): { remaining: number; resetTime: number } {
    const record = this.limits.get(identifier)
    if (!record) {
      return { remaining: this.maxRequests, resetTime: Date.now() + this.windowMs }
    }
    return { remaining: Math.max(0, this.maxRequests - record.count), resetTime: record.resetTime }
  }

  // Clean up expired records
  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.limits.entries()) {
      if (now > record.resetTime) {
        this.limits.delete(key)
      }
    }
  }
}

// Create rate limiters for different endpoints
export const loginRateLimiter = new RateLimiter(15 * 60 * 1000, 5) // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(60 * 1000, 100) // 100 requests per minute

// Clean up expired records every 5 minutes
setInterval(() => {
  loginRateLimiter.cleanup()
  apiRateLimiter.cleanup()
}, 5 * 60 * 1000)

export function createRateLimitMiddleware(limiter: RateLimiter) {
  return function rateLimitMiddleware(identifier: string) {
    if (!limiter.isAllowed(identifier)) {
      const { remaining, resetTime } = limiter.getRemaining(identifier)
      throw new Error(`Rate limit exceeded. Try again after ${new Date(resetTime).toISOString()}`)
    }
  }
}



