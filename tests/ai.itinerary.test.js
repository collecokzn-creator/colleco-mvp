import { describe, it, expect } from 'vitest';
import request from 'supertest';
const app = require('../server/server');

describe('AI Itinerary API', () => {
  it('POST /api/ai/itinerary returns parsed itinerary and pricing (200)', async () => {
    const payload = { prompt: 'Family trip to Cape Town for 5 nights, food and beaches, budget R5000' };
    const res = await request(app).post('/api/ai/itinerary').send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    const d = res.body.data;
    expect(d).toBeDefined();
    expect(d).toHaveProperty('itinerary');
    expect(Array.isArray(d.itinerary)).toBeTruthy();
    expect(d).toHaveProperty('nights');
    expect(typeof d.nights).toBe('number');
    expect(d).toHaveProperty('pricing');
    expect(d.pricing).toHaveProperty('total');
  });
});
