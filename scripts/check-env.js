/**
 * Check Environment Variables Script
 * Validates that all required environment variables are set before building/running.
 */

const requiredVars = [
  'APP_ENV',
  'GOOGLE_CLIENT_ID',
  'API_BASE_URL',
  'APP_VERSION',
  'BUILD_NUMBER',
];

const missingVars = requiredVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(key => console.error(`   - ${key}`));
  console.error('\nPlease ensure .env.local is correctly configured.');
  process.exit(1);
}

console.log('✅ Environment configuration valid.');
console.log(`   APP_ENV: ${process.env.APP_ENV}`);
console.log(`   API_BASE_URL: ${process.env.API_BASE_URL}`);
