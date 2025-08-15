"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Paperclip, Search, Send } from 'lucide-react'

type Thread = {
  id: string
  title?: string
  kind: 'order' | 'support' | 'dm'
  updatedAt: string
  participants: Array<{ id: string; name?: string | null; role?: string | null; whatsapp?: string | null }>
}

type Message = {
  id: string
  threadId: string
  authorId: string
  authorRole: string
  content: string
  attachments?: Array<{ url: string; name?: string; type?: string; size?: number }>
  createdAt: string
}

export function ChatInbox({ seedOrderThread, userRole }: { seedOrderThread?: { orderId: string; target: 'seller' | 'vidyut' }, userRole?: 'buyer' | 'seller' | 'vidyut' | 'admin' }) {
  const [q, setQ] = useState('')
  const [threads, setThreads] = useState<Thread[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<Message[]>([])
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    let seeded = false
    const load = async () => {
      const url = new URL('/api/messages', window.location.origin)
      if (q.trim()) url.searchParams.set('q', q.trim())
      const res = await fetch(url.toString(), { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) setThreads(data)
      if (!cancelled && Array.isArray(data) && data.length === 0 && !seeded) {
        if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_SEEDING === 'true') {
          seeded = true
          try {
            await fetch('/api/messages/seed', { method: 'POST' })
            // reload after seed
            const res2 = await fetch(url.toString(), { cache: 'no-store' })
            const d2 = await res2.json()
            if (!cancelled) setThreads(d2)
          } catch (err) {
            console.error('Seeding failed', err)
          }
        }
      }
    }
    load()
    const id = setInterval(load, 5000)
    return () => { cancelled = true; clearInterval(id) }
  }, [q])

  useEffect(() => {
    if (seedOrderThread && !active) {
      fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'order-thread', orderId: seedOrderThread.orderId, target: seedOrderThread.target }) })
        .then(r => r.json()).then((t) => setActive(t.id)).catch(() => {})
    }
  }, [seedOrderThread, active])

  useEffect(() => {
    if (!active) return
    let live = true
    const load = async () => {
      const url = new URL('/api/messages', window.location.origin)
      url.searchParams.set('threadId', active)
      const res = await fetch(url.toString(), { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (live) setMsgs(data)
    }
    load()
    const id = setInterval(load, 3000)
    return () => { live = false; clearInterval(id) }
  }, [active])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [msgs])

  const activeThread = useMemo(() => threads.find(t => t.id === active) || null, [threads, active])

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0 || !active) return
    // Validate client-side
    const MAX = 5 * 1024 * 1024
    const allowed = new Set(['image/jpeg', 'image/png', 'application/pdf'])
    for (const f of files) {
      if (f.size > MAX || !allowed.has(f.type)) {
        console.error('Invalid file', f.name)
        return
      }
    }
    try {
      const form = new FormData()
      for (const f of files) form.append('files', f)
      const res = await fetch('/api/uploads', { method: 'POST', body: form })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(txt || 'Upload failed')
      }
      const data = await res.json()
      const uploaded = (data.files || [])
      await send('', uploaded)
      e.target.value = ''
    } catch (err) {
      console.error(err)
    }
  }

  const send = async (content?: string, attach?: any[]) => {
    const textToSend = (content ?? text).trim()
    if (!active || (!textToSend && (!attach || attach.length === 0))) return
    setText('')
    const optimistic: Message = { id: `tmp_${Date.now()}`, threadId: active, authorId: 'me', authorRole: userRole || 'buyer', content: textToSend, attachments: attach, createdAt: new Date().toISOString() }
    setMsgs(prev => [...prev, optimistic])
    try {
      await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'send-message', threadId: active, content: textToSend, attachments: attach }) })
    } catch {}
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border rounded-lg overflow-hidden">
      {/* Left: threads */}
      <div className="md:col-span-1 border-r bg-background">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats or people" className="pl-8" />
          </div>
        </div>
        <div className="p-2 max-h-[70vh] overflow-y-auto">
          {threads.map(t => {
            const title = t.title || (t.participants.find(p => p.role !== 'buyer')?.name || 'Conversation')
            return (
              <button key={t.id} onClick={() => setActive(t.id)} className={`w-full text-left px-3 py-2 rounded-lg border hover:bg-muted mb-2 ${active===t.id ? 'bg-muted' : ''}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate pr-2">{title}</span>
                  <span className="text-xs text-muted-foreground">{new Date(t.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: conversation */}
      <div className="md:col-span-2 flex flex-col">
        {activeThread ? (
          <>
            <div className="p-3 border-b flex items-center justify-between">
              {(() => {
                const other = activeThread.participants.find(p => (p.role || '').toLowerCase() !== 'buyer')
                const title = activeThread.title || other?.name || 'Conversation'
                const profileHref = other ? `/profile/${encodeURIComponent(other.id)}` : undefined
                return (
                  <div className="font-semibold truncate pr-2">
                    {profileHref ? (
                      <a href={profileHref} target="_blank" rel="noreferrer" className="hover:underline">{title}</a>
                    ) : (
                      <span>{title}</span>
                    )}
                  </div>
                )
              })()}
            </div>
            <div ref={listRef} className="flex-1 min-h-[50vh] max-h-[70vh] overflow-y-auto p-4 space-y-2 bg-muted/30">
              {msgs.map(m => (
                <div key={m.id} className={m.authorRole === 'buyer' ? 'text-right' : ''}>
                  <div className={`inline-block max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.authorRole === 'buyer' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-zinc-800 border'}`}>
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="mb-2 space-y-2">
                        {m.attachments.map((a, i) => (
                          <a key={i} href={a.url} target="_blank" className="block text-xs underline truncate">{a.name || a.url}</a>
                        ))}
                      </div>
                    )}
                    <div>{m.content}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border cursor-pointer">
                  <Paperclip className="h-4 w-4" />
                  Attach
                  <input type="file" multiple hidden onChange={onFiles} />
                </label>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" className="flex-1 border rounded-full px-4 py-2 text-sm bg-background" />
                <Button size="sm" onClick={() => send()}><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-[50vh] flex items-center justify-center text-sm text-muted-foreground">
            Select a conversation or start a new chat
          </div>
        )}
      </div>
    </div>
  )
}


