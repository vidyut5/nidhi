"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Users, Package, Boxes, Settings, BookOpen } from 'lucide-react'

export function AdminPortalSidebar() {
  const pathname = usePathname()
  const nav = [
    { href: '/admin', label: 'Overview', icon: LayoutGrid },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/orders', label: 'Orders', icon: Package },
    { href: '/admin/products', label: 'Products', icon: Boxes },
    { href: '/admin/products/approvals', label: 'Product Approvals', icon: Boxes },
    { href: '/admin/categories', label: 'Categories', icon: Boxes },
    { href: '/admin/sellers', label: 'Sellers', icon: Users },
    { href: '/admin/reviews', label: 'Reviews', icon: Users },
    { href: '/admin/guidelines', label: 'Guidelines', icon: BookOpen },
    { href: '/admin/seller-leads', label: 'Seller Leads', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]
  return (
    <aside className="hidden lg:block">
      <nav className="space-y-1">
        {nav.map(item => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start')}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  )
}


