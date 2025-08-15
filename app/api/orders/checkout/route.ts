import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

type OrderItemInput = {
  productId: string
  quantity: number
}

type ShippingAddress = {
  name: string
  line1: string
  line2?: string | null
  city: string
  state?: string | null
  postalCode: string
  country: string
  phone?: string | null
}

function validateShippingAddress(val: unknown): ShippingAddress | null {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return null;
  const obj = val as Record<string, unknown>;
  const getStr = (k: string): string => String(obj[k] ?? '').trim();
  const requiredKeys = ['name', 'line1', 'city', 'postalCode', 'country'] as const;
  for (const key of requiredKeys) {
    if (typeof obj[key] !== 'string' || getStr(key).length === 0) {
      return null;
    }
  }
  const address: ShippingAddress = {
    name: getStr('name'),
    line1: getStr('line1'),
    line2: obj['line2'] == null ? null : getStr('line2'),
    city: getStr('city'),
    state: obj['state'] == null ? null : getStr('state'),
    postalCode: getStr('postalCode'),
    country: getStr('country'),
    phone: obj['phone'] == null ? null : getStr('phone'),
  };
  return address;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const rawItems: unknown = body?.items;
    const rawShipping: unknown = body?.shippingAddress;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'items must be a non-empty array' }, { status: 400 });
    }
    const items: OrderItemInput[] = rawItems
      .map((it) => ({
        productId: typeof (it as any)?.productId === 'string' ? String((it as any).productId) : '',
        quantity: typeof (it as any)?.quantity === 'number' ? Number((it as any).quantity) : Number.NaN,
      }))
      .filter(it => typeof it.productId === 'string' && it.productId.length > 0 && Number.isFinite(it.quantity) && it.quantity > 0);
    if (items.length === 0) {
      return NextResponse.json({ error: 'No valid items' }, { status: 400 });
    }

    const shippingAddress = validateShippingAddress(rawShipping);
    if (!shippingAddress) {
      return NextResponse.json({ error: 'Invalid shippingAddress' }, { status: 400 });
    }

    // Totals will be calculated after locking reads inside transaction

    let subtotal = 0
    let taxAmount = 0
    let shippingCost = 0
    let totalAmount = 0

    const orderNumber = `ORD-${Date.now()}-${randomUUID()}`;

    const order = await prisma.$transaction(async (tx) => {
      // Lock rows and validate stock before decrementing
      const lockedProducts = await tx.product.findMany({
        where: { id: { in: Array.from(new Set(items.map(i => i.productId))) } },
        select: { id: true, price: true, stock: true },
      })
      if (lockedProducts.length !== new Set(items.map(i => i.productId)).size) {
        throw Object.assign(new Error('One or more products not found'), { statusCode: 404 })
      }
      const idToProduct = new Map(lockedProducts.map(p => [p.id, p] as const))
      for (const it of items) {
        const prod = idToProduct.get(it.productId)
        if (!prod) throw Object.assign(new Error('Product not found'), { statusCode: 404 })
        if ((prod.stock ?? 0) < it.quantity) {
          throw Object.assign(new Error(`Insufficient stock for ${it.productId}`), { statusCode: 409, productId: it.productId })
        }
      }
      // Compute totals now that we have prices
      subtotal = items.reduce((sum, it) => sum + (idToProduct.get(it.productId)!.price * it.quantity), 0)
      taxAmount = Math.round(subtotal * 0.18)
      shippingCost = subtotal > 5000 ? 0 : 150
      totalAmount = subtotal + taxAmount + shippingCost

      // Apply decrements
      for (const it of items) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        })
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          totalAmount,
          taxAmount,
          shippingCost,
          paymentStatus: 'pending',
          shippingAddress: JSON.stringify(shippingAddress),
          buyerId: session.user.id,
          items: {
            create: items.map((it) => ({
              productId: it.productId,
              quantity: it.quantity,
              price: idToProduct.get(it.productId)!.price,
            }))
          }
        },
        include: { items: { include: { product: true } } },
      });
      return created;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error(error);
    const status = typeof error?.statusCode === 'number' ? error.statusCode : 500
    if (status === 400) return NextResponse.json({ error: 'Bad request' }, { status })
    if (status === 401 || status === 403) return NextResponse.json({ error: 'Unauthorized' }, { status })
    if (status === 404) return NextResponse.json({ error: 'Not found' }, { status })
    if (status === 409) return NextResponse.json({ error: 'Insufficient stock', productId: error.productId }, { status })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


