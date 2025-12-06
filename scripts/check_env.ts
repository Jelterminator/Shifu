#!/usr/bin/env node

/**
 * Validate environment variables before build
 * Run: npm run env:check
 * 
 * This ensures required secrets are present and valid
 * Fails the build if critical values are missing
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const envFile = path.join(projectRoot, '.env.local');
const exampleFile = path.join(projectRoot, '.env.example');

console.log('🔍 Checking environment configuration...\n');

/**
 * Parse .env file content
 */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};

  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) {
      return;
    }

    const key = trimmed.substring(0, equalIndex).trim();
    const value = trimmed.substring(equalIndex + 1).trim();

    // Remove quotes if present
    const cleanValue = value.replace(/^["']|["']$/g, '');

    vars[key] = cleanValue;
  });

  return vars;
}

// Check if .env.local exists
if (!fs.existsSync(envFile)) {
  console.warn('⚠️  .env.local not found\n');

  if (fs.existsSync(exampleFile)) {
    console.log('   Creating .env.local from .env.example...\n');
    try {
      fs.copyFileSync(exampleFile, envFile);
      console.log('   ✅ .env.local created successfully\n');
      console.log('   📝 Please fill in real values:');
      console.log(`   ${envFile}\n`);
    } catch (err) {
      console.error(`   ❌ Failed to copy .env.example: ${err.message}\n`);
      process.exit(1);
    }
  } else {
    console.error('   ❌ .env.example not found either\n');
    console.log('   Please create .env.local with:');
    console.log('   APP_ENV=development');
    console.log('   GOOGLE_CLIENT_ID=<your-client-id>');
    console.log('   API_BASE_URL=http://localhost:3000\n');
    process.exit(1);
  }
}

// Parse .env.local
const envVars = parseEnvFile(envFile);

console.log('📋 Environment variables found:\n');

// Validation rules
const validations = [
  {
    key: 'APP_ENV',
    required: true,
    valid: ['development', 'staging', 'production'],
    description: 'Application environment',
  },
  {
    key: 'GOOGLE_CLIENT_ID',
    required: envVars.APP_ENV === 'production',
    pattern: /\.apps\.googleusercontent\.com$/,
    description: 'Google OAuth Client ID',
  },
  {
    key: 'API_BASE_URL',
    required: true,
    pattern: /^https?:\/\/.+/,
    description: 'API Base URL',
  },
];

let hasErrors = false;
let checksPassed = 0;

validations.forEach(({ key, required, valid, pattern, description }) => {
  const value = envVars[key];

  // Missing required value
  if (required && !value) {
    console.error(`❌ ${key} is REQUIRED but not set`);
    console.error(`   ${description}\n`);
    hasErrors = true;
    return;
  }

  // Optional value not set
  if (!value) {
    console.warn(`⊘  ${key} not set (optional)`);
    console.warn(`   ${description}\n`);
    return;
  }

  // Validate enum values
  if (valid && !valid.includes(value)) {
    console.error(`❌ ${key} has invalid value: "${value}"`);
    console.error(`   Expected one of: ${valid.join(', ')}\n`);
    hasErrors = true;
    return;
  }

  // Validate format/pattern
  if (pattern && !pattern.test(value)) {
    console.error(`❌ ${key} format is invalid`);
    console.error(`   Value: ${value}`);
    console.error(`   Expected format: ${pattern}\n`);
    hasErrors = true;
    return;
  }

  // Passed validation
  console.log(`✅ ${key}`);
  console.log(`   ${description}`);
  console.log(`   Value: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}\n`);
  checksPassed++;
});

console.log('');

if (hasErrors) {
  console.error('❌ Configuration validation FAILED\n');
  console.error('   Fix the errors above and try again\n');
  console.error('   Need help? See: docs/ENVIRONMENT_SETUP.md\n');
  process.exit(1);
}

if (checksPassed === 0) {
  console.warn('⚠️  No required environment variables found\n');
  console.warn('   Fill in .env.local with required values\n');
  process.exit(1);
}

console.log(`✅ Environment validation PASSED (${checksPassed} checks)\n`);
process.exit(0);