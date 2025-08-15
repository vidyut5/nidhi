'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { categories, products, getProductsByCategory } from '@/lib/dummy-data'
import { WishlistButton } from '@/components/wishlist/wishlist-button'
import { Search, Grid3X3, List, Star, Tag, Package, Zap, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryListingProps {
  slug?: string
}

export default function CategoryListing({ slug }: CategoryListingProps) {
  const params = useParams()
  const searchParams = useSearchParams()
  const categorySlug = (slug as string) || (params?.slug as string)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [priceRange, setPriceRange] = useState<string>('all')

  useEffect(() => {
    const sort = searchParams.get('sort')
    if (sort && sort !== sortBy) {
      setSortBy(sort)
    }
  }, [searchParams, sortBy])

  const currentCategory = categorySlug === 'all'
    ? {
        id: 'all',
        name: 'All Products',
        slug: 'all',
        description: 'Browse all electrical products',
        icon: '🛍️',
        image: '/categories/all.jpg',
        subcategories: [] as string[],
        productCount: products.length,
        isPopular: false,
      }
    : categories.find((cat) => cat.slug === categorySlug) || null

  const categoryProducts = useMemo(() => {
    if (!currentCategory) return []

    let filteredProducts = categorySlug === 'all' ? products : getProductsByCategory(currentCategory.id)

    if (selectedSubcategory !== 'all') {
      filteredProducts = filteredProducts.filter((product) => product.subcategory === selectedSubcategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query)
      )
    }

    if (priceRange !== 'all') {
      const ranges: Record<string, [number, number]> = {
        'under-500': [0, 500],
        '500-1000': [500, 1000],
        '1000-5000': [1000, 5000],
        'above-5000': [5000, Infinity],
      }
      const [min, max] = ranges[priceRange] || [0, Infinity]
      filteredProducts = filteredProducts.filter((product) => product.price >= min && product.price < max)
    }

    switch (sortBy) {
      case 'price-low':
        return filteredProducts.sort((a, b) => a.price - b.price)
      case 'price-high':
        return filteredProducts.sort((a, b) => b.price - a.price)
      case 'rating':
        return filteredProducts.sort((a, b) => b.rating - a.rating)
      case 'newest':
        return filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
      case 'popular':
        return filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount)
      default:
        return filteredProducts.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }
  }, [currentCategory, selectedSubcategory, searchQuery, sortBy, priceRange, categorySlug])

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={cn('h-3 w-3', i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')} />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">({rating.toFixed(1)})</span>
      </div>
    )
  }

  if (!currentCategory) {
    return (
      <div className="container-wide py-8">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Category not found</h1>
          <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden lg:block">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              <Link
                href="/category/all"
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  categorySlug === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <span className="text-lg">🛍️</span>
                <span>All Products</span>
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    category.slug === categorySlug ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {currentCategory && currentCategory.subcategories.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Subcategories</h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSubcategory('all')}
                  className={cn(
                    'justify-start w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    selectedSubcategory === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  All {currentCategory.name}
                </Button>
                {currentCategory.subcategories.map((subcategory) => (
                  <Button
                    key={subcategory}
                    variant="ghost"
                    onClick={() => setSelectedSubcategory(subcategory)}
                    className={cn(
                      'justify-start w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      selectedSubcategory === subcategory ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {subcategory}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
            <div className="space-y-1">
              {[
                { value: 'all', label: 'All Prices' },
                { value: 'under-500', label: 'Under ₹500' },
                { value: '500-1000', label: '₹500 - ₹1,000' },
                { value: '1000-5000', label: '₹1,000 - ₹5,000' },
                { value: 'above-5000', label: 'Above ₹5,000' },
              ].map((range) => (
                <Button
                  key={range.value}
                  variant="ghost"
                  onClick={() => setPriceRange(range.value)}
                  className={cn(
                    'justify-start w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    priceRange === range.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Link href="/" className="hover:text-gray-700">
                  Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span>{currentCategory.name}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{currentCategory.name}</h1>
              <p className="text-gray-600">{currentCategory.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">{categoryProducts.length} products</div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Search in ${currentCategory.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-lg">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="border-none">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="border-none">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white col-span-1 lg:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{currentCategory.name} Special</h3>
                    <p className="text-blue-100 mb-4">Up to 30% off on premium products</p>
                    <Button variant="secondary" size="sm">
                      Explore
                    </Button>
                  </div>
                  <div className="text-6xl opacity-20">{currentCategory.icon}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-bold mb-2">Fast Delivery</h3>
                  <p className="text-green-100 text-sm">Same day delivery available</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {categoryProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className={cn('grid gap-4', viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1')}>
              {categoryProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <Link href={`/product/${product.slug}`}>
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={Array.isArray(product.images) && product.images.length > 0
                              ? product.images[0]
                              : (product.imageUrl || '/product-1.jpg')}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                            className="object-cover"
                          />
                        </div>
                      </Link>

                      <div className="absolute top-2 left-2 space-y-1">
                        {product.isNew && <Badge className="bg-green-500 text-white text-xs">New</Badge>}
                        {product.discount && (
                          <Badge className="bg-red-500 text-white text-xs">{product.discount}% OFF</Badge>
                        )}
                      </div>

                      <div className="absolute top-2 right-2">
                        <WishlistButton product={{
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: product.price,
                          originalPrice: product.originalPrice,
                          images: Array.isArray(product.images) ? product.images : [product.imageUrl],
                          brand: product.brand,
                          stock: product.stock,
                          rating: product.rating,
                          reviewCount: product.reviewCount,
                          sellerId: 'demo',
                          sellerName: 'Demo Seller',
                        }} variant="ghost" size="icon" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</div>

                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-medium text-sm line-clamp-2 leading-tight hover:text-primary">{product.name}</h3>
                      </Link>

                      {renderStars(product.rating)}

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg">{formatPrice(product.price)}</div>
                          {product.originalPrice && (
                            <div className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{product.stock} in stock</div>
                      </div>

                      <Button className="w-full" size="sm">
                        ADD
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


