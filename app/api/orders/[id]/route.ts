import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const { id } = await ctx.params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: {
                  select: { id: true, name: true, email: true, phone: true }
                }
              }
            },
          },
        },
      },
    })
    if (!order || order.buyerId !== session.user.id) {
      return new NextResponse('Not found', { status: 404 })
    }

    const ORDER_TIMELINE_CONFIG: Record<string, { label: string; offsetMs?: number }> = {
      ordered: { label: 'Order Placed', offsetMs: 0 },
      confirmed: { label: 'Order Confirmed', offsetMs: 5 * 60 * 1000 },
      processing: { label: 'Processing', offsetMs: 30 * 60 * 1000 },
      shipped: { label: 'Shipped', offsetMs: 24 * 60 * 60 * 1000 },
      delivered: { label: 'Delivered', offsetMs: 3 * 24 * 60 * 60 * 1000 },
      cancelled: { label: 'Cancelled' },
      returned: { label: 'Returned' },
    }

    function generateOrderTimeline(o: typeof order | null) {
      if (!o) return []
      const createdAt = o.createdAt
      if (!createdAt) return []
      const status = o.status
      const relevantKeys: Array<keyof typeof ORDER_TIMELINE_CONFIG> = (() => {
        if (status === 'CANCELLED') return ['ordered', 'cancelled']
        if (status === 'RETURNED') return ['ordered', 'confirmed', 'processing', 'shipped', 'delivered', 'returned']
        return ['ordered', 'confirmed', 'processing', 'shipped', 'delivered']
      })()
      const steps = relevantKeys.map((key) => {
        const cfg = ORDER_TIMELINE_CONFIG[key]
        let at: Date
        if (key === 'delivered') {
          at = o.deliveredAt || o.estimatedDelivery || new Date(createdAt.getTime() + (ORDER_TIMELINE_CONFIG.delivered.offsetMs || 0))
        } else {
          at = new Date(createdAt.getTime() + (cfg.offsetMs || 0))
        }
        return { key, label: cfg.label, at }
      })
      return steps.sort((a, b) => a.at.getTime() - b.at.getTime())
    }

    const steps = generateOrderTimeline(order)
    const indexFound = steps.findIndex(s => s.key === (order.status as any))
    let currentIndex: number
    if (order.status === 'PROCESSING') {
      currentIndex = 2
    } else if (order.status === 'CONFIRMED') {
      currentIndex = 1
    } else {
      currentIndex = Math.max(indexFound, 0)
    }

    const timeline = steps.map((s, index) => ({
      id: String(index + 1),
      status: s.key,
      label: s.label,
      timestamp: s.at.toISOString(),
      isCompleted: index <= currentIndex,
    }))

    const response = {
      ...order,
      items: order.items.map((it) => {
        const prod = it.product as any
        let images: string[] = []
        if (Array.isArray(prod?.imageUrls)) images = prod.imageUrls
        else if (typeof prod?.imageUrls === 'string') {
          try { const arr = JSON.parse(prod.imageUrls); if (Array.isArray(arr)) images = arr } catch {}
        }
        return {
          id: it.id,
          quantity: it.quantity,
          price: it.price,
          product: {
            id: prod?.id,
            name: prod?.name,
            slug: prod?.slug,
            imageUrl: images[0] || null,
            seller: (it as any).product?.seller || null,
          }
        }
      }),
      timeline,
    }

    return NextResponse.json(response)
  } catch (e) {
    console.error(e)
    return new NextResponse('Something went wrong', { status: 500 })
  }
}


