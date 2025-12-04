# Trust & Safety System - Complete Reference Guide

## Overview

The CollEco Travel Trust & Safety system is a comprehensive framework designed to protect users, maintain platform integrity, and ensure compliance with legal requirements. It consists of four interconnected modules:

1. **Content Filtering** - Identifies and moderates inappropriate content
2. **User Reporting** - Enables community-driven moderation and issue escalation
3. **User Verification** - Validates user identity and payment methods
4. **Risk Management** - Monitors, flags, and responds to suspicious activities

---

## Module 1: Content Filtering System

### Purpose
Automatically detect and filter inappropriate, illegal, or harmful content while preserving legitimate user expression.

### Key Functions

#### `filterContent(input, options)`
**Returns**: `{ flagged, category, text, spamScore, modified, originalLength }`

Filters user-generated content for policy violations.

**Parameters**:
- `input` (string): Text to analyze
- `options` (object):
  - `severity` (string): 'strict' | 'moderate' | 'lenient' (default: 'moderate')
  - `categories` (array): Specific categories to check ['hate_speech', 'sexual_content', 'spam', 'violence', 'drugs', 'fraud', 'financial_fraud', 'discrimination', 'misinformation']
  - `context` (string): 'public_post' | 'private_message' | 'review' | 'business' (affects threshold)
  - `checkPII` (boolean): Check for personal information exposure
  - `allowMarkdown` (boolean): Preserve markdown formatting

**Examples**:
```javascript
// Public review with strict moderation
filterContent('Great hotel!', { context: 'review', severity: 'strict' });

// Private message with PII checking
filterContent('My passport: ABC123', { context: 'private_message', checkPII: true });

// Specific category check
filterContent('Buy drugs now!', { categories: ['drugs', 'fraud'] });
```

#### `containsProhibitedContent(text, options)`
**Returns**: `boolean` or detailed violation object

Hard-blocking check for illegal or severely harmful content.

**Parameters**:
- `text` (string): Content to check
- `options` (object):
  - `severe` (boolean): Only check for severe violations
  - `categories` (array): Custom category filter
  - `checkChildSafety` (boolean): Enable child protection checks

**Special handling**:
- Human trafficking, child exploitation, weapons trafficking → automatic legal escalation
- Terrorism or threats of violence → security team notification
- Money laundering or sanctions violations → regulatory reporting

#### `sanitizeUserInput(input, options)`
**Returns**: `string` (cleaned input)

Removes malicious code and normalizes user input.

**Parameters**:
- `input` (string): Raw user input
- `options` (object):
  - `allowMarkdown` (boolean): Allow safe markdown
  - `normalizeUnicode` (boolean): Normalize unicode (prevents spoofing)
  - `maxLength` (number): Maximum length (default: 5000)

**Security protections**:
- Removes script tags and event handlers
- Prevents XSS attacks
- Blocks SQL injection patterns
- Strips Unicode homoglyphs that could spoof legitimate text
- URL validation and extraction

#### `getModerationScore(text, context)`
**Returns**: `number` (0-1, where 1 is most severe)

Calculates content severity for triage and automated response.

**Scoring factors**:
- Profanity or slurs (0.1-0.3)
- Hate speech or discrimination (0.5-0.8)
- Threats or violence (0.7-1.0)
- Sexual content (0.3-0.9 depending on severity)
- Spam or promotional (0.2-0.7)
- Context amplification (public posts scored higher)
- Repetition factor (repeated violations increase score)

### Content Categories

| Category | Definition | Auto-Action |
|----------|-----------|-------------|
| **Profanity** | Vulgar language | Redact/mask |
| **Hate Speech** | Discriminatory content | Flag + manual review |
| **Sexual Content** | Adult material | Context-dependent flag |
| **Spam** | Promotional or scam | Remove + flag user |
| **Violence** | Threats or harm | Escalate to security |
| **Drugs** | Drug-related content | Flag + legal check |
| **Financial Fraud** | Scam or money laundering | Escalate + investigation |
| **Discrimination** | Bias against protected groups | Flag + manual review |
| **Misinformation** | False harmful claims | Label + context |
| **Child Safety** | Any child-related violations | Immediate legal escalation |

