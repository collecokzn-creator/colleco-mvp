# Environment Setup & Management Guide

Complete automation and documentation for managing API keys and secrets across all environments.

## Quick Start

### For Local Development
```bash
# Interactive setup wizard
npm run setup:env

# Validate current setup
npm run setup:env:validate
```

### For CI/CD (GitHub)
```bash
# Check GitHub secrets status (requires GitHub CLI)
npm run setup:env:github

# Or manually via UI:
# Settings > Secrets and variables > Actions
```

---

## Environments Overview

### 1. Local Development (`.env.local`)

**Purpose**: Your machine, used by `npm run dev`

**Setup**:
```bash
# First time only
npm run setup:env

# Then fill in your API keys:
# - VITE_GOOGLE_MAPS_API_KEY: From Google Cloud Console
# - VAPID_PRIVATE_KEY: For push notifications (optional)
```

**Configuration**:
```
.env.local (local machine, NOT committed to git)
├── VITE_API_BASE=http://localhost:4000
├── VITE_GOOGLE_MAPS_API_KEY=<your-key>
├── VITE_VAPID_PUBLIC_KEY=<your-key>
└── VAPID_PRIVATE_KEY=<your-key>
```

**Security**:
- ✅ In `.gitignore` - never commits to git
- ✅ Only exists on your machine
- ✅ Pre-commit hook prevents accidental commits
- ✅ Use the old key, we'll rotate soon

---

### 2. CI/CD (GitHub Actions)

**Purpose**: Automated builds, tests, and deployments

**Setup**:
1. Go to: https://github.com/collecokzn-creator/colleco-mvp
2. Click **Settings**
3. Click **Secrets and variables** > **Actions**
4. Click **New repository secret**

**Required Secrets**:

| Secret | Value | Source |
|--------|-------|--------|
| `VITE_GOOGLE_MAPS_API_KEY` | Your Google API key | Google Cloud Console |

**Optional Secrets**:

| Secret | Value | Purpose |
|--------|-------|---------|
| `API_TOKEN` | Bearer token | API authentication |
| `SLACK_WEBHOOK_URL` | Slack webhook | Notifications |

**How it Works**:
```yaml
# In .github/workflows/deploy.yml:
env:
  MAPS_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}

# During build:
if [ ! -z "$MAPS_KEY" ]; then
  echo "VITE_GOOGLE_MAPS_API_KEY=$MAPS_KEY" >> $GITHUB_ENV
fi
```

The secret is injected into the build environment at runtime. It never appears in logs.

---

### 3. Production (GitHub Pages)

**Purpose**: Live deployment at `https://collecokzn-creator.github.io/colleco-mvp/`

**Setup**: Automatic via `.github/workflows/deploy.yml`

**How it Works**:
1. You push to `main` branch
2. GitHub Actions runs `deploy.yml` workflow
3. Workflow injects `VITE_GOOGLE_MAPS_API_KEY` from secrets
4. Builds with the key injected into the build
5. Deploys to GitHub Pages

**Configuration**:
```javascript
// src/components/LiveMap.jsx reads from build-time variable:
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
// This is injected during build by GitHub Actions
```

**Verification**:
- Build output shows: `VITE_GOOGLE_MAPS_API_KEY=AIza...`
- Google Maps script loads with the key
- No errors in production console

---

### 4. Staging (Future)

When you need a separate staging environment:

```bash
# Create staging branch
git checkout -b staging

# Add staging-specific secret to GitHub
# Settings > Secrets > New secret (name: VITE_GOOGLE_MAPS_API_KEY_STAGING)

# Update deploy workflow to use staging secret
# When pushing to staging branch, use the staging key
```

---

## API Key Setup (Google Maps)

### Step 1: Generate Key

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **Create Credentials** > **API Key**
3. Save the key somewhere safe

### Step 2: Enable APIs

In Google Cloud Console, enable:
- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Directions API
- ✅ Distance Matrix API
- ✅ Geocoding API

### Step 3: Apply Restrictions (Security)

1. Click the key you just created
2. Under **Application restrictions**, select **HTTP referrers**
3. Add these referrers:

```
http://localhost:5180/*
http://127.0.0.1:5180/*
http://192.168.1.2:5180/*
https://collecokzn-creator.github.io/colleco-mvp/*
```

4. Under **API restrictions**, select **Restrict key**
5. Select only these APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Distance Matrix API
   - Geocoding API

6. Click **Save**

### Step 4: Add to Environments

**Local Development**:
```bash
# Edit .env.local
VITE_GOOGLE_MAPS_API_KEY=<your-key-from-step-1>
```

