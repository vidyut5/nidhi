import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { isAdminSessionActive } from '@/lib/admin-session'

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function decodeJwt<T = any>(token: string): { header: any; payload: T; signature: string } | null {
  try {
    const [h, p, s] = token.split('.')
    if (!h || !p || !s) return null
    const header = JSON.parse(Buffer.from(h.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'))
    const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')) as T
    return { header, payload, signature: s }
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/)
  const token = match ? decodeURIComponent(match[1]) : ''
  const secret = process.env.ADMIN_SESSION_SECRET || ''
  if (!token || !secret) return NextResponse.json({ ok: false }, { status: 401 })

  const parts = token.split('.')
  if (parts.length !== 3) return NextResponse.json({ ok: false }, { status: 401 })
  const [h, p, s] = parts
  const data = `${h}.${p}`
  const expected = crypto.createHmac('sha256', secret).update(data).digest()
  const expectedB64 = expected.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const sigOk = crypto.timingSafeEqual(Buffer.from(expectedB64), Buffer.from(s))
  if (!sigOk) return NextResponse.json({ ok: false }, { status: 401 })

  const decoded = decodeJwt<{ exp?: number; jti?: string }>(token)
  const now = Math.floor(Date.now() / 1000)
  if (!decoded || (typeof decoded.payload.exp === 'number' && now >= decoded.payload.exp)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const jti = decoded.payload.jti
  if (!jti || !isAdminSessionActive(jti)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}


