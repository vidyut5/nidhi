import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const enterpriseProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
  domain: z.string().url('Invalid domain format').optional().or(z.literal('')),
  gst: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format').optional().or(z.literal('')),
  cin: z.string().regex(/^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/, 'Invalid CIN format').optional().or(z.literal('')),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500, 'Address too long'),
  billingAddress: z.string().min(10, 'Billing address must be at least 10 characters').max(500, 'Billing address too long').optional().or(z.literal(''))
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { sellerProfile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // Parse stored JSON fields
    const profile = {
      ...user.sellerProfile,
      kycDocs: user.sellerProfile.kycDocs ? JSON.parse(user.sellerProfile.kycDocs) : null
    }

    logger.info('Enterprise profile retrieved', { userId: session.user.id })
    return NextResponse.json({ profile })

  } catch (error) {
    logger.error('Failed to get enterprise profile', error instanceof Error ? error : undefined, { userId: session?.user?.id })
    return NextResponse.json({ error: 'Failed to retrieve profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validation = enterpriseProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      }, { status: 400 })
    }

    const data = validation.data

    // Update or create seller profile
    const profile = await prisma.sellerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        businessName: data.companyName,
        businessAddress: data.address,
        gstNumber: data.gst || null,
        bankDetails: data.billingAddress || null,
        isEnterprise: true,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        businessName: data.companyName,
        businessAddress: data.address,
        gstNumber: data.gst || null,
        bankDetails: data.billingAddress || null,
        isEnterprise: true,
        verificationStatus: 'PENDING'
      }
    })

    logger.info('Enterprise profile updated', { userId: session.user.id, profileId: profile.id })
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: {
        id: profile.id,
        companyName: profile.businessName,
        address: profile.businessAddress,
        gst: profile.gstNumber,
        billingAddress: profile.bankDetails,
        isEnterprise: profile.isEnterprise
      }
    })

  } catch (error) {
    logger.error('Failed to update enterprise profile', error instanceof Error ? error : undefined, { userId: session?.user?.id })
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}



