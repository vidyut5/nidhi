import { Suspense } from "react";
import Image from "next/image";
import { HeroSectionModern } from "@/components/ui/hero-section-modern";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getNewProducts } from "@/lib/dummy-data";
import { CategoriesCompact } from "@/components/home/categories-compact";
import { 
  Zap, 
  Package, 
  Lightbulb, 
  Wrench, 
  Shield, 
  Star,
  ArrowRight,
  TrendingUp,
  Users,
  Award
} from "lucide-react";

// Hero skeleton component
function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-96 bg-gray-200 rounded-lg"></div>
    </div>
  );
}

export default function Home() {
  const latestProducts = getNewProducts();
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  
  type ProductLike = {
    images?: unknown
    imageUrl?: unknown
    image_url?: unknown
  };

  function getProductImages(product: ProductLike | null | undefined): string[] {
    if (!product) return [];
    const { images, imageUrl, image_url } = product;
    if (Array.isArray(images)) {
      return images.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
    }
    if (typeof images === 'string' && images.trim().length > 0) {
      return [images];
    }
    if (typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
      return [imageUrl];
    }
    if (typeof image_url === 'string' && image_url.trim().length > 0) {
      return [image_url];
    }
    return [];
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Modern Hero Section */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSectionModern />
      </Suspense>

      {/* Categories Section - swap to compact grid matching /categories */}
      {/* Defer categories on first paint */}
      <Suspense fallback={null}>
        <CategoriesCompact />
      </Suspense>

      {/* Latest Products */}
      <section className="py-16 bg-gray-50" suppressHydrationWarning>
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Products</h2>
              <p className="text-gray-600">Recently added electrical solutions with images</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/category/all?sort=newest">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product as any} size="md" variant="market" />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">2,500+</div>
              <div className="text-blue-100">Verified Suppliers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Quality Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Cities Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Happy Customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Vidyut?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your trusted partner for all electrical needs with guaranteed quality and service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Guaranteed Quality</h3>
              <p className="text-gray-600">
                All products are tested and certified to meet the highest industry standards
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Best Prices</h3>
              <p className="text-gray-600">
                Competitive pricing with exclusive deals and bulk discounts for businesses
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Support</h3>
              <p className="text-gray-600">
                Get technical assistance from our team of certified electrical engineers
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}