# 🚀 Quick Start Guide - New Authentication System

## Try the New Registration Flow

### Option 1: Start from Home Page
1. Start dev server: `npm run dev`
2. Navigate to home page
3. Click "Sign Up" or "Create Account" button
4. You'll be redirected to `/register`

### Option 2: Direct Navigation
```
http://localhost:5180/register
```

## Step-by-Step Walkthrough

### 1. Choose User Type
**URL**: `/register` (Step 1)

Select your role:
- **Traveler**: For individual users
- **Service Provider**: For businesses

Click the card that represents you → **Continue**

### 2. Create Account
**URL**: `/register` (Step 2)

Fill in:
- Full Name: `John Doe`
- Email: `john@example.com`
- Phone: `+27 82 123 4567`
- Password: `SecurePass123!` (8+ characters)
- Confirm Password: `SecurePass123!`

Click **Continue**

### 3. Personal Information
**URL**: `/register` (Step 3)

Provide:
- Date of Birth: Select date (must be 18+)
- Country: `South Africa` (default)
- Address: `123 Main Street`
- City: `Cape Town`
- Province: `Western Cape` (optional)
- Postal Code: `8001` (optional)

💡 **POPI Notice**: Blue info box explains why we collect this data

Click **Continue**

### 4. Business Details (Partners Only)
**URL**: `/register` (Step 4)

Partners provide:
- Business Name: `Amazing Tours (Pty) Ltd`
- Business Type: Select from dropdown
- Registration Number: `2024/123456/07`
- Business Address: `456 Business Ave`
- Tax Number: `4123456789` (optional)

Click **Continue**

### 5. Review & Legal Consent
**URL**: `/register` (Final Step)

Review your information, then click **Review Legal Terms**

#### Legal Consent Modal Opens:

**Read the documents** (scroll to bottom):
1. **Terms & Conditions** ▶ (expand to read)
2. **Privacy Policy & POPI Act** ▶ (expand to read)
3. **POPI Act Rights** ℹ️ (information box)

**Check all required boxes**:
- ✅ I agree to Terms & Conditions
- ✅ I agree to Privacy Policy
- ✅ I consent to data processing
- ✅ I acknowledge my POPI Act rights
- ✅ I agree to SLA (partners only)

**Optional** (not required):
- ☐ Marketing communications
- ☐ Third-party data sharing

Click **Accept**

### 6. Welcome to Onboarding
**URL**: `/onboarding?type=client&new=true`

**Step 1**: Welcome screen with sparkles ✨
- Read quick setup overview
- Click **Let's Get Started**

**Step 2**: Verify Contact Information

📧 **Email Verification**:
- Check console for code or look at demo code in UI
- Enter the 6-digit code
- Click **Verify**
- ✅ Email verified!

📱 **Phone Verification**:
- Check console or UI for demo code
- Enter the 6-digit code
- Click **Verify**
- ✅ Phone verified!

Click **Continue**

### 7. Travel Interests (Clients Only)
**URL**: `/onboarding` (Step 3)

Select your interests (click cards):
- 🏔️ Adventure
- 🏖️ Beach & Relaxation
- 🏛️ Culture & History
- 🦁 Wildlife & Safari
- 🍽️ Food & Dining
- 🎉 Events & Festivals

Must select at least 1 → Click **Continue**

### 8. Budget & Travel Style (Clients Only)
**URL**: `/onboarding` (Step 4)

**Choose budget range**:
- Budget-Friendly: Under R5,000
- Moderate: R5,000 - R15,000
- Luxury: R15,000 - R50,000
- Premium: Over R50,000

**Select travel styles** (can choose multiple):
- Solo Travel
- Couples
- Family
- Group Travel

Click **Continue**

### 9. Notification Preferences
**URL**: `/onboarding` (Final Step)

Set your preferences:
- ✅ Email Notifications (recommended)
- ☐ SMS Notifications
- ✅ Push Notifications (recommended)

**Completion screen** with gradient background!
🎉 "You're All Set!"

