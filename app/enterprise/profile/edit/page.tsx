"use client"

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function EnterpriseProfileEditPage() {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    companyName: '',
    domain: '',
    gst: '',
    cin: '',
    address: '',
    billingAddress: '',
  })

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch('/api/enterprise/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save profile')
      }
      
      // Redirect to profile page on success
      window.location.href = '/enterprise/profile'
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert(error instanceof Error ? error.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-wide py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Company Profile</h1>
        <Button variant="outline" asChild><Link href="/enterprise/profile">Back</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
            </div>
            <div>
              <Label>Corporate Domain</Label>
              <Input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} />
            </div>
            <div>
              <Label>GST</Label>
              <Input value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} />
            </div>
            <div>
              <Label>CIN</Label>
              <Input value={form.cin} onChange={e => setForm({ ...form, cin: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Registered Address</Label>
              <Textarea rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Billing Address</Label>
              <Textarea rows={3} value={form.billingAddress} onChange={e => setForm({ ...form, billingAddress: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex gap-2 justify-end">
              <Button type="button" variant="outline" asChild><Link href="/enterprise/profile">Cancel</Link></Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


