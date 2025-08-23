/**
 * Production Performance Monitoring
 * Real-time performance tracking and Core Web Vitals monitoring
 */

export interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url: string
  userAgent?: string
  connectionType?: string
}

export interface CoreWebVitals {
  fcp?: number  // First Contentful Paint
  lcp?: number  // Largest Contentful Paint
  fid?: number  // First Input Delay
  cls?: number  // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private isEnabled: boolean
  private apiEndpoint: string
  private batchSize: number = 10
  private flushInterval: number = 30000 // 30 seconds

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && 
                    process.env.NODE_ENV === 'production' &&
                    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
    
    this.apiEndpoint = '/api/analytics/performance'
    
    if (this.isEnabled) {
      this.initializeMonitoring()
    }
  }

  private initializeMonitoring(): void {
    // Monitor Core Web Vitals
    this.observeWebVitals()
    
    // Monitor navigation timing
    this.observeNavigationTiming()
    
    // Monitor resource loading
    this.observeResourceTiming()
    
    // Batch and send metrics
    this.setupBatchSending()
    
    // Clean up on page unload
    this.setupCleanup()
  }

  private observeWebVitals(): void {
    // First Contentful Paint (FCP)
    this.observeEntry('first-contentful-paint', (entry) => {
      this.recordMetric('FCP', entry.startTime)
    })

    // Largest Contentful Paint (LCP)
    this.observeEntry('largest-contentful-paint', (entry) => {
      this.recordMetric('LCP', entry.startTime)
    })

    // First Input Delay (FID)
    this.observeEntry('first-input', (entry) => {
      this.recordMetric('FID', entry.processingStart - entry.startTime)
    })

    // Cumulative Layout Shift (CLS)
    this.observeEntry('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.recordMetric('CLS', entry.value)
      }
    })
  }

  private observeNavigationTiming(): void {
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          
          if (navigation) {
            // Time to First Byte
            this.recordMetric('TTFB', navigation.responseStart - navigation.requestStart)
            
            // DOM Content Loaded
            this.recordMetric('DCL', navigation.domContentLoadedEventEnd - navigation.navigationStart)
            
            // Page Load Time
            this.recordMetric('PLT', navigation.loadEventEnd - navigation.navigationStart)
            
            // DNS Lookup Time
            this.recordMetric('DNS', navigation.domainLookupEnd - navigation.domainLookupStart)
            
            // Connection Time
            this.recordMetric('Connect', navigation.connectEnd - navigation.connectStart)
          }
        }, 0)
      })
    }
  }

  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming
            
            // Track slow resources
            if (resource.duration > 1000) { // Slower than 1 second
              this.recordMetric('SlowResource', resource.duration, {
                resourceName: resource.name,
                resourceType: this.getResourceType(resource.name)
              })
            }
          }
        })
      })
      
      observer.observe({ entryTypes: ['resource'] })
    }
  }

  private observeEntry(entryType: string, callback: (entry: any) => void): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(callback)
        })
        observer.observe({ entryTypes: [entryType] })
      } catch (error) {
        // Silently fail if entry type is not supported
        console.warn(`Performance entry type '${entryType}' not supported`)
      }
    }
  }

  private recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return

    const metric: PerformanceMetric = {
      name,
      value: Math.round(value * 100) / 100, // Round to 2 decimal places
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      ...metadata
    }

    this.metrics.push(metric)

    // Send critical metrics immediately
    if (['FCP', 'LCP', 'FID', 'CLS'].includes(name)) {
      this.sendMetric(metric)
    }
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return connection.effectiveType || 'unknown'
    }
    return 'unknown'
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script'
    if (url.includes('.css')) return 'stylesheet'
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image'
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font'
    return 'other'
  }

  private setupBatchSending(): void {
    setInterval(() => {
      this.flushMetrics()
    }, this.flushInterval)
  }

  private setupCleanup(): void {
    window.addEventListener('beforeunload', () => {
      this.flushMetrics()
    })

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushMetrics()
      }
    })
  }

  private async sendMetric(metric: PerformanceMetric): Promise<void> {
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics: [metric] }),
        keepalive: true
      })
    } catch (error) {
      console.warn('Failed to send performance metric:', error)
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return

    const metricsToSend = this.metrics.splice(0, this.batchSize)
    
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics: metricsToSend }),
        keepalive: true
      })
    } catch (error) {
      console.warn('Failed to flush performance metrics:', error)
    }
  }

  // Public API
  public getCoreWebVitals(): Promise<CoreWebVitals> {
    return new Promise((resolve) => {
      const vitals: CoreWebVitals = {}
      
      // Collect current metrics
      const currentMetrics = this.metrics.filter(m => 
        ['FCP', 'LCP', 'FID', 'CLS', 'TTFB'].includes(m.name)
      )
      
      currentMetrics.forEach(metric => {
        switch (metric.name) {
          case 'FCP':
            vitals.fcp = metric.value
            break
          case 'LCP':
            vitals.lcp = metric.value
            break
          case 'FID':
            vitals.fid = metric.value
            break
          case 'CLS':
            vitals.cls = metric.value
            break
          case 'TTFB':
            vitals.ttfb = metric.value
            break
        }
      })
      
      resolve(vitals)
    })
  }

  public trackCustomMetric(name: string, value: number, metadata?: Record<string, any>): void {
    this.recordMetric(`Custom_${name}`, value, metadata)
  }

  public getPerformanceScore(): Promise<number> {
    return this.getCoreWebVitals().then(vitals => {
      let score = 100
      
      // Scoring based on Core Web Vitals thresholds
      if (vitals.fcp && vitals.fcp > 1800) score -= 20
      if (vitals.lcp && vitals.lcp > 2500) score -= 25
      if (vitals.fid && vitals.fid > 100) score -= 25
      if (vitals.cls && vitals.cls > 0.1) score -= 30
      
      return Math.max(0, score)
    })
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Web Vitals reporting utilities
export function reportWebVitals(metric: any): void {
  performanceMonitor.trackCustomMetric(metric.name, metric.value, {
    id: metric.id,
    label: metric.label
  })
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    trackMetric: (name: string, value: number, metadata?: Record<string, any>) => {
      performanceMonitor.trackCustomMetric(name, value, metadata)
    },
    getCoreWebVitals: () => performanceMonitor.getCoreWebVitals(),
    getPerformanceScore: () => performanceMonitor.getPerformanceScore()
  }
}