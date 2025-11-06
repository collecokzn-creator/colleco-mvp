#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(e.name)) continue;
      files.push(...await walk(full));
    } else if (/\.(js|mjs|jsx)$/.test(e.name)) {
      files.push(full);
    }
  }
  return files;
}

function extractImportLines(content) {
  // crude import line extractor: lines starting with 'import '
  return content.split(/\r?\n/).filter(l => l.trim().startsWith('import '));
}

function moduleFromImport(line) {
  // capture from 'from' or bare import
  const m = line.match(/from\s+['\"]([^'\"]+)['\"]/);
  if (m) return m[1];
  const m2 = line.match(/import\s+['\"]([^'\"]+)['\"]/);
  return m2 ? m2[1] : null;
}

async function main() {
  const start = path.join(root, 'src');
  const exists = await fs.stat(start).then(() => true).catch(() => false);
  const base = exists ? start : root;
  const files = await walk(base);
  let problems = 0;
  for (const f of files) {
    const content = await fs.readFile(f, 'utf8');
    const imports = extractImportLines(content);
    if (imports.length === 0) continue;
    // check identical import line duplicates
    const lineCounts = imports.reduce((acc, l) => (acc[l] = (acc[l] || 0) + 1, acc), {});
    const dupLines = Object.entries(lineCounts).filter(([_, c]) => c > 1);
    // check same module imported multiple times
    const modules = imports.map(moduleFromImport).filter(Boolean);
    const modCounts = modules.reduce((acc, m) => (acc[m] = (acc[m] || 0) + 1, acc), {});
    const dupModules = Object.entries(modCounts).filter(([_, c]) => c > 1);
    if (dupLines.length || dupModules.length) {
      problems++;
      console.log('\n-- DUPLICATE IMPORTS IN:', f);
      if (dupLines.length) {
        console.log('  identical import lines repeated:');
        for (const [line, count] of dupLines) console.log(`    (${count}x)  ${line}`);
      }
      if (dupModules.length) {
        console.log('  modules imported multiple times:');
        for (const [m, count] of dupModules) console.log(`    (${count}x)  ${m}`);
      }
    }
  }
  if (problems === 0) {
    console.log('No duplicate imports found (scanned', files.length, 'files).');
    process.exit(0);
  } else {
    console.log('\nFound', problems, 'file(s) with duplicate import issues.');
    process.exit(2);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
