/**
 * Test Utilities and Helpers
 * Comprehensive testing utilities for unit, integration, and E2E tests
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'

// Mock data generators
export const mockUsers = {
  regularUser: {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'USER' as const,
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  seller: {
    id: 'seller-1',
    email: 'seller@example.com',
    name: 'Test Seller',
    role: 'SELLER' as const,
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    sellerProfile: {
      businessName: 'Test Business',
      verificationStatus: 'VERIFIED' as const,
    },
  },
  admin: {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN' as const,
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

export const mockProducts = {
  activeProduct: {
    id: 'product-1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test product description',
    price: 99.99,
    originalPrice: 149.99,
    imageUrls: JSON.stringify(['test1.jpg', 'test2.jpg']),
    isActive: true,
    isFeatured: false,
    stock: 50,
    sellerId: 'seller-1',
    categoryId: 'category-1',
    rating: 4.5,
    reviewCount: 10,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  featuredProduct: {
    id: 'product-2',
    name: 'Featured Product',
    slug: 'featured-product',
    description: 'Featured product description',
    price: 199.99,
    imageUrls: JSON.stringify(['featured1.jpg']),
    isActive: true,
    isFeatured: true,
    stock: 25,
    sellerId: 'seller-1',
    categoryId: 'category-1',
    rating: 4.8,
    reviewCount: 25,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

export const mockOrders = {
  processingOrder: {
    id: 'order-1',
    orderNumber: 'ORD-001',
    status: 'PROCESSING' as const,
    paymentStatus: 'PAID' as const,
    totalAmount: 99.99,
    shippingCost: 9.99,
    taxAmount: 8.99,
    shippingAddress: JSON.stringify({
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      phone: '9876543210',
    }),
    buyerId: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    items: [{
      id: 'item-1',
      quantity: 1,
      price: 99.99,
      productId: 'product-1',
    }],
  },
}

export const mockCategories = {
  electronics: {
    id: 'category-1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic products',
    isActive: true,
    parentId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  smartphones: {
    id: 'category-2',
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Mobile phones and accessories',
    isActive: true,
    parentId: 'category-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

// Test providers wrapper
interface AllTheProvidersProps {
  children: ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// API mocking utilities
export const mockApiResponse = {
  success: <T>(data: T) => ({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data }),
  }),
  error: (message: string, status = 400) => ({
    ok: false,
    status,
    json: async () => ({ success: false, error: message }),
  }),
  loading: () => new Promise(() => {}), // Never resolves
}

// Database mocking utilities
export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  order: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
}

// Form testing utilities
export const fillForm = {
  userRegistration: async (getByRole: any, userData = {}) => {
    const defaultData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      name: 'Test User',
      phone: '9876543210',
    }
    const data = { ...defaultData, ...userData }

    const emailInput = getByRole('textbox', { name: /email/i })
    const passwordInput = getByRole('textbox', { name: /password/i })
    const nameInput = getByRole('textbox', { name: /name/i })
    const phoneInput = getByRole('textbox', { name: /phone/i })

    await userEvent.type(emailInput, data.email)
    await userEvent.type(passwordInput, data.password)
    await userEvent.type(nameInput, data.name)
    await userEvent.type(phoneInput, data.phone)
  },

  productCreation: async (getByRole: any, productData = {}) => {
    const defaultData = {
      name: 'Test Product',
      description: 'Test product description',
      price: '99.99',
      stock: '10',
    }
    const data = { ...defaultData, ...productData }

    const nameInput = getByRole('textbox', { name: /product name/i })
    const descInput = getByRole('textbox', { name: /description/i })
    const priceInput = getByRole('spinbutton', { name: /price/i })
    const stockInput = getByRole('spinbutton', { name: /stock/i })

    await userEvent.type(nameInput, data.name)
    await userEvent.type(descInput, data.description)
    await userEvent.type(priceInput, data.price)
    await userEvent.type(stockInput, data.stock)
  },
}

// Wait utilities
export const waitFor = {
  loadingToFinish: () => 
    screen.waitForElementToBeRemoved(() => screen.queryByText(/loading/i)),
  elementToAppear: (text: string) => 
    screen.waitForElement(() => screen.getByText(text)),
  apiCall: (mockFn: jest.Mock) => 
    waitUntil(() => mockFn.mock.calls.length > 0),
}

// Test data cleanup
export const cleanup = {
  localStorage: () => {
    Object.keys(localStorage).forEach(key => {
      localStorage.removeItem(key)
    })
  },
  sessionStorage: () => {
    Object.keys(sessionStorage).forEach(key => {
      sessionStorage.removeItem(key)
    })
  },
  mocks: () => {
    jest.clearAllMocks()
  },
  all: () => {
    cleanup.localStorage()
    cleanup.sessionStorage()
    cleanup.mocks()
  },
}

// Export everything
export * from '@testing-library/react'
export * from '@testing-library/user-event'
export * from '@testing-library/jest-dom'
export { default as userEvent } from '@testing-library/user-event'
export { customRender as render }