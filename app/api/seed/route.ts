import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoCategories, demoProducts, demoSellers } from "@/lib/demo-data";

export async function POST(req: Request) {
  try {
    // Environment and auth guard: require non-production AND explicit opt-in
    const env = process.env.NODE_ENV;
    const seedEnabled = process.env.SEED_ENABLED === 'true';
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7)
      : undefined;
    const tokenMatches = typeof process.env.SEED_TOKEN === 'string' && bearerToken === process.env.SEED_TOKEN;
    if (env === 'production' || !(seedEnabled || tokenMatches)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Execute destructive operations in a single transaction
    const counts = await prisma.$transaction(async (tx) => {
      // Clear existing data in order to satisfy FKs
      await tx.orderItem.deleteMany();
      await tx.order.deleteMany();
      await tx.review.deleteMany();
      await tx.wishlistItem.deleteMany();
      await tx.searchHistory.deleteMany();
      await tx.product.deleteMany();
      await tx.category.deleteMany();
      await tx.sellerProfile.deleteMany();
      await tx.user.deleteMany();

      for (const category of demoCategories) {
        await tx.category.create({ data: category });
      }

      for (const seller of demoSellers) {
        await tx.user.create({ data: seller });
      }

      for (const product of demoProducts) {
        await tx.product.create({ data: product });
      }

      return {
        categories: demoCategories.length,
        sellers: demoSellers.length,
        products: demoProducts.length,
      };
    });

    return NextResponse.json({ message: 'Demo data seeded successfully', counts });
  } catch (error) {
    console.error('seed route error:', error);
    return new NextResponse("Seeding failed", { status: 500 });
  }
}