**CI/CD (GitHub)**:
1. Settings > Secrets > New secret
2. Name: `VITE_GOOGLE_MAPS_API_KEY`
3. Value: `<your-key-from-step-1>`
4. Click **Add secret**

---

## Automating Environment Setup

### For New Team Members

Create an onboarding script:

```bash
# scripts/onboard.sh
npm install
npm run setup:env
echo "✓ Setup complete! Commit .env.local to your local git ignore."
npm run dev
```

Run once: `bash scripts/onboard.sh`

### Validation

```bash
# Check all environments
npm run setup:env:validate

# Output example:
# ✓ .env.local exists
# ✓ VITE_GOOGLE_MAPS_API_KEY is set
# ✓ VITE_GOOGLE_MAPS_API_KEY has correct format
# ✓ GitHub secret VITE_GOOGLE_MAPS_API_KEY is set
```

### Pre-deployment Checklist

Before pushing to production:

```bash
# 1. Validate environment
npm run setup:env:validate

# 2. Build locally
npm run build

# 3. Run tests
npm run test

# 4. Verify no secrets in git
git diff --cached | grep -i 'AIza\|sk_\|secret'  # Should return nothing

# 5. Push to main
git push origin main
```

---

## Troubleshooting

### Map Not Loading in Dev

**Error**: `RefererNotAllowedMapError`

**Fix**:
1. Check `.env.local` has `VITE_GOOGLE_MAPS_API_KEY` set
2. Hard refresh browser: `Ctrl+Shift+R`
3. Go to Google Cloud Console and verify:
   - ✓ HTTP referrers include `http://localhost:5180/*`
   - ✓ APIs are enabled (Maps JavaScript, etc.)
   - ✓ Billing is enabled on your Google Cloud project
4. Wait 30-60 seconds for Google to propagate changes
5. Refresh again

**Test**: Open browser console (F12) and look for Google Maps script load errors.

### Map Not Loading in Production

**Error**: Same as above but for `https://collecokzn-creator.github.io/...`

**Fix**:
1. Verify GitHub Secret `VITE_GOOGLE_MAPS_API_KEY` is set
2. Check in Google Cloud Console:
   - ✓ HTTP referrers include `https://collecokzn-creator.github.io/colleco-mvp/*`
3. Run a new build:
   - Go to Actions tab > Select latest workflow run
   - Re-run the job (or push a new commit)
4. Check build logs for: `VITE_GOOGLE_MAPS_API_KEY` injection step

### Secrets Not Available in Build

**Problem**: Build completes but Google Maps script fails to load

**Cause**: Secret not injected during build

**Fix**:
1. Verify secret exists: `npm run setup:env:github`
2. Check workflow file `.github/workflows/deploy.yml`:
   ```yaml
   env:
     MAPS_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}
   
   # And in build step:
   if [ ! -z "$MAPS_KEY" ]; then
     echo "VITE_GOOGLE_MAPS_API_KEY=$MAPS_KEY" >> $GITHUB_ENV
   fi
   ```
3. Re-run the workflow from GitHub Actions tab

---

## Best Practices

### Do's ✅
- ✅ Store all API keys in environment variables
- ✅ Use `.env.local` for development (gitignored)
- ✅ Use GitHub Secrets for CI/CD
- ✅ Rotate keys quarterly
- ✅ Apply HTTP/API restrictions
- ✅ Use `npm run setup:env` for new environments
- ✅ Validate before deploying: `npm run setup:env:validate`

### Don'ts ❌
- ❌ Never commit `.env.local` to git
- ❌ Never hardcode API keys in source code
- ❌ Never share keys in Slack/email
- ❌ Never use overly permissive API restrictions
- ❌ Never disable pre-commit hooks
- ❌ Never skip validation before production push

---

## Commands Reference

```bash
# Environment setup
npm run setup:env              # Interactive wizard
npm run setup:env:validate     # Check all environments
npm run setup:env:github       # Check GitHub secrets

# Development
npm run dev                    # Start dev server with .env.local
npm run build                  # Build for production

# Security
npm run security:check         # Scan for exposed secrets
npm run security:audit         # Check dependencies
npm run security:audit:gcloud  # Check Google Cloud usage (requires setup)

# Testing & Deployment
npm run test                   # Run tests
npm run build && npm test      # Pre-push validation
```

---

## Support

For issues or questions:

1. Check `SECURITY_AUDIT_REPORT.md` for security details
2. Review `.env.example` for variable reference
3. See `docs/SECRETS_MANAGEMENT.md` for team policies
4. Check GitHub Actions logs for deployment issues

---

**Last Updated**: December 10, 2025  
**Version**: 1.0  
**Status**: All environments automated and documented ✅