### Implementation Example

```javascript
import { filterContent, sanitizeUserInput } from '@/utils/contentFilter';

// Handle user review submission
async function submitReview(text, rating) {
  // Sanitize first
  const clean = sanitizeUserInput(text, { maxLength: 1000 });
  
  // Filter for policy violations
  const filtered = filterContent(clean, { 
    context: 'review',
    checkPII: true,
    severity: 'strict'
  });
  
  if (filtered.flagged) {
    if (filtered.category === 'child_safety_violation') {
      // Immediate escalation
      await escalateToLegalTeam(filtered);
      return { error: 'Content cannot be posted' };
    }
    
    if (filtered.category === 'spam') {
      await flagUserActivity(userId, { type: 'spam_posting' });
    }
  }
  
  // Safe to post
  return saveReview({
    text: filtered.text,
    rating,
    originalLength: text.length,
    moderationScore: getModerationScore(filtered.text)
  });
}
```

---

## Module 2: User Reporting System

### Purpose
Enable users to report policy violations and give trust & safety team visibility into platform issues.

### Key Functions

#### `reportUserContent(payload)`
**Returns**: `{ id, status, createdAt, reason, ... }`

Creates a report for inappropriate user-generated content.

**Parameters**:
```javascript
{
  reportedUserId: string,       // ID of user who posted content
  reporterId?: string,          // ID of reporter (auto-detected if omitted)
  contentId: string,            // ID of specific content being reported
  reason: string,               // 'hate_speech' | 'harassment' | 'spam' | 'fraud' | ...
  description: string,          // Detailed explanation
  contentPreview?: string,      // Quote from content (max 500 chars)
  attachments?: string[],       // Evidence files (screenshots, etc)
  context?: object              // Additional metadata
}
```

**Validation**:
- Reports require valid `reason` from approved list
- Prevents duplicate reports on same content (within 24 hours)
- Auto-detects reporter if signed in
- Masks reporter identity in public views

**Report Reasons**:
- `hate_speech` - Discriminatory or hateful content
- `harassment` - Targeted harassment or bullying
- `spam` - Promotional or spam content
- `fraud` - Fraudulent or scam activity
- `abuse` - General abuse or inappropriate behavior
- `copyright` - Intellectual property violation
- `illegal_activity` - Illegal content or activities
- `child_safety_violation` - Child exploitation or endangerment

#### `getReportStatus(reportId)`
**Returns**: `status | detailed status object`

Retrieves current status of a report.

**Status values**:
- `open` - Under review
- `investigating` - Active investigation
- `upheld` - Violation confirmed, action taken
- `dismissed` - No violation found
- `resolved` - Issue resolved (user warned, content removed, etc)
- `escalated` - Forwarded to law enforcement or legal team

**Returns metadata**:
```javascript
{
  id: string,
  status: string,
  reason: string,
  createdAt: Date,
  updatedAt: Date,
  priority: 1-10,
  assignedTo?: string,
  estimatedResolutionTime?: number,
  publicFeedback?: string
}
```

#### `resolveReport(reportId, resolution, details, metadata)`
**Returns**: `resolved report object`

Closes a report with moderator action.

**Parameters**:
- `reportId` (string): Report to resolve
- `resolution` (string): 'upheld' | 'dismissed' | 'resolved' | 'escalated'
- `details` (string): Explanation of action taken
- `metadata` (object):
  - `moderatorId` (string): Who made the decision
  - `policyViolated` (string): Which policy was violated
  - `escalatedTo` (string): 'legal_team' | 'law_enforcement' | null
  - `actionTaken` (string): 'warning' | 'content_removed' | 'suspension' | 'ban'

