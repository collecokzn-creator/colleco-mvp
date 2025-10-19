import { describe, it, expect } from 'vitest';
import request from 'supertest';
const app = require('../server/server');

describe('AI Itinerary Refine API', () => {
  it('POST /api/ai/itinerary/refine adjusts nights and adds interests', async () => {
    const prompt = 'Family trip to Cape Town for 3 nights, food';
    // Request refine: add hiking and 2 more nights
    const instructions = 'Please add hiking and 2 more nights';
    const res = await request(app).post('/api/ai/itinerary/refine').send({ prompt, instructions });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    const d = res.body.data;
    expect(d).toBeDefined();
    expect(d).toHaveProperty('nights');
    expect(d.nights).toBeGreaterThanOrEqual(5);
    expect(d).toHaveProperty('interests');
    expect(Array.isArray(d.interests)).toBeTruthy();
    // Ensure 'hiking' was added
    expect(d.interests.map(i=>i.toLowerCase())).toContain('hiking');
    // Pricing regenerated
    expect(d).toHaveProperty('pricing');
    expect(d.pricing).toHaveProperty('total');
  });
});
