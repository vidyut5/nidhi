import { logger } from './logger'

interface EnvironmentConfig {
  database: {
    url: string
  }
  nextauth: {
    secret: string
    url: string
  }
  admin: {
    username: string
    passwordHash: string
    sessionSecret: string
  }
  appwrite: {
    endpoint: string
    projectId: string
    apiKey: string
  }
  upload: {
    uploadthingSecret: string
    uploadthingAppId: string
  }
  external: {
    olaApiKey: string
  }
  development: {
    nodeEnv: string
    seedToken: string
  }
  security: {
    csrfSecret: string
    rateLimitSecret: string
  }
  monitoring: {
    sentryDsn: string
    logLevel: string
  }
}

class EnvironmentValidator {
  private requiredVars: Record<string, string[]> = {
    database: ['DATABASE_URL'],
    nextauth: ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'],
    admin: ['ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH', 'ADMIN_SESSION_SECRET'],
    appwrite: ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY'],
    upload: ['UPLOADTHING_SECRET', 'UPLOADTHING_APP_ID'],
    external: ['OLA_API_KEY'],
    development: ['NODE_ENV'],
    security: ['CSRF_SECRET', 'RATE_LIMIT_SECRET'],
    monitoring: ['LOG_LEVEL']
  }

  private optionalVars: Record<string, string[]> = {
    development: ['SEED_TOKEN'],
    monitoring: ['SENTRY_DSN']
  }

  validate(): { isValid: boolean; missing: string[]; warnings: string[] } {
    const missing: string[] = []
    const warnings: string[] = []

    // Check required variables
    Object.entries(this.requiredVars).forEach(([category, vars]) => {
      vars.forEach(varName => {
        if (!process.env[varName]) {
          missing.push(`${category.toUpperCase()}: ${varName}`)
        }
      })
    })

    // Check optional variables and warn if missing in production
    if (process.env.NODE_ENV === 'production') {
      Object.entries(this.optionalVars).forEach(([category, vars]) => {
        vars.forEach(varName => {
          if (!process.env[varName]) {
            warnings.push(`${category.toUpperCase()}: ${varName} (recommended for production)`)
          }
        })
      })
    }

    // Validate specific values
    this.validateSpecificValues(warnings)

    return {
      isValid: missing.length === 0,
      missing,
      warnings
    }
  }

  private validateSpecificValues(warnings: string[]): void {
    // Check DATABASE_URL format
    const dbUrl = process.env.DATABASE_URL
    if (dbUrl && !dbUrl.includes('://')) {
      warnings.push('DATABASE_URL: Invalid format, should include protocol (e.g., file:, postgresql:, mysql:)')
    }

    // Check NEXTAUTH_SECRET length
    const nextauthSecret = process.env.NEXTAUTH_SECRET
    if (nextauthSecret && nextauthSecret.length < 32) {
      warnings.push('NEXTAUTH_SECRET: Should be at least 32 characters long')
    }

    // Check ADMIN_PASSWORD_HASH format
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
    if (adminPasswordHash && !adminPasswordHash.startsWith('$2b$') && !adminPasswordHash.startsWith('$2a$')) {
      warnings.push('ADMIN_PASSWORD_HASH: Should be a valid bcrypt hash')
    }

    // Check NODE_ENV value
    const nodeEnv = process.env.NODE_ENV
    if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
      warnings.push('NODE_ENV: Should be one of: development, production, test')
    }
  }

  getConfig(): EnvironmentConfig {
    return {
      database: {
        url: process.env.DATABASE_URL || 'file:./dev.db'
      },
      nextauth: {
        secret: process.env.NEXTAUTH_SECRET || '',
        url: process.env.NEXTAUTH_URL || 'http://localhost:3000'
      },
      admin: {
        username: process.env.ADMIN_USERNAME || '',
        passwordHash: process.env.ADMIN_PASSWORD_HASH || '',
        sessionSecret: process.env.ADMIN_SESSION_SECRET || ''
      },
      appwrite: {
        endpoint: process.env.APPWRITE_ENDPOINT || '',
        projectId: process.env.APPWRITE_PROJECT_ID || '',
        apiKey: process.env.APPWRITE_API_KEY || ''
      },
      upload: {
        uploadthingSecret: process.env.UPLOADTHING_SECRET || '',
        uploadthingAppId: process.env.UPLOADTHING_APP_ID || ''
      },
      external: {
        olaApiKey: process.env.OLA_API_KEY || ''
      },
      development: {
        nodeEnv: process.env.NODE_ENV || 'development',
        seedToken: process.env.SEED_TOKEN || ''
      },
      security: {
        csrfSecret: process.env.CSRF_SECRET || '',
        rateLimitSecret: process.env.RATE_LIMIT_SECRET || ''
      },
      monitoring: {
        sentryDsn: process.env.SENTRY_DSN || '',
        logLevel: process.env.LOG_LEVEL || 'info'
      }
    }
  }

  logValidationResult(): void {
    const result = this.validate()
    
    if (result.isValid) {
      logger.info('Environment validation passed')
      if (result.warnings.length > 0) {
        logger.warn('Environment validation warnings', { warnings: result.warnings })
      }
    } else {
      logger.error('Environment validation failed', undefined, { 
        missing: result.missing,
        warnings: result.warnings 
      })
    }
  }
}

export const envValidator = new EnvironmentValidator()
export type { EnvironmentConfig }



