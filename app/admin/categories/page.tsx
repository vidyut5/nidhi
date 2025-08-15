import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createCategory, updateCategory, deleteCategory } from './actions'

export default async function AdminCategoriesPage() {
  const cats = await prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true, description: true } })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>

      <form action={createCategory} className="grid gap-3 border rounded-md p-4">
        <div className="grid grid-cols-3 gap-3">
          <input name="name" placeholder="Name" required className="border rounded px-3 py-2" />
          <input name="slug" placeholder="Slug (optional)" className="border rounded px-3 py-2" />
          <input name="description" placeholder="Description (optional)" className="border rounded px-3 py-2" />
        </div>
        <Button type="submit" className="w-fit">Add Category</Button>
      </form>

      <div className="grid gap-3">
        {cats.map(c => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{c.name} <span className="text-xs text-muted-foreground">/{c.slug}</span></div>
                  {c.description && <div className="text-sm text-muted-foreground">{c.description}</div>}
                </div>
                <form action={async (fd) => { 'use server'; fd.set('id', c.id); await deleteCategory(c.id) }}>
                  <Button variant="destructive" size="sm">Delete</Button>
                </form>
              </div>
              <div className="mt-3">
                <form action={async (fd) => { 'use server'; fd.set('id', c.id); await updateCategory(fd) }} className="grid grid-cols-3 gap-3">
                  <input name="name" defaultValue={c.name} className="border rounded px-3 py-2" />
                  <input name="slug" defaultValue={c.slug} className="border rounded px-3 py-2" />
                  <input name="description" defaultValue={c.description ?? ''} className="border rounded px-3 py-2" />
                  <div className="col-span-3">
                    <Button type="submit" size="sm">Save</Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
        {cats.length === 0 && <div className="text-sm text-muted-foreground">No categories yet.</div>}
      </div>
    </div>
  )
}


