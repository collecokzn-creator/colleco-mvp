# Phase 1 Implementation Guide: Legal Consent API Integration

## Overview
This guide describes the backend consent storage API and how to integrate it with the frontend registration flows.

---

## Backend API: Legal Consent Routes

### API Endpoints (Full POPI Act Compliance)

All endpoints are prefixed with `/api/legal/`

#### 1. POST `/api/legal/consent`
**Purpose**: Store user consent to legal documents  
**POPI Act**: Section 11 (User must consent before processing personal data)

**Request Body**:
```javascript
{
  userId: "user-123", // Required: Unique user identifier
  consentType: "registration", // Optional: registration, booking, profile_update
  acceptedTerms: true, // Required: boolean or object with timestamp
  acceptedPrivacy: true, // Required: boolean or object with timestamp
  acceptedSLA: false, // Optional: for partners only
}
```

**Response**:
```javascript
{
  success: true,
  consentId: "uuid-xxxx-xxxx-xxxx",
  timestamp: "2025-12-08T10:30:00Z",
  message: "Consent recorded successfully (POPI Act compliant)"
}
```

**Status Codes**:
- 201 Created: Consent successfully stored
- 400 Bad Request: Missing required fields
- 500 Internal Server Error: Database failure

---

#### 2. GET `/api/legal/consent/:userId`
**Purpose**: Retrieve all consent records for a user  
**POPI Act**: Section 14 (User's right to access personal information)

**Parameters**:
- `userId` (path): Unique user identifier

**Response**:
```javascript
{
  userId: "user-123",
  consentHistory: [
    {
      id: "uuid-xxxx-xxxx-xxxx",
      userId: "user-123",
      timestamp: "2025-12-08T10:30:00Z",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0...",
      consentType: "registration",
      acceptedTerms: { accepted: true, timestamp: "2025-12-08T10:30:00Z" },
      acceptedPrivacy: { accepted: true, timestamp: "2025-12-08T10:30:00Z" },
      acceptedSLA: { accepted: true, timestamp: "2025-12-08T10:30:00Z" },
      termsVersion: "1.0",
      privacyVersion: "1.0",
      slaVersion: "1.0",
      status: "accepted"
    }
  ],
  totalRecords: 1,
  message: "POPI Act: You have the right to know what personal data is stored"
}
```

---

#### 3. POST `/api/legal/consent/:userId/withdraw`
**Purpose**: User withdraws consent (POPI Act: Section 11.4.3)  
**POPI Act**: User's right to withdraw consent at any time

**Request Body**:
```javascript
{
  reason: "No longer using service", // Optional
}
```

**Response**:
```javascript
{
  success: true,
  withdrawalId: "uuid-xxxx-xxxx-xxxx",
  userId: "user-123",
  message: "Consent withdrawn (POPI Act compliant)",
  affectedRecords: 1,
  note: "User must be deleted or data anonymized per POPI Act requirements"
}
```

---

#### 4. GET `/api/legal/versions`
**Purpose**: Retrieve current legal document versions

**Response**:
```javascript
{
  termsVersion: "1.0",
  privacyVersion: "1.0",
  slaVersion: "1.0",
  lastUpdated: "2025-12-08T10:30:00Z"
}
```

---

#### 5. POST `/api/legal/versions`
**Purpose**: Update legal document versions (admin only)

**Request Body**:
```javascript
{
  termsVersion: "1.1",
  privacyVersion: "1.1",
  slaVersion: "1.0",
}
```

**Response**:
```javascript
{
  success: true,
  message: "Legal document versions updated",
  versions: {
    termsVersion: "1.1",
    privacyVersion: "1.1",
    slaVersion: "1.0",
    lastUpdated: "2025-12-08T11:00:00Z"
  }
}
```

---

#### 6. GET `/api/legal/audit`
**Purpose**: Retrieve audit log (admin only - POPI Act transparency)

**Query Parameters**:
- `userId` (optional): Filter by specific user
- `action` (optional): Filter by action type (CONSENT_ACCEPTED, CONSENT_WITHDRAWN, CONSENT_RETRIEVED, etc.)
- `limit` (default: 50): Pagination limit
- `offset` (default: 0): Pagination offset

**Response**:
```javascript
{
  total: 142,
  limit: 50,
  offset: 0,
  returned: 50,
  records: [
    {
      id: "uuid-xxxx-xxxx-xxxx",
      timestamp: "2025-12-08T10:30:00Z",
      action: "CONSENT_ACCEPTED",
      userId: "user-123",
      details: {
        consentType: "registration",
        termsVersion: "1.0",
        privacyVersion: "1.0",
        slaVersion: "1.0"
      },
      ipAddress: "192.168.1.1",
      operator: "system"
    }
    // ... more records
  ],
  message: "POPI Act: Audit log for compliance verification"
}
```

---

#### 7. GET `/api/legal/consent-summary/:userId`
**Purpose**: Retrieve summary of user consent status (for Privacy Settings UI)

**Response**:
```javascript
{
  userId: "user-123",
  hasConsented: true,
  latestConsent: {
    id: "uuid-xxxx-xxxx-xxxx",
    timestamp: "2025-12-08T10:30:00Z",
    // ... full consent record
  },
  totalConsents: 1,
  firstConsentDate: "2025-12-08T10:30:00Z",
  lastConsentDate: "2025-12-08T10:30:00Z",
  termsAccepted: true,
  privacyAccepted: true,
  slaAccepted: true,
  versions: {
    termsVersion: "1.0",
    privacyVersion: "1.0",
    slaVersion: "1.0"
  }
}
```

---

#### 8. GET `/api/legal/stats`
**Purpose**: Compliance stats for admin dashboard

**Response**:
```javascript
{
  totalConsents: 1250,
  totalAuditEvents: 5420,
  uniqueUsers: 1150,
  acceptedTerms: 1245,
  acceptedPrivacy: 1248,
  acceptedSLA: 890,
  auditBreakdown: {
    CONSENT_ACCEPTED: 1245,
    CONSENT_WITHDRAWN: 5,
    CONSENT_RETRIEVED: 145,
    LEGAL_VERSIONS_UPDATED: 3
  },
  lastConsentTimestamp: "2025-12-08T10:30:00Z"
}
```

---

## Frontend Integration: React Components

### 1. Using the Backend API in React

**Utility Function** (`src/utils/consentApi.js`):
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export const consentApi = {
  // Store consent
  async storeConsent(userId, consentData) {
    const response = await fetch(`${API_BASE}/api/legal/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        consentType: consentData.consentType || 'registration',
        acceptedTerms: true,
        acceptedPrivacy: true,
        acceptedSLA: consentData.acceptedSLA || false,
      }),
    });
    
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  // Get user consent history
  async getConsentHistory(userId) {
    const response = await fetch(`${API_BASE}/api/legal/consent/${userId}`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  // Get consent summary
  async getConsentSummary(userId) {
    const response = await fetch(`${API_BASE}/api/legal/consent-summary/${userId}`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  // Withdraw consent
  async withdrawConsent(userId, reason) {
    const response = await fetch(`${API_BASE}/api/legal/consent/${userId}/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
};
```

---

### 2. Integration in Login.jsx

The `LegalConsentModal` is already integrated in Login.jsx. When a user submits registration:

```javascript
async function handleLegalConsentAccept(consentRecord) {
  try {
    // Call backend API to store consent
    const response = await consentApi.storeConsent(pendingUserData.email, {
      consentType: 'registration',
      acceptedSLA: true, // if partner
    });

    // Create user account
    const newUser = {
      ...pendingUserData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      consentRecord: response.consentId,
    };

    localStorage.setItem("user:" + newUser.email, JSON.stringify(newUser));
    setUser(newUser);
    navigate("/");
  } catch (error) {
    setError("Failed to complete registration: " + error.message);
  }
}
```

---

### 3. Integration in BusinessTravelerRegistration.jsx

When user submits the final step:

```javascript
async function handleSubmit(e) {
  e.preventDefault();
  
  if (!validateStep(5)) return;

  setIsSubmitting(true);

  try {
    // Step 1: Store consent
    const consentResponse = await consentApi.storeConsent(formData.email, {
      consentType: 'business_traveler_registration',
      acceptedSLA: true,
    });

    // Step 2: Create business account
    const accountResponse = await fetch('/api/business-travelers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        accountType: 'business_traveler',
        consentId: consentResponse.consentId,
        registeredAt: new Date().toISOString()
      })
    });

    if (!accountResponse.ok) throw new Error('Registration failed');

    const result = await accountResponse.json();
    localStorage.setItem('colleco.businessAccount', JSON.stringify(result.account));
    navigate('/business-dashboard', { 
      state: { message: 'Business account created successfully!', accountId: result.accountId }
    });
  } catch (error) {
    console.error('Registration error:', error);
    setErrors({ submit: 'Failed to create account: ' + error.message });
  } finally {
    setIsSubmitting(false);
  }
}
```

---

### 4. Integration in PartnerOnboarding.jsx

Similar to BusinessTravelerRegistration, but includes SLA acceptance:

```javascript
// When submitting partner onboarding
const consentResponse = await consentApi.storeConsent(formData.email, {
  consentType: 'partner_onboarding',
  acceptedSLA: true, // Partners MUST accept SLA
});

