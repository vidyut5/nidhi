import { prisma } from './prisma.js';
import { demoCategories, demoProducts, demoSellers } from './demo-data.js';

export async function seedDemoData() {
  try {
    console.log('Starting demo data seeding...');

    // Clear existing data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.searchHistory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.sellerProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create categories
    console.log('Creating categories...');
    for (const category of demoCategories) {
      await prisma.category.create({
        data: category
      });
    }

    // Create demo users/sellers
    console.log('Creating sellers...');
    for (const seller of demoSellers) {
      await prisma.user.create({
        data: seller
      });
    }

    // Create products
    console.log('Creating products...');
    for (const product of demoProducts) {
      await prisma.product.create({
        data: product
      });
    }

    console.log('Demo data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}

// Only run if called directly
if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
