import { useMemo } from 'react'

interface ProductImage {
  id: string
  url: string
  alt: string
}

interface ProductSeller {
  id: string
  name: string
  verified: boolean
}

interface ProductCategory {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  images: ProductImage[]
  brand?: string
  stock: number
  rating: number
  reviewCount: number
  isFeatured: boolean
  seller: ProductSeller
  category: ProductCategory
}

export function useProduct(product: Product) {
  const formattedPrice = useMemo(() => {
    return `₹${product.price.toLocaleString('en-IN')}`
  }, [product.price])

  const formattedOriginalPrice = useMemo(() => {
    if (!product.originalPrice) return null
    return `₹${product.originalPrice.toLocaleString('en-IN')}`
  }, [product.originalPrice])

  const discount = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0
    return Math.round((1 - product.price / product.originalPrice) * 100)
  }, [product.price, product.originalPrice])

  const primaryImage = useMemo(() => {
    return product.images[0]?.url || '/placeholder.svg'
  }, [product.images])

  const imageAlt = useMemo(() => {
    return product.images[0]?.alt || product.name
  }, [product.images, product.name])

  const isLowStock = useMemo(() => {
    return product.stock <= 5 && product.stock > 0
  }, [product.stock])

  const hasDiscount = useMemo(() => {
    return discount > 0
  }, [discount])

  const stockStatus = useMemo(() => {
    if (product.stock === 0) return 'out-of-stock'
    if (isLowStock) return 'low-stock'
    return 'in-stock'
  }, [product.stock, isLowStock])

  const ratingStars = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      index: i,
      filled: i < Math.floor(product.rating),
      partial: i === Math.floor(product.rating) && product.rating % 1 > 0
    }))
  }, [product.rating])

  return {
    formattedPrice,
    formattedOriginalPrice,
    discount,
    primaryImage,
    imageAlt,
    isLowStock,
    hasDiscount,
    stockStatus,
    ratingStars
  }
}



