import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const subject = typeof body?.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    if (!/.+@.+\..+/.test(email) || !subject || !message) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    // Stub: In a real app, send email or write to DB/ticketing system
    console.log('Support request:', { email, subject, message })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


