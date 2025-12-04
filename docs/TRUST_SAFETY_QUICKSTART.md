# Trust & Safety System - Quick Implementation Guide

## TL;DR

CollEco's Trust & Safety system has 4 main modules. Use them in this order:

1. **Content Filter** - Clean/flag user input
2. **User Verification** - Validate identity + payment
3. **Risk Management** - Monitor for fraud
4. **User Reporting** - Handle community reports

---

## Quick Start: Adding Trust & Safety to Your Feature

### 1. User-Generated Content (Reviews, Messages, Posts)

```javascript
// In your component/API route
import { filterContent, sanitizeUserInput, getModerationScore } from '@/utils/contentFilter';

async function publishContent(userId, text) {
  // Step 1: Clean malicious input
  const clean = sanitizeUserInput(text, { maxLength: 5000 });
  
  // Step 2: Check for policy violations
  const filtered = filterContent(clean, { 
    context: 'review',  // or 'message', 'post', 'comment'
    checkPII: true      // Prevent sharing IDs, credit cards, etc
  });
  
  if (filtered.flagged) {
    // Handle violations
    if (filtered.category === 'child_safety_violation') {
      // Emergency escalation
      await notifyLegalTeam(filtered);
      throw new Error('This content cannot be posted');
    }
    
    // For moderate violations, optionally allow with modification
    if (filtered.modified) {
      // Show user what was changed
      console.log('Modified text:', filtered.text);
    }
  }
  
  // Step 3: Calculate moderation score for analytics
  const score = getModerationScore(filtered.text);
  
  // Safe to save
  return db.save('content', {
    userId,
    text: filtered.text,
    moderationScore: score,
    flagged: filtered.flagged,
    violationCategory: filtered.category
  });
}
```

### 2. Protecting Financial Transactions

```javascript
import { 
  enforceAccountLimits, 
  getAccountRiskScore,
  shouldRequireAdditionalVerification,
  generateVerificationChallenge,
  validateVerificationResponse
} from '@/utils/riskManagement';
import { isVerified } from '@/utils/userVerification';

async function processBooking(userId, amount) {
  // Step 1: Check if user is verified
  if (!isVerified(userId)) {
    return { error: 'Please verify your identity first' };
  }
  
  // Step 2: Check transaction limits
  const limitCheck = enforceAccountLimits(userId, {
    amount,
    type: 'booking'
  });
  
  if (!limitCheck.allowed) {
    return { 
      error: `Booking exceeds limit. Remaining today: $${limitCheck.remaining}`,
      ...limitCheck
    };
  }
  
  // Step 3: Check risk score
  const riskScore = getAccountRiskScore(userId);
  
  if (shouldRequireAdditionalVerification(userId, { 
    transactionAmount: amount,
    riskScore 
  })) {
    // Need 2FA/OTP for this transaction
    const challenge = generateVerificationChallenge(userId, 'otp');
    return { requiresVerification: true, challenge };
  }
  
  // Step 4: Process booking
  // ... your booking logic
}

// Validate OTP response
async function completeBooking(userId, bookingData, otpCode) {
  const isValid = validateVerificationResponse(userId, otpCode);
  
  if (!isValid) {
    return { error: 'Invalid verification code' };
  }
  
  // Process booking
}
```

### 3. Handling User Reports

```javascript
import { 
  reportUserContent, 
  getReportStatus,
  resolveReport 
} from '@/utils/reportingSystem';

// User files a report
async function handleUserReport(req, res) {
  const report = reportUserContent({
    reportedUserId: req.body.reportedUserId,
    contentId: req.body.contentId,
    reason: req.body.reason,  // 'harassment', 'spam', 'fraud', etc
    description: req.body.description,
    contentPreview: req.body.contentPreview,
    attachments: req.body.attachments  // Screenshots, etc
  });
  
  res.json({ reportId: report.id, status: 'open' });
}

// Moderation dashboard queries report status
async function getReportDetails(reportId) {
  const status = getReportStatus(reportId);
  return {
    id: reportId,
    status: status,
    urgency: calculateReportUrgency(reportId)
  };
}

// Moderator resolves report
async function resolveUserReport(reportId, moderatorId, decision) {
  const resolved = resolveReport(
    reportId,
    decision.status,  // 'upheld' or 'dismissed'
    decision.explanation,
    {
      moderatorId,
      policyViolated: decision.policyViolated,
      actionTaken: decision.actionTaken  // 'warning', 'suspension', etc
    }
  );
  
  // Notify user if appropriate
  if (resolved.status === 'upheld') {
    await notifyUserOfViolation(resolved.reportedUserId);
  }
}
```

