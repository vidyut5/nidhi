"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Plus, Search, Paperclip, Send, MessageSquare, Phone } from 'lucide-react'

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

export function ChatSidebar({ open, onOpenChange, seedOrderThread }: { open: boolean; onOpenChange: (v: boolean) => void; seedOrderThread?: { orderId: string; target: 'seller' | 'vidyut' } }) {
  const [q, setQ] = useState('')
  const [threads, setThreads] = useState<Thread[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<any[]>([])
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const load = async () => {
      const url = new URL('/api/messages', window.location.origin)
      if (q.trim()) url.searchParams.set('q', q.trim())
      const res = await fetch(url.toString(), { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) setThreads(data)
    }
    load()
    const id = setInterval(load, 5000)
    return () => { cancelled = true; clearInterval(id) }
  }, [q, open])

  useEffect(() => {
    if (!open) return
    if (seedOrderThread && !active) {
      // Ensure order thread exists then select
      fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'order-thread', orderId: seedOrderThread.orderId, target: seedOrderThread.target }) })
        .then(r => r.json()).then((t) => setActive(t.id)).catch(() => {})
    }
  }, [seedOrderThread, open, active])

  useEffect(() => {
    if (!active || !open) return
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
  }, [active, open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [msgs])

  const activeThread = useMemo(() => threads.find(t => t.id === active) || null, [threads, active])

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0 || !active) return
    const form = new FormData()
    for (const f of files) form.append('files', f)
    const res = await fetch('/api/uploads', { method: 'POST', body: form })
    if (!res.ok) return
    const data = await res.json()
    const uploaded = (data.files || [])
    await send('', uploaded)
    e.target.value = ''
  }

  const send = async (content?: string, attach?: any[]) => {
    const textToSend = (content ?? text).trim()
    if (!active || (!textToSend && (!attach || attach.length === 0))) return
    setText('')
    const optimistic: Message = { id: `tmp_${Date.now()}`, threadId: active, authorId: 'me', authorRole: 'buyer', content: textToSend, attachments: attach, createdAt: new Date().toISOString() }
    setMsgs(prev => [...prev, optimistic])
    try {
      await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'send-message', threadId: active, content: textToSend, attachments: attach }) })
    } catch {}
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>Messages</span>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats or people" className="pl-8 w-64" />
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-3 h-full">
          {/* Threads list */}
          <div className="col-span-1 border-r p-2 overflow-y-auto">
            <Button className="w-full mb-2" variant="outline" size="sm" onClick={() => setActive(null)}>
              <Plus className="h-4 w-4 mr-1" /> New Chat
            </Button>
            <div className="space-y-1">
              {threads.map(t => {
                const title = t.title || (t.participants.find(p => p.role !== 'buyer')?.name || 'Conversation')
                const whatsapp = t.participants.find(p => p.whatsapp)?.whatsapp
                return (
                  <button key={t.id} onClick={() => setActive(t.id)} className={`w-full text-left px-3 py-2 rounded-lg border hover:bg-muted ${active===t.id ? 'bg-muted' : ''}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate pr-2">{title}</span>
                      <span className="text-xs text-muted-foreground">{new Date(t.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {whatsapp && (
                      <a href={`https://wa.me/${encodeURIComponent(whatsapp)}`} target="_blank" rel="noreferrer" className="text-xs text-primary underline">WhatsApp</a>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Messages */}
          <div className="col-span-2 flex flex-col">
            {activeThread ? (
              <>
                <div className="flex items-center justify-between p-3 border-b">
                  <div className="font-semibold truncate pr-2">{activeThread.title || 'Conversation'}</div>
                  {/* WhatsApp quick icon if present */}
                  {activeThread.participants.find(p => p.whatsapp) && (
                    <a href={`https://wa.me/${encodeURIComponent(activeThread.participants.find(p => p.whatsapp)!.whatsapp as string)}`} target="_blank" rel="noreferrer" title="Open WhatsApp">
                      <Image src="/images/whatsapp.svg" alt="WhatsApp" width={20} height={20} />
                    </a>
                  )}
                </div>
                <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/30">
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
                <div className="p-2 border-t">
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
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Select a conversation or start a new chat
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}


