import fs from 'fs'
import { promises as fsp } from 'fs'
import path from 'path'
import crypto from 'crypto'

export type Attachment = { url: string; name?: string; type?: string; size?: number }

export type Message = {
  id: string
  threadId: string
  authorId: string
  authorRole: 'buyer' | 'seller' | 'vidyut' | 'admin'
  content: string
  attachments?: Attachment[]
  createdAt: string
}

export type Thread = {
  id: string
  kind: 'order' | 'support' | 'dm'
  title?: string
  participants: Array<{ id: string; name?: string | null; role?: 'buyer' | 'seller' | 'admin' | 'vidyut'; whatsapp?: string | null }>
  orderId?: string
  target?: 'seller' | 'vidyut'
  createdAt: string
  updatedAt: string
}

type Store = {
  messages: Message[]
  threads: Thread[]
}

const storePath = path.join(process.cwd(), 'data', 'messages.json')

function ensureStore(): Store {
  try {
    if (!fs.existsSync(storePath)) {
      fs.mkdirSync(path.dirname(storePath), { recursive: true })
      fs.writeFileSync(storePath, JSON.stringify({ messages: [], threads: [] }, null, 2))
    }
    const raw = fs.readFileSync(storePath, 'utf-8')
    const data = JSON.parse(raw) as Store
    if (!data.messages) data.messages = []
    if (!data.threads) data.threads = []
    return data
  } catch {
    return { messages: [], threads: [] }
  }
}

async function writeStore(data: Store) {
  await fsp.mkdir(path.dirname(storePath), { recursive: true })
  const tmp = `${storePath}.tmp`
  await fsp.writeFile(tmp, JSON.stringify(data, null, 2))
  await fsp.rename(tmp, storePath)
}

export function getOrCreateOrderThread(orderId: string, target: 'seller' | 'vidyut', me: { id: string; name?: string | null }, others?: Array<{ id: string; name?: string | null; role?: 'seller' | 'vidyut'; whatsapp?: string | null }>): Thread {
  const data = ensureStore()
  const id = `order-${orderId}-${target}`
  let thread = data.threads.find(t => t.id === id)
  if (!thread) {
    thread = {
      id,
      kind: 'order',
      title: `Order ${orderId} (${target})`,
      participants: [
        { id: me.id, name: me.name || 'You', role: 'buyer' },
        ...(others || [])
      ],
      orderId,
      target,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    data.threads.push(thread)
    // fire and forget
    void writeStore(data)
  }
  return thread
}

export function upsertThread(input: Omit<Thread, 'createdAt' | 'updatedAt'> & Partial<Pick<Thread, 'createdAt' | 'updatedAt'>>): Thread {
  const data = ensureStore()
  const existing = data.threads.find(t => t.id === input.id)
  if (existing) {
    Object.assign(existing, input)
    existing.updatedAt = new Date().toISOString()
    void writeStore(data)
    return existing
  }
  const thread: Thread = {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...input,
  }
  data.threads.push(thread)
  void writeStore(data)
  return thread
}

export function listThreadsForUser(userId: string, q?: string): Thread[] {
  const data = ensureStore()
  const threads = data.threads.filter(t => t.participants.some(p => p.id === userId))
  const searched = (q || '').trim().toLowerCase()
  const filtered = searched
    ? threads.filter(t => (t.title || '').toLowerCase().includes(searched) || t.participants.some(p => (p.name || '').toLowerCase().includes(searched)))
    : threads
  return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function readThreadMessages(threadId: string): Message[] {
  const data = ensureStore()
  return data.messages.filter(m => m.threadId === threadId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export function addMessageToThread(input: Omit<Message, 'id' | 'createdAt'>): Message {
  const data = ensureStore()
  const msg: Message = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  }
  data.messages.push(msg)
  const thread = data.threads.find(t => t.id === input.threadId)
  if (thread) thread.updatedAt = msg.createdAt
  void writeStore(data)
  return msg
}

export async function seedDemoForUser(user: { id: string; name?: string | null }) {
  const data = ensureStore()
  if (data.threads.length > 0 || data.messages.length > 0) return
  const now = Date.now()
  const supportThread: Thread = {
    id: 'support-1',
    kind: 'support',
    title: 'Vidyut Support',
    participants: [
      { id: user.id, name: user.name || 'You', role: 'buyer' },
      { id: 'vidyut', name: 'Vidyut Support', role: 'vidyut', whatsapp: '+919999999999' },
    ],
    createdAt: new Date(now - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 10).toISOString(),
  }
  const orderThread: Thread = {
    id: 'order-DEMO-1001-seller',
    kind: 'order',
    title: 'Order DEMO-1001 (Seller)',
    participants: [
      { id: user.id, name: user.name || 'You', role: 'buyer' },
      { id: 'seller-1', name: 'Raj Equipments', role: 'seller', whatsapp: '+918888888888' },
    ],
    orderId: 'DEMO-1001',
    target: 'seller',
    createdAt: new Date(now - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 15).toISOString(),
  }
  data.threads.push(supportThread, orderThread)

  const mk = (threadId: string, authorId: string, authorRole: Message['authorRole'], content: string, tOffsetMin: number, attachments?: Attachment[]): Message => ({
    id: `msg_${Math.random().toString(36).slice(2,8)}`,
    threadId,
    authorId,
    authorRole,
    content,
    attachments,
    createdAt: new Date(now - tOffsetMin * 60 * 1000).toISOString(),
  })
  data.messages.push(
    mk('support-1', 'vidyut', 'vidyut', 'Hi, how can we help you today?', 58),
    mk('support-1', user.id, 'buyer', 'Need the invoice for last order', 55),
    mk('support-1', 'vidyut', 'vidyut', 'Sure, sending it here and to your email.', 53, [{ url: '/product-1.jpg', name: 'invoice.pdf', type: 'application/pdf', size: 102400 }]),
    mk('order-DEMO-1001-seller', 'seller-1', 'seller', 'Your order is packed and will ship today.', 42),
    mk('order-DEMO-1001-seller', user.id, 'buyer', 'Great, please ensure fragile handling.', 40),
    mk('order-DEMO-1001-seller', 'seller-1', 'seller', 'Noted. Sharing label copy.', 38, [{ url: '/uploads/sample-label.png', name: 'label.png', type: 'image/png', size: 20480 }]),
  )
  await writeStore(data)
}



