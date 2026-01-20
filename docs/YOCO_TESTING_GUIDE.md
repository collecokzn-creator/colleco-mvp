# Yoco Payment Integration Testing Guide

## Overview

The Yoco payment integration is **fully functional and ready for testing**. This guide covers test setup, test card numbers, webhook simulation, and end-to-end payment flow verification.

---

## ✅ Implementation Status

### Backend (Complete)
- ✅ Payment URL generation endpoint: `POST /api/payments/generate-url`
- ✅ Yoco checkout API integration: `server/utils/payments.js`
- ✅ Webhook handler: `POST /api/webhooks/yoco`
- ✅ HMAC-SHA256 signature verification: `verifyYocoSignature()`
- ✅ Amount validation (cents → ZAR conversion)
- ✅ Booking status updates (pending → paid → failed)
- ✅ Payment event logging: `server/data/payment_notifications.jsonl`
- ✅ Email confirmations (booking + receipt)

### Frontend (Complete)
- ✅ Checkout page with processor selection: [Checkout.jsx](../src/pages/Checkout.jsx)
- ✅ Payment success page: [PaymentSuccess.jsx](../src/pages/PaymentSuccess.jsx)
- ✅ Payment failure page: [PaymentFailure.jsx](../src/pages/PaymentFailure.jsx)
- ✅ Payment cancel page: [PaymentCancel.jsx](../src/pages/PaymentCancel.jsx)
- ✅ Payment button component: [PaymentButton.jsx](../src/components/payments/PaymentButton.jsx)

### Tests (Complete)
- ✅ Webhook integration tests: `tests/yoco.webhook.test.js`
- ✅ Signature verification tests
- ✅ Amount mismatch tests
- ✅ Invalid booking ID tests
- ✅ Webhook retry simulation tests

---

## Test Environment Setup

### 1. Configure Environment Variables

Create `server/.env` file with Yoco credentials (use placeholders or set env vars):

```env
# Yoco Test/Live Configuration
# YOCO_SECRET_KEY=REPLACE_WITH_YOCO_SECRET_KEY
# YOCO_PUBLIC_KEY=REPLACE_WITH_YOCO_PUBLIC_KEY
# YOCO_TEST_MODE=1
# YOCO_WEBHOOK_SECRET=REPLACE_WITH_YOCO_WEBHOOK_SECRET

# Optional: Override API URL (defaults to production URL)
# YOCO_API_URL=https://online.yoco.com/api/v1

# Success/Cancel URLs (local development)
# YOCO_SUCCESS_URL=http://localhost:5173/pay/success
# YOCO_CANCEL_URL=http://localhost:5173/pay/cancel
```

**Important:** These are **test credentials**. Replace with your actual Yoco credentials from https://developer.yoco.com/

### 2. Start Development Servers

```powershell
# Terminal 1: Backend API server
cd server
npm run server
# Expected output: Server running on http://localhost:4000

# Terminal 2: Frontend dev server
npm run dev
# Expected output: Local: http://localhost:5173
```

### 3. Verify Health Check

```powershell
# Check backend is running
Invoke-RestMethod -Uri "http://localhost:4000/health"
# Expected: { "status": "ok", "timestamp": "..." }

# Check webhook endpoint is registered
curl http://localhost:4000/api/webhooks/yoco -X POST
# Expected: 400 (signature verification fails without valid payload)
```

---

## Test Card Numbers

Yoco provides test card numbers for different scenarios:

### Successful Payment
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

### Declined Payment
```
Card Number: 4000 0000 0000 0002
CVV: 123
Expiry: Any future date
```

### Insufficient Funds
```
Card Number: 4000 0000 0000 9995
CVV: 123
Expiry: Any future date
```

### Card Expired
```
Card Number: 4000 0000 0000 0069
CVV: 123
Expiry: Any PAST date (e.g., 01/20)
```

**Full list:** https://developer.yoco.com/online/resources/test-cards

---

## End-to-End Payment Flow Testing

### Step 1: Create a Test Booking

```powershell
# Create a booking via API
$booking = Invoke-RestMethod -Uri "http://localhost:4000/api/bookings" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{
    supplierId = "beekman"
    userId = "test_user_001"
    bookingType = "FIT"
    checkInDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    checkOutDate = (Get-Date).AddDays(9).ToString("yyyy-MM-dd")
    lineItems = @(
      @{
        serviceType = "accommodation"
        description = "Test Hotel - Deluxe Room"
        basePrice = 500
        retailPrice = 500
        quantity = 1
        nights = 2
      }
    )
    metadata = @{
      propertyName = "Test Hotel"
      location = "Cape Town"
      customerEmail = "test@example.com"
    }
  } | ConvertTo-Json -Depth 10)

# Save booking ID for next steps
$bookingId = $booking.id
Write-Host "Booking created: $bookingId"
```

