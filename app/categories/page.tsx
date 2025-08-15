'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { categories as demoCategories } from '@/lib/dummy-data'

export default function CategoriesPage() {
  const [cats, setCats] = useState(() => demoCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug, image: c.image, productCount: c.productCount })))
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.ok ? r.json() : [])
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Build count/name map from API by slug
          const apiBySlug = new Map<string, any>(data.map((c: any) => [c.slug, c]))
          // Only show curated demo categories with their images; overlay counts/names when available
          setCats(demoCategories.map(dc => {
            const api = apiBySlug.get(dc.slug)
            return {
              id: api?.id || dc.id,
              name: api?.name || dc.name,
              slug: dc.slug,
              image: dc.image,
              productCount: (api?._count?.products ?? dc.productCount) as number,
            }
          }))
        }
      })
      .catch(() => {})
  }, [])
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Browse Categories</h1>
        <Link href="/category/all" className="text-sm text-primary">View all products</Link>
      </div>

      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {cats.map((c) => (
          <Link key={c.id} href={`/category/${c.slug}`}>
            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image src={c.image} alt={c.name} fill className="object-cover" />
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{c.name}</h3>
                  <div className="text-xs text-muted-foreground">{c.productCount} products</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}



