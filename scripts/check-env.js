/**
 * Check Environment Variables Script
 * Validates that all required environment variables are set before building/running.
 */

/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

const fs = require('fs');

const path = require('path');

// Simple parser for .env files
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        // Only set if not already in process.env (users' shell takes precedence)
        if (!process.env[key.trim()]) {
          // Remove potential wrapping quotes
          let val = values.join('=').trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          process.env[key.trim()] = val;
        }
      }
    });
    console.log(`✅ Loaded env from ${path.basename(filePath)}`);
  } catch (error) {
    console.warn(`⚠️ Failed to load ${path.basename(filePath)}:`, error.message);
  }
}

// Load .env and .env.local
loadEnv(path.join(__dirname, '..', '.env'));
loadEnv(path.join(__dirname, '..', '.env.local'));

const requiredVars = ['APP_ENV', 'GOOGLE_CLIENT_ID', 'APP_VERSION', 'BUILD_NUMBER'];

const missingVars = requiredVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(key => console.error(`   - ${key}`));
  console.error('\nPlease ensure .env.local is correctly configured.');
  process.exit(1);
}

console.log('✅ Environment configuration valid.');
console.log(`   APP_ENV: ${process.env.APP_ENV}`);
