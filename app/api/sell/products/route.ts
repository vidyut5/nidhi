import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session || !(session as any).user || ((session as any).user as any)?.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const name = String(body?.name || '').trim()
    const price = Number(body?.price)
    const sku = String(body?.sku || '').trim() || null
    const description = String(body?.description || '').trim() || ''
    const shortDescription = String(body?.shortDescription || '').trim() || null
    const brand = String(body?.brand || '').trim() || null
    const model = String(body?.model || '').trim() || null
    const tagsArray: string[] = Array.isArray(body?.categoryTags) ? body.categoryTags.filter((t: any) => typeof t === 'string' && t.trim()).slice(0, 20) : []
    const material = String(body?.material || '').trim() || null
    const imagesRaw = String(body?.images || '').trim()
    let imageUrls = '[]'
    try {
      const parsed = imagesRaw ? JSON.parse(imagesRaw) : []
      const urls = Array.isArray(parsed) ? parsed.map((f: any) => String(f?.url || '')).filter(Boolean) : []
      imageUrls = JSON.stringify(urls)
    } catch {
      imageUrls = '[]'
    }
    if (!name || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Invalid product data' }, { status: 400 })
    }
    const product = await prisma.product.create({
      data: {
        name,
        slug: `${name.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-')}-${Math.random().toString(36).slice(2,6)}`,
        description: description || name,
        shortDescription,
        price,
        imageUrls,
        brand,
        model,
        specifications: material ? JSON.stringify({ material }) : null,
        tags: tagsArray.length ? JSON.stringify(tagsArray) : null,
        isActive: false,
        sellerId: ((session as any).user as any).id,
        categoryId: (await prisma.category.findFirst({ select: { id: true } }))?.id || (await prisma.category.create({ data: { name: 'Uncategorized', slug: 'uncategorized' } })).id,
      }
    })
    return NextResponse.json({ ok: true, id: product.id })
  } catch (e) {
    console.error('Seller product submit error', e)
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}


