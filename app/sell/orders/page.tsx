"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'

export interface ApiOrderItem { productId: string; quantity: number; price: number }
export interface ApiOrderBuyer { id?: string; name?: string | null }
export interface ApiOrder {
  id: string
  orderNumber: string
  buyer?: ApiOrderBuyer | null
  items: ApiOrderItem[]
  totalAmount: number
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  createdAt: string | Date
}

export default function SellerOrdersPage() {
  const [active, setActive] = useState<'all' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'>('all')
  const [orders, setOrders] = useState<ApiOrder[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/orders?role=seller', { cache: 'no-store' })
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(text || `Failed to load (status ${res.status})`)
        }
        const data = await res.json()
        setOrders(Array.isArray(data) ? data as ApiOrder[] : [])
      } catch (e) {
        console.error(e)
        setOrders([])
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => (
    active === 'all' ? orders : orders.filter((o: ApiOrder) => o.status === active)
  ), [orders, active])

  const totalByStatus = (status: typeof active) => (
    (status === 'all' ? orders : orders.filter((o: ApiOrder) => o.status === status)).length
  )

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage orders on your listings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline"><Link href="/sell/orders/export">Export</Link></Button>
        </div>
      </div>

      <Tabs value={active} onValueChange={(v) => setActive(v as typeof active)}>
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="all">All <Badge className="ml-2" variant="secondary">{totalByStatus('all')}</Badge></TabsTrigger>
          <TabsTrigger value="processing">Processing <Badge className="ml-2" variant="secondary">{totalByStatus('processing')}</Badge></TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed <Badge className="ml-2" variant="secondary">{totalByStatus('confirmed')}</Badge></TabsTrigger>
          <TabsTrigger value="shipped">Shipped <Badge className="ml-2" variant="secondary">{totalByStatus('shipped')}</Badge></TabsTrigger>
          <TabsTrigger value="delivered">Delivered <Badge className="ml-2" variant="secondary">{totalByStatus('delivered')}</Badge></TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled <Badge className="ml-2" variant="secondary">{totalByStatus('cancelled')}</Badge></TabsTrigger>
          <TabsTrigger value="returned">Returned <Badge className="ml-2" variant="secondary">{totalByStatus('returned')}</Badge></TabsTrigger>
        </TabsList>

        <TabsContent value={active} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3">Order</TableHead>
                    <TableHead className="px-4 py-3">Buyer</TableHead>
                    <TableHead className="px-4 py-3">Items</TableHead>
                    <TableHead className="px-4 py-3">Total</TableHead>
                    <TableHead className="px-4 py-3">Status</TableHead>
                    <TableHead className="px-4 py-3">Date</TableHead>
                    <TableHead className="px-4 py-3" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o: ApiOrder) => (
                    <TableRow key={o.id}>
                      <TableCell className="px-4 py-3 font-medium">{o.orderNumber}</TableCell>
                      <TableCell className="px-4 py-3">{o.buyer?.name || '—'}</TableCell>
                      <TableCell className="px-4 py-3">{o.items?.length || 0}</TableCell>
                      <TableCell className="px-4 py-3">₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="px-4 py-3"><Badge className="capitalize">{o.status}</Badge></TableCell>
                      <TableCell className="px-4 py-3">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/tracking/${o.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


