import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

async function verifyJwtHS256(token: string, secret: string): Promise<boolean> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.')
    if (!headerB64 || !payloadB64 || !signatureB64) return false
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const data = `${headerB64}.${payloadB64}`
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    const ok = await crypto.subtle.verify('HMAC', key, signature, enc.encode(data))
    if (!ok) return false
    // exp check
    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(payloadJson) as { exp?: number }
    if (typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000)
      if (now >= payload.exp) return false
    }
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_session')?.value
    const secret = process.env.ADMIN_SESSION_SECRET || ''
    let valid = false
    if (token && secret) {
      valid = await verifyJwtHS256(token, secret)
    }
    if (!valid) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }
  // Do not force sign-in for seller center in middleware to support dual-role UX.
  // Pages/actions under /sell should perform their own session/role checks and show friendly prompts.
  if (pathname.startsWith('/sell')) {
    return NextResponse.next()
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/sell/:path*'],
}


