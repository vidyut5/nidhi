"use server"

import { prisma } from '@/lib/prisma'
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
  const payload = JSON.parse(base64urlToBuffer(p).toString('utf8')) as { exp?: number; sub?: string; subId?: string }
  const now = Math.floor(Date.now() / 1000)
  if (!payload || (typeof payload.exp === 'number' && now >= payload.exp)) throw new Error('Unauthorized')
  if (payload.sub !== 'admin') throw new Error('Unauthorized')
  return payload
}

export async function createGuideline(formData: FormData) {
  const payload = await assertAdmin()
  const title = (formData.get('title')?.toString() || '').trim()
  const content = (formData.get('content')?.toString() || '').trim()
  const state = (formData.get('state')?.toString() || '').trim()
  const city = (formData.get('city')?.toString() || '').trim() || null
  const category = (formData.get('category')?.toString() || '').trim() || null
  const isActive = formData.get('isActive') != null
  const attachmentsRaw = (formData.get('attachments')?.toString() || '').trim()
  const attachments = attachmentsRaw ? attachmentsRaw : null
  if (!title) throw new Error('Title required')
  if (!content) throw new Error('Content required')
  if (!state) throw new Error('State required')
  await prisma.guideline.create({ data: { title, content, state, city, category, isActive, attachments, authorId: payload.subId } })
  revalidatePath('/admin/guidelines')
}

export async function updateGuideline(formData: FormData) {
  await assertAdmin()
  const id = (formData.get('id')?.toString() || '').trim()
  if (!id) throw new Error('Missing id')
  const title = (formData.get('title')?.toString() || '').trim()
  const content = (formData.get('content')?.toString() || '').trim()
  const state = (formData.get('state')?.toString() || '').trim()
  const city = (formData.get('city')?.toString() || '').trim() || null
  const category = (formData.get('category')?.toString() || '').trim() || null
  const isActive = formData.get('isActive') != null
  const attachmentsRaw = (formData.get('attachments')?.toString() || '').trim()
  const attachments = attachmentsRaw ? attachmentsRaw : undefined
  await prisma.guideline.update({ where: { id }, data: { title, content, state, city, category, isActive, attachments } })
  revalidatePath('/admin/guidelines')
}

export async function deleteGuideline(id: string) {
  await assertAdmin()
  await prisma.guideline.delete({ where: { id } })
  revalidatePath('/admin/guidelines')
}


