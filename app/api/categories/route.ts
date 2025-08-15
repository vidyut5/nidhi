import { NextResponse } from "next/server";

export const runtime = 'edge'

export async function GET() {
  try {
    // Import demo data directly for now
    const { demoCategories, demoProducts } = await import('@/lib/demo-data');
    
    const categoriesWithCounts = demoCategories.map(category => ({
      ...category,
      _count: {
        products: demoProducts.filter(product => 
          product.categoryId === category.id && product.isActive
        ).length
      }
    })).sort((a, b) => a.name.localeCompare(b.name));

    const res = NextResponse.json(categoriesWithCounts)
    res.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    return res
  } catch (error) {
    console.error(error);
    return new NextResponse("Something went wrong", { status: 500 });
  }
}
