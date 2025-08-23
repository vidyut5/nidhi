import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Admin route protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_session')?.value
    
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    
    // Verify admin session using the session store
    const { isAdminSessionActive } = await import('./lib/admin-session')
    const isValid = isAdminSessionActive(token)
    
    if (!isValid) {
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


