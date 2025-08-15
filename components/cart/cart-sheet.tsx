'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { useCartStore } from '@/lib/cart-store'
import { ShoppingCart, Minus, Plus, X, Package, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CartSheetProps {
  children?: React.ReactNode
}

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

export function CartSheet({ children }: CartSheetProps) {
  const { 
    items, 
    isOpen, 
    totalItems, 
    totalPrice, 
    updateQuantity, 
    removeItem, 
    closeCart,
    openCart 
  } = useCartStore()

  

  if (children) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => open ? openCart() : closeCart()}>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <CartContent />
      </Sheet>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => open ? openCart() : closeCart()}>
      <CartContent />
    </Sheet>
  )
}

function CartContent() {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    updateQuantity, 
    removeItem, 
    clearCart 
  } = useCartStore()

  

  return (
    <SheetContent className="flex flex-col w-full sm:max-w-lg">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Shopping Cart
          {totalItems > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Badge>
          )}
        </SheetTitle>
        <SheetDescription>
          {items.length === 0 
            ? "Your cart is empty. Start shopping to add items!"
            : "Review your items and proceed to checkout"
          }
        </SheetDescription>
      </SheetHeader>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Looks like you haven't added any electrical products yet. Start shopping to fill your cart!
          </p>
          <Button asChild className="w-full max-w-xs">
            <Link href="/search">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Start Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <div className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  {/* Product Image */}
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.imageUrl || '/placeholder.svg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.name}</h4>
                        {item.brand && (
                          <p className="text-xs text-muted-foreground">{item.brand}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold">{formatPrice(item.price)}</span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Stock: {item.stock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Cart Summary */}
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <div className="space-y-2">
              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/search">
                  Continue Shopping
                </Link>
              </Button>
            </div>

            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-destructive"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        </>
      )}
    </SheetContent>
  )
}



