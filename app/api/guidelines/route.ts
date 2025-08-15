import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()
    const state = searchParams.get('state')?.trim()
    const city = searchParams.get('city')?.trim()
    const category = searchParams.get('category')?.trim()

    const where: any = { isActive: true }
    if (state) where.state = state
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (category) where.category = { contains: category, mode: 'insensitive' }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' as const } },
        { content: { contains: q, mode: 'insensitive' as const } },
      ]
    }

    const items = await prisma.guideline.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, content: true, state: true, city: true, category: true, isActive: true, createdAt: true },
      take: 200,
    })
    return NextResponse.json(items)
  } catch (e) {
    console.error(e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}


