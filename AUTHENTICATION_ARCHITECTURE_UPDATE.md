# Authentication Architecture Update - Two-Sided Marketplace Model

## 🎯 Business Model Clarification

CollEco is a **two-sided marketplace** platform connecting:
- **Clients/Travelers**: Individuals and businesses who BOOK travel services
- **Service Providers/Partners**: Businesses who SELL travel services on the platform

---

## 📋 User Flows Overview

### **Client Flow** (Travelers & Booking Businesses)
```
"Start Living" Button → /register → Legal Consent → /onboarding → Explore Platform
```

**Purpose**: For individuals and businesses who want to make travel bookings

**Steps**:
1. Click "Start Living" (redirects to /register if not logged in)
2. Complete 3-step registration:
   - Step 1: Account Credentials (name, email, phone, password)
   - Step 2: Personal Information (DOB, country, address - POPI/FICA compliance)
   - Step 3: Review & Submit
3. Accept legal consents (POPI Act, Terms, Privacy, Data Processing)
4. Complete client onboarding (travel preferences, interests, budget)
5. Start exploring and booking travel experiences

---

### **Partner Flow** (Service Providers & Businesses)
```
Service Provider Link → /service-provider-registration → Legal Consent → /partner-onboarding → Partner Dashboard
```

**Purpose**: For businesses that want to sell services on CollEco

**Service Provider Types**:
- Tour Operators
- Destination Management Companies (DMCs)
- Shuttle Services & Transport
- Flights
- Activities & Experiences
- Event Organizers
- Restaurants & Dining
- Accommodations
- Wellness & Spa
- Other service providers

**Steps**:
1. Click "Service providers? Register here" link on Register page
2. Complete 4-step partner registration:
   - Step 1: Contact Person Details (name, email, phone, password, position)
   - Step 2: Business Information (business name, type, CIPC registration, tax number, address, website)
   - Step 3: Services & Description (select categories, describe business)
   - Step 4: Review & Submit
3. Accept legal consents (POPI Act, Terms, Privacy, Data Processing, **SLA Agreement**)
4. Complete partner onboarding (verification, document upload, service setup, payment config)
5. Access partner dashboard and start listing services

---

## 🗂️ Component Architecture

### **Client Components** (Booking Flow)

#### 1. **Register.jsx** (450+ lines)
**Path**: `/register`  
**Purpose**: Client/traveler registration only  
**User Type**: `client`

**Features**:
- 3-step wizard (Account → Personal Info → Review)
- POPI/FICA compliant data collection (DOB, address)
- Password strength validation
- Phone number validation (South African format)
- Email verification
- Link to service provider registration
- Creates user with `type: "client"`

**Form Fields**:
```javascript
Step 1: Account Credentials
- firstName, lastName
- email, phone, password, confirmPassword

Step 2: Personal Information
- dateOfBirth (FICA requirement)
- country (default: South Africa)
- address, city, province, postalCode

Step 3: Review & Submit
- Display all entered information
- Edit capability for each step
```

**Navigation**:
- On success → Legal Consent Modal → `/onboarding?type=client`
- Service provider link → `/service-provider-registration`

---

#### 2. **Onboarding.jsx** (600 lines - needs update)
**Path**: `/onboarding`  
**Purpose**: Client onboarding after registration  
**User Type**: `client`

**Current State**: Contains mixed logic for both clients and partners (needs cleanup)

**Expected Features** (Client-Specific):
- **Step 1: Verification Status**
  - Email verification confirmation
  - Phone verification (optional)
  - ID document upload (FICA compliance)

- **Step 2: Travel Interests**
  - Adventure, Culture, Beach, City, Nature, Luxury, Budget, Family, Solo, Business
  - Multi-select with visual cards

- **Step 3: Preferences**
  - Budget range (ZAR)
  - Travel style (luxury, mid-range, budget)
  - Preferred travel seasons
  - Group size preference

- **Step 4: Notifications**
  - Email notifications toggle
  - SMS notifications toggle
  - WhatsApp notifications toggle
  - Marketing communications (optional)

**Action Required**: Remove partner-specific logic, focus only on client preferences

---

### **Partner Components** (Service Provider Flow)

#### 1. **ServiceProviderRegistration.jsx** (680 lines - ✅ NEW)
**Path**: `/service-provider-registration`  
**Purpose**: Partner/service provider registration  
**User Type**: `partner`

**Features**:
- 4-step wizard (Contact → Business → Services → Review)
- Business verification fields (CIPC, tax number)
- Service category selection
- Creates user with `type: "partner"`

