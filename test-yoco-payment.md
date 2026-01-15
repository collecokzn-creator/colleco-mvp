# Yoco Payment Test - Ready to Go! 🚀

## ✅ Servers Running
- **Frontend**: http://localhost:5180/
- **Backend**: http://localhost:4000/
- **Yoco Test Mode**: ENABLED

## 🧪 Test Steps

### Option 1: Transfer Payment Test (Recommended)

1. **Open Transfers**: http://localhost:5180/#/transfers

2. **Fill the form**:
   - Pickup: `Sandton City`
   - Dropoff: `OR Tambo Airport`
   - Date: Tomorrow's date
   - Time: `10:00`
   - Passengers: `2`
   - Click "Pick My Ride"

3. **Select a ride** and note the price shown

4. **On checkout page**:
   - Verify total matches selected ride price
   - Enter email: `test@example.com`
   - Select **Yoco** as payment processor
   - Click "Proceed to Payment"

5. **Yoco Test Checkout** (opens in new tab):
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/28`)
   - CVV: Any 3 digits (e.g., `123`)
   - Click "Pay"

6. **Verify Success**:
   - Should redirect to success page
   - Check booking confirmation displays
   - Verify no errors in console

### Option 2: Direct Checkout Test (Quick)

1. **Open checkout with test booking**:
   ```
   http://localhost:5180/#/checkout?bookingId=TEST-YOCO-001&service=transfer&amount=450
   ```

2. **On checkout page**:
   - Enter email: `test@example.com`
   - Select **Yoco**
   - Click "Proceed to Payment"

3. **Complete payment** with test card (see above)

4. **Verify success page** shows booking details

### Option 3: Quick API Test

Open PowerShell and run:

```powershell
# Test payment URL generation
$body = @{
    bookingId = "TEST-YOCO-$(Get-Date -Format 'yyyyMMddHHmmss')"
    processor = "yoco"
    amount = 350.00
    returnUrl = "http://localhost:5180/#/pay/success"
    cancelUrl = "http://localhost:5180/#/pay/cancel"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:4000/api/payments/generate-url" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

Write-Host "Payment URL generated:" -ForegroundColor Green
Write-Host $response.paymentUrl
Start-Process $response.paymentUrl
```

This will open Yoco checkout directly in your browser.

## 🧾 Yoco Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |

**All test cards**:
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

## 🔍 Verification Points

After payment:
- ✅ Booking status changes to "paid" in backend
- ✅ Payment logged in `server/data/payment_notifications.jsonl`
- ✅ Success page shows booking details
- ✅ Backend console shows webhook event (if testing webhooks)

## 📊 Monitor Logs

**Backend terminal** will show:
```
[payments] Generated checkout URL for booking-xxx
[webhook] Yoco event received: checkout.paid
[payments] Payment successful for booking-xxx
```

**Frontend console** (F12) should show:
```
Payment URL: https://checkout.yoco.com/...
Redirecting to Yoco...
```

## 🔧 Troubleshooting

### Payment URL not generated
- Check backend terminal for errors
- Verify YOCO_SECRET_KEY in .env.local
- Restart backend server

### Checkout page shows "couldn't find booking"
- Use direct checkout test with mock booking ID
- Check VITE_API_BASE=http://localhost:4000 in .env.local

### Success page has errors
- Check booking ID in URL
- Verify backend is running on port 4000
- Check browser console for API errors

## 🎯 Next Steps After Successful Test

1. **Configure webhooks** (for production):
   - Go to: https://portal.yoco.com/online/settings/webhooks
   - Add webhook URL: `https://your-domain.com/api/webhooks/yoco`
   - Copy webhook secret to .env.local

2. **Get live keys** (when ready):
   - https://portal.yoco.com/online/settings/api-keys
   - Replace sk_test_* with sk_live_* in production .env

3. **Test email notifications**:
   - Configure SMTP in server/.env.local
   - Complete payment to trigger confirmation email

---

**Current Configuration**:
- ✅ Test mode enabled
- ✅ Test keys loaded
- ✅ Webhook handler ready
- ✅ All payment pages configured

Ready to test! Start with Option 1 or 2 above. 🚀
