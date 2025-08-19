import { ProductCard } from "@/components/product/product-card";
import { HeroSectionModern } from "@/components/ui/hero-section-modern";
import { demoProducts } from "@/lib/demo-data";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSectionModern />
      
      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Featured Products
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {demoProducts.slice(0, 8).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                size="md" 
                variant="market" 
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}