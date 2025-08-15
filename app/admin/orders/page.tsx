import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'

export default async function AdminOrdersPage() {
  let orders: { id: string; orderNumber: string; status: string; totalAmount: number; createdAt: Date }[] = []
  try {
    orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, orderNumber: true, status: true, totalAmount: true, createdAt: true }
    })
  } catch (err) {
    console.error('Failed to load admin orders', err)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Recent Orders</h1>
      <div className="grid gap-4">
        {orders.length === 0 && (
          <div className="text-sm text-muted-foreground">No orders to display.</div>
        )}
        {orders.map(o => (
          <Card key={o.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{o.orderNumber}</div>
                <div className="text-sm text-muted-foreground">Status: {o.status}</div>
              </div>
              <div className="text-lg font-semibold">₹{o.totalAmount.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


