// Ensure Vitest's expect is available globally for jest-dom to extend
import { expect as vitestExpect } from 'vitest';
// Some versions of @testing-library/jest-dom extend the global expect on import time.
// Attach vitest's expect to global before importing jest-dom.
global.expect = vitestExpect;
import '@testing-library/jest-dom';

// Provide a global fetch mock if needed in tests
if (!global.fetch) {
  global.fetch = () => Promise.resolve({ ok: true, json: () => ({}) });
}
