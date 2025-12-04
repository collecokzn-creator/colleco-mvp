# GitHub Advanced Security Setup Guide

This guide walks you through enabling GitHub Advanced Security features for the CollEco Travel MVP repository.

## Overview

GitHub Advanced Security provides enterprise-grade security scanning and monitoring:

- **Dependency Graph**: Visualize project dependencies
- **Dependabot Alerts**: Automated vulnerability notifications for dependencies
- **Secret Scanning**: AI-powered detection of committed secrets
- **Code Scanning**: Static analysis with CodeQL to find security vulnerabilities
- **Security Advisories**: Private vulnerability reporting and CVE management

## Prerequisites

- Repository admin access
- GitHub Advanced Security license (free for public repositories)
- GitHub account with 2FA enabled (recommended)

## Step-by-Step Setup

### 1. Enable Dependency Graph

**Purpose**: Track all npm dependencies and receive alerts when vulnerabilities are discovered.

**Steps**:
1. Navigate to your repository on GitHub
2. Click **Settings** (gear icon in top menu)
3. In the left sidebar, click **Code security and analysis**
4. Locate **Dependency graph** section
5. Click **Enable** (if not already enabled)

**Verification**:
- Go to **Insights** → **Dependency graph**
- You should see all 975+ npm packages visualized

### 2. Enable Dependabot Alerts

**Purpose**: Receive automated pull requests to update vulnerable dependencies.

**Steps**:
1. In **Settings** → **Code security and analysis**
2. Locate **Dependabot alerts** section
3. Click **Enable**
4. Locate **Dependabot security updates** section
5. Click **Enable** (auto-creates PRs for security fixes)

**Configuration** (optional):
Create `.github/dependabot.yml` for advanced scheduling:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "UTC"
    open-pull-requests-limit: 10
    reviewers:
      - "collecokzn-creator"
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore(deps)"
```

**Verification**:
- Check **Security** tab → **Dependabot alerts**
- Should see current 1 low severity vulnerability listed

### 3. Enable Secret Scanning

**Purpose**: GitHub automatically scans commits for known secret patterns (API keys, tokens, credentials).

**Steps**:
1. In **Settings** → **Code security and analysis**
2. Locate **Secret scanning** section
3. Click **Enable**
4. Optional: Enable **Push protection** (blocks commits containing secrets)

**Push Protection** (recommended):
- Click **Enable** next to **Push protection**
- This prevents secrets from being committed in the first place
- Works alongside your local pre-commit hooks for defense in depth

**Verification**:
- Check **Security** tab → **Secret scanning**
- Should show 0 active alerts (previously detected key was removed)
- View closed alerts to see historical incident (Dec 4, 2025)

### 4. Enable Code Scanning (CodeQL)

**Purpose**: Automated static analysis to detect security vulnerabilities in your code.

**Steps**:
1. In **Settings** → **Code security and analysis**
2. Locate **Code scanning** section
3. Click **Set up** → **Default** (recommended)

**Default Configuration**:
- Automatically detects JavaScript/TypeScript
- Runs on push to main branch
- Scans pull requests
- Uses `security-and-quality` query suite

**Advanced Configuration** (optional):
If you prefer manual setup, create `.github/workflows/codeql.yml`:

```yaml
name: CodeQL Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6 AM UTC

jobs:
  analyze:
    name: Analyze Code
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      contents: read
    
    strategy:
      matrix:
        language: [javascript]
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: security-and-quality
      
      - name: Autobuild
        uses: github/codeql-action/autobuild@v3
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

**Verification**:
- Go to **Security** tab → **Code scanning**
- First scan takes ~5 minutes
- Should show 0 critical/high alerts for current codebase

### 5. Configure Security Policy

**Purpose**: Provide clear guidelines for security researchers to report vulnerabilities responsibly.

**Steps**:
1. Your repository already has `SECURITY.md` (created during incident response)
2. Review and update contact information:
   - Email: security@colleco.travel (replace with actual)
   - Response time: 48 hours
   - Disclosure policy: 90 days coordinated disclosure

**Enable Private Vulnerability Reporting**:
1. In **Settings** → **Code security and analysis**
2. Locate **Private vulnerability reporting** section
3. Click **Enable**
4. This allows researchers to submit security issues privately before public disclosure

### 6. Set Up Security Advisories

**Purpose**: Manage and publish security advisories for vulnerabilities found in your project.

**Steps**:
1. When a vulnerability is discovered (via secret scanning, code scanning, or external report)
2. Go to **Security** tab → **Advisories**
3. Click **New draft security advisory**
4. Fill in details:
   - **Title**: Brief description (e.g., "Exposed Google Maps API Key")
   - **CVE ID**: Request from GitHub or use existing
   - **Severity**: Low/Moderate/High/Critical
   - **Affected versions**: Specify version range
   - **Patched versions**: Version where fix is available
   - **Description**: Detailed explanation and mitigation steps

**Example Advisory** (reference for Dec 4 incident):

```
Title: Exposed Google Maps API Key in Documentation Files
CVE: CVE-2025-XXXXX (would be assigned)
Severity: High
Affected Versions: <= 1.0.0
Patched Versions: 1.0.1

Description:
CollEco Travel MVP versions up to and including 1.0.0 contained an exposed 
Google Maps API key in documentation files (DEPLOYMENT_SETUP.md, 
PRODUCTION_READINESS.md, FULL_FUNCTIONALITY_SUMMARY.md, 
PRODUCTION_DEPLOYMENT_CHECKLIST.md).

Impact:
The exposed key had domain restrictions in place, limiting potential abuse. 
However, unauthorized usage could have resulted in unexpected quota consumption.

Remediation:
1. Update to version 1.0.1 or later
2. Rotate Google Maps API key via Google Cloud Console
3. Verify API restrictions are correctly configured
4. Review Google Cloud audit logs for unauthorized usage

Credits:
Detected by GitGuardian and Google Cloud Platform Trust & Safety team.
```