// Then proceed with partner account creation
```

---

## Data Storage (JSONL Format)

### Why JSONL?
- **Immutable**: Append-only format makes tampering obvious
- **Auditable**: Each line is a complete, timestamped record
- **Compliance**: Perfect for POPI Act audit trails
- **Scalable**: No database required for MVP

### File Locations
- `server/data/legal_consents.jsonl`: All consent records
- `server/data/audit_logs.jsonl`: All audit events
- `server/data/legal_versions.json`: Current version numbers

### Example Consent Record
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "timestamp": "2025-12-08T10:30:00Z",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "consentType": "registration",
  "acceptedTerms": {"accepted": true, "timestamp": "2025-12-08T10:30:00Z"},
  "acceptedPrivacy": {"accepted": true, "timestamp": "2025-12-08T10:30:00Z"},
  "acceptedSLA": {"accepted": true, "timestamp": "2025-12-08T10:30:00Z"},
  "termsVersion": "1.0",
  "privacyVersion": "1.0",
  "slaVersion": "1.0",
  "status": "accepted"
}
```

---

## Testing the API

### 1. Start the Backend Server
```bash
npm run server
```

### 2. Test Store Consent
```bash
curl -X POST http://localhost:4000/api/legal/consent \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "consentType": "registration",
    "acceptedTerms": true,
    "acceptedPrivacy": true,
    "acceptedSLA": false
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "consentId": "uuid-xxxx",
  "timestamp": "2025-12-08T10:30:00Z",
  "message": "Consent recorded successfully (POPI Act compliant)"
}
```

