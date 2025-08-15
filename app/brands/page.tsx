'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { products } from '@/lib/dummy-data'
import { Search, Star, Package, ArrowRight } from 'lucide-react'

// Extract unique brands from products
const brands = Array.from(new Set(products.map(p => p.brand))).map(brandName => {
  const brandProducts = products.filter(p => p.brand === brandName)
  const avgRating = brandProducts.reduce((sum, p) => sum + p.rating, 0) / brandProducts.length
  const totalReviews = brandProducts.reduce((sum, p) => sum + p.reviewCount, 0)
  
  return {
    name: brandName,
    slug: brandName.toLowerCase().replace(/\s+/g, '-'),
    productCount: brandProducts.length,
    avgRating: Math.round(avgRating * 10) / 10,
    totalReviews,
    description: getBrandDescription(brandName),
    logo: `/brands/${brandName.toLowerCase()}.jpg`,
    isPopular: brandProducts.length > 5,
    categories: Array.from(new Set(brandProducts.map(p => p.category)))
  }
}).sort((a, b) => b.productCount - a.productCount)

function getBrandDescription(brand: string): string {
  const descriptions: Record<string, string> = {
    'Havells': 'Leading electrical equipment company known for quality switches, fans, and lighting solutions',
    'Legrand': 'Global specialist in electrical and digital building infrastructures',
    'Schneider': 'Multinational corporation specializing in energy management and automation solutions',
    'Philips': 'Technology company focused on health technology and lighting solutions',
    'Bajaj': 'Indian electrical equipment company known for fans, lighting, and appliances',
    'Polycab': 'Leading manufacturer of wires, cables, and electrical accessories',
    'KEI': 'Renowned manufacturer of cables and wires for power transmission',
    'Luminous': 'Leading brand in power backup and electrical solutions',
    'Microtek': 'Trusted name in UPS and power solutions',
    'Stanley': 'Global provider of hand tools and storage solutions',
    'Fluke': 'World leader in professional electronic test tools and software',
    'Crompton': 'Pioneer in electrical solutions and consumer appliances'
  }
  return descriptions[brand] || `Quality electrical products and solutions from ${brand}`
}

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'popular' | 'az'>('all')

  const filteredBrands = brands
    .filter(brand => 
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (filter) {
        case 'popular':
          return b.productCount - a.productCount
        case 'az':
          return a.name.localeCompare(b.name)
        default:
          return b.productCount - a.productCount
      }
    })

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-500">({rating})</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-wide py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted Electrical Brands
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover products from India's most trusted electrical brands. Quality guaranteed, prices competitive.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex justify-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All Brands
              </Button>
              <Button
                variant={filter === 'popular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('popular')}
              >
                Most Popular
              </Button>
              <Button
                variant={filter === 'az' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('az')}
              >
                A-Z
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Brands */}
      <div className="container-wide py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Brands</h2>
          <p className="text-gray-600">
            {filteredBrands.length} brands • {products.length} total products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <Card key={brand.name} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Brand Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {brand.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {brand.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {renderStars(brand.avgRating)}
                          {brand.isPopular && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {brand.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{brand.productCount}</div>
                      <div className="text-xs text-gray-500">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{brand.totalReviews}</div>
                      <div className="text-xs text-gray-500">Reviews</div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Categories:</div>
                    <div className="flex flex-wrap gap-1">
                      {brand.categories.slice(0, 3).map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category.replace(/-/g, ' ')}
                        </Badge>
                      ))}
                      {brand.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{brand.categories.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild className="flex-1">
                      <Link href={`/search?q=${encodeURIComponent(brand.name)}`}>
                        <Package className="mr-2 h-4 w-4" />
                        View Products
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/search?q=${encodeURIComponent(brand.name)}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBrands.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No brands found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms
            </p>
            <Button onClick={() => setSearchQuery('')}>
              Show All Brands
            </Button>
          </div>
        )}
      </div>

      {/* Trust Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold mb-4">Why Choose These Brands?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            All our partner brands are carefully selected for their commitment to quality, innovation, and customer satisfaction.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-blue-100">
                All products undergo rigorous quality testing and certification
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer Rated</h3>
              <p className="text-blue-100">
                Thousands of verified reviews from satisfied customers
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy to Find</h3>
              <p className="text-blue-100">
                Quick search and filter options to find exactly what you need
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