### Step 2: Navigate to Checkout

```
http://localhost:5173/checkout?bookingId=<bookingId>
```

1. Verify booking details are displayed correctly
2. Enter customer email: `test@example.com`
3. Select **Yoco** as payment processor
4. Click **Pay Now** button

### Step 3: Complete Yoco Checkout

1. **Redirect to Yoco hosted checkout** → Opens in new tab/window
2. **Enter test card details:**
   - Card: `4242 4242 4242 4242`
   - CVV: `123`
   - Expiry: `12/25`
3. **Click "Pay ZAR X.XX"** button
4. **Wait for webhook** (automatic in production, manual simulation in local dev)
5. **Redirect back to success page** → `http://localhost:5173/pay/success?bookingId=<id>`

### Step 4: Verify Success Page

Expected elements:
- ✅ Green checkmark icon
- ✅ "Payment Successful" heading
- ✅ Booking reference number
- ✅ Confirmation email notice
- ✅ "View Booking" button → `/bookings/<id>`
- ✅ "Return Home" button → `/`

### Step 5: Verify Booking Status Updated

```powershell
# Check booking status via API
$updatedBooking = Invoke-RestMethod -Uri "http://localhost:4000/api/bookings/$bookingId"

# Verify payment fields
$updatedBooking.paymentStatus    # Should be: "paid"
$updatedBooking.paymentProcessor # Should be: "yoco"
$updatedBooking.paidAt           # Should be: ISO timestamp
$updatedBooking.paymentId        # Should be: Yoco charge ID
```

### Step 6: Check Payment Event Logs

```powershell
# View payment event log
Get-Content "server/data/payment_notifications.jsonl" -Tail 10

# Expected entry:
# {"ts":1702123456789,"processor":"yoco","type":"notification_received","bookingId":"abc123","eventType":"checkout.paid","status":"paid","checkoutId":"ch_xxx","chargeId":"charge_yyy","ip":"::1"}
```

---

## Local Webhook Simulation

Since Yoco webhooks require a public HTTPS URL, use **manual simulation** for local testing:

### Method 1: cURL Command (PowerShell)

```powershell
# 1. Calculate HMAC signature
$webhookSecret = "whsec_test_7f5e8d9a2b3c4e5f6a7b8c9d0e1f2a3b"
$payload = @{
  type = "checkout.paid"
  data = @{
    id = "ch_test_12345"
    amount = 100000  # R1000.00 in cents
    chargeId = "charge_test_67890"
    metadata = @{
      bookingId = "your-booking-id-here"
    }
    reference = "your-booking-id-here"
  }
} | ConvertTo-Json -Depth 10 -Compress

$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($webhookSecret)
$signature = [System.BitConverter]::ToString($hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($payload))).Replace("-","").ToLower()

# 2. Send webhook to local server
Invoke-RestMethod -Uri "http://localhost:4000/api/webhooks/yoco" `
  -Method POST `
  -Headers @{
    "Content-Type" = "application/json"
    "X-Yoco-Signature" = $signature
  } `
  -Body $payload

# Expected response: { "ok": true }
```

### Method 2: Postman Collection

Import [yoco-webhook-postman-collection.json](../tests/postman/yoco-webhook.json) (if available) or create manually:

**Request:**
```
POST http://localhost:4000/api/webhooks/yoco
Headers:
  Content-Type: application/json
  X-Yoco-Signature: <calculated-hmac-sha256>
  
Body:
{
  "type": "checkout.paid",
  "data": {
    "id": "ch_test_12345",
    "amount": 100000,
    "chargeId": "charge_test_67890",
    "metadata": {
      "bookingId": "booking-abc123"
    },
    "reference": "booking-abc123"
  }
}
```

### Method 3: Ngrok Tunnel (for real Yoco webhooks)

```powershell
# Install ngrok (if not installed)
# Download from: https://ngrok.com/download

# Start ngrok tunnel to local server
ngrok http 4000
# Output: Forwarding https://abc123.ngrok.io -> http://localhost:4000

# Configure webhook URL in Yoco Dashboard:
# https://abc123.ngrok.io/api/webhooks/yoco
```

**Note:** Ngrok free tier provides temporary URLs. For permanent testing, use a service like Serveo or deploy to a staging server.

---

## Automated Test Suite

Run the complete Yoco integration test suite:

```powershell
# Run all Yoco webhook tests
npm run test -- tests/yoco.webhook.test.js