**Actions triggered**:
- If `upheld`: User receives warning, content hidden/removed
- If `escalated`: Legal team or law enforcement notified
- If `dismissed`: Reporter receives notification (optional)

#### `getReportHistory(userId, filters)`
**Returns**: `report[]`

Retrieves all reports for a user with optional filtering.

**Filters**:
```javascript
{
  reason?: string,              // Filter by violation type
  status?: string,              // 'open' | 'resolved' | ...
  startDate?: Date,
  endDate?: Date,
  severity?: 'low' | 'medium' | 'high',
  sortBy?: 'created' | 'updated' | 'priority'
}
```

**Example**:
```javascript
// Get all unresolved harassment reports from past week
const reports = getReportHistory(userId, {
  reason: 'harassment',
  status: 'open',
  startDate: new Date(Date.now() - 7*24*60*60*1000)
});
```

#### `calculateReportUrgency(report)`
**Returns**: `0-10 priority score`

Calculates urgency for triage.

**Factors**:
- Violation severity (child safety = 10, spam = 2)
- User's report history (repeat violators = +2)
- Has evidence/attachments (+1)
- Time sensitivity (threats = urgent)

### Report Workflow Example

```javascript
// User reports harassment
const report = reportUserContent({
  reportedUserId: 'user_abuser',
  contentId: 'message_123',
  reason: 'harassment',
  description: 'User sent repeated threatening messages',
  contentPreview: 'I know where you live...',
  attachments: ['screenshot1.png', 'screenshot2.png']
});

// Monitor report
const status = getReportStatus(report.id);

// When moderator reviews:
const resolved = resolveReport(
  report.id,
  'upheld',
  'User account suspended for 30 days',
  {
    moderatorId: 'mod_sarah_123',
    policyViolated: 'harassment_policy_2024',
    actionTaken: 'suspension'
  }
);

// Track for pattern analysis
const history = getReportHistory('user_abuser');
if (history.length > 5) {
  // Consider permanent ban
  escalateToLegalTeam();
}
```

---

## Module 3: User Verification System

### Purpose
Establish trust through identity verification and payment method validation.

### Verification Levels

| Level | Status | Capabilities |
|-------|--------|--------------|
| **0** | Unverified | Browse only, no bookings |
| **1** | Email verified | Limited bookings ($500/day max) |
| **2** | Identity verified | Full bookings up to $10k/transaction |
| **3** | Fully verified (ID + Payment) | Premium tier, all features, $50k+/transaction |

### Key Functions

#### `verifyUserIdentity(userId, document)`
**Returns**: `{ id, status, startedAt, documentType, ... }`

Initiates identity verification via government ID.

**Parameters**:
```javascript
{
  documentType: 'passport' | 'drivers_license' | 'national_id' | 'visa',
  documentNumber: string,    // ID number
  name: string,              // Full name as on document
  issueDate?: Date,
  expiryDate?: Date,
  issuingCountry: string     // 2-letter country code
}
```

**Validation**:
- Name must match user profile
- Document must be current and valid
- Flags suspicious patterns (multiple rapid verifications)
- Checks against fraud databases

**Status progression**:
1. `pending` - Awaiting manual review
2. `in_review` - Under moderator examination
3. `approved` - Verification successful
4. `rejected` - Failed verification (allows resubmission)

#### `linkPaymentMethod(userId, cardDetails)`
**Returns**: `{ id, status, cardNumberMasked, ... }`

Links and verifies credit/debit card.

**Parameters**:
```javascript
{
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover',
  cardNumber: string,        // Full card number (encrypted)
  expiryMonth: number,       // 1-12
  expiryYear: number,        // 4-digit year
  cvv: string,              // Security code (encrypted)
  billingName: string,       // Name on card
  billingAddress: object,    // Full address
  isDefault?: boolean        // Set as default payment
}
```

