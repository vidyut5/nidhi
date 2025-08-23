// Base product interface
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  imageUrls: string[]
  brand?: string
  model?: string
  sku?: string
  stock: number
  minOrder: number
  isActive: boolean
  isFeatured: boolean
  weight?: number
  dimensions?: ProductDimensions
  colors?: string[]
  sizes?: string[]
  specifications?: Record<string, string | number | boolean>
  warranty?: string
  returnPolicy?: string
  tags?: string[]
  views: number
  salesCount: number
  rating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
  sellerId: string
  categoryId: string
}

// Product dimensions
export interface ProductDimensions {
  length: number
  width: number
  height: number
  unit: 'cm' | 'inch' | 'mm'
}

// Product for display (simplified)
export interface ProductDisplay {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  images: string[]
  imageUrl: string
  brand?: string
  model?: string
  stock: number
  rating: number
  reviewCount: number
  salesCount: number
  views: number
  isActive: boolean
  isFeatured: boolean
  category?: Category
  seller?: Seller
}

// Category interface
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  createdAt: Date
  updatedAt: Date
}

// Seller interface
export interface Seller {
  id: string
  name: string
  email: string
  avatar?: string
  businessName?: string
  businessType?: 'INDIVIDUAL' | 'ENTERPRISE'
  gstNumber?: string
  businessAddress?: string
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  rating: number
  totalSales: number
  totalOrders: number
  memberYears: number
  responseRatePercent: number
  supportsCall: boolean
  supportsWhatsapp: boolean
  createdAt: Date
  updatedAt: Date
}

// Order interface
export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  paymentStatus: PaymentStatus
  paymentMethod?: string
  shippingAddress: Address
  billingAddress?: Address
  trackingNumber?: string
  estimatedDelivery?: Date
  deliveredAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
  buyerId: string
  items: OrderItem[]
}

// Order item interface
export interface OrderItem {
  id: string
  quantity: number
  price: number
  color?: string
  size?: string
  createdAt: Date
  orderId: string
  productId: string
}

// Review interface
export interface Review {
  id: string
  rating: number
  title?: string
  comment?: string
  images?: string[]
  isVerified: boolean
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
  productId: string
  userId: string
}

// Address interface
export interface Address {
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

// Enums
export type OrderStatus = 'PROCESSING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type BusinessType = 'INDIVIDUAL' | 'ENTERPRISE'
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  code?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface ProductFormData {
  name: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  imageUrls: string[]
  brand?: string
  model?: string
  sku?: string
  stock: number
  minOrder: number
  weight?: number
  dimensions?: ProductDimensions
  colors?: string[]
  sizes?: string[]
  specifications?: Record<string, string | number | boolean>
  warranty?: string
  returnPolicy?: string
  tags?: string[]
  categoryId: string
}

// Search and filter types
export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  brand?: string
  featured?: boolean
  inStock?: boolean
  rating?: number
}

export interface ProductSortOptions {
  field: 'price' | 'rating' | 'createdAt' | 'salesCount' | 'views'
  order: 'asc' | 'desc'
}

// Cart types
export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  imageUrl: string
  brand?: string
  quantity: number
  stock: number
  sellerId: string
  sellerName: string
}

export interface CartStore {
  items: CartItem[]
  isOpen: boolean
  totalItems: number
  totalPrice: number
  
  // Actions
  addItem: (product: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}



