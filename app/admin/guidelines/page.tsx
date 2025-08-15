import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createGuideline, updateGuideline, deleteGuideline } from './server-actions'
import { AttachmentsUploader } from '@/components/admin/guidelines/attachments-uploader'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
]

export default async function AdminGuidelinesPage() {
  let items: { id: string; title: string; content: string; state: string; city: string | null; category: string | null; isActive: boolean; createdAt: Date }[] = []
  try {
    // Fallback-safe access in case the Prisma client hasn't been regenerated in the running dev server yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client: any = prisma as any
    if (client?.guideline?.findMany) {
      items = await client.guideline.findMany({ orderBy: { createdAt: 'desc' } })
    } else {
      console.error('Prisma client does not have Guideline model yet. Restart the dev server after running prisma generate.')
    }
  } catch (err) {
    console.error('Failed to load guidelines', err)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Guidelines</h1>
      </div>

      <form action={createGuideline} className="grid gap-3 border rounded-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input name="title" placeholder="Title" required className="border rounded px-3 py-2" />
          <select name="state" required className="border rounded px-3 py-2">
            <option value="" disabled>Select state</option>
            {INDIAN_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input name="city" placeholder="City (optional)" className="border rounded px-3 py-2" />
          <input name="category" placeholder="Category (optional)" className="border rounded px-3 py-2" />
        </div>
        <textarea name="content" placeholder="Write guideline content..." required rows={6} className="border rounded px-3 py-2" />
        <div className="space-y-2">
          <div className="text-sm font-medium">Attachments</div>
          <AttachmentsUploader inputName="attachments" />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked /> Active</label>
        </div>
        <Button type="submit" className="w-fit">Publish</Button>
      </form>

      <div className="grid gap-3">
        {items.map(g => (
          <Card key={g.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{g.title}</div>
                  <div className="text-xs text-muted-foreground">{g.state}{g.city ? `, ${g.city}` : ''}{g.category ? ` · ${g.category}` : ''}</div>
                </div>
                <form action={async () => { 'use server'; await deleteGuideline(g.id) }}>
                  <Button size="sm" variant="destructive">Delete</Button>
                </form>
              </div>
              <div className="prose max-w-none whitespace-pre-wrap text-sm">{g.content}</div>
              <div>
                <form action={async (fd) => { 'use server'; fd.set('id', g.id); await updateGuideline(fd) }} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input name="title" defaultValue={g.title} className="border rounded px-3 py-2" />
                  <select name="state" defaultValue={g.state} className="border rounded px-3 py-2">
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <input name="city" defaultValue={g.city ?? ''} className="border rounded px-3 py-2" />
                  <input name="category" defaultValue={g.category ?? ''} className="border rounded px-3 py-2" />
                  <div className="md:col-span-3">
                    <textarea name="content" defaultValue={g.content} rows={4} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <div className="text-sm font-medium">Attachments</div>
                    <AttachmentsUploader inputName="attachments" defaultValue={''} />
                  </div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={g.isActive} /> Active</label>
                  <div className="md:col-span-3"><Button size="sm" type="submit">Save</Button></div>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <div className="text-sm text-muted-foreground">No guidelines published yet.</div>}
      </div>
    </div>
  )
}


