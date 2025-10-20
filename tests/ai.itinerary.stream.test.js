import { describe, it, expect } from 'vitest';
import request from 'supertest';
const app = require('../server/server');

describe('AI Itinerary SSE stream', () => {
  it('GET /api/ai/itinerary/stream emits parse, plan, pricing, done events', async () => {
    const prompt = 'Weekend in Cape Town with food and beach';
    const res = await request(app).get('/api/ai/itinerary/stream').query({ prompt });
    // supertest buffers the stream until end; server ends after emitting events
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/event-stream/);
    const text = res.text || '';
    expect(text).toContain('event: parse');
    expect(text).toContain('event: plan');
    expect(text).toContain('event: pricing');
    expect(text).toContain('event: done');

    // Parse SSE chunks
    const chunks = text.split('\n\n').map(s => s.trim()).filter(Boolean);
    const events = chunks.map(chunk => {
      const lines = chunk.split('\n');
      let ev = 'message';
      let dataStr = '';
      for (const ln of lines) {
        if (ln.startsWith('event:')) ev = ln.slice(6).trim();
        else if (ln.startsWith('data:')) dataStr += ln.slice(5).trim();
      }
      let data = null;
      try { data = JSON.parse(dataStr); } catch(e) { data = dataStr; }
      return { event: ev, data };
    });

    const evNames = events.map(e => e.event);
    expect(evNames).toContain('parse');
    expect(evNames).toContain('plan');
    expect(evNames).toContain('pricing');
    expect(evNames).toContain('done');

    const parseEv = events.find(e => e.event === 'parse');
    const planEv = events.find(e => e.event === 'plan');
    const pricingEv = events.find(e => e.event === 'pricing');
    const doneEv = events.find(e => e.event === 'done');

    expect(parseEv).toBeDefined();
    expect(parseEv.data).toHaveProperty('nights');
    expect(typeof parseEv.data.nights).toBe('number');

    expect(planEv).toBeDefined();
    expect(planEv.data).toHaveProperty('itinerary');
    expect(Array.isArray(planEv.data.itinerary)).toBeTruthy();

    expect(pricingEv).toBeDefined();
    expect(pricingEv.data).toHaveProperty('pricing');
    // pricing data may be nested depending on server; allow both shapes
    const p = pricingEv.data.pricing || pricingEv.data;
    expect(p).toHaveProperty('total');

    expect(doneEv).toBeDefined();
    expect(doneEv.data).toHaveProperty('ok');
    expect(doneEv.data.ok).toBe(true);
  });
});
