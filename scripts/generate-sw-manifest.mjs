#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');
const outFile = path.join(distDir, 'sw-manifest.json');
const criticalOutFile = path.join(distDir, 'sw-manifest.critical.json');

const exts = new Set(['.js', '.css', '.html', '.ico', '.webmanifest', '.png', '.svg', '.json']);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const res = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...await walk(res));
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (exts.has(ext)) files.push(res);
    }
  }
  return files;
}

async function main() {
  try {
    const exists = await fs.stat(distDir).then(()=>true).catch(()=>false);
    if (!exists) {
      console.warn('dist directory not found; run build first');
      process.exit(0);
    }
  const files = await walk(distDir);
  // convert to web paths relative to dist root
  const urls = files.map(f => '/' + path.relative(distDir, f).split(path.sep).join('/'));
  // filter out source maps
  const filtered = urls.filter(u => !u.endsWith('.map'));

  // Derive a conservative "critical" subset to keep precache small.
  // We include the SPA shell, manifest, favicon and common entry/runtime/vendor chunks and any CSS.
  const criticalRegex = /(^\/index\.html$|^\/$|\/favicon\.ico$|\/manifest\.webmanifest$|\/assets\/.*(?:index|vendor|main|runtime|entry|client|app|chunk)[^/]*\.(?:js|css)$|\/assets\/.*\.css$)/i;
  let critical = filtered.filter(u => criticalRegex.test(u));
  // Ensure root and index are present
  if (!critical.includes('/')) critical.unshift('/');
  if (!critical.includes('/index.html')) critical = Array.from(new Set(['/index.html', ...critical]));

  await fs.writeFile(outFile, JSON.stringify(filtered, null, 2), 'utf8');
  await fs.writeFile(criticalOutFile, JSON.stringify(critical, null, 2), 'utf8');
  console.log('Wrote', outFile, 'with', filtered.length, 'entries');
  console.log('Wrote', criticalOutFile, 'with', critical.length, 'entries');
  } catch (e) {
    console.error('Failed to generate sw-manifest:', e);
    process.exit(1);
  }
}

main();
