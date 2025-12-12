/**
 * Centralized configuration and environment variable management
 * Loads secrets safely at build time and runtime
 * Never logs sensitive values
 */

type Environment = 'development' | 'staging' | 'production';

interface AppConfig {
  // Environment
  env: Environment;
  isDevelopment: boolean;
  isProduction: boolean;

  // Google OAuth (for calendar sync)
  googleClientId: string | undefined;
  googleClientSecret: string | undefined;



  // App versioning
  appVersion: string;
  buildNumber: string;
}

/**
 * Get environment variable with proper fallback
 * In React Native/Expo, these come from:
 * 1. process.env (from babel/webpack during build)
 * 2. Constants.expoConfig.extra (from app.json)
 */
function getEnvVar(key: string): string | undefined;
function getEnvVar(key: string, defaultValue: string): string;
function getEnvVar(key: string, defaultValue?: string): string | undefined {
  // Try process.env first (from build-time injection)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key] as string | undefined;
    if (value !== undefined) return value;
  }

  // Return default if nothing found
  return defaultValue;
}

/**
 * Build configuration object from environment
 */
function buildConfig(): AppConfig {
  const env = (getEnvVar('APP_ENV', 'development') as Environment) || 'development';

  return {
    // Environment
    env,
    isDevelopment: env === 'development',
    isProduction: env === 'production',

    // Google OAuth credentials
    googleClientId: getEnvVar('GOOGLE_CLIENT_ID'),
    googleClientSecret: getEnvVar('GOOGLE_CLIENT_SECRET'),



    // App versioning (from package.json or build system)
    appVersion: getEnvVar('APP_VERSION', '0.1.0'),
    buildNumber: getEnvVar('BUILD_NUMBER', '1'),
  };
}

// Create singleton config instance
export const config: AppConfig = buildConfig();

/**
 * Validate required configuration
 * Call once at app startup (in App.tsx or similar)
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.googleClientId && config.isProduction) {
    console.warn('⚠️  GOOGLE_CLIENT_ID not set - calendar sync will be unavailable');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Return safe config for logging/debugging
 * Excludes sensitive values (secrets)
 */
export function getSafeConfig(): Omit<AppConfig, 'googleClientSecret'> {
  return {
    env: config.env,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction,
    googleClientId: config.googleClientId ? '[SET]' : '[NOT SET]',

    appVersion: config.appVersion,
    buildNumber: config.buildNumber,
  };
}

/**
 * Export individual config values for easy destructuring
 */
export const {
  env,
  isDevelopment,
  isProduction,
  googleClientId,

  appVersion,
  buildNumber,
} = config;
