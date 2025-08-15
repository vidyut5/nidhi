import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { approveReview, rejectReview } from './actions'

export default async function AdminReviewsPage() {
  const pending = await prisma.review.findMany({
    where: { isVerified: false },
    include: { user: { select: { id: true, email: true, name: true } }, product: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Review Moderation</h1>
      <div className="grid gap-3">
        {pending.map(r => (
          <Card key={r.id}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{r.product.name}</div>
                <div className="text-sm">Rating: {r.rating}/5</div>
                {r.title && <div className="text-sm font-medium">{r.title}</div>}
                {r.comment && <div className="text-sm text-muted-foreground max-w-2xl whitespace-pre-wrap">{r.comment}</div>}
                <div className="text-xs text-muted-foreground mt-1">By {r.user.name ?? r.user.email}</div>
              </div>
              <div className="space-x-2 shrink-0">
                <form action={async () => { 'use server'; await approveReview(r.id) }} className="inline">
                  <Button size="sm" variant="success">Approve</Button>
                </form>
                <form action={async () => { 'use server'; await rejectReview(r.id) }} className="inline">
                  <Button size="sm" variant="destructive">Reject</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
        {pending.length === 0 && <div className="text-sm text-muted-foreground">No reviews pending.</div>}
      </div>
    </div>
  )
}


