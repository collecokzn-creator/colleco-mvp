#!/usr/bin/env node
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

const timeoutMs = 600;
const startPort = Number(process.env.PORT || '4000') || 4000;
const maxProbe = 10;
const candidates = Array.from({ length: maxProbe }, (_, i) => startPort + i);

function withTimeout(promise, ms) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  return Promise.race([
    promise(ac.signal),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms + 10))
  ]).finally(() => clearTimeout(t));
}

async function probe(port) {
  const url = `http://localhost:${port}/health`;
  try {
    const res = await withTimeout((signal) => fetch(url, { signal }), timeoutMs);
    if (!res.ok) return null;
    const j = await res.json().catch(() => null);
    if (j && j.ok) return `http://localhost:${port}`;
  } catch (_) {}
  return null;
}

async function main() {
  let base = process.env.VITE_API_BASE || '';
  // If explicitly set, respect it.
  if (!base) {
    for (const p of candidates) {
      // eslint-disable-next-line no-await-in-loop
      const found = await probe(p);
      if (found) { base = found; break; }
    }
  }

  if (!base) {
    console.log('[dev-detect-api] No running backend detected on', candidates.join(','));
    return;
  }

  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  let content = '';
  if (fs.existsSync(envLocalPath)) {
    content = await fsp.readFile(envLocalPath, 'utf8');
  }
  const lines = content ? content.split(/\r?\n/) : [];
  const idx = lines.findIndex((l) => l.trim().startsWith('VITE_API_BASE='));
  const line = `VITE_API_BASE=${base}`;
  if (idx >= 0) {
    if (lines[idx] === line) {
      console.log('[dev-detect-api] VITE_API_BASE already set to', base);
      return;
    }
    lines[idx] = line;
  } else {
    lines.push(line);
  }
  if (lines.length && lines[lines.length - 1].trim() !== '') lines.push('');
  await fsp.writeFile(envLocalPath, lines.join('\n'), 'utf8');
  console.log('[dev-detect-api] Updated .env.local:', line);
}

main().catch((e) => {
  console.error('[dev-detect-api] error:', e?.message || e);
  process.exit(0);
});
