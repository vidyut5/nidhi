"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { ShoppingCart, Minus, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  imageUrls: string[] | string
  brand?: string
  stock: number
  sellerId: string
  sellerName: string
}

interface AddToCartButtonProps {
  product: Product
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  showQuantityControls?: boolean
}

export function AddToCartButton({
  product,
  className,
  variant = "default",
  size = "default",
  showQuantityControls = true,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { items, addItem, updateQuantity, openCart } = useCartStore()

  // Find if product is already in cart
  const cartItem = items.find(item => item.id === product.id)
  const quantity = cartItem?.quantity || 0

  const handleAddToCart = async () => {
    setIsLoading(true)
    
    try {
      let imageUrls: string[] = []
      if (Array.isArray(product.imageUrls)) {
        imageUrls = product.imageUrls
      } else if (typeof product.imageUrls === 'string') {
        const str = product.imageUrls.trim()
        if (str.startsWith('[')) {
          try {
            const parsed = JSON.parse(str)
            imageUrls = Array.isArray(parsed) ? parsed : []
          } catch (e) {
            logger.error('Failed to parse imageUrls JSON', e instanceof Error ? e : undefined, { productId: product.id })
            imageUrls = []
          }
        } else if (str.length > 0) {
          imageUrls = [str]
        }
      }
      imageUrls = imageUrls.filter(u => typeof u === 'string' && u.trim().length > 0).map(u => u.trim())
      
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        imageUrl: imageUrls[0] || '/placeholder.svg',
        brand: product.brand,
        stock: product.stock,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
      })

      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    } catch (error) {
      logger.error('Error adding to cart', error instanceof Error ? error : undefined, { productId: product.id })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 0) return
    setIsLoading(true)
    
    try {
      updateQuantity(product.id, newQuantity)
    } catch (error) {
      logger.error('Error updating quantity', error instanceof Error ? error : undefined, { productId: product.id, newQuantity })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewCart = () => {
    openCart()
  }

  // If product is out of stock
  if (product.stock <= 0) {
    return (
      <Button
        disabled
        variant="outline"
        size={size}
        className={cn("gap-2", className)}
      >
        Out of Stock
      </Button>
    )
  }

  // If not in cart yet
  if (quantity === 0) {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
      >
        {justAdded ? (
          <>
            <Check className="h-4 w-4" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            {isLoading ? "Adding..." : "Add to Cart"}
          </>
        )}
      </Button>
    )
  }

  // If in cart and showing quantity controls
  if (showQuantityControls) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          onClick={() => handleUpdateQuantity(quantity - 1)}
          disabled={isLoading}
          variant="outline"
          size="icon"
          className="h-9 w-9"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[3rem] text-center font-medium">{quantity}</span>
        <Button
          onClick={() => handleUpdateQuantity(quantity + 1)}
          disabled={isLoading || quantity >= product.stock}
          variant="outline"
          size="icon"
          className="h-9 w-9"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleViewCart}
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80"
        >
          View Cart
        </Button>
      </div>
    )
  }

  // Simple "View Cart" button when not showing controls
  return (
    <Button
      onClick={handleViewCart}
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
    >
      <ShoppingCart className="h-4 w-4" />
      In Cart ({quantity})
    </Button>
  )
}

// Legacy support for old interface
export function LegacyAddToCartButton({ productId }: { productId: string }) {
  return (
    <Button disabled variant="outline">
      Add to Cart (Legacy)
    </Button>
  )
}