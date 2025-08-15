import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { seedDemoForUser } from '@/lib/messages-store'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'guest'
    const userName = session?.user?.name || 'Guest'
    await seedDemoForUser({ id: userId, name: userName })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}


