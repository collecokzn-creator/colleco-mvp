# Yoco Payment Testing - Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. Set Up Environment
```powershell
# Create server/.env file
cd server
Copy-Item .env.example .env

# Add these test credentials to .env:
YOCO_SECRET_KEY=sk_test_a0cd6efbOgaAN69e54148299e760
YOCO_PUBLIC_KEY=pk_test_2dc62e2c0qvDRbz83e94
YOCO_TEST_MODE=1
YOCO_WEBHOOK_SECRET=whsec_test_7f5e8d9a2b3c4e5f6a7b8c9d0e1f2a3b
```

### 2. Start Servers
```powershell
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev
```

### 3. Run Automated Test
```powershell
# Full test (creates booking, generates URL, simulates webhook)
.\scripts\test-yoco-payment.ps1

# Expected output:
# ✅ API Health Check
# ✅ Booking Creation
# ✅ Payment URL Generation
# ✅ Webhook Simulation
# ✅ Status Update Verification
```

---

## 💳 Test Card Numbers

| Scenario | Card Number | CVV | Expiry | Result |
|----------|-------------|-----|--------|--------|
| **Success** | `4111 1111 1111 1111` | `123` | `12/25` | Payment succeeds |
| **Declined** | `4000 0000 0000 0002` | `123` | `12/25` | Card declined |
| **Insufficient Funds** | `4000 0000 0000 9995` | `123` | `12/25` | Insufficient funds |
| **Expired Card** | `4000 0000 0000 0069` | `123` | `01/20` | Card expired |

**Full list:** https://developer.yoco.com/online/resources/test-cards

---

## 🔗 Test URLs (Local Development)

| Page | URL | Purpose |
|------|-----|---------|
| **Checkout** | `http://localhost:5173/checkout?bookingId=<id>` | Select payment processor |
| **Success** | `http://localhost:5173/pay/success?bookingId=<id>` | After successful payment |
| **Failure** | `http://localhost:5173/pay/fail?bookingId=<id>` | After payment failure |
| **Cancel** | `http://localhost:5173/pay/cancel?bookingId=<id>` | Customer cancelled |
| **Bookings** | `http://localhost:5173/bookings` | View all bookings |

---

## 🧪 Manual Test Flow

### Create Test Booking
```powershell
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
        description = "Test Hotel - Standard Room"
        basePrice = 500
        retailPrice = 500
        quantity = 1
        nights = 2
      }
    )
    metadata = @{
      customerEmail = "test@example.com"
    }
  } | ConvertTo-Json -Depth 10)

Write-Host "Booking ID: $($booking.id)"
Write-Host "Total: R$($booking.pricing.total)"
```

### Navigate to Checkout
```powershell
Start-Process "http://localhost:5173/checkout?bookingId=$($booking.id)"
```

### Check Payment Status
```powershell
$status = Invoke-RestMethod -Uri "http://localhost:4000/api/bookings/$($booking.id)"
Write-Host "Payment Status: $($status.paymentStatus)"
Write-Host "Paid At: $($status.paidAt)"
```

---

## 🔍 Verify Integration Components

### Backend Routes
```powershell
# Health check
Invoke-RestMethod "http://localhost:4000/health"

# Payment URL generation endpoint
curl http://localhost:4000/api/payments/generate-url -X POST

# Webhook endpoint (returns 400 without signature)
curl http://localhost:4000/api/webhooks/yoco -X POST
```

### Configuration Files
- ✅ `server/routes/payments.js` - Payment URL generation
- ✅ `server/routes/webhooks.js` - Webhook handler (line 186)
- ✅ `server/utils/payments.js` - Yoco API integration + signature verification
- ✅ `server/config/payments.js` - Configuration loader
- ✅ `src/pages/Checkout.jsx` - Frontend checkout page
- ✅ `src/components/payments/PaymentButton.jsx` - Payment button component

### Test Files
- ✅ `tests/yoco.webhook.test.js` - Webhook integration tests
- ✅ `scripts/test-yoco-payment.ps1` - Automated test script
- ✅ `docs/YOCO_TESTING_GUIDE.md` - Comprehensive testing guide

---

## 🐛 Troubleshooting

### Error: "Signature verification failed"
```powershell
# Verify webhook secret matches
$env:YOCO_WEBHOOK_SECRET
# Should be: whsec_test_7f5e8d9a2b3c4e5f6a7b8c9d0e1f2a3b (test)

# Check server logs for signature details
Get-Content server/logs/app.log -Tail 20
```

### Error: "No booking ID provided"
```powershell
# Ensure bookingId is passed in URL
http://localhost:5173/checkout?bookingId=<actual-booking-id>

# OR check booking exists
Invoke-RestMethod "http://localhost:4000/api/bookings/<bookingId>"
```

### Error: "Payment URL generation failed"
```powershell
# Verify Yoco credentials are set
cat server/.env | Select-String "YOCO"

# Should show:
# YOCO_SECRET_KEY=sk_test_...
# YOCO_PUBLIC_KEY=pk_test_...
# YOCO_TEST_MODE=1

# Check server is running
Invoke-RestMethod "http://localhost:4000/health"
```

### Webhook Not Received Locally
Use ngrok to expose local server:
```powershell
# Install ngrok: https://ngrok.com/download
ngrok http 4000

# Output: https://abc123.ngrok.io -> http://localhost:4000
# Configure Yoco webhook URL: https://abc123.ngrok.io/api/webhooks/yoco
```

---

## 📊 Test Suite

Run complete Yoco integration tests:
```powershell
# All webhook tests
npm run test -- tests/yoco.webhook.test.js

# Expected: 10 tests passed
# ✓ Valid signature verification
# ✓ Invalid signature rejection
# ✓ Amount validation
# ✓ Event type handling
# ✓ Booking status updates
# ✓ Email sending
# ✓ Payment logging
# ✓ Idempotent webhooks
```

---

## 📚 Documentation

- **Comprehensive Guide:** [docs/YOCO_TESTING_GUIDE.md](../docs/YOCO_TESTING_GUIDE.md)
- **Payment Webhooks:** [docs/PAYMENT_WEBHOOKS_COMPLETE.md](../docs/PAYMENT_WEBHOOKS_COMPLETE.md)
- **Yoco Developer Docs:** https://developer.yoco.com/online/
- **Test Cards:** https://developer.yoco.com/online/resources/test-cards

---

## ✅ Production Checklist

Before going live:

- [ ] Replace test credentials with production keys (from Yoco Dashboard)
- [ ] Set `YOCO_TEST_MODE=0`
- [ ] Configure production webhook URL in Yoco Dashboard
- [ ] Enable HTTPS (required by Yoco)
- [ ] Test with real card (small amount like R10.00)
- [ ] Verify emails are sent on successful payment
- [ ] Set up monitoring for webhook failures
- [ ] Review payment event logs regularly

---

**Status:** ✅ Fully Functional  
**Last Updated:** December 2024  
**Tested By:** Automated test suite + manual verification
