export interface UICategoryRef {
  id: string
  name: string
  slug: string
}

export interface UIProduct {
  id: string
  slug: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  imageUrl: string
  brand?: string
  stock: number
  rating: number
  reviewCount: number
  sellerId?: string
  sellerName?: string
  category?: UICategoryRef
}



