import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

/**
 * Production Database Configuration
 * Handles database connections, connection pooling, and health checks
 */

// Database configuration based on environment
const getDatabaseConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  
  const config = {
    // Connection pooling
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    
    // Logging configuration
    log: [
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
      ...(isProduction ? [] : [
        { level: 'query', emit: 'event' },
        { level: 'info', emit: 'event' }
      ])
    ] as const,
    
    // Error formatting
    errorFormat: isProduction ? 'minimal' : 'pretty',
    
    // Connection timeout
    __internal: {
      engine: {
        connectTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '5000'),
        queryTimeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT || '10000'),
      }
    }
  }
  
  return config
}

// Singleton pattern for database connection
class DatabaseManager {
  private static instance: DatabaseManager
  private prisma: PrismaClient | null = null
  private isConnected = false
  private connectionAttempts = 0
  private maxConnectionAttempts = 5
  private reconnectDelay = 1000 // Start with 1 second

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  async connect(): Promise<PrismaClient> {
    if (this.prisma && this.isConnected) {
      return this.prisma
    }

    try {
      this.connectionAttempts++
      logger.info('Attempting database connection', { 
        attempt: this.connectionAttempts,
        maxAttempts: this.maxConnectionAttempts 
      })

      this.prisma = new PrismaClient(getDatabaseConfig())

      // Set up event listeners
      this.setupEventListeners()

      // Test the connection
      await this.prisma.$connect()
      
      // Run a simple query to verify
      await this.prisma.$queryRaw`SELECT 1`
      
      this.isConnected = true
      this.connectionAttempts = 0
      this.reconnectDelay = 1000

      logger.info('Database connected successfully')
      return this.prisma

    } catch (error) {
      logger.error('Database connection failed', error instanceof Error ? error : undefined, {
        attempt: this.connectionAttempts,
        maxAttempts: this.maxConnectionAttempts
      })

      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        logger.error('Max database connection attempts reached')
        throw new Error('Failed to connect to database after maximum attempts')
      }

      // Exponential backoff
      await this.sleep(this.reconnectDelay)
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000) // Max 30 seconds

      return this.connect()
    }
  }

  private setupEventListeners(): void {
    if (!this.prisma) return

    // Log database queries in development
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$on('query', (e) => {
        logger.debug('Database query', {
          query: e.query,
          params: e.params,
          duration: e.duration
        })
      })
    }

    // Log errors
    this.prisma.$on('error', (e) => {
      logger.error('Database error', undefined, { error: e })
      this.isConnected = false
    })

    // Log warnings
    this.prisma.$on('warn', (e) => {
      logger.warn('Database warning', { warning: e.message })
    })

    // Log info in development
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$on('info', (e) => {
        logger.info('Database info', { info: e.message })
      })
    }
  }

  async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect()
      this.prisma = null
      this.isConnected = false
      logger.info('Database disconnected')
    }
  }

  async healthCheck(): Promise<{
    isHealthy: boolean
    latency: number
    error?: string
  }> {
    if (!this.prisma || !this.isConnected) {
      return {
        isHealthy: false,
        latency: -1,
        error: 'Database not connected'
      }
    }

    try {
      const start = Date.now()
      await this.prisma.$queryRaw`SELECT 1`
      const latency = Date.now() - start

      return {
        isHealthy: true,
        latency
      }
    } catch (error) {
      return {
        isHealthy: false,
        latency: -1,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  getClient(): PrismaClient {
    if (!this.prisma || !this.isConnected) {
      throw new Error('Database not connected. Call connect() first.')
    }
    return this.prisma
  }

  isReady(): boolean {
    return this.isConnected && this.prisma !== null
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Database migration utilities
  async runMigrations(): Promise<void> {
    if (!this.prisma) {
      throw new Error('Database not connected')
    }

    try {
      logger.info('Running database migrations...')
      
      // In production, migrations should be run separately
      // This is here for development/staging environments
      if (process.env.NODE_ENV !== 'production') {
        const { execSync } = await import('child_process')
        execSync('npx prisma migrate deploy', { stdio: 'inherit' })
      }
      
      logger.info('Database migrations completed')
    } catch (error) {
      logger.error('Database migration failed', error instanceof Error ? error : undefined)
      throw error
    }
  }

  // Database seeding
  async seedDatabase(): Promise<void> {
    if (!this.prisma) {
      throw new Error('Database not connected')
    }

    try {
      logger.info('Seeding database...')
      
      // Check if database is already seeded
      const userCount = await this.prisma.user.count()
      if (userCount > 0) {
        logger.info('Database already seeded, skipping')
        return
      }

      // Import and run seed script
      const { seedDatabase } = await import('./seed-demo')
      await seedDatabase(this.prisma)
      
      logger.info('Database seeding completed')
    } catch (error) {
      logger.error('Database seeding failed', error instanceof Error ? error : undefined)
      throw error
    }
  }

  // Performance monitoring
  async getPerformanceMetrics(): Promise<{
    activeConnections: number
    slowQueries: number
    averageQueryTime: number
    cacheHitRatio: number
  }> {
    if (!this.prisma) {
      throw new Error('Database not connected')
    }

    try {
      // These queries are PostgreSQL specific
      // You might need to adjust for other databases
      const [activeConnections, slowQueries] = await Promise.all([
        this.prisma.$queryRaw<Array<{ count: bigint }>>
          `SELECT count(*) FROM pg_stat_activity WHERE state = 'active'`,
        this.prisma.$queryRaw<Array<{ count: bigint }>>
          `SELECT count(*) FROM pg_stat_statements WHERE mean_time > 1000`
      ])

      return {
        activeConnections: Number(activeConnections[0]?.count || 0),
        slowQueries: Number(slowQueries[0]?.count || 0),
        averageQueryTime: 0, // This would need more complex queries
        cacheHitRatio: 0 // This would need cache-specific queries
      }
    } catch (error) {
      logger.warn('Could not fetch performance metrics', { error })
      return {
        activeConnections: 0,
        slowQueries: 0,
        averageQueryTime: 0,
        cacheHitRatio: 0
      }
    }
  }
}

// Export singleton instance
export const db = DatabaseManager.getInstance()

// Convenience export for the Prisma client
export const prisma = () => db.getClient()

// Database utilities
export class DatabaseUtils {
  // Transaction wrapper with retry logic
  static async withRetry<T>(
    operation: (prisma: PrismaClient) => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const client = db.getClient()
        return await operation(client)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        logger.warn('Database operation failed, retrying', {
          attempt,
          maxRetries,
          error: lastError.message
        })
        
        if (attempt === maxRetries) {
          break
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
    
    throw lastError
  }

  // Batch operations with proper error handling
  static async batchOperation<T, R>(
    items: T[],
    operation: (item: T, prisma: PrismaClient) => Promise<R>,
    batchSize = 100
  ): Promise<R[]> {
    const results: R[] = []
    const client = db.getClient()
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      try {
        const batchResults = await Promise.all(
          batch.map(item => operation(item, client))
        )
        results.push(...batchResults)
      } catch (error) {
        logger.error('Batch operation failed', error instanceof Error ? error : undefined, {
          batchStart: i,
          batchSize: batch.length
        })
        throw error
      }
    }
    
    return results
  }
}

// Connection management for graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing database connection')
  await db.disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing database connection')
  await db.disconnect()
  process.exit(0)
})

// Auto-connect in production
if (process.env.NODE_ENV === 'production') {
  db.connect().catch(error => {
    logger.error('Failed to auto-connect to database', error instanceof Error ? error : undefined)
    process.exit(1)
  })
}

export default db