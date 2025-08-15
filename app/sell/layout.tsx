"use client"

import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Package, Users, ShoppingCart } from 'lucide-react'

export default function SellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Render standalone page (no tabs) for seller onboarding
  if (pathname === '/sell/signup') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-2xl py-8">
          {children}
        </div>
      </div>
    )
  }

  const tabs = [
    { value: '/sell/dashboard', label: 'Dashboard', icon: BarChart3 },
    { value: '/sell/products', label: 'Products', icon: Package },
    { value: '/sell/orders', label: 'Orders', icon: ShoppingCart },
    { value: '/sell/leads', label: 'B2B Leads', icon: Users },
  ]

  const current = tabs.find(t => pathname?.startsWith(t.value))?.value || '/sell/dashboard'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-wide py-6">
        <Tabs value={current} onValueChange={(v) => router.push(v)}>
          <div className="overflow-x-auto">
            <TabsList>
              {tabs.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value}>
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value={current} className="mt-6 p-0">
            {children}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


