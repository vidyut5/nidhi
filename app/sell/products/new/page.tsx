"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ProductMediaUploader } from '@/components/sell/product-media-uploader'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    price: '',
    sku: '',
    description: '',
    shortDescription: '',
    brand: '',
    model: '',
    categoryTags: [] as string[],
    material: '',
    images: '[]',
  })

  const commonMaterials = useMemo(() => [
    'Copper', 'Aluminum', 'Steel', 'Stainless Steel', 'Brass', 'Plastic', 'PVC', 'Rubber', 'Silicone', 'Ceramic'
  ], [])

  const commonCategoryTags = useMemo(() => [
    'Wires & Cables', 'Switches', 'Panels', 'Safety', 'Tools', 'Transformers', 'Motors', 'Lights', 'Conduits'
  ], [])

  async function submit() {
    if (loading) return
    setError('')
    try {
      setLoading(true)
      const res = await fetch('/api/sell/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          categoryTags: form.categoryTags,
          material: form.material,
          images: form.images,
        })
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to submit')
      }
      router.replace('/sell/products')
    } catch (e: any) {
      setError(e.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Submit New Product</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3">
            <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={loading} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder="SKU (optional)" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} disabled={loading} />
              <Input placeholder="Brand (optional)" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} disabled={loading} />
              <Input placeholder="Model (optional)" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} disabled={loading} />
            </div>
            <Input placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} disabled={loading} />
            <Textarea placeholder="Short Description" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} disabled={loading} />
            <Textarea placeholder="Detailed Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} disabled={loading} />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Category Tags</label>
            <div className="flex flex-wrap gap-2">
              {form.categoryTags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                  {t}
                  <button type="button" onClick={() => setForm({ ...form, categoryTags: form.categoryTags.filter(x => x !== t) })} aria-label={`Remove ${t}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {commonCategoryTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className="text-xs px-2 py-1 rounded-full border hover:bg-accent"
                  onClick={() => setForm({ ...form, categoryTags: Array.from(new Set([...form.categoryTags, tag])) })}
                >
                  + {tag}
                </button>
              ))}
            </div>
            <Input
              placeholder="Add custom tag and press Enter"
              onKeyDown={(e) => {
                const v = (e.currentTarget.value || '').trim()
                if (e.key === 'Enter' && v) {
                  e.preventDefault()
                  setForm({ ...form, categoryTags: Array.from(new Set([...form.categoryTags, v])) })
                  e.currentTarget.value = ''
                }
              }}
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Material Type</label>
            <Input
              placeholder="Type material (e.g., Copper, Steel)"
              value={form.material}
              onChange={e => setForm({ ...form, material: e.target.value })}
              list="material-suggestions"
              disabled={loading}
            />
            <datalist id="material-suggestions">
              {commonMaterials.map(m => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <div className="text-xs text-muted-foreground">Common suggestions are provided; you can also enter custom material.</div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Media</label>
            <ProductMediaUploader inputName="images" defaultValue={form.images} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={submit} disabled={loading || !form.name || !form.price}>Submit for approval</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


