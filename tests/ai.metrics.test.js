import { describe, it, expect } from 'vitest';
import request from 'supertest';
const app = require('../server/server');

describe('AI Metrics endpoints', () => {
  it('GET /api/ai/metrics returns metrics object and history endpoint returns array', async () => {
    const res = await request(app).get('/api/ai/metrics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    const h = await request(app).get('/api/ai/metrics/history');
    expect(h.status).toBe(200);
    expect(h.body).toHaveProperty('samples');
    expect(Array.isArray(h.body.samples)).toBeTruthy();
  });
});
