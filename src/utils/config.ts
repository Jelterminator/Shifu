import { version } from '../../package.json';

/**
 * Centralized configuration and environment variable management
 */

type Environment = 'development' | 'staging' | 'production';

interface AppConfig {
  // Environment
  env: Environment;
  isDevelopment: boolean;
  isProduction: boolean;

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

    // App versioning (from package.json or build system)
    appVersion: getEnvVar('APP_VERSION', version),
    buildNumber: getEnvVar('BUILD_NUMBER', '1'),
  };
}

// Create singleton config instance
export const config: AppConfig = buildConfig();

/**
 * Return safe config for logging/debugging
 */
export function getSafeConfig(): AppConfig {
  return {
    env: config.env,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction,
    appVersion: config.appVersion,
    buildNumber: config.buildNumber,
  };
}

/**
 * Export individual config values for easy destructuring
 */
export const { env, isDevelopment, isProduction, appVersion, buildNumber } = config;
