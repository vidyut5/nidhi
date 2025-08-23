import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Production Security Configuration
 * Implements comprehensive security measures for production deployment
 */

// Security headers configuration
export const securityHeaders = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' data: https:",
    "connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.google-analytics.com",
    "frame-src 'self' https://checkout.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // HTTP Strict Transport Security (HSTS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': [
    'geolocation=(self)',
    'microphone=()',
    'camera=()',
    'fullscreen=(self)',
    'payment=(self "https://checkout.razorpay.com")'
  ].join(', ')
}

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests: boolean
  skipFailedRequests: boolean
  keyGenerator: (req: NextRequest) => string
}

export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // General API rate limiting
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => req.ip || 'anonymous'
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    keyGenerator: (req) => req.ip || 'anonymous'
  },
  
  // Search endpoints
  search: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 20,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => req.ip || 'anonymous'
  },
  
  // File upload endpoints
  upload: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 10,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => req.ip || 'anonymous'
  },
  
  // Contact/support endpoints
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    keyGenerator: (req) => req.ip || 'anonymous'
  }
}

// Input validation schemas
export const validationSchemas = {
  // User registration
  userRegistration: z.object({
    email: z.string().email('Invalid email format').max(255),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain uppercase, lowercase, number and special character'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional()
  }),
  
  // Product creation
  productCreation: z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    price: z.number().min(0.01, 'Price must be greater than 0').max(10000000),
    categoryId: z.string().cuid('Invalid category ID'),
    imageUrls: z.array(z.string().url()).min(1, 'At least one image is required').max(10),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    brand: z.string().max(100).optional(),
    model: z.string().max(100).optional(),
    sku: z.string().max(100).optional()
  }),
  
  // Order creation
  orderCreation: z.object({
    items: z.array(z.object({
      productId: z.string().cuid(),
      quantity: z.number().int().min(1).max(999),
      price: z.number().min(0.01)
    })).min(1, 'At least one item is required'),
    shippingAddress: z.object({
      street: z.string().min(5).max(200),
      city: z.string().min(2).max(100),
      state: z.string().min(2).max(100),
      pincode: z.string().regex(/^\d{6}$/, 'Invalid Indian pincode'),
      phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
    }),
    paymentMethod: z.enum(['razorpay', 'cod', 'stripe'])
  }),
  
  // Search query
  searchQuery: z.object({
    q: z.string().min(2, 'Search query must be at least 2 characters').max(100),
    category: z.string().optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(50).optional()
  }),
  
  // Contact form
  contactForm: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(255),
    subject: z.string().min(5).max(200),
    message: z.string().min(10).max(2000),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional()
  })
}

// Sanitization utilities
export class InputSanitizer {
  private static stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '')
  }
  
  private static escapeHtml(str: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
    return str.replace(/[&<>"'/]/g, (s) => map[s])
  }
  
  private static normalizeWhitespace(str: string): string {
    return str.replace(/\s+/g, ' ').trim()
  }
  
  static sanitizeString(input: string, options: {
    stripHtml?: boolean
    escapeHtml?: boolean
    normalizeWhitespace?: boolean
    maxLength?: number
  } = {}): string {
    let result = input
    
    if (options.stripHtml) {
      result = this.stripHtml(result)
    }
    
    if (options.escapeHtml) {
      result = this.escapeHtml(result)
    }
    
    if (options.normalizeWhitespace) {
      result = this.normalizeWhitespace(result)
    }
    
    if (options.maxLength && result.length > options.maxLength) {
      result = result.substring(0, options.maxLength)
    }
    
    return result
  }
  
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }
  
  static sanitizePhone(phone: string): string {
    return phone.replace(/\D/g, '')
  }
  
  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url)
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol')
      }
      return parsed.toString()
    } catch {
      throw new Error('Invalid URL')
    }
  }
}

// Security middleware factory
export function createSecurityMiddleware(options: {
  enableRateLimit?: boolean
  enableCors?: boolean
  enableCSRF?: boolean
} = {}) {
  return async function securityMiddleware(
    request: NextRequest
  ): Promise<NextResponse> {
    const response = NextResponse.next()
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // CORS handling
    if (options.enableCors) {
      const origin = request.headers.get('origin')
      const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || []
      
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
        response.headers.set(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS'
        )
        response.headers.set(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, X-Requested-With'
        )
      }
    }
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }
    
    return response
  }
}

// Password security utilities
export class PasswordSecurity {
  private static readonly MIN_LENGTH = 8
  private static readonly MAX_LENGTH = 128
  
  static validatePassword(password: string): {
    isValid: boolean
    errors: string[]
    strength: 'weak' | 'medium' | 'strong'
  } {
    const errors: string[] = []
    
    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`)
    }
    
    if (password.length > this.MAX_LENGTH) {
      errors.push(`Password must not exceed ${this.MAX_LENGTH} characters`)
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)')
    }
    
    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', 'qwerty', 'admin', 'letmein',
      'welcome', 'monkey', '1234567890', 'password123'
    ]
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common')
    }
    
    // Calculate strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak'
    if (errors.length === 0) {
      const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      const hasNumbers = /\d/.test(password)
      const hasUpper = /[A-Z]/.test(password)
      const hasLower = /[a-z]/.test(password)
      const isLongEnough = password.length >= 12
      
      const criteriaCount = [hasSpecialChars, hasNumbers, hasUpper, hasLower, isLongEnough]
        .filter(Boolean).length
      
      if (criteriaCount >= 4) {
        strength = 'strong'
      } else if (criteriaCount >= 3) {
        strength = 'medium'
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength
    }
  }
  
  static generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&'
    let password = ''
    
    // Ensure at least one character from each required set
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    password += '0123456789'[Math.floor(Math.random() * 10)]
    password += '@$!%*?&'[Math.floor(Math.random() * 7)]
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }
}

// Session security
export class SessionSecurity {
  static generateSessionId(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  static validateSessionId(sessionId: string): boolean {
    return /^[a-f0-9]{64}$/.test(sessionId)
  }
  
  static isSessionExpired(createdAt: Date, maxAge: number): boolean {
    return Date.now() - createdAt.getTime() > maxAge * 1000
  }
}

export default {
  securityHeaders,
  rateLimitConfigs,
  validationSchemas,
  InputSanitizer,
  PasswordSecurity,
  SessionSecurity,
  createSecurityMiddleware
}