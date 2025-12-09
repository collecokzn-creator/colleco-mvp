# CollEco Travel - Development Quick Reference Guide
## Brand Protection & Compliance Implementation

**Last Updated**: December 8, 2025  
**Purpose**: Quick lookup for developers implementing safeguards  
**Target Audience**: Dev team, QA, DevOps

---

## 🚀 QUICK START CHECKLIST

### Before You Start Any Feature
- [ ] Is this user data being collected? → Add to POPI Act audit log
- [ ] Is this a partner action? → Check SLA compliance requirements
- [ ] Is this payment-related? → Must be PCI DSS compliant
- [ ] Is this a user account action? → Log to audit trail with timestamp/IP
- [ ] Could fraud occur here? → Add fraud detection scoring

---

## 📋 WHAT YOU NEED TO KNOW

### 1. POPI Act Compliance (South Africa)

**Golden Rule**: If you're collecting personal information, you must:
1. Get explicit consent (checkbox, signature, or acknowledgment)
2. Tell users what you're collecting and why
3. Store it securely (encryption)
4. Let users access, correct, or delete it
5. Keep an audit trail

**Implementation Checklist**:
```javascript
// ✅ BEFORE storing user data:
const userConsent = {
  userId: 'user@example.com',
  termsAndConditions: true,      // Required
  privacyPolicy: true,            // Required
  dataProcessing: true,           // Required
  sla: false,                     // Only for partners
  marketingCommunications: false, // Optional
  thirdPartySharing: false,       // Optional
  agreedAt: new Date().toISOString(),
  version: '1.0',
  userAgent: navigator.userAgent,
  ipAddress: '192.168.1.1' // Server-side only
};

// ❌ NEVER do this:
// - Sell user data
// - Use data outside stated purpose
// - Share with third parties without consent
// - Delete audit logs
// - Hide data collection
```

### 2. Payment Security (PCI DSS)

**Golden Rule**: Card data NEVER touches your servers.

**Implementation Checklist**:
```javascript
// ✅ CORRECT: Tokenization
const response = await paymentProvider.createToken({
  cardNumber: userInput.cardNumber,  // User enters on secure form
  // PayFast handles encryption, returns token
});

const payment = {
  amount: 1500.00,
  currency: 'ZAR',
  cardToken: response.token,    // ✅ Safe to store token
  userEmail: 'user@example.com',
  metadata: { bookingId: 'booking_123' }
};

// ❌ WRONG: Storing card data
const userData = {
  cardNumber: '4532123456789010',  // ❌ ILLEGAL
  cvv: '123',                      // ❌ ILLEGAL
  expiryDate: '12/25'              // ❌ Legal risk
};

// ✅ REQUIRED:
// - TLS 1.3 for all payment transmission
// - 3D Secure verification for amounts >R5,000
// - Monthly PCI DSS security scans
// - Zero storage of CVV after transaction
// - Quarterly penetration testing
```

### 3. Partner SLA Compliance

**Golden Rule**: Partners must respond within 2 hours or their booking is at risk.

**Implementation Checklist**:
```javascript
const partnerSLAMetrics = {
  responseTime: {
    required: '<2 hours to guest inquiry',
    measured: 'timestamp of inquiry to partner response',
    yellow_flag: 'average >3 hours',
    red_flag: 'average >6 hours',
    escalation: 'auto-suspend after 3rd red flag'
  },
  
  confirmationTime: {
    required: '<4 hours to confirm booking',
    measured: 'system timestamp to confirmation submission',
    yellow_flag: '>3 hours',
    red_flag: '>6 hours',
    action: 'notify guest, mark booking at risk'
  },
  
  cancellationRate: {
    measured: 'cancellations / total bookings',
    yellow_flag: '>1 per month',
    red_flag: '>2 per month',
    escalation: '>3 per month = suspend 7 days'
  },
  
  guestRating: {
    required: '≥3.5 stars average',
    yellow_flag: '3.0-3.4',
    red_flag: '<3.0',
    action: '<3.0 = improvement plan required, then delisting'
  }
};

// ✅ Implementation:
// 1. Log timestamp when inquiry arrives
// 2. Log timestamp when partner responds
// 3. Calculate response_time = response - inquiry
// 4. Average daily and flag if thresholds exceeded
// 5. Auto-notify partner on yellow flag
// 6. Auto-suspend on red flag
// 7. Escalate to Partner Relations on 3rd violation
```

### 4. Fraud Detection

**Golden Rule**: Real-time scoring prevents 90%+ of fraud.

