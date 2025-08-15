"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Mail, Globe, Building2, MapPin } from 'lucide-react'
import Link from 'next/link'

type Lead = {
  id: string
  name: string
  logoUrl?: string
  sector?: string
  size?: string
  turnover?: string
  city?: string
  state?: string
  website?: string
  email?: string
  phone?: string
}

export default function LeadProfile({ params }: { params: Promise<{ id: string }> }) {
  const [lead, setLead] = useState<Lead | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/leads')
        if (!res.ok) throw new Error('Failed to load lead')
        const arr = await res.json()
        const { id } = await params
        const found = (arr as Lead[]).find(l => String(l.id) === decodeURIComponent(id)) || null
        if (live) setLead(found)
      } catch (e: any) {
        if (live) { setError(e?.message || 'Error'); setLead(null) }
      } finally {
        if (live) setLoading(false)
      }
    }
    load()
    return () => { live = false }
  }, [params])

  if (loading) return <div className="container mx-auto max-w-5xl px-4 py-8">Loading…</div>
  if (error) return <div className="container mx-auto max-w-5xl px-4 py-8 text-red-600">{error}</div>
  if (!lead) return <div className="container mx-auto max-w-5xl px-4 py-8">Lead not found.</div>

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded bg-muted overflow-hidden flex items-center justify-center">
          {lead.logoUrl ? (
            <Image src={lead.logoUrl} alt={lead.name} width={56} height={56} className="object-cover" />
          ) : (
            <Building2 className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold truncate">{lead.name}</h1>
            {lead.size && <Badge variant="secondary">{lead.size}</Badge>}
            {lead.sector && <Badge variant="outline">{lead.sector}</Badge>}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {[lead.city, lead.state].filter(Boolean).join(', ')}
          </div>
          {lead.turnover && <div className="text-sm text-muted-foreground">Turnover: {lead.turnover}</div>}
        </div>
        <div className="flex gap-2">
          {lead.phone && <Button asChild><a href={`tel:${lead.phone}`}><Phone className="h-4 w-4 mr-1" />Call</a></Button>}
          {lead.email && <Button asChild variant="outline"><a href={`mailto:${lead.email}`}><Mail className="h-4 w-4 mr-1" />Email</a></Button>}
          {lead.website && <Button asChild variant="outline"><a href={lead.website} target="_blank" rel="noreferrer"><Globe className="h-4 w-4 mr-1" />Website</a></Button>}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="p-4 space-y-3">
            <div className="font-semibold">About</div>
            <p className="text-sm text-muted-foreground">{lead.name} is a {lead.size?.toLowerCase()} organization operating in the {lead.sector} sector. This profile provides contact options for vendor registrations, tenders, and procurement discussions.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Location:</span> {[lead.city, lead.state].filter(Boolean).join(', ') || '—'}</div>
              <div><span className="text-muted-foreground">Turnover:</span> {lead.turnover || '—'}</div>
              <div><span className="text-muted-foreground">Sector:</span> {lead.sector || '—'}</div>
              <div><span className="text-muted-foreground">Company Size:</span> {lead.size || '—'}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="font-semibold">Quick Actions</div>
            <div className="flex flex-col gap-2">
              {lead.phone && <Button asChild><a href={`tel:${lead.phone}`}><Phone className="h-4 w-4 mr-1" />Call Procurement</a></Button>}
              {lead.email && <Button asChild variant="outline"><a href={`mailto:${lead.email}`}><Mail className="h-4 w-4 mr-1" />Email Procurement</a></Button>}
              {lead.website && <Button asChild variant="outline"><a href={lead.website} target="_blank" rel="noreferrer"><Globe className="h-4 w-4 mr-1" />Visit Website</a></Button>}
              <Button variant="outline" asChild><Link href="/messages">Open Messages</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


