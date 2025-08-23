'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useWishlistStore } from '@/lib/wishlist-store'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  images: string[]
  brand?: string
  stock: number
  rating: number
  reviewCount: number
  sellerId: string
  sellerName: string
}

interface WishlistButtonProps {
  product: Product
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  showLabel?: boolean
}

export function WishlistButton({
  product,
  className,
  variant = "ghost",
  size = "icon",
  showLabel = false
}: WishlistButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const { addItem, removeItem, isInWishlist } = useWishlistStore()
  
  const inWishlist = product ? isInWishlist(product.id) : false

  const handleToggleWishlist = () => {
    setIsAnimating(true)
    
    try {
      if (!product) return
      
      if (inWishlist) {
        removeItem(product.id)
      } else {
        const images = Array.isArray(product.images) ? product.images : []
        
        addItem({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          imageUrl: images[0] || '/placeholder.svg',
          brand: product.brand,
          stock: product.stock,
          rating: product.rating,
          reviewCount: product.reviewCount,
          sellerId: product.sellerId,
          sellerName: product.sellerName,
        })
      }
    } catch (error) {
      logger.error('Error toggling wishlist', error instanceof Error ? error : undefined, { productId: product?.id })
    } finally {
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleWishlist}
      className={cn(
        "group relative",
        isAnimating && "animate-pulse",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-all duration-200",
          inWishlist && "fill-red-500 text-red-500",
          !inWishlist && "group-hover:text-red-500",
          isAnimating && "scale-110"
        )} 
      />
      {showLabel && (
        <span className="ml-2">
          {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </Button>
  )
}