### 4. Identity Verification Flow

```javascript
import { 
  verifyUserIdentity,
  linkPaymentMethod,
  getVerificationLevel,
  isVerified
} from '@/utils/userVerification';

// User starts verification
async function startVerification(userId, documentType, docNumber, name) {
  const verification = verifyUserIdentity(userId, {
    documentType,  // 'passport', 'drivers_license', etc
    documentNumber: docNumber,
    name,
    issuingCountry: 'ZA'  // 2-letter code
  });
  
  return {
    verificationId: verification.id,
    status: 'pending',  // Wait for manual review
    message: 'Your ID is being reviewed. This usually takes 24 hours.'
  };
}

// After ID is approved, link payment
async function linkPaymentCard(userId, cardData) {
  const payment = linkPaymentMethod(userId, {
    cardType: 'visa',
    cardNumber: cardData.number,
    expiryMonth: cardData.month,
    expiryYear: cardData.year,
    cvv: cardData.cvv,
    billingName: cardData.name,
    billingAddress: cardData.address
  });
  
  // Requires verification
  return {
    paymentId: payment.id,
    status: 'pending_verification',
    message: 'We sent a verification code to your email'
  };
}

// Check what tier user is at
async function getUserTier(userId) {
  const level = getVerificationLevel(userId);
  const verified = isVerified(userId);
  
  return {
    verificationLevel: level,
    isFullyVerified: verified,
    bookingLimit: getLimitForLevel(level),
    features: getFeaturesForLevel(level)
  };
}
```

---

## Common Patterns

### Pattern 1: Gradual Escalation for Repeated Violations

```javascript
async function handleViolation(userId, violationType) {
  const violationHistory = getReportHistory(userId, { reason: violationType });
  const violationCount = violationHistory.length;
  
  if (violationCount === 1) {
    // First time: warning
    flagSuspiciousActivity(userId, {
      type: violationType,
      severity: 'low'
    });
    notifyUser(userId, 'One warning - please follow our policies');
    
  } else if (violationCount === 2) {
    // Second time: temporary restriction
    autoTemporarilyRestrict(userId, {
      reason: `repeated_${violationType}`,
      restrictedFeatures: ['posting'],
      coolingOffMinutes: 24 * 60
    });
    notifyUser(userId, 'Your account is restricted for 24 hours');
    
  } else if (violationCount >= 3) {
    // Third+ time: suspension pending review
    autoTemporarilySuspend(userId, {
      reason: `repeated_${violationType}`,
      autoTrigger: true
    });
    notifyUser(userId, 'Your account has been suspended');
    escalateToSecurityTeam(userId);
  }
}
```

### Pattern 2: Context-Aware Content Moderation

```javascript
async function moderateContent(text, context, userVerificationLevel) {
  // Stricter for public, lenient for private
  const severity = context === 'public' ? 'strict' : 'moderate';
  
  // Stricter for unverified users
  const actualSeverity = userVerificationLevel === 0 ? 'strict' : severity;
  
  const result = filterContent(text, { 
    severity: actualSeverity,
    context: context === 'public' ? 'public_post' : 'private_message'
  });
  
  return {
    flagged: result.flagged,
    score: getModerationScore(text),
    text: result.text  // May be modified
  };
}
```

### Pattern 3: Pre-Booking Safety Checks

```javascript
async function canUserBook(userId, bookingAmount) {
  const checks = {
    isVerified: isVerified(userId),
    hasValidPayment: hasLinkedPaymentMethod(userId),
    withinLimits: enforceAccountLimits(userId, {
      amount: bookingAmount,
      type: 'booking'
    }).allowed,
    lowRiskScore: getAccountRiskScore(userId) < 60,
    noActiveSuspension: !isAccountSuspended(userId)
  };
  
  const canProceed = Object.values(checks).every(v => v === true);
  
  return {
    canBook: canProceed,
    failureReason: Object.entries(checks)
      .find(([_, v]) => v === false)?.[0],
    checks
  };
}
```

