import { describe, it, expect } from 'vitest';
import request from 'supertest';
const app = require('../server/server');

describe('Quotes API', () => {
  it('GET /api/quotes returns list (200)', async () => {
    const res = await request(app).get('/api/quotes');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('quotes');
    expect(Array.isArray(res.body.quotes)).toBeTruthy();
  });

  it('POST /api/quotes creates a quote (201)', async () => {
    const payload = { clientName: 'Test Client', items: [], currency: 'USD' };
    const res = await request(app).post('/api/quotes').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('quote');
    expect(res.body.quote.clientName).toBe('Test Client');
  });

  it('POST then GET returns created quote in list', async () => {
    const payload = { clientName: 'List Client', items: [], currency: 'USD' };
    const post = await request(app).post('/api/quotes').send(payload);
    expect(post.status).toBe(201);
    const list = await request(app).get('/api/quotes');
    expect(list.status).toBe(200);
    const found = (list.body.quotes || []).find(q => q.clientName === 'List Client');
    expect(found).toBeDefined();
  });

  it('PUT /api/quotes/:id updates a quote', async () => {
    const payload = { clientName: 'To Update', items: [], currency: 'USD' };
    const post = await request(app).post('/api/quotes').send(payload);
    expect(post.status).toBe(201);
    const id = post.body.quote.id;
    const upd = await request(app).put(`/api/quotes/${id}`).send({ clientName: 'Updated Name' });
    expect(upd.status).toBe(200);
    expect(upd.body.quote.clientName).toBe('Updated Name');
  });

  it('DELETE /api/quotes/:id removes a quote', async () => {
    const payload = { clientName: 'To Delete', items: [], currency: 'USD' };
    const post = await request(app).post('/api/quotes').send(payload);
    expect(post.status).toBe(201);
    const id = post.body.quote.id;
    const del = await request(app).delete(`/api/quotes/${id}`);
    expect(del.status).toBe(200);
    const list = await request(app).get('/api/quotes');
    const found = (list.body.quotes || []).find(q => q.id === id);
    expect(found).toBeUndefined();
  });
});
