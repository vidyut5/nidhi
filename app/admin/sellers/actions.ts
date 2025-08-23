"use server"

import { prisma } from '@/lib/prisma'
import { notifySellerApproval } from '@/lib/notify'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import crypto from 'crypto'

function base64urlToBuffer(b64url: string): Buffer {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(b64, 'base64')
}

async function assertAdmin() {
  const store = await cookies()
  const token = store.get('admin_session')?.value
  const secret = process.env.ADMIN_SESSION_SECRET || ''
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

export async function approveSeller(sellerProfileId: string) {
  await assertAdmin()
  const s = await prisma.sellerProfile.update({ where: { id: sellerProfileId }, data: { verificationStatus: 'VERIFIED' }, include: { user: true } })
  await notifySellerApproval(s.user.email, true)
  revalidatePath('/admin/sellers')
}

export async function rejectSeller(sellerProfileId: string) {
  await assertAdmin()
  const s = await prisma.sellerProfile.update({ where: { id: sellerProfileId }, data: { verificationStatus: 'REJECTED' }, include: { user: true } })
  await notifySellerApproval(s.user.email, false)
  revalidatePath('/admin/sellers')
}


