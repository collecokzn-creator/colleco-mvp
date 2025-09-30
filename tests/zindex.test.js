import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const cfgPath = path.join(process.cwd(), 'tailwind.config.js');

describe('Tailwind z-index policy', () => {
  it('should expose expected zIndex tokens', async () => {
    // Use dynamic import to evaluate the config module in Node
    const mod = await import(cfgPath);
    const cfg = mod.default || mod;
    const zi = cfg?.theme?.extend?.zIndex;
    expect(zi).toBeTruthy();
    for (const key of ['header','footer','dropdown','floating','skiplink','banner','sticky','modal','toast']) {
      expect(zi[key]).toMatch(/^[0-9]+$/);
    }
  });
});
