import { envValidator } from './env-check'
import { logger } from './logger'

export async function validateStartup(): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = []
  
  try {
    logger.info('Starting application validation...')
    
    // 1. Environment validation
    const envResult = envValidator.validate()
    if (!envResult.isValid) {
      errors.push('Environment validation failed')
      envResult.missing.forEach(missing => errors.push(`Missing: ${missing}`))
    }
    
    // 2. Database connection test
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      await prisma.$connect()
      await prisma.$disconnect()
      logger.info('Database connection test passed')
    } catch (error) {
      errors.push('Database connection failed')
      logger.error('Database connection test failed', error instanceof Error ? error : undefined)
    }
    
    // 3. File system permissions
    try {
      const fs = await import('fs/promises')
      const testDir = './.test-permissions'
      await fs.mkdir(testDir, { recursive: true })
      await fs.rmdir(testDir)
      logger.info('File system permissions test passed')
    } catch (error) {
      errors.push('File system permissions test failed')
      logger.error('File system permissions test failed', error instanceof Error ? error : undefined)
    }
    
    // 4. Memory availability check
    const memUsage = process.memoryUsage()
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    }
    
    logger.info('Memory usage', { memoryUsage: memUsageMB })
    
    if (memUsageMB.heapUsed > 100) {
      logger.warn('High memory usage detected', { memoryUsage: memUsageMB })
    }
    
    // 5. Node.js version check
    const nodeVersion = process.version
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    
    if (majorVersion < 18) {
      errors.push(`Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`)
    } else {
      logger.info('Node.js version check passed', { version: nodeVersion })
    }
    
    // 6. Platform compatibility
    const platform = process.platform
    const arch = process.arch
    
    logger.info('Platform information', { platform, arch })
    
    if (platform === 'win32') {
      logger.warn('Windows platform detected - some features may have limited functionality')
    }
    
    // 7. Time zone check
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    logger.info('System timezone', { timezone })
    
    // 8. Log startup completion
    if (errors.length === 0) {
      logger.info('Application startup validation completed successfully')
    } else {
      logger.error('Application startup validation failed', undefined, { errors })
    }
    
    return {
      success: errors.length === 0,
      errors
    }
    
  } catch (error) {
    logger.error('Startup validation crashed', error instanceof Error ? error : undefined)
    return {
      success: false,
      errors: ['Startup validation crashed', error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

// Auto-run validation in development
if (process.env.NODE_ENV === 'development') {
  validateStartup().catch(error => {
    logger.error('Startup validation failed to run', error instanceof Error ? error : undefined)
  })
}



