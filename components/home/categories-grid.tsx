"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Zap,
  Lightbulb,
  Wrench,
  Building2,
  MonitorSpeaker,
  Cable,
  ShieldCheck,
  Cpu,
  Battery,
  Gauge,
  ArrowRight,
  TrendingUp,
} from "lucide-react"

export interface HomeCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  imageUrl: string
  productCount: number
  trending?: boolean
  gradient: string
}

export const homeCategories: HomeCategory[] = [
  {
    id: "1",
    name: "Electrical Components",
    slug: "electrical",
    description: "Switches, outlets, breakers, and wiring essentials",
    icon: Zap,
    imageUrl: "/product-1.jpg",
    productCount: 1248,
    trending: true,
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
  {
    id: "2",
    name: "Lighting Solutions",
    slug: "lighting",
    description: "LED lights, fixtures, and smart lighting systems",
    icon: Lightbulb,
    imageUrl: "/product-2.jpg",
    productCount: 856,
    trending: true,
    gradient: "from-yellow-500/20 to-amber-500/20",
  },
  {
    id: "3",
    name: "Tools & Equipment",
    slug: "tools",
    description: "Professional electrical tools and testing equipment",
    icon: Wrench,
    imageUrl: "/product-3.jpg",
    productCount: 642,
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "4",
    name: "Industrial Equipment",
    slug: "industrial",
    description: "Motors, transformers, and heavy-duty machinery",
    icon: Building2,
    imageUrl: "/product-4.jpg",
    productCount: 324,
    gradient: "from-gray-500/20 to-slate-500/20",
  },
  {
    id: "5",
    name: "Automation Systems",
    slug: "automation",
    description: "Smart controls, sensors, and automation solutions",
    icon: MonitorSpeaker,
    imageUrl: "/product-1.jpg",
    productCount: 456,
    trending: true,
    gradient: "from-purple-500/20 to-violet-500/20",
  },
  {
    id: "6",
    name: "Cables & Wiring",
    slug: "cables",
    description: "Power cables, data cables, and wire management",
    icon: Cable,
    imageUrl: "/product-2.jpg",
    productCount: 789,
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "7",
    name: "Safety Equipment",
    slug: "safety",
    description: "Protective gear, emergency equipment, and safety tools",
    icon: ShieldCheck,
    imageUrl: "/product-3.jpg",
    productCount: 234,
    gradient: "from-red-500/20 to-pink-500/20",
  },
  {
    id: "8",
    name: "Electronic Components",
    slug: "electronics",
    description: "Semiconductors, PCBs, and electronic modules",
    icon: Cpu,
    imageUrl: "/product-4.jpg",
    productCount: 567,
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
]

export function CategoriesGrid() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container-wide">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg">
              Find exactly what you need from our comprehensive selection
            </p>
          </div>
          <Link 
            href="/categories" 
            className="hidden sm:flex items-center text-primary hover:text-primary/80 font-medium group"
          >
            View All Categories
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Featured Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           {homeCategories.slice(0, 4).map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="group relative overflow-hidden border-0 shadow-elevation hover:shadow-elevation-lg transition-all duration-300 h-full">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    placeholder="blur"
                    blurDataURL="/placeholder.svg"
                  />
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                  )} />
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br transition-opacity duration-300",
                    category.gradient,
                    "opacity-60 group-hover:opacity-40"
                  )} />
                </div>

                <CardContent className="relative z-10 p-6 h-48 flex flex-col justify-end text-white">
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                      <category.icon className="h-6 w-6" />
                    </div>
                    {category.trending && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Trending
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-white/90 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-white/80 text-sm mb-2 line-clamp-2">
                      {category.description}
                    </p>
                    <p className="text-white/70 text-xs">
                      {category.productCount.toLocaleString()} products
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Secondary Categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {homeCategories.slice(4).map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="group border-0 shadow-elevation-sm hover:shadow-elevation transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br",
                      category.gradient
                    )}>
                      <category.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                        {category.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {category.productCount.toLocaleString()} items
                      </p>
                    </div>
                    {category.trending && (
                      <Badge variant="outline" className="text-xs">
                        Hot
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Mobile View All Link */}
        <div className="sm:hidden mt-6 text-center">
          <Link 
            href="/categories" 
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
          >
            View All Categories
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

