import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { approveSeller, rejectSeller } from './actions'

export default async function AdminSellersPage() {
  const pending = await prisma.sellerProfile.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Seller Approvals</h1>
      <div className="grid gap-3">
        {pending.map(s => (
          <Card key={s.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{s.user.name ?? s.user.email}</div>
                <div className="text-sm text-muted-foreground">GST: {s.gstNumber || '—'}</div>
                <div className="text-xs text-muted-foreground">Business: {s.businessName || '—'} · Type: {s.businessType || '—'}</div>
              </div>
              <div className="space-x-2">
                <form action={async () => { 'use server'; await approveSeller(s.id) }} className="inline">
                  <Button size="sm" variant="success">Approve</Button>
                </form>
                <form action={async () => { 'use server'; await rejectSeller(s.id) }} className="inline">
                  <Button size="sm" variant="destructive">Reject</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
        {pending.length === 0 && <div className="text-sm text-muted-foreground">No pending sellers.</div>}
      </div>
    </div>
  )
}


