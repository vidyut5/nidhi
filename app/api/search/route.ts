import { NextResponse } from "next/server";

export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return new NextResponse("Missing query", { status: 400 });
    }

    // Import demo data directly for now
    const { demoProducts, demoCategories, demoSellers } = await import('@/lib/demo-data');
    
    // Search through products
    const searchQuery = query.toLowerCase();
    const matchingProducts = demoProducts
      .filter(product => 
        product.isActive && (
          product.name.toLowerCase().includes(searchQuery) ||
          product.description.toLowerCase().includes(searchQuery) ||
          product.brand?.toLowerCase().includes(searchQuery) ||
          product.model?.toLowerCase().includes(searchQuery)
        )
      )
      .map(product => ({
        ...product,
        category: demoCategories.find(cat => cat.id === product.categoryId),
        seller: demoSellers.find(seller => seller.id === product.sellerId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      .filter(p => p.category && p.seller);

    const res = NextResponse.json(matchingProducts)
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res
  } catch (error) {
    console.error(error);
    return new NextResponse("Something went wrong", { status: 500 });
  }
}
