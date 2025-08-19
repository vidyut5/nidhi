'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function cx(...cls: Array<string | false | undefined>) {
  return cls.filter(Boolean).join(' ')
}

type Item = { href: string; label: string; icon: string }

export function MobileNav() {
  const pathname = usePathname()

  const items: Item[] = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/search', label: 'Search', icon: 'search' },
    { href: '/sell', label: 'Sell', icon: 'storefront' },
    { href: '/orders', label: 'Orders', icon: 'inventory_2' },
    { href: '/profile', label: 'Profile', icon: 'person' },
  ]

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className={cx(
        'fixed inset-x-0 bottom-0 z-50 border-t bg-white lg:hidden',
        'pb-[env(safe-area-inset-bottom)]'
      )}
    >
      <div className="mx-auto max-w-lg px-3 py-3">
        <div className="grid grid-cols-5 gap-1 rounded-2xl bg-white p-2 border shadow-sm">
          {items.map((it) => {
            const active = it.href === '/' ? pathname === '/' : pathname.startsWith(it.href)
            return (
              <Link key={it.href} href={it.href} aria-current={active ? 'page' : undefined} className="group">
                <div className={cx('relative flex h-10 items-center justify-center gap-2 rounded-full px-3 transition-colors')}>
                  {active && <span aria-hidden className="absolute inset-0 rounded-full bg-primary/15" />}
                  <span aria-hidden className={cx('material-symbols-rounded text-[22px] relative', active ? 'msr-filled text-primary' : 'text-muted-foreground')}>
                    {it.icon}
                  </span>
                  <span className={cx('relative text-[11px] font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>{it.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}