# Expected output:
# ✓ accepts valid Yoco webhook with correct HMAC signature
# ✓ rejects webhook with invalid HMAC signature
# ✓ handles amount mismatch validation
# ✓ ignores unknown event types
# ✓ handles missing booking ID gracefully
# ✓ updates booking status correctly for paid events
# ✓ updates booking status correctly for failed events
# ✓ sends confirmation emails on successful payment
# ✓ logs all payment events to JSONL file
# ✓ handles webhook retry idempotency
#
# Test Files: 1 passed (1)
# Tests: 10 passed (10)
```

### Test Coverage

The test suite covers:
- ✅ Valid webhook signature verification
- ✅ Invalid signature rejection
- ✅ Amount validation (cents conversion)
- ✅ Booking status transitions (pending → paid → failed)
- ✅ Event type handling (checkout.paid, charge.succeeded, charge.failed)
- ✅ Missing booking ID scenarios
- ✅ Email sending on successful payment
- ✅ Payment event logging
- ✅ Idempotent webhook handling (safe retries)

---

## Common Testing Scenarios

### Scenario 1: Successful Payment Flow

1. Create booking → Status: `pending`
2. Generate Yoco checkout URL → Redirect to Yoco
3. Complete payment with `4242 4242 4242 4242`
4. Yoco sends webhook → Status: `paid`
5. Customer redirected to `/pay/success`
6. Confirmation email sent to customer

**Expected Result:** ✅ Booking marked as paid, email received, payment logged

### Scenario 2: Declined Card

1. Create booking → Status: `pending`
2. Generate Yoco checkout URL
3. Enter card: `4000 0000 0000 0002` (Declined)
4. Yoco sends `charge.failed` webhook → Status: `failed`
5. Customer redirected to `/pay/fail`

**Expected Result:** ✅ Booking marked as failed, failure page shown

### Scenario 3: Customer Cancels Payment

1. Create booking → Status: `pending`
2. Generate Yoco checkout URL
3. Customer clicks "Cancel" on Yoco checkout page
4. Customer redirected to `/pay/cancel`
5. No webhook sent (no charge attempted)

**Expected Result:** ✅ Booking remains `pending`, cancel page shown

### Scenario 4: Amount Mismatch (Security Test)

1. Create booking with total: R1000.00
2. Simulate webhook with amount: R500.00 (50000 cents)
3. Webhook handler validates amount
4. **Rejects webhook** due to mismatch

**Expected Result:** ✅ Payment rejected, logged as `amount_mismatch`, booking remains `pending`

### Scenario 5: Invalid Signature (Security Test)

1. Send webhook with modified payload
2. Send webhook with incorrect signature
3. Webhook handler verifies signature
4. **Rejects webhook** due to signature mismatch

**Expected Result:** ✅ Returns 400, logged as `signature_failed`, booking unchanged

---

## Troubleshooting

### Issue 1: "Signature verification failed"

**Cause:** Webhook secret mismatch or incorrect payload formatting

**Solution:**
1. Verify `YOCO_WEBHOOK_SECRET` matches Yoco Dashboard setting
2. Ensure payload is **stringified before hashing** (no extra whitespace)
3. Check signature is **lowercase hex string**

```javascript
// Correct signature generation:
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))  // Must stringify first
  .digest('hex');                    // Lowercase hex
```

### Issue 2: "Amount mismatch"

**Cause:** Yoco sends amounts in cents, booking stored in ZAR

**Solution:**
1. Always convert Yoco amount: `paidAmount = checkoutData.amount / 100`
2. Use floating-point tolerance: `Math.abs(paidAmount - expectedAmount) > 0.01`

### Issue 3: "No booking ID in metadata"

**Cause:** Booking ID not passed to Yoco checkout creation

**Solution:**
1. Ensure `metadata: { bookingId: booking.id }` in checkout payload
2. Also set `reference: booking.id` as fallback

```javascript
// Correct checkout creation:
const payload = {
  amountInCents: Math.round(amount * 100),
  reference: bookingId,           // Primary identifier
  metadata: { bookingId },         // Backup identifier
  success_url: returnUrl,
  cancel_url: cancelUrl,
  name: 'Booking Payment'
};
```

### Issue 4: "Booking not found"

**Cause:** Booking ID from webhook doesn't match any booking

**Solution:**
1. Check `server/data/bookings.json` exists and contains booking
2. Verify webhook payload `reference` or `metadata.bookingId` matches
3. Create booking **before** generating payment URL

### Issue 5: "Email not sent"

**Cause:** Email service configuration missing or email address invalid

**Solution:**
1. Check `server/utils/emailService.js` is configured
2. Verify `customerEmail` in booking metadata
3. Check email service logs for errors (non-blocking, webhook still succeeds)

---

## Production Deployment Checklist

Before going live with Yoco payments:

### Environment Variables
- [ ] Set `YOCO_SECRET_KEY` to production secret key (from Yoco Dashboard)
- [ ] Set `YOCO_PUBLIC_KEY` to production public key
- [ ] Set `YOCO_TEST_MODE=0` (disable test mode)
- [ ] Set `YOCO_WEBHOOK_SECRET` to production webhook secret
- [ ] Configure `YOCO_SUCCESS_URL` to production domain
- [ ] Configure `YOCO_CANCEL_URL` to production domain

### Yoco Dashboard Configuration
- [ ] Add webhook URL: `https://yourdomain.com/api/webhooks/yoco`
- [ ] Enable webhook events: `checkout.paid`, `checkout.completed`, `charge.succeeded`, `charge.failed`
- [ ] Generate and save webhook secret
- [ ] Test webhook delivery in Yoco Dashboard
- [ ] Verify merchant account is activated (not in test mode)

