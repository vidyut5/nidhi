"use client"

import { useState } from 'react'

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

export default function AdminSellerLeadsUpload() {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function submit(leads: Lead[]) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leads),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'Upload failed')
      setSuccess(`Uploaded ${data?.count ?? leads.length} leads successfully.`)
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  function parseCsv(csv: string): Lead[] {
    const lines = csv.split(/\r?\n/).filter(Boolean)
    if (lines.length === 0) return []
    const header = lines[0].split(',').map(h => h.trim().toLowerCase())
    const idx = (name: string) => header.indexOf(name)
    const out: Lead[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      const lead: Lead = {
        id: (cols[idx('id')] || '').trim(),
        name: (cols[idx('name')] || '').trim(),
        logoUrl: (cols[idx('logourl')] || '').trim() || undefined,
        sector: (cols[idx('sector')] || '').trim() || undefined,
        size: (cols[idx('size')] || '').trim() as Lead['size'],
        turnover: (cols[idx('turnover')] || '').trim() || undefined,
        city: (cols[idx('city')] || '').trim() || undefined,
        state: (cols[idx('state')] || '').trim() || undefined,
        website: (cols[idx('website')] || '').trim() || undefined,
        email: (cols[idx('email')] || '').trim() || undefined,
        phone: (cols[idx('phone')] || '').trim() || undefined,
      }
      out.push(lead)
    }
    return out
  }

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Upload Seller Leads</h1>
      <p className="text-sm text-muted-foreground">Paste JSON array of leads or upload a CSV with headers: id,name,logoUrl,sector,size,turnover,city,state,website,email,phone.</p>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-green-600">{success}</div>}

      <div className="space-y-2">
        <label className="text-sm font-medium">JSON</label>
        <textarea
          className="w-full h-40 rounded-md border bg-background p-2 text-sm"
          placeholder='[{"id":"1","name":"ACME"}, {"name":"Beta Power"}]'
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button
          className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50"
          disabled={loading}
          onClick={() => {
            try {
              const parsed = JSON.parse(text)
              if (!Array.isArray(parsed)) throw new Error('Expected a JSON array')
              submit(parsed as Lead[])
            } catch (e: any) {
              setError(e?.message || 'Invalid JSON')
            }
          }}
        >Upload JSON</button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">CSV file</label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={async e => {
            const f = e.target.files?.[0]
            setFile(f || null)
            if (f) {
              const text = await f.text()
              const leads = parseCsv(text)
              submit(leads)
            }
          }}
        />
      </div>
    </div>
  )
}


