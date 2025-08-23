/**
 * E2E Tests for Critical User Flows
 * Testing complete user journeys from start to finish
 */

import { test, expect, Page } from '@playwright/test'

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
  phone: '9876543210',
}

const testProduct = {
  name: 'Test Product E2E',
  description: 'This is a test product for E2E testing',
  price: '99.99',
  stock: '10',
}

// Page Object Models
class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  async searchProduct(query: string) {
    await this.page.fill('[data-testid=\"search-input\"]', query)
    await this.page.press('[data-testid=\"search-input\"]', 'Enter')
    await this.page.waitForLoadState('networkidle')
  }

  async clickCategory(categoryName: string) {
    await this.page.click(`[data-testid=\"category-${categoryName.toLowerCase()}\"]`)
    await this.page.waitForLoadState('networkidle')
  }
}

class AuthPage {
  constructor(private page: Page) {}

  async gotoSignup() {
    await this.page.goto('/auth/signup')
    await this.page.waitForLoadState('networkidle')
  }

  async gotoSignin() {
    await this.page.goto('/auth/signin')
    await this.page.waitForLoadState('networkidle')
  }

  async signup(userData = testUser) {
    await this.page.fill('[data-testid=\"signup-email\"]', userData.email)
    await this.page.fill('[data-testid=\"signup-password\"]', userData.password)
    await this.page.fill('[data-testid=\"signup-name\"]', userData.name)
    await this.page.fill('[data-testid=\"signup-phone\"]', userData.phone)
    
    await this.page.click('[data-testid=\"signup-submit\"]')
    await this.page.waitForLoadState('networkidle')
  }

  async signin(email = testUser.email, password = testUser.password) {
    await this.page.fill('[data-testid=\"signin-email\"]', email)
    await this.page.fill('[data-testid=\"signin-password\"]', password)
    
    await this.page.click('[data-testid=\"signin-submit\"]')
    await this.page.waitForLoadState('networkidle')
  }
}

class ProductPage {
  constructor(private page: Page) {}

  async addToCart() {
    await this.page.click('[data-testid=\"add-to-cart\"]')
    await this.page.waitForSelector('[data-testid=\"cart-notification\"]')
  }

  async addToWishlist() {
    await this.page.click('[data-testid=\"add-to-wishlist\"]')
    await this.page.waitForSelector('[data-testid=\"wishlist-notification\"]')
  }

  async selectQuantity(quantity: number) {
    await this.page.selectOption('[data-testid=\"quantity-select\"]', quantity.toString())
  }
}

class CartPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/cart')
    await this.page.waitForLoadState('networkidle')
  }

  async proceedToCheckout() {
    await this.page.click('[data-testid=\"proceed-to-checkout\"]')
    await this.page.waitForLoadState('networkidle')
  }

  async updateQuantity(productId: string, quantity: number) {
    await this.page.fill(`[data-testid=\"quantity-${productId}\"]`, quantity.toString())
    await this.page.press(`[data-testid=\"quantity-${productId}\"]`, 'Enter')
    await this.page.waitForLoadState('networkidle')
  }

  async removeItem(productId: string) {
    await this.page.click(`[data-testid=\"remove-${productId}\"]`)
    await this.page.waitForSelector('[data-testid=\"cart-updated\"]')
  }
}

class CheckoutPage {
  constructor(private page: Page) {}

  async fillShippingAddress() {
    await this.page.fill('[data-testid=\"shipping-street\"]', '123 Test Street')
    await this.page.fill('[data-testid=\"shipping-city\"]', 'Test City')
    await this.page.fill('[data-testid=\"shipping-state\"]', 'Test State')
    await this.page.fill('[data-testid=\"shipping-pincode\"]', '123456')
    await this.page.fill('[data-testid=\"shipping-phone\"]', '9876543210')
  }

  async selectPaymentMethod(method: 'cod' | 'razorpay') {
    await this.page.click(`[data-testid=\"payment-${method}\"]`)
  }

  async placeOrder() {
    await this.page.click('[data-testid=\"place-order\"]')
    await this.page.waitForLoadState('networkidle')
  }
}

// Test Suite: User Registration and Authentication
test.describe('User Authentication Flow', () => {
  test('should allow user to sign up and sign in', async ({ page }) => {
    const authPage = new AuthPage(page)
    
    // Test signup
    await authPage.gotoSignup()
    await expect(page).toHaveTitle(/Sign Up/)
    
    await authPage.signup()
    
    // Should redirect to welcome page or dashboard
    await expect(page).toHaveURL(/welcome|dashboard/)
    
    // Sign out
    await page.click('[data-testid=\"user-menu\"]')
    await page.click('[data-testid=\"sign-out\"]')
    
    // Test signin
    await authPage.gotoSignin()
    await authPage.signin()
    
    // Should be signed in
    await expect(page.locator('[data-testid=\"user-menu\"]')).toBeVisible()
  })

  test('should show validation errors for invalid signup data', async ({ page }) => {
    const authPage = new AuthPage(page)
    
    await authPage.gotoSignup()
    
    // Try to submit with empty fields
    await page.click('[data-testid=\"signup-submit\"]')
    
    // Should show validation errors
    await expect(page.locator('[data-testid=\"error-email\"]')).toBeVisible()
    await expect(page.locator('[data-testid=\"error-password\"]')).toBeVisible()
    await expect(page.locator('[data-testid=\"error-name\"]')).toBeVisible()
  })

  test('should handle incorrect login credentials', async ({ page }) => {
    const authPage = new AuthPage(page)
    
    await authPage.gotoSignin()
    await authPage.signin('wrong@email.com', 'wrongpassword')
    
    // Should show error message
    await expect(page.locator('[data-testid=\"signin-error\"]')).toBeVisible()
  })
})

