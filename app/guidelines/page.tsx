"use client"

import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
]

type Guideline = {
  id: string
  title: string
  content: string
  state: string
  city: string | null
  category: string | null
  isActive: boolean
  createdAt: string
  attachments?: string | null
}

export default function GuidelinesPage() {
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<Guideline[]>([])

  useEffect(() => {
    const params = new URLSearchParams()
    if (state) params.set('state', state)
    if (city) params.set('city', city)
    if (category) params.set('category', category)
    if (query) params.set('q', query)
    fetch(`/api/guidelines?${params.toString()}`)
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]))
  }, [state, city, category, query])

  const filtered = useMemo(() => items, [items])

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Guidelines</h1>
        <p className="text-muted-foreground">Browse state and city specific guidelines for the electrical marketplace.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="min-w-[280px]">
          <Input placeholder="Search title/content..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="State" /></SelectTrigger>
          <SelectContent>
            {INDIAN_STATES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="min-w-[200px]">
          <Input placeholder="City (optional)" value={city} onChange={e => setCity(e.target.value)} />
        </div>
        <div className="min-w-[200px]">
          <Input placeholder="Category (optional)" value={category} onChange={e => setCategory(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map(g => (
          <Card key={g.id}>
            <CardContent className="p-4 space-y-2">
              <div className="text-xs text-muted-foreground">{new Date(g.createdAt).toLocaleDateString()} · {g.state}{g.city ? `, ${g.city}` : ''}{g.category ? ` · ${g.category}` : ''}</div>
              <div className="text-xl font-semibold">{g.title}</div>
              <div className="prose max-w-none whitespace-pre-wrap text-sm">{g.content}</div>
              {g.attachments && (() => { try { return JSON.parse(g.attachments as string) } catch { return [] } })().length > 0 && (
                <div className="pt-2">
                  <div className="text-sm font-medium mb-1">Attachments</div>
                  <div className="flex flex-wrap gap-2">
                    {(() => { try { return JSON.parse(g.attachments as string) as { url: string; name: string; type?: string }[] } catch { return [] } })().map((f, idx) => (
                      <a key={idx} href={f.url} target="_blank" rel="noreferrer" className="text-primary underline text-sm">
                        {f.name || f.url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground">No guidelines match your filters.</div>
        )}
      </div>
    </div>
  )
}


