'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { WishlistButton } from '@/components/wishlist/wishlist-button'
import { Star, Eye, TrendingUp, MapPin, ShieldCheck, BadgeCheck, Phone, MessageCircle, CheckCircle2 } from 'lucide-react'
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
  unitLabel?: string // e.g., "/Piece", "/Unit"
  location?: string // e.g., "Hyderabad - Begum Bazar Old Feelkhana"
  gstVerified?: boolean
  trustSeal?: boolean
  memberYears?: number
  responseRatePercent?: number // 81 means 81%
  supportsCall?: boolean
  supportsWhatsapp?: boolean
  category?: {
    id: string
    name: string
    slug: string
  }
}

// Broad product-like input accepted by the card; we normalize internally
type ProductLike = Partial<Product> & {
  id?: string | number
  name?: string
  slug?: string
  price?: number
  images?: unknown
  imageUrl?: unknown
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.1 17.5c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.1-.3.2-.5 0-.2 0-.4 0-.6 0-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.3-.3.3-1 1-1 2.4 0 1.4 1.1 2.7 1.3 2.9.1.2 2.2 3.4 5.3 4.7 3.2 1.3 3.2.9 3.8.9.6 0 1.9-.7 2.2-1.5.3-.7.3-1.3.2-1.5-.1-.2-.3-.2-.6-.3z"/>
      <path d="M27.5 16c0 6.3-5.2 11.5-11.5 11.5-2 0-4-.5-5.7-1.5L6 27l1-4.2C5.9 21 5.4 18.6 5.4 16 5.4 9.7 10.6 4.5 16.9 4.5S27.5 9.7 27.5 16zM16 6.8c-5 0-9.1 4.1-9.1 9.1 0 2 .6 3.8 1.6 5.3l-.9 3.3 3.4-.9c1.4.9 3.1 1.4 4.9 1.4 5 0 9.1-4.1 9.1-9.1S21 6.8 16 6.8z"/>
    </svg>
  )
}

interface ProductCardProps {
  product: ProductLike
  className?: string
  showQuickActions?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'compact' | 'detailed' | 'market'
}

