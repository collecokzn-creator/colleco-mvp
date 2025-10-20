import { describe, it, expect } from 'vitest';
import request from 'supertest';
const app = require('../server/server');

describe('AI Draft endpoints', () => {
  it('POST /api/ai/draft persists and GET /api/ai/draft/:id retrieves', async () => {
    const payload = { prompt: 'Sample trip', data: { nights: 2, itinerary: [] } };
    const post = await request(app).post('/api/ai/draft').send(payload);
    expect(post.status).toBe(201);
    expect(post.body).toHaveProperty('id');
    const id = post.body.id;
    const get = await request(app).get(`/api/ai/draft/${id}`);
    expect(get.status).toBe(200);
    expect(get.body).toHaveProperty('prompt', 'Sample trip');
    expect(get.body).toHaveProperty('data');
  });
});
