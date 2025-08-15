'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { products as allProducts } from '@/lib/dummy-data'
import { Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TrendingPage() {
  const trending = [...allProducts]
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 24)

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  return (
    <div className="container-wide py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Trending Now</h1>
        <Button asChild variant="outline">
          <Link href="/category/all?sort=popular">View All</Link>
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {trending.map((p) => {
          const images = Array.isArray(p.images) ? p.images : [p.imageUrl]
          return (
            <Card key={p.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <Link href={`/product/${p.slug}`}>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image src={images[0]} alt={p.name} fill className="object-cover" />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Badge variant="destructive" className="text-xs flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Hot
                      </Badge>
                      {p.originalPrice && (
                        <Badge variant="secondary" className="text-xs">
                          -{Math.round((1 - p.price / p.originalPrice) * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="text-xs text-muted-foreground uppercase">{p.brand}</div>
                    <h3 className="font-semibold leading-tight line-clamp-2">{p.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="font-bold">{formatPrice(p.price)}</div>
                      {p.originalPrice && (
                        <div className="text-xs text-muted-foreground line-through">{formatPrice(p.originalPrice)}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn('h-3 w-3', i < Math.floor(p.rating) ? 'fill-yellow-400 text-yellow-400' : '')} />
                      ))}
                      <span>({p.reviewCount})</span>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}