**Implementation Checklist**:
```javascript
// Calculate fraud risk score (0-100)
const fraudScore = calculateRiskScore({
  // User risk factors
  accountAge: daysSinceRegistration,           // New = +20
  phoneVerified: userPhoneVerified,            // No = +30
  emailVerified: userEmailVerified,            // No = +40
  
  // Transaction risk factors
  transactionAmount: bookingAmount,            // >$5000 = +15
  timeSinceLastBooking: daysFromPreviousBook, // <7 days = +25
  bookingDistance: geoDistance,                // >1000km = +20
  
  // Historical risk factors
  chargebackCount: userChargebacks,            // Each = +50
  cancellationRate: userCancellations,         // >50% = +40
  complaintCount: userComplaints               // Each = +10
});

// Action based on score
switch (true) {
  case fraudScore < 20:
    approveAutomatically();
    break;
  case fraudScore < 50:
    require3DSVerification();
    break;
  case fraudScore < 80:
    requireManualReview();
    break;
  case fraudScore >= 80:
    declineTransaction();
    alertFraudTeam();
    break;
}

// ✅ Log all scoring decisions
auditLog({
  action: 'fraud_check',
  userId: user.id,
  score: fraudScore,
  decision: 'approved|declined|manual_review',
  factors: { accountAge, transactionAmount, ... },
  timestamp: Date.now(),
  ipAddress: request.ip
});
```

### 5. Audit Logging (Required for Legal Evidence)

**Golden Rule**: Every critical action is logged with timestamp, user, and IP.

**Implementation Checklist**:
```javascript
// Must log THESE actions:
const auditableActions = {
  'user.registered': { fields: 'userId, email, timestamp, ip' },
  'user.login': { fields: 'userId, timestamp, ip, success/failure' },
  'user.passwordReset': { fields: 'userId, timestamp, ip, method' },
  'user.profileUpdated': { fields: 'userId, what_changed, timestamp, ip' },
  'user.consent': { fields: 'userId, consents, version, timestamp, ip' },
  'booking.created': { fields: 'userId, bookingId, amount, timestamp, ip' },
  'booking.cancelled': { fields: 'userId, bookingId, reason, timestamp, ip' },
  'payment.processed': { fields: 'userId, transactionId, amount, timestamp, ip' },
  'partner.suspended': { fields: 'partnerId, reason, admin_id, timestamp' },
  'fraud.detected': { fields: 'userId, fraudScore, action, timestamp, ip' },
  'data.accessed': { fields: 'admin_id, user_id, purpose, timestamp' }
};

// ✅ Logging wrapper
function auditLog(action, data) {
  const logEntry = {
    id: generateId(),
    action: action,
    user_id: data.userId,
    resource_type: data.resource,
    resource_id: data.resourceId,
    changes: data.changes,
    ip_address: request.headers['x-forwarded-for'] || request.connection.remoteAddress,
    user_agent: request.headers['user-agent'],
    timestamp: new Date(),
    status: data.success ? 'success' : 'failure',
    error_message: data.error || null
  };
  
  // Store in database (immutable, append-only)
  database.auditLogs.insert(logEntry);
  
  // Alert if critical action
  if (['fraud.detected', 'partner.suspended'].includes(action)) {
    notifyComplianceTeam(logEntry);
  }
}

// ❌ NEVER:
// - Delete or modify audit logs
// - Log to simple files without backup
// - Store audit logs in user-accessible areas
// - Expire audit logs <3 years
```

### 6. Data Retention Schedule

**Golden Rule**: Keep what you need, delete what you don't.

**Implementation Checklist**:
```javascript
const dataRetention = {
  // Personal Identification
  activeUser: {
    retention: 'duration of account + 3 years',
    trigger: 'user is active',
    action: 'none'
  },
  deletedAccount: {
    retention: '6 months archive, then purge',
    trigger: 'user deletes account',
    action: 'anonymize after 6 months'
  },
  
  // Transaction Data (South African law requires 7 years)
  bookingRecords: {
    retention: '7 years',
    trigger: 'booking completed',
    action: 'maintain for tax/legal'
  },
  paymentRecords: {
    retention: '7 years',
    trigger: 'payment processed',
    action: 'maintain for audit'
  },
  
  // Consent Records (Legal evidence - permanent)
  consentRecords: {
    retention: 'permanent',
    trigger: 'user accepts terms',
    action: 'never delete, audit trail forever'
  },
  
  // Communications
  messages: {
    retention: '2 years',
    trigger: 'message sent',
    action: 'auto-delete after 2 years'
  },
  chatLogs: {
    retention: '30 days',
    trigger: 'chat message sent',
    action: 'auto-delete after 30 days'
  },
  supportTickets: {
    retention: '1 year from resolution',
    trigger: 'ticket resolved',
    action: 'archive then delete'
  }
};

// ✅ Automated cleanup job
async function cleanupOldData() {
  // Daily job - runs at 2am
  const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000);
  const twoYearsAgo = new Date(Date.now() - 2*365*24*60*60*1000);
  const sevenYearsAgo = new Date(Date.now() - 7*365*24*60*60*1000);
  
  // Delete old chat logs
  await database.chatLogs.deleteWhere({ createdAt: { $lt: thirtyDaysAgo } });
  
  // Archive old messages
  await database.messages.moveToArchive({ createdAt: { $lt: twoYearsAgo } });
  
  // Keep booking records 7 years (for tax)
  // Keep consent records forever (audit trail)
  
  // Log the cleanup
  auditLog('data.cleanup', { records_deleted: results.count, timestamp: new Date() });
}

// ❌ NEVER:
// - Delete consent records (legal evidence)
// - Delete payment records before 7 years
// - Manually delete user data without request
// - Keep data longer than necessary
```

