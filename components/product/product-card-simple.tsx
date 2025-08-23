'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { WishlistButton } from '@/components/wishlist/wishlist-button'
import { Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImage {
  id: string
  url: string
  alt: string
}

interface ProductSeller {
  id: string
  name: string
  verified: boolean
}

interface ProductCategory {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  images: ProductImage[]
  brand?: string
  stock: number
  rating: number
  reviewCount: number
  isFeatured: boolean
  seller: ProductSeller
  category: ProductCategory
}

interface ProductCardProps {
  product: Product
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ProductCardSimple({ 
  product, 
  className, 
  size = 'md'
}: ProductCardProps) {
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
  
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const primaryImage = product.images[0]?.url || '/placeholder.svg'
  const imageAlt = product.images[0]?.alt || product.name

  const sizeConfig = {
    sm: { padding: 'p-3', titleSize: 'text-sm', priceSize: 'text-sm' },
    md: { padding: 'p-4', titleSize: 'text-base', priceSize: 'text-lg' },
    lg: { padding: 'p-6', titleSize: 'text-lg', priceSize: 'text-xl' }
  }[size]

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300", className)}>
      <CardContent className={sizeConfig.padding}>
        {/* Product Image */}
        <div className="relative mb-4 aspect-square rounded-lg overflow-hidden bg-muted">
          <Link href={`/product/${product.slug}`}>
            <Image
              src={primaryImage}
              alt={imageAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={false}
            />
          </Link>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && (
              <Badge variant="secondary" className="bg-blue-500 text-white text-xs">
                <TrendingUp className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
            {discount > 0 && (
              <Badge variant="destructive" className="bg-red-500 text-white text-xs">
                -{discount}% OFF
              </Badge>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="outline" className="bg-orange-500 text-white border-orange-500 text-xs">
                Low Stock
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <WishlistButton 
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                originalPrice: product.originalPrice,
                images: product.images.map(img => img.url),
                brand: product.brand,
                stock: product.stock,
                rating: product.rating,
                reviewCount: product.reviewCount,
                sellerId: product.seller.id,
                sellerName: product.seller.name,
              }} 
              variant="ghost" 
              size="icon"
              className="bg-white/90 hover:bg-white shadow-sm backdrop-blur-sm" 
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Category */}
          <div className="text-xs text-muted-foreground">
            <Link href={`/category/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className={cn(
              "font-medium line-clamp-2 hover:text-primary transition-colors",
              sizeConfig.titleSize
            )}>
              {product.name}
            </h3>
          </Link>

          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-muted-foreground">{product.brand}</p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className={cn("font-bold text-primary", sizeConfig.priceSize)}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>by {product.seller.name}</span>
            {product.seller.verified && (
              <Badge variant="outline" className="text-xs">Verified</Badge>
            )}
          </div>

          {/* Add to Cart */}
          <AddToCartButton 
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              stock: product.stock,
              slug: product.slug,
              imageUrls: product.images.map(img => img.url),
              sellerId: product.seller.id,
              sellerName: product.seller.name,
            }}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}


