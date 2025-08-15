'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { WishlistButton } from '@/components/wishlist/wishlist-button'
import { Star, Eye, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  images: string[]
  brand?: string
  model?: string
  stock: number
  rating: number
  reviewCount: number
  salesCount?: number
  views?: number
  isActive: boolean
  isFeatured: boolean
  sellerId: string
  sellerName: string
  category?: {
    id: string
    name: string
    slug: string
  }
}

interface ProductCardProps {
  product: Product
  className?: string
  showQuickActions?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProductCard({ 
  product, 
  className, 
  showQuickActions = true,
  size = 'md'
}: ProductCardProps) {
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
  
  const images = Array.isArray(product.images) ? product.images : []
  const primaryImage = images[0] || '/product-1.jpg'
  
  // No console logging in production
  
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const cardSizes = {
    sm: {
      imageAspect: 'aspect-square',
      textSize: 'text-xs',
      titleSize: 'text-sm',
      priceSize: 'text-sm',
      padding: 'p-3',
    },
    md: {
      imageAspect: 'aspect-square',
      textSize: 'text-sm',
      titleSize: 'text-base',
      priceSize: 'text-base',
      padding: 'p-4',
    },
    lg: {
      imageAspect: 'aspect-[4/3]',
      textSize: 'text-base',
      titleSize: 'text-lg',
      priceSize: 'text-lg',
      padding: 'p-6',
    }
  }

  const sizeConfig = cardSizes[size]

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300 hover:-translate-y-1", className)}>
      <CardContent className={sizeConfig.padding}>
        {/* Product Image */}
        <div className={cn("relative mb-4 rounded-lg overflow-hidden bg-muted", sizeConfig.imageAspect)}>
          <Link href={`/product/${product.slug}`}>
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={false}
              placeholder="blur"
              blurDataURL="/placeholder.svg"
            />
          </Link>
          
          {/* Quick Actions */}
          {showQuickActions && (
            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <WishlistButton 
                product={product} 
                variant="ghost" 
                size="icon"
                className="bg-white/90 hover:bg-white shadow-sm backdrop-blur-sm" 
              />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && (
              <Badge variant="secondary" className="bg-blue-500/90 text-white text-xs">
                <TrendingUp className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
            {discount > 0 && (
              <Badge variant="destructive" className="bg-red-500/90 text-white text-xs">
                -{discount}% OFF
              </Badge>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="outline" className="bg-orange-500/90 text-white border-orange-500 text-xs">
                Low Stock
              </Badge>
            )}
            {product.stock <= 0 && (
              <Badge variant="outline" className="bg-gray-500/90 text-white border-gray-500 text-xs">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="space-y-2">
          {/* Brand */}
          {product.brand && (
            <p className={cn("text-muted-foreground font-medium", sizeConfig.textSize)}>
              {product.brand}
            </p>
          )}
          
          {/* Product Name */}
          <Link href={`/product/${product.slug}`}>
            <h3 className={cn(
              "font-semibold hover:text-primary transition-colors line-clamp-2",
              sizeConfig.titleSize
            )}>
              {product.name}
            </h3>
          </Link>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
            <span className={cn("text-muted-foreground", sizeConfig.textSize)}>
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
            {product.views && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-muted-foreground" />
                  <span className={cn("text-muted-foreground", sizeConfig.textSize)}>
                    {product.views}
                  </span>
                </div>
              </>
            )}
          </div>
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className={cn("font-bold text-primary", sizeConfig.priceSize)}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className={cn("text-muted-foreground line-through", sizeConfig.textSize)}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          {/* Seller Info */}
          <p className={cn("text-muted-foreground", sizeConfig.textSize)}>
            by {product.sellerName}
          </p>
          
          {/* Add to Cart */}
          <div className="pt-2">
            <AddToCartButton 
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                originalPrice: product.originalPrice,
                imageUrls: (images.length ? images : [primaryImage]).filter((u): u is string => typeof u === 'string' && u.trim().length > 0),
                brand: product.brand,
                stock: product.stock,
                sellerId: product.sellerId,
                sellerName: product.sellerName,
              }}
              className="w-full"
              size={size === 'lg' ? 'default' : 'sm'}
              showQuantityControls={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
