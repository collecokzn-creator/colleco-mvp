# Production Payment Setup Guide

## 🔒 Security First - CRITICAL RULES

**NEVER commit live API keys to Git!**

- ✅ Test keys in `.env.local` (gitignored) - SAFE
- ✅ Live keys in hosting platform environment variables - SAFE
- ❌ Live keys in any file committed to Git - DANGER!

---

## 📋 Pre-Deployment Checklist

### 1. Test Keys Setup (Development)

Your `.env.local` file is already created and gitignored. Update it with your Yoco test keys:

```bash
# Get from: https://portal.yoco.com/online/settings/api-keys
YOCO_SECRET_KEY=sk_test_xxxxxxxxxxxxx
YOCO_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
YOCO_WEBHOOK_SECRET=wh_secret_test_xxxxxxxxxxxxx
YOCO_TEST_MODE=1
```

### 2. Test Complete Booking Flow

Before going live, test thoroughly with test keys:

```powershell
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run dev

# Test checklist:
✅ Complete transfer booking with test card
✅ Payment success page displays correctly
✅ Booking confirmation shows all details
✅ PDF downloads correctly
✅ PDF shares on WhatsApp/email
✅ Invoice downloads correctly
```

**Yoco Test Cards:**
- Success: `4242 4242 4242 4242` (any future expiry, any CVV)
- Declined: `4000 0000 0000 0002`
- More: https://developer.yoco.com/online/resources/test-cards

### 3. Production Environment Variables

Set these in your hosting platform (Netlify/Vercel/etc.):

```bash
# ========================================
# YOCO LIVE KEYS - SET IN HOSTING PLATFORM ONLY
# ========================================
YOCO_SECRET_KEY=sk_live_xxxxxxxxxxxxx
YOCO_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
YOCO_WEBHOOK_SECRET=wh_secret_live_xxxxxxxxxxxxx
YOCO_TEST_MODE=0

# ========================================
# PRODUCTION URLS - UPDATE YOUR DOMAIN
# ========================================
YOCO_SUCCESS_URL=https://www.colleco.travel/pay/success
YOCO_CANCEL_URL=https://www.colleco.travel/pay/cancel

# ========================================
# FRONTEND BUILD VARIABLES
# ========================================
VITE_API_BASE=https://api.colleco.travel
VITE_PUBLIC_SITE_URL=https://www.colleco.travel
VITE_USE_HASH=1
VITE_BASE_PATH=/

# ========================================
# OPTIONAL SERVICES
# ========================================
VITE_GOOGLE_MAPS_API_KEY=your_production_google_maps_key
API_TOKEN=your_secure_api_token_for_backend
```

### 4. Yoco Webhook Configuration

After deploying to production:

1. **Go to Yoco Dashboard**: https://portal.yoco.com/online/settings/webhooks
2. **Add webhook URL**: `https://www.travelcolleco.com/api/webhooks/yoco`
3. **Copy webhook secret** and add to environment variables as `YOCO_WEBHOOK_SECRET`
4. **Test webhook** using Yoco's test webhook feature

### 5. Update Production URLs

The system currently defaults to staging URLs. Before going live, ensure your hosting platform environment variables override these:

```javascript
// Current defaults in server/config/payments.js (line 37-38):
successUrl: 'https://staging.colleco.travel/pay/success'  // ← Override with env var
cancelUrl: 'https://staging.colleco.travel/pay/cancel'    // ← Override with env var
```

**Environment variables override these defaults automatically!**

---

## 🚀 Deployment Steps

### Option A: Netlify

1. **Deploy your code** (without live keys)
2. **Go to Site Settings → Environment Variables**
3. **Add all production environment variables** from section 3 above
4. **Redeploy** to apply environment variables
5. **Test with small live transaction** (R10 or similar)

### Option B: Vercel

1. **Deploy your code** (without live keys)
2. **Go to Project Settings → Environment Variables**
3. **Add all production environment variables** for Production scope
4. **Redeploy** to apply changes
5. **Test with small live transaction**

### Option C: Custom VPS/Server

