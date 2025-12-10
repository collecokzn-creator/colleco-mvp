#!/usr/bin/env node
/*
 * Minimal pre-commit secret scanner (Node)
 * Keeps the check simple and robust to avoid parsing/regex edge-cases.
 * Scans staged files for potential API keys, tokens, and credentials
 */

const { execSync } = require('child_process');
const fs = require('fs');

const SECRET_PATTERNS = [
  { pattern: /AIza[0-9A-Za-z_-]{35}/, name: 'Google API Key' },
  { pattern: /sk_live_[0-9a-zA-Z]{24,}/, name: 'Stripe Live Key' },
  { pattern: /pk_live_[0-9a-zA-Z]{24,}/, name: 'Stripe Publishable Key' },
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
  { pattern: /\b(postgres|mysql|mongodb):\/\/\S+:\S+@/, name: 'Database URL with credentials' },
  { pattern: /-----BEGIN (RSA|EC|DSA)? PRIVATE KEY-----|-----BEGIN OPENSSH PRIVATE KEY-----/, name: 'Private Key' },
  { pattern: /api[_-]?key[\s]*[=:][\s]*['"][a-zA-Z0-9_-]{16,}['"]/, name: 'Generic API Key' },
];

// Files or directories to ignore from scanning to avoid false-positives
const IGNORE_FILES = [
  '.git/',
  'node_modules/',
  '.husky/',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
];

function shouldIgnoreFile(file) {
  return IGNORE_FILES.some(p => file.includes(p));
}

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return out.trim().split('\n').filter(Boolean);
  } catch (err) {
    return [];
  }
}

function scanFileForSecrets(file) {
  if (!fs.existsSync(file)) return [];
  if (shouldIgnoreFile(file)) return [];
  const content = fs.readFileSync(file, 'utf8');
  const findings = [];
  SECRET_PATTERNS.forEach(({ pattern, name }) => {
    if (pattern.test(content)) findings.push({ file, type: name });
  });
  return findings;
}

function main() {
  const staged = getStagedFiles();
  if (staged.length === 0) return 0;
  let results = [];
  staged.forEach(f => { results = results.concat(scanFileForSecrets(f)); });
  if (results.length === 0) return 0;
  console.error('\n❌ POTENTIAL SECRETS DETECTED IN STAGED FILES:\n');
  results.forEach(r => console.error(` - ${r.file}: ${r.type}`));
  console.error('\nPlease remove secrets or add to .gitignore before committing.');
  return 1;
}

process.exit(main());
