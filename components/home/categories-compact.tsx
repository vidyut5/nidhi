"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { categories } from "@/lib/dummy-data"

export function CategoriesCompact() {
  const top = categories

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container-wide">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">Browse Categories</h2>
            <p className="text-muted-foreground text-lg">
              Explore our comprehensive range of electrical products
            </p>
          </div>
          <Link href="/categories" className="text-primary hover:underline text-sm">
            View all products
          </Link>
        </div>

        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {top.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`}>
              <Card className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image 
                      src={c.image} 
                      alt={c.name} 
                      fill 
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw" 
                      className="object-cover" 
                      placeholder="blur"
                      blurDataURL="/placeholder.svg"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-3">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    <div className="text-xs text-muted-foreground">{c.productCount} products</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}



