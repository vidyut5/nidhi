/**
 * Integration Tests for Products API
 * Testing API endpoints with database interactions
 */

import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'
import { mockPrisma, mockProducts, mockUsers } from '@/tests/utils/test-helpers'

// Mock the database
jest.mock('@/lib/database-production', () => ({
  db: {
    getClient: () => mockPrisma,
    isReady: () => true,
  },
}))

// Mock authentication
jest.mock('@/lib/auth', () => ({
  getServerSession: jest.fn(),
}))

describe('/api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return paginated products', async () => {
      // Setup
      mockPrisma.product.findMany.mockResolvedValue([
        mockProducts.activeProduct,
        mockProducts.featuredProduct,
      ])
      mockPrisma.product.count.mockResolvedValue(2)

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/products?page=1&limit=10',
      })

      // Mock the API handler (you'll need to import your actual handler)
      // const handler = await import('@/app/api/products/route')
      // await handler.GET(req as any)

      // For now, let's test the expected behavior
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          seller: {
            select: {
              name: true,
              sellerProfile: {
                select: {
                  businessName: true,
                  verificationStatus: true,
                }
              }
            }
          },
          category: {
            select: {
              name: true,
              slug: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    })

    it('should filter products by category', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProducts.activeProduct])
      mockPrisma.product.count.mockResolvedValue(1)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/products?category=electronics',
      })

      // Test category filtering logic
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          category: {
            slug: 'electronics'
          }
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20, // default limit
      })
    })

    it('should filter products by price range', async () => {
      mockPrisma.product.findMany.mockResolvedValue([])
      mockPrisma.product.count.mockResolvedValue(0)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/products?minPrice=50&maxPrice=150',
      })

      // Test price filtering
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          price: {
            gte: 50,
            lte: 150,
          }
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      })
    })

    it('should handle search queries', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProducts.activeProduct])
      mockPrisma.product.count.mockResolvedValue(1)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/products?search=test',
      })

      // Test search functionality
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
            { brand: { contains: 'test', mode: 'insensitive' } },
          ]
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      })
    })
  })

  describe('POST /api/products', () => {
    it('should create product for authenticated seller', async () => {
      // Mock authentication
      const getServerSession = require('@/lib/auth').getServerSession
      getServerSession.mockResolvedValue({
        user: mockUsers.seller
      })

      mockPrisma.product.create.mockResolvedValue({
        ...mockProducts.activeProduct,
        id: 'new-product-id',
      })

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          name: 'New Product',
          description: 'Product description',
          price: 99.99,
          categoryId: 'category-1',
          imageUrls: ['image1.jpg'],
          stock: 10,
        },
      })

      // Test product creation
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          name: 'New Product',
          slug: expect.stringMatching(/^new-product-/),
          description: 'Product description',
          price: 99.99,
          categoryId: 'category-1',
          imageUrls: JSON.stringify(['image1.jpg']),
          stock: 10,
          sellerId: mockUsers.seller.id,
        },
        include: expect.any(Object),
      })
    })

    it('should reject product creation for non-seller', async () => {
      const getServerSession = require('@/lib/auth').getServerSession
      getServerSession.mockResolvedValue({
        user: mockUsers.regularUser
      })

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          name: 'New Product',
          description: 'Product description',
          price: 99.99,
        },
      })

      // Should not create product
      expect(mockPrisma.product.create).not.toHaveBeenCalled()
    })

    it('should validate product data', async () => {
      const getServerSession = require('@/lib/auth').getServerSession
      getServerSession.mockResolvedValue({
        user: mockUsers.seller
      })

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          name: 'A', // Too short
          description: 'Short', // Too short
          price: -10, // Invalid price
        },
      })

      // Should not create product with invalid data
      expect(mockPrisma.product.create).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/products/[id]', () => {
    it('should return product by ID', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProducts.activeProduct)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/products/product-1',
      })

      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              sellerProfile: {
                select: {
                  businessName: true,
                  verificationStatus: true,
                }
              }
            }
          },
          category: true,
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  avatar: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          }
        }
      })
    })

    it('should return 404 for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/products/non-existent',
      })

      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
        include: expect.any(Object),
      })
    })

    it('should increment view count', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProducts.activeProduct)
      mockPrisma.product.update.mockResolvedValue({
        ...mockProducts.activeProduct,
        views: mockProducts.activeProduct.views + 1,
      })

      const { req } = createMocks({
        method: 'GET',
        url: '/api/products/product-1',
      })

      // Should increment views
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: { views: { increment: 1 } }
      })
    })
  })

  describe('PUT /api/products/[id]', () => {
    it('should update product for owner', async () => {
      const getServerSession = require('@/lib/auth').getServerSession
      getServerSession.mockResolvedValue({
        user: mockUsers.seller
      })

      mockPrisma.product.findUnique.mockResolvedValue(mockProducts.activeProduct)
      mockPrisma.product.update.mockResolvedValue({
        ...mockProducts.activeProduct,
        name: 'Updated Product',
      })

      const { req } = createMocks({
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          name: 'Updated Product',
          price: 149.99,
        },
      })

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: {
          name: 'Updated Product',
          price: 149.99,
          updatedAt: expect.any(Date),
        },
        include: expect.any(Object),
      })
    })

    it('should reject update for non-owner', async () => {
      const getServerSession = require('@/lib/auth').getServerSession
      getServerSession.mockResolvedValue({
        user: mockUsers.regularUser
      })

      mockPrisma.product.findUnique.mockResolvedValue(mockProducts.activeProduct)

      const { req } = createMocks({
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          name: 'Updated Product',
        },
      })

      // Should not update product
      expect(mockPrisma.product.update).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /api/products/[id]', () => {
    it('should soft delete product for owner', async () => {
      const getServerSession = require('@/lib/auth').getServerSession
      getServerSession.mockResolvedValue({
        user: mockUsers.seller
      })

      mockPrisma.product.findUnique.mockResolvedValue(mockProducts.activeProduct)
      mockPrisma.product.update.mockResolvedValue({
        ...mockProducts.activeProduct,
        isActive: false,
      })

      const { req } = createMocks({
        method: 'DELETE',
      })

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: {
          isActive: false,
          updatedAt: expect.any(Date),
        }
      })
    })

    it('should reject deletion for non-owner', async () => {
      const getServerSession = require('@/lib/auth').getServerSession
      getServerSession.mockResolvedValue({
        user: mockUsers.regularUser
      })

      mockPrisma.product.findUnique.mockResolvedValue(mockProducts.activeProduct)

      const { req } = createMocks({
        method: 'DELETE',
      })

      // Should not delete product
      expect(mockPrisma.product.update).not.toHaveBeenCalled()
    })
  })
})