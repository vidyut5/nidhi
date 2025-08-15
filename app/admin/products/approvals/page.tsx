import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { notifyProductDecision } from '@/lib/notify'

async function getPending() {
  const products = await prisma.product.findMany({
    where: { isActive: false },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, sku: true, price: true, seller: { select: { id: true, name: true, email: true } } }
  })
  return products
}

export default async function ProductApprovalsPage() {
  const items = await getPending()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Product Approvals</h1>
      <div className="grid gap-3">
        {items.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">SKU: {p.sku ?? '—'} · Seller: {p.seller.name ?? p.seller.email}</div>
              </div>
              <div className="space-x-2">
                <form action={async () => { 'use server'; const updated = await prisma.product.update({ where: { id: p.id }, data: { isActive: true }, include: { seller: true } }); await notifyProductDecision(updated.seller.email, updated.name, true) }} className="inline"><Button size="sm">Approve</Button></form>
                <form action={async () => { 'use server'; const updated = await prisma.product.update({ where: { id: p.id }, data: { isActive: false }, include: { seller: true } }); await notifyProductDecision(updated.seller.email, updated.name, false) }} className="inline"><Button size="sm" variant="destructive">Reject</Button></form>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <div className="text-sm text-muted-foreground">No products awaiting approval.</div>}
      </div>
    </div>
  )
}


