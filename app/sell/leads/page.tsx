"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Mail, Building2, MapPin } from 'lucide-react'

type Lead = {
  id: string
  name: string
  logoUrl?: string
  sector?: string
  size?: 'SME' | 'Mid' | 'Large' | 'Enterprise'
  turnover?: string
  city?: string
  state?: string
  website?: string
  email?: string
  phone?: string
}

export default function SellerLeadsPage() {
  const [q, setQ] = useState('')
  const [size, setSize] = useState<string>('all')
  const [sector, setSector] = useState<string>('all')
  const [items, setItems] = useState<Lead[]>([])

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (size !== 'all') params.set('size', size)
    if (sector !== 'all') params.set('sector', sector)
    setLoading(true)
    setError(null)
    fetch(`/api/leads?${params.toString()}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      })
      .then(setItems)
      .catch((e) => { setError(e?.message || 'Failed to load'); setItems([]) })
      .finally(() => setLoading(false))
  }, [q, size, sector])

  const filtered = useMemo(() => items, [items])

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">B2B Leads</h1>
        <p className="text-sm text-muted-foreground">Discover verified enterprises, buyers and contractors. Contact directly from Vidyut.</p>
      </div>

      <div className="flex flex-wrap gap-2 sticky top-0 z-20 bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur -mx-4 px-4 py-2">
        <Input placeholder="Search company, sector, city..." value={q} onChange={e => setQ(e.target.value)} className="min-w-[280px]" />
        <Select value={size} onValueChange={setSize}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Company size" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sizes</SelectItem>
            <SelectItem value="SME">SME</SelectItem>
            <SelectItem value="Mid">Mid</SelectItem>
            <SelectItem value="Large">Large</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Sector" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sectors</SelectItem>
            <SelectItem value="Power">Power</SelectItem>
            <SelectItem value="EPC">EPC</SelectItem>
            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
            <SelectItem value="Infra">Infrastructure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(l => (
          <Card key={l.id} className="hover:shadow-sm transition-all border-muted/70">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex items-center justify-center flex-none">
                  {l.logoUrl ? (
                    <Image src={l.logoUrl} alt={l.name} width={40} height={40} className="object-cover" />
                  ) : (
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{l.name}</div>
                    {l.size && <Badge variant="secondary" className="text-[10px]">{l.size}</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {(l.sector || 'General')}{l.city || l.state ? ` · ${[l.city, l.state].filter(Boolean).join(', ')}` : ''}
                  </div>
                  {l.turnover && <div className="text-[11px] text-muted-foreground mt-1">Turnover: {l.turnover}</div>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {l.phone && (
                      <Button asChild size="sm" variant="outline" className="h-7 px-2"><a href={`tel:${l.phone}`}><Phone className="h-3.5 w-3.5 mr-1" />Call</a></Button>
                    )}
                    {l.email && (
                      <Button asChild size="sm" variant="outline" className="h-7 px-2"><a href={`mailto:${l.email}`}><Mail className="h-3.5 w-3.5 mr-1" />Email</a></Button>
                    )}
                    {l.website && (
                      <Button asChild size="sm" variant="outline" className="h-7 px-2"><a href={l.website} target="_blank" rel="noreferrer">Website</a></Button>
                    )}
                    <Button asChild size="sm" className="h-7 px-3"><a href={`/sell/leads/${encodeURIComponent(l.id)}`}>View</a></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground">No leads found. Try adjusting your filters.</div>
        )}
      </div>
    </div>
  )
}


