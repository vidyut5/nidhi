"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { SupportWidget } from "@/components/support/support-widget"

const Navbar = dynamic(() => import("@/components/layout/navbar").then(m => m.Navbar), { ssr: false })
const NavbarCompact = dynamic(() => import("@/components/layout/navbar-compact").then(m => m.NavbarCompact), { ssr: false })
const Footer = dynamic(() => import("@/components/layout/footer").then(m => m.Footer), { ssr: false })
const MobileNav = dynamic(() => import("@/components/layout/mobile-nav").then(m => m.MobileNav), { ssr: false })
const Sidebar = dynamic(() => import("@/components/layout/sidebar").then(m => m.Sidebar), { ssr: false })

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role
  const isOrdersContext = pathname?.startsWith('/orders')
  const supportDefaultTarget = isOrdersContext ? 'seller' : 'vidyut'
  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header with safe area + sticky behavior */}
        <header className="sticky top-0 z-40 bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur pt-[env(safe-area-inset-top)]">
          <div className="hidden lg:block">
            <NavbarCompact />
          </div>
          <div className="lg:hidden">
            <Navbar />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-24 lg:pb-0 flex flex-col no-h-scroll">
          {children}
        </main>

        {/* Footer - Hidden on mobile where bottom nav is used */}
        <div className="hidden lg:block mt-auto">
          <Footer />
        </div>

        {/* Mobile Bottom Navigation - Hidden on desktop */}
        <div className="pb-[env(safe-area-inset-bottom)] lg:hidden mt-auto">
          <MobileNav />
        </div>
      </div>

      {/* Global Support widget (hidden for SUPERADMIN) */}
      {role !== 'SUPERADMIN' && (
        <SupportWidget orderId={isOrdersContext ? pathname!.split('/').pop() || 'orders' : 'general'} defaultTarget={supportDefaultTarget as any} />
      )}
    </div>
  )
}



