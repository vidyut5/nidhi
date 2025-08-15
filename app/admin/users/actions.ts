"use server"

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

function base64urlToBuffer(b64url: string): Buffer {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(b64, 'base64')
}

async function assertAdmin() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('admin_session')?.value
  const secret = process.env.ADMIN_SESSION_SECRET || ''
  if (!cookie || !secret) throw new Error('Unauthorized')
  const parts = cookie.split('.')
  if (parts.length !== 3) throw new Error('Unauthorized')
  const [h, p, s] = parts
  const data = `${h}.${p}`
  const expected = crypto.createHmac('sha256', secret).update(data).digest()
  const expectedB64 = expected.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  if (!crypto.timingSafeEqual(Buffer.from(expectedB64), Buffer.from(s))) throw new Error('Unauthorized')
  const payload = JSON.parse(base64urlToBuffer(p).toString('utf8')) as { exp?: number; sub?: string }
  const now = Math.floor(Date.now() / 1000)
  if (!payload || (typeof payload.exp === 'number' && now >= payload.exp)) throw new Error('Unauthorized')
  if (payload.sub !== 'admin') throw new Error('Unauthorized')
}

export async function promoteUser(userId: string) {
  await assertAdmin()
  await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } })
  revalidatePath('/admin/users')
}

export async function disableUser(userId: string) {
  await assertAdmin()
  await prisma.user.update({ where: { id: userId }, data: { isVerified: false } })
  revalidatePath('/admin/users')
}


