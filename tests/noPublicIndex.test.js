import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('No duplicate public index', () => {
  it('should not have public/index.html', () => {
    const p = path.join(process.cwd(), 'public', 'index.html');
    expect(fs.existsSync(p)).toBe(false);
  });
});
