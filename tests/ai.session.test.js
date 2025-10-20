import { describe, it, expect } from 'vitest';
import request from 'supertest';
const app = require('../server/server');

describe('AI Session endpoints', () => {
  it('creates a session, refines it, and fetches session history', async () => {
    const prompt = 'Couples trip to Lisbon for 4 nights, art and food';
    const createRes = await request(app).post('/api/ai/session').send({ prompt });
    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty('id');
    const id = createRes.body.id;
    expect(createRes.body).toHaveProperty('data');

    // refine session
    const instructions = 'Add a day for wine tasting and 1 more night';
    const refineRes = await request(app).post(`/api/ai/session/${id}/refine`).send({ instructions });
    expect(refineRes.status).toBe(200);
    expect(refineRes.body).toHaveProperty('data');
    const refined = refineRes.body.data;
    expect(refined).toHaveProperty('nights');
    expect(refined.nights).toBeGreaterThanOrEqual(5);

    // fetch session
    const getRes = await request(app).get(`/api/ai/session/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveProperty('history');
    expect(Array.isArray(getRes.body.history)).toBeTruthy();
    // history should include at least parse and refine entries
    const types = getRes.body.history.map(h => h.type);
    expect(types).toContain('parse');
    expect(types).toContain('refine');
  });
});
