'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CartSheet } from './cart-sheet'
import { useCartStore } from '@/lib/cart-store'
import { ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CartButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showLabel?: boolean
}

export function CartButton({ 
  variant = 'ghost', 
  size = 'default',
  className,
  showLabel = false 
}: CartButtonProps) {
  const { totalItems, openCart } = useCartStore()

  return (
    <CartSheet>
      <Button 
        variant={variant} 
        size={size}
        className={cn("relative", className)}
        onClick={openCart}
      >
        <ShoppingCart className="h-4 w-4" />
        {showLabel && <span className="ml-2">Cart</span>}
        {totalItems > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        )}
      </Button>
    </CartSheet>
  )
}