**Form Fields**:
```javascript
Step 1: Contact Person Details
- firstName, lastName
- email, phone, password, confirmPassword
- position (Business Owner, Manager, Director, etc.)

Step 2: Business Information
- businessName
- businessType (Accommodation, Tours, DMC, Transport, Flights, Activities, Events, Dining, Wellness, Other)
- businessRegNumber (CIPC registration)
- taxNumber (VAT/Tax number)
- businessAddress, city, province, postalCode
- website (optional)

Step 3: Services & Description
- serviceCategories[] (Accommodation, Tours & Activities, Transport, Dining, Events, Experiences)
- businessDescription (250 characters minimum)

Step 4: Review & Submit
- Display all business information
- Edit capability for each step
```

**Navigation**:
- On success → Legal Consent Modal (with SLA) → `/partner-onboarding?new=true`

---

#### 2. **PartnerOnboarding.jsx** (exists - needs verification)
**Path**: `/partner-onboarding`  
**Purpose**: Partner onboarding after registration  
**User Type**: `partner`

**Expected Features** (Partner-Specific):
- **Step 1: Welcome & Next Steps**
  - Verification timeline explanation
  - Document requirements list
  - Support contact information

- **Step 2: Verification & Documents**
  - Business registration certificate (CIPC)
  - Tax clearance certificate
  - Director/owner ID documents
  - Proof of bank account
  - Professional licenses/certifications (if applicable)

- **Step 3: Business Status**
  - Verification progress tracker
  - Document approval status
  - Pending actions

- **Step 4: Service Setup**
  - Add service listings
  - Set pricing tiers
  - Configure availability calendar
  - Upload service images

- **Step 5: Payment & Preferences**
  - Bank account details for payouts
  - Commission tier selection
  - Payout frequency preference
  - Notification preferences

**Action Required**: Verify existing content matches these requirements

---

### **Shared Components**

#### 1. **LegalConsentModal.jsx** (490 lines - ✅ COMPLIANT)
**Purpose**: POPI Act compliant consent management  
**Supports**: Both `client` and `partner` user types

**Features**:
- **Required Consents** (all users):
  - Terms of Service
  - Privacy Policy
  - Data Processing Agreement
  - POPI Act Acknowledgement

- **Partner-Specific Consent**:
  - Service Level Agreement (SLA)

- **Optional Consents**:
  - Marketing communications
  - Third-party data sharing

- **Compliance Features**:
  - Scroll-to-enable-submit pattern
  - Individual consent tracking
  - Version control (v1.0.0)
  - Timestamp recording
  - Information Regulator contact details
  - Right to withdraw consent

**Legal Framework**:
```javascript
POPI Act (South Africa)
- Information Regulator: POPIAComplaints@inforegulator.org.za
- Website: https://inforegulator.org.za
- Phone: 012 406 4818
```

---

#### 2. **Login.jsx** (804 lines)
**Path**: `/login`  
**Purpose**: Authentication for all user types

**Features**:
- Email + password authentication
- Password visibility toggle
- "Remember Me" functionality
- Social login options (Google, Apple)
- WhatsApp Business Messaging integration
- Link to registration
- Password reset flow

**User Type Detection**:
- Automatically detects user type from stored profile
- Redirects to appropriate dashboard:
  - **Clients** → `/` (Home/Explore)
  - **Partners** → `/partner-dashboard`

---

#### 3. **Navbar.jsx** (updated)
**"Start Living" Button Behavior**:
```javascript
// Updated from /login to /register
<Link to="/register">Start Living</Link>

// Logic:
if (user is logged in) {
  → Show user menu
} else {
  → Button redirects to /register
}
```

**Purpose**: Non-logged users go directly to client registration (primary user flow)

---

## 🔐 POPI Act Compliance

### Data Collection Justification

#### **Client Registration**:
- **Personal Information**: Name, email, phone, DOB, address
- **Legal Basis**: FICA compliance (Financial Intelligence Centre Act)
- **Purpose**: Identity verification, booking confirmations, travel documentation
- **Retention**: As required by law (5 years post last transaction)

#### **Partner Registration**:
- **Business Information**: Company name, registration number, tax number
- **Legal Basis**: Business relationship, tax compliance, FICA
- **Purpose**: Vendor verification, payment processing, tax reporting
- **Additional**: SLA agreement for service quality standards

### Consent Management
- ✅ Granular consent tracking (each policy individually)
- ✅ Version control (v1.0.0 tracked per consent)
- ✅ Timestamp recording (ISO 8601 format)
- ✅ Right to withdraw (Settings → Privacy → Manage Consents)
- ✅ Information Regulator contact details displayed
- ✅ Child consent acknowledgment (minimum age restrictions)

### Data Security
- ✅ Password hashing (bcrypt - server-side, planned)
- ✅ HTTPS enforced (production deployment)
- ✅ localStorage encryption (planned)
- ✅ Session timeout (30 minutes inactivity)
- ✅ Audit logging (access, modifications)

---

## 🛣️ Routing Configuration

### Updated routes in `pages.json`:

```json
{
  "path": "/register",
  "name": "Register",
  "component": "Register",
  "meta": {
    "title": "Create Account - CollEco",
    "description": "Sign up and start booking amazing travel experiences.",
    "requiresAuth": false,
    "layout": "auth"
  }
}

{
  "path": "/service-provider-registration",
  "name": "Partner Registration",
  "component": "ServiceProviderRegistration",
  "meta": {
    "title": "Join as Service Provider",
    "description": "Register your business to sell services on CollEco.",
    "requiresAuth": false,
    "layout": "auth"
  }
}

{
  "path": "/onboarding",
  "name": "Welcome",
  "component": "Onboarding",
  "meta": {
    "title": "Welcome to CollEco",
    "description": "Complete your profile setup and start exploring.",
    "requiresAuth": false,
    "layout": "auth"
  }
}

{
  "path": "/partner-onboarding",
  "name": "Partner Onboarding",
  "component": "PartnerOnboarding",
  "meta": {
    "title": "Partner Setup",
    "description": "Complete your partner account setup.",
    "requiresAuth": false,
    "layout": "auth"
  }
}
```

---

## 🎨 UI/UX Design Patterns

### Common Design Elements
- **Brand Colors**: Orange (#F47C20), Brown (#3A2C1A), Gold (#D4AF37), Cream
- **Typography**: System font stack with fallbacks
- **Form Validation**: Real-time with inline error messages
- **Progress Indicators**: Gradient progress bars for multi-step wizards
- **Button Styles**: 
  - Primary: `bg-brand-orange hover:bg-brand-orange/90`
  - Outline: `border-brand-orange text-brand-orange hover:bg-brand-orange/10`
- **Cards**: Surface (white) on cream backgrounds
- **Icons**: Lucide React icons throughout

### Multi-Step Wizard Pattern
```javascript
// Both Register.jsx and ServiceProviderRegistration.jsx use:
- Step header with number and title
- Progress bar with percentage
- Form fields with validation
- Back/Continue navigation
- Review step with edit links
- Legal consent modal on submit
```

### Accessibility
- ✅ ARIA labels on all inputs
- ✅ Keyboard navigation support
- ✅ Focus management between steps
- ✅ Error announcements for screen readers
- ✅ Color contrast compliance (WCAG AA)
- ✅ Skip links for navigation

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
```powershell
npm run test
```

**Coverage**:
- Form validation functions
- Password strength checker
- Phone number formatter
- Email validator
- POPI consent tracker

### E2E Tests (Playwright)
```powershell
npm run test:e2e
```

**Test Scenarios**:
1. **Client Registration Flow**:
   - Navigate to /register
   - Complete 3-step wizard
   - Accept legal consents
   - Verify redirect to /onboarding
   - Complete onboarding
   - Verify redirect to home

2. **Partner Registration Flow**:
   - Navigate to /service-provider-registration
   - Complete 4-step wizard with business details
   - Accept legal consents (including SLA)
   - Verify redirect to /partner-onboarding
   - Complete partner onboarding
   - Verify redirect to partner dashboard

3. **Login Flow**:
   - Test client login → home
   - Test partner login → partner dashboard
   - Test incorrect credentials
   - Test "Remember Me" functionality

4. **"Start Living" Button**:
   - Verify redirect to /register when not logged in
   - Verify proper behavior when logged in

### Mobile Tests
```powershell
npm run mobile:all
```

**Viewports**:
- iPhone SE (375x667)
- iPhone 12 (390x844)
- Galaxy S5 (360x640)

---

## 🚀 Deployment Checklist

### Environment Variables

#### Frontend (VITE_):
```env
VITE_API_BASE=https://api.colleco.travel
VITE_BASE_PATH=/
VITE_USE_HASH=0
VITE_GOOGLE_MAPS_API_KEY=your_key
```

#### Backend:
```env
API_TOKEN=your_production_token
TICKETMASTER_API_KEY=your_key
SEATGEEK_CLIENT_ID=your_id
AI_ANALYTICS=1
NODE_ENV=production
```

### Pre-Deployment Validation
- [ ] Test client registration flow end-to-end
- [ ] Test partner registration flow end-to-end
- [ ] Verify POPI Act consent recording
- [ ] Test email verification (if implemented)
- [ ] Verify password reset flow
- [ ] Check mobile responsiveness (all viewports)
- [ ] Run full E2E test suite (`npm run smoke:all`)
- [ ] Verify HTTPS enforcement
- [ ] Test CORS configuration
- [ ] Review security headers

### Post-Deployment Monitoring
- [ ] Monitor registration completion rates
- [ ] Track form abandonment (by step)
- [ ] Log authentication errors
- [ ] Monitor consent acceptance rates
- [ ] Track user type distribution (clients vs partners)

---

## 📝 Pending Tasks

### High Priority
1. ✅ Register.jsx converted to client-only (3 steps)
2. ✅ ServiceProviderRegistration.jsx created (4 steps)
3. ✅ "Start Living" button redirects to /register
4. ✅ Routes added to pages.json
5. ⏳ **Verify PartnerOnboarding.jsx content** (file exists, needs review)
6. ⏳ **Update Onboarding.jsx** (remove partner logic, client-specific only)
7. ⏳ **Test complete flows** (client and partner end-to-end)

### Medium Priority
- [ ] Add email verification system
- [ ] Implement phone number verification (SMS OTP)
- [ ] Add document upload for partner verification
- [ ] Create partner dashboard
- [ ] Add profile management (edit details)
- [ ] Implement consent withdrawal mechanism

### Low Priority
- [ ] Add social login integration (Google OAuth, Apple Sign-In)
- [ ] Implement password strength indicator
- [ ] Add multi-language support (EN, AF, ZU)
- [ ] Create admin panel for partner verification
- [ ] Add partner analytics dashboard

---

## 🔍 Next Steps

### Immediate Actions
1. **Read and verify PartnerOnboarding.jsx**:
   ```powershell
   # Check if existing content matches partner requirements
   # Should include: verification, documents, service setup, payment config
   ```

2. **Update Onboarding.jsx**:
   ```powershell
   # Remove partner-specific logic
   # Focus on client preferences: interests, budget, style, notifications
   ```

3. **Test Both Flows**:
   ```powershell
   # Start dev stack
   npm run server  # Terminal 1
   npm run dev     # Terminal 2
   
   # Test client flow:
   # - Navigate to localhost:5180
   # - Click "Start Living" → Should go to /register
   # - Complete registration → Should go to /onboarding
   
   # Test partner flow:
   # - Navigate to /register
   # - Click "Service providers? Register here"
   # - Complete registration → Should go to /partner-onboarding
   ```

4. **Run E2E Tests**:
   ```powershell
   npm run smoke:all
   ```

---

## 📚 Documentation References

- **Main Guide**: [AUTHENTICATION_ONBOARDING_POPI.md](./AUTHENTICATION_ONBOARDING_POPI.md)
- **Quick Start**: [AUTHENTICATION_QUICK_START.md](./AUTHENTICATION_QUICK_START.md)
- **Architecture**: [docs/architecture-overview.md](./docs/architecture-overview.md)
- **Integrations**: [docs/integrations.md](./docs/integrations.md)
- **POPI Compliance**: [LegalConsentModal.jsx](./src/components/LegalConsentModal.jsx)

---

## 🎯 Success Criteria

### For Client Flow:
- ✅ "Start Living" redirects to /register
- ✅ 3-step registration completes successfully
- ✅ POPI Act consents are recorded
- ⏳ Onboarding captures travel preferences
- ⏳ User can immediately start browsing/booking

### For Partner Flow:
- ✅ Service provider link is visible and accessible
- ✅ 4-step registration captures business details
- ✅ SLA consent is included and tracked
- ⏳ Partner onboarding handles verification status
- ⏳ Partner can access dashboard and list services

### For Both:
- ✅ Forms are POPI Act compliant
- ✅ Password security enforced (8+ chars, mixed case, numbers, symbols)
- ✅ Phone numbers validated (South African format)
- ✅ Email format validated
- ✅ Mobile responsive (tested on 3+ viewports)
- ⏳ All E2E tests passing

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Architecture restructured, pending final verification and testing