**Security**:
- Never stored in plain text (encrypted or tokenized)
- Last 4 digits only for display
- CVV never stored or logged
- Validation via Luhn algorithm
- Fraud detection on linking

**Verification methods**:
- Micro-deposit verification (2 small charges)
- OTP verification
- 3D Secure challenge

#### `updateVerificationStatus(verificationId, status, details)`
**Returns**: `updated verification object`

Updates status after manual review.

**Parameters**:
- `verificationId` (string): Verification record ID
- `status` (string): 'approved' | 'rejected'
- `details` (object):
  - For approval: `{ reviewedBy, completedAt }`
  - For rejection: `{ reason, message, allowResubmit }`

**Rejection reasons**:
- `document_illegible` - Image quality too low
- `name_mismatch` - Name doesn't match profile
- `document_expired` - Document is no longer valid
- `fraud_detected` - Suspected fraudulent document
- `unsupported_country` - Country not supported

#### `getVerificationLevel(userId)`
**Returns**: `0-3` (verification level)

Gets current verification level for user.

#### `isVerified(userId)`
**Returns**: `boolean`

Quick check if user is fully verified (level 2+).

#### `shouldRequireAdditionalVerification(userId, context)`
**Returns**: `boolean`

Determines if 2FA or re-verification is needed.

**Triggers**:
- Large transaction amount (>$5000)
- Attempt from new location
- Attempt from new device
- Unusual time pattern
- Multiple failed payment attempts
- Account dormant then suddenly active

#### `generateVerificationChallenge(userId, method)`
**Returns**: `{ code, expiresAt, method, ... }`

Creates verification challenge (OTP, security questions, etc).

**Methods**:
- `otp` - One-time password (SMS or email)
- `security_questions` - Secret questions
- `biometric` - Fingerprint/face recognition
- `link_verification` - Click link in email

**OTP characteristics**:
- 6-digit code
- Expires in 10 minutes
- Max 3 attempts
- Prevents brute force (progressively longer delays)

#### `validateVerificationResponse(userId, response, options)`
**Returns**: `boolean` (challenge passed?)

Validates user's challenge response.

**Parameters**:
- `userId` (string): User being verified
- `response` (string): User's response
- `options` (object):
  - `checkLockout` (boolean): Return false if too many failures
  - `bypassExpiry` (boolean): Skip expiration check (admin only)

**Lockout policy**:
- 3 failed attempts: 5-minute lockout
- 6 failed attempts: 30-minute lockout
- 10 failed attempts: 24-hour lockout + manual review

### Verification Flow Example

```javascript
// User initiates identity verification
const verification = verifyUserIdentity('user_123', {
  documentType: 'passport',
  documentNumber: 'ABC123456',
  name: 'John Doe',
  issuingCountry: 'ZA'
});

// Wait for manual review... status becomes 'approved'

// Now link payment method
const paymentMethod = linkPaymentMethod('user_123', {
  cardType: 'visa',
  cardNumber: '4532123456789012',
  expiryMonth: 12,
  expiryYear: 2026,
  cvv: '123',
  billingName: 'John Doe',
  billingAddress: { ... }
});

// System requires OTP verification
const challenge = generateVerificationChallenge('user_123', 'otp');
// User receives SMS: "Your verification code is 123456"

// User submits code
const verified = validateVerificationResponse('user_123', '123456');

if (verified) {
  // Payment method now active, user at level 3
  const level = getVerificationLevel('user_123'); // Returns 3
}
```

---

## Module 4: Risk Management & Account Limits

### Purpose
Monitor user behavior for fraud, abuse, and other suspicious patterns; enforce transaction limits.

### Key Functions

#### `enforceAccountLimits(userId, transaction)`
**Returns**: `{ allowed, limit, remaining, resetAt, reason? }`

Checks if transaction is within account limits.

**Parameters**:
```javascript
{
  userId: string,
  amount?: number,           // Transaction amount
  type: 'booking' | 'payment' | 'api_call',
  transactionCount?: number,
  timestamp?: Date
}
```

