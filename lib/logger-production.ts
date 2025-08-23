/**
 * Production-Grade Logging System
 * Comprehensive logging with Sentry integration and monitoring
 */

import { NextRequest } from 'next/server'

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
type LogContext = Record<string, any>

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error
  requestId?: string
  userId?: string
  sessionId?: string
  ip?: string
  userAgent?: string
  url?: string
  method?: string
  stack?: string
}

interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  enableSentry: boolean
  enableAnalytics: boolean
  maxFileSize: number
  maxFiles: number
}

class ProductionLogger {
  private config: LoggerConfig
  private logQueue: LogEntry[] = []
  private isFlushScheduled = false
  private readonly levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
  }

  constructor() {
    this.config = {
      level: (process.env.LOG_LEVEL as LogLevel) || 'info',
      enableConsole: process.env.NODE_ENV !== 'test',
      enableFile: process.env.NODE_ENV === 'production',
      enableSentry: !!process.env.SENTRY_DSN,
      enableAnalytics: process.env.ENABLE_LOGGING === 'true',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10
    }

    // Initialize Sentry if available
    if (this.config.enableSentry && typeof window === 'undefined') {
      this.initializeSentry()
    }

    // Setup periodic flush
    if (typeof window === 'undefined') {
      setInterval(() => this.flushLogs(), 30000) // Flush every 30 seconds
    }
  }

  private async initializeSentry(): Promise<void> {
    try {
      const Sentry = await import('@sentry/nextjs')
      
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
        ],
        beforeSend(event, hint) {
          // Filter out sensitive information
          if (event.request?.headers) {
            delete event.request.headers.authorization
            delete event.request.headers.cookie
          }
          return event
        }
      })
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error)
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.config.enableFile || typeof window !== 'undefined') return

    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const logDir = path.join(process.cwd(), 'logs')
      const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`)
      
      // Ensure log directory exists
      await fs.mkdir(logDir, { recursive: true })
      
      // Format log entry
      const logLine = JSON.stringify(entry) + '\n'
      
      // Append to file
      await fs.appendFile(logFile, logLine)
      
      // Rotate logs if needed
      await this.rotateLogs(logDir)
    } catch (error) {
      console.error('Failed to write log to file:', error)
    }
  }

  private async rotateLogs(logDir: string): Promise<void> {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const files = await fs.readdir(logDir)
      const logFiles = files.filter(file => file.endsWith('.log'))
        .map(file => ({ name: file, path: path.join(logDir, file) }))
      
      // Sort by modification time
      const stats = await Promise.all(
        logFiles.map(async file => ({
          ...file,
          stats: await fs.stat(file.path)
        }))
      )
      
      stats.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime())
      
      // Remove old files
      if (stats.length > this.config.maxFiles) {
        const filesToDelete = stats.slice(this.config.maxFiles)
        await Promise.all(filesToDelete.map(file => fs.unlink(file.path)))
      }
      
      // Check file sizes
      for (const file of stats) {
        if (file.stats.size > this.config.maxFileSize) {
          // Archive large file
          const archivedName = file.name.replace('.log', `-${Date.now()}.log.archived`)
          await fs.rename(file.path, path.join(logDir, archivedName))
        }
      }
    } catch (error) {
      console.error('Failed to rotate logs:', error)
    }
  }

  private async sendToSentry(entry: LogEntry): Promise<void> {
    if (!this.config.enableSentry || typeof window !== 'undefined') return

    try {
      const Sentry = await import('@sentry/nextjs')
      
      Sentry.withScope((scope) => {
        scope.setLevel(entry.level as any)
        scope.setTag('component', 'logger')
        
        if (entry.userId) scope.setUser({ id: entry.userId })
        if (entry.requestId) scope.setTag('requestId', entry.requestId)
        if (entry.url) scope.setTag('url', entry.url)
        if (entry.context) scope.setContext('additional', entry.context)
        
        if (entry.error) {
          Sentry.captureException(entry.error)
        } else {
          Sentry.captureMessage(entry.message)
        }
      })
    } catch (error) {
      console.error('Failed to send to Sentry:', error)
    }
  }

  private queueLog(entry: LogEntry): void {
    this.logQueue.push(entry)
    
    if (!this.isFlushScheduled) {
      this.isFlushScheduled = true
      // Flush immediately for errors, otherwise batch
      const delay = entry.level === 'error' || entry.level === 'fatal' ? 0 : 1000
      setTimeout(() => this.flushLogs(), delay)
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0) {
      this.isFlushScheduled = false
      return
    }

    const logsToFlush = [...this.logQueue]
    this.logQueue = []
    this.isFlushScheduled = false

    // Process logs in parallel
    await Promise.allSettled(
      logsToFlush.map(async (entry) => {
        await Promise.all([
          this.writeToFile(entry),
          this.sendToSentry(entry)
        ])
      })
    )
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: LogContext,
    request?: NextRequest
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    }

    if (error) {
      entry.error = error
      entry.stack = error.stack
    }

    if (request) {
      entry.requestId = request.headers.get('x-request-id') || undefined
      entry.ip = request.ip || request.headers.get('x-forwarded-for') || undefined
      entry.userAgent = request.headers.get('user-agent') || undefined
      entry.url = request.url
      entry.method = request.method
    }

    // Extract user context from various sources
    if (typeof window !== 'undefined') {
      entry.url = window.location.href
      entry.userAgent = navigator.userAgent
    }

    return entry
  }

  // Public logging methods
  debug(message: string, context?: LogContext, request?: NextRequest): void {
    if (!this.shouldLog('debug')) return
    
    const entry = this.createLogEntry('debug', message, undefined, context, request)
    
    if (this.config.enableConsole) {
      console.debug(this.formatMessage('debug', message, context))
    }
    
    this.queueLog(entry)
  }

  info(message: string, context?: LogContext, request?: NextRequest): void {
    if (!this.shouldLog('info')) return
    
    const entry = this.createLogEntry('info', message, undefined, context, request)
    
    if (this.config.enableConsole) {
      console.info(this.formatMessage('info', message, context))
    }
    
    this.queueLog(entry)
  }

  warn(message: string, context?: LogContext, request?: NextRequest): void {
    if (!this.shouldLog('warn')) return
    
    const entry = this.createLogEntry('warn', message, undefined, context, request)
    
    if (this.config.enableConsole) {
      console.warn(this.formatMessage('warn', message, context))
    }
    
    this.queueLog(entry)
  }

  error(message: string, error?: Error, context?: LogContext, request?: NextRequest): void {
    if (!this.shouldLog('error')) return
    
    const entry = this.createLogEntry('error', message, error, context, request)
    
    if (this.config.enableConsole) {
      console.error(this.formatMessage('error', message, context), error)
    }
    
    this.queueLog(entry)
  }

  fatal(message: string, error?: Error, context?: LogContext, request?: NextRequest): void {
    const entry = this.createLogEntry('fatal', message, error, context, request)
    
    if (this.config.enableConsole) {
      console.error(this.formatMessage('fatal', message, context), error)
    }
    
    this.queueLog(entry)
    
    // Force immediate flush for fatal errors
    this.flushLogs()
  }

  // Request logging helper
  logRequest(request: NextRequest, response?: { status: number }, duration?: number): void {
    const context: LogContext = {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for')
    }

    if (response) {
      context.status = response.status
    }

    if (duration !== undefined) {
      context.duration = `${duration}ms`
    }

    const level = response && response.status >= 400 ? 'warn' : 'info'
    const message = `${request.method} ${request.url}${response ? ` - ${response.status}` : ''}${duration ? ` (${duration}ms)` : ''}`
    
    this[level](message, context, request)
  }

  // Performance logging
  logPerformance(metric: string, value: number, context?: LogContext): void {
    this.info(`Performance: ${metric}`, {
      metric,
      value,
      unit: 'ms',
      ...context
    })
  }

  // Security event logging
  logSecurityEvent(event: string, context?: LogContext, request?: NextRequest): void {
    this.warn(`Security: ${event}`, {
      securityEvent: event,
      ...context
    }, request)
  }

  // Business logic logging
  logBusiness(event: string, context?: LogContext): void {
    this.info(`Business: ${event}`, {
      businessEvent: event,
      ...context
    })
  }

  // Health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    const details = {
      level: this.config.level,
      queueSize: this.logQueue.length,
      sentryEnabled: this.config.enableSentry,
      fileLoggingEnabled: this.config.enableFile
    }

    return {
      status: 'healthy',
      details
    }
  }
}

// Export singleton instance
export const productionLogger = new ProductionLogger()

// Export types
export type { LogLevel, LogContext, LogEntry }