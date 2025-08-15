type SessionRecord = {
  expiresAtMs: number
}

// In-memory session store (per server instance). For production, replace with DB/Redis.
const sessions = new Map<string, SessionRecord>()

export function addAdminSession(jti: string, ttlSeconds: number) {
  const expiresAtMs = Date.now() + ttlSeconds * 1000
  sessions.set(jti, { expiresAtMs })
}

export function removeAdminSession(jti: string) {
  sessions.delete(jti)
}

export function isAdminSessionActive(jti: string): boolean {
  const rec = sessions.get(jti)
  if (!rec) return false
  if (Date.now() >= rec.expiresAtMs) {
    sessions.delete(jti)
    return false
  }
  return true
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


