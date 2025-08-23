import { NextResponse } from 'next/server'
import type { ApiResponse, PaginatedResponse } from '@/types/product'

// Standard API response builder
export class ApiResponseBuilder<T = any> {
  private response: ApiResponse<T> = {}

  success(data: T, message?: string): this {
    this.response = {
      data,
      message: message || 'Success'
    }
    return this
  }

  error(message: string, code?: string): this {
    this.response = {
      error: message,
      code: code || 'ERROR'
    }
    return this
  }

  paginated<U>(data: U[], pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }): this {
    this.response = {
      data: {
        data,
        pagination
      } as unknown as T
    }
    return this
  }

  build(): ApiResponse<T> {
    return this.response
  }

  send(status: number = 200): NextResponse {
    return NextResponse.json(this.response, { status })
  }
}

// Convenience functions for common response patterns
export function successResponse<T>(data: T, message?: string, status: number = 200): NextResponse {
  return new ApiResponseBuilder<T>()
    .success(data, message)
    .send(status)
}

export function errorResponse(message: string, code?: string, status: number = 400): NextResponse {
  return new ApiResponseBuilder()
    .error(message, code)
    .send(status)
}

export function notFoundResponse(message: string = 'Resource not found'): NextResponse {
  return errorResponse(message, 'NOT_FOUND', 404)
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return errorResponse(message, 'UNAUTHORIZED', 401)
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return errorResponse(message, 'FORBIDDEN', 403)
}

export function conflictResponse(message: string = 'Conflict'): NextResponse {
  return errorResponse(message, 'CONFLICT', 409)
}

export function validationErrorResponse(errors: string[], message: string = 'Validation failed'): NextResponse {
  return new ApiResponseBuilder()
    .error(message, 'VALIDATION_ERROR')
    .send(400)
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  status: number = 200
): NextResponse {
  const totalPages = Math.ceil(total / limit)
  
  return new ApiResponseBuilder<T>()
    .paginated(data, { page, limit, total, totalPages })
    .send(status)
}

// Response with headers
export function responseWithHeaders<T>(
  data: T,
  headers: Record<string, string>,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Cached response
export function cachedResponse<T>(
  data: T,
  maxAge: number = 300, // 5 minutes default
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })
  response.headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`)
  return response
}

// Error response with details
export function detailedErrorResponse(
  message: string,
  details: Record<string, any>,
  code?: string,
  status: number = 400
): NextResponse {
  return NextResponse.json({
    error: message,
    code: code || 'ERROR',
    details
  }, { status })
}

// Success response with metadata
export function successWithMetadata<T>(
  data: T,
  metadata: Record<string, any>,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json({
    data,
    message: message || 'Success',
    metadata
  }, { status })
}

// Rate limit response
export function rateLimitResponse(
  retryAfter: number,
  message: string = 'Too many requests'
): NextResponse {
  const response = NextResponse.json({
    error: message,
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter
  }, { status: 429 })
  
  response.headers.set('Retry-After', retryAfter.toString())
  return response
}

// File download response
export function fileDownloadResponse(
  fileBuffer: Buffer,
  filename: string,
  contentType: string = 'application/octet-stream'
): NextResponse {
  const response = new NextResponse(fileBuffer as any, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': fileBuffer.length.toString()
    }
  })
  
  return response
}

// Streaming response
export function streamingResponse(
  stream: ReadableStream,
  contentType: string = 'text/plain'
): NextResponse {
  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Transfer-Encoding': 'chunked'
    }
  })
}



