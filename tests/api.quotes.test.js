import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as quotesApi from '../src/api/quotes';

describe('quotes API client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => { global.fetch = undefined; });
  afterEach(() => { global.fetch = originalFetch; vi.restoreAllMocks(); });

  it('getQuotes falls back to empty array on network error', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network')));
    const qs = await quotesApi.getQuotes();
    expect(Array.isArray(qs)).toBe(true);
    expect(qs.length).toBe(0);
  });

  it('createQuote falls back to a tmp quote when network fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network')));
    const payload = { clientName: 'Tmp' };
    const created = await quotesApi.createQuote(payload);
    expect(created).toBeDefined();
    expect(created.clientName).toBe('Tmp');
    expect(typeof created.id).toBe('string');
  });
});
