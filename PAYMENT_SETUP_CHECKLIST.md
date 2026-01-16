# Payment Setup - Quick Checklist

## ✅ What's Already Done

- [x] Payment system code is production-ready
- [x] Environment variable configuration implemented
- [x] Auto-detection of test/live mode working (from key prefix)
- [x] `.env.local` created and gitignored (safe for test keys)
- [x] `.gitignore` protecting all `.env.*` files
- [x] PDF generation and sharing working perfectly
- [x] Webhook support implemented
- [x] Test mode defaults to safe settings

## 🔧 What YOU Need to Do

### Step 1: Add Your Test Keys (NOW - For Development)

1. **Go to**: https://portal.yoco.com/online/settings/api-keys
2. **Copy your TEST keys** (they start with `sk_test_` and `pk_test_`)
3. **Edit `.env.local`** in this project
4. **Replace placeholders** with your actual test keys:

```bash
YOCO_SECRET_KEY=sk_test_xxxxxxxxxxxxx  # ← Your test secret key
YOCO_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx  # ← Your test public key
YOCO_WEBHOOK_SECRET=wh_secret_test_xxxxxxxxxxxxx  # ← Your test webhook secret
```

5. **Save the file** - it's gitignored, so it's safe!

### Step 2: Test Everything (BEFORE Going Live)

```powershell
# Terminal 1: Start backend
npm run server
# Look for: "Payment Gateway: Yoco (TEST MODE)"

# Terminal 2: Start frontend
npm run dev

# Test these:
✅ Complete a transfer booking
✅ Use test card: 4242 4242 4242 4242
✅ Verify payment success page shows correctly
✅ Download booking confirmation PDF
✅ Share PDF on WhatsApp/email
✅ Download invoice

# If everything works → Ready for production! 🎉
```

### Step 3: Set Live Keys (ONLY When Deploying)

**🚨 CRITICAL: NEVER commit live keys to Git!**

**For Netlify:**
1. Deploy your code (commit & push)
2. Go to: Site Settings → Environment Variables
3. Add these variables:
   ```
   YOCO_SECRET_KEY = sk_live_xxxxxxxxxxxxx
   YOCO_PUBLIC_KEY = pk_live_xxxxxxxxxxxxx
   YOCO_WEBHOOK_SECRET = wh_secret_live_xxxxxxxxxxxxx
   YOCO_TEST_MODE = 0
   YOCO_SUCCESS_URL = https://www.colleco.travel/pay/success
   YOCO_CANCEL_URL = https://www.colleco.travel/pay/cancel
   ```
4. Redeploy site

**For Vercel:**
1. Deploy your code
2. Go to: Project Settings → Environment Variables
3. Add same variables as above (Production scope)
4. Redeploy

### Step 4: Configure Yoco Webhooks (After Deployment)

1. Go to: https://portal.yoco.com/online/settings/webhooks
2. Add webhook URL: `https://api.colleco.travel/api/webhooks/yoco`
3. Copy webhook secret → Add to environment variables as `YOCO_WEBHOOK_SECRET`
4. Test webhook using Yoco's test feature

### Step 5: First Live Transaction

1. Make R10 test purchase with real card
2. Verify money appears in Yoco dashboard
3. Check booking confirmation generates correctly
4. Monitor for any errors

## 📝 Quick Reference

**Test Cards (Development):**
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Full list: https://developer.yoco.com/online/resources/test-cards

**Key Prefixes (Auto-Detection):**
- `sk_test_*` → TEST MODE (safe, no real money)
- `sk_live_*` → LIVE MODE (real money!)

**Files You Can Edit:**
- ✅ `.env.local` - Test keys only, gitignored
- ✅ Code files - No keys should be here
- ❌ `.env` - Never commit this
- ❌ Any file with live keys - Never commit

**Files to Check:**
- 📖 `PRODUCTION_PAYMENT_SETUP.md` - Complete detailed guide
- 📖 `.env.example` - Reference for environment variables

## ⚠️ Before You Commit

Run this check:

```powershell
# Make sure no secrets are in staged files
git diff --cached | Select-String "sk_live|pk_live"

# If this shows anything → STOP! Remove keys before committing
```

## 🆘 Need Help?

- **Yoco Docs**: https://developer.yoco.com/
- **Yoco Support**: support@yoco.com
- **Detailed Guide**: See `PRODUCTION_PAYMENT_SETUP.md` in this project

---

**Current Status**: ✅ Ready for development testing with your test keys!

**Next Step**: Add your test keys to `.env.local` and test the booking flow.
