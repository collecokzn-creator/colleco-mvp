# Priority 1: Payment Webhooks & Success/Failure Pages — COMPLETE ✅

## What Was Built (Dec 9, 2025)

### Backend Payment Webhooks
Created `server/routes/webhooks.js` with two endpoints:

**POST /api/webhooks/payfast** (ITN — Instant Transaction Notification)
- Verifies PayFast signature (MD5 with passphrase)
- Validates amount against booking
- Updates booking payment status (pending/paid/failed)
- Logs all events to `server/data/payment_notifications.jsonl`
- Handles idempotency (safe to receive duplicate notifications)
- Supports: Successful payments, pending, failed, cancelled states

**POST /api/webhooks/yoco** 
- Verifies Yoco signature (HMAC-SHA256)
- Extracts booking ID from metadata or reference
- Validates amount (Yoco sends in cents, we convert to ZAR)
- Updates booking payment status
- Handles multiple event types: checkout.completed, checkout.paid, charge.succeeded, charge.failed
- Logs all events for audit trail

**Key Features:**
- Signature verification prevents fraudulent webhooks
- Amount validation detects payment mismatches
- Immutable payment event logs (JSONL) for compliance
- Safe 200 responses even if booking not found (prevents retry loops)
- Per-booking payment history tracking

### Frontend Payment Pages
Created three public pages (no auth required):

1. **PaymentSuccess** (`src/pages/PaymentSuccess.jsx`)
   - Shows after successful payment (PayFast/Yoco redirect)
   - Displays booking confirmation
   - Next steps: email, supplier notification, track booking
   - Links to "My Bookings" and home

2. **PaymentFailure** (`src/pages/PaymentFailure.jsx`)
   - Shows when payment fails or is declined
   - Explains common failure reasons (incorrect card, insufficient funds, etc.)
   - Retry button to return to checkout
   - Support contact link

3. **PaymentCancel** (`src/pages/PaymentCancel.jsx`)
   - Shows when customer explicitly cancels payment
   - Reassures no charge was taken
   - Return to checkout button
   - Support contact link

### Configuration & Integration
- Added webhook endpoints registration in `server/server.js`
- Payment routes: `/api/webhooks/payfast`, `/api/webhooks/yoco`
- Added payment pages to `src/config/pages.json` routes:
  - `/pay/success`
  - `/pay/cancel`
  - `/pay/fail`
- Payment callback URLs configured in `server/config/payments.js`
- Build successful ✅ (zero errors)

### Data Storage
- Bookings stored in `server/data/bookings.json` (created on first webhook)
- Payment events logged to `server/data/payment_notifications.jsonl` (immutable audit trail)

## What's Ready To Do Next

### When Yoco credentials arrive (bank verification complete):
1. Fill `YOCO_SECRET_KEY`, `YOCO_PUBLIC_KEY` in `.env`
2. Optionally set `YOCO_WEBHOOK_SECRET` for webhook verification
3. Set `YOCO_TEST_MODE=0` when going live
4. Yoco will automatically send webhooks to `https://<your-domain>/api/webhooks/yoco`
5. PayFast will send to `https://<your-domain>/api/webhooks/payfast`

### Next phases (ready to build):
- **Phase 2**: Checkout UI with PayFast/Yoco processor selector
- **Phase 3**: Booking storage + STO payment terms (FIT/Group deposit rules)
- **Phase 4**: Email confirmations on payment success/fail
- **Phase 5**: Payment refund flow (cancellation handling)

## Testing Checklist (for when credentials arrive)

```bash
# Test PayFast sandbox checkout:
POST /api/webhooks/payfast
Content-Type: application/x-www-form-urlencoded

m_payment_id=booking-123&amount_gross=500.00&payment_status=COMPLETE&pf_payment_id=test-123&signature=<calculated>

# Test Yoco webhook:
POST /api/webhooks/yoco
Content-Type: application/json
X-Yoco-Signature: <calculated>

{
  "type": "charge.succeeded",
  "data": {
    "id": "checkout-123",
    "chargeId": "charge-456",
    "amount": 50000,
    "metadata": { "bookingId": "booking-123" }
  }
}
```

## Files Created/Modified

| File | Purpose | Status |
|------|---------|--------|
| `server/routes/webhooks.js` | PayFast + Yoco webhook handlers | ✅ Created |
| `server/server.js` | Register webhook routes | ✅ Updated |
| `src/pages/PaymentSuccess.jsx` | Success page (updated existing) | ✅ Ready |
| `src/pages/PaymentFailure.jsx` | Failure page | ✅ Created |
| `src/pages/PaymentCancel.jsx` | Cancellation page | ✅ Created |
| `src/config/pages.json` | Add payment routes | ✅ Updated |
| `server/config/payments.js` | Payment config loader | ✅ Created |
| `server/config/payments.example.json` | Payment config template | ✅ Created |
| `server/utils/payments.js` | Payment utilities (signature verification) | ✅ Created |
| `server/.env.example` | Payment env vars | ✅ Updated |

## Environment Variables (when credentials arrive)

```env
# Yoco
YOCO_SECRET_KEY=<from-yoco-dashboard>
YOCO_PUBLIC_KEY=<from-yoco-dashboard>
YOCO_WEBHOOK_SECRET=<optional-from-yoco>
YOCO_TEST_MODE=0  # change to 0 for live

# PayFast (if using alongside)
PAYFAST_MERCHANT_ID=<from-payfast>
PAYFAST_MERCHANT_KEY=<from-payfast>
PAYFAST_PASSPHRASE=<from-payfast>
PAYFAST_SANDBOX=0  # change to 0 for live
```

---

**Next: Ready to move to Priority 2 (Checkout UI) or tackle existing app issues (Phase 6)?**
