import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const raw = await req.json();
    const nameRaw = typeof raw?.name === 'string' ? raw.name : '';
    const descriptionRaw = typeof raw?.description === 'string' ? raw.description : '';
    const priceRaw = raw?.price;
    const imageUrlsRaw = raw?.imageUrls;
    const categoryIdRaw = raw?.categoryId;

    const name = nameRaw.trim();
    const description = descriptionRaw.trim();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!description) return NextResponse.json({ error: 'Description is required' }, { status: 400 });

    const priceNum = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: 'Price must be a number greater than 0' }, { status: 400 });
    }

    // Normalize imageUrls to string[] and validate each URL
    const toArray = (val: unknown): unknown[] => Array.isArray(val) ? val : (val == null ? [] : [val]);
    const imagesNormalized = toArray(imageUrlsRaw)
      .filter((v): v is string => typeof v === 'string')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    const isValidUrl = (input: string) => {
      try {
        if (typeof input !== 'string') return false;
        const u = input.trim();
        if (u.length === 0 || u.length > 2048) return false;
        if (u.startsWith('/')) {
          // Relative paths to public assets are allowed
          return !u.startsWith('//');
        }
        const url = new URL(u);
        if (!url.hostname) return false;
        const protocol = url.protocol.toLowerCase();
        if (protocol !== 'http:' && protocol !== 'https:') return false;
        return true;
      } catch {
        return false;
      }
    };
    if (imagesNormalized.length === 0 || !imagesNormalized.every(isValidUrl)) {
      return NextResponse.json({ error: 'imageUrls must contain valid URLs' }, { status: 400 });
    }

    const categoryId = typeof categoryIdRaw === 'string' ? categoryIdRaw : String(categoryIdRaw ?? '');
    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId is required' }, { status: 400 });
    }

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
            price: priceNum,
            imageUrls: JSON.stringify(imagesNormalized),
            sellerId: session.user.id,
            categoryId,
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
          price: priceNum,
          imageUrls: JSON.stringify(imagesNormalized),
          sellerId: session.user.id,
          categoryId,
        },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Something went wrong", { status: 500 });
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
    console.error(error);
    return new NextResponse("Something went wrong", { status: 500 });
  }
}