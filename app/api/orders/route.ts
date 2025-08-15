import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const productId: unknown = body?.productId;
    const quantityRaw: unknown = body?.quantity;
    type ShippingAddress = {
      name: string;
      line1: string;
      line2?: string | null;
      city: string;
      state?: string | null;
      postalCode: string;
      country: string;
      phone?: string | null;
    };

    const rawShipping: unknown = body?.shippingAddress;
    const validateShippingAddress = (val: unknown): ShippingAddress | null => {
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
    };
    const shippingAddressValidated = validateShippingAddress(rawShipping);
    const quantity = typeof quantityRaw === 'number' ? quantityRaw : parseInt(String(quantityRaw ?? '1'), 10);

    if (!productId || typeof productId !== 'string') {
      return new NextResponse("Missing product ID", { status: 400 });
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return new NextResponse("Invalid quantity", { status: 400 });
    }
    if (!shippingAddressValidated) {
      return new NextResponse("Invalid shippingAddress", { status: 400 });
    }

    // Get product details for pricing
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Validate stock before attempting to create order
    if ((product.stock ?? 0) < quantity) {
      return new NextResponse("Insufficient stock", { status: 409 });
    }

    // Generate robust order number
    const orderNumber = `ORD-${Date.now()}-${randomUUID()}`;

    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock conditionally
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stock: { decrement: quantity }
        }
      });

      if ((updatedProduct.stock ?? 0) < 0) {
        // If stock goes negative, throw to rollback
        throw new Error('Insufficient stock during update');
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          totalAmount: product.price * quantity,
          shippingAddress: JSON.stringify(shippingAddressValidated ?? null),
          buyerId: session.user.id,
          items: {
            create: {
              productId,
              quantity,
              price: product.price,
            }
          }
        },
        include: {
          items: {
            include: { product: true }
          }
        }
      });

      return createdOrder;
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return new NextResponse("Something went wrong", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') || 'buyer'
    let where: any
    if (role === 'seller') {
      where = {
        items: { some: { product: { sellerId: session.user.id } } },
      }
    } else {
      where = { buyerId: session.user.id }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return new NextResponse("Something went wrong", { status: 500 });
  }
}