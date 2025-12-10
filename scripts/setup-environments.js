#!/usr/bin/env node
/**
 * Environment Setup Validation & Automation Script
 * 
 * Validates and helps set up secure environment configuration across:
 * - Local Development (.env.local)
 * - CI/CD (GitHub Actions secrets)
 * - Staging (if applicable)
 * - Production (GitHub Pages)
 * 
 * Usage:
 *   node scripts/setup-environments.js                    # Interactive setup
 *   node scripts/setup-environments.js --validate         # Validate current setup
 *   node scripts/setup-environments.js --check-github     # Check GitHub secrets
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const ENV_LOCAL = path.join(PROJECT_ROOT, '.env.local');
const ENV_EXAMPLE = path.join(PROJECT_ROOT, '.env.example');

// Configuration for all environments
const ENVIRONMENTS = {
  local: {
    name: 'Local Development',
    file: '.env.local',
    description: 'Your machine (not committed to git)',
    requiredVars: ['VITE_API_BASE', 'VITE_GOOGLE_MAPS_API_KEY'],
    optionalVars: ['VITE_VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'],
    gitignored: true,
  },
  cicd: {
    name: 'CI/CD (GitHub Actions)',
    file: 'GitHub Secrets',
    description: 'Automated builds and deployments',
    requiredVars: ['VITE_GOOGLE_MAPS_API_KEY'],
    optionalVars: ['API_TOKEN'],
    gitignored: false,
    instructions: `
      1. Go to: https://github.com/collecokzn-creator/colleco-mvp
      2. Settings > Secrets and variables > Actions
      3. Add these secrets:
         - VITE_GOOGLE_MAPS_API_KEY: <your-key>
         - (Optional) API_TOKEN: <your-token>
    `,
  },
  production: {
    name: 'Production (GitHub Pages)',
    file: 'deploy.yml workflow',
    description: 'Live deployment at collecokzn-creator.github.io/colleco-mvp',
    requiredVars: ['VITE_GOOGLE_MAPS_API_KEY'],
    gitignored: false,
    instructions: `
      GitHub Actions automatically injects VITE_GOOGLE_MAPS_API_KEY from secrets
      into the build environment during deployment. No manual action needed.
    `,
  },
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function section(title) {
  console.log(`\n${colors.blue}▶ ${title}${colors.reset}`);
}

/**
 * Check if a variable is set in .env.local
 */
function getEnvVar(varName) {
  if (!fs.existsSync(ENV_LOCAL)) return null;
  
  const content = fs.readFileSync(ENV_LOCAL, 'utf8');
  const regex = new RegExp(`^${varName}=(.+)$`, 'm');
  const match = content.match(regex);
  return match ? match[1] : null;
}

/**
 * Set a variable in .env.local
 */
function setEnvVar(varName, value) {
  let content = '';
  if (fs.existsSync(ENV_LOCAL)) {
    content = fs.readFileSync(ENV_LOCAL, 'utf8');
  }
  
  const regex = new RegExp(`^${varName}=.+$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${varName}=${value}`);
  } else {
    content += (content ? '\n' : '') + `${varName}=${value}`;
  }
  
  fs.writeFileSync(ENV_LOCAL, content, 'utf8');
}

/**
 * Validate local environment
 */
function validateLocal() {
  section('Local Development Environment (.env.local)');
  
  if (!fs.existsSync(ENV_LOCAL)) {
    log('✗ .env.local not found', 'red');
    log('Creating from .env.example...', 'yellow');
    fs.copyFileSync(ENV_EXAMPLE, ENV_LOCAL);
    log('✓ Created .env.local', 'green');
  } else {
    log('✓ .env.local exists', 'green');
  }
  
  // Check required variables
  const env = ENVIRONMENTS.local;
  let allValid = true;
  
  console.log('\nRequired variables:');
  env.requiredVars.forEach(varName => {
    const value = getEnvVar(varName);
    if (value && value !== `<YOUR_${varName.toUpperCase()}>`) {
      log(`  ✓ ${varName}`, 'green');
    } else {
      log(`  ✗ ${varName} - needs to be set`, 'red');
      allValid = false;
    }
  });
  
  console.log('\nOptional variables:');
  env.optionalVars.forEach(varName => {
    const value = getEnvVar(varName);
    if (value) {
      log(`  ✓ ${varName}`, 'green');
    } else {
      log(`  ○ ${varName} - not set (optional)`, 'gray');
    }
  });
  
  return allValid;
}