**Limits enforced**:
- Per-transaction maximum
- Daily spending limit
- Monthly spending limit
- API rate limits (requests/min, hour, day)
- Booking count limits
- Refund/chargeback limits

**Limit tiers by verification level**:

| Limit Type | Level 0 | Level 1 | Level 2 | Level 3 |
|-----------|---------|---------|---------|---------|
| Max Transaction | $100 | $500 | $5,000 | $50,000 |
| Daily Limit | $200 | $2,000 | $20,000 | $200,000 |
| Monthly Limit | $500 | $5,000 | $50,000 | $500,000 |
| Bookings/Day | 2 | 10 | 50 | 200 |
| API Req/Min | 10 | 30 | 100 | 1,000 |

#### `getAccountLimits(userId, context)`
**Returns**: `limit object`

Retrieves current limits for account.

**Context can adjust limits**:
- Flagged account: 50% reduction
- High-risk activity: 80% reduction
- Recently verified: May start at level 1 limits even if marked for level 2

#### `updateAccountLimits(userId, changes)`
**Returns**: `updated limits object`

Manually updates limits (admin/moderation action).

**Parameters**:
```javascript
{
  maxTransactionAmount?: number,
  dailyLimit?: number,
  duration?: number,           // Seconds (for temporary changes)
  modifiedBy: string,          // Admin user ID
  reason: string               // Why limits changed
}
```

#### `flagSuspiciousActivity(userId, flag)`
**Returns**: `flag object`

Records suspicious activity on account.

**Parameters**:
```javascript
{
  type: string,               // Category of suspicion
  description: string,        // Details
  severity: 'low' | 'medium' | 'high' | 'critical',
  autoTrigger?: boolean,      // Was this auto-detected?
  evidence?: object           // Supporting data
}
```

**Flag types**:
- `multiple_failed_bookings` - Too many failed booking attempts
- `velocity_abuse` - Rapid-fire transactions
- `chargeback_attempt` - Payment reversal
- `fraud_detected` - ML model detected fraud
- `account_takeover_attempt` - Unusual access pattern
- `potential_money_laundering` - AML red flags
- `coordinated_fraud` - Multiple accounts acting together

**Severity impacts**:
- `low`: Warning to user
- `medium`: Temporary restriction
- `high`: Temporary suspension pending review
- `critical`: Immediate escalation to security team

#### `getSuspiciousActivityLog(userId, filters)`
**Returns**: `flag[] `

Retrieves all activity flags for user.

**Filters**:
```javascript
{
  severity?: string,
  type?: string,
  startDate?: Date,
  endDate?: Date,
  resolved?: boolean
}
```

#### `autoTemporarilySuspend(userId, reason)`
**Returns**: `suspension object`

Automatically suspends account (critical violations only).

**Auto-suspension triggers**:
- Child safety violation detected
- Illegal activity flagged
- Multiple critical fraud indicators
- Law enforcement request

**Suspension details**:
- Duration: 7 days (default, adjustable)
- User notified via email + in-app
- Content hidden from platform
- Transactions blocked
- Appeal process available

#### `autoTemporarilyRestrict(userId, config)`
**Returns**: `restriction object`

Limits account functionality without full suspension.

**Restriction types**:
```javascript
{
  reason: string,
  restrictedFeatures: ['booking', 'api_access', 'messaging'],
  allowedFeatures: ['view', 'search'],
  coolingOffMinutes?: number,
  notifyUser?: boolean
}
```

**Examples**:
- Rate-limited: Can view but not book (cooloff period)
- Velocity abuse: Can only book 1 per day
- Suspicious payment: Restricted to $100/transaction

#### `getAccountRiskScore(userId, indicators)`
**Returns**: `0-100` (risk score)

Calculates overall account risk.

