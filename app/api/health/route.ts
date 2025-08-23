import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-production'
import { productionLogger } from '@/lib/logger-production'

/**
 * Health Check API
 * Provides system health status for monitoring
 */

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: HealthCheck
    logging: HealthCheck
    memory: HealthCheck
    disk?: HealthCheck
  }
  metadata?: Record<string, any>
}

interface HealthCheck {
  status: 'pass' | 'warn' | 'fail'
  responseTime?: number
  message?: string
  details?: Record<string, any>
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Initialize health status
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: { status: 'pass' },
        logging: { status: 'pass' },
        memory: { status: 'pass' }
      }
    }

    // Check database health
    const dbStartTime = Date.now()
    try {
      const dbHealth = await db.healthCheck()
      healthStatus.checks.database = {
        status: dbHealth.isHealthy ? 'pass' : 'fail',
        responseTime: dbHealth.latency,
        message: dbHealth.error || 'Database connection healthy',
        details: {
          latency: dbHealth.latency
        }
      }
      
      if (!dbHealth.isHealthy) {
        healthStatus.status = 'unhealthy'
      }
    } catch (error) {
      healthStatus.checks.database = {
        status: 'fail',
        responseTime: Date.now() - dbStartTime,
        message: error instanceof Error ? error.message : 'Database health check failed'
      }
      healthStatus.status = 'unhealthy'
    }

    // Check logging system health
    try {
      const logHealth = await productionLogger.healthCheck()
      healthStatus.checks.logging = {
        status: 'pass',
        message: 'Logging system operational',
        details: logHealth.details
      }
    } catch (error) {
      healthStatus.checks.logging = {
        status: 'warn',
        message: 'Logging system issues detected'
      }
      if (healthStatus.status === 'healthy') {
        healthStatus.status = 'degraded'
      }
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
    
    healthStatus.checks.memory = {
      status: memoryUsagePercent > 90 ? 'fail' : memoryUsagePercent > 75 ? 'warn' : 'pass',
      message: `Memory usage: ${memoryUsagePercent.toFixed(1)}%`,
      details: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024)
      }
    }

    if (healthStatus.checks.memory.status === 'fail') {
      healthStatus.status = 'unhealthy'
    } else if (healthStatus.checks.memory.status === 'warn' && healthStatus.status === 'healthy') {
      healthStatus.status = 'degraded'
    }

    // Check disk usage (if available)
    try {
      const fs = await import('fs/promises')
      const stats = await fs.statfs('.')
      const freeSpace = stats.free
      const totalSpace = stats.size
      const usedPercent = ((totalSpace - freeSpace) / totalSpace) * 100

      healthStatus.checks.disk = {
        status: usedPercent > 90 ? 'fail' : usedPercent > 80 ? 'warn' : 'pass',
        message: `Disk usage: ${usedPercent.toFixed(1)}%`,
        details: {
          free: Math.round(freeSpace / 1024 / 1024 / 1024),
          total: Math.round(totalSpace / 1024 / 1024 / 1024),
          used: Math.round((totalSpace - freeSpace) / 1024 / 1024 / 1024)
        }
      }

      if (healthStatus.checks.disk.status === 'fail') {
        healthStatus.status = 'unhealthy'
      } else if (healthStatus.checks.disk.status === 'warn' && healthStatus.status === 'healthy') {
        healthStatus.status = 'degraded'
      }
    } catch (error) {
      // Disk check is optional
      healthStatus.checks.disk = {
        status: 'warn',
        message: 'Disk usage check unavailable'
      }
    }

    // Add metadata
    healthStatus.metadata = {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      environment: process.env.NODE_ENV,
      totalCheckTime: Date.now() - startTime
    }

    // Determine HTTP status code
    const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503

    // Log health check
    productionLogger.info('Health check completed', {
      status: healthStatus.status,
      responseTime: Date.now() - startTime,
      checks: Object.fromEntries(
        Object.entries(healthStatus.checks).map(([key, check]) => [key, check.status])
      )
    }, request)

    return NextResponse.json(healthStatus, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    // Fallback health status
    const fallbackStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: { status: 'fail', message: 'Health check failed' },
        logging: { status: 'fail', message: 'Health check failed' },
        memory: { status: 'fail', message: 'Health check failed' }
      },
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        totalCheckTime: Date.now() - startTime
      }
    }

    productionLogger.error('Health check failed', error instanceof Error ? error : undefined, {
      responseTime: Date.now() - startTime
    }, request)

    return NextResponse.json(fallbackStatus, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
  }
}

// Simple ping endpoint
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}