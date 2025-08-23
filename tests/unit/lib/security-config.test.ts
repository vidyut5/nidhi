/**
 * Unit Tests for Security Configuration
 * Testing security utilities and validation functions
 */

import { 
  InputSanitizer, 
  PasswordSecurity, 
  SessionSecurity,
  validationSchemas 
} from '@/lib/security-config'

describe('InputSanitizer', () => {
  describe('sanitizeString', () => {
    it('should strip HTML tags when stripHtml is true', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = InputSanitizer.sanitizeString(input, { stripHtml: true })
      expect(result).toBe('alert("xss")Hello')
    })

    it('should escape HTML entities when escapeHtml is true', () => {
      const input = '<script>alert("xss")</script>'
      const result = InputSanitizer.sanitizeString(input, { escapeHtml: true })
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
    })

    it('should normalize whitespace when normalizeWhitespace is true', () => {
      const input = '  Hello    world   '
      const result = InputSanitizer.sanitizeString(input, { normalizeWhitespace: true })
      expect(result).toBe('Hello world')
    })

    it('should truncate string when maxLength is specified', () => {
      const input = 'This is a very long string'
      const result = InputSanitizer.sanitizeString(input, { maxLength: 10 })
      expect(result).toBe('This is a ')
    })

    it('should apply multiple sanitization options', () => {
      const input = '  <b>Hello</b>    <i>world</i>   '
      const result = InputSanitizer.sanitizeString(input, {
        stripHtml: true,
        normalizeWhitespace: true,
        maxLength: 8
      })
      expect(result).toBe('Hello wo')
    })
  })

  describe('sanitizeEmail', () => {
    it('should convert email to lowercase and trim', () => {
      const input = '  TEST@EXAMPLE.COM  '
      const result = InputSanitizer.sanitizeEmail(input)
      expect(result).toBe('test@example.com')
    })
  })

  describe('sanitizePhone', () => {
    it('should remove non-digit characters', () => {
      const input = '+91-98765-43210'
      const result = InputSanitizer.sanitizePhone(input)
      expect(result).toBe('919876543210')
    })
  })

  describe('sanitizeUrl', () => {
    it('should accept valid HTTP URLs', () => {
      const input = 'http://example.com'
      const result = InputSanitizer.sanitizeUrl(input)
      expect(result).toBe('http://example.com/')
    })

    it('should accept valid HTTPS URLs', () => {
      const input = 'https://example.com/path'
      const result = InputSanitizer.sanitizeUrl(input)
      expect(result).toBe('https://example.com/path')
    })

    it('should reject invalid protocols', () => {
      const input = 'javascript:alert("xss")'
      expect(() => InputSanitizer.sanitizeUrl(input)).toThrow('Invalid protocol')
    })

    it('should reject malformed URLs', () => {
      const input = 'not-a-url'
      expect(() => InputSanitizer.sanitizeUrl(input)).toThrow('Invalid URL')
    })
  })
})

