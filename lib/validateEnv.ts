/* Simple startup-time environment validation */
export function validateEnv(): void {
  try {
    const seedEnabledRaw = process.env.SEED_ENABLED;
    const seedEnabled = seedEnabledRaw === 'true' || seedEnabledRaw === '1';

    if (seedEnabled) {
      if (typeof process.env.SEED_TOKEN === 'undefined' || process.env.SEED_TOKEN === '') {
        throw new Error('Missing required environment variable: SEED_TOKEN (required when seeding is enabled)');
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Environment validation failed:', err);
    // Fail fast during server start
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    }
  }
}

// Auto-run when this module is imported on the server
if (typeof window === 'undefined') {
  validateEnv();
}


