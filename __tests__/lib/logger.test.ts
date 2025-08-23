import { logger, LogLevel } from '@/lib/logger'

// Mock console methods
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}

global.console = mockConsole as any

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true
    })
  })

  describe('Log Levels', () => {
    it('should log debug messages in development', () => {
      logger.debug('Test debug message')
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG: Test debug message')
      )
    })

    it('should log info messages', () => {
      logger.info('Test info message')
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO: Test info message')
      )
    })

    it('should log warning messages', () => {
      logger.warn('Test warning message')
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN: Test warning message')
      )
    })

    it('should log error messages', () => {
      const error = new Error('Test error')
      logger.error('Test error message', error)
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Test error message')
      )
    })

    it('should log fatal messages', () => {
      const error = new Error('Test fatal error')
      logger.fatal('Test fatal message', error)
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('FATAL: Test fatal message')
      )
    })
  })

  describe('Context Logging', () => {
    it('should include context in log messages', () => {
      const context = { userId: '123', action: 'login' }
      logger.info('User action', context)
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO: User action')
      )
    })

    it('should handle error context properly', () => {
      const error = new Error('Database connection failed')
      const context = { operation: 'connect', database: 'main' }
      
      logger.error('Database error', error, context)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Database error')
      )
    })
  })

  describe('Specialized Logging', () => {
    it('should log API requests', () => {
      logger.api('/api/users', 'GET', 200, 150, { userId: '123' })
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO: API GET /api/users - 200 (150ms)')
      )
    })

    it('should log database operations', () => {
      logger.database('SELECT', 'users', 25, { table: 'users' })
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO: DB SELECT on users (25ms)')
      )
    })

    it('should log security events', () => {
      logger.security('Failed login attempt', 'user@example.com', '192.168.1.1')
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN: SECURITY: Failed login attempt')
      )
    })

    it('should log performance metrics', () => {
      logger.performance('Database query', 50)
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG: PERFORMANCE: Database query (50ms)')
      )
    })

    it('should log slow operations as warnings', () => {
      logger.performance('Slow database query', 1500)
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN: SLOW OPERATION: Slow database query (1500ms)')
      )
    })
  })

  describe('Environment Handling', () => {
    it('should respect NODE_ENV setting', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true
      })
      
      // Recreate logger with production environment
      const { logger: prodLogger } = require('@/lib/logger')
      
      prodLogger.debug('Debug message in production')
      
      // Debug should not be logged in production
      expect(mockConsole.debug).not.toHaveBeenCalled()
    })

    it('should log info messages in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true
      })
      
      const { logger: prodLogger } = require('@/lib/logger')
      
      prodLogger.info('Info message in production')
      
      expect(mockConsole.info).toHaveBeenCalled()
    })
  })

  describe('Timestamp Formatting', () => {
    it('should include ISO timestamp in log messages', () => {
      const before = new Date()
      logger.info('Test message')
      const after = new Date()
      
      const logCall = mockConsole.info.mock.calls[0][0]
      const timestamp = logCall.match(/\[(.*?)\]/)?.[1]
      
      expect(timestamp).toBeDefined()
      
      const logTime = new Date(timestamp!)
      expect(logTime.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(logTime.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('Error Handling', () => {
    it('should handle undefined errors gracefully', () => {
      logger.error('Error message', undefined)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Error message')
      )
    })

    it('should handle non-Error objects', () => {
      const nonError = { message: 'Custom error', code: 500 }
      logger.error('Custom error', nonError as any)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Custom error')
      )
    })
  })
})