Click **Explore CollEco** → Navigate to home page

## Demo Codes

When testing locally, verification codes are displayed:

**In Browser Console**:
```
📧 Email verification code for john@example.com: 123456
📱 SMS verification code for +27 82 123 4567: 789012
```

**In UI**:
Look for gray boxes showing demo codes during verification steps

## Testing Different User Types

### Test as Client (Traveler)
1. Choose "Traveler" in Step 1
2. Complete 5 onboarding steps:
   - Welcome
   - Contact verification
   - Travel interests
   - Budget & style
   - Notifications

### Test as Partner (Business)
1. Choose "Service Provider" in Step 1
2. Complete Step 4 (Business Details)
3. Complete 4 onboarding steps:
   - Welcome
   - Contact verification
   - Business profile setup
   - Notifications

## Quick Testing Checklist

### Registration
- [ ] User type selection works
- [ ] Email validation works
- [ ] Password match validation works
- [ ] Age verification (18+) works
- [ ] Business fields appear for partners
- [ ] Review screen shows correct data
- [ ] Legal modal opens
- [ ] Can't submit without required consents

### Legal Consent
- [ ] Can expand/collapse sections
- [ ] Scroll tracking works
- [ ] POPI Act information visible
- [ ] Required consents enforced
- [ ] Optional consents work
- [ ] Decline button cancels
- [ ] Accept button proceeds

### Onboarding
- [ ] Welcome screen displays correctly
- [ ] Email verification accepts demo code
- [ ] Phone verification accepts demo code
- [ ] Travel interests are selectable
- [ ] Budget selection works
- [ ] Travel style multi-select works
- [ ] Notification toggles work
- [ ] Completion screen appears
- [ ] Navigates to home on complete

### Integration
- [ ] Login page links to register
- [ ] User data stored in localStorage
- [ ] Consent record saved
- [ ] User context updated
- [ ] Can login with new credentials

## Browser DevTools Tips

### Check localStorage
Open DevTools → Application → Local Storage → `http://localhost:5180`

Look for:
- `user:john@example.com` → User data
- `user` → Current user
- `colleco.legal.consent.john@example.com` → Consent record

### View Console Logs
Open DevTools → Console

Look for:
- Email/SMS verification codes
- E2E test flags
- Navigation events

### Monitor Network
DevTools → Network tab

No API calls during demo (all localStorage-based)

## Common Issues & Solutions

### "Email already exists"
- Clear localStorage or use different email
- Or test login flow instead

### "Must be 18 years old"
- Choose date of birth at least 18 years ago

### "Please verify at least one contact method"
- Enter demo code for email OR phone
- Both not required, just one minimum

### Verification code doesn't work
- Check console for actual demo code
- Or look in UI for gray box with code

### Back button doesn't work
- Each step has "Back" button at bottom
- Browser back also works

### Progress bar stuck
- Ensure all required fields filled
- Check for error messages
- Each step validates before allowing Continue

## Next Steps After Testing

1. ✅ Verify user data in localStorage
2. ✅ Test login with new credentials
3. ✅ Check onboarding completion flag
4. ✅ Test preferences are applied
5. ✅ Verify consent records saved

## Production Checklist

Before deploying:
- [ ] Replace demo codes with real email/SMS service
- [ ] Implement password hashing
- [ ] Add server-side validation
- [ ] Enable CSRF protection
- [ ] Set up rate limiting
- [ ] Test with real email addresses
- [ ] Legal review of terms/privacy policy
- [ ] POPI Act compliance audit
- [ ] Penetration testing
- [ ] Load testing

## Support

For issues or questions:
- Check `docs/AUTHENTICATION_ONBOARDING_POPI.md`
- Review console logs
- Inspect localStorage data
- Check browser compatibility

## Browser Support

Tested on:
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+

Mobile tested:
- iOS Safari
- Chrome Mobile
- Samsung Internet

---

**🎉 Enjoy the new magical, safe, and easy registration experience!**
