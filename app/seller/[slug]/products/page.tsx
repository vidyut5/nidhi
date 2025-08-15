"use client"

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  imageUrl?: string
  images?: string[]
  brand?: string
  rating?: number
  reviewCount?: number
}

export default function SellerProductsCatalog() {
  const params = useParams()
  const slug = (params.slug as string) || ''
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest')
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        // Use public products API as a first pass until a dedicated seller endpoint exists
        const res = await fetch(`/api/products?sort=newest`, { cache: 'no-store' })
        const data = await res.json()
        if (cancelled) return
        // Filter by normalized seller slug equality
        const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const target = normalize(decodeURIComponent(slug))
        const filtered: Product[] = (Array.isArray(data) ? data : []).filter((p: any) => {
          const sellerName = p?.seller?.name || p?.sellerName || ''
          if (typeof sellerName !== 'string') return false
          const sellerSlug = normalize(sellerName)
          return sellerSlug === target
        }).map((p: any) => ({
          id: String(p.id),
          name: String(p.name),
          slug: String(p.slug || p.id),
          price: Number(p.price || 0),
          imageUrl: Array.isArray(p.images) && p.images[0] ? p.images[0] : (typeof p.imageUrl === 'string' ? p.imageUrl : undefined),
          images: Array.isArray(p.images) ? p.images : undefined,
          brand: typeof p.brand === 'string' ? p.brand : undefined,
          rating: Number(p.rating || 0),
          reviewCount: Number(p.reviewCount || 0),
        }))
        setItems(filtered)
      } catch {
        setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  const formatPrice = (v: number) => `₹${Number(v || 0).toLocaleString('en-IN')}`

  const visible = useMemo(() => {
    let res = items
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      res = res.filter(p => p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q))
    }
    switch (sortBy) {
      case 'price-low':
        return [...res].sort((a, b) => a.price - b.price)
      case 'price-high':
        return [...res].sort((a, b) => b.price - a.price)
      case 'popular':
        return [...res].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      default:
        return res
    }
  }, [items, query, sortBy])

  return (
    <div className="container-wide py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Sold by {decodeURIComponent(slug).replace(/-/g, ' ')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} className="w-56" />
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading...</div>
      ) : visible.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-muted-foreground mb-2">No products found</div>
          <Button asChild variant="outline"><Link href={`/seller/${slug}`}>Back to Seller</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map(p => (
            <Card key={p.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link href={`/product/${p.slug}`}>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                    <Image src={p.imageUrl || '/product-1.jpg'} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="space-y-1">
                    {p.brand && <div className="text-xs text-muted-foreground uppercase">{p.brand}</div>}
                    <div className="font-medium line-clamp-2">{p.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{formatPrice(p.price)}</div>
                      {typeof p.reviewCount === 'number' && p.reviewCount > 0 && (
                        <Badge variant="secondary" className="text-xs">{p.reviewCount} reviews</Badge>
                      )}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