export function ProductCard({ 
  product, 
  className, 
  showQuickActions = true,
  size = 'md',
  variant = 'compact'
}: ProductCardProps) {
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
  
  // Normalize images from various shapes
  const imagesRaw = (product as any)?.images
  const images = Array.isArray(imagesRaw)
    ? imagesRaw.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    : (typeof (product as any)?.imageUrl === 'string' && (product as any).imageUrl
      ? [(product as any).imageUrl as string]
      : [])
  const primaryImage = images[0] || '/product-1.jpg'
  const nameSafe: string = String(((product as any)?.name ?? 'Product'))

  // Normalize numeric fields with safe fallbacks
  const priceValue: number = typeof (product as any)?.price === 'number' ? (product as any).price : Number((product as any)?.price ?? 0)
  const originalPriceValue: number = typeof (product as any)?.originalPrice === 'number' ? (product as any).originalPrice : Number((product as any)?.originalPrice ?? 0)
  const ratingValue: number = typeof (product as any)?.rating === 'number' ? (product as any).rating : 0
  const reviewCountValue: number = typeof (product as any)?.reviewCount === 'number' ? (product as any).reviewCount : 0
  
  // No console logging in production
  
  const discount = (originalPriceValue > 0) 
    ? Math.round((1 - priceValue / originalPriceValue) * 100)
    : 0

  const cardSizes = {
    sm: {
      imageAspect: 'aspect-square',
      textSize: 'text-[11px]',
      titleSize: 'text-sm',
      priceSize: 'text-sm',
      padding: 'p-3',
    },
    md: {
      imageAspect: 'aspect-square',
      textSize: 'text-xs',
      titleSize: 'text-[15px]',
      priceSize: 'text-base',
      padding: 'p-3',
    },
    lg: {
      imageAspect: 'aspect-[4/3]',
      textSize: 'text-sm',
      titleSize: 'text-lg',
      priceSize: 'text-lg',
      padding: 'p-6',
    }
  }

  const sizeConfig = cardSizes[size]

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 rounded-2xl", className)}>
      <CardContent className={sizeConfig.padding}>
        {/* Product Image */}
        <div className={cn("relative mb-3 rounded-xl overflow-hidden bg-muted", sizeConfig.imageAspect)}>
          <Link href={`/product/${product.slug}`}>
            <Image
              src={primaryImage}
              alt={nameSafe}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
              className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
              priority={false}
              placeholder="blur"
              blurDataURL="/placeholder.svg"
            />
          </Link>
          {/* Image dots (gallery indicator) */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-full">
              {images.slice(0,5).map((_, idx) => (
                <span key={idx} className={cn("h-1.5 w-1.5 rounded-full", idx === 0 ? "bg-white" : "bg-white/60")} />
              ))}
            </div>
          )}
          {/* No add-to-cart overlay in compact; CTAs handled in market variant */}
          
          {/* Quick Actions */}
          {showQuickActions && (
            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <WishlistButton 
                product={{
                  id: String((product as any)?.id ?? ''),
                  name: nameSafe,
                  slug: String((product as any)?.slug ?? ''),
                  price: priceValue,
                  originalPrice: originalPriceValue || undefined,
                  images: images,
                  brand: (product as any)?.brand,
                  stock: Number((product as any)?.stock ?? 0),
                  rating: ratingValue,
                  reviewCount: reviewCountValue,
                  sellerId: String((product as any)?.sellerId ?? ''),
                  sellerName: String((product as any)?.sellerName ?? ''),
                }} 
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
            {Number((product as any)?.stock ?? 0) <= 5 && Number((product as any)?.stock ?? 0) > 0 && (
              <Badge variant="outline" className="bg-orange-500/90 text-white border-orange-500 text-xs">
                Low Stock
              </Badge>
            )}
            {Number((product as any)?.stock ?? 0) <= 0 && (
              <Badge variant="outline" className="bg-gray-500/90 text-white border-gray-500 text-xs">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="space-y-1.5">
          {/* Brand */}
          {variant === 'detailed' && product.brand && (
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
          {variant === 'detailed' && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < Math.floor(ratingValue)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className={cn("text-muted-foreground", sizeConfig.textSize)}>
                {ratingValue.toFixed(1)} ({reviewCountValue})
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
          )}

          {/* Market meta (hide when no ratings) */}
          {variant === 'market' && ratingValue > 0 && reviewCountValue > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < Math.floor(ratingValue)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className={cn("text-muted-foreground", sizeConfig.textSize)}>
                {ratingValue.toFixed(1)} ({reviewCountValue})
              </span>
            </div>
          )}
          
          {/* Price */}
          <div className={cn(
            "flex items-center gap-1.5 flex-wrap",
            variant === 'market' ? 'justify-between' : 'justify-start'
          )}>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className={cn("font-bold text-primary", sizeConfig.priceSize)}>
                {formatPrice(priceValue)}
              </span>
              {(product.unitLabel || (variant === 'market' ? '/Unit' : '')) && (
                <span className={cn("text-muted-foreground", sizeConfig.textSize)}>
                  {product.unitLabel || '/Unit'}
                </span>
              )}
              {originalPriceValue > 0 && originalPriceValue > priceValue && (
                <span className={cn("text-muted-foreground line-through", sizeConfig.textSize)}>
                  {formatPrice(originalPriceValue)}
                </span>
              )}
            </div>
            {variant === 'market' && (
              <Button size="sm" className="hidden lg:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 whitespace-nowrap shrink-0">
                Contact Supplier
              </Button>
            )}
          </div>
          
          {/* Seller Info */}
          {(variant === 'detailed' || variant === 'market') && product.sellerName && (
            <p className={cn("text-muted-foreground", sizeConfig.textSize)}>
              {product.sellerName}
            </p>
          )}
          
          {/* Location & badges for market */}
          {variant === 'market' && (
            <div className="space-y-1">
              {product.location && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className={cn(sizeConfig.textSize)}>{product.location}</span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {product.gstVerified && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="text-[11px]">GST</span>
                  </div>
                )}
                {product.trustSeal && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 border border-amber-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="text-[11px]">TrustSEAL Verified</span>
                  </div>
                )}
                {typeof product.memberYears === 'number' && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-slate-700 border border-slate-200">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    <span className="text-[11px]">Member: {product.memberYears} yrs</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View Mobile Number + response rate */}
          {variant === 'market' && (
            <div className="flex items-center gap-2 pt-1">
              <button type="button" className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[12px] underline-offset-2 hover:underline">
                <Phone className="h-4 w-4" />
                View Mobile Number
              </button>
              {typeof product.responseRatePercent === 'number' && (
                <span className="text-muted-foreground text-[12px]">({product.responseRatePercent}% Response Rate)</span>
              )}
            </div>
          )}

          {/* CTAs for market: Call, WhatsApp, Message (shown on all breakpoints) */}
          {variant === 'market' && (
            <div className="mt-2 grid grid-cols-3 gap-2 w-full min-w-0">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-2.5 py-0 h-8 text-[11px] leading-none w-full min-w-0 truncate justify-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                <span className="truncate">Call</span>
              </Button>
              <Button variant="outline" className="rounded-full px-2.5 py-0 h-8 text-[11px] leading-none w-full min-w-0 truncate justify-center gap-1 text-white" style={{ backgroundColor: '#25D366' }}>
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span className="truncate">WhatsApp</span>
              </Button>
              <Button variant="secondary" className="rounded-full px-2.5 py-0 h-8 text-[11px] leading-none w-full min-w-0 truncate justify-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="truncate">Message</span>
              </Button>
            </div>
          )}

          {/* Compact variant icon-only CTAs */}
          {variant === 'compact' && (
            <div className="mt-2 flex items-center gap-2">
              <Button size="icon" className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-8 w-8 rounded-full text-white" style={{ backgroundColor: '#25D366' }}>
                <WhatsAppIcon className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* No add-to-cart anywhere as per requirement */}
        </div>
      </CardContent>
    </Card>
  )
}
