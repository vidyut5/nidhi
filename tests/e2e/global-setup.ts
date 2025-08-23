/**
 * Global Setup for E2E Tests
 * Prepares test environment before running E2E tests
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test environment setup...')
  
  // Create browser instance for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...')
    await page.goto(process.env.BASE_URL || 'http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    // Perform any necessary setup tasks
    await setupTestData(page)
    await setupTestUsers(page)
    
    console.log('✅ E2E test environment setup completed successfully')
    
  } catch (error) {
    console.error('❌ E2E test environment setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

async function setupTestData(page: any) {
  // Setup test data through API calls or direct database operations
  console.log('📝 Setting up test data...')
  
  // Example: Create test categories
  await page.evaluate(async () => {
    try {
      await fetch('/api/admin/seed-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'e2e-test-data' })
      })
    } catch (error) {
      console.warn('Test data setup failed:', error)
    }
  })
}

async function setupTestUsers(page: any) {
  console.log('👥 Setting up test users...')
  
  // Create test users if they don't exist
  const testUsers = [
    {
      email: 'test@example.com',
      password: 'TestPassword123!',
      name: 'Test User',
      role: 'USER'
    },
    {
      email: 'seller@example.com',
      password: 'SellerPassword123!',
      name: 'Test Seller',
      role: 'SELLER'
    },
    {
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      name: 'Test Admin',
      role: 'ADMIN'
    }
  ]
  
  for (const user of testUsers) {
    await page.evaluate(async (userData) => {
      try {
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
      } catch (error) {
        // User might already exist, that's okay
        console.log(`User ${userData.email} might already exist`)
      }
    }, user)
  }
}

export default globalSetup