"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SellerSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [account, setAccount] = useState({ name: '', email: '', password: '' })
  const [biz, setBiz] = useState({ businessName: '', businessType: '', gstNumber: '', address: '' })
  const [docs, setDocs] = useState<Record<string, { url: string; name?: string; type?: string; size?: number }[]>>({
    pan: [],
    gst: [],
    registration: [],
    addressProof: [],
    ownerPhoto: [],
  })

  async function uploadAndSet(key: keyof typeof docs, files: FileList | null) {
    if (!files || files.length === 0) return
    try {
      const form = new FormData()
      Array.from(files).forEach(f => form.append('files', f))
      const res = await fetch('/api/uploads', { method: 'POST', body: form })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Upload failed')
      }
      const data = await res.json()
      const uploaded = (data.files || []) as { url: string; name?: string; type?: string; size?: number }[]
      setDocs(prev => ({ ...prev, [key]: [...(prev[key] || []), ...uploaded] }))
    } catch (e: any) {
      setError(e.message || 'Upload failed')
      return
    }
  }

  async function submit() {
    if (loading) return
    setError('')
    try {
      setLoading(true)
      const res = await fetch('/api/sellers/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, biz: { ...biz, docs } })
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to sign up')
      }
      router.replace('/sell/dashboard')
    } catch (e: any) {
      setError(e.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Become a Seller</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="grid gap-3">
              <Input placeholder="Full name" value={account.name} onChange={e => setAccount({ ...account, name: e.target.value })} disabled={loading} />
              <Input placeholder="Email" value={account.email} onChange={e => setAccount({ ...account, email: e.target.value })} disabled={loading} />
              <Input placeholder="Password" type="password" value={account.password} onChange={e => setAccount({ ...account, password: e.target.value })} disabled={loading} />
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={loading || !account.email || !account.password}>Next</Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-3">
              <Input placeholder="Business name" value={biz.businessName} onChange={e => setBiz({ ...biz, businessName: e.target.value })} disabled={loading} />
              <Input placeholder="Business type (Individual/Company)" value={biz.businessType} onChange={e => setBiz({ ...biz, businessType: e.target.value })} disabled={loading} />
              <Input placeholder="GST number (optional)" value={biz.gstNumber} onChange={e => setBiz({ ...biz, gstNumber: e.target.value })} disabled={loading} />
              <Input placeholder="Business address" value={biz.address} onChange={e => setBiz({ ...biz, address: e.target.value })} disabled={loading} />

              {/* KYC / Documents */}
              <div id="kyc" className="mt-2 grid gap-2">
                <div className="text-sm font-medium">KYC Documents</div>
                <div className="grid gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">PAN Card</div>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => uploadAndSet('pan', e.target.files)} />
                    <div className="flex flex-wrap gap-2 mt-1">
                      {docs.pan.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs underline">{f.name || 'file'}</a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">GST Certificate</div>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => uploadAndSet('gst', e.target.files)} />
                    <div className="flex flex-wrap gap-2 mt-1">
                      {docs.gst.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs underline">{f.name || 'file'}</a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Business Registration (MSME/Udyam/INC)</div>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => uploadAndSet('registration', e.target.files)} />
                    <div className="flex flex-wrap gap-2 mt-1">
                      {docs.registration.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs underline">{f.name || 'file'}</a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Address Proof</div>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => uploadAndSet('addressProof', e.target.files)} />
                    <div className="flex flex-wrap gap-2 mt-1">
                      {docs.addressProof.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs underline">{f.name || 'file'}</a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Owner Photo</div>
                    <input type="file" accept="image/*" onChange={(e) => uploadAndSet('ownerPhoto', e.target.files)} />
                    <div className="flex flex-wrap gap-2 mt-1">
                      {docs.ownerPhoto.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs underline">{f.name || 'image'}</a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>Back</Button>
                <Button onClick={submit} disabled={loading || !biz.businessName}>Submit</Button>
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}


