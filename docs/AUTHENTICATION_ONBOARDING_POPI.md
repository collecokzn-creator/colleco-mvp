# Authentication & Onboarding System - POPI Compliant

## Overview

CollEco Travel implements a magical, safe, and POPI Act-compliant registration, login, and onboarding experience. The system prioritizes user security, regulatory compliance, and delightful user experience.

## System Components

### 1. Registration (`/register`)
**File**: `src/pages/Register.jsx`

Multi-step wizard with progressive disclosure:

#### Step 1: User Type Selection
- **Traveler (Client)**: Individual users booking trips
- **Service Provider (Partner)**: Businesses offering services

#### Step 2: Account Credentials
- Full Name (required)
- Email Address (required, validated)
- Phone Number (required, validated)
- Password (8+ characters, with strength indicator)
- Password Confirmation

**Validation**:
- Email format: `/\S+@\S+\.\S+/`
- Phone format: `/^[0-9+\s()-]{8,}$/`
- Password minimum: 8 characters
- Duplicate email detection

#### Step 3: Personal Information (POPI/FICA Compliance)
- Date of Birth (18+ years required)
- Country (defaults to South Africa)
- Residential Address
- City, Province, Postal Code

**Legal Basis**: Identity verification, FICA compliance, emergency contact

#### Step 4: Business Details (Partners Only)
- Business/Company Name
- Business Type (accommodation, tours, transport, etc.)
- CIPC Registration Number
- Business Address
- Tax/VAT Number (optional)

#### Final Step: Review & Legal Consent
- Summary of entered information
- POPI Act notice
- Launch Legal Consent Modal

### 2. Legal Consent Modal (`LegalConsentModal.jsx`)
**File**: `src/components/LegalConsentModal.jsx`

Enhanced POPI Act compliance with comprehensive consent management:

#### Required Consents (All Users)
1. **Terms & Conditions**
   - Service usage terms
   - Booking policies
   - Cancellation terms
   - Liability limitations
   - Dispute resolution

2. **Privacy Policy & POPI Act Compliance**
   - Data collection practices
   - Purpose of processing
   - Data sharing policies
   - User rights under POPI Act
   - Data security measures
   - Data retention periods (7 years for tax/legal compliance)

3. **Data Processing Consent**
   - Explicit consent for personal data processing
   - Purpose limitation acknowledgment

4. **POPI Act Rights Acknowledgement** (New)
   - Right to access personal information
   - Right to correction
   - Right to deletion (subject to legal requirements)
   - Right to object to processing
   - Right to lodge complaint with Information Regulator
   - Contact: inforeg@justice.gov.za | 012 406 4818

#### Required Consents (Partners)
5. **Service Level Agreement (SLA)**
   - Response time commitments
   - Quality standards
   - Payment terms
   - Termination conditions

#### Optional Consents
- Marketing communications
- Third-party data sharing

#### Features
- **Scroll tracking**: Ensures users read full documents
- **Version control**: Documents versioned (currently v1.0)
- **Consent records**: Timestamped with user agent
- **Expandable sections**: Progressive disclosure
- **POPI Act information**: Information Regulator contact details

### 3. Onboarding (`/onboarding`)
**File**: `src/pages/Onboarding.jsx`

Magical welcome experience with progressive profile completion:

#### Step 1: Welcome Screen
- Personalized greeting based on user type
- Quick setup overview (2 minutes)
- Skip option available

#### Step 2: Contact Verification
**Email Verification**:
- 6-digit code sent to email
- Demo code displayed for testing
- Real-time verification

**Phone Verification**:
- 6-digit SMS code
- Demo code displayed for testing
- At least one contact method required

**Security**: Both email and phone marked as verified in user profile

#### Step 3: Travel Interests (Clients Only)
Select from:
- Adventure (Mountain icon)
- Beach & Relaxation (Palmtree icon)
- Culture & History (Building icon)
- Wildlife & Safari (Heart icon)
- Food & Dining (Gift icon)
- Events & Festivals (Calendar icon)

**Purpose**: Personalized recommendations

#### Step 4: Budget & Travel Style (Clients Only)

**Budget Selection**:
- Budget-Friendly: Under R5,000
- Moderate: R5,000 - R15,000
- Luxury: R15,000 - R50,000
- Premium: Over R50,000

**Travel Style** (Multiple selection):
- Solo Travel
- Couples
- Family
- Group Travel

#### Partner Step 3: Business Profile Setup
- Business verification notice
- Review timeline (1-2 business days)
- Next steps for account activation