**Scoring factors**:
- Verification level (lower = higher risk)
- Account age (newer = higher risk)
- Activity patterns (unusual = higher risk)
- Flags and suspicions (each adds points)
- Transaction history
- Geographic data
- Device fingerprints
- Behavioral anomalies

**Score interpretation**:
- 0-20: Low risk
- 21-40: Medium-low risk
- 41-60: Medium risk
- 61-80: High risk
- 81-100: Critical risk

#### `analyzeRiskPattern(userId, pattern)`
**Returns**: `{ isRiskPattern, patternType, riskScore, ... }`

Detects fraud patterns using ML and heuristics.

**Detectable patterns**:

| Pattern | Description | Indicators |
|---------|-------------|-----------|
| **Card testing** | Small incremental charges | $0.50 → $1 → $2 → $3 |
| **Velocity abuse** | Too many transactions | 5+ in 5 minutes |
| **Triangulation fraud** | Book then refund cycle | Success → Decline → Refund request |
| **Impossible travel** | Geographically impossible transactions | NYC then Tokyo in 1 minute |
| **Account takeover** | Unusual access/transactions | New device + high amount |
| **AML red flags** | Potential money laundering | Structuring, rapid movement |

### Risk Management Workflow

```javascript
// Transaction attempt
async function processTransaction(userId, amount) {
  // 1. Check limits
  const limitCheck = enforceAccountLimits(userId, {
    amount,
    type: 'booking'
  });
  
  if (!limitCheck.allowed) {
    return { error: 'Transaction exceeds limit', ...limitCheck };
  }
  
  // 2. Check risk score
  const riskScore = getAccountRiskScore(userId);
  if (riskScore > 80) {
    // Require additional verification
    const challenge = generateVerificationChallenge(userId, 'otp');
    return { requiresVerification: true, challenge };
  }
  
  // 3. Analyze patterns
  const pattern = analyzeRiskPattern(userId, {
    type: 'velocity_check',
    recentTransactionCount: 5,
    timeframe: '5m'
  });
  
  if (pattern.isRiskPattern && pattern.velocity > 4) {
    // Flag and restrict
    flagSuspiciousActivity(userId, {
      type: 'velocity_abuse',
      severity: 'high',
      autoTrigger: true
    });
    
    autoTemporarilyRestrict(userId, {
      reason: 'velocity_abuse',
      restrictedFeatures: ['booking'],
      coolingOffMinutes: 30
    });
    
    return { error: 'Account temporarily restricted' };
  }
  
  // 4. Process transaction
  return { success: true, transactionId: '...' };
}
```

---

## Integration Guidelines

### Frontend Integration

```javascript
// Content moderation
import { filterContent, sanitizeUserInput } from '@/utils/contentFilter';

// Verification UI
import VerificationFlow from '@/components/VerificationFlow';
import RiskWarning from '@/components/RiskWarning';

// Real-time limit checking
async function canUserBook(userId, amount) {
  const { allowed, remaining } = await enforceAccountLimits(userId, {
    amount,
    type: 'booking'
  });
  
  if (!allowed) {
    showNotification(`Booking limit: $${remaining} remaining today`);
  }
  
  return allowed;
}
```

### Backend Integration

```javascript
// Express middleware
async function trustSafetyMiddleware(req, res, next) {
  const userId = req.user.id;
  
  // Check if account is suspended
  const status = getSuspensionStatus(userId);
  if (status.suspended) {
    return res.status(403).json({ error: 'Account suspended' });
  }
  
  // Check rate limits
  const rateLimit = enforceAccountLimits(userId, {
    type: 'api_call'
  });
  
  if (!rateLimit.allowed) {
    res.set('Retry-After', rateLimit.resetAt);
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  next();
}

// Report handling
app.post('/api/reports', async (req, res) => {
  const report = reportUserContent({
    reporterId: req.user.id,
    ...req.body
  });
  
  // Escalate critical reports
  if (report.priority > 8) {
    await escalateToSecurityTeam(report);
  }
  
  res.json({ reportId: report.id });
});
```

