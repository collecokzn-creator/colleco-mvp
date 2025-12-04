#!/usr/bin/env node
/**
 * Windows-friendly pre-commit hook wrapper
 * Use this on Windows PowerShell instead of .husky/pre-commit
 * 
 * To use on Windows:
 * 1. npm run husky-skip (to disable default husky for Git Bash)
 * 2. Configure this script in your IDE's pre-commit settings
 * 
 * Or better: Use Git Bash for commits (it supports .husky/pre-commit natively)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Patterns that indicate potential secrets
const SECRET_PATTERNS = [
  // API Keys
  { pattern: /AIza[0-9A-Za-z_-]{35}/, name: 'Google API Key' },
  { pattern: /sk_live_[0-9a-zA-Z]{24,}/, name: 'Stripe Live Key' },
  { pattern: /pk_live_[0-9a-zA-Z]{24,}/, name: 'Stripe Publishable Key' },
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
  
  // Generic patterns
  { pattern: /api[_-]?key[\s]*[=:][\s]*['"][a-zA-Z0-9_-]{20,}['"]/, name: 'Generic API Key' },
  { pattern: /secret[\s]*[=:][\s]*['"][a-zA-Z0-9_-]{20,}['"]/, name: 'Generic Secret' },
  { pattern: /password[\s]*[=:][\s]*['"][^'"]{8,}['"]/, name: 'Password' },
  { pattern: /token[\s]*[=:][\s]*['"][a-zA-Z0-9_-]{20,}['"]/, name: 'Token' },
  
  // Private keys
  { pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/, name: 'Private Key' },
  { pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/, name: 'SSH Private Key' },
  
  // Database URLs
  { pattern: /(postgres|mysql|mongodb):\/\/[^\s'"]+:[^\s'"]+@/, name: 'Database URL with credentials' },
];

// Files to always ignore
const IGNORE_FILES = [
  '.gitignore',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.git/',
  'node_modules/',
  '.env.local',
  '.env.*.local',
];

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf8',
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    return [];
  }
}

function shouldIgnoreFile(filePath) {
  return IGNORE_FILES.some(ignore => filePath.includes(ignore));
}

function scanFileForSecrets(filePath) {
  if (!fs.existsSync(filePath)) return [];
  if (shouldIgnoreFile(filePath)) return [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];
    
    SECRET_PATTERNS.forEach(({ pattern, name }) => {
      const matches = content.match(new RegExp(pattern, 'g'));
      if (matches) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            findings.push({
              file: filePath,
              line: index + 1,
              type: name,
              preview: line.trim().substring(0, 80),
            });
          }
        });
      }
    });
    
    return findings;
  } catch (error) {
    console.warn(`Warning: Could not scan ${filePath}: ${error.message}`);
    return [];
  }
}

function main() {
  console.log('🔍 [Windows] Scanning for potential secrets...\n');
  
  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    console.log('✅ No files to scan.\n');
    return 0;
  }
  
  let allFindings = [];
  
  stagedFiles.forEach(file => {
    const findings = scanFileForSecrets(file);
    allFindings = allFindings.concat(findings);
  });
  
  if (allFindings.length === 0) {
    console.log('✅ No secrets detected. Safe to commit.\n');
    return 0;
  }
  
  // Report findings
  console.error('❌ POTENTIAL SECRETS DETECTED!\n');
  console.error('The following files contain patterns that look like secrets:\n');
  
  allFindings.forEach(finding => {
    console.error(`  ${finding.file}:${finding.line}`);
    console.error(`  Type: ${finding.type}`);
    console.error(`  Preview: ${finding.preview}`);
    console.error('');
  });
  
  console.error('⚠️  COMMIT BLOCKED!\n');
  console.error('Please remove sensitive data before committing.');
  console.error('If these are false positives, you can:');
  console.error('  1. Use environment variables instead (.env.local)');
  console.error('  2. Add files to .gitignore');
  console.error('  3. Use placeholder values in documentation\n');
  
  return 1;
}

process.exit(main());
