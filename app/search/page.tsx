"use client"

import { Suspense } from 'react'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { products, categories, searchProducts } from '@/lib/dummy-data'
import { homeCategories } from '@/components/home/categories-grid'
import { 
  Search, 
  Filter, 
  X, 
  Star,
  Package,
  TrendingUp,
  Clock,
  Grid3X3,
  List,
  ArrowUpDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

const trendingSearches = [
  'LED lights', 'Smart switches', 'Wire cable', 'Ceiling fan', 'MCB breaker'
]

const recentSearches = [
  'Havells switch', 'Philips bulb', 'Anchor socket'
]

function SearchPageInner() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [priceRange, setPriceRange] = useState<string>('all')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
    }
  }, [searchParams])

  const searchResults = useMemo(() => {
    // Fallback to local search for instant feel; later we fetch from API
    let results = query ? searchProducts(query) : products
    if (selectedCategory !== 'all') {
      results = results.filter(product => product.category === selectedCategory)
    }
    if (priceRange !== 'all') {
      const ranges = {
        'under-500': [0, 500],
        '500-1000': [500, 1000],
        '1000-5000': [1000, 5000],
        'above-5000': [5000, Infinity]
      }
      const [min, max] = ranges[priceRange as keyof typeof ranges] || [0, Infinity]
      results = results.filter(product => product.price >= min && product.price < max)
    }
    switch (sortBy) {
      case 'price-low':
        return results.sort((a, b) => a.price - b.price)
      case 'price-high':
        return results.sort((a, b) => b.price - a.price)
      case 'rating':
        return results.sort((a, b) => b.rating - a.rating)
      case 'newest':
        return results.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
      case 'popular':
        return results.sort((a, b) => b.reviewCount - a.reviewCount)
      default:
        return results
    }
  }, [query, selectedCategory, sortBy, priceRange])

  // Progressive enhancement: fetch server results and merge when available
  // This avoids a hard switch and keeps the UI responsive
  const [serverResults, setServerResults] = useState<typeof products>([] as any)
  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      try {
        const url = new URL('/api/search', window.location.origin)
        const q = (query || '').trim()
        if (!q) { setServerResults([] as any); return }
        url.searchParams.set('query', q)
        const res = await fetch(url.toString(), { signal: controller.signal })
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data)) setServerResults(data as any)
      } catch {}
    }
    run()
    return () => controller.abort()
  }, [query])

  // Prefer server results when available; normalize shape to UI expectations
  const resultsToShow = useMemo(() => {
    const src = Array.isArray(serverResults) && serverResults.length > 0 ? serverResults as any[] : searchResults as any[]
    return src.map((p: any) => {
      const images = Array.isArray(p.images)
        ? p.images
        : typeof p.imageUrls === 'string'
          ? (() => { try { const arr = JSON.parse(p.imageUrls); return Array.isArray(arr) ? arr : [] } catch { return [] } })()
          : Array.isArray(p.imageUrls) ? p.imageUrls : (typeof p.imageUrl === 'string' ? [p.imageUrl] : [])
      return {
        ...p,
        images,
        imageUrl: images[0] || p.imageUrl || '/product-1.jpg',
      }
    })
  }, [serverResults, searchResults])

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3 w-3",
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">({rating})</span>
      </div>
    )
  }

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  const clearSearch = () => {
    setQuery('')
    setSelectedCategory('all')
    setPriceRange('all')
    setSortBy('relevance')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for electrical products, brands, or categories..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10 py-3 text-lg"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Quick Searches */}
            {!query && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Trending Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((search) => (
                      <Button
                        key={search}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(search)}
                        className="text-xs"
                      >
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search) => (
                      <Button
                        key={search}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSearch(search)}
                        className="text-xs"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            {query && (
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center sticky top-[56px] z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 -mx-4 px-4 py-2">
                <div className="flex flex-wrap gap-2 flex-1">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-500">Under ₹500</SelectItem>
                      <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                      <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
                      <SelectItem value="above-5000">Above ₹5,000</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="border-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="border-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {!query ? (
          // Welcome State
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Find the Perfect Electrical Products
            </h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Search through our extensive catalog of electrical components, tools, and equipment from trusted brands.
            </p>
            
            {/* Featured Categories - mirrored with home */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {homeCategories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="p-4 border rounded-xl hover:shadow-lg transition-shadow text-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    <category.icon className="h-6 w-6 mx-auto" />
                  </div>
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-xs text-gray-500">{category.productCount.toLocaleString()} products</div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          // Search Results
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {`${searchResults.length} results found`}
                  {query && <span className="text-gray-500"> for "{query}"</span>}
                </h2>
                {selectedCategory !== 'all' && (
                  <p className="text-sm text-gray-500">
                    in {categories.find(c => c.id === selectedCategory)?.name}
                  </p>
                )}
              </div>
              
              {(selectedCategory !== 'all' || priceRange !== 'all') && (
                <Button variant="outline" size="sm" onClick={clearSearch}>
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Active Filters */}
            {(selectedCategory !== 'all' || priceRange !== 'all') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Filters:</span>
                {selectedCategory !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {categories.find(c => c.id === selectedCategory)?.name}
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => setSelectedCategory('all')}>
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                )}
                {priceRange !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {priceRange.replace('-', ' - ₹').replace('under', 'Under ₹').replace('above', 'Above ₹')}
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => setPriceRange('all')}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results Grid */}
            {resultsToShow.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={clearSearch}>Clear Search</Button>
              </div>
            ) : (
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              )}>
                {resultsToShow.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <Link href={`/product/${product.slug}`}>
                        <div className="relative mb-3">
                          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={Array.isArray(product.images) && product.images[0]
                                ? product.images[0]
                                : '/product-1.jpg'}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              className="object-cover"
                              placeholder="blur"
                              blurDataURL="/placeholder.svg"
                            />
                          </div>
                          
                          {/* Badges */}
                          <div className="absolute top-2 left-2 space-y-1">
                            {product.isNew && (
                              <Badge className="bg-green-500 text-white text-xs">New</Badge>
                            )}
                            {product.discount && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {product.discount}% OFF
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            {product.brand}
                          </div>
                          
                          <h3 className="font-medium line-clamp-2 leading-tight">
                            {product.name}
                          </h3>
                          
                          {renderStars(product.rating)}
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-lg">
                                {formatPrice(product.price)}
                              </div>
                              {product.originalPrice && (
                                <div className="text-xs text-gray-500 line-through">
                                  {formatPrice(product.originalPrice)}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.stock} in stock
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-6xl px-4 py-8">Loading...</div>}>
      <SearchPageInner />
    </Suspense>
  )
}