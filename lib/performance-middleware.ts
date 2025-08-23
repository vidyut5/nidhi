import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

export interface PerformanceMetrics {
  route: string
  method: string
  duration: number
  status: number
  timestamp: string
  userAgent?: string
  ip?: string
  userId?: string
}

export interface PerformanceConfig {
  enabled: boolean
  logSlowRequests: boolean
  slowRequestThreshold: number // milliseconds
  logAllRequests: boolean
  includeHeaders: boolean
  includeBody: boolean
  maxBodySize: number // bytes
}

const defaultConfig: PerformanceConfig = {
  enabled: true,
  logSlowRequests: true,
  slowRequestThreshold: 1000, // 1 second
  logAllRequests: false,
  includeHeaders: false,
  includeBody: false,
  maxBodySize: 1024 * 10 // 10KB
}

export function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: Partial<PerformanceConfig> = {}
) {
  const finalConfig = { ...defaultConfig, ...config }
  
  return async (req: NextRequest) => {
    if (!finalConfig.enabled) {
      return handler(req)
    }

    const startTime = Date.now()
    const route = req.nextUrl.pathname
    const method = req.method
    let response: NextResponse
    let status = 500
    let error: Error | null = null

    try {
      // Capture request details
      const requestDetails: Partial<PerformanceMetrics> = {
        route,
        method,
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent') || undefined,
        ip: req.headers.get('x-forwarded-for')?.split(',')[0] || 
            req.headers.get('x-real-ip') || 
            'unknown'
      }

      // Extract user ID if available
      try {
        const authHeader = req.headers.get('authorization')
        if (authHeader?.startsWith('Bearer ')) {
          // This is a simplified extraction - in real apps, you'd validate the JWT
          const token = authHeader.substring(7)
          // For now, just log that we have a token
          requestDetails.userId = 'authenticated'
        }
      } catch (e) {
        // Ignore auth extraction errors
      }

      // Execute the handler
      response = await handler(req)
      status = response.status

      // Log performance metrics
      const duration = Date.now() - startTime
      const metrics: PerformanceMetrics = {
        ...requestDetails,
        duration,
        status
      } as PerformanceMetrics

      // Log based on configuration
      if (finalConfig.logAllRequests || 
          (finalConfig.logSlowRequests && duration > finalConfig.slowRequestThreshold)) {
        
        const logData: any = {
          route: metrics.route,
          method: metrics.method,
          duration: `${duration}ms`,
          status: metrics.status,
          ip: metrics.ip
        }

        if (finalConfig.includeHeaders) {
          logData.headers = Object.fromEntries(req.headers.entries())
        }

        if (finalConfig.includeBody && req.body) {
          try {
            const bodyText = await req.text()
            if (bodyText.length <= finalConfig.maxBodySize) {
              logData.body = bodyText
            } else {
              logData.body = `${bodyText.substring(0, finalConfig.maxBodySize)}... (truncated)`
            }
            // Reconstruct the request since we consumed the body
            req = new NextRequest(req.url, {
              method: req.method,
              headers: req.headers,
              body: bodyText
            })
          } catch (e) {
            logData.bodyError = 'Failed to read body'
          }
        }

        if (duration > finalConfig.slowRequestThreshold) {
          logger.warn('Slow API request detected', { ...logData })
        } else if (finalConfig.logAllRequests) {
          logger.info('API request completed', { ...logData })
        }
      }

      // Log performance metrics for monitoring
      logger.debug('Performance metrics', {
        type: 'api_performance',
        ...metrics
      })

      return response

    } catch (err) {
      const duration = Date.now() - startTime
      error = err instanceof Error ? err : new Error('Unknown error')
      status = 500

      // Log error with performance context
      logger.error('API request failed', error, {
        route,
        method,
        duration: `${duration}ms`,
        status,
        ip: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        error: error.message,
        stack: error.stack
      })

      // Return error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Performance monitoring decorator for API routes
export function performanceMonitored(config?: Partial<PerformanceConfig>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = withPerformanceMonitoring(originalMethod, config)
    
    return descriptor
  }
}

// Utility function to measure function execution time
export function measureExecutionTime<T>(
  fn: () => T | Promise<T>,
  name: string
): Promise<T> {
  const startTime = Date.now()
  
  return Promise.resolve(fn()).finally(() => {
    const duration = Date.now() - startTime
    logger.debug('Function execution time', {
      function: name,
      duration: `${duration}ms`
    })
  })
}

// Utility function to measure async function execution time
export function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>,
  name: string
): Promise<T> {
  const startTime = Date.now()
  
  return fn().finally(() => {
    const duration = Date.now() - startTime
    logger.debug('Async function execution time', {
      function: name,
      duration: `${duration}ms`
    })
  })
}



