'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Search, 
  Clock, 
  TrendingUp, 
  Star,
  Zap,
  Package,
  Tag,
  History,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data for search
const trendingSearches = [
  'Smart switches',
  'LED lights',
  'Digital multimeter',
  'Circuit breakers',
  'Cable management'
]

const recentSearches = [
  'industrial fans',
  'copper wires',
  'voltage stabilizer'
]

const quickCategories = [
  { name: 'Electrical Components', slug: 'electrical', icon: Zap },
  { name: 'Lighting Solutions', slug: 'lighting', icon: Package },
  { name: 'Tools & Equipment', slug: 'tools', icon: Tag },
]

// Lightweight suggestions sourced from dummy-data to ensure correct slugs
import { products as allProducts } from '@/lib/dummy-data'
const suggestedProducts = allProducts.slice(0, 50).map(p => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  price: p.price,
  image: Array.isArray(p.images) ? p.images[0] : p.imageUrl,
  rating: p.rating,
  category: p.category
}))

interface EnhancedSearchProps {
  className?: string
  placeholder?: string
  showIcon?: boolean
}

export function EnhancedSearch({ 
  className, 
  placeholder = "Search electrical products...",
  showIcon = true 
}: EnhancedSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const router = useRouter()

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

  // Debounced search function
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      
      // Simulate API call
      setTimeout(() => {
        const results = suggestedProducts.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResults(results)
        setIsSearching(false)
      }, 300)
    },
    []
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleSearch = (searchQuery: string) => {
    setOpen(false)
    setQuery('')
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearch(query)
    }
  }

  const clearRecentSearches = () => {
    // In a real app, this would clear from localStorage or backend
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start text-muted-foreground font-normal"
          >
            {showIcon && <Search className="mr-2 h-4 w-4 shrink-0" />}
            {query || placeholder}
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
              onKeyDown={handleKeyDown}
            />
            <CommandList>
              {query ? (
                <>
                  {isSearching ? (
                    <CommandEmpty>Searching...</CommandEmpty>
                  ) : searchResults.length > 0 ? (
                    <CommandGroup heading="Products">
                      {searchResults.map((product) => (
                        <CommandItem
                          key={product.id}
                          onSelect={() => router.push(`/product/${product.slug}`)}
                          className="flex items-center gap-3 p-3"
                        >
                          <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatPrice(product.price)}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{product.rating}</span>
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : (
                    <CommandEmpty>
                      <div className="text-center py-6">
                        <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                          No products found for "{query}"
                        </p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => handleSearch(query)}
                        >
                          Search all products
                        </Button>
                      </div>
                    </CommandEmpty>
                  )}
                </>
              ) : (
                <>
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <CommandGroup heading="Recent Searches">
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-xs text-muted-foreground">Recent</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 text-xs"
                          onClick={clearRecentSearches}
                        >
                          Clear
                        </Button>
                      </div>
                      {recentSearches.map((search, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => handleSearch(search)}
                          className="flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{search}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  <CommandSeparator />

                  {/* Trending Searches */}
                  <CommandGroup heading="Trending">
                    {trendingSearches.map((search, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleSearch(search)}
                        className="flex items-center gap-2"
                      >
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <span>{search}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  <CommandSeparator />

                  {/* Quick Categories */}
                  <CommandGroup heading="Browse Categories">
                    {quickCategories.map((category) => (
                      <CommandItem
                        key={category.slug}
                        onSelect={() => router.push(`/category/${category.slug}`)}
                        className="flex items-center gap-2"
                      >
                        <category.icon className="h-4 w-4 text-blue-500" />
                        <span>{category.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Global search bar for desktop
export function GlobalSearchBar() {
  return (
    <div className="hidden md:block flex-1 max-w-xl">
      <EnhancedSearch 
        className="w-full"
        placeholder="Search for electrical products, brands, or categories..."
      />
    </div>
  )
}

// Mobile search trigger
export function MobileSearchTrigger() {
  const router = useRouter()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => router.push('/search')}
      className="md:hidden"
    >
      <Search className="h-4 w-4" />
    </Button>
  )
}

