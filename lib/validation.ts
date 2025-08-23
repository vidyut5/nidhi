import { z } from 'zod'

// Base schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description too long'),
  shortDescription: z.string().max(500, 'Short description too long').optional(),
  price: z.number().positive('Price must be positive').max(999999.99, 'Price too high'),
  originalPrice: z.number().positive('Original price must be positive').max(999999.99, 'Price too high').optional(),
  imageUrls: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  brand: z.string().max(100, 'Brand name too long').optional(),
  model: z.string().max(100, 'Model name too long').optional(),
  sku: z.string().max(100, 'SKU too long').optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  minOrder: z.number().int().min(1, 'Minimum order must be at least 1'),
  weight: z.number().positive('Weight must be positive').max(999.999, 'Weight too high').optional(),
  dimensions: z.object({
    length: z.number().positive('Length must be positive'),
    width: z.number().positive('Width must be positive'),
    height: z.number().positive('Height must be positive')
  }).optional(),
  colors: z.array(z.string().max(50, 'Color name too long')).optional(),
  sizes: z.array(z.string().max(20, 'Size too long')).optional(),
  specifications: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  warranty: z.string().max(500, 'Warranty description too long').optional(),
  returnPolicy: z.string().max(1000, 'Return policy too long').optional(),
  tags: z.array(z.string().max(50, 'Tag too long')).optional(),
  categoryId: z.string().cuid('Invalid category ID'),
})

export const orderSchema = z.object({
  totalAmount: z.number().positive('Total amount must be positive'),
  shippingCost: z.number().min(0, 'Shipping cost cannot be negative'),
  taxAmount: z.number().min(0, 'Tax amount cannot be negative'),
  discountAmount: z.number().min(0, 'Discount amount cannot be negative'),
  paymentMethod: z.string().max(100, 'Payment method too long').optional(),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().min(1, 'Phone is required'),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }).optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  items: z.array(z.object({
    productId: z.string().cuid('Invalid product ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    color: z.string().max(50, 'Color too long').optional(),
    size: z.string().max(20, 'Size too long').optional(),
  })).min(1, 'At least one item is required'),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().max(200, 'Title too long').optional(),
  comment: z.string().max(2000, 'Comment too long').optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  productId: z.string().cuid('Invalid product ID'),
})

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  avatar: z.string().url('Invalid avatar URL').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  location: z.string().max(200, 'Location too long').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  parentId: z.string().cuid('Invalid parent category ID').optional(),
})

// Partial schemas for updates
export const productUpdateSchema = productSchema.partial().extend({
  id: z.string().cuid('Invalid product ID'),
})

export const orderUpdateSchema = orderSchema.partial().extend({
  id: z.string().cuid('Invalid order ID'),
})

// Query parameter schemas
export const productQuerySchema = z.object({
  category: z.string().optional(),
  sort: z.enum(['newest', 'price-low', 'price-high', 'rating', 'popular']).default('newest'),
  minPrice: z.string().transform(val => parseFloat(val)).pipe(z.number().positive()).optional(),
  maxPrice: z.string().transform(val => parseFloat(val)).pipe(z.number().positive()).optional(),
  brand: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
  page: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(1).max(100)).default('20'),
})

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  category: z.string().optional(),
  minPrice: z.string().transform(val => parseFloat(val)).pipe(z.number().positive()).optional(),
  maxPrice: z.string().transform(val => parseFloat(val)).pipe(z.number().positive()).optional(),
  sort: z.enum(['relevance', 'price-low', 'price-high', 'rating', 'newest']).default('relevance'),
  page: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(1).max(100)).default('20'),
})

// Validation helper functions
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T> = productQuerySchema as unknown as z.ZodSchema<T>
): { success: true; data: T } | { success: false, errors: string[] } {
  const params = Object.fromEntries(searchParams.entries())
  return validateInput(schema, params)
}


