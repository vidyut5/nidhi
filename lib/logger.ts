import { envValidator } from './env-validation'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogContext {
  [key: string]: any
}

class Logger {
  private level: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      if (this.isDevelopment) {
        console.debug(this.formatMessage('DEBUG', message, context))
      }
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, context))
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = {
        ...context,
        error: error?.message,
        stack: error?.stack,
        name: error?.name
      }
      console.error(this.formatMessage('ERROR', message, errorContext))
    }
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      const errorContext = {
        ...context,
        error: error?.message,
        stack: error?.stack,
        name: error?.name
      }
      console.error(this.formatMessage('FATAL', message, errorContext))
    }
  }

  // Specialized logging methods
  api(route: string, method: string, status: number, duration: number, context?: LogContext): void {
    this.info(`API ${method} ${route} - ${status} (${duration}ms)`, {
      route,
      method,
      status,
      duration,
      ...context
    })
  }

  database(operation: string, table: string, duration: number, context?: LogContext): void {
    this.info(`DB ${operation} on ${table} (${duration}ms)`, {
      operation,
      table,
      duration,
      ...context
    })
  }

  security(event: string, user?: string, ip?: string, context?: LogContext): void {
    this.warn(`SECURITY: ${event}`, {
      event,
      user,
      ip,
      ...context
    })
  }

  performance(operation: string, duration: number, context?: LogContext): void {
    if (duration > 1000) { // Log slow operations as warnings
      this.warn(`SLOW OPERATION: ${operation} (${duration}ms)`, {
        operation,
        duration,
        ...context
      })
    } else {
      this.debug(`PERFORMANCE: ${operation} (${duration}ms)`, {
        operation,
        duration,
        ...context
      })
    }
  }
}

export const logger = new Logger()

// Convenience functions
export const logDebug = logger.debug.bind(logger)
export const logInfo = logger.info.bind(logger)
export const logWarn = logger.warn.bind(logger)
export const logError = logger.error.bind(logger)
export const logFatal = logger.fatal.bind(logger)
export const logApi = logger.api.bind(logger)
export const logDatabase = logger.database.bind(logger)
export const logSecurity = logger.security.bind(logger)
export const logPerformance = logger.performance.bind(logger)



