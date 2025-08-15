"use client"

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { demoSellers, demoProducts, demoReviews } from '@/lib/demo-data'
import { Star, MapPin, Phone, Mail, Shield, Clock, Store } from 'lucide-react'

export default function SellerPublicProfile() {
  const params = useParams()
  const slug = (params.slug as string) || ''
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

  return (
    <div className="container-wide py-8">
      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{seller.name}</h1>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{(seller.rating as number).toFixed(1)}</span>
                  <span className="text-muted-foreground">({seller.totalOrders.toLocaleString('en-IN')} ratings)</span>
                </div>
              </div>
              <div className="text-blue-600 text-sm mt-1">Trusted Electrical Goods Supplier</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Statistics */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Business Statistics</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{(totalSold ?? 0).toLocaleString('en-IN')}+</div>
              <div className="text-sm text-muted-foreground">Products Sold</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{feedback}%</div>
              <div className="text-sm text-muted-foreground">Positive Feedback</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">5+</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="mb-6">
        <CardHeader><CardTitle>About {seller.name}</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>{seller.bio || 'We are a leading supplier of electrical goods across India with a focus on quality, reliability, and customer satisfaction.'}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Premium quality electrical products</li>
            <li>Fast and reliable delivery</li>
            <li>24/7 customer support</li>
            <li>2-year warranty on select products</li>
          </ul>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600" />{seller.email}</div>
          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-blue-600" />{seller.phone}</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" />{seller.location}</div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-600" />Mon-Sat: 9:00 AM - 8:00 PM</div>
        </CardContent>
      </Card>

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

      {/* Catalog */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Products ({products.length})</h2>
        <Button asChild variant="outline"><Link href={`/seller/${encodeURIComponent(slug)}/products`}>View all</Link></Button>
      </div>
      <div id="products" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <Link href={`/product/${p.slug}`}>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                  <Image src={p.image || '/product-1.jpg'} alt={p.name} fill className="object-cover" />
                </div>
                <div className="font-medium line-clamp-2">{p.name}</div>
                <div className="text-sm text-muted-foreground">{formatPrice(p.price)}</div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Actions (mobile friendly) */}
      <div className="fixed inset-x-0 bottom-0 bg-white/80 backdrop-blur border-t p-3 flex items-center justify-center gap-3 md:hidden">
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