// Test Suite: Product Browsing and Search
test.describe('Product Discovery Flow', () => {
  test('should allow browsing products by category', async ({ page }) => {
    const homePage = new HomePage(page)
    
    await homePage.goto()
    await homePage.clickCategory('Electronics')
    
    // Should be on category page
    await expect(page).toHaveURL(/category\/electronics/)
    await expect(page.locator('[data-testid=\"category-title\"]')).toContainText('Electronics')
    
    // Should show products
    await expect(page.locator('[data-testid=\"product-card\"]')).toHaveCount({ min: 1 })
  })

  test('should search for products', async ({ page }) => {
    const homePage = new HomePage(page)
    
    await homePage.goto()
    await homePage.searchProduct('smartphone')
    
    // Should be on search results page
    await expect(page).toHaveURL(/search/)
    await expect(page.locator('[data-testid=\"search-results\"]')).toBeVisible()
  })

  test('should filter products by price range', async ({ page }) => {
    await page.goto('/category/electronics')
    
    // Set price filters
    await page.fill('[data-testid=\"min-price\"]', '50')
    await page.fill('[data-testid=\"max-price\"]', '200')
    await page.click('[data-testid=\"apply-filters\"]')
    
    await page.waitForLoadState('networkidle')
    
    // Should show filtered results
    const productPrices = await page.locator('[data-testid=\"product-price\"]').allTextContents()
    productPrices.forEach(priceText => {
      const price = parseFloat(priceText.replace('₹', '').replace(',', ''))
      expect(price).toBeGreaterThanOrEqual(50)
      expect(price).toBeLessThanOrEqual(200)
    })
  })
})

// Test Suite: Shopping Cart Flow
test.describe('Shopping Cart Flow', () => {
  test('should add product to cart and checkout', async ({ page }) => {
    const homePage = new HomePage(page)
    const productPage = new ProductPage(page)
    const cartPage = new CartPage(page)
    const checkoutPage = new CheckoutPage(page)
    const authPage = new AuthPage(page)
    
    // First sign in
    await authPage.gotoSignin()
    await authPage.signin()
    
    // Browse to a product
    await homePage.goto()
    await page.click('[data-testid=\"product-card\"]').first()
    
    // Add to cart
    await productPage.selectQuantity(2)
    await productPage.addToCart()
    
    // Go to cart
    await cartPage.goto()
    
    // Verify product is in cart
    await expect(page.locator('[data-testid=\"cart-item\"]')).toHaveCount(1)
    
    // Proceed to checkout
    await cartPage.proceedToCheckout()
    
    // Fill checkout form
    await checkoutPage.fillShippingAddress()
    await checkoutPage.selectPaymentMethod('cod')
    await checkoutPage.placeOrder()
    
    // Should redirect to order confirmation
    await expect(page).toHaveURL(/orders\//)
    await expect(page.locator('[data-testid=\"order-success\"]')).toBeVisible()
  })

  test('should update cart quantities', async ({ page }) => {
    const cartPage = new CartPage(page)
    
    // Assume product is already in cart
    await cartPage.goto()
    
    const initialQuantity = await page.locator('[data-testid=\"quantity-product-1\"]').inputValue()
    await cartPage.updateQuantity('product-1', parseInt(initialQuantity) + 1)
    
    // Verify quantity updated
    const newQuantity = await page.locator('[data-testid=\"quantity-product-1\"]').inputValue()
    expect(parseInt(newQuantity)).toBe(parseInt(initialQuantity) + 1)
  })

  test('should remove items from cart', async ({ page }) => {
    const cartPage = new CartPage(page)
    
    await cartPage.goto()
    
    const initialItemCount = await page.locator('[data-testid=\"cart-item\"]').count()
    
    if (initialItemCount > 0) {
      await cartPage.removeItem('product-1')
      
      const newItemCount = await page.locator('[data-testid=\"cart-item\"]').count()
      expect(newItemCount).toBe(initialItemCount - 1)
    }
  })
})

// Test Suite: Mobile Responsiveness
test.describe('Mobile Responsiveness', () => {
  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    const homePage = new HomePage(page)
    await homePage.goto()
    
    // Mobile navigation should be visible
    await expect(page.locator('[data-testid=\"mobile-menu-button\"]')).toBeVisible()
    
    // Desktop navigation should be hidden
    await expect(page.locator('[data-testid=\"desktop-nav\"]')).toBeHidden()
    
    // Test mobile menu
    await page.click('[data-testid=\"mobile-menu-button\"]')
    await expect(page.locator('[data-testid=\"mobile-menu\"]')).toBeVisible()
  })
})

// Test Suite: Performance and Accessibility
test.describe('Performance and Accessibility', () => {
  test('should meet performance benchmarks', async ({ page }) => {
    await page.goto('/')
    
    // Measure Core Web Vitals
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              resolve(entry.startTime)
            }
          }
        }).observe({ entryTypes: ['paint'] })
      })
    })
    
    // FCP should be under 1.8 seconds
    expect(fcp).toBeLessThan(1800)
  })

  test('should be accessible', async ({ page }) => {
    await page.goto('/')
    
    // Check for basic accessibility features
    await expect(page.locator('h1')).toBeVisible()
    
    // Check for alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i)
      const alt = await image.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1) // Should have exactly one h1
  })
})"