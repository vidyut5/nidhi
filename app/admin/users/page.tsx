import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { promoteUser, disableUser } from './actions'

export default async function AdminUsersPage() {
  let users: { id: string; email: string; name: string | null; role: string; createdAt: Date }[] = []
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    })
  } catch (err) {
    console.error('Failed to load admin users', err)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <div className="grid gap-4">
        {users.map(u => (
          <Card key={u.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{u.name ?? u.email}</div>
                <div className="text-sm text-muted-foreground">{u.email}</div>
                <div className="text-xs text-muted-foreground">Role: {u.role}</div>
              </div>
              <form action={async () => { 'use server'; await promoteUser(u.id) }} className="inline">
                <Button variant="outline" size="sm" formAction={async () => { 'use server'; await promoteUser(u.id) }}>Promote</Button>
              </form>
              <form action={async () => { 'use server'; await disableUser(u.id) }} className="inline ml-2">
                <Button variant="destructive" size="sm" formAction={async () => { 'use server'; await disableUser(u.id) }}>Disable</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


