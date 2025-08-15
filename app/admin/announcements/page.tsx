import { readAnnouncements } from '@/lib/announcements-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { saveAnnouncement, removeAnnouncement } from './actions'

// Move server action inline via form action to avoid extra page exports

export default async function AdminAnnouncementsPage() {
  const all = await readAnnouncements()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Announcements</h1>
      <form action={saveAnnouncement} className="grid gap-3 border rounded-md p-4">
        <label htmlFor="title" className="sr-only">Title</label>
        <input id="title" name="title" placeholder="Title" required maxLength={200} className="border rounded px-3 py-2" />
        <label htmlFor="body" className="sr-only">Message</label>
        <textarea id="body" name="body" placeholder="Message" required maxLength={5000} className="border rounded px-3 py-2 min-h-24" />
        <div className="grid grid-cols-2 gap-3">
          <select name="level" required className="border rounded px-3 py-2">
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
          </select>
          <select name="audience" required className="border rounded px-3 py-2">
            <option value="all">All users</option>
            <option value="buyers">Buyers</option>
            <option value="sellers">Sellers</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2" htmlFor="isActive"><input id="isActive" type="checkbox" name="isActive" /> Active</label>
          <div className="flex items-center gap-2">
            <label htmlFor="startsAt" className="text-sm">Start date and time</label>
            <input id="startsAt" name="startsAt" type="datetime-local" className="border rounded px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="endsAt" className="text-sm">End date and time</label>
            <input id="endsAt" name="endsAt" type="datetime-local" className="border rounded px-3 py-2" />
          </div>
        </div>
        <Button type="submit" className="w-fit">Create</Button>
      </form>

      <div className="grid gap-3">
        {all.map(a => (
          <Card key={a.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{a.title} <span className="text-xs ml-2">[{a.level}]</span></div>
                <div className="text-sm text-muted-foreground">{a.body}</div>
                <div className="text-xs text-muted-foreground">Audience: {a.audience} · Active: {String(a.isActive)}</div>
              </div>
              <form action={async () => { 'use server'; await removeAnnouncement(a.id) }}>
                <Button variant="destructive" size="sm">Delete</Button>
              </form>
            </CardContent>
          </Card>
        ))}
        {all.length === 0 && <div className="text-sm text-muted-foreground">No announcements yet.</div>}
      </div>
    </div>
  )
}


