"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ProductCard as UniversalProductCard } from "@/components/product/product-card"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  Star,
  TrendingUp,
  Sparkles,
  Crown,
  Heart,
  ShoppingCart,
  Eye,
  ArrowRight,
} from "lucide-react"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  imageUrl: string
  brand: string
  rating: number
  reviewCount: number
  salesCount?: number
  views?: number
  isNew?: boolean
  isTrending?: boolean
  isTopRated?: boolean
  discount?: number
  category: string
}

const trendingProducts: Product[] = [
  {
    id: "1",
    name: "Smart WiFi Switch with Energy Monitoring",
    slug: "smart-wifi-switch-energy",
    price: 2499,
    originalPrice: 3299,
    imageUrl: "/product-1.jpg",
    brand: "TechFlow",
    rating: 4.8,
    reviewCount: 342,
    salesCount: 1205,
    isTrending: true,
    discount: 24,
    category: "Smart Home",
  },
  {
    id: "2",
    name: "Industrial LED High Bay Light 150W",
    slug: "industrial-led-high-bay-150w",
    price: 8999,
    imageUrl: "/product-2.jpg",
    brand: "LuminTech",
    rating: 4.6,
    reviewCount: 128,
    salesCount: 890,
    isTrending: true,
    category: "Lighting",
  },
  {
    id: "3",
    name: "Digital Multimeter Professional Grade",
    slug: "digital-multimeter-professional",
    price: 5499,
    originalPrice: 6999,
    imageUrl: "/product-3.jpg",
    brand: "MeterPro",
    rating: 4.9,
    reviewCount: 567,
    salesCount: 2156,
    isTrending: true,
    discount: 21,
    category: "Tools",
  },
  {
    id: "4",
    name: "3-Phase Motor Protection Relay",
    slug: "3-phase-motor-protection-relay",
    price: 12999,
    imageUrl: "/product-4.jpg",
    brand: "GuardTech",
    rating: 4.7,
    reviewCount: 89,
    salesCount: 456,
    isTrending: true,
    category: "Industrial",
  },
]

const newProducts: Product[] = [
  {
    id: "5",
    name: "IoT-Enabled Circuit Breaker",
    slug: "iot-circuit-breaker",
    price: 15999,
    imageUrl: "/product-1.jpg",
    brand: "SmartGrid",
    rating: 4.5,
    reviewCount: 23,
    views: 1205,
    isNew: true,
    category: "Smart Grid",
  },
  {
    id: "6",
    name: "Flexible LED Strip RGB+W 5m",
    slug: "flexible-led-strip-rgbw-5m",
    price: 3499,
    imageUrl: "/product-2.jpg",
    brand: "ColorTech",
    rating: 4.4,
    reviewCount: 67,
    views: 890,
    isNew: true,
    category: "Lighting",
  },
  {
    id: "7",
    name: "Wireless Power Quality Analyzer",
    slug: "wireless-power-quality-analyzer",
    price: 45999,
    imageUrl: "/product-3.jpg",
    brand: "AnalyzePro",
    rating: 4.8,
    reviewCount: 12,
    views: 567,
    isNew: true,
    category: "Testing",
  },
  {
    id: "8",
    name: "Solar Micro Inverter 300W",
    slug: "solar-micro-inverter-300w",
    price: 18999,
    imageUrl: "/product-4.jpg",
    brand: "SolarMax",
    rating: 4.6,
    reviewCount: 45,
    views: 1890,
    isNew: true,
    category: "Solar",
  },
]

const topProducts: Product[] = [
  {
    id: "9",
    name: "Premium MCB 32A Single Pole",
    slug: "premium-mcb-32a-single-pole",
    price: 899,
    imageUrl: "/product-1.jpg",
    brand: "SafeGuard",
    rating: 4.9,
    reviewCount: 2340,
    salesCount: 15670,
    isTopRated: true,
    category: "Protection",
  },
  {
    id: "10",
    name: "LED Panel Light 40W Ultra Slim",
    slug: "led-panel-light-40w-ultra-slim",
    price: 2199,
    imageUrl: "/product-2.jpg",
    brand: "SlimLight",
    rating: 4.8,
    reviewCount: 1890,
    salesCount: 12340,
    isTopRated: true,
    category: "Lighting",
  },
  {
    id: "11",
    name: "Digital Clamp Meter AC/DC",
    slug: "digital-clamp-meter-ac-dc",
    price: 3299,
    imageUrl: "/product-3.jpg",
    brand: "ClampTech",
    rating: 4.9,
    reviewCount: 1567,
    salesCount: 9870,
    isTopRated: true,
    category: "Tools",
  },
  {
    id: "12",
    name: "Variable Frequency Drive 1HP",
    slug: "variable-frequency-drive-1hp",
    price: 25999,
    imageUrl: "/product-4.jpg",
    brand: "DriveMax",
    rating: 4.7,
    reviewCount: 890,
    salesCount: 3450,
    isTopRated: true,
    category: "Drives",
  },
]

interface ProductCardProps {
  product: Product
  variant?: "trending" | "new" | "top"
}

function ProductCard({ product, variant = "trending" }: ProductCardProps) {
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const badgeConfig = {
    trending: { icon: TrendingUp, text: "Trending", variant: "destructive" as const },
    new: { icon: Sparkles, text: "New", variant: "default" as const },
    top: { icon: Crown, text: "Top Rated", variant: "secondary" as const },
  }

  const config = badgeConfig[variant]

  return (
    <UniversalProductCard
      product={{
        ...product,
        images: [product.imageUrl],
        category: { id: product.category, name: product.category, slug: product.category.toLowerCase() }
      } as any}
      size="md"
      variant="market"
    />
  )
}

export function SegmentedFeed() {
  return (
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Discover What's Popular
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay ahead with the latest trends, newest arrivals, and top-rated products from our community
          </p>
        </div>

        {/* Segmented Tabs */}
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="trending" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center">
              <Sparkles className="mr-2 h-4 w-4" />
              New
            </TabsTrigger>
            <TabsTrigger value="top" className="flex items-center">
              <Crown className="mr-2 h-4 w-4" />
              Top Rated
            </TabsTrigger>
          </TabsList>

          {/* Trending Products */}
          <TabsContent value="trending">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <UniversalProductCard
                  key={product.id}
                  product={{
                    ...product,
                    images: [product.imageUrl],
                    category: { id: product.category, name: product.category, slug: product.category.toLowerCase() },
                  } as any}
                  variant="market"
                  size="md"
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/search?filter=trending">
                  View All Trending Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* New Products */}
          <TabsContent value="new">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <UniversalProductCard
                  key={product.id}
                  product={{
                    ...product,
                    images: [product.imageUrl],
                    category: { id: product.category, name: product.category, slug: product.category.toLowerCase() },
                  } as any}
                  variant="market"
                  size="md"
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/search?filter=new">
                  View All New Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Top Rated Products */}
          <TabsContent value="top">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topProducts.map((product) => (
                <UniversalProductCard
                  key={product.id}
                  product={{
                    ...product,
                    images: [product.imageUrl],
                    category: { id: product.category, name: product.category, slug: product.category.toLowerCase() },
                  } as any}
                  variant="market"
                  size="md"
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/search?filter=top-rated">
                  View All Top Rated Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

