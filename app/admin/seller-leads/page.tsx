"use client"

import { useMemo, useState } from 'react'

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
  const [list, setList] = useState<Lead[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<Lead, 'id'> & { id?: string }>({
    id: '',
    name: '',
    logoUrl: '',
    sector: '',
    size: undefined,
    turnover: '',
    city: '',
    state: '',
    website: '',
    email: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canSave = useMemo(() => form.name.trim().length > 0, [form.name])

  function normalize(l: any): Lead {
    const coerce = (v: any) => (typeof v === 'string' && v.trim().length > 0 ? v.trim() : undefined)
    return {
      id: (typeof l.id === 'string' && l.id.trim()) || cryptoRandomId(),
      name: typeof l.name === 'string' ? l.name.trim() : '',
      logoUrl: coerce(l.logoUrl),
      sector: coerce(l.sector),
      size: (coerce(l.size) as Lead['size']) || undefined,
      turnover: coerce(l.turnover),
      city: coerce(l.city),
      state: coerce(l.state),
      website: coerce(l.website),
      email: coerce(l.email),
      phone: coerce(l.phone),
    }
  }

  function cryptoRandomId() {
    // fallback-safe random id for client use
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as any).randomUUID()
    return 'lead_' + Math.random().toString(36).slice(2, 10)
  }

  function resetForm() {
    setForm({ id: '', name: '', logoUrl: '', sector: '', size: undefined, turnover: '', city: '', state: '', website: '', email: '', phone: '' })
    setEditingIndex(null)
  }

  function onEdit(idx: number) {
    const l = list[idx]
    setEditingIndex(idx)
    setForm({ ...l })
  }

  function onDelete(idx: number) {
    setList(prev => prev.filter((_, i) => i !== idx))
    if (editingIndex === idx) resetForm()
  }

  function onSave() {
    if (!canSave) return
    const next = normalize(form)
    if (editingIndex == null) setList(prev => [...prev, next])
    else setList(prev => prev.map((l, i) => (i === editingIndex ? next : l)))
    resetForm()
  }

  async function submitToServer(leads: Lead[]) {
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

  function exportJson(leads: Lead[]) {
    const blob = new Blob([JSON.stringify(leads, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leads.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function onExcelSelected(file: File) {
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' })
      const mapped = rows.map(r => normalize({
        id: r.id ?? r.ID,
        name: r.name ?? r.Name ?? r.company ?? r.Company,
        logoUrl: r.logoUrl ?? r.logo ?? r.Logo,
        sector: r.sector ?? r.Sector,
        size: r.size ?? r.Size,
        turnover: r.turnover ?? r.Turnover,
        city: r.city ?? r.City,
        state: r.state ?? r.State,
        website: r.website ?? r.Website,
        email: r.email ?? r.Email,
        phone: r.phone ?? r.Phone,
      }))
      setList(prev => [...prev, ...mapped.filter(m => m.name)])
    } catch (e: any) {
      setError(e?.message || 'Failed to parse Excel file')
    }
  }

  async function onCsvSelected(file: File) {
    const text = await file.text()
    const lines = text.split(/\r?\n/).filter(Boolean)
    if (lines.length === 0) return
    const header = lines[0].split(',').map(h => h.trim().toLowerCase())
    const idx = (name: string) => header.indexOf(name)
    const out: Lead[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      const lead = normalize({
        id: cols[idx('id')],
        name: cols[idx('name')],
        logoUrl: cols[idx('logourl')],
        sector: cols[idx('sector')],
        size: cols[idx('size')],
        turnover: cols[idx('turnover')],
        city: cols[idx('city')],
        state: cols[idx('state')],
        website: cols[idx('website')],
        email: cols[idx('email')],
        phone: cols[idx('phone')],
      })
      if (lead.name) out.push(lead)
    }
    setList(prev => [...prev, ...out])
  }

  return (
    <div className="container max-w-5xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Seller Leads — Add / Edit / Import</h1>
        <p className="text-sm text-muted-foreground">Fill the form to add leads, or import from Excel/CSV. Then upload to server or export JSON.</p>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-green-600">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Name*</label>
          <input className="w-full rounded-md border bg-background p-2 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">ID (optional)</label>
          <input className="w-full rounded-md border bg-background p-2 text-sm" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Sector</label>
          <input className="w-full rounded-md border bg-background p-2 text-sm" value={form.sector || ''} onChange={e => setForm({ ...form, sector: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Size</label>
          <select className="w-full rounded-md border bg-background p-2 text-sm" value={form.size || ''} onChange={e => setForm({ ...form, size: (e.target.value || undefined) as Lead['size'] })}>
            <option value="">-</option>
            <option value="SME">SME</option>
            <option value="Mid">Mid</option>
            <option value="Large">Large</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">City</label>
          <input className="w-full rounded-md border bg-background p-2 text-sm" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">State</label>
          <input className="w-full rounded-md border bg-background p-2 text-sm" value={form.state || ''} onChange={e => setForm({ ...form, state: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Turnover</label>
          <input className="w-full rounded-md border bg-background p-2 text-sm" value={form.turnover || ''} onChange={e => setForm({ ...form, turnover: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Website</label>
          <input className="w-full rounded-md border bg-background p-2 text-sm" value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" className="w-full rounded-md border bg-background p-2 text-sm" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input className="w-full rounded-md border bg-background p-2 text-sm" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm mb-1">Logo URL</label>
          <input className="w-full rounded-md border bg-background p-2 text-sm" value={form.logoUrl || ''} onChange={e => setForm({ ...form, logoUrl: e.target.value })} />
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50" disabled={!canSave} onClick={onSave}>{editingIndex == null ? 'Add Lead' : 'Save Lead'}</button>
        {editingIndex != null && (
          <button className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm" onClick={resetForm}>Cancel</button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm">Import:</label>
        <input type="file" accept=".xlsx,.xls,.csv,text/csv" onChange={async e => {
          const f = e.target.files?.[0]
          if (!f) return
          if (f.name.endsWith('.csv')) await onCsvSelected(f)
          else await onExcelSelected(f)
          e.currentTarget.value = ''
        }} />
        <button className="px-3 py-2 rounded-md border text-sm" onClick={() => exportJson(list)} disabled={list.length === 0}>Export JSON</button>
        <button className="px-3 py-2 rounded-md border text-sm disabled:opacity-50" disabled={loading || list.length === 0} onClick={() => submitToServer(list)}>Upload to Server</button>
        <span className="text-xs text-muted-foreground">Items: {list.length}</span>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Sector</th>
              <th className="text-left p-2">Size</th>
              <th className="text-left p-2">City</th>
              <th className="text-left p-2">State</th>
              <th className="text-left p-2">Website</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Phone</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((l, i) => (
              <tr key={l.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{l.name}</td>
                <td className="p-2 whitespace-nowrap">{l.sector || '-'}</td>
                <td className="p-2 whitespace-nowrap">{l.size || '-'}</td>
                <td className="p-2 whitespace-nowrap">{l.city || '-'}</td>
                <td className="p-2 whitespace-nowrap">{l.state || '-'}</td>
                <td className="p-2 max-w-[180px] truncate"><a className="text-blue-600 hover:underline" href={l.website || '#'} target="_blank" rel="noreferrer">{l.website || '-'}</a></td>
                <td className="p-2 whitespace-nowrap">{l.email || '-'}</td>
                <td className="p-2 whitespace-nowrap">{l.phone || '-'}</td>
                <td className="p-2 whitespace-nowrap">
                  <button className="px-2 py-1 rounded-md border mr-2" onClick={() => onEdit(i)}>Edit</button>
                  <button className="px-2 py-1 rounded-md border" onClick={() => onDelete(i)}>Delete</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td className="p-3 text-muted-foreground text-sm" colSpan={9}>No leads yet. Use the form above or import from Excel/CSV.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


