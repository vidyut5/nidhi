import { 
  productSchema, 
  orderSchema, 
  validateInput, 
  validateQueryParams,
  productQuerySchema
} from '@/lib/validation'
import { z } from 'zod'

describe('Validation Schemas', () => {
  describe('productSchema', () => {
    it('should validate a valid product', () => {
      const validProduct = {
        name: 'Test Product',
        description: 'A test product description',
        price: 99.99,
        imageUrls: ['https://example.com/image1.jpg'],
        stock: 10,
        minOrder: 1,
        categoryId: 'cl1234567890abcdef'
      }

      const result = validateInput(productSchema, validProduct)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validProduct)
      }
    })

    it('should reject product with missing required fields', () => {
      const invalidProduct = {
        name: 'Test Product',
        // missing description, price, imageUrls, etc.
      }

      const result = validateInput(productSchema, invalidProduct)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('description: Description is required')
        expect(result.errors).toContain('price: Price must be positive')
        expect(result.errors).toContain('imageUrls: At least one image is required')
      }
    })

    it('should reject product with invalid price', () => {
      const invalidProduct = {
        name: 'Test Product',
        description: 'A test product description',
        price: -10, // negative price
        imageUrls: ['https://example.com/image1.jpg'],
        stock: 10,
        minOrder: 1,
        categoryId: 'cl1234567890abcdef'
      }

      const result = validateInput(productSchema, invalidProduct)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('price: Price must be positive')
      }
    })

    it('should reject product with invalid image URLs', () => {
      const invalidProduct = {
        name: 'Test Product',
        description: 'A test product description',
        price: 99.99,
        imageUrls: ['not-a-url', 'https://example.com/image1.jpg'],
        stock: 10,
        minOrder: 1,
        categoryId: 'cl1234567890abcdef'
      }

      const result = validateInput(productSchema, invalidProduct)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('imageUrls: Invalid image URL')
      }
    })
  })

  describe('orderSchema', () => {
    it('should validate a valid order', () => {
      const validOrder = {
        totalAmount: 199.99,
        shippingCost: 9.99,
        taxAmount: 19.99,
        discountAmount: 0,
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA',
          phone: '555-1234'
        },
        items: [
          {
            productId: 'cl1234567890abcdef',
            quantity: 2,
            color: 'Blue',
            size: 'M'
          }
        ]
      }

      const result = validateInput(orderSchema, validOrder)
      expect(result.success).toBe(true)
    })

    it('should reject order with invalid address', () => {
      const invalidOrder = {
        totalAmount: 199.99,
        shippingCost: 9.99,
        taxAmount: 19.99,
        discountAmount: 0,
        shippingAddress: {
          firstName: '', // empty first name
          lastName: 'Doe',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'USA',
          phone: '555-1234'
        },
        items: [
          {
            productId: 'cl1234567890abcdef',
            quantity: 2
          }
        ]
      }

      const result = validateInput(orderSchema, invalidOrder)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('shippingAddress.firstName: First name is required')
      }
    })
  })

  describe('validateQueryParams', () => {
    it('should validate valid query parameters', () => {
      const searchParams = new URLSearchParams({
        category: 'electronics',
        sort: 'price-low',
        minPrice: '10',
        maxPrice: '100',
        page: '1',
        limit: '20'
      })

      const result = validateQueryParams(searchParams, productQuerySchema as any)
      expect(result.success).toBe(true)
    })

    it('should provide default values for missing parameters', () => {
      const searchParams = new URLSearchParams({
        category: 'electronics'
      })

      const result = validateQueryParams(searchParams, productQuerySchema as any)
      expect(result.success).toBe(true)
      if (result.success) {
        const data = result.data as z.infer<typeof productQuerySchema>
        expect(data.sort).toBe('newest')
        expect(data.page).toBe(1)
        expect(data.limit).toBe(20)
      }
    })
  })
})

describe('Validation Helper Functions', () => {
  describe('validateInput', () => {
    it('should return success for valid data', () => {
      const validData = {
        name: 'Test',
        description: 'Test description',
        price: 10,
        imageUrls: ['https://example.com/image.jpg'],
        stock: 5,
        minOrder: 1,
        categoryId: 'cl1234567890abcdef'
      }

      const result = validateInput(productSchema, validData)
      expect(result.success).toBe(true)
    })

    it('should return errors for invalid data', () => {
      const invalidData = {
        name: '',
        description: '',
        price: -5,
        imageUrls: [],
        stock: -1,
        minOrder: 0,
        categoryId: ''
      }

      const result = validateInput(productSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0)
      }
    })
  })
})



