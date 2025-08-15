"use client"

import { useState } from 'react'

export default function HelpPage() {
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setStatus(null)
    const validEmail = /.+@.+\..+/.test(email)
    if (!validEmail || !subject.trim() || !message.trim()) {
      setStatus('Please fill all fields with a valid email.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, subject, message }) })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        setStatus(txt || 'Failed to submit request')
        return
      }
      setStatus('Your request has been submitted. We will get back to you shortly.')
      setEmail(''); setSubject(''); setMessage('')
    } catch (err: any) {
      setStatus(err?.message || 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Help & Support</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">Frequently Asked Questions</h2>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>How do I track my order?</li>
              <li>What is the return policy?</li>
              <li>How can I become a seller?</li>
              <li>How do I contact support?</li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Contact</h2>
            <p className="text-sm text-muted-foreground">Email: support@example.com</p>
            <p className="text-sm text-muted-foreground">Hours: Mon-Sat, 9 AM – 6 PM IST</p>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="font-semibold">Support Request</h2>
          <form className="grid gap-3" onSubmit={onSubmit}>
            <input className="border rounded px-3 py-2" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
            <input className="border rounded px-3 py-2" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
            <textarea className="border rounded px-3 py-2 min-h-28" placeholder="Describe your issue" value={message} onChange={e => setMessage(e.target.value)} />
            {status && <div className="text-sm text-muted-foreground">{status}</div>}
            <button className="border rounded px-3 py-2 w-fit disabled:opacity-50" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}



