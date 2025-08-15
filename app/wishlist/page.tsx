'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { WishlistButton } from '@/components/wishlist/wishlist-button'
import { useWishlistStore } from '@/lib/wishlist-store'
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Trash2, 
  Package,
  ArrowRight,
  Filter,
  Grid,
  List
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function WishlistPage() {
  const { items, totalItems, clearWishlist } = useWishlistStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('recent')

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      case 'recent':
      default:
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    }
  })

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-8">
            Save electrical products you like to easily find them later. Start browsing to build your wishlist!
          </p>
          <Button asChild>
            <Link href="/search">
              <Package className="mr-2 h-4 w-4" />
              Start Shopping
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-background text-sm"
          >
            <option value="recent">Recently Added</option>
            <option value="name">Name A-Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearWishlist}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Wishlist Items */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={item.imageUrl || '/placeholder.svg'}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  <div className="absolute top-2 right-2">
                    <WishlistButton 
                      product={{
                        id: item.id,
                        name: item.name,
                        slug: item.slug,
                        price: item.price,
                        originalPrice: item.originalPrice,
                        images: [item.imageUrl],
                        brand: item.brand,
                        stock: item.stock,
                        rating: item.rating,
                        reviewCount: item.reviewCount,
                        sellerId: item.sellerId,
                        sellerName: item.sellerName,
                      }} 
                      variant="ghost" 
                      className="bg-white/80 hover:bg-white shadow-sm" 
                    />
                  </div>
                  {item.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div>
                    <Link href={`/product/${item.slug}`}>
                      <h3 className="font-medium text-sm hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    {item.brand && (
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < Math.floor(item.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({item.reviewCount})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatPrice(item.price)}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <>
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                        </Badge>
                      </>
                    )}
                  </div>
                  
                   <AddToCartButton 
                    product={{
                      id: item.id,
                      name: item.name,
                      slug: item.slug,
                      price: item.price,
                      originalPrice: item.originalPrice,
                      imageUrls: JSON.stringify([item.imageUrl]),
                      brand: item.brand,
                      stock: item.stock,
                      sellerId: item.sellerId,
                      sellerName: item.sellerName,
                    }} 
                    size="sm"
                    className="w-full"
                    showQuantityControls={false}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.imageUrl || '/placeholder.svg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.slug}`}>
                          <h3 className="font-medium hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        {item.brand && (
                          <p className="text-sm text-muted-foreground">{item.brand}</p>
                        )}
                        
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < Math.floor(item.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({item.reviewCount})
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <WishlistButton product={{
                          id: item.id,
                          name: item.name,
                          slug: item.slug,
                          price: item.price,
                          originalPrice: item.originalPrice,
                          images: [item.imageUrl],
                          brand: item.brand,
                          stock: item.stock,
                          rating: item.rating,
                          reviewCount: item.reviewCount,
                          sellerId: item.sellerId,
                          sellerName: item.sellerName,
                        }} />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatPrice(item.price)}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(item.originalPrice)}
                            </span>
                            <Badge variant="destructive" className="text-xs">
                              {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                            </Badge>
                          </>
                        )}
                      </div>
                      
                      <AddToCartButton 
                        product={{
                          id: item.id,
                          name: item.name,
                          slug: item.slug,
                          price: item.price,
                          originalPrice: item.originalPrice,
                          imageUrls: JSON.stringify([item.imageUrl]),
                          brand: item.brand,
                          stock: item.stock,
                          sellerId: item.sellerId,
                          sellerName: item.sellerName,
                        }} 
                        size="sm"
                        showQuantityControls={false}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Continue Shopping */}
      <Separator className="my-8" />
      <div className="text-center">
        <Button asChild variant="outline">
          <Link href="/search">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