---

## Monitoring & Metrics

### Key Metrics to Track

1. **Content Moderation**:
   - Flagged content rate
   - False positive rate
   - Review turnaround time
   - Appeal success rate

2. **User Reporting**:
   - Reports per day
   - Most common violations
   - Resolution time
   - Reporter follow-up rate

3. **Verification**:
   - Verification completion rate
   - Rejection rate (by reason)
   - Time to approval
   - Re-verification rate

4. **Risk Management**:
   - Accounts flagged/day
   - Suspension rate
   - False alarm rate
   - Fraud prevention success rate

### Dashboard Metrics Query Example

```javascript
// Daily report
const metrics = {
  content: {
    flagged: await countFlaggedContent({ since: 'today' }),
    categories: await groupFlaggedBy('category'),
    avgReviewTime: await getAverageReviewTime()
  },
  users: {
    newReports: await countReports({ status: 'open' }),
    resolvedToday: await countReports({ status: 'resolved', since: 'today' }),
    criticalFlags: await countFlags({ severity: 'critical' })
  },
  verification: {
    completionRate: await getVerificationCompletionRate(),
    avgTimeToApproval: await getAverageVerificationTime(),
    rejectionRate: await getRejectionRate()
  },
  risk: {
    accountsSuspended: await countSuspensions({ since: 'today' }),
    fraudulentTransactions: await countFraudulentTx(),
    patternsDetected: await countDetectedPatterns()
  }
};
```

---

## Escalation Procedures

### Severity-Based Response

| Severity | Response Time | Action | Escalation |
|----------|---------------|--------|-----------|
| Low | 48 hours | User warning | None |
| Medium | 24 hours | Temporary restriction | Manager review |
| High | 4 hours | Temporary suspension | Security lead |
| Critical | Immediate | Immediate action | Legal + Law Enforcement |

### Escalation Chain
1. **Automated response**: Restrictions, limits, warnings
2. **Moderation team**: Manual review, decisions
3. **Security lead**: High-risk assessments
4. **Legal team**: Regulatory/legal issues
5. **Law enforcement**: Criminal activity, exploitation

---

## Testing

All four modules have comprehensive test suites in:
- `tests/trustSafety.contentFilter.test.js`
- `tests/trustSafety.reporting.test.js`
- `tests/trustSafety.verification.test.js`
- `tests/trustSafety.riskManagement.test.js`

Run tests:
```powershell
npm run test
```

---

## Best Practices

### For Developers

1. **Always sanitize user input** before display or processing
2. **Never trust client-side validation** - verify server-side
3. **Log all moderation actions** for audit trail
4. **Handle PII carefully** - encrypt at rest, HTTPS in transit
5. **Test edge cases** - test with real violation examples

### For Moderators

1. **Document all decisions** - audit trail essential
2. **Treat reporters confidentially** - protect identities
3. **Escalate quickly** - don't delay critical issues
4. **Use template responses** - consistent, professional communication
5. **Monitor reversal rates** - indicates need for policy clarification

### For Product

1. **Transparency**: Explain why content was removed
2. **Appeals**: Allow users to contest decisions
3. **Privacy**: Don't expose other user data in reports
4. **Consistency**: Apply policies uniformly
5. **Evolution**: Update policies based on new patterns

---

## Compliance Notes

This system is designed to support:
- **GDPR**: User data protection and privacy rights
- **CCPA**: Privacy and deletion requests
- **KYC/AML**: Know Your Customer, Anti-Money Laundering
- **Child safety**: COPPA, NCMEC reporting
- **Payment**: PCI DSS compliance
- **Regional**: Country-specific regulations

Consult legal team for specific implementation of compliance features.

---

## Related Documentation

- `docs/architecture-overview.md` - System architecture
- `docs/integrations.md` - API integration patterns
- See copilot-instructions.md for development workflow

