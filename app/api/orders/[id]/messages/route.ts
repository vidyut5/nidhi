import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addMessageToThread, readThreadMessages, getOrCreateOrderThread } from '@/lib/messages-store'

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })
    const { searchParams } = new URL(req.url)
    const target = (searchParams.get('target') as 'seller' | 'vidyut') || 'vidyut'
    const { id } = await ctx.params
    const thread = getOrCreateOrderThread(id, target, { id: session.user.id, name: session.user.name })
    const items = await readThreadMessages(thread.id)
    return NextResponse.json(items)
  } catch (e) {
    console.error(e)
    return new NextResponse('Something went wrong', { status: 500 })
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })
    const body = await req.json()
    const target = (String(body?.target || 'vidyut') as 'seller' | 'vidyut')
    const content = String(body?.content || '').trim()
    if (!content) return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    const { id } = await ctx.params
    const thread = getOrCreateOrderThread(id, target, { id: session.user.id, name: session.user.name })
    const saved = addMessageToThread({ threadId: thread.id, authorId: session.user.id, authorRole: 'buyer', content })
    return NextResponse.json(saved, { status: 201 })
  } catch (e) {
    console.error(e)
    return new NextResponse('Something went wrong', { status: 500 })
  }
}


