// This file configures the initialization of Sentry on the server side
// The config you add here will be used whenever the server handles a request
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    
    // Server name
    serverName: process.env.SERVER_NAME || 'vidyut-api',
    
    // Integrations
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Console(),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
    
    // Performance monitoring
    enableTracing: true,
    
    // Filter out unwanted events
    beforeSend(event, hint) {
      // Filter out health check requests
      if (event.request?.url?.includes('/api/health')) {
        return null
      }
      
      // Filter out monitoring requests
      if (event.request?.url?.includes('/api/monitoring')) {
        return null
      }
      
      // Remove sensitive data
      if (event.request?.headers) {
        delete event.request.headers.authorization
        delete event.request.headers.cookie
        delete event.request.headers['x-api-key']
      }
      
      // Remove sensitive query parameters
      if (event.request?.query_string) {
        const sensitiveParams = ['token', 'key', 'secret', 'password']
        let queryString = event.request.query_string
        sensitiveParams.forEach(param => {
          const regex = new RegExp(`${param}=[^&]*`, 'gi')
          queryString = queryString.replace(regex, `${param}=[FILTERED]`)
        })
        event.request.query_string = queryString
      }
      
      // Remove sensitive body data
      if (event.request?.data) {
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey']
        if (typeof event.request.data === 'object') {
          sensitiveFields.forEach(field => {
            if (event.request?.data && field in event.request.data) {
              event.request.data[field] = '[FILTERED]'
            }
          })
        }
      }
      
      return event
    },
    
    // Custom error handler
    beforeSendTransaction(event) {
      // Filter out health check transactions
      if (event.transaction?.includes('/api/health')) {
        return null
      }
      
      return event
    },
    
    // Initial scope
    initialScope: {
      tags: {
        component: 'server',
        nodeVersion: process.version,
      },
    },
    
    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',
    
    // Attach stack traces to pure captured messages
    attachStacktrace: true,
    
    // Maximum breadcrumbs
    maxBreadcrumbs: 50,
    
    // Sample rate for sessions
    sessionsSampleRate: 1.0,
  })
}