describe('PasswordSecurity', () => {
  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const password = 'StrongP@ssw0rd123'
      const result = PasswordSecurity.validatePassword(password)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.strength).toBe('strong')
    })

    it('should reject password that is too short', () => {
      const password = 'Short1!'
      const result = PasswordSecurity.validatePassword(password)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    it('should reject password without uppercase', () => {
      const password = 'lowercase123!'
      const result = PasswordSecurity.validatePassword(password)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject password without lowercase', () => {
      const password = 'UPPERCASE123!'
      const result = PasswordSecurity.validatePassword(password)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject password without numbers', () => {
      const password = 'NoNumbers!'
      const result = PasswordSecurity.validatePassword(password)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should reject password without special characters', () => {
      const password = 'NoSpecial123'
      const result = PasswordSecurity.validatePassword(password)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character (@$!%*?&)')
    })

    it('should reject common passwords', () => {
      const password = 'password123'
      const result = PasswordSecurity.validatePassword(password)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password is too common')
    })

    it('should classify password strength correctly', () => {
      const weakPassword = 'Weak123!'
      const mediumPassword = 'Medium123!'
      const strongPassword = 'VeryStrongP@ssw0rd123!'

      const weak = PasswordSecurity.validatePassword(weakPassword)
      const medium = PasswordSecurity.validatePassword(mediumPassword)
      const strong = PasswordSecurity.validatePassword(strongPassword)

      expect(weak.strength).toBe('weak')
      expect(medium.strength).toBe('medium')
      expect(strong.strength).toBe('strong')
    })
  })

  describe('generateSecurePassword', () => {
    it('should generate password of specified length', () => {
      const password = PasswordSecurity.generateSecurePassword(16)
      expect(password).toHaveLength(16)
    })

    it('should generate password with all required character types', () => {
      const password = PasswordSecurity.generateSecurePassword(16)
      
      expect(password).toMatch(/[a-z]/) // lowercase
      expect(password).toMatch(/[A-Z]/) // uppercase
      expect(password).toMatch(/\d/)    // digit
      expect(password).toMatch(/[@$!%*?&]/) // special char
    })

    it('should generate unique passwords', () => {
      const password1 = PasswordSecurity.generateSecurePassword(16)
      const password2 = PasswordSecurity.generateSecurePassword(16)
      
      expect(password1).not.toBe(password2)
    })
  })
})

describe('SessionSecurity', () => {
  describe('generateSessionId', () => {
    it('should generate 64-character hex string', () => {
      const sessionId = SessionSecurity.generateSessionId()
      expect(sessionId).toHaveLength(64)
      expect(sessionId).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should generate unique session IDs', () => {
      const id1 = SessionSecurity.generateSessionId()
      const id2 = SessionSecurity.generateSessionId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('validateSessionId', () => {
    it('should validate correct session ID format', () => {
      const validId = 'a'.repeat(64)
      expect(SessionSecurity.validateSessionId(validId)).toBe(true)
    })

    it('should reject invalid session ID length', () => {
      const invalidId = 'a'.repeat(32)
      expect(SessionSecurity.validateSessionId(invalidId)).toBe(false)
    })

    it('should reject invalid session ID characters', () => {
      const invalidId = 'g'.repeat(64) // 'g' is not valid hex
      expect(SessionSecurity.validateSessionId(invalidId)).toBe(false)
    })
  })

  describe('isSessionExpired', () => {
    it('should return false for non-expired session', () => {
      const createdAt = new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      const maxAge = 60 * 60 // 1 hour
      expect(SessionSecurity.isSessionExpired(createdAt, maxAge)).toBe(false)
    })

    it('should return true for expired session', () => {
      const createdAt = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      const maxAge = 60 * 60 // 1 hour
      expect(SessionSecurity.isSessionExpired(createdAt, maxAge)).toBe(true)
    })
  })
})

describe('Validation Schemas', () => {
  describe('userRegistration', () => {
    it('should validate correct user registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'StrongP@ssw0rd123',
        name: 'Test User',
        phone: '9876543210'
      }

      const result = validationSchemas.userRegistration.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'StrongP@ssw0rd123',
        name: 'Test User'
      }

      const result = validationSchemas.userRegistration.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User'
      }

      const result = validationSchemas.userRegistration.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid Indian phone number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'StrongP@ssw0rd123',
        name: 'Test User',
        phone: '1234567890' // Should start with 6-9
      }

      const result = validationSchemas.userRegistration.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('productCreation', () => {
    it('should validate correct product data', () => {
      const validData = {
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        categoryId: 'cltest123',
        imageUrls: ['https://example.com/image1.jpg'],
        stock: 10
      }

      const result = validationSchemas.productCreation.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject product with empty name', () => {
      const invalidData = {
        name: 'Te', // Too short
        description: 'Test product description',
        price: 99.99,
        categoryId: 'cltest123',
        imageUrls: ['https://example.com/image1.jpg'],
        stock: 10
      }

      const result = validationSchemas.productCreation.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject product with no images', () => {
      const invalidData = {
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        categoryId: 'cltest123',
        imageUrls: [], // Empty array
        stock: 10
      }

      const result = validationSchemas.productCreation.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})