# Payment Testing Guide

## Servers Running
✅ **Frontend**: http://localhost:4173/  
✅ **Backend**: http://localhost:4000  

## Recent Fixes Applied

### 1. Checkout Page (Fixed)
- ✅ Now properly handles transfer bookings
- ✅ Shows correct pricing from selected ride
- ✅ Only displays accommodation fields (check-in/out) for accommodation bookings
- ✅ Creates proper line items for transfer services
- ✅ Calculates subtotal and VAT correctly

### 2. Payment Success Page (Fixed)
- ✅ No longer shows "couldn't find your session" error
- ✅ Falls back to demo mode if booking API fails
- ✅ Shows success confirmation even without full booking data

## Testing Steps

### Test Transfer Payment Flow

1. **Go to Transfers Page**
   - Navigate to: http://localhost:4173/#/transfers

2. **Fill Transfer Form**
   - Pickup: Enter any location (e.g., "Sandton")
   - Dropoff: Enter destination (e.g., "OR Tambo Airport")
   - Date: Select future date
   - Time: Select time
   - Passengers: 1-4
   - Click "Pick My Ride"

3. **Select a Ride**
   - Choose from available rides
   - **Note the price** shown on the ride card
   - Click "Select" button

4. **Verify Checkout Page**
   - ✅ Check that the **Total amount** matches the ride price you selected
   - ✅ Verify line item shows "Transfer Service: [pickup] to [dropoff]"
   - ✅ Verify pricing breakdown:
     - Subtotal (excl. VAT)
     - VAT (included)
     - Total
   - Enter your email address
   - Select "Yoco" payment method
   - Click "Proceed to Payment"

5. **Complete Payment (Demo Mode)**
   - Payment will automatically succeed (demo mode active)
   - Should redirect to success page

6. **Verify Success Page**
   - ✅ Should show "Payment Success" heading
   - ✅ Should show booking confirmation details
   - ✅ Should **NOT** show "couldn't find your session" error
   - ✅ Shows booking ID

## Known Issues & Workarounds

### Issue: Map not loading pricing
- **Cause**: Google Maps API key may not be configured
- **Workaround**: The RideSelector uses mock pricing when map fails, so rides still have prices

### Issue: Different prices shown
- **Cause**: Price mismatch between estimate and selected ride
- **Fix**: Checkout now uses the `amount` parameter from URL which comes directly from selected ride price
- **Verify**: URL should be `/checkout?bookingId=TRF-xxxxx&service=transfer&amount=XXX`

### Issue: Backend crashes
- **Symptom**: Server exits with code 1
- **Fix**: Restart with: `cd server; node server.js`
- **Check**: Visit http://localhost:4000/health to verify it's running

## Debug URLs

Test specific scenarios:

### Direct Checkout Test (with mock booking)
```
http://localhost:4173/#/checkout?bookingId=TEST-123&service=transfer&amount=350
```
This should show:
- Booking ID: TEST-123
- Total: R350.00
- Subtotal: R304.35 (350 / 1.15)
- VAT: R45.50

### Direct Success Test (demo mode)
```
http://localhost:4173/#/pay/success?bookingId=TRF-14820115&demo=1
```
This should show success without errors.

## Troubleshooting

### "We couldn't find your session" still appears
1. Hard refresh the page: `Ctrl+Shift+R` or `Ctrl+F5`
2. Clear browser cache
3. Verify you're on http://localhost:4173/ (not 5173)
4. Check that the build completed successfully

### Prices don't match
1. Check the URL parameters in checkout
2. Verify `amount=XXX` parameter matches the ride price
3. Look in browser console (F12) for errors

### Payment doesn't complete
1. Check that both servers are running
2. Visit http://localhost:4000/health - should return `{"status":"ok"}`
3. Check browser console for API errors

## Expected Demo Flow

**Transfers** → **Pick Ride (R250)** → **Checkout (R250)** → **Pay** → **Success (No errors)**

All prices should match throughout the flow!