1. **Create production `.env` file** on server (not in Git!)
2. **Add all production environment variables**
3. **Restart services**: `pm2 restart all` or similar
4. **Verify health**: `curl https://www.travelcolleco.com/health`
5. **Test with small live transaction**

---

## 🧪 Pre-Launch Testing

### Development (Test Mode)
```powershell
# 1. Verify test mode in logs
npm run server
# Look for: "Payment Gateway: Yoco (TEST MODE)"

# 2. Complete test booking
npm run dev
# Use test card: 4242 4242 4242 4242

# 3. Verify all features work
```

### Production (Live Mode - Small Transaction)
```bash
# 1. Deploy to production with live keys
# 2. Check logs for: "Payment Gateway: Yoco (LIVE MODE)"
# 3. Make R10 test purchase with real card
# 4. Verify:
✅ Payment processes correctly
✅ Money appears in Yoco dashboard
✅ Booking confirmation generated
✅ PDF downloads/shares work
✅ Invoice generated correctly
```

---

## 🔍 Auto-Detection Feature

Your system automatically detects test vs live mode:

```javascript
// From server/utils/payments.js
const isTestMode = yoco.secretKey.startsWith('sk_test_') || yoco.testMode;
```

**This means:**
- `sk_test_*` keys → Always test mode (safe)
- `sk_live_*` keys → Live mode (real money!)
- `YOCO_TEST_MODE=1` → Force test mode even with live keys (for testing)

---

## 📊 Monitoring First Transactions

### After Going Live:

1. **Monitor Yoco Dashboard**: https://portal.yoco.com/
2. **Check server logs** for payment processing
3. **Verify webhooks** are being received
4. **Test refund process** with test transaction
5. **Have rollback plan ready**: Keep test mode variable accessible

### Common Issues & Solutions:

| Issue | Check | Solution |
|-------|-------|----------|
| Payments not processing | Environment variables | Verify keys are set correctly |
| Wrong mode (test/live) | Secret key prefix | Check `sk_test_` vs `sk_live_` |
| Webhook not received | Yoco dashboard | Verify webhook URL is correct |
| Success redirect fails | YOCO_SUCCESS_URL | Ensure URL matches deployed domain |

---

## 🛡️ Security Best Practices

1. **Never log secret keys** (already handled in code)
2. **Rotate keys regularly** (every 6-12 months)
3. **Use webhook secrets** to verify authenticity
4. **Monitor for suspicious activity**
5. **Keep test and live environments separate**

---

## 📝 Quick Commands Reference

```powershell
# Development (test keys)
npm run server                 # Start backend with test keys
npm run dev                    # Start frontend

# Build for production
npm run build                  # Creates dist/ folder

# Verify environment
node -e "console.log('Test mode:', process.env.YOCO_TEST_MODE)"

# Check current setup
cd server
node -e "const cfg = require('./config/payments').getPaymentConfig(); console.log('Yoco test mode:', cfg.yoco.testMode)"
```

---

## 🎯 Current Status

- ✅ Payment system code ready
- ✅ Environment variable configuration implemented
- ✅ Auto-detection of test/live mode working
- ✅ PDF generation and sharing working
- ✅ Webhook support implemented
- ✅ `.gitignore` protecting secrets
- ⚠️ Need to set live keys in production hosting platform
- ⚠️ Need to update URLs from staging to production domain
- ⚠️ Need to register production webhook with Yoco

---

## 📞 Support Resources

- **Yoco Developer Docs**: https://developer.yoco.com/
- **Yoco Support**: support@yoco.com
- **Test Cards**: https://developer.yoco.com/online/resources/test-cards
- **Webhook Testing**: https://portal.yoco.com/online/settings/webhooks

---

## ⚠️ FINAL REMINDER

**Before you commit and push:**

1. ✅ `.env.local` is in `.gitignore` (already done)
2. ✅ No live keys in any committed files (verify!)
3. ✅ Test keys only in local development
4. ✅ Live keys set in hosting platform environment variables

**Your code is ready. Just set environment variables in your hosting platform!**
