/**
 * CSRF Protection Implementation
 * Double-submit cookie pattern with token validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { productionLogger } from './logger-production'

interface CSRFConfig {
  cookieName: string
  headerName: string
  tokenLength: number
  sameSite: 'strict' | 'lax' | 'none'
  secure: boolean
  httpOnly: boolean
  maxAge: number
  ignoreMethods: string[]
  trustedOrigins: string[]
}

interface CSRFResult {
  isValid: boolean
  token?: string
  error?: string
}

class CSRFProtection {
  private config: CSRFConfig

  constructor(config?: Partial<CSRFConfig>) {
    this.config = {
      cookieName: '_csrf_token',
      headerName: 'x-csrf-token',
      tokenLength: 32,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Must be false for client-side access
      maxAge: 60 * 60 * 24, // 24 hours
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
      trustedOrigins: [
        process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'https://localhost:3000'
      ],
      ...config
    }
  }

  private generateToken(): string {
    // Generate cryptographically secure random token
    if (typeof window !== 'undefined') {
      // Browser environment
      const array = new Uint8Array(this.config.tokenLength)
      crypto.getRandomValues(array)
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    } else {
      // Node.js environment
      const crypto = require('crypto')
      return crypto.randomBytes(this.config.tokenLength).toString('hex')
    }
  }

  private isMethodIgnored(method: string): boolean {
    return this.config.ignoreMethods.includes(method.toUpperCase())
  }

  private isOriginTrusted(origin: string | null): boolean {
    if (!origin) return false
    return this.config.trustedOrigins.includes(origin)
  }

  private extractTokenFromCookie(req: NextRequest): string | null {
    const cookieHeader = req.headers.get('cookie')
    if (!cookieHeader) return null

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) {
        acc[key] = decodeURIComponent(value)
      }
      return acc
    }, {} as Record<string, string>)

    return cookies[this.config.cookieName] || null
  }

  private extractTokenFromHeader(req: NextRequest): string | null {
    return req.headers.get(this.config.headerName)
  }

  private extractTokenFromBody(req: NextRequest, body: any): string | null {
    if (!body || typeof body !== 'object') return null
    return body._csrf_token || body.csrfToken || null
  }

  private createCookieString(token: string): string {
    const cookieOptions = [
      `${this.config.cookieName}=${encodeURIComponent(token)}`,
      `Max-Age=${this.config.maxAge}`,
      `SameSite=${this.config.sameSite}`,
      'Path=/'
    ]

    if (this.config.secure) {
      cookieOptions.push('Secure')
    }

    if (this.config.httpOnly) {
      cookieOptions.push('HttpOnly')
    }

    return cookieOptions.join('; ')
  }

  async validateRequest(req: NextRequest, body?: any): Promise<CSRFResult> {
    // Skip validation for ignored methods
    if (this.isMethodIgnored(req.method)) {
      return { isValid: true }
    }

    // Check origin for state-changing requests
    const origin = req.headers.get('origin')
    const referer = req.headers.get('referer')
    
    // Verify origin or referer
    const requestOrigin = origin || (referer ? new URL(referer).origin : null)
    if (!this.isOriginTrusted(requestOrigin)) {
      productionLogger.warn('CSRF: Untrusted origin', {
        origin: requestOrigin,
        trustedOrigins: this.config.trustedOrigins,
        method: req.method,
        url: req.url
      }, req)

      return {
        isValid: false,
        error: 'Invalid origin'
      }
    }

    // Extract tokens
    const cookieToken = this.extractTokenFromCookie(req)
    const headerToken = this.extractTokenFromHeader(req)
    const bodyToken = this.extractTokenFromBody(req, body)

    // Check if cookie token exists
    if (!cookieToken) {
      productionLogger.warn('CSRF: Missing cookie token', {
        method: req.method,
        url: req.url
      }, req)

      return {
        isValid: false,
        error: 'Missing CSRF cookie'
      }
    }

    // Check if request token exists (from header or body)
    const requestToken = headerToken || bodyToken
    if (!requestToken) {
      productionLogger.warn('CSRF: Missing request token', {
        method: req.method,
        url: req.url,
        hasHeaderToken: !!headerToken,
        hasBodyToken: !!bodyToken
      }, req)

      return {
        isValid: false,
        error: 'Missing CSRF token in request'
      }
    }

    // Validate tokens match (constant-time comparison)
    if (!this.secureCompare(cookieToken, requestToken)) {
      productionLogger.warn('CSRF: Token mismatch', {
        method: req.method,
        url: req.url,
        cookieTokenLength: cookieToken.length,
        requestTokenLength: requestToken.length
      }, req)

      return {
        isValid: false,
        error: 'CSRF token mismatch'
      }
    }

    productionLogger.debug('CSRF: Validation successful', {
      method: req.method,
      url: req.url
    }, req)

    return { isValid: true }
  }

  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    return result === 0
  }

  generateTokenResponse(): { token: string; cookie: string } {
    const token = this.generateToken()
    const cookie = this.createCookieString(token)

    return { token, cookie }
  }

  createMiddleware() {
    return async (req: NextRequest): Promise<NextResponse | null> => {
      // Skip validation for ignored methods
      if (this.isMethodIgnored(req.method)) {
        return null
      }

      // For non-GET requests, validate CSRF token
      let body: any = null
      if (req.method !== 'GET' && req.headers.get('content-type')?.includes('application/json')) {
        try {
          body = await req.json()
        } catch (error) {
          // Unable to parse JSON body
          productionLogger.warn('CSRF: Unable to parse request body', {
            method: req.method,
            url: req.url,
            contentType: req.headers.get('content-type')
          }, req)
        }
      }

      const result = await this.validateRequest(req, body)

      if (!result.isValid) {
        return new NextResponse(
          JSON.stringify({
            error: 'CSRF validation failed',
            message: result.error || 'Invalid CSRF token'
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      }

      return null // Allow request to proceed
    }
  }

  // Utility method for API routes
  async validateApiRequest(req: NextRequest): Promise<boolean> {
    let body: any = null
    
    // Clone request to read body without consuming it
    const clonedReq = req.clone()
    if (req.method !== 'GET' && req.headers.get('content-type')?.includes('application/json')) {
      try {
        body = await clonedReq.json()
      } catch (error) {
        // Ignore JSON parsing errors
      }
    }

    const result = await this.validateRequest(req, body)
    return result.isValid
  }

  // Method to get/set CSRF token for forms
  getTokenForResponse(response: NextResponse): string {
    const { token, cookie } = this.generateTokenResponse()
    
    // Set cookie in response
    response.headers.set('Set-Cookie', cookie)
    
    return token
  }
}

// Export singleton instance
export const csrfProtection = new CSRFProtection()

// Export middleware
export const csrfMiddleware = csrfProtection.createMiddleware()

// Helper for API routes
export async function validateCSRF(req: NextRequest): Promise<boolean> {
  return await csrfProtection.validateApiRequest(req)
}

// Helper for generating tokens in API responses
export function generateCSRFToken(): string {
  return csrfProtection.generateTokenResponse().token
}

// Helper for setting CSRF token in response
export function setCSRFToken(response: NextResponse): string {
  return csrfProtection.getTokenForResponse(response)
}

export { CSRFProtection, type CSRFConfig, type CSRFResult }