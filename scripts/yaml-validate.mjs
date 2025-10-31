#!/usr/bin/env node
// Simple YAML validator for GitHub workflow files
// Usage: node scripts/yaml-validate.mjs
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const workflowsDir = path.resolve('.github', 'workflows');

function listYamlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml')).map(f => path.join(dir, f));
}

const files = listYamlFiles(workflowsDir);
if (files.length === 0) {
  console.log('No workflow YAML files found in .github/workflows');
  process.exit(0);
}

let hadError = false;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  try {
    YAML.parse(content);
    console.log(`OK  ${path.relative(process.cwd(), file)}`);
  } catch (err) {
    hadError = true;
    console.error(`ERR ${path.relative(process.cwd(), file)} -> ${err && err.message ? err.message : err}`);
  }
}

process.exit(hadError ? 1 : 0);
