import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Static export configuration
export const dynamic = 'force-static'
export const revalidate = false

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  const secret = process.env.ADMIN_SESSION_SECRET || ''
  if (!token || !secret) return false
  try {
    const [h, p, s] = token.split('.')
    if (!h || !p || !s) return false
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    const data = `${h}.${p}`
    const sigB64 = s.replace(/-/g, '+').replace(/_/g, '/')
    const sigBuf = Buffer.from(sigB64, 'base64')
    const sig = new Uint8Array(sigBuf)
    const ok = await crypto.subtle.verify('HMAC', key, sig, encoder.encode(data))
    if (!ok) return false
    // Exp check
    const payloadB64 = p.replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(payloadB64, 'base64').toString('utf8')
    const payload = JSON.parse(json) as { exp?: number }
    if (typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000)
      if (now >= payload.exp) return false
    }
    return true
  } catch {
    return false
  }
}

function parseString(param: string | null): string | undefined { return param ?? undefined }
function parseBoolean(param: string | null): boolean | undefined {
  if (param == null || param === '') return undefined
  if (param === 'true') return true
  if (param === 'false') return false
  return undefined
}

export async function GET(req: Request) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = parseString(searchParams.get('q'))
  const uploaderId = parseString(searchParams.get('uploaderId'))
  const accountType = parseString(searchParams.get('accountType'))
  const isActive = parseBoolean(searchParams.get('isActive'))
  const categoryId = parseString(searchParams.get('categoryId'))
  const dateFrom = parseString(searchParams.get('dateFrom'))
  const dateTo = parseString(searchParams.get('dateTo'))

  const where: any = {}
  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' as const } },
      { description: { contains: q, mode: 'insensitive' as const } },
      { sku: { contains: q, mode: 'insensitive' as const } },
      { tags: { contains: q, mode: 'insensitive' as const } },
      { brand: { contains: q, mode: 'insensitive' as const } },
      { model: { contains: q, mode: 'insensitive' as const } },
    ]
  }
  if (typeof isActive === 'boolean') where.isActive = isActive
  if (categoryId) where.categoryId = categoryId
  if (uploaderId) where.sellerId = uploaderId
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) {
      const from = new Date(dateFrom)
      if (!Number.isNaN(from.getTime())) where.createdAt.gte = from
    }
    if (dateTo) {
      const to = new Date(dateTo)
      if (!Number.isNaN(to.getTime())) {
        to.setHours(23, 59, 59, 999)
        where.createdAt.lte = to
      }
    }
  }
  if (accountType === 'enterprise') {
    where.seller = { sellerProfile: { is: { isEnterprise: true } } }
  } else if (accountType === 'individual') {
    where.OR = [
      ...(where.OR ?? []),
      { seller: { sellerProfile: { is: { isEnterprise: false } } } },
      { seller: { sellerProfile: { is: null } } },
    ]
  }

  const rows = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      stock: true,
      isActive: true,
      createdAt: true,
      category: { select: { name: true } },
      seller: { select: { name: true, email: true, sellerProfile: { select: { isEnterprise: true } } } },
    },
    take: 5000,
  })

  const header = ['ID','Name','SKU','Category','Uploader','Account','Status','Stock','Price','Created']
  const escape = (v: unknown) => {
    if (v == null) return ''
    const s = String(v)
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push([
      r.id,
      r.name,
      r.sku ?? '',
      r.category?.name ?? '',
      r.seller.name ?? r.seller.email,
      r.seller.sellerProfile?.isEnterprise ? 'Enterprise' : 'Individual',
      r.isActive ? 'Active' : 'Inactive',
      String(r.stock),
      String(r.price),
      new Date(r.createdAt).toISOString(),
    ].map(escape).join(','))
  }
  const csv = lines.join('\n')

  const res = new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="products-export.csv"`,
      'Cache-Control': 'no-store',
    },
  })
  return res
}


