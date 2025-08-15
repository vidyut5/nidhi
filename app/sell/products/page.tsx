"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const demo = Array.from({ length: 8 }, (_, i) => ({
  id: `demo-${i + 1}`,
  name: ['Smart Switch', 'High Bay Light', 'Multimeter', 'PVC Conduit'][i % 4],
  price: [2499, 8999, 5499, 299][i % 4],
  stock: [45, 23, 67, 120][i % 4],
  image: ['/product-1.jpg', '/product-2.jpg', '/product-3.jpg', '/product-4.jpg'][i % 4],
}))

export default function SellerProductsPage() {
  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your catalog and inventory</p>
        </div>
        <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
          <Link href="/sell/products/new">+ Upload New Product</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {demo.map((p) => (
          <Card key={p.id} className="group">
            <CardContent className="p-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                <Image src={p.image} alt={p.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              </div>
              <div className="space-y-1">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-sm text-muted-foreground">Stock: {p.stock}</div>
                <div className="font-semibold">₹{p.price.toLocaleString('en-IN')}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}



