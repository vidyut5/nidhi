/**
 * Global Teardown for E2E Tests
 * Cleans up test environment after running E2E tests
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test environment cleanup...')
  
  // Create browser instance for cleanup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Navigate to the application
    await page.goto(process.env.BASE_URL || 'http://localhost:3000')
    
    // Perform cleanup tasks
    await cleanupTestData(page)
    await cleanupTestUsers(page)
    
    console.log('✅ E2E test environment cleanup completed successfully')
    
  } catch (error) {
    console.error('❌ E2E test environment cleanup failed:', error)
    // Don't throw error here as it might mask test failures
  } finally {
    await browser.close()
  }
}

async function cleanupTestData(page: any) {
  console.log('🗑️ Cleaning up test data...')
  
  await page.evaluate(async () => {
    try {
      await fetch('/api/admin/cleanup-test-data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'e2e-test-data' })
      })
    } catch (error) {
      console.warn('Test data cleanup failed:', error)
    }
  })
}

async function cleanupTestUsers(page: any) {
  console.log('👥 Cleaning up test users...')
  
  const testEmails = [
    'test@example.com',
    'seller@example.com',
    'admin@example.com'
  ]
  
  for (const email of testEmails) {
    await page.evaluate(async (userEmail) => {
      try {
        await fetch('/api/admin/cleanup-test-user', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        })
      } catch (error) {
        console.warn(`Test user cleanup failed for ${userEmail}:`, error)
      }
    }, email)
  }
}

export default globalTeardown