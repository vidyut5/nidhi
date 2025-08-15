"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { products } from '@/lib/dummy-data'
import { useCartStore } from '@/lib/cart-store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Truck, 
  Shield, 
  Award,
  Package,
  ArrowLeft,
  Share,
  Plus,
  Minus,
  Zap,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const params = useParams()
  const productParam = params.id as string
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  
  const { addItem: addToCart } = useCartStore()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()
  
  // Try API first for a real product; fallback to demo
  const [product, setProduct] = useState(() => products.find(p => p.id === productParam || p.slug === productParam))
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(productParam)}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && data) {
          setProduct({
            ...product,
            ...(data || {}),
            images: Array.isArray(data.images) ? data.images : (typeof data.imageUrl === 'string' ? [data.imageUrl] : []),
          } as any)
        }
      } catch {}
    }
    run()
    return () => { cancelled = true }
  }, [productParam])
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product not found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/category/all">Browse All Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
  const isInWishlistCheck = isInWishlist(product.id)
  const savings = product.originalPrice ? product.originalPrice - product.price : 0
  // Seller info (demo)
  const seller = {
    id: 'seller-demo',
    name: product.brand || 'Demo Seller',
    email: 'seller@example.com',
    avatar: '',
    location: 'India',
    phone: '+91 90000 00000',
    isVerified: true,
    tier: 'Gold',
    totalSales: 500000,
    totalOrders: 1200,
    rating: 4.8,
  }
  
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/product-1.jpg'),
      brand: product.brand,
      stock: product.stock,
      sellerId: 'demo',
      sellerName: 'Demo Seller'
    })
  }

  const handleWishlistToggle = () => {
    if (isInWishlistCheck) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        imageUrl: (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/product-1.jpg'),
        brand: product.brand,
        stock: product.stock,
        rating: product.rating,
        reviewCount: product.reviewCount,
        sellerId: 'demo',
        sellerName: 'Demo Seller'
      })
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({product.reviewCount} reviews)</span>
      </div>
    )
  }

  // Related products (same category)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb & Back Button */}
      <div className="bg-white border-b">
        <div className="container-wide py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/category/all">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700">Home</Link>
              <span className="mx-2">/</span>
              <Link href={`/category/${product.category}`} className="hover:text-gray-700 capitalize">
                {product.category.replace('-', ' ')}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{product.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-xl border overflow-hidden">
              <Image
                src={(Array.isArray(product.images) && typeof product.images[selectedImage] === 'string' && product.images[selectedImage]) || '/product-1.jpg'}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            
            {/* Thumbnail Navigation */}
              <div className="flex gap-2">
                {(Array.isArray(product.images) ? product.images : []).map((imgSrc, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "p-0 w-16 h-16 border-2 rounded-lg overflow-hidden relative",
                    selectedImage === index ? "border-blue-500" : "border-gray-200"
                  )}
                  aria-label={`Show image ${index + 1}`}
                >
                  <Image
                      src={(imgSrc && typeof imgSrc === 'string') ? imgSrc : '/product-1.jpg'}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </Button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Brand & Title */}
            <div>
              <div className="text-sm text-blue-600 font-medium mb-2">{product.brand}</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              {renderStars(product.rating)}
            </div>

            {/* Price Section */}
            <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded-r-lg">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-green-700">
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice && (
                  <div className="space-y-1">
                    <div className="text-lg text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Save {formatPrice(savings)} ({product.discount}% off)
                    </div>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Inclusive of all taxes • Free shipping on orders above ₹5,000
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700 font-medium">In Stock</span>
                  <span className="text-gray-500">({product.stock} available)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Key Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Key Features:</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Quantity:</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-500">Max {product.stock} per order</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleWishlistToggle}
                  className={cn(isInWishlistCheck && "text-red-500 border-red-200")}
                >
                  <Heart className={cn("h-5 w-5", isInWishlistCheck && "fill-red-500")} />
                </Button>
                <Button variant="outline" size="lg">
                  <Share className="h-5 w-5" />
                </Button>
              </div>
              
              <Button variant="secondary" size="lg" className="w-full">
                <Zap className="mr-2 h-5 w-5" />
                Buy Now
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center">
                <Truck className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-sm font-medium">Free Shipping</div>
                <div className="text-xs text-gray-500">On orders above ₹5,000</div>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium">1 Year Warranty</div>
                <div className="text-xs text-gray-500">Manufacturer warranty</div>
              </div>
              <div className="text-center">
                <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-sm font-medium">Certified Quality</div>
                <div className="text-xs text-gray-500">BIS approved</div>
              </div>
            </div>
            {/* Seller Profile */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={seller.avatar} />
                    <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{seller.name}</div>
                        <div className="text-sm text-muted-foreground">{seller.location}</div>
                      </div>
                      <Badge variant="secondary">{seller.tier}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div>Rating: <span className="font-medium">{seller.rating.toFixed(1)}</span></div>
                      <div>Orders: <span className="font-medium">{seller.totalOrders.toLocaleString('en-IN')}</span></div>
                      <div>Sales: <span className="font-medium">₹{seller.totalSales.toLocaleString('en-IN')}</span></div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm">Contact Seller</Button>
                      <Button size="sm" asChild>
                        <Link href={`/seller/${encodeURIComponent(seller.name.toLowerCase().replace(/\s+/g,'-'))}`}>View Seller Profile</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {product.description}
                  </p>
                  <div className="space-y-4">
                    <h4 className="font-medium">Features & Benefits:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        High-quality construction with premium materials
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Easy installation with detailed instructions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Energy efficient and environmentally friendly
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Suitable for both residential and commercial use
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-700">{key}</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Customer Reviews</h3>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Write Review
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Sample Reviews */}
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="border-b pb-6">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {['R', 'P', 'A'][index]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {['Rajesh Kumar', 'Priya Sharma', 'Amit Patel'][index]}
                            </div>
                            <div className="flex items-center gap-2">
                              {renderStars(5 - index)}
                              <span className="text-sm text-gray-500">
                                {['2 days ago', '1 week ago', '2 weeks ago'][index]}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">
                          {[
                            'Excellent product! Great quality and works perfectly. Highly recommended for anyone looking for reliable electrical components.',
                            'Good value for money. Easy to install and works as expected. Would buy again.',
                            'Decent product but could be better. Works fine for basic needs.'
                          ][index]}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <Button variant="ghost" size="sm" className="h-auto p-0 flex items-center gap-1 text-gray-500 hover:text-gray-700">
                            <ThumbsUp className="h-4 w-4" />
                            Helpful ({12 - index * 4})
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Shipping & Returns</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Shipping Information</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Free shipping on orders above ₹5,000</li>
                        <li>• Standard delivery in 3-5 business days</li>
                        <li>• Express delivery available at additional cost</li>
                        <li>• Pan-India delivery available</li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Return Policy</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• 30-day return policy for unused items</li>
                        <li>• Original packaging required for returns</li>
                        <li>• Return shipping costs may apply</li>
                        <li>• Refunds processed within 5-7 business days</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                      <Link href={`/product/${relatedProduct.slug}`}>
                        <div className="relative aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                          <Image
                            src={Array.isArray(relatedProduct.images) && relatedProduct.images[0]
                              ? relatedProduct.images[0]
                              : '/product-1.jpg'}
                            alt={relatedProduct.name}
                            fill
                            sizes="(max-width: 1024px) 50vw, 20vw"
                            className="object-cover"
                          />
                        </div>
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {relatedProduct.brand}
                        </div>
                        <h3 className="font-medium line-clamp-2">{relatedProduct.name}</h3>
                        <div className="font-bold">{formatPrice(relatedProduct.price)}</div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}