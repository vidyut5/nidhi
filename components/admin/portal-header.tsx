"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { useState } from 'react'

export function AdminPortalHeader() {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch('/admin/logout', { method: 'POST' })
      try {
        localStorage.removeItem('admin_auth')
      } catch (err) {
        console.error('Failed to clear localStorage admin_auth', err)
      }
      try {
        const attrs = [
          'admin_session=;',
          'Max-Age=0',
          'path=/',
          'SameSite=Strict',
        ]
        if (location.protocol === 'https:') attrs.push('Secure')
        document.cookie = attrs.join('; ')
        // Fallback with domain attribute
        const domainCookie = [
          'admin_session=;',
          'Max-Age=0',
          'path=/',
          `domain=${location.hostname}`,
          'SameSite=Strict',
        ]
        if (location.protocol === 'https:') domainCookie.push('Secure')
        document.cookie = domainCookie.join('; ')
      } catch (err) {
        console.error('Failed to clear admin_session cookie', err)
      }
    } catch (err) {
      console.error('Logout request failed', err)
    } finally {
      router.replace('/admin/login')
      setLoggingOut(false)
    }
  }
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wide h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="font-semibold">Vidyut Super Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to Store</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut}>{loggingOut ? 'Logging out…' : 'Logout'}</Button>
        </div>
      </div>
    </header>
  )
}


