import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const account = body?.account || {}
    const biz = body?.biz || {}
    const docs = biz?.docs || {}
    const name = String(account?.name || '').trim()
    const email = String(account?.email || '').trim().toLowerCase()
    const password = String(account?.password || '').trim()

    // Try to resolve user from session first
    const session = await getServerSession(authOptions as any)
    let user = (session as any)?.user?.id
      ? await prisma.user.findUnique({ where: { id: ((session as any).user as any).id } })
      : null

    // If no session user, fallback to email+password flow
    if (!user) {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
      }
      let existing = await prisma.user.findUnique({ where: { email } })
      if (!existing) {
        const hashed = await bcrypt.hash(password, 10)
        existing = await prisma.user.create({ data: { email, password: hashed, name: name || null } })
      }
      user = existing
    }

    // Upsert seller profile pending verification
    const seller = await prisma.sellerProfile.upsert({
      where: { userId: user.id },
      update: {
        businessName: String(biz?.businessName || '').trim() || null,
        businessType: String(biz?.businessType || '').trim() || null,
        gstNumber: String(biz?.gstNumber || '').trim() || null,
        businessAddress: String(biz?.address || '').trim() || null,
        verificationStatus: 'pending',
        kycDocs: JSON.stringify(docs),
      },
      create: {
        userId: user.id,
        businessName: String(biz?.businessName || '').trim() || null,
        businessType: String(biz?.businessType || '').trim() || null,
        gstNumber: String(biz?.gstNumber || '').trim() || null,
        businessAddress: String(biz?.address || '').trim() || null,
        verificationStatus: 'pending',
        kycDocs: JSON.stringify(docs),
      },
    })

    return NextResponse.json({ ok: true, userId: user.id, sellerId: seller.id })
  } catch (e) {
    console.error('seller signup', e)
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}
