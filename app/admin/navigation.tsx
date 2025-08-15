"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AdminNav() {
  const pathname = usePathname()
  const links = [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/products', label: 'Products' },
  ]

  return (
    <nav className="flex items-center gap-6 text-sm">
      {links.map(l => (
        <Link key={l.href} href={l.href} className={cn(
          'transition-colors hover:text-foreground/80',
          pathname === l.href ? 'text-foreground' : 'text-foreground/60'
        )}>{l.label}</Link>
      ))}
    </nav>
  )
}