## Notification Configuration

### Email Notifications

**Steps**:
1. Go to your GitHub profile → **Settings**
2. Click **Notifications** in left sidebar
3. Under **Watching**, enable:
   - ✅ Participating and @mentions
   - ✅ Custom (select "Security alerts")
4. Under **Email notification preferences**:
   - ✅ Send notifications for security vulnerabilities
   - ✅ Dependabot alerts

### Slack Integration (Team Notifications)

**Setup**:
1. Install GitHub app in your Slack workspace
2. In Slack channel, run: `/github subscribe collecokzn-creator/colleco-mvp`
3. Configure subscriptions:
   ```
   /github subscribe collecokzn-creator/colleco-mvp security
   ```
4. This sends notifications for:
   - Secret scanning alerts
   - Dependabot alerts
   - Code scanning results

**Advanced Slack Configuration**:
Set `SLACK_WEBHOOK_URL` as repository variable:
1. In repository **Settings** → **Secrets and variables** → **Actions**
2. Click **Variables** tab → **New repository variable**
3. Name: `SLACK_WEBHOOK_URL`
4. Value: Your Slack webhook URL (from Slack app settings)
5. This enables notifications from `.github/workflows/security.yml`

## Monitoring Dashboard

### Security Overview

**Access**:
- Go to **Security** tab in repository
- View consolidated dashboard with:
  - Open/closed alerts by type
  - Trend graphs (alerts over time)
  - Severity breakdown

### Weekly Review Checklist

✅ **Every Monday** (automated via GitHub Actions):
- Review Dependabot alerts → merge security PRs
- Check secret scanning → rotate any detected keys
- Review code scanning results → fix critical/high findings
- Verify pre-commit hooks are working (check recent commits)

✅ **Monthly**:
- Run `npm run security:audit` manually
- Review Google Cloud audit logs: `npm run security:audit:gcloud`
- Update security policy contact information
- Test incident response procedures

## Incident Response Integration

### Automated Issue Creation

Your `.github/workflows/security.yml` already creates issues on scan failures:

```yaml
- name: Create Issue on Security Failure
  if: steps.summary.outputs.status == 'failure'
  uses: actions/github-script@v7
  with:
    script: |
      await github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: '🚨 Security Scan Failed',
        labels: ['security', 'automated']
      });
```

**Triage Process**:
1. Automated issue created with label `security`
2. Team receives notification (email + Slack)
3. Assign to security lead within 24 hours
4. Investigate and remediate within 48 hours (high severity)
5. Update issue with findings and close when resolved

## Best Practices

### Defense in Depth

Your security stack now includes:

1. **Pre-commit** (local): `.husky/pre-commit` secret scanner
2. **Push Protection** (GitHub): Blocks secrets before merge
3. **Secret Scanning** (GitHub): Detects historical secrets
4. **Code Scanning** (CodeQL): Finds vulnerabilities in code
5. **Dependency Scanning** (Dependabot): Monitors npm packages
6. **CI/CD Scanning** (Actions): Weekly automated audits

### Compliance

**For SOC 2 / ISO 27001**:
- Enable all Advanced Security features
- Document security review process (monthly audits)
- Maintain security incident log (SECURITY_INCIDENT.md)
- Implement access controls (GitHub Teams with branch protection)
- Regular security training for team members

**Evidence Collection**:
- Export security scan results monthly
- Save Dependabot PR history
- Archive security advisories
- Document all incidents with timeline and remediation

## Troubleshooting

### Issue: CodeQL Scan Fails

**Solution**:
```bash
# Check workflow logs for specific error
# Common fix: Increase Node memory limit
node --max-old-space-size=4096 node_modules/.bin/codeql ...
```

### Issue: Dependabot PRs Not Auto-Created

**Solution**:
1. Check **Settings** → **Code security and analysis**
2. Ensure **Dependabot security updates** is enabled
3. Verify `.github/dependabot.yml` syntax is valid
4. Check Dependabot logs in **Insights** → **Dependency graph**

### Issue: Secret Scanning False Positives

**Solution**:
1. Review alert in **Security** tab
2. If confirmed false positive, click **Close as** → **False positive**
3. Add pattern to `.github/.gitignore` to prevent future alerts:
   ```
   # Ignore test fixtures with fake secrets
   tests/fixtures/fake-keys.json
   ```

## Cost Considerations

- **Public repositories**: All features FREE
- **Private repositories**: Requires GitHub Advanced Security license
  - Billed per active committer
  - ~$49/month per committer (contact GitHub for enterprise pricing)

**Cost Optimization**:
- Use public repos for open-source projects (free)
- Limit Advanced Security to critical private repos
- Utilize GitHub Free tier's basic security features

## Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/github-security-features)
- [CodeQL Query Reference](https://codeql.github.com/docs/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Secret Scanning Partner Patterns](https://docs.github.com/en/code-security/secret-scanning/secret-scanning-patterns)

---

**Last Updated**: December 4, 2025  
**Maintained By**: CollEco Security Team  
**Review Frequency**: Quarterly
