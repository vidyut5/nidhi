import React from 'react'
interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

interface PerformanceReport {
  totalMetrics: number
  averageDuration: number
  slowestOperation: PerformanceMetric | null
  fastestOperation: PerformanceMetric | null
  operationsByDuration: PerformanceMetric[]
}

class PerformanceMonitor {
  metrics: PerformanceMetric[] = []
  private activeMetrics = new Map<string, PerformanceMetric>()
  private readonly maxMetrics = 1000 // Prevent memory leaks

  startTimer(name: string, metadata?: Record<string, any>): string {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    }
    
    this.activeMetrics.set(id, metric)
    
    // Clean up old metrics if we exceed the limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics / 2)
    }
    
    return id
  }

  endTimer(id: string): PerformanceMetric | null {
    const metric = this.activeMetrics.get(id)
    if (!metric) return null

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    this.metrics.push(metric)
    this.activeMetrics.delete(id)

    return metric
  }

  measure<T>(name: string, fn: () => T | Promise<T>, metadata?: Record<string, any>): T | Promise<T> {
    const id = this.startTimer(name, metadata)
    
    try {
      const result = fn()
      
      if (result instanceof Promise) {
        return result.finally(() => this.endTimer(id))
      } else {
        this.endTimer(id)
        return result
      }
    } catch (error) {
      this.endTimer(id)
      throw error
    }
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    const id = this.startTimer(name, metadata)
    
    try {
      const result = await fn()
      this.endTimer(id)
      return result
    } catch (error) {
      this.endTimer(id)
      throw error
    }
  }

  getReport(): PerformanceReport {
    if (this.metrics.length === 0) {
      return {
        totalMetrics: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null,
        operationsByDuration: []
      }
    }

    const completedMetrics = this.metrics.filter(m => m.duration !== undefined)
    const durations = completedMetrics.map(m => m.duration!)
    
    const averageDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length
    const slowestOperation = completedMetrics.reduce((slowest, current) => 
      current.duration! > slowest.duration! ? current : slowest
    )
    const fastestOperation = completedMetrics.reduce((fastest, current) => 
      current.duration! < fastest.duration! ? current : fastest
    )

    return {
      totalMetrics: this.metrics.length,
      averageDuration,
      slowestOperation,
      fastestOperation,
      operationsByDuration: [...completedMetrics].sort((a, b) => b.duration! - a.duration!)
    }
  }

  clear(): void {
    this.metrics = []
    this.activeMetrics.clear()
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name)
  }

  getSlowOperations(threshold: number): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration && m.duration > threshold)
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Convenience functions
export const measure = performanceMonitor.measure.bind(performanceMonitor)
export const measureAsync = performanceMonitor.measureAsync.bind(performanceMonitor)
export const startTimer = performanceMonitor.startTimer.bind(performanceMonitor)
export const endTimer = performanceMonitor.endTimer.bind(performanceMonitor)

// React hook for measuring component render performance
export function usePerformanceMeasure(name: string) {
  const startTime = React.useRef(performance.now())
  
  React.useEffect(() => {
    const duration = performance.now() - startTime.current
    performanceMonitor.metrics.push({
      name: `render_${name}`,
      startTime: startTime.current,
      endTime: performance.now(),
      duration
    })
  })
}

// Database query performance monitoring
export function withQueryPerformance<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) {
  return async (...args: T): Promise<R> => {
    return performanceMonitor.measureAsync(operationName, () => fn(...args), {
      type: 'database_query',
      args: args.map(arg => typeof arg)
    })
  }
}

// API route performance monitoring
export function withApiPerformance<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  routeName: string
) {
  return async (...args: T): Promise<R> => {
    return performanceMonitor.measureAsync(routeName, () => fn(...args), {
      type: 'api_route',
      route: routeName
    })
  }
}

// Performance monitoring middleware for Next.js API routes
export type ApiHandler = (req: Request, ...args: any[]) => Promise<any> | any
export function performanceMiddleware(handler: ApiHandler, routeName: string) {
  return async (req: Request, ...args: any[]) => {
    const startTime = performance.now()
    
    try {
      const result = await handler(req, ...args)
      
      const duration = performance.now() - startTime
      performanceMonitor.metrics.push({
        name: `api_${routeName}`,
        startTime,
        endTime: performance.now(),
        duration,
        metadata: {
          type: 'api_route',
          method: req.method,
          url: req.url
        }
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      performanceMonitor.metrics.push({
        name: `api_${routeName}_error`,
        startTime,
        endTime: performance.now(),
        duration,
        metadata: {
          type: 'api_route_error',
          method: req.method,
          url: req.url,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      
      throw error
    }
  }
}


