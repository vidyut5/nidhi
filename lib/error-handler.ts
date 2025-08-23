export interface AppError {
  code: string
  message: string
  details?: unknown
  statusCode: number
}

export class ValidationError extends Error implements AppError {
  public code = 'VALIDATION_ERROR'
  public statusCode = 400
  
  constructor(message: string, public details?: unknown) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error implements AppError {
  public code = 'AUTHENTICATION_ERROR'
  public statusCode = 401
  
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error implements AppError {
  public code = 'AUTHORIZATION_ERROR'
  public statusCode = 403
  
  constructor(message: string = 'Access denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error implements AppError {
  public code = 'NOT_FOUND'
  public statusCode = 404
  
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error implements AppError {
  public code = 'CONFLICT'
  public statusCode = 409
  
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends Error implements AppError {
  public code = 'RATE_LIMIT_EXCEEDED'
  public statusCode = 429
  
  constructor(message: string = 'Too many requests') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class InternalServerError extends Error implements AppError {
  public code = 'INTERNAL_SERVER_ERROR'
  public statusCode = 500
  
  constructor(message: string = 'Internal server error') {
    super(message)
    this.name = 'InternalServerError'
  }
}

// Error handler for API routes
export function handleApiError(error: unknown): { status: number; body: { error: string; code?: string } } {
  // Import logger dynamically to avoid circular dependencies
  import('./logger').then(({ logger }) => {
    if (error instanceof Error) {
      logger.error('API Error occurred', error, {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    } else {
      logger.error('Unknown API Error occurred', undefined, { error })
    }
  }).catch(() => {
    // Fallback to console if logger fails to load
    console.error('API Error:', error)
  })
  
  // Handle known app errors
  if (error instanceof ValidationError) {
    return {
      status: error.statusCode,
      body: { error: error.message, code: error.code }
    }
  }
  
  if (error instanceof AuthenticationError) {
    return {
      status: error.statusCode,
      body: { error: error.message, code: error.code }
    }
  }
  
  if (error instanceof AuthorizationError) {
    return {
      status: error.statusCode,
      body: { error: error.message, code: error.code }
    }
  }
  
  if (error instanceof NotFoundError) {
    return {
      status: error.statusCode,
      body: { error: error.message, code: error.code }
    }
  }
  
  if (error instanceof ConflictError) {
    return {
      status: error.statusCode,
      body: { error: error.message, code: error.code }
    }
  }
  
  if (error instanceof RateLimitError) {
    return {
      status: error.statusCode,
      body: { error: error.message, code: error.code }
    }
  }
  
  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message?: string }
    
    switch (prismaError.code) {
      case 'P2002':
        return {
          status: 409,
          body: { error: 'Resource already exists', code: 'DUPLICATE_ENTRY' }
        }
      case 'P2025':
        return {
          status: 404,
          body: { error: 'Resource not found', code: 'NOT_FOUND' }
        }
      case 'P2003':
        return {
          status: 400,
          body: { error: 'Invalid reference', code: 'FOREIGN_KEY_CONSTRAINT' }
        }
      default:
        break
    }
  }
  
  // Handle unknown errors
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    return {
      status: 500,
      body: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    }
  }
  
  // Production: generic error message
  return {
    status: 500,
    body: { error: 'Something went wrong', code: 'INTERNAL_SERVER_ERROR' }
  }
}

// Safe error logging (prevents sensitive data exposure)
export function logError(error: unknown, context?: string): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error
  }
  
  // Import logger dynamically to avoid circular dependencies
  import('./logger').then(({ logger }) => {
    logger.error('Application Error occurred', error instanceof Error ? error : undefined, errorInfo)
  }).catch(() => {
    // Fallback to console if logger fails to load
    console.error('Application Error:', JSON.stringify(errorInfo, null, 2))
  })
}