/**
 * Check GitHub secrets via CLI
 */
function checkGitHubSecrets() {
  section('GitHub Actions Secrets');
  
  try {
    log('Checking GitHub CLI authentication...', 'blue');
    const result = execSync('gh auth status', { encoding: 'utf8' });
    log('✓ Authenticated with GitHub', 'green');
    
    console.log('\nFetching secrets...');
    const secrets = execSync('gh secret list', { encoding: 'utf8' });
    
    if (secrets.includes('VITE_GOOGLE_MAPS_API_KEY')) {
      log('✓ VITE_GOOGLE_MAPS_API_KEY is set', 'green');
    } else {
      log('✗ VITE_GOOGLE_MAPS_API_KEY is NOT set', 'red');
      log('   Add it manually via: Settings > Secrets and variables > Actions', 'yellow');
    }
    
    if (secrets.includes('API_TOKEN')) {
      log('✓ API_TOKEN is set (optional)', 'green');
    } else {
      log('○ API_TOKEN not set (optional)', 'gray');
    }
  } catch (error) {
    log('⚠ GitHub CLI not available. Install with: gh auth login', 'yellow');
    log('   Then manually verify secrets at:', 'gray');
    log('   https://github.com/collecokzn-creator/colleco-mvp/settings/secrets/actions', 'gray');
  }
}

/**
 * Show environment-specific setup instructions
 */
function showSetupInstructions() {
  header('Environment Setup Instructions');
  
  Object.entries(ENVIRONMENTS).forEach(([key, env]) => {
    section(`${env.name} (${env.file})`);
    log(env.description, 'gray');
    
    if (env.instructions) {
      console.log(env.instructions);
    }
    
    console.log('Required variables:');
    env.requiredVars.forEach(v => log(`  • ${v}`, 'cyan'));
    
    if (env.optionalVars?.length) {
      console.log('Optional variables:');
      env.optionalVars.forEach(v => log(`  • ${v}`, 'gray'));
    }
  });
}

/**
 * Interactive setup wizard
 */
function interactiveSetup() {
  header('CollEco MVP - Environment Setup Wizard');
  
  const isValid = validateLocal();
  
  console.log('\n');
  checkGitHubSecrets();
  
  console.log('\n');
  showSetupInstructions();
  
  console.log('\n');
  section('Next Steps');
  
  if (!isValid) {
    log('1. Update .env.local with your actual API keys', 'yellow');
    log('2. Add VITE_GOOGLE_MAPS_API_KEY to GitHub Secrets', 'yellow');
  } else {
    log('✓ All local environment variables are configured', 'green');
    log('✓ Verify GitHub Secrets are set (see above)', 'green');
  }
  
  log('\nFor more details:', 'cyan');
  log('  - Read: .env.example', 'gray');
  log('  - Read: docs/SECRETS_MANAGEMENT.md', 'gray');
  log('  - Read: SECURITY_AUDIT_REPORT.md', 'gray');
}

/**
 * Validation-only mode
 */
function validateOnly() {
  header('Environment Validation');
  
  const isValid = validateLocal();
  checkGitHubSecrets();
  
  if (isValid) {
    console.log('\n');
    log('✓ All environments are properly configured!', 'green');
    process.exit(0);
  } else {
    console.log('\n');
    log('✗ Some environment variables need attention', 'red');
    process.exit(1);
  }
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--validate')) {
    validateOnly();
  } else if (args.includes('--check-github')) {
    checkGitHubSecrets();
  } else {
    interactiveSetup();
  }
}

main();