#### Final Step: Notification Preferences
Choose notification channels:
- **Email Notifications**: Booking confirmations, updates, offers
- **SMS Notifications**: Important alerts and reminders
- **Push Notifications**: Real-time updates and deals

**Default**: Email and Push enabled, SMS disabled

### 4. Enhanced Login (`/login`)
**File**: `src/pages/Login.jsx` (Updated)

Simplified login page that redirects registration to dedicated `/register` flow:

**Features**:
- Email/phone login
- Password visibility toggle
- Keep me logged in
- Biometric login support
- Link to new registration page

## Data Flow

### Registration Flow
```
User selects type → 
Enter credentials → 
Validate & check duplicates → 
Personal information (POPI/FICA) → 
Business details (if partner) → 
Review information → 
Legal Consent Modal → 
Accept all required consents → 
Create user record → 
Navigate to onboarding
```

### Onboarding Flow
```
Welcome screen → 
Verify email/phone → 
Select travel interests (clients) → 
Choose budget & style (clients) → 
Set notification preferences → 
Complete onboarding → 
Navigate to home
```

### Login Flow
```
Enter credentials → 
Validate → 
Check legal consent (if missing, show modal) → 
Set user context → 
Navigate to home or dashboard
```

## POPI Act Compliance Features

### Data Minimization
- Collect only necessary information
- Optional fields clearly marked
- Progressive profiling during onboarding

### Purpose Limitation
- Clear explanation of why each data point is collected
- Separate consents for different purposes
- Marketing consent is optional

### Lawful Processing
- Explicit consent for all processing activities
- Contract performance (bookings)
- Legal obligation (FICA compliance)
- Legitimate interests (fraud prevention)

### User Rights
Users can:
- Access their data (profile page)
- Correct inaccurate information (edit profile)
- Request deletion (contact privacy officer)
- Object to processing (opt-out options)
- Lodge complaint with Information Regulator

### Security Measures
- HTTPS/TLS encryption for data transmission
- Password minimum length (8 characters)
- Biometric login option
- Session management
- Secure localStorage encryption (production)

### Data Retention
- **Active users**: Data retained while account is active
- **Inactive accounts**: 3 years after last login, then archived
- **Legal compliance**: 7 years for tax/financial records
- **Deletion requests**: Processed within 30 days (subject to legal retention)

### Accountability
- Consent records timestamped and versioned
- User agent tracking for audit trail
- Information Officer designated: privacy@collecotravel.co.za
- Response time: 30 days for data requests

## Technical Implementation

### User Data Structure
```javascript
{
  id: "unique-id",
  type: "client" | "partner",
  name: "Full Name",
  email: "email@example.com",
  phone: "+27 82 123 4567",
  password: "hashed-password", // TODO: Implement proper hashing
  country: "South Africa",
  dateOfBirth: "YYYY-MM-DD",
  address: "Street Address",
  city: "City",
  province: "Province",
  postalCode: "0000",
  
  // Verification status
  emailVerified: true/false,
  phoneVerified: true/false,
  kycStatus: "pending" | "approved" | "rejected",
  
  // Legal compliance
  legalConsent: { /* consent record */ },
  
  // Partner-specific
  businessName: "Business (Pty) Ltd",
  businessType: "accommodation",
  businessRegNumber: "2024/123456/07",
  businessAddress: "Business Address",
  taxNumber: "4123456789",
  partnerStatus: "pending_verification" | "active" | "suspended",
  
  // Onboarding
  onboardingComplete: true/false,
  preferences: {
    interests: ["adventure", "beach"],
    budget: "moderate",
    travelStyle: ["solo", "couple"],
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  },
  
  // Timestamps
  registeredAt: "ISO timestamp",
  onboardedAt: "ISO timestamp",
  lastLoginAt: "ISO timestamp"
}
```

### Consent Record Structure
```javascript
{
  userId: "user-email-or-id",
  userType: "client" | "partner",
  consents: {
    termsAndConditions: true,
    privacyPolicy: true,
    dataProcessing: true,
    popiAcknowledgement: true,
    sla: true, // partners only
    marketingCommunications: false, // optional
    thirdPartySharing: false // optional
  },
  agreedAt: "ISO timestamp",
  version: "1.0",
  ipAddress: "collected-server-side",
  userAgent: "browser-user-agent"
}
```

### Storage
- **Registration data**: `localStorage.setItem("user:" + email, JSON.stringify(user))`
- **Current user**: `localStorage.setItem("user", JSON.stringify(user))`
- **Last identifier**: `localStorage.setItem("user:lastIdentifier", email)`
- **Consent record**: `localStorage.setItem("colleco.legal.consent." + userId, JSON.stringify(consent))`

