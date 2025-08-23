import crypto from 'crypto'

export interface CSRFToken {
  token: string
  expiresAt: number
}

class CSRFProtection {
  private tokens: Map<string, CSRFToken> = new Map()
  private readonly tokenExpiry = 15 * 60 * 1000 // 15 minutes

  generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + this.tokenExpiry
    
    this.tokens.set(sessionId, { token, expiresAt })
    
    // Clean up expired tokens
    this.cleanup()
    
    return token
  }

  validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId)
    if (!stored) return false
    
    if (Date.now() > stored.expiresAt) {
      this.tokens.delete(sessionId)
      return false
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(stored.token, 'hex'),
      Buffer.from(token, 'hex')
    )
  }

  invalidateToken(sessionId: string): void {
    this.tokens.delete(sessionId)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [sessionId, token] of this.tokens.entries()) {
      if (now > token.expiresAt) {
        this.tokens.delete(sessionId)
      }
    }
  }
}

export const csrfProtection = new CSRFProtection()

// Middleware function to validate CSRF tokens
export function validateCSRFMiddleware(sessionId: string, token: string): boolean {
  return csrfProtection.validateToken(sessionId, token)
}

// Generate CSRF token for a session
export function generateCSRFToken(sessionId: string): string {
  return csrfProtection.generateToken(sessionId)
}



