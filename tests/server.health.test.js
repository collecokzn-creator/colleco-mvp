import { describe, it, expect } from 'vitest'
import request from 'supertest'

// We require the server app directly; it should not start listening in test mode
// server.js exports the Express app instance
const app = require('../server/server')

describe('API: /health', () => {
  it('returns ok: true', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body && res.body.ok).toBe(true)
    expect(res.body && res.body.service).toBe('collab-api')
  })
})
