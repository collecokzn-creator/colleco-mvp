#!/usr/bin/env node
/**
 * Pre-push Validation Script
 * 
 * Runs before pushing to ensure all environments are properly configured
 * Usage: Automatically runs via git hook, or manually:
 *   node scripts/validate-push.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'blue');
  console.log('='.repeat(60) + '\n');
}

function checkSecrets() {
  header('Pre-Push Security Check');
  
  let hasErrors = false;
  
  // Check for common secret patterns in staged files
  try {
    const diff = execSync('git diff --cached', { encoding: 'utf8' });
    
    const secretPatterns = [
      { pattern: /AIza[0-9A-Za-z_-]{35}/, name: 'Google API Key' },
      { pattern: /sk_live_[0-9a-zA-Z]{24,}/, name: 'Stripe Live Key' },
      { pattern: /-----BEGIN PRIVATE KEY-----/, name: 'Private Key' },
      { pattern: /api[_-]?key[\s]*[=:][\s]*['"][a-zA-Z0-9_-]{20,}['"]/, name: 'API Key' },
    ];
    
    secretPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(diff)) {
        log(`✗ Found potential ${name} in staged changes!`, 'red');
        hasErrors = true;
      }
    });
    
    if (!hasErrors) {
      log('✓ No exposed secrets detected in staged changes', 'green');
    }
  } catch (error) {
    log('⚠ Could not scan for secrets (git not available)', 'yellow');
  }
  
  return !hasErrors;
}

function checkEnvironmentVariables() {
  header('Environment Variable Check');
  
  const ENV_LOCAL = path.join(PROJECT_ROOT, '.env.local');
  
  if (!fs.existsSync(ENV_LOCAL)) {
    log('⚠ .env.local not found - this is OK for CI/CD', 'yellow');
    log('  But required for local development', 'gray');
    return true;
  }
  
  const content = fs.readFileSync(ENV_LOCAL, 'utf8');
  const hasGoogleKey = content.includes('VITE_GOOGLE_MAPS_API_KEY=') && 
                       !content.includes('VITE_GOOGLE_MAPS_API_KEY=<') &&
                       !content.includes('VITE_GOOGLE_MAPS_API_KEY=your-');
  
  if (hasGoogleKey) {
    log('✓ VITE_GOOGLE_MAPS_API_KEY is configured in .env.local', 'green');
  } else {
    log('⚠ VITE_GOOGLE_MAPS_API_KEY not fully configured', 'yellow');
    log('  Set it before running locally: npm run setup:env', 'gray');
  }
  
  return true;
}

function checkGitignore() {
  header('Git Configuration Check');
  
  const GITIGNORE = path.join(PROJECT_ROOT, '.gitignore');
  const content = fs.readFileSync(GITIGNORE, 'utf8');
  
  const checks = [
    { pattern: /\.env(?!\.)/, name: '.env (all variants)' },
    { pattern: /\.env\.local/, name: '.env.local' },
    { pattern: /node_modules/, name: 'node_modules' },
  ];
  
  let allOk = true;
  checks.forEach(({ pattern, name }) => {
    if (pattern.test(content)) {
      log(`✓ ${name} is in .gitignore`, 'green');
    } else {
      log(`✗ ${name} NOT in .gitignore`, 'red');
      allOk = false;
    }
  });
  
  return allOk;
}

function checkBuild() {
  header('Build Verification');
  
  try {
    log('Building project...', 'blue');
    execSync('npm run build', { 
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });
    log('✓ Build successful', 'green');
    return true;
  } catch (error) {
    log('✗ Build failed!', 'red');
    log(error.toString(), 'gray');
    return false;
  }
}

function main() {
  const checks = [
    { name: 'Secrets', fn: checkSecrets, required: true },
    { name: 'Environment Variables', fn: checkEnvironmentVariables, required: false },
    { name: 'Git Configuration', fn: checkGitignore, required: true },
    { name: 'Build', fn: checkBuild, required: true },
  ];
  
  let failed = [];
  
  for (const check of checks) {
    try {
      const result = check.fn();
      if (!result && check.required) {
        failed.push(check.name);
      }
    } catch (error) {
      if (check.required) {
        log(`✗ ${check.name} check failed: ${error.message}`, 'red');
        failed.push(check.name);
      }
    }
  }
  
  // Summary
  header('Pre-Push Validation Summary');
  
  if (failed.length === 0) {
    log('✓ All pre-push checks passed!', 'green');
    log('  Safe to push to main branch', 'green');
    return 0;
  } else {
    log(`✗ ${failed.length} check(s) failed:`, 'red');
    failed.forEach(name => log(`  • ${name}`, 'red'));
    log('\nFix these issues before pushing:', 'yellow');
    log('  1. Review errors above', 'gray');
    log('  2. Make corrections', 'gray');
    log('  3. Stage changes: git add .', 'gray');
    log('  4. Try again: git push', 'gray');
    return 1;
  }
}

process.exit(main());
