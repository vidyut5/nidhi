import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addMessageToThread, listThreadsForUser, readThreadMessages, upsertThread, getOrCreateOrderThread, seedDemoForUser } from '@/lib/messages-store'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'guest'
    const userName = session?.user?.name || 'Guest'
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || undefined
    const threadId = searchParams.get('threadId') || undefined
    if (threadId) {
      const items = readThreadMessages(threadId)
      return NextResponse.json(items)
    }
    let threads = listThreadsForUser(userId, q || undefined)
    if (!threads || threads.length === 0) {
      seedDemoForUser({ id: userId, name: userName })
      threads = listThreadsForUser(userId, q || undefined)
    }
    return NextResponse.json(threads)
  } catch (e) {
    console.error(e)
    return new NextResponse('Something went wrong', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'guest'
    const userName = session?.user?.name || 'Guest'
    const body = await req.json()
    const intent = String(body?.intent || '')
    if (intent === 'create-thread') {
      const id = String(body?.id || '')
      type Kind = 'support' | 'order' | 'dm'
      const allowed: Kind[] = ['support', 'order', 'dm']
      const rawKind = String(body?.kind ?? 'support').toLowerCase()
      const kind: Kind = (allowed as string[]).includes(rawKind) ? (rawKind as Kind) : 'support'
      const title = String(body?.title || '') || undefined
      const participants = Array.isArray(body?.participants) ? body.participants : []
      const thread = upsertThread({ id, kind, title, participants })
      return NextResponse.json(thread, { status: 201 })
    }
    if (intent === 'order-thread') {
      const orderId = String(body?.orderId || '')
      const target = (String(body?.target || 'vidyut') as 'seller' | 'vidyut')
      const thread = getOrCreateOrderThread(orderId, target, { id: userId, name: userName }, body?.others)
      return NextResponse.json(thread, { status: 201 })
    }
    if (intent === 'send-message') {
      const threadId = String(body?.threadId || '')
      const content = String(body?.content || '').trim()
      const attachments = Array.isArray(body?.attachments) ? body.attachments : undefined
      if (!threadId || (!content && (!attachments || attachments.length === 0))) return NextResponse.json({ error: 'Empty' }, { status: 400 })
      const saved = addMessageToThread({ threadId, authorId: userId, authorRole: 'buyer', content, attachments })
      return NextResponse.json(saved, { status: 201 })
    }
    return NextResponse.json({ error: 'Unsupported' }, { status: 400 })
  } catch (e) {
    console.error(e)
    return new NextResponse('Something went wrong', { status: 500 })
  }
}


