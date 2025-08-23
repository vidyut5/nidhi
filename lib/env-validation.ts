interface EnvironmentConfig {
  // Database
  DATABASE_URL: string
  
  // Authentication
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string
  
  // Admin
  ADMIN_USERNAME: string
  ADMIN_PASSWORD_HASH: string
  ADMIN_SESSION_SECRET: string
  
  // Appwrite (if using)
  NEXT_PUBLIC_APPWRITE_PROJECT_ID?: string
  NEXT_PUBLIC_APPWRITE_ENDPOINT?: string
  APPWRITE_API_KEY?: string
  
  // File uploads
  UPLOADTHING_SECRET?: string
  UPLOADTHING_APP_ID?: string
  
  // External services
  SMTP_HOST?: string
  SMTP_PORT?: string
  SMTP_USER?: string
  SMTP_PASS?: string
  
  // Monitoring
  SENTRY_DSN?: string
  
  // Feature flags
  ENABLE_ANALYTICS?: string
  ENABLE_LOGGING?: string
  
  // Environment
  NODE_ENV: 'development' | 'production' | 'test'
}

class EnvironmentValidator {
  private config: Partial<EnvironmentConfig> = {}
  private errors: string[] = []
  private warnings: string[] = []

  validate(): { isValid: boolean; errors: string[]; warnings: string[]; config: EnvironmentConfig } {
    this.errors = []
    this.warnings = []

    // Required environment variables
    const required = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'ADMIN_USERNAME',
      'ADMIN_PASSWORD_HASH',
      'ADMIN_SESSION_SECRET',
      'NODE_ENV'
    ]

    // Check required variables
    for (const key of required) {
      const value = process.env[key]
      if (!value) {
        this.errors.push(`Missing required environment variable: ${key}`)
      } else {
        this.config[key as keyof EnvironmentConfig] = value as any
      }
    }

    // Check optional variables
    const optional = [
      'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
      'NEXT_PUBLIC_APPWRITE_ENDPOINT',
      'APPWRITE_API_KEY',
      'UPLOADTHING_SECRET',
      'UPLOADTHING_APP_ID',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS',
      'SENTRY_DSN',
      'ENABLE_ANALYTICS',
      'ENABLE_LOGGING'
    ]

    for (const key of optional) {
      const value = process.env[key]
      if (value) {
        this.config[key as keyof EnvironmentConfig] = value as any
      }
    }

    // Validate specific values
    this.validateSpecificValues()

    // Environment-specific checks
    this.validateEnvironmentSpecific()

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      config: this.config as EnvironmentConfig
    }
  }

  private validateSpecificValues(): void {
    // Validate NODE_ENV
    const nodeEnv = this.config.NODE_ENV
    if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
      this.errors.push(`Invalid NODE_ENV: ${nodeEnv}. Must be development, production, or test`)
    }

    // Validate DATABASE_URL format
    const dbUrl = this.config.DATABASE_URL
    if (dbUrl && !this.isValidDatabaseUrl(dbUrl)) {
      this.errors.push('Invalid DATABASE_URL format')
    }

    // Validate NEXTAUTH_URL format
    const nextAuthUrl = this.config.NEXTAUTH_URL
    if (nextAuthUrl && !this.isValidUrl(nextAuthUrl)) {
      this.errors.push('Invalid NEXTAUTH_URL format')
    }

    // Validate password hash length
    const adminPasswordHash = this.config.ADMIN_PASSWORD_HASH
    if (adminPasswordHash && adminPasswordHash.length < 40) {
      this.warnings.push('ADMIN_PASSWORD_HASH seems too short for a secure hash')
    }

    // Validate session secret length
    const sessionSecret = this.config.ADMIN_SESSION_SECRET
    if (sessionSecret && sessionSecret.length < 32) {
      this.warnings.push('ADMIN_SESSION_SECRET should be at least 32 characters long')
    }
  }

  private validateEnvironmentSpecific(): void {
    const nodeEnv = this.config.NODE_ENV

    if (nodeEnv === 'production') {
      // Production-specific validations
      if (!this.config.NEXTAUTH_SECRET || this.config.NEXTAUTH_SECRET === 'your-secret-key') {
        this.errors.push('NEXTAUTH_SECRET must be set to a secure value in production')
      }

      if (this.config.NEXTAUTH_URL?.includes('localhost')) {
        this.errors.push('NEXTAUTH_URL cannot contain localhost in production')
      }

      if (!this.config.SENTRY_DSN) {
        this.warnings.push('SENTRY_DSN not set - error monitoring will be limited in production')
      }
    }

    if (nodeEnv === 'development') {
      // Development-specific validations
      if (this.config.NEXTAUTH_URL?.includes('https://')) {
        this.warnings.push('Using HTTPS in development may cause issues with local development')
      }
    }
  }

  private isValidDatabaseUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return ['file:', 'postgresql:', 'mysql:', 'mongodb:'].some(protocol => 
        url.startsWith(protocol)
      )
    } catch {
      return false
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Get configuration with type safety
  getConfig(): EnvironmentConfig {
    if (this.errors.length > 0) {
      throw new Error('Environment validation failed. Check errors before accessing config.')
    }
    return this.config as EnvironmentConfig
  }

  // Check if a specific feature is enabled
  isFeatureEnabled(feature: 'analytics' | 'logging'): boolean {
    const key = `ENABLE_${feature.toUpperCase()}` as keyof EnvironmentConfig
    const value = this.config[key]
    return value === 'true' || value === '1'
  }

  // Get environment-specific configuration
  getEnvironmentConfig() {
    const nodeEnv = this.config.NODE_ENV
    
    return {
      isDevelopment: nodeEnv === 'development',
      isProduction: nodeEnv === 'production',
      isTest: nodeEnv === 'test',
      isStaging: (nodeEnv as any) === 'staging',
      nodeEnv
    }
  }
}

// Create and export validator instance
export const envValidator = new EnvironmentValidator()

// Convenience function to validate environment on startup
export function validateEnvironment(): EnvironmentConfig {
  const result = envValidator.validate()
  
  if (!result.isValid) {
    console.error('Environment validation failed:')
    result.errors.forEach(error => console.error(`❌ ${error}`))
    result.warnings.forEach(warning => console.warn(`⚠️  ${warning}`))
    
    throw new Error('Environment validation failed. Please check the errors above.')
  }

  if (result.warnings.length > 0) {
    console.warn('Environment validation warnings:')
    result.warnings.forEach(warning => console.warn(`⚠️  ${warning}`))
  }

  console.log('✅ Environment validation passed')
  return result.config
}

// Export types for use in other files
export type { EnvironmentConfig }
export { EnvironmentValidator }



