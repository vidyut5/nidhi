import crypto from 'crypto'
import { logger } from './logger'

type SessionRecord = {
  expiresAtMs: number
  csrfToken: string
  lastActivity: number
}

// In-memory session store (for production, replace with Redis)
const sessions = new Map<string, SessionRecord>()

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [jti, session] of sessions.entries()) {
    if (now >= session.expiresAtMs) {
      sessions.delete(jti)
    }
  }
}, 5 * 60 * 1000)

export function addAdminSession(jti: string, ttlSeconds: number): { jti: string; csrfToken: string } {
  const expiresAtMs = Date.now() + ttlSeconds * 1000
  const csrfToken = crypto.randomBytes(32).toString('hex')
  const lastActivity = Date.now()
  
  sessions.set(jti, { expiresAtMs, csrfToken, lastActivity })
  
  logger.info('Admin session created', { jti, expiresAt: new Date(expiresAtMs), ttlSeconds })
  
  return { jti, csrfToken }
}

export function removeAdminSession(jti: string): void {
  sessions.delete(jti)
  logger.info('Admin session removed', { jti })
}

export function isAdminSessionActive(jti: string): boolean {
  const rec = sessions.get(jti)
  if (!rec) {
    logger.warn('Admin session validation failed - session not found', { jti })
    return false
  }
  
  const now = Date.now()
  if (now >= rec.expiresAtMs) {
    sessions.delete(jti)
    logger.warn('Admin session expired', { jti, expiresAt: new Date(rec.expiresAtMs) })
    return false
  }
  
  // Update last activity
  rec.lastActivity = now
  return true
}

export function validateCSRFToken(jti: string, csrfToken: string): boolean {
  const rec = sessions.get(jti)
  if (!rec) return false
  
  return crypto.timingSafeEqual(
    Buffer.from(rec.csrfToken, 'hex'),
    Buffer.from(csrfToken, 'hex')
  )
}

export function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payloadB64 = parts[1]
    const json = Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

// Get session info for debugging (remove in production)
export function getSessionInfo(jti: string) {
  return sessions.get(jti)
}


