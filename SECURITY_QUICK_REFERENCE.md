# Security Quick Reference Card

## 🚨 Emergency Response

**API Key Exposed?**
```bash
# 1. Remove immediately
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all

# 2. Rotate key (Google Cloud Console)
# 3. Run audit
npm run security:audit:gcloud -- --start="EXPOSURE_TIME" --format="json"

# 4. Document in SECURITY_INCIDENT.md
```

**Security Scan Failed?**
```bash
# Check what failed
cat cypress/logs/orchestrator.log

# Run manual scans
npm run security:check

# Fix vulnerabilities
npm run security:audit:fix
```

## 🔧 Daily Commands

```bash
# Before committing
npm run security:scan        # Check for secrets

# Before pushing
npm run security:check       # Full security check

# Before deploying
npm run build && npm run test && npm run security:check
```

## 📋 Weekly Checklist

**Every Monday (9 AM UTC)**:
- [ ] Check GitHub Actions → Security Scan workflow
- [ ] Review Dependabot PRs (merge security updates)
- [ ] Check Slack #security channel for alerts
- [ ] Verify no open issues with label `security`

## 🔐 Manual Security Audit

```bash
# Full audit
npm run security:check                    # Secrets + dependencies
npm run security:audit:gcloud             # Cloud infrastructure

# Specific checks
npm run security:scan                     # Just secrets
npm run security:audit                    # Just dependencies
npm run security:audit:fix                # Auto-fix vulnerabilities
```

## 📊 Quick Status Check

```bash
# Build status
npm run build                # Should: ✓ built in ~25s

# Test status  
npm run test                 # Should: ✓ 82 passing

# Security status
npm run security:check       # Should: No secrets, 0+ vulnerabilities
```

## 🔔 Notifications

**Slack Webhook Setup**:
```
Repository Settings → Secrets and variables → Actions → Variables
Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/T00000000/B00000000/XXXX
```

**Email Setup**:
```
Your Profile → Settings → Notifications → Email notification preferences
✅ Send notifications for security vulnerabilities
```

## 🛠️ Troubleshooting

**Pre-commit hook not running?**
```bash
npx husky install
git commit --amend --no-verify  # Bypass once if needed
```

**Security scan false positive?**
```bash
# Close alert in GitHub Security tab
# Add to .gitignore if test fixture
```

**Dependabot PR conflicts?**
```bash
git checkout -b dependabot-merge
gh pr checkout <PR_NUMBER>
npm install
npm run test
git push
```

## 📚 Documentation

| Topic | File |
|-------|------|
| Security Policy | `SECURITY.md` |
| Dec 4 Incident | `SECURITY_INCIDENT.md` |
| Setup Guide | `docs/GITHUB_ADVANCED_SECURITY.md` |
| Usage Examples | `docs/OPTIONAL_SECURITY_ENHANCEMENTS.md` |
| Complete Summary | `SECURITY_HARDENING_COMPLETE.md` |

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `.husky/pre-commit` | Secret scanner (blocks commits) |
| `.github/workflows/security.yml` | Weekly automated scans |
| `scripts/audit-google-cloud.js` | Cloud audit review |
| `security-reports/` | Audit report storage (gitignored) |

## 🔑 Environment Variables

**Required for Google Cloud Audit**:
```bash
$env:GOOGLE_CLOUD_PROJECT="your-project-id"
$env:GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
```

**Optional for Enhanced Features**:
```bash
$env:SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
```

## 🚀 Common Scenarios

**Scenario 1: Pre-deployment Check**
```bash
npm run build && npm run test && npm run security:check
# All green? → Deploy
```

**Scenario 2: Weekly Security Review**
```bash
# Check GitHub Actions status
# Merge Dependabot PRs
# Run manual audit
npm run security:audit:gcloud
```

**Scenario 3: New Team Member Onboarding**
```bash
npm install              # Sets up husky hooks
npx husky install        # Verify hooks installed
npm run security:check   # Test security tools
```

## 📞 Contacts

**Emergency**: See `SECURITY_INCIDENT.md` for procedures  
**Questions**: Open GitHub issue with label `security-question`  
**Email**: security@colleco.travel

---

**Last Updated**: December 4, 2025  
**Version**: 1.0  
**Quick Access**: Pin this file for daily reference
