import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'

const app = require('../server/server')

let originalFetch

describe('Yoco checkout integration (mocked)', () => {
  beforeAll(() => {
    originalFetch = global.fetch
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it('returns redirect URL when Yoco creates checkout', async () => {
    // Arrange: mock global fetch to return a Yoco-style response
    const mockedRedirect = 'https://online.yoco.com/checkout/redirect/abcdef'
    global.fetch = async (input, _init) => {
      const url = typeof input === 'string' ? input : input.url
      if (url && url.endsWith('/checkouts')) {
        return {
          ok: true,
          status: 201,
          statusText: 'Created',
          text: async () => JSON.stringify({ checkout_url: mockedRedirect })
        }
      }
      return { ok: false, status: 404, statusText: 'Not Found', text: async () => '' }
    }

    // Act: call generate-url endpoint
    const res = await request(app).post('/api/payments/generate-url').send({
      bookingId: 'TEST-BK-1',
      processor: 'yoco',
      amount: 123.45,
      returnUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel'
    })

    // Assert
    expect(res.status).toBe(200)
    expect(res.body).toBeDefined()
    // endpoint returns { paymentUrl }
    expect(res.body.paymentUrl).toBe(mockedRedirect)
  }, 10_000)
})
