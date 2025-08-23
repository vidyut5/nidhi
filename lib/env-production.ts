import { z } from 'zod'
import { logger } from './logger'

// Environment schema with strict validation
const envSchema = z.object({
  // Core environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // Database
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  DATABASE_POOL_SIZE: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional(),
  DATABASE_CONNECTION_TIMEOUT: z.string().transform(Number).pipe(z.number().min(1000)).optional(),
  
  // Authentication - Strict validation for production
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SESSION_MAX_AGE: z.string().transform(Number).pipe(z.number().min(300)).optional(),
  
  // Admin credentials
  ADMIN_USERNAME: z.string().min(3, 'Admin username must be at least 3 characters'),
  ADMIN_PASSWORD_HASH: z.string().min(50, 'Admin password hash seems invalid'),
  ADMIN_SESSION_SECRET: z.string().min(32, 'Admin session secret must be at least 32 characters'),
  ADMIN_SESSION_TIMEOUT: z.string().transform(Number).pipe(z.number().min(300)).optional(),
  ADMIN_MAX_LOGIN_ATTEMPTS: z.string().transform(Number).pipe(z.number().min(3).max(10)).optional(),
  
  // File uploads
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().min(1024)).optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  
  // Payment
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  
  // External APIs
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  SMS_API_KEY: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  
  // Security
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().min(10)).optional(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().min(60000)).optional(),
  CORS_ORIGINS: z.string().optional(),
  JWT_SECRET: z.string().min(32).optional(),
  
  // Cache
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TTL: z.string().transform(Number).pipe(z.number().min(60)).optional(),
  
  // Feature flags
  ENABLE_ANALYTICS: z.string().transform(s => s === 'true').optional(),
  ENABLE_LOGGING: z.string().transform(s => s === 'true').optional(),
  ENABLE_CACHING: z.string().transform(s => s === 'true').optional(),
  ENABLE_RATE_LIMITING: z.string().transform(s => s === 'true').optional(),
  ENABLE_MAINTENANCE_MODE: z.string().transform(s => s === 'true').optional(),
  
  // Appwrite (optional)
  NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().url().optional(),
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: z.string().optional(),
  APPWRITE_API_KEY: z.string().optional(),
})

export type Environment = z.infer<typeof envSchema>

class ProductionEnvironmentValidator {
  private validatedEnv: Environment | null = null
  private errors: string[] = []
  private warnings: string[] = []

