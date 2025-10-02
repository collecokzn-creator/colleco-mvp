import { describe, it, expect } from 'vitest'
import request from 'supertest'

const app = require('../server/server')

describe('API: /api/payments/checkout', () => {
  it('rejects missing items', async () => {
    const res = await request(app).post('/api/payments/checkout').send({ items: [] })
    expect(res.status).toBe(400)
    expect(res.body && res.body.error).toBe('items required')
  })

  it('returns a checkout session with fees', async () => {
    const res = await request(app)
      .post('/api/payments/checkout')
      .send({ items: [{ amount: 120.5 }, { amount: 79.5 }], currency: 'USD', metadata: { bookingId: 'BKG-1' } })

    expect(res.status).toBe(200)
    const b = res.body
    expect(b && b.ok).toBe(true)
    expect(typeof b.sessionId).toBe('string')
    expect(typeof b.checkoutUrl).toBe('string')
    expect(b.fees && typeof b.fees.subtotal).toBe('number')
    expect(b.fees && b.fees.currency).toBe('USD')
  })
})