### Security
- [ ] Ensure HTTPS is enabled (required by Yoco)
- [ ] Verify webhook signature validation is active
- [ ] Enable rate limiting on webhook endpoint (prevent DOS)
- [ ] Implement IP whitelisting (optional, Yoco webhook IPs)
- [ ] Review payment event logs regularly for anomalies

### Monitoring
- [ ] Set up alerts for webhook failures
- [ ] Monitor `server/data/payment_notifications.jsonl` file size
- [ ] Track payment success/failure rates
- [ ] Enable error logging for payment processing
- [ ] Configure email confirmations are being sent

### Testing in Production (Soft Launch)
- [ ] Create test booking with small amount (R10.00)
- [ ] Complete payment with real card
- [ ] Verify webhook received and processed
- [ ] Confirm booking status updated to `paid`
- [ ] Check customer receives confirmation email
- [ ] Verify payment appears in Yoco Dashboard
- [ ] Test refund process (if implemented)

---

## API Reference

### Generate Payment URL

**Endpoint:** `POST /api/payments/generate-url`

**Request:**
```json
{
  "bookingId": "booking-abc123",
  "processor": "yoco",
  "amount": 1000.00,
  "returnUrl": "https://yourdomain.com/pay/success",
  "cancelUrl": "https://yourdomain.com/pay/cancel",
  "notifyUrl": "https://yourdomain.com/api/webhooks/yoco"
}
```

**Response:**
```json
{
  "paymentUrl": "https://checkout.yoco.com/abc123def456"
}
```

### Webhook Endpoint

**Endpoint:** `POST /api/webhooks/yoco`

**Headers:**
```
Content-Type: application/json
X-Yoco-Signature: <hmac-sha256-hex-signature>
```

**Payload (checkout.paid event):**
```json
{
  "type": "checkout.paid",
  "data": {
    "id": "ch_abc123",
    "amount": 100000,
    "chargeId": "charge_def456",
    "metadata": {
      "bookingId": "booking-abc123"
    },
    "reference": "booking-abc123"
  }
}
```

**Response:**
```json
{
  "ok": true
}
```

---

## Support Resources

- **Yoco Developer Docs:** https://developer.yoco.com/online/
- **Test Cards:** https://developer.yoco.com/online/resources/test-cards
- **Webhook Guide:** https://developer.yoco.com/online/guides/webhooks
- **Dashboard:** https://portal.yoco.com/
- **Support:** support@yoco.com

---

## Quick Test Commands

```powershell
# 1. Create test booking
$booking = Invoke-RestMethod -Uri "http://localhost:4000/api/bookings" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"supplierId":"beekman","userId":"test001","bookingType":"FIT","checkInDate":"2025-12-20","checkOutDate":"2025-12-22","lineItems":[{"serviceType":"accommodation","description":"Test Room","basePrice":500,"retailPrice":500,"quantity":1,"nights":2}],"metadata":{"customerEmail":"test@example.com"}}'

# 2. Generate payment URL
$payment = Invoke-RestMethod -Uri "http://localhost:4000/api/payments/generate-url" -Method POST -Headers @{"Content-Type"="application/json"} -Body (@{bookingId=$booking.id;processor="yoco";amount=$booking.pricing.total;returnUrl="http://localhost:5173/pay/success";cancelUrl="http://localhost:5173/pay/cancel"} | ConvertTo-Json)

# 3. Open payment URL in browser
Start-Process $payment.paymentUrl

# 4. Check booking status
$updated = Invoke-RestMethod -Uri "http://localhost:4000/api/bookings/$($booking.id)"
Write-Host "Payment Status: $($updated.paymentStatus)"

# 5. View payment logs
Get-Content "server/data/payment_notifications.jsonl" -Tail 5
```

---

**Status:** ✅ **Fully Functional and Ready for Testing**

All Yoco payment components are implemented, tested, and production-ready. Follow this guide to test the complete payment flow from booking creation to webhook processing.

