import { NextResponse } from 'next/server'
import { decodeJwtPayload, removeAdminSession } from '@/lib/admin-session'

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || ''
    const match = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/)
    const token = match ? decodeURIComponent(match[1]) : null
    if (token) {
      const payload = decodeJwtPayload<{ jti?: string }>(token)
      const jti = payload?.jti
      if (jti) removeAdminSession(jti)
    }
    const res = NextResponse.json({ ok: true })
    const cookieParts = [
      'admin_session=;',
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      'Max-Age=0',
    ]
    if (process.env.NODE_ENV === 'production') cookieParts.push('Secure')
    res.headers.append('Set-Cookie', cookieParts.join('; '))
    return res
  } catch (err) {
    return NextResponse.json({ ok: true })
  }
}


