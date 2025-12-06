/**
 * Validate environment variables before build
 * Run: npm run env:check
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const envFile = path.join(projectRoot, '.env.local');
const exampleFile = path.join(projectRoot, '.env.example');

console.log('?? Checking environment configuration...\n');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};

  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) {
      return;
    }

    const key = trimmed.substring(0, equalIndex).trim();
    const value = trimmed.substring(equalIndex + 1).trim();
    const cleanValue = value.replace(/^["'"'"']|["'"'"']$/g, '');

    vars[key] = cleanValue;
  });

  return vars;
}

// Check if .env.local exists
if (!fs.existsSync(envFile)) {
  console.warn('??  .env.local not found\n');

  if (fs.existsSync(exampleFile)) {
    console.log('   Creating .env.local from .env.example...\n');
    try {
      fs.copyFileSync(exampleFile, envFile);
      console.log('   ? .env.local created successfully\n');
    } catch (err) {
      console.error(`   ? Failed to copy .env.example: ${err.message}\n`);
      process.exit(1);
    }
  } else {
    console.error('   ? .env.example not found either\n');
    process.exit(1);
  }
}

// Parse .env.local
const envVars = parseEnvFile(envFile);

console.log('?? Checking required variables:\n');

const validations = [
  {
    key: 'APP_ENV',
    required: true,
    valid: ['development', 'staging', 'production'],
  },
  {
    key: 'GOOGLE_CLIENT_ID',
    required: envVars.APP_ENV === 'production',
    pattern: /\.apps\.googleusercontent\.com$/,
  },
  {
    key: 'API_BASE_URL',
    required: true,
    pattern: /^https?:\/\/.+/,
  },
];

let hasErrors = false;
let checksPassed = 0;

validations.forEach(({ key, required, valid, pattern }) => {
  const value = envVars[key];

  if (required && !value) {
    console.error(`? ${key} is REQUIRED but not set`);
    hasErrors = true;
    return;
  }

  if (!value) {
    console.warn(`?  ${key} not set (optional)`);
    return;
  }

  if (valid && !valid.includes(value)) {
    console.error(`? ${key} has invalid value: "${value}"`);
    console.error(`   Expected one of: ${valid.join(', ')}`);
    hasErrors = true;
    return;
  }

  if (pattern && !pattern.test(value)) {
    console.error(`? ${key} format is invalid: ${value}`);
    hasErrors = true;
    return;
  }

  console.log(`? ${key} = ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`);
  checksPassed++;
});

console.log('');

if (hasErrors) {
  console.error('? Configuration validation FAILED\n');
  process.exit(1);
}

if (checksPassed === 0) {
  console.warn('??  No required environment variables found\n');
  process.exit(1);
}

console.log(`? Environment validation PASSED (${checksPassed} checks)\n`);
process.exit(0);
