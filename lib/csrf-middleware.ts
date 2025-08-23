import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'
import { validateCSRFToken } from './admin-session'

export interface CSRFConfig {
  enabled: boolean
  headerName: string
  cookieName: string
  tokenLength: number
  maxAge: number
}

const defaultConfig: CSRFConfig = {
  enabled: true,
  headerName: 'x-csrf-token',
  cookieName: 'csrf_token',
  tokenLength: 32,
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}

export function withCSRFProtection(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: Partial<CSRFConfig> = {}
) {
  const finalConfig = { ...defaultConfig, ...config }
  
  return async (req: NextRequest) => {
    // Skip CSRF check for GET requests
    if (req.method === 'GET' || req.method === 'HEAD') {
      return handler(req)
    }

    // Skip CSRF check if disabled
    if (!finalConfig.enabled) {
      return handler(req)
    }

    try {
      // Get CSRF token from header
      const csrfToken = req.headers.get(finalConfig.headerName)
      if (!csrfToken) {
        logger.warn('CSRF token missing', { 
          method: req.method, 
          url: req.url,
          headers: Object.fromEntries(req.headers.entries())
        })
        return NextResponse.json(
          { error: 'CSRF token missing' }, 
          { status: 403 }
        )
      }

      // Get session token from cookie
      const sessionToken = req.cookies.get('admin_session')?.value
      if (!sessionToken) {
        logger.warn('Session token missing for CSRF validation', { 
          method: req.method, 
          url: req.url 
        })
        return NextResponse.json(
          { error: 'Session token missing' }, 
          { status: 401 }
        )
      }

      // Validate CSRF token
      const isValid = validateCSRFToken(sessionToken, csrfToken)
      if (!isValid) {
        logger.warn('CSRF token validation failed', { 
          method: req.method, 
          url: req.url,
          sessionToken: sessionToken.substring(0, 10) + '...',
          csrfToken: csrfToken.substring(0, 10) + '...'
        })
        return NextResponse.json(
          { error: 'Invalid CSRF token' }, 
          { status: 403 }
        )
      }

      // CSRF validation passed, proceed with handler
      logger.debug('CSRF validation passed', { 
        method: req.method, 
        url: req.url 
      })
      
      return handler(req)

    } catch (error) {
      logger.error('CSRF middleware error', error instanceof Error ? error : undefined, {
        method: req.method,
        url: req.url
      })
      
      return NextResponse.json(
        { error: 'CSRF validation error' }, 
        { status: 500 }
      )
    }
  }
}

// Helper function to generate CSRF token for forms
export async function generateCSRFToken(): Promise<string> {
  const { randomBytes } = await import('crypto')
  return randomBytes(32).toString('hex')
}

// Helper function to validate CSRF token in client-side forms
export function validateClientCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false
  return token === storedToken
}

// CSRF protection decorator for API routes
export function csrfProtected(config?: Partial<CSRFConfig>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = withCSRFProtection(originalMethod, config)
    
    return descriptor
  }
}