---

## Testing Your Implementation

### Run All Trust & Safety Tests

```powershell
# Run the test suites
npm run test

# Look for test files:
# - tests/trustSafety.contentFilter.test.js
# - tests/trustSafety.reporting.test.js
# - tests/trustSafety.verification.test.js
# - tests/trustSafety.riskManagement.test.js
```

### Manual Testing Checklist

- [ ] Content filter catches profanity
- [ ] Sanitization removes script tags
- [ ] Verification flow works end-to-end
- [ ] Transaction limits are enforced
- [ ] Risk score increases for suspicious activity
- [ ] Reports are created and can be resolved
- [ ] Escalation to security team works
- [ ] Temporary suspensions auto-expire

---

## Monitoring in Production

### Key Metrics Dashboard

```javascript
// Track these metrics in your dashboard
const metrics = {
  dailyReports: countReports({ since: 'today' }),
  resolvedToday: countReports({ status: 'resolved', since: 'today' }),
  flaggedContent: countFlaggedContent({ since: 'today' }),
  accountsSuspended: countSuspensions({ since: 'today' }),
  verificationRate: getVerificationCompletionRate(),
  avgReviewTime: getAverageReviewTime()
};

// Set up alerts for:
// - Spike in reports (> 2x normal)
// - Critical flags (child safety, illegal activity)
// - Unresolved high-priority reports (> 24 hours)
// - Verification failure rate (> 20%)
```

---

## Common Issues & Solutions

### Issue: Too Many False Positives

**Solution**: Adjust `severity` parameter
```javascript
// More lenient
filterContent(text, { severity: 'lenient' });

// Or check specific categories only
filterContent(text, { categories: ['illegal_activity', 'child_safety_violation'] });
```

### Issue: Verification Takes Too Long

**Solution**: Speed up by accepting more document types or countries
```javascript
// Currently supported
const allowedTypes = ['passport', 'drivers_license', 'national_id', 'visa'];

// Add more or adjust manual review priority
updateAccountLimits(userId, { 
  duration: 3600,  // 1 hour temporary boost
  reason: 'expedited_verification'
});
```

### Issue: Users Getting Locked Out

**Solution**: Implement graduated lockout
```javascript
// Instead of permanent lock
const attempts = getFailedAttempts(userId);

if (attempts < 3) {
  // Let them retry immediately
} else if (attempts < 6) {
  // 5-minute lockout
  lockout(userId, 300);
} else {
  // Manual review
  requireManualReview(userId);
}
```

### Issue: Risk Score Always High

**Solution**: Recalibrate factors
```javascript
// Check what's driving the score
const breakdown = getAccountRiskScore(userId, { 
  includeBreakdown: true 
});

// May need to adjust weights for:
// - Account age (new = high)
// - Verification level (unverified = high)
// - Recent activity patterns
// - Geographic anomalies
```

---

## Best Practices

✅ **DO**:
- Sanitize all user input
- Log all moderation actions
- Verify on the backend
- Scale response to severity
- Provide user feedback on rejections
- Appeal/review mechanism

❌ **DON'T**:
- Trust client-side validation alone
- Delete content without logging
- Expose reporter identity
- Apply blanket policies (context matters)
- Ban users without review
- Ignore appeals

---

## Support & Debugging

### Enable Debug Logging

```javascript
// In development
const DEBUG_TRUST_SAFETY = true;

// Then use in your code
if (DEBUG_TRUST_SAFETY) {
  console.log('Content filter result:', result);
  console.log('Risk score breakdown:', breakdown);
}
```

### Check Full Test Coverage

```powershell
# See all test scenarios
npm run test -- --reporter=verbose

# Run specific test file
npm run test trustSafety.contentFilter.test.js
```

### Review Moderation Decision Logs

```javascript
// Query recent moderator actions
const decisions = getRecentModerationDecisions({
  limit: 100,
  sort: 'newest'
});

// Analyze consistency
const statistics = analyzeModerationConsistency(decisions);
```

---

For complete details, see `docs/TRUST_SAFETY_SYSTEM.md`

