import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';

const app = require('../server/server');

describe('Yoco Webhook Integration', () => {
  let testBooking;
  const testWebhookSecret = 'test_webhook_secret_12345';

  beforeEach(async () => {
    // Set up test environment with webhook secret
    process.env.YOCO_WEBHOOK_SECRET = testWebhookSecret;
    process.env.YOCO_SECRET_KEY = 'sk_test_12345';
    process.env.YOCO_PUBLIC_KEY = 'pk_test_12345';

    // Create a test booking first
    const createRes = await request(app)
      .post('/api/bookings')
      .send({
        supplierId: 'beekman',
        userId: 'test_yoco_user_' + Date.now(),
        bookingType: 'FIT',
        checkInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        checkOutDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        lineItems: [
          {
            serviceType: 'accommodation',
            description: 'Yoco Test Hotel - Standard Room',
            basePrice: 500,
            retailPrice: 500,
            quantity: 1,
            nights: 2
          }
        ],
        metadata: {
          propertyName: 'Yoco Test Hotel',
          location: 'Cape Town',
          customerEmail: 'test@example.com'
        }
      });
    
    expect(createRes.status).toBe(201);
    testBooking = createRes.body;
  });

  it('accepts valid Yoco webhook with correct HMAC signature', async () => {
    // Arrange: Create webhook payload
    const webhookPayload = {
      type: 'checkout.paid',
      data: {
        id: 'ch_test_' + Date.now(),
        amount: Math.round(testBooking.pricing.total * 100), // Yoco uses cents
        metadata: {
          bookingId: testBooking.id
        },
        reference: testBooking.id,
        chargeId: 'charge_test_' + Date.now()
      }
    };

    const payloadString = JSON.stringify(webhookPayload);
    
    // Generate valid HMAC signature
    const signature = crypto
      .createHmac('sha256', testWebhookSecret)
      .update(payloadString)
      .digest('hex');

    // Act: Send webhook with valid signature
    const res = await request(app)
      .post('/api/webhooks/yoco')
      .set('X-Yoco-Signature', signature)
      .send(webhookPayload);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok');
    
    // Verify booking was updated
    const bookingCheck = await request(app)
      .get(`/api/bookings/${testBooking.id}`);
    
    expect(bookingCheck.status).toBe(200);
    expect(bookingCheck.body.paymentStatus).toBe('paid');
    expect(bookingCheck.body.paidAt).toBeDefined();
  });

  it('rejects webhook with invalid HMAC signature', async () => {
    // Arrange: Create webhook payload
    const webhookPayload = {
      type: 'checkout.paid',
      data: {
        id: 'ch_test_invalid_' + Date.now(),
        amount: Math.round(testBooking.pricing.total * 100),
        metadata: {
          bookingId: testBooking.id
        }
      }
    };

    // Use wrong signature
    const invalidSignature = 'invalid_signature_12345';

    // Act: Send webhook with invalid signature
    const res = await request(app)
      .post('/api/webhooks/yoco')
      .set('X-Yoco-Signature', invalidSignature)
      .send(webhookPayload);

    // Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'signature_mismatch');
  });

  it('rejects webhook with tampered payload', async () => {
    // Arrange: Create original payload and sign it
    const originalPayload = {
      type: 'checkout.paid',
      data: {
        amount: Math.round(testBooking.pricing.total * 100),
        metadata: { bookingId: testBooking.id }
      }
    };

    const signature = crypto
      .createHmac('sha256', testWebhookSecret)
      .update(JSON.stringify(originalPayload))
      .digest('hex');

    // Tamper with payload (change amount)
    const tamperedPayload = {
      ...originalPayload,
      data: {
        ...originalPayload.data,
        amount: 100 // Changed amount
      }
    };

    // Act: Send tampered payload with original signature
    const res = await request(app)
      .post('/api/webhooks/yoco')
      .set('X-Yoco-Signature', signature)
      .send(tamperedPayload);

    // Assert: Should fail signature verification
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('signature_mismatch');
  });

  it('handles checkout.failed event correctly', async () => {
    // Arrange
    const webhookPayload = {
      type: 'charge.failed',
      data: {
        id: 'ch_test_failed_' + Date.now(),
        amount: Math.round(testBooking.pricing.total * 100),
        metadata: {
          bookingId: testBooking.id
        },
        reference: testBooking.id
      }
    };

    const payloadString = JSON.stringify(webhookPayload);
    const signature = crypto
      .createHmac('sha256', testWebhookSecret)
      .update(payloadString)
      .digest('hex');

    // Act
    const res = await request(app)
      .post('/api/webhooks/yoco')
      .set('X-Yoco-Signature', signature)
      .send(webhookPayload);

    // Assert
    expect(res.status).toBe(200);
    
    // Verify booking marked as failed
    const bookingCheck = await request(app)
      .get(`/api/bookings/${testBooking.id}`);
    
    expect(bookingCheck.status).toBe(200);
    expect(bookingCheck.body.paymentStatus).toBe('failed');
  });

  it('rejects webhook without signature header', async () => {
    // Arrange
    const webhookPayload = {
      type: 'checkout.paid',
      data: {
        amount: 1000,
        metadata: { bookingId: testBooking.id }
      }
    };

    // Act: Send without X-Yoco-Signature header
    const res = await request(app)
      .post('/api/webhooks/yoco')
      .send(webhookPayload);

    // Assert
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('signature_mismatch');
  });

  it('handles amount mismatch gracefully', async () => {
    // Arrange: Get actual booking total first
    const bookingTotal = testBooking.pricing.total;
    
    // Webhook with significantly different amount than booking total
    const webhookPayload = {
      type: 'checkout.paid',
      data: {
        id: 'ch_test_amount_mismatch_' + Date.now(),
        amount: Math.round(bookingTotal * 100) + 10000, // Add 100 ZAR difference in cents
        metadata: {
          bookingId: testBooking.id
        },
        reference: testBooking.id
      }
    };

    const payloadString = JSON.stringify(webhookPayload);
    const signature = crypto
      .createHmac('sha256', testWebhookSecret)
      .update(payloadString)
      .digest('hex');

    // Act
    const res = await request(app)
      .post('/api/webhooks/yoco')
      .set('X-Yoco-Signature', signature)
      .send(webhookPayload);

    // Assert: Should accept webhook but not update booking
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    
    // Booking should NOT be marked as paid due to amount mismatch
    const bookingCheck = await request(app)
      .get(`/api/bookings/${testBooking.id}`);
    
    expect(bookingCheck.status).toBe(200);
    // Payment status should remain pending due to amount validation failure
    expect(bookingCheck.body.paymentStatus).not.toBe('paid');
    // paidAt should be falsy (null or undefined)
    expect(bookingCheck.body.paidAt).toBeFalsy();
  });
});