  validate(): {
    success: boolean
    env: Environment | null
    errors: string[]
    warnings: string[]
  } {
    this.errors = []
    this.warnings = []

    try {
      // Parse and validate environment
      this.validatedEnv = envSchema.parse(process.env)

      // Production-specific validations
      if (this.validatedEnv.NODE_ENV === 'production') {
        this.validateProductionRequirements()
      }

      // Security validations
      this.validateSecurityRequirements()

      // Performance validations
      this.validatePerformanceSettings()

      return {
        success: this.errors.length === 0,
        env: this.validatedEnv,
        errors: this.errors,
        warnings: this.warnings
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        this.errors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        )
      } else {
        this.errors = ['Unknown validation error']
      }

      return {
        success: false,
        env: null,
        errors: this.errors,
        warnings: this.warnings
      }
    }
  }

  private validateProductionRequirements(): void {
    if (!this.validatedEnv) return

    // Database must not be SQLite in production
    if (this.validatedEnv.DATABASE_URL.includes('file:')) {
      this.errors.push('SQLite database is not suitable for production. Use PostgreSQL or MySQL.')
    }

    // HTTPS requirement for production
    if (!this.validatedEnv.NEXTAUTH_URL.startsWith('https://')) {
      this.errors.push('NEXTAUTH_URL must use HTTPS in production')
    }

    // Monitoring requirements
    if (!this.validatedEnv.SENTRY_DSN) {
      this.warnings.push('SENTRY_DSN not configured - error monitoring is recommended for production')
    }

    // Email configuration for production
    if (!this.validatedEnv.SMTP_HOST) {
      this.warnings.push('SMTP not configured - email functionality will be limited')
    }

    // Security headers
    if (!this.validatedEnv.CORS_ORIGINS) {
      this.warnings.push('CORS_ORIGINS not configured - consider setting allowed origins')
    }

    // Rate limiting
    if (!this.validatedEnv.ENABLE_RATE_LIMITING) {
      this.warnings.push('Rate limiting is disabled - enable for production security')
    }
  }

  private validateSecurityRequirements(): void {
    if (!this.validatedEnv) return

    // Check for default/weak secrets
    const weakSecrets = [
      'your-secret-key',
      'secret',
      'password',
      'admin',
      'test',
      '123456'
    ]

    if (weakSecrets.some(weak => 
      this.validatedEnv!.NEXTAUTH_SECRET.toLowerCase().includes(weak)
    )) {
      this.errors.push('NEXTAUTH_SECRET appears to use a default or weak value')
    }

    if (weakSecrets.some(weak => 
      this.validatedEnv!.ADMIN_SESSION_SECRET.toLowerCase().includes(weak)
    )) {
      this.errors.push('ADMIN_SESSION_SECRET appears to use a default or weak value')
    }

    // Check admin username is not default
    if (['admin', 'administrator', 'root'].includes(this.validatedEnv.ADMIN_USERNAME.toLowerCase())) {
      this.warnings.push('Consider using a non-default admin username for better security')
    }

    // JWT secret validation
    if (this.validatedEnv.JWT_SECRET && this.validatedEnv.JWT_SECRET.length < 32) {
      this.errors.push('JWT_SECRET should be at least 32 characters long')
    }
  }

  private validatePerformanceSettings(): void {
    if (!this.validatedEnv) return

    // Database pool size recommendations
    const poolSize = this.validatedEnv.DATABASE_POOL_SIZE
    if (poolSize && poolSize < 5) {
      this.warnings.push('DATABASE_POOL_SIZE is quite low for production workloads')
    }

    // Cache configuration
    if (this.validatedEnv.NODE_ENV === 'production' && !this.validatedEnv.REDIS_URL) {
      this.warnings.push('Redis caching not configured - consider enabling for better performance')
    }

    // Rate limiting settings
    const maxRequests = this.validatedEnv.RATE_LIMIT_MAX_REQUESTS
    if (maxRequests && maxRequests > 1000) {
      this.warnings.push('RATE_LIMIT_MAX_REQUESTS is very high - ensure this is intentional')
    }
  }

  // Get validated environment with type safety
  getValidatedEnv(): Environment {
    if (!this.validatedEnv) {
      throw new Error('Environment validation has not been run or failed')
    }
    return this.validatedEnv
  }

  // Check if specific features are enabled
  isFeatureEnabled(feature: keyof Pick<Environment, 'ENABLE_ANALYTICS' | 'ENABLE_LOGGING' | 'ENABLE_CACHING' | 'ENABLE_RATE_LIMITING' | 'ENABLE_MAINTENANCE_MODE'>): boolean {
    return this.validatedEnv?.[feature] === true
  }

  // Generate environment report
  generateReport(): {
    environment: string
    database: string
    features: Record<string, boolean>
    security: {
      httpsEnabled: boolean
      rateLimitingEnabled: boolean
      corsConfigured: boolean
    }
    monitoring: {
      sentryConfigured: boolean
      analyticsEnabled: boolean
      loggingEnabled: boolean
    }
  } {
    if (!this.validatedEnv) {
      throw new Error('Environment validation has not been run')
    }

    return {
      environment: this.validatedEnv.NODE_ENV,
      database: this.validatedEnv.DATABASE_URL.includes('postgresql://') ? 'PostgreSQL' :
                this.validatedEnv.DATABASE_URL.includes('mysql://') ? 'MySQL' :
                this.validatedEnv.DATABASE_URL.includes('file:') ? 'SQLite' : 'Unknown',
      features: {
        analytics: this.validatedEnv.ENABLE_ANALYTICS ?? false,
        logging: this.validatedEnv.ENABLE_LOGGING ?? false,
        caching: this.validatedEnv.ENABLE_CACHING ?? false,
        rateLimiting: this.validatedEnv.ENABLE_RATE_LIMITING ?? false,
        maintenanceMode: this.validatedEnv.ENABLE_MAINTENANCE_MODE ?? false,
      },
      security: {
        httpsEnabled: this.validatedEnv.NEXTAUTH_URL.startsWith('https://'),
        rateLimitingEnabled: this.validatedEnv.ENABLE_RATE_LIMITING ?? false,
        corsConfigured: !!this.validatedEnv.CORS_ORIGINS,
      },
      monitoring: {
        sentryConfigured: !!this.validatedEnv.SENTRY_DSN,
        analyticsEnabled: this.validatedEnv.ENABLE_ANALYTICS ?? false,
        loggingEnabled: this.validatedEnv.ENABLE_LOGGING ?? false,
      }
    }
  }
}

// Export singleton instance
export const envValidator = new ProductionEnvironmentValidator()

// Auto-validate on import in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  const result = envValidator.validate()
  
  if (!result.success) {
    logger.error('Environment validation failed in production', undefined, {
      errors: result.errors,
      warnings: result.warnings
    })
    
    // Exit in production if validation fails
    process.exit(1)
  }

  if (result.warnings.length > 0) {
    logger.warn('Environment validation warnings', { warnings: result.warnings })
  }

  logger.info('Environment validation successful', envValidator.generateReport())
}

export { Environment, ProductionEnvironmentValidator }