### Routes Configuration
Updated in `src/config/pages.json`:

```json
{
  "path": "/register",
  "component": "Register",
  "meta": { "requiresAuth": false, "layout": "auth" }
},
{
  "path": "/onboarding",
  "component": "Onboarding",
  "meta": { "requiresAuth": false, "layout": "auth" }
},
{
  "path": "/login",
  "component": "Login",
  "meta": { "requiresAuth": false, "layout": "auth" }
}
```

## User Experience Highlights

### Magical Elements
- ✨ Sparkles icon and gradient progress bars
- 🎉 Celebratory welcome messages
- 🎯 Interactive card selections with hover effects
- 📊 Real-time progress tracking
- ✅ Instant validation feedback
- 🎨 Smooth transitions and animations

### Safe & Secure
- 🔒 Password strength visualization
- 👁️ Password visibility toggle
- 🛡️ POPI Act compliance badges
- 📜 Clear legal language
- 🔐 Scroll-to-read enforcement
- ✔️ Explicit consent checkboxes

### Simple & Effective
- 📝 Progressive disclosure (step-by-step)
- 💡 Contextual help text
- ⚠️ Clear error messages
- 🎯 Auto-focus on inputs
- 🔄 Back navigation support
- ⏭️ Skip options where appropriate

## Testing & Demo Features

### Demo Codes
For local testing without actual email/SMS integration:

**Email Verification**: 6-digit code displayed in console and UI
**Phone Verification**: 6-digit code displayed in console and UI

Example:
```javascript
console.log(`📧 Email verification code for user@example.com: 123456`);
console.log(`📱 SMS verification code for +27 82 123 4567: 789012`);
```

### E2E Testing Support
- `window.__E2E__` flag for test environment detection
- Bypass verification in test mode
- Auto-fill demo codes

## Security Recommendations for Production

### Immediate
1. ✅ Implement server-side email/SMS sending
2. ✅ Hash passwords with bcrypt (currently plain text)
3. ✅ Capture IP address server-side for consent records
4. ✅ Implement CSRF protection
5. ✅ Add rate limiting for login attempts

### Phase 2
1. ⏳ Two-factor authentication (2FA)
2. ⏳ Email/phone verification links (in addition to codes)
3. ⏳ Session expiration and refresh tokens
4. ⏳ Biometric authentication enhancement
5. ⏳ Suspicious activity detection

### Phase 3
1. ⏳ Data encryption at rest
2. ⏳ SIEM integration for audit logging
3. ⏳ Penetration testing
4. ⏳ POPI Act compliance audit
5. ⏳ Privacy impact assessment (PIA)

## Information Regulator Compliance

### Contact Details
**Information Regulator (South Africa)**
- Email: inforeg@justice.gov.za
- Phone: 012 406 4818
- Website: https://www.justice.gov.za/inforeg/
- Physical: JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001

### User Rights Process
1. User contacts privacy@collecotravel.co.za
2. Verify identity (ID number, email, phone)
3. Process request within 30 days
4. Provide response with clear explanation
5. If denied, inform user of complaint rights

### Complaint Escalation
1. User lodges complaint internally
2. Respond within 30 days
3. If unresolved, user can escalate to Information Regulator
4. Cooperate with Information Regulator investigation

## Accessibility Features

- ✅ Semantic HTML structure
- ✅ ARIA labels on form inputs
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Clear error announcements
- ✅ High contrast text
- ✅ Icon + text labels (no icon-only buttons)

## Multi-language Support (Future)

Planned languages:
- English (current)
- Afrikaans
- isiZulu
- isiXhosa

## Contact & Support

**Information Officer**: privacy@collecotravel.co.za
**Support**: support@collecotravel.co.za
**Response Time**: 30 days for data requests, 48 hours for general support

## Version History

- **v1.0** (December 2024): Initial release with POPI Act compliance
  - Multi-step registration wizard
  - Enhanced legal consent modal
  - Magical onboarding experience
  - Email/phone verification
  - POPI Act rights acknowledgement
  - Client and partner differentiation

## References

- Protection of Personal Information Act, 2013 (Act No. 4 of 2013)
- POPIA Code of Conduct for Direct Marketing
- Information Regulator Guidelines
- FICA (Financial Intelligence Centre Act) compliance requirements
- CIPC (Companies and Intellectual Property Commission) registration
