import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { parseIntent } = require('../server/aiParser');

describe('parseIntent (unified)', () => {
  it('detects hotel search in Durban with nights', () => {
    const r = parseIntent('Find me a hotel in Durban for 3 nights');
    expect(r).toBeTruthy();
    expect(Array.isArray(r.intents)).toBe(true);
    const h = r.intents.find(x=>x.type==='hotel_search');
    expect(h).toBeTruthy();
    expect(h.city).toBe('Durban');
    expect(h.nights).toBe(3);
  });

  it('detects car rental with pickup time', () => {
    const r = parseIntent('I need a car rental in Cape Town tomorrow at 9am');
    const c = r.intents.find(x=>x.type==='car_rental');
    expect(c).toBeTruthy();
    expect(c.pickupCity).toBe('Cape Town');
    expect(c.pickupTime).toBe('09:00');
  });

  it('detects activity search with city', () => {
    const r = parseIntent('Activities in Rome on 12/10/2025');
    const a = r.intents.find(x=>x.type==='activity_search');
    expect(a).toBeTruthy();
    expect(a.city).toBe('Rome');
  });

  it('detects quote ops', () => {
    const r = parseIntent('Create a quote for the client');
    const q = r.intents.find(x=>x.type==='quote_ops');
    expect(q).toBeTruthy();
    expect(Array.isArray(q.ops)).toBe(true);
    expect(q.ops[0]?.op).toBe('create');
  });

  it('detects dining near me tonight', () => {
    const r = parseIntent('Find restaurants near me tonight at 7pm with budget R500');
    const d = r.intents.find(x=>x.type==='dining_search');
    expect(d).toBeTruthy();
    expect(d.nearMe).toBe(true);
    expect(d.time).toBe('19:00');
    expect(d.budget.currency).toBe('ZAR');
  });

  it('detects transfer request', () => {
    const r = parseIntent('Need an airport transfer in Durban tomorrow at 9am');
    const t = r.intents.find(x=>x.type==='transfer_request');
    expect(t).toBeTruthy();
    expect(t.city).toBe('Durban');
    expect(t.time).toBe('09:00');
  });

  it('detects events search next weekend', () => {
    const r = parseIntent('What events are on next weekend in Cape Town?');
    const e = r.intents.find(x=>x.type==='event_search');
    expect(e).toBeTruthy();
    expect(e.city).toBe('Cape Town');
  });
});
