# Security Policy & Incident Response

## 🔒 Security Incident: December 4, 2025

### Incident Summary
**Type:** API Key Exposure  
**Severity:** High  
**Status:** Resolved ✅  
**Date Detected:** December 4, 2025  
**Date Resolved:** December 4, 2025

### Details
- **Exposed Secret:** Google Maps API Key
- **Location:** Documentation files (DEPLOYMENT_SETUP.md, PRODUCTION_READINESS.md, etc.)
- **Detected By:** GitGuardian + Google Cloud Platform Trust & Safety
- **Commits Affected:** 257d3fe and subsequent documentation commits

### Actions Taken ✅

1. **Immediate Response**
   - Removed API key from all markdown documentation files
   - Replaced with secure placeholder instructions
   - Updated documentation to emphasize security best practices

2. **Key Rotation** (User Action Required)
   - **Regenerate API key** in Google Cloud Console
   - Navigate to: [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials)
   - Find key: `AIzaSyACEQqF8zTEAYvjsu5LJtiBgQvGcAtP_rs`
   - Click **Edit** → **Regenerate Key**
   - Add new key to GitHub Secrets (never commit it)

3. **API Key Restrictions** (Recommended)
   - Restrict key to specific domains/IPs
   - Limit to Maps JavaScript API only
   - Set up usage quotas and alerts
   - Enable billing alerts

4. **Prevention Measures**
   - Verified `.env.*` in `.gitignore`
   - Updated all documentation with security warnings
   - Added security policy to repository

---

## 🛡️ Security Best Practices

### Never Commit Secrets
**DO NOT** commit these to Git:
- API keys (Google Maps, payment processors, etc.)
- Database credentials
- OAuth tokens
- Private keys
- Passwords or authentication tokens

### Where to Store Secrets

#### ✅ CORRECT: Local Development
```bash
# .env.local (in .gitignore)
VITE_GOOGLE_MAPS_API_KEY=your_actual_key_here
VITE_API_TOKEN=your_api_token
```

#### ✅ CORRECT: Production (GitHub Actions)
1. Go to: **Repository Settings → Secrets and variables → Actions**
2. Add secret: `VITE_GOOGLE_MAPS_API_KEY`
3. Never log or echo secrets in workflows

#### ❌ INCORRECT: Documentation or Code
```markdown
<!-- NEVER DO THIS -->
VITE_GOOGLE_MAPS_API_KEY=AIzaSyABC123...
```

### Code Review Checklist
Before committing, check:
- [ ] No API keys in code or documentation
- [ ] No passwords or tokens hardcoded
- [ ] Secrets use environment variables
- [ ] `.env` files are in `.gitignore`
- [ ] No sensitive data in commit messages

---

## 🔐 API Key Security Guidelines

### Google Maps API Key Restrictions

1. **Application Restrictions**
   ```
   HTTP referrers (websites):
   - https://collecokzn-creator.github.io/colleco-mvp/*
   - https://www.travelcolleco.com/*
   ```

2. **API Restrictions**
   - Limit to: Maps JavaScript API, Places API, Geocoding API
   - Remove unused APIs

3. **Quotas & Monitoring**
   - Set daily quotas to prevent abuse
   - Enable billing alerts
   - Monitor usage in Google Cloud Console

### GitHub Secrets Management

**Adding Secrets:**
```bash
Settings → Secrets and variables → Actions → New repository secret
Name: VITE_GOOGLE_MAPS_API_KEY
Value: <paste key from Google Cloud Console>
```

**Using Secrets in Workflows:**
```yaml
- name: Build with API key
  env:
    VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}
  run: npm run build
```

---

## 📋 Incident Response Checklist

If a secret is exposed:

1. **Immediate Actions** (Within 1 hour)
   - [ ] Remove secret from all files
   - [ ] Commit and push changes
   - [ ] Revoke/regenerate the exposed secret

2. **Assessment** (Within 24 hours)
   - [ ] Review cloud provider logs for unauthorized usage
   - [ ] Check for unexpected charges or API calls
   - [ ] Identify all locations where secret was exposed

3. **Remediation**
   - [ ] Update all systems with new secret
   - [ ] Add restrictions to new secret (domains, IPs, APIs)
   - [ ] Set up monitoring and alerts
   - [ ] Update documentation

4. **Prevention**
   - [ ] Review `.gitignore` rules
   - [ ] Add pre-commit hooks (e.g., git-secrets)
   - [ ] Train team on secret management
   - [ ] Document incident and lessons learned

---

## 🚨 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email: [security contact - add your email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

---

## 📚 Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitGuardian - Detect Secrets](https://www.gitguardian.com/)

---

**Last Updated:** December 4, 2025  
**Next Review:** Quarterly security audit scheduled
