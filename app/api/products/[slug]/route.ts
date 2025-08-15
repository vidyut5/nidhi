import { NextResponse } from 'next/server'

// Demo implementation: get one product by slug from dummy-data and normalize
export async function GET(_req: Request, context: any) {
  try {
    const { slug } = context.params as { slug: string }
    const { products } = await import('@/lib/dummy-data')

    // Support both slug or id in the same endpoint
    const product = products.find(p => p.slug === slug || p.id === slug)
    if (!product) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Normalize to an API-friendly shape similar to /api/products list
    const imagesRaw = Array.isArray(product.images)
      ? product.images
      : (typeof (product as any).imageUrl === 'string' && (product as any).imageUrl)
        ? [(product as any).imageUrl]
        : []
    const images = imagesRaw.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    const safeImages = images.length > 0 ? images : ['/product-1.jpg']
    const normalized = {
      ...product,
      images: safeImages,
      imageUrl: safeImages[0],
      imageUrls: safeImages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(normalized)
  } catch (error) {
    console.error(error)
    return new NextResponse('Something went wrong', { status: 500 })
  }
}


