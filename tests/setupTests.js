// Ensure Vitest's expect is available globally for jest-dom to extend
import { expect as vitestExpect } from 'vitest';
// Some versions of @testing-library/jest-dom extend the global expect on import time.
// Attach vitest's expect to global before importing jest-dom.
global.expect = vitestExpect;
await import('@testing-library/jest-dom');

// Polyfill missing browser APIs in jsdom used by components/tests.
// jsdom doesn't implement matchMedia or scrollTo by default which causes
// tests to throw. Provide minimal, safe implementations used by the app.
// Ensure a `window` global exists and attach polyfills. Some runtimes place the
// DOM globals on `globalThis`, others on `global.window`. Make both point to
// the same object so consumers can safely access `window.*`.
const G = globalThis || global || {};
if (!G.window) G.window = G;
if (!G.document) G.document = G.window.document;
if (typeof G.window.matchMedia !== 'function') {
  G.window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
  });
}
// Replace scrollTo aggressively because jsdom may provide a stub that throws
try {
  Object.defineProperty(G.window, 'scrollTo', { value: () => {}, configurable: true });
  G.window.scrollTo = () => {};
} catch (e) {
  try { G.window.scrollTo = () => {}; } catch (e) {}
}

// Provide a global fetch mock if needed in tests
if (!global.fetch) {
  global.fetch = () => Promise.resolve({ ok: true, json: () => ({}) });
}

  // Mock react-day-picker in unit tests to avoid heavy DOM rendering and timing issues
try {
  const gv = globalThis || global || window;
  if (gv && typeof gv.vi !== 'undefined') {
    gv.vi.mock('react-day-picker', () => {
      const React = require('react');
      const MockDateRange = ({ selected, onSelect }) => {
        return React.createElement('div', { 'data-testid': 'mock-date-range' }, [
          React.createElement('input', { key: 'from', 'data-testid': 'mock-from', type: 'date', defaultValue: selected && selected.from ? selected.from.toISOString().slice(0,10) : '', onChange: (e) => onSelect && onSelect({ from: new Date(e.target.value), to: selected && selected.to }) }),
          React.createElement('input', { key: 'to', 'data-testid': 'mock-to', type: 'date', defaultValue: selected && selected.to ? selected.to.toISOString().slice(0,10) : '', onChange: (e) => onSelect && onSelect({ from: selected && selected.from, to: new Date(e.target.value) }) })
        ]);
      };
      return { DateRange: MockDateRange };
    });
    gv.vi.mock('react-day-picker/dist/style.css', () => ({}));
  }
} catch (e) {
  // ignore if mocking isn't available in the environment
}