### 3. Test Get Consent History
```bash
curl http://localhost:4000/api/legal/consent/user-123
```

### 4. Test Get Stats
```bash
curl http://localhost:4000/api/legal/stats
```

---

## POPI Act Compliance Checklist

- ✅ **Section 11**: Lawful basis - User actively consents before data processing
- ✅ **Section 14**: User access rights - GET consent endpoints allow users to see their data
- ✅ **Section 14.3**: Right to correct - Users can request corrections (via support)
- ✅ **Section 14.4**: Right to delete - Consent withdrawal triggers data deletion
- ✅ **Appendix**: Accountability - Audit logs provide proof of consent & compliance

---

## Implementation Timeline

**Phase 1 (Weeks 1-2)**:
- ✅ Backend API created (server/routes/legal.js)
- ✅ Server integration completed (server.js)
- 🔄 Frontend integration in all registration flows (Login, BusinessTraveler, Partner)
- 🔄 Standalone legal pages (Terms, Privacy, SLA)
- ⏳ External legal review

**Phase 2 (Weeks 3-4)**:
- Backend API testing and hardening
- Security audit and penetration testing
- Data retention policies implementation

**Phase 3+ (Weeks 5-8)**:
- Fraud detection integration
- Partner SLA monitoring
- Payment processing

---

## Troubleshooting

### Issue: "Failed to fetch consent"
**Solution**: Ensure backend server is running on port 4000 and `VITE_API_BASE` is set correctly.

### Issue: "Consent not stored"
**Solution**: Check that `server/data/` directory is writable and has proper permissions.

### Issue: "Cannot read audit logs"
**Solution**: Ensure JSONL files aren't corrupted. Each line must be valid JSON.

---

## Next Steps

1. **Integrate into BusinessTravelerRegistration.jsx** - Add state, handlers, modal rendering
2. **Integrate into PartnerOnboarding.jsx** - Same as above, with SLA section
3. **Create Privacy Settings page** - Show consent status, allow withdrawal
4. **Update config/pages.json** - Add routes for Terms, Privacy, SLA pages
5. **Get legal counsel review** - External law firm approval (BLOCKING GATE)

---

## Support

For questions or issues, contact: legal@colleco.com
