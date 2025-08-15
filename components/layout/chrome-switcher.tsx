"use client"

import { usePathname } from 'next/navigation'
import { AppChrome } from '@/components/layout/app-chrome'

export function ChromeSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  if (isAdmin) {
    return <>{children}</>
  }
  return <AppChrome>{children}</AppChrome>
}


