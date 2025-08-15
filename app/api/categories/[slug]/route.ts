import { NextResponse } from "next/server";

export const runtime = 'nodejs'

export async function GET(_req: Request, context: any) {
  try {
    const { slug } = context.params as { slug: string };
    
    // Import demo data directly for now
    const { demoProducts, demoCategories, demoSellers } = await import('@/lib/demo-data');
    
    const category = demoCategories.find(cat => cat.slug === slug);
    
    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Get products for this category
    const categoryProducts = demoProducts
      .filter(product => product.categoryId === category.id && product.isActive)
      .map(product => ({
        ...product,
        category: category,
        seller: demoSellers.find(seller => seller.id === product.sellerId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      .filter(p => p.seller);

    const categoryWithProducts = {
      ...category,
      products: categoryProducts,
      _count: {
        products: categoryProducts.length
      }
    };

    const res = NextResponse.json(categoryWithProducts)
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return res
  } catch (error) {
    console.error(error);
    return new NextResponse("Something went wrong", { status: 500 });
  }
}
