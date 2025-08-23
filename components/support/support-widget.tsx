"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send, MessageSquare, Phone, Mail, Settings, Trash2, X } from 'lucide-react'
import { ChatSidebar } from '@/components/messages/chat-sidebar'
import { logger } from '@/lib/logger'

type ContactInfo = { name?: string; email?: string; phone?: string }

export function SupportWidget({
  orderId,
  seller,
  support = { email: 'support@example.com', phone: '+918888888888' },
  defaultTarget = 'vidyut',
  quick = [
    'Where is my order?',
    'Share invoice',
    'Change delivery address',
  ],
}: {
  orderId: string
  seller?: ContactInfo
  support?: ContactInfo
  defaultTarget?: 'seller' | 'vidyut'
  quick?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<'seller' | 'vidyut'>(defaultTarget)
  const [thread, setThread] = useState<{ id: string; author: string; content: string; createdAt: string }[]>([])
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)
  const [inboxOpen, setInboxOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    let active = true
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/messages?target=${target}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (active) setThread(data)
      } catch (err) {
        logger.error('Failed to load messages', err instanceof Error ? err : undefined, { orderId, target })
      }
    }
    load()
    const id = setInterval(load, 4000)
    return () => { active = false; clearInterval(id) }
  }, [open, target, orderId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [thread])

  // Allow opening from anywhere (e.g., mobile side menu)
  useEffect(() => {
    const handler = () => setOpen(true)
    if (typeof window !== 'undefined') {
      window.addEventListener('open-support' as any, handler as EventListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('open-support' as any, handler as EventListener)
      }
    }
  }, [])

  const contact = useMemo(() => (target === 'seller' ? seller : support) || {}, [target, seller, support])

  async function send() {
    const content = text.trim()
    if (!content) return
    setText('')
    const optimistic = { id: `tmp_${Date.now()}`, author: 'buyer', content, createdAt: new Date().toISOString() }
    setThread(prev => [...prev, optimistic])
    try {
      await fetch(`/api/orders/${encodeURIComponent(orderId)}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, content })
      })
    } catch (err) {
      // restore text
      setText(content)
      // mark optimistic as failed (remove or annotate)
      setThread(prev => prev.filter(m => m.id !== optimistic.id))
      logger.error('Failed to send message', err instanceof Error ? err : undefined, { orderId, target, content })
    }
  }

  return (
    <div>
      {!open && (
        <Button className="hidden md:inline-flex fixed bottom-4 right-4 z-50 shadow-lg rounded-full gap-2" onClick={() => setOpen(true)}>
          <MessageSquare className="h-4 w-4" /> Support
        </Button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[90vw] rounded-2xl bg-background shadow-xl border">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b rounded-t-2xl">
            <div className="font-semibold">Support</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <a href={`mailto:${contact.email || support.email}`} title="Email"><Mail className="h-4 w-4" /></a>
              <a href={`tel:${contact.phone || support.phone}`} title="Call"><Phone className="h-4 w-4" /></a>
              <Settings className="h-4 w-4" />
              <Trash2 className="h-4 w-4" />
              <button aria-label="Close" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Greeting */}
          <div className="px-4 pt-3">
            <div className="text-sm p-3 rounded-xl bg-muted">Hi! How can we help with order <span className="font-medium">{orderId}</span>?</div>
          </div>

          {/* Target switch */}
          <div className="px-4 pt-2">
            <div className="inline-flex rounded-full border overflow-hidden text-sm">
              <button className={`px-3 py-1.5 ${target==='vidyut' ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setTarget('vidyut')}>Vidyut</button>
              <button className={`px-3 py-1.5 ${target==='seller' ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setTarget('seller')}>Seller</button>
            </div>
          </div>

          {/* Quick questions */}
          <div className="px-4 pt-3 space-y-2">
            <div className="text-xs text-muted-foreground">Common questions</div>
            <div className="grid gap-2">
              {quick.map((q) => (
                <button key={q} onClick={() => setText(q)} className="text-left text-sm rounded-full border px-3 py-2 hover:bg-muted">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Thread */}
          <div ref={listRef} className="px-3 mt-3 max-h-56 overflow-y-auto space-y-2">
            {thread.map((m) => (
              <div key={m.id} className={m.author === 'buyer' ? 'text-right' : ''}>
                <div className={`inline-block px-3 py-2 rounded-2xl text-sm ${m.author === 'buyer' ? 'bg-blue-600 text-white' : 'bg-muted'}`}>
                  {m.content}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3">
            <div className="flex items-center gap-2 border rounded-full px-3 py-2">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tell us how we can help..." className="flex-1 bg-transparent outline-none text-sm" />
              <button className="rounded-full p-2 hover:bg-muted" onClick={send} aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="text-[10px] text-muted-foreground text-center mt-2">AI may produce inaccurate information</div>
            <div className="text-center mt-2">
              <button className="text-xs underline" onClick={() => setInboxOpen(true)}>Open full inbox</button>
            </div>
          </div>
        </div>
      )}

      {/* Full inbox linked to Support */}
      <ChatSidebar open={inboxOpen} onOpenChange={setInboxOpen} seedOrderThread={{ orderId, target }} />
    </div>
  )
}


