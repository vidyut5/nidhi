import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import PDFDocument from 'pdfkit'

export const runtime = 'nodejs'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

    const { id } = await ctx.params
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    })
    if (!order || order.buyerId !== session.user.id) return new NextResponse('Not found', { status: 404 })

    // Build PDF
    const doc = new PDFDocument({ margin: 40 })
    const chunks: Buffer[] = []
    doc.on('data', (d: any) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)))

    doc.fontSize(18).text('Invoice', { align: 'right' })
    doc.moveDown(0.5)
    doc.fontSize(12).text(`Order: ${order.orderNumber}`)
    doc.text(`Date: ${order.createdAt.toISOString().slice(0,10)}`)
    doc.moveDown()

    doc.fontSize(12).text('Bill To:', { underline: true })
    try {
      const addr = JSON.parse(order.shippingAddress)
      doc.text(addr.name || '')
      doc.text(addr.line1 || '')
      doc.text(`${addr.city || ''} ${addr.postalCode || ''}`)
      doc.text(`${addr.country || ''}`)
    } catch {}
    doc.moveDown()

    doc.fontSize(12).text('Items', { underline: true })
    order.items.forEach((it) => {
      doc.text(`${it.product.name}  x${it.quantity}  —  ₹${it.price.toLocaleString('en-IN')}`)
    })
    doc.moveDown()

    doc.text(`Subtotal: ₹${(order.totalAmount - order.taxAmount - order.shippingCost).toLocaleString('en-IN')}`)
    doc.text(`Tax: ₹${order.taxAmount.toLocaleString('en-IN')}`)
    doc.text(`Shipping: ₹${order.shippingCost.toLocaleString('en-IN')}`)
    doc.font('Helvetica-Bold').text(`Total: ₹${order.totalAmount.toLocaleString('en-IN')}`)
    doc.end()

    await new Promise<void>((resolve) => doc.on('end', () => resolve()))
    const pdfBuffer = Buffer.concat(chunks)
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${order.orderNumber}.pdf"`,
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    })
  } catch (e) {
    console.error(e)
    return new NextResponse('Something went wrong', { status: 500 })
  }
}


