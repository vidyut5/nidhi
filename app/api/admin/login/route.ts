import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { addAdminSession } from '@/lib/admin-session'
import { loginRateLimiter } from '@/lib/rate-limiter'
import { verifyPassword } from '@/lib/auth-utils'
import { logger } from '@/lib/logger'

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function signJwtHS256(payload: Record<string, unknown>, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encHeader = base64url(JSON.stringify(header))
  const encPayload = base64url(JSON.stringify(payload))
  const data = `${encHeader}.${encPayload}`
  const signature = crypto.createHmac('sha256', secret).update(data).digest()
  const encSig = base64url(signature)
  return `${data}.${encSig}`
}

function timingSafeEqualStrings(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) {
    return false
  }
  return crypto.timingSafeEqual(aBuf, bBuf)
}

export async function POST(req: Request) {
  try {
    // Rate limiting by IP address
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    
    try {
      if (!loginRateLimiter.isAllowed(ip)) {
        return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 })
      }
    } catch (rateLimitError) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 })
    }

    const username = (body as any)?.username
    const password = (body as any)?.password

    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }
    const u = username.trim()
    const p = password.trim()
    if (!u || !p) {
      return NextResponse.json({ error: 'Username and password cannot be empty' }, { status: 400 })
    }

    const envUsername = process.env.ADMIN_USERNAME
    // Support base64-encoded hash to avoid $ expansion issues in env files
    let envPasswordHash = process.env.ADMIN_PASSWORD_HASH
    const envPasswordHashB64 = process.env.ADMIN_PASSWORD_HASH_B64
    if ((!envPasswordHash || envPasswordHash.length < 40) && envPasswordHashB64) {
      try {
        envPasswordHash = Buffer.from(envPasswordHashB64, 'base64').toString('utf8')
      } catch {}
    }
    // Strip wrapping quotes if present
    if (envPasswordHash && (envPasswordHash.startsWith("'") && envPasswordHash.endsWith("'"))) {
      envPasswordHash = envPasswordHash.slice(1, -1)
    }
    const sessionSecret = process.env.ADMIN_SESSION_SECRET
    if (!envUsername || !envPasswordHash || !sessionSecret) {
      logger.error('Missing admin env config', undefined, {
        required: ['ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH', 'ADMIN_SESSION_SECRET'],
        present: {
          username: !!envUsername,
          passwordHash: !!envPasswordHash,
          sessionSecret: !!sessionSecret
        }
      })
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const envUserTrim = envUsername.trim()
    const usernameOk =
      timingSafeEqualStrings(u, envUserTrim) ||
      u === envUserTrim ||
      u.toLowerCase() === envUserTrim.toLowerCase()
    const passwordOk = await verifyPassword(p, envPasswordHash)
    
    if (!usernameOk || !passwordOk) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    const now = Math.floor(Date.now() / 1000)
    const expiresInSeconds = 60 * 60 * 8 // 8 hours
    const jti = crypto.randomUUID()
    const jwt = signJwtHS256({ sub: 'admin', iat: now, exp: now + expiresInSeconds, jti }, sessionSecret)

    const { jti: sessionJti, csrfToken } = addAdminSession(jti, expiresInSeconds)

    const res = NextResponse.json({ ok: true, csrfToken })
    const cookieParts = [
      `admin_session=${jwt}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      `Max-Age=${expiresInSeconds}`,
    ]
    if (process.env.NODE_ENV === 'production') cookieParts.push('Secure')
    res.headers.append('Set-Cookie', cookieParts.join('; '))
    return res
  } catch (err) {
    logger.error('Admin login error', err instanceof Error ? err : undefined, { error: err })
    return new NextResponse('Bad Request', { status: 400 })
  }
}


