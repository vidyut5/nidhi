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
  const payload = JSON.parse(base64urlToBuffer(p).toString('utf8')) as { exp?: number; sub?: string }
  const now = Math.floor(Date.now() / 1000)
  if (!payload || (typeof payload.exp === 'number' && now >= payload.exp)) throw new Error('Unauthorized')
  if (payload.sub !== 'admin') throw new Error('Unauthorized')
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function createCategory(formData: FormData) {
  await assertAdmin()
  const name = (formData.get('name')?.toString() || '').trim()
  const slugRaw = (formData.get('slug')?.toString() || '').trim()
  const description = (formData.get('description')?.toString() || '').trim() || null
  if (!name) throw new Error('Name required')
  const slug = slugify(slugRaw || name)
  await prisma.category.create({ data: { name, slug, description } })
  revalidatePath('/admin/categories')
}

export async function updateCategory(formData: FormData) {
  await assertAdmin()
  const id = formData.get('id')?.toString() || ''
  const name = (formData.get('name')?.toString() || '').trim()
  const slugRaw = (formData.get('slug')?.toString() || '').trim()
  const description = (formData.get('description')?.toString() || '').trim() || null
  if (!id) throw new Error('Missing id')
  const slug = slugRaw ? slugify(slugRaw) : undefined
  await prisma.category.update({ where: { id }, data: { name: name || undefined, slug, description } })
  revalidatePath('/admin/categories')
}

export async function deleteCategory(id: string) {
  await assertAdmin()
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
}


