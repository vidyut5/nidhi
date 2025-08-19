"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductCard as UniversalProductCard } from '@/components/product/product-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { demoSellers, demoProducts, demoReviews } from '@/lib/demo-data'
import { Star, MapPin, Phone, Mail, Shield, Clock, Store, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SellerProfileClientProps {
  slug: string
}

export default function SellerProfileClient({ slug }: SellerProfileClientProps) {
  const nameFromSlug = decodeURIComponent(slug).replace(/-/g, ' ')

  const seller = useMemo(() => {
    const byName = demoSellers.find(s => s.name.toLowerCase() === nameFromSlug.toLowerCase())
    return byName || demoSellers[0]
  }, [nameFromSlug])

  const products = demoProducts
    .filter(p => p.sellerId === seller.id)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: (() => {
        if (Array.isArray(p.imageUrls)) return (p.imageUrls as any)[0]
        try {
          const arr = JSON.parse(p.imageUrls as unknown as string)
          return Array.isArray(arr) ? arr[0] : undefined
        } catch {
          return undefined
        }
      })(),
      slug: p.slug,
    }))

  const formatPrice = (v: number) => `₹${v.toLocaleString('en-IN')}`
  const totalSold = demoProducts.filter(p => p.sellerId === seller.id).reduce((sum, p: any) => sum + (p.salesCount || 0), 0)
  const feedback = Math.min(99, Math.round((seller.rating as number / 5) * 100))
  const reviews = demoReviews.filter(r => products.some(p => p.id === r.productId)).slice(0, 3)

  const avatarUrl = (seller as any).avatar || '/placeholder.svg'

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Profile Header - gradient like state/discom profiles */}
      <Card className="mb-6 overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl shadow-elevation-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white/20">
              <AvatarImage src={avatarUrl} alt={seller.name} />
              <AvatarFallback className="text-lg font-bold bg-white/20 text-white">
                {seller.name.split(' ').map(w => w[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{seller.name}</h1>
              <p className="text-blue-100">{seller.bio || 'Leading supplier of electrical goods'}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <MapPin className="h-3 w-3 mr-1" /> {seller.location}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Users className="h-3 w-3 mr-1" /> {seller.totalOrders.toLocaleString('en-IN')} Orders
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Star className="h-3 w-3 mr-1 fill-yellow-300 text-yellow-300" /> {(seller.rating as number).toFixed(1)} / 5
                </Badge>
                {seller.isVerified && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    <Shield className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Effort-based layout: left products, right info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Products */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Products ({products.length})</h2>
            <Button asChild variant="outline"><Link href={`/seller/${encodeURIComponent(slug)}/products`}>View all</Link></Button>
          </div>
          <div id="products" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map(p => (
              <UniversalProductCard key={p.id} product={{ ...p, images: p.image ? [p.image] : [] } as any} size="md" variant="market" />
            ))}
          </div>
        </div>

        {/* Right: Info cards */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle>Business Statistics</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-blue-50">
                  <div className="text-lg font-bold text-blue-600">{(totalSold ?? 0).toLocaleString('en-IN')}+</div>
                  <div className="text-xs text-muted-foreground">Sold</div>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <div className="text-lg font-bold text-green-600">{feedback}%</div>
                  <div className="text-xs text-muted-foreground">Feedback</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <div className="text-lg font-bold text-purple-600">5+</div>
                  <div className="text-xs text-muted-foreground">Years</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{seller.email}</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{seller.phone}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{seller.location}</div>
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" />Tier: {seller.tier}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />Mon-Sat: 9:00 AM - 8:00 PM</div>
            </CardContent>
          </Card>

          {reviews.length > 0 && (
            <Card className="rounded-2xl">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Recent Reviews</CardTitle>
                <Button variant="ghost" asChild><Link href="#reviews">View All</Link></Button>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {reviews.map((r, idx) => (
                  <div key={r.id} className={idx > 0 ? 'pt-4 border-t' : ''}>
                    <div className="font-medium">{['Rahul S.','Priya M.','Amit K.'][idx % 3]}</div>
                    <div className="flex items-center gap-1 text-yellow-500 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <div className="text-muted-foreground">{r.comment}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Company Updates & Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[{id:'1',type:'announcement',title:'New Product Line Launched',content:'Introducing our latest range of smart electrical components.',timestamp:'2 days ago'},{id:'2',type:'update',title:'Warehouse Expansion',content:'We have expanded our Mumbai warehouse to serve you faster.',timestamp:'1 week ago'}].map(post => (
                <div key={post.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={avatarUrl} alt={seller.name} />
                      <AvatarFallback className="text-sm font-bold">{seller.name.split(' ').map(w=>w[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{seller.name}</div>
                      <div className="text-sm text-muted-foreground">{post.timestamp}</div>
                    </div>
                    <Badge variant={post.type === 'announcement' ? 'destructive' : 'default'}>{post.type}</Badge>
                  </div>
                  <div className="font-semibold">{post.title}</div>
                  <div className="text-sm text-muted-foreground">{post.content}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Reviews</CardTitle>
            <Button variant="ghost" asChild><Link href="#reviews">View All</Link></Button>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {reviews.map((r, idx) => (
              <div key={r.id} className={idx > 0 ? 'pt-4 border-t' : ''}>
                <div className="font-medium">{['Rahul S.','Priya M.','Amit K.'][idx % 3]}</div>
                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <div className="text-muted-foreground">{r.comment}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Company Updates & Announcements - mirrors state/discom posts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Company Updates & Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[{id:'1',type:'announcement',title:'New Product Line Launched',content:'Introducing our latest range of smart electrical components.',timestamp:'2 days ago'},{id:'2',type:'update',title:'Warehouse Expansion',content:'We have expanded our Mumbai warehouse to serve you faster.',timestamp:'1 week ago'}].map(post => (
            <div key={post.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={avatarUrl} alt={seller.name} />
                  <AvatarFallback className="text-sm font-bold">{seller.name.split(' ').map(w=>w[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{seller.name}</div>
                  <div className="text-sm text-muted-foreground">{post.timestamp}</div>
                </div>
                <Badge variant={post.type === 'announcement' ? 'destructive' : 'default'}>{post.type}</Badge>
              </div>
              <div className="font-semibold">{post.title}</div>
              <div className="text-sm text-muted-foreground">{post.content}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Catalog moved into the left column above */}

      {/* Bottom Actions (mobile friendly) */}
      <div className="fixed inset-x-0 bottom-0 bg-white border-t p-3 flex items-center justify-center gap-3 md:hidden">
        <Button variant="outline" className="flex-1" asChild>
          <a href={`mailto:${seller.email}`}>Contact Seller</a>
        </Button>
        <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700" asChild>
          <a href="#products"><Store className="mr-2 h-4 w-4" />View Store</a>
        </Button>
      </div>
    </div>
  )
}