---

## 🔒 SECURITY CHECKLIST

### Every Deployment Must Have

```javascript
// ✅ HTTPS Enforcement
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// ✅ Secure Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// ✅ Rate Limiting (prevent brute force)
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});
app.post('/api/login', loginRateLimit, handleLogin);

// ✅ Input Validation (prevent injection)
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  // South African format: +27 or 0, then 8-9 digits
  return /^(\+27|0)[1-9]\d{8}$/.test(phone);
}

// ✅ Password Hashing (never plain text)
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 12); // cost factor 12

// ✅ Environment Variables (never hardcode)
const apiKey = process.env.PAYMENT_API_KEY;
const dbPassword = process.env.DB_PASSWORD;
// .env file is in .gitignore

// ✅ Database Encryption
const encrypt = require('crypto').createCipher;
const encrypted = encrypt('aes-256-cbc', process.env.ENCRYPTION_KEY)(sensitiveData);
```

---

## 🚨 WHAT TO ESCALATE IMMEDIATELY

If you encounter ANY of these, stop work and notify your manager:

```
SECURITY:
❌ Found hardcoded credentials in code
❌ Discovered unencrypted sensitive data
❌ Found SQL injection vulnerability
❌ Payment card data in logs or variables
❌ Unencrypted API communication
❌ Authentication bypass discovered

COMPLIANCE:
❌ User data being used outside stated purpose
❌ Consent record is incomplete
❌ Audit log entry missing
❌ POPI Act violation discovered
❌ Partner agreement being ignored

FRAUD:
❌ Suspicious pattern in transactions
❌ Multiple failed payments from same card
❌ Potential account takeover detected
❌ Chargeback pattern identified
❌ Fake review suspected

LEGAL:
❌ Partner violating safety terms
❌ Discrimination complaint received
❌ Data breach suspected
❌ Payment dispute with legal implications
```

---

## 💡 BEST PRACTICES

### Code Review Checklist
Before approving ANY code:

- [ ] No hardcoded credentials?
- [ ] Proper input validation?
- [ ] Audit log for critical actions?
- [ ] HTTPS/TLS used?
- [ ] Encryption for sensitive data?
- [ ] Rate limiting on sensitive endpoints?
- [ ] Error messages don't leak info?
- [ ] No SQL injection possible?
- [ ] Test coverage >80%?

### Testing Checklist
Before merging:

- [ ] Unit tests pass?
- [ ] Integration tests pass?
- [ ] Security linting clean?
- [ ] Dependency audit clean (npm audit)?
- [ ] Manual testing on staging?
- [ ] Load testing for performance?

### Deployment Checklist
Before production:

- [ ] All tests passing?
- [ ] Security audit complete?
- [ ] Backup tested?
- [ ] Rollback plan documented?
- [ ] Monitoring configured?
- [ ] Incident response ready?
- [ ] Team briefed on changes?

---

## 📞 WHO TO ASK

### Questions About...

**POPI Act Compliance** → Compliance Officer  
**Payment Security** → Senior Backend Developer  
**Partner SLA Enforcement** → Partner Relations Lead  
**Fraud Detection** → Fraud Prevention Team  
**Audit Logging** → DevOps/Infrastructure  
**Legal Questions** → Legal Counsel  
**Escalation Decisions** → Compliance Officer + Manager  

---

## 🎯 ONE-SENTENCE RULES

1. **If it's user data, log it** - Audit trail for legal compliance
2. **If it's payment, tokenize it** - Never touch raw card data
3. **If it's a partner action, measure it** - SLA metrics for enforcement
4. **If it's a login, check IP** - Fraud detection and account security
5. **If it's sensitive, encrypt it** - AES-256 at rest, TLS in transit
6. **If it's a deletion, archive first** - Retention requirements before purge
7. **If it's unauthorized, stop it** - Fraud scoring prevents loss
8. **If it's a violation, escalate it** - Zero tolerance for discrimination
9. **If it's a mistake, fix it** - Swift remediation for incidents
10. **If it's in doubt, ask** - Better safe than sorry

---

**Remember**: You're not just building features. You're protecting the CollEco Travel ecosystem—our users' safety, our partners' livelihoods, and our company's reputation.

**Code with confidence. Build with integrity.**

---

**Questions?** Reach out to your Compliance Officer or Team Lead.  
**Last Updated**: December 8, 2025  
**Next Review**: June 8, 2026
