# Siteminder integration - lightweight contract

This document captures a minimal, concrete contract (inputs/outputs) to implement a mock-first connector for Siteminder. Use these shapes to build the wrapper, mocks, and tests.

1) High-level operations

- createBooking(bookingData)
  - Input: {
      idempotencyKey?: string,
      propertyId: string,
      roomTypeId: string,
      ratePlanId?: string,
      guest: { firstName, lastName, email, phone },
      arrivalDate: 'YYYY-MM-DD',
      departureDate: 'YYYY-MM-DD',
      rooms: number,
      extras?: array,
      metadata?: object
    }
  - Output: {
      providerBookingId: string,
      status: 'confirmed' | 'pending' | 'rejected',
      createdAt: ISOString,
      metadata?: object
    }

- updateBooking(providerBookingId, updateData)
  - Input: { providerBookingId, changes: object }
  - Output: { providerBookingId, status, updatedAt, metadata }

- cancelBooking(providerBookingId, reason?)
  - Input: { providerBookingId, reason?: string }
  - Output: { providerBookingId, status: 'cancelled'|'not_found'|'failed', metadata }

- getAvailability(params)
  - Input: { propertyId, startDate, endDate, roomTypeIds?: [] }
  - Output: { availability: [{ date: 'YYYY-MM-DD', roomTypeId, availableUnits }], metadata }

- pushRates(ratePayload)
  - Input: { propertyId, ratePlanId, effectiveFrom, effectiveTo, rates: [{ date, price, currency }] }
  - Output: { accepted: boolean, errors?: [{ path, message }] }

2) Webhook events (example)

- booking.created
  - { providerBookingId, propertyId, status, guest, arrivalDate, departureDate, createdAt }
- booking.updated
  - { providerBookingId, changes, updatedAt }
- booking.cancelled
  - { providerBookingId, cancelledAt, reason }

3) Error handling and retries

- 429 -> respect Retry-After header, exponential backoff
- 5xx -> retry once with jitter, then surface to ops
- For createBooking: require idempotencyKey to guarantee duplicate-safety

4) Local mock behavior (requirements for our mock server)

- In-memory booking store keyed by providerBookingId
- Deterministic sample data suitable for unit tests and Cypress stubs
- Ability to inject failures (simulate 429, 500) for testing retry logic

5) Security

- Webhook validation using an HMAC secret (SITEMINDER_WEBHOOK_SECRET)
- Auth config: SITEMINDER_API_URL, SITEMINDER_API_KEY or OAuth client credentials

6) Notes

Keep the wrapper API slim and return normalized objects so the rest of the app doesn't depend on provider-specific fields. Add mapping layers if Siteminder payloads differ from these shapes.
