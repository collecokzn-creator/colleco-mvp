import { describe, it, expect } from 'vitest';
import { sortEvents, mergeAndSort } from '../src/utils/eventsSort.js';

describe('eventsSort', () => {
  const mk = (id, date) => ({ id, date });

  it('sortEvents ascending by date, unknown last', () => {
    const list = [
      mk('c', '2025-12-31'),
      mk('a', '2025-01-01'),
      mk('x', 'not-a-date'),
      mk('b', '2025-06-15'),
      mk('n', undefined),
    ];
    const out = sortEvents(list, 'dateAsc');
    expect(out.map(e => e.id)).toEqual(['a', 'b', 'c', 'x', 'n']);
  });

  it('sortEvents descending by date, unknown last', () => {
    const list = [
      mk('c', '2025-12-31'),
      mk('a', '2025-01-01'),
      mk('x', 'not-a-date'),
      mk('b', '2025-06-15'),
      mk('n', undefined),
    ];
    const out = sortEvents(list, 'dateDesc');
    expect(out.map(e => e.id)).toEqual(['c', 'b', 'a', 'x', 'n']);
  });

  it('mergeAndSort merges then keeps order as requested', () => {
    const prev = [mk('a', '2025-01-01'), mk('c', '2025-12-31')];
    const more = [mk('b', '2025-06-15')];
    const asc = mergeAndSort(prev, more, 'dateAsc');
    expect(asc.map(e => e.id)).toEqual(['a', 'b', 'c']);
    const desc = mergeAndSort(prev, more, 'dateDesc');
    expect(desc.map(e => e.id)).toEqual(['c', 'b', 'a']);
  });
});
