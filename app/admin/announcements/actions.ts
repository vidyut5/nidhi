"use server"

import { cookies } from 'next/headers'
import crypto from 'crypto'
import { upsertAnnouncement, deleteAnnouncement, type Announcement } from '@/lib/announcements-store'
import { revalidatePath } from 'next/cache'

function base64urlToBuffer(b64url: string): Buffer {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(b64, 'base64')
}

// Validate critical configuration at module load to fail fast
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET
if (!ADMIN_SESSION_SECRET) {
  throw new Error('Missing ADMIN_SESSION_SECRET')
}

async function assertAdmin() {
  const store = await cookies()
  const token = store.get('admin_session')?.value
  const secret = ADMIN_SESSION_SECRET
  if (!token || !secret) throw new Error('Unauthorized')
  const [h, p, s] = token.split('.')
  const data = `${h}.${p}`
  const expected = crypto.createHmac('sha256', secret).update(data).digest()
  const expectedB64 = expected.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  if (!crypto.timingSafeEqual(Buffer.from(expectedB64), Buffer.from(s))) throw new Error('Unauthorized')
  const payload = JSON.parse(base64urlToBuffer(p).toString('utf8')) as { exp?: number; sub?: string }
  const now = Math.floor(Date.now() / 1000)
  if (!payload || (typeof payload.exp === 'number' && now >= payload.exp)) throw new Error('Unauthorized')
  if (payload.sub !== 'admin') throw new Error('Unauthorized')
}

export async function saveAnnouncement(formData: FormData) {
  await assertAdmin()
  // Helper to trim and basic-escape text to mitigate XSS in UI contexts
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const idRaw = formData.get('id')
  const titleRaw = formData.get('title')
  const bodyRaw = formData.get('body')
  const levelRaw = formData.get('level')
  const audienceRaw = formData.get('audience')
  const isActiveRaw = formData.get('isActive')
  const startsAtRaw = formData.get('startsAt')
  const endsAtRaw = formData.get('endsAt')

  const id = idRaw ? String(idRaw) : undefined
  const title = String(titleRaw ?? '').trim()
  const body = String(bodyRaw ?? '').trim()
  const level = String(levelRaw ?? 'info').trim()
  const audience = String(audienceRaw ?? 'all').trim()
  const isActive = isActiveRaw === 'on' || isActiveRaw === 'true'
  const startsAtStr = startsAtRaw ? String(startsAtRaw).trim() : undefined
  const endsAtStr = endsAtRaw ? String(endsAtRaw).trim() : undefined

  // Validate required fields and constraints
  if (!title) throw new Error('Title is required')
  if (!body) throw new Error('Body is required')
  if (title.length > 200) throw new Error('Title is too long (max 200 characters)')
  if (body.length > 5000) throw new Error('Body is too long (max 5000 characters)')

  const allowedLevels: Announcement['level'][] = ['info', 'success', 'warning', 'danger'] as unknown as Announcement['level'][]
  const allowedAudiences: Announcement['audience'][] = ['all', 'buyers', 'sellers'] as unknown as Announcement['audience'][]
  const levelValid: Announcement['level'] = (allowedLevels as string[]).includes(level) ? (level as Announcement['level']) : 'info'
  const audienceValid: Announcement['audience'] = (allowedAudiences as string[]).includes(audience) ? (audience as Announcement['audience']) : 'all'

  // Parse and validate dates
  let startsAt: string | undefined
  let endsAt: string | undefined
  let startsDate: Date | undefined
  let endsDate: Date | undefined
  if (startsAtStr) {
    const d = new Date(startsAtStr)
    if (!Number.isFinite(d.getTime())) throw new Error('Invalid start date')
    startsDate = d
    startsAt = d.toISOString()
  }
  if (endsAtStr) {
    const d = new Date(endsAtStr)
    if (!Number.isFinite(d.getTime())) throw new Error('Invalid end date')
    endsDate = d
    endsAt = d.toISOString()
  }
  if (startsDate && endsDate && !(endsDate.getTime() > startsDate.getTime())) {
    throw new Error('End date must be after start date')
  }

  const clean: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'> & { id?: string } = {
    id,
    title: escapeHtml(title),
    body: escapeHtml(body),
    level: levelValid,
    audience: audienceValid,
    isActive,
    startsAt,
    endsAt,
  }

  await upsertAnnouncement(clean)
  revalidatePath('/admin/announcements')
}

export async function removeAnnouncement(id: string) {
  await assertAdmin()
  try {
    const ok = await deleteAnnouncement(id)
    if (!ok) {
      throw new Error('Announcement not found')
    }
    revalidatePath('/admin/announcements')
  } catch (err) {
    console.error('Failed to delete announcement', { id, err })
    throw err
  }
}


