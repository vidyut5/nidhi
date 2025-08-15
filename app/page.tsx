import { Suspense } from "react";
import Image from "next/image";
import { HeroSectionModern } from "@/components/ui/hero-section-modern";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            {latestProducts.slice(0, 4).map((product) => {
              const images = getProductImages(product as unknown as ProductLike)
              const primaryImage = images[0] ?? '/product-1.jpg'
              return (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {product.isNew && (
                      <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs">
                        New
                      </Badge>
                    )}
                    {product.discount && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
                        {product.discount}% OFF
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      {product.brand}
                    </div>
                    <h3 className="font-medium line-clamp-2">{product.name}</h3>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg">{formatPrice(product.price)}</div>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button className="w-full" size="sm" asChild>
                      <Link href={`/product/${product.slug}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )})}
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