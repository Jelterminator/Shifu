# Environment Configuration & Build Secrets

This document explains how to set up environment variables for local development and CI/CD builds.

## Overview

The app uses environment variables to inject secrets and configuration at build time. All secrets are:
- ✅ **Never committed** to git (protected by `.gitignore`)
- ✅ **Stored securely** in GitHub Secrets (encrypted)
- ✅ **Validated** before builds
- ✅ **Injected safely** via CI/CD pipeline

## Local Development Setup

### 1. Create `.env.local`

Copy the template:
```bash
cp .env.example .env.local
```

### 2. Fill in your credentials

Edit `.env.local` with your actual values:

```bash
# .env.local (NEVER commit this file)
APP_ENV=development
GOOGLE_CLIENT_ID=1022062670949-b07uhe5v48ia8n7nemukqb5egig55pe8.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
API_BASE_URL=http://localhost:3000
APP_VERSION=0.1.0
BUILD_NUMBER=1
```

### 3. Verify `.gitignore` protects it

Check that `.gitignore` includes:
```
.env
.env.local
.env.*.local
```

Verify it's not staged:
```bash
git status
# Should NOT show .env.local
```

### 4. Use in your app

Import and use the config:

```typescript
// src/App.tsx
import { config, validateConfig } from '@/utils/config';

export default function App() {
  // Validate at startup
  validateConfig();

  console.log(`Running in ${config.env} mode`);
  console.log(`Google OAuth: ${config.googleClientId ? '✅' : '❌'}`);

  return (
    // Your app...
  );
}
```

Or destructure specific values:

```typescript
import { googleClientId, apiBaseUrl } from '@/utils/config';

// Use them
const oauth = new GoogleOAuth(googleClientId);
const api = new APIClient(apiBaseUrl);
```

## CI/CD Setup (GitHub Actions)

### 1. Add GitHub Secrets

Go to: **Repository Settings → Secrets and variables → Actions**

Add these secrets:

```
GOOGLE_CLIENT_ID
  Value: 1022062670949-b07uhe5v48ia8n7nemukqb5egig55pe8.apps.googleusercontent.com

API_BASE_URL
  Value: https://staging-api.example.com
```

**Note:** Do NOT add `GOOGLE_CLIENT_SECRET` to client builds. Secrets are for server-side use only.

### 2. Verify GitHub workflow injection

The `.github/workflows/ci.yml` automatically:
- Creates `.env.local` with secrets injected
- Validates configuration with `scripts/check-env.js`
- Cleans up after the build
- Never logs sensitive values

View the workflow run:
1. Go to **Actions** tab
2. Click on a recent workflow run
3. Expand **"Create .env.local (with secrets)"** step
4. Verify values are `***` (masked)

## Configuration Validation

### Manual Validation

Before building, validate your environment:

```bash
npm run env:check
```

Output:
```
✅ APP_ENV configured
✅ GOOGLE_CLIENT_ID configured
✅ API_BASE_URL configured
✅ All environment checks passed!
```

### Automatic Validation

The CI pipeline validates automatically:
1. Linting & Type Checking
2. **Environment validation** (scripts/check-env.js)
3. Tests
4. Final validation

If any step fails, the build stops.

## Available Environment Variables

| Variable | Required? | Where? | Example |
|----------|-----------|--------|---------|
| `APP_ENV` | ✅ Yes | All | `development`, `staging`, `production` |
| `GOOGLE_CLIENT_ID` | ⚠️ Production only | Dev + CI | `1022062670949-...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ❌ Client never | Server only | Never in client code |
| `API_BASE_URL` | ✅ Yes | All | `http://localhost:3000` |
| `APP_VERSION` | ❌ Optional | CI | `0.1.0` |
| `BUILD_NUMBER` | ❌ Optional | CI | `42` |

## Security Best Practices

### ✅ Do This

- ✅ Use `.env.local` for local development
- ✅ Never commit `.env*` files
- ✅ Rotate secrets regularly
- ✅ Use GitHub Secrets for CI/CD
- ✅ Log safe config only: `getSafeConfig()`
- ✅ Validate config at startup

### ❌ Never Do This

- ❌ Commit `.env.local` or secrets to git
- ❌ Log sensitive values: `console.log(config.googleClientSecret)`
- ❌ Hardcode secrets in source code
- ❌ Share credentials in chat/email
- ❌ Use production secrets in development
- ❌ Store secrets in version control

## Troubleshooting

### "GOOGLE_CLIENT_ID not set"

**Problem:** Calendar sync is disabled
**Solution:** Make sure `.env.local` exists and has the `GOOGLE_CLIENT_ID` value

```bash
cat .env.local | grep GOOGLE_CLIENT_ID
```

### "Environment validation failed"

**Problem:** Build fails in CI
**Solution:** Check GitHub Secrets are set correctly

```bash
# GitHub Settings → Secrets and variables → Actions
# Verify these exist:
# - GOOGLE_CLIENT_ID
# - API_BASE_URL
```

### "Cannot find module '@/utils/config'"

**Problem:** TypeScript can't find the config module
**Solution:** Run type-check to verify paths:

```bash
npm run type-check
```

## Regenerating Compromised Secrets

If you accidentally expose a secret (like posting it online):

### 1. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project **"harmonious-day-ai-manager"**
3. **APIs & Services → Credentials**
4. Delete the exposed credential
5. Create a new OAuth 2.0 Client ID
6. Download the new JSON file
7. Update your local `.env.local`
8. Update GitHub Secret `GOOGLE_CLIENT_ID`

### 2. Verify new credential works

```bash
npm run env:check
# Should pass with new GOOGLE_CLIENT_ID
```

## References

- [Environment Variables in React Native](https://reactnative.dev/docs/environment-using-js-environment-variables)
- [Expo Configuration with app.json](https://docs.expo.dev/build/eas-json/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)