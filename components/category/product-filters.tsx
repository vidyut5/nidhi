"use client"

import { useState, useEffect } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import {
  SlidersHorizontal,
  X,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react"

interface FilterState {
  sort: string
  minPrice: string
  maxPrice: string
  brands: string[]
  rating: string
  inStock: boolean
}

interface ProductFiltersProps {
  totalProducts: number
  brands: string[]
  className?: string
  onFiltersChange?: (filters: FilterState) => void
}

export function ProductFilters({ 
  totalProducts, 
  brands, 
  className,
  onFiltersChange 
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<FilterState>({
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brands: searchParams.getAll('brand'),
    rating: searchParams.get('rating') || '',
    inStock: searchParams.get('inStock') === 'true',
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  useEffect(() => {
    // Count active filters
    let count = 0
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.brands.length > 0) count++
    if (filters.rating) count++
    if (filters.inStock) count++
    setActiveFiltersCount(count)

    // Notify parent component
    onFiltersChange?.(filters)
  }, [filters, onFiltersChange])

  const updateURL = (newFilters: FilterState) => {
    const params = new URLSearchParams()
    
    if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort)
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice)
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice)
    if (newFilters.rating) params.set('rating', newFilters.rating)
    if (newFilters.inStock) params.set('inStock', 'true')
    
    newFilters.brands.forEach(brand => params.append('brand', brand))

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    
    router.push(newUrl, { scroll: false })
  }

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const handleBrandToggle = (brand: string, checked: boolean) => {
    const newBrands = checked 
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand)
    
    handleFilterChange('brands', newBrands)
  }

  const clearAllFilters = () => {
    const defaultFilters: FilterState = {
      sort: 'newest',
      minPrice: '',
      maxPrice: '',
      brands: [],
      rating: '',
      inStock: false,
    }
    setFilters(defaultFilters)
    updateURL(defaultFilters)
  }

  const clearFilter = (filterType: string) => {
    switch (filterType) {
      case 'price':
        const updated = { ...filters, minPrice: '', maxPrice: '' }
        setFilters(updated)
        updateURL(updated)
        break
      case 'brands':
        handleFilterChange('brands', [])
        break
      case 'rating':
        handleFilterChange('rating', '')
        break
      case 'inStock':
        handleFilterChange('inStock', false)
        break
    }
  }

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Clock },
    { value: 'price-low', label: 'Price: Low to High', icon: DollarSign },
    { value: 'price-high', label: 'Price: High to Low', icon: DollarSign },
    { value: 'rating', label: 'Highest Rated', icon: Star },
    { value: 'popular', label: 'Most Popular', icon: TrendingUp },
  ]

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <SlidersHorizontal className="mr-2 h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {totalProducts.toLocaleString()} products found
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sort */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sort By</Label>
          <Select 
            value={filters.sort} 
            onValueChange={(value) => handleFilterChange('sort', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    <option.icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="outline" className="gap-1">
                  Price: ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => clearFilter('price')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.brands.map((brand) => (
                <Badge key={brand} variant="outline" className="gap-1">
                  {brand}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleBrandToggle(brand, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.rating && (
                <Badge variant="outline" className="gap-1">
                  {filters.rating}+ Stars
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => clearFilter('rating')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.inStock && (
                <Badge variant="outline" className="gap-1">
                  In Stock
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => clearFilter('inStock')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Filters Accordion */}
        <Accordion type="multiple" defaultValue={["price", "brands", "rating"]} className="w-full">
          {/* Price Range */}
          <AccordionItem value="price">
            <AccordionTrigger className="text-sm font-medium">
              Price Range
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
                    Min Price
                  </Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="₹0"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
                    Max Price
                  </Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="₹50000"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Quick Price Ranges */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Under ₹1,000", min: "", max: "1000" },
                  { label: "₹1,000 - ₹5,000", min: "1000", max: "5000" },
                  { label: "₹5,000 - ₹10,000", min: "5000", max: "10000" },
                  { label: "Over ₹10,000", min: "10000", max: "" },
                ].map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const updated = { ...filters, minPrice: range.min, maxPrice: range.max }
                      setFilters(updated)
                      updateURL(updated)
                    }}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Brands */}
          <AccordionItem value="brands">
            <AccordionTrigger className="text-sm font-medium">
              Brands ({brands.length})
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={(checked) => 
                      handleBrandToggle(brand, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`brand-${brand}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Rating */}
          <AccordionItem value="rating">
            <AccordionTrigger className="text-sm font-medium">
              Customer Rating
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={filters.rating === rating.toString()}
                    onCheckedChange={(checked) => 
                      handleFilterChange('rating', checked ? rating.toString() : '')
                    }
                  />
                  <Label 
                    htmlFor={`rating-${rating}`} 
                    className="flex items-center space-x-1 text-sm font-normal cursor-pointer"
                  >
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < rating 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <span>{rating}+ Stars</span>
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Availability */}
          <AccordionItem value="availability">
            <AccordionTrigger className="text-sm font-medium">
              Availability
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) => 
                    handleFilterChange('inStock', checked as boolean)
                  }
                />
                <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
                  In Stock Only
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

