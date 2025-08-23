import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productSchema, validateInput } from "@/lib/validation";
import { handleApiError, ValidationError, AuthenticationError } from "@/lib/error-handler";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const raw = await req.json();
    
    // Validate input using Zod schema
    const validation = validateInput(productSchema, raw);
    if (!validation.success) {
      throw new ValidationError('Invalid product data', validation.errors);
    }

    const { name, description, price, imageUrls, categoryId, ...otherFields } = validation.data;

    // Generate a unique slug from the trimmed name
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `product-${Date.now()}`;

    // Preload conflicting slugs and determine a free one
    const existing = await prisma.product.findMany({
      where: {
        OR: [
          { slug: baseSlug },
          { slug: { startsWith: baseSlug + '-' } },
        ],
      },
      select: { slug: true },
    });
    const existingSet = new Set(existing.map(e => e.slug));
    let slug = baseSlug;
    let suffix = 1;
    while (existingSet.has(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }

    // Create with unique index protection; retry on duplicate just in case of a race
    let product;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        product = await prisma.product.create({
          data: {
            name,
            slug,
            description,
            price,
            imageUrls: JSON.stringify(imageUrls),
            sellerId: session.user.id,
            categoryId,
            stock: otherFields.stock || 0,
            minOrder: otherFields.minOrder || 1,
            ...(otherFields.dimensions && { dimensions: JSON.stringify(otherFields.dimensions) }),
            ...(otherFields.colors && { colors: JSON.stringify(otherFields.colors) }),
            ...(otherFields.sizes && { sizes: JSON.stringify(otherFields.sizes) }),
            ...(otherFields.specifications && { specifications: JSON.stringify(otherFields.specifications) }),
            ...(otherFields.tags && { tags: JSON.stringify(otherFields.tags) }),
            ...(otherFields.brand && { brand: otherFields.brand }),
            ...(otherFields.model && { model: otherFields.model }),
            ...(otherFields.sku && { sku: otherFields.sku }),
            ...(otherFields.weight && { weight: otherFields.weight }),
            ...(otherFields.warranty && { warranty: otherFields.warranty }),
            ...(otherFields.returnPolicy && { returnPolicy: otherFields.returnPolicy }),
            ...(otherFields.shortDescription && { shortDescription: otherFields.shortDescription }),
            ...(otherFields.originalPrice && { originalPrice: otherFields.originalPrice }),
          },
        });
        break;
      } catch (e: unknown) {
        // Prisma unique constraint violation code is 'P2002'
        const err = e as { code?: string };
        if (err && err.code === 'P2002') {
          slug = `${baseSlug}-${suffix++}`;
          continue;
        }
        throw e;
      }
    }
    if (!product) {
      // Fallback if retries failed
      product = await prisma.product.create({
        data: {
          name,
          slug: `${baseSlug}-${Date.now()}`,
          description,
          price,
          imageUrls: JSON.stringify(imageUrls),
          sellerId: session.user.id,
          categoryId,
          stock: otherFields.stock || 0,
          minOrder: otherFields.minOrder || 1,
          ...(otherFields.dimensions && { dimensions: JSON.stringify(otherFields.dimensions) }),
          ...(otherFields.colors && { colors: JSON.stringify(otherFields.colors) }),
          ...(otherFields.sizes && { sizes: JSON.stringify(otherFields.sizes) }),
          ...(otherFields.specifications && { specifications: JSON.stringify(otherFields.specifications) }),
          ...(otherFields.tags && { tags: JSON.stringify(otherFields.tags) }),
          ...(otherFields.brand && { brand: otherFields.brand }),
          ...(otherFields.model && { model: otherFields.model }),
          ...(otherFields.sku && { sku: otherFields.sku }),
          ...(otherFields.weight && { weight: otherFields.weight }),
          ...(otherFields.warranty && { warranty: otherFields.warranty }),
          ...(otherFields.returnPolicy && { returnPolicy: otherFields.returnPolicy }),
          ...(otherFields.shortDescription && { shortDescription: otherFields.shortDescription }),
          ...(otherFields.originalPrice && { originalPrice: otherFields.originalPrice }),
        },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    // Import demo data directly for now
    const { demoProducts, demoCategories, demoSellers } = await import('@/lib/demo-data');
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const brand = searchParams.get('brand');
    const featured = searchParams.get('featured');
    
    // Transform demo data to UI-friendly format (images array + imageUrl)
    let products = demoProducts.map(product => {
      const images = typeof product.imageUrls === 'string' 
        ? JSON.parse(product.imageUrls) 
        : product.imageUrls
      const category = demoCategories.find(cat => cat.id === product.categoryId)
      const seller = demoSellers.find(seller => seller.id === product.sellerId)
      return {
        ...product,
        images,
        imageUrl: Array.isArray(images) ? images[0] : images,
        category,
        seller,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }).filter(p => p.category && p.seller);

    // Apply filters
    if (category) {
      products = products.filter(p => p.category?.slug === category);
    }
    
    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }
    
    if (brand) {
      products = products.filter(p => p.brand?.toLowerCase().includes(brand.toLowerCase()));
    }
    
    if (featured === 'true') {
      products = products.filter(p => p.isFeatured);
    }

    // Apply sorting
    switch (sort) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      default:
        // newest first (default)
        break;
    }

    const res = NextResponse.json(products)
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return res
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}