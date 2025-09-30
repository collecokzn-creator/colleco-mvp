import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

describe('HTML & Manifest wiring', () => {
  it('index.html should include manifest and module entry and #root', () => {
    const html = read('index.html');
    expect(html).toMatch(/<link[^>]+rel="manifest"[^>]+href="\/manifest\.webmanifest"/);
    expect(html).toMatch(/<script[^>]+type="module"[^>]+src="\/src\/main\.jsx"/);
    expect(html).toMatch(/<div id="root"><\/div>/);
  });

  it('manifest.json should have required fields', () => {
    const manifest = JSON.parse(read('public/manifest.webmanifest'));
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    expect(Array.isArray(manifest.icons)).toBe(true);
  });
});
