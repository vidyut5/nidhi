import { NextResponse } from 'next/server'
import { readAnnouncements } from '@/lib/announcements-store'

export const runtime = 'nodejs'

export async function GET() {
  const all = await readAnnouncements()
  const now = Date.now()
  const active = all.filter(a => {
    if (!a.isActive) return false
    const startOk = !a.startsAt || new Date(a.startsAt).getTime() <= now
    const endOk = !a.endsAt || new Date(a.endsAt).getTime() >= now
    return startOk && endOk
  })
  const res = NextResponse.json(active)
  res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  return res
}


