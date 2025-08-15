'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, Search, User, Store, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const pathname = usePathname()
  // simplified nav; no badges

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
    },
    {
      name: 'Sell',
      href: '/sell',
      icon: Store,
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: ShoppingBag,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 lg:hidden shadow-lg" role="navigation" aria-label="Mobile primary navigation">
      <div className="grid grid-cols-5 h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-1 py-3 rounded-xl transition-all duration-200 mx-1 my-2 relative",
                isActive 
                  ? "text-blue-600 bg-blue-50 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110")}/>
              <span className={cn(
                "text-[11px] font-medium leading-none",
                isActive && "font-semibold"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-4 bg-white/95"></div>
    </div>
  )
}