import { describe, it, expect } from 'vitest';
import { TOOL_CONFIG } from '../src/components/Sidebar.jsx';

function hasDuplicates(arr) {
  return new Set(arr).size !== arr.length;
}

describe('Sidebar TOOL_CONFIG uniqueness', () => {
  it('no duplicate labels within each role', () => {
    for (const role of Object.keys(TOOL_CONFIG)) {
      const labels = TOOL_CONFIG[role].map(t => t.label);
      expect(hasDuplicates(labels)).toBe(false);
    }
  });

  it('no duplicate routes within each role', () => {
    for (const role of Object.keys(TOOL_CONFIG)) {
      const routes = TOOL_CONFIG[role].map(t => t.to);
      expect(hasDuplicates(routes)).toBe(false);
    }
  });
});
