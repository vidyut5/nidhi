// This file configures the initialization of Sentry on the browser/client side
// The config you add here will be used whenever a page loads
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    
    // Session replay on errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Integrations
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
      new Sentry.BrowserTracing({
        // Set sampling rate for performance monitoring
        routingInstrumentation: Sentry.nextRouterInstrumentation(
          // Uncomment to enable router instrumentation
          // require('next/router')
        ),
      }),
    ],
    
    // Performance monitoring
    enableTracing: true,
    
    // Filter out unwanted events
    beforeSend(event, hint) {
      // Filter out non-error events in production
      if (process.env.NODE_ENV === 'production') {
        // Don't send console errors
        if (event.level === 'log' || event.level === 'debug') {
          return null
        }
        
        // Filter out network errors
        if (event.exception?.values?.[0]?.type === 'NetworkError') {
          return null
        }
        
        // Filter out specific errors
        const errorMessage = event.exception?.values?.[0]?.value || ''
        const unwantedErrors = [
          'Script error',
          'Non-Error promise rejection captured',
          'ResizeObserver loop limit exceeded',
          'Network request failed'
        ]
        
        if (unwantedErrors.some(error => errorMessage.includes(error))) {
          return null
        }
      }
      
      // Remove sensitive data
      if (event.request?.headers) {
        delete event.request.headers.authorization
        delete event.request.headers.cookie
      }
      
      // Remove sensitive form data
      if (event.request?.data) {
        const sensitiveFields = ['password', 'token', 'secret', 'key']
        sensitiveFields.forEach(field => {
          if (event.request?.data && typeof event.request.data === 'object') {
            delete event.request.data[field]
          }
        })
      }
      
      return event
    },
    
    // Error boundaries
    initialScope: {
      tags: {
        component: 'client',
      },
    },
    
    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',
  })
}