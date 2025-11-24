# Partner Integration - Complete System Access

## Overview

Partners are **first-class citizens** in the CollEco ecosystem. Every feature, workflow, and functionality must accommodate partner needs alongside admin and client roles.

## Core Principle

**"Partner-First Design"** - When building any feature, ask:
1. Can partners use this?
2. Do partners need their own version?
3. Should partners have restricted/enhanced access?
4. Does this help partners grow their business?

## Partner Role Definitions

### Types of Partners

1. **Hotel/Lodge Partners**
   - Manage rooms, rates, availability
   - Track bookings and revenue
   - Upload compliance documents
   - Create branded invoices

2. **Tour Operator Partners**
   - Manage tour packages
   - Create itineraries
   - Generate custom quotes
   - Track bookings and commissions

3. **DMC (Destination Management) Partners**
   - Full-service packages
   - Multi-vendor coordination
   - Custom experiences
   - Wholesale pricing

4. **Activity/Experience Partners**
   - Day tours, excursions
   - Adventure activities
   - Cultural experiences
   - Event management

5. **Transport Partners**
   - Car rental
   - Airport transfers
   - Private chauffeur
   - Shuttle services

6. **Conference/Event Partners**
   - Venue management
   - Catering services
   - AV equipment rental
   - Full event coordination

## System-Wide Partner Features

### 1. Authentication & Profile
- ✅ Partner registration with business details
- ✅ Email OR phone login
- ✅ Biometric authentication (Face ID/Fingerprint)
- ✅ Profile management
- ✅ Business verification status
- ✅ Multi-location support

### 2. Branding & Templates
- ✅ Upload company logo
- ✅ Custom invoice templates
- ✅ Brand colors and styling
- ✅ Custom terms & conditions
- ✅ Banking details configuration
- ✅ Multiple template support

### 3. Quote & Invoice Generation
- ✅ AI-powered quote creation
- ✅ Manual invoice builder
- ✅ Template selection per quote
- ✅ Client management
- ✅ Status tracking (Draft/Sent/Paid)
- ✅ PDF generation with partner branding

### 4. Booking Management
- ✅ View all bookings
- ✅ Accept/decline booking requests
- ✅ Booking calendar
- ✅ Availability management
- ✅ Booking notifications

### 5. Financial Management
- ✅ Commission tracking
- ✅ Revenue reports
- ✅ Payout requests
- ✅ Payment history
- ✅ Financial dashboards

### 6. Compliance & Documents
- ✅ Upload business registration
- ✅ Upload insurance documents
- ✅ Upload licenses/permits
- ✅ Document expiry tracking
- ✅ Verification status

### 7. Communication
- ✅ In-app chat with clients
- ✅ In-app chat with CollEco admin
- ✅ Booking notifications
- ✅ Payment notifications
- ✅ Document status updates

### 8. Analytics & Reporting
- ✅ Booking statistics
- ✅ Revenue analytics
- ✅ Performance metrics
- ✅ Guest satisfaction ratings
- ✅ Conversion tracking

### 9. Marketing & Promotions
- ✅ Create promotions
- ✅ Featured listings
- ✅ Special offers
- ✅ Seasonal campaigns
- ✅ Promo code generation

### 10. Product/Service Management
- ✅ Add/edit products (rooms, tours, services)
- ✅ Pricing configuration
- ✅ Availability calendar
- ✅ Product descriptions
- ✅ Photo upload
- ✅ Category management

## Partner Access Matrix

| Feature | Partner Access | Notes |
|---------|---------------|-------|
| **Dashboard** | Full | Partner-specific KPIs |
| **Bookings** | Own bookings only | Full CRUD on own bookings |
| **Quotes/Invoices** | Full | With own branding |
| **Templates** | Full | Create unlimited templates |
| **Clients** | View/Edit | Only clients who booked with them |
| **Products** | Full | Manage own inventory |
| **Calendar** | Full | Own availability |
| **Finance** | View own | Commission, payouts, revenue |
| **Reports** | View own | Performance analytics |
| **Compliance** | Full | Upload/manage own documents |
| **Chat** | Full | With clients and admin |
| **Settings** | Own profile | Business details, banking |
| **Promotions** | Create | Subject to admin approval |
| **Analytics** | View own | Performance data |
| **Users** | Own staff | Manage sub-accounts |

## Implementation Checklist

### Every New Feature Must Have:

#### 1. Role-Based Access
```javascript
// Example: pages.json route configuration
{
  "path": "/new-feature",
  "component": "NewFeature",
  "meta": {
    "requiresAuth": true,
    "roles": ["admin", "partner", "agent"] // ← ALWAYS include partner
  }
}
```

#### 2. Partner-Specific UI
```jsx
// Example: Component with partner-specific features
const { user, isPartner } = useUser();

return (
  <div>
    {/* Common features */}
    <CommonFeature />
    
    {/* Partner-specific features */}
    {isPartner && (
      <PartnerSpecificFeature 
        partnerId={user.id}
        branding={user.branding}
      />
    )}
  </div>
);
```

#### 3. Data Filtering
```javascript
// Example: API that filters by partner
async function getBookings(userId, userRole) {
  if (userRole === 'partner') {
    // Return only bookings for this partner
    return bookings.filter(b => b.partnerId === userId);
  }
  if (userRole === 'admin') {
    // Admin sees all bookings
    return bookings;
  }
  // Client sees own bookings
  return bookings.filter(b => b.clientId === userId);
}
```

#### 4. Partner Branding Support
```javascript
// Example: Every document/PDF generation
async function generatePDF(data, userId) {
  // Load partner template if exists
  const template = await getPartnerTemplate(userId);
  
  return createPDF({
    ...data,
    logo: template?.logo,
    companyInfo: template?.companyInfo,
    banking: template?.banking,
    terms: template?.terms
  });
}
```

## Partner-Specific Pages

### Current Partner Pages
1. `/partner/dashboard` - Overview and KPIs
2. `/partner/templates` - Invoice template management
3. `/partner/bookings` - Booking management
4. `/partner/products` - Product catalog
5. `/partner/calendar` - Availability calendar
6. `/partner/finance` - Revenue and payouts
7. `/partner/compliance` - Document uploads
8. `/partner/chat` - Communication hub
9. `/partner/promotions` - Marketing tools
10. `/partner/analytics` - Performance metrics
11. `/partner/settings` - Business settings

### Required Partner Pages (To Be Added)
- [ ] `/partner/onboarding` - Step-by-step setup wizard
- [ ] `/partner/training` - Platform tutorials and resources
- [ ] `/partner/support` - Help desk and FAQs
- [ ] `/partner/integrations` - API connections and webhooks
- [ ] `/partner/team` - Manage staff sub-accounts

## Partner Workflows

### 1. Partner Onboarding
```
1. Register as Partner
   ↓
2. Fill Business Details
   ↓
3. Upload Documents (Registration, Insurance, License)
   ↓
4. Await Admin Verification
   ↓
5. Create First Invoice Template
   ↓
6. Add First Product/Service
   ↓
7. Set Pricing & Availability
   ↓
8. Go Live!
```

### 2. Booking Management
```
Client Request
   ↓
Partner Notification
   ↓
Partner Reviews → Accept/Decline
   ↓
If Accepted: Confirm with Client
   ↓
Booking Confirmed
   ↓
Track in Dashboard
   ↓
Complete Service
   ↓
Get Paid
```

### 3. Quote Generation
```
Partner Dashboard
   ↓
Click "Create Quote"
   ↓
Select Template (with own branding)
   ↓
AI Generate OR Manual Entry
   ↓
Add Client Details
   ↓
Generate PDF (with partner logo)
   ↓
Send to Client
   ↓
Track Status (Draft/Sent/Accepted/Paid)
```

### 4. Commission & Payout
```
Booking Completed
   ↓
Commission Calculated (Auto)
   ↓
Shown in Finance Dashboard
   ↓
Partner Requests Payout
   ↓
Admin Approves
   ↓
Payment Processed to Partner Bank
```

## Partner API Endpoints

### Must Have for Every Resource
```javascript
// GET - List (filtered to partner's items)
GET /api/partner/bookings
GET /api/partner/products
GET /api/partner/quotes
GET /api/partner/finance/transactions

// POST - Create (auto-assign to partner)
POST /api/partner/products
POST /api/partner/quotes
POST /api/partner/promotions

// PUT - Update (only own items)
PUT /api/partner/products/:id
PUT /api/partner/quotes/:id
PUT /api/partner/settings

// DELETE - Delete (only own items)
DELETE /api/partner/products/:id
DELETE /api/partner/promotions/:id
```

### Partner-Specific Endpoints
```javascript
// Templates
GET /api/partner/templates
POST /api/partner/templates
PUT /api/partner/templates/:id
DELETE /api/partner/templates/:id

// Compliance
POST /api/partner/documents/upload
GET /api/partner/compliance/status

// Finance
GET /api/partner/finance/earnings
POST /api/partner/finance/payout-request
GET /api/partner/finance/statements

// Analytics
GET /api/partner/analytics/bookings
GET /api/partner/analytics/revenue
GET /api/partner/analytics/performance
```

## Partner Permissions

### What Partners CAN Do:
✅ Manage own products/services
✅ Create and send quotes with own branding
✅ View and manage own bookings
✅ Upload compliance documents
✅ View own financial data
✅ Request payouts
✅ Chat with clients and admin
✅ Create promotions (pending approval)
✅ Manage own team/staff
✅ View own analytics
✅ Update own business profile
✅ Create multiple branded templates
✅ Set own pricing and availability

### What Partners CANNOT Do:
❌ See other partners' data
❌ Access admin-only features
❌ Modify platform settings
❌ Approve other partners
❌ See all bookings
❌ Access system logs
❌ Delete platform data
❌ Change commission rates (set by admin)
❌ See other partners' financials

## Partner Data Privacy

### Isolation Rules:
1. **Bookings**: Partners only see bookings where they are the service provider
2. **Clients**: Partners see client details ONLY for their bookings
3. **Templates**: Each partner's templates are private
4. **Finance**: Partners see only their own transactions
5. **Documents**: Compliance docs are partner-specific
6. **Analytics**: Performance data is isolated per partner

### Shared Data:
- Product listings (visible to all)
- Public profiles (visible to clients)
- Approved promotions (visible in marketplace)
- Reviews/ratings (public)

## Partner Support Features

### Help & Resources:
1. **Knowledge Base** - How-to guides for partners
2. **Video Tutorials** - Platform walkthrough
3. **Live Chat** - Real-time support with admin
4. **FAQ Section** - Common questions
5. **Onboarding Wizard** - Step-by-step setup
6. **Email Support** - partners@colleco.travel
7. **Partner Community** - Forum for sharing tips

### Partner Success Metrics:
- Onboarding completion rate
- Time to first booking
- Average response time
- Client satisfaction rating
- Booking conversion rate
- Revenue per partner
- Document compliance status

## Testing Partner Features

### Test Scenarios:
```javascript
describe('Partner Features', () => {
  it('Partner can create branded invoice', () => {
    // 1. Login as partner
    // 2. Create template with logo
    // 3. Create quote using template
    // 4. Verify PDF has partner branding
  });
  
  it('Partner only sees own bookings', () => {
    // 1. Login as partner
    // 2. Navigate to bookings
    // 3. Verify only own bookings visible
    // 4. Attempt to access other booking (should fail)
  });
  
  it('Partner can request payout', () => {
    // 1. Login as partner
    // 2. View finance dashboard
    // 3. Request payout
    // 4. Verify request sent to admin
  });
});
```

## Future Partner Enhancements

### Phase 1 (Immediate):
- [ ] Partner mobile app
- [ ] Push notifications for bookings
- [ ] WhatsApp integration
- [ ] Automated availability sync
- [ ] Multi-language support

### Phase 2 (3 months):
- [ ] API access for tech partners
- [ ] Webhook integrations
- [ ] White-label options
- [ ] Advanced analytics
- [ ] Partner marketplace

### Phase 3 (6 months):
- [ ] Partner loyalty program
- [ ] Cross-partner packages
- [ ] Revenue optimization AI
- [ ] Dynamic pricing engine
- [ ] Partner certification program

## Best Practices

### When Adding New Features:

1. **Always Ask**: "How do partners use this?"
2. **Test with Partner Role**: Every feature tested as partner user
3. **Document Partner Impact**: Update partner docs
4. **Partner Feedback**: Get input from actual partners
5. **Gradual Rollout**: Beta test with select partners first

### Code Patterns:

```jsx
// ✅ GOOD - Role-aware component
const Feature = () => {
  const { user, isPartner, isAdmin } = useUser();
  
  return (
    <div>
      {isPartner && <PartnerView data={filterByPartner(data, user.id)} />}
      {isAdmin && <AdminView data={data} />}
    </div>
  );
};

// ❌ BAD - Admin-only thinking
const Feature = () => {
  // Only admin can access, partners excluded
  if (!isAdmin) return <div>Access Denied</div>;
  return <AdminOnlyView />;
};
```

## Partner Success Stories

### Example Use Cases:

**Safari Lodge Partner**:
- Uploaded 20 rooms with photos
- Created branded invoice template
- Generated 45 quotes in first month
- 32 bookings confirmed
- R280,000 revenue
- 4.9-star rating

**Tour Operator Partner**:
- Listed 15 tour packages
- Used AI quote generation
- Average response time: 12 minutes
- 68% quote-to-booking conversion
- R450,000 first quarter revenue

**Transport Partner**:
- Connected via API
- Real-time availability sync
- Automated booking confirmations
- 200+ transfers per month
- 100% on-time performance

---

## Summary

**Every feature in CollEco must empower partners to:**
1. ✅ Run their business efficiently
2. ✅ Brand their customer communications
3. ✅ Track their performance
4. ✅ Get paid quickly and transparently
5. ✅ Grow their revenue
6. ✅ Provide excellent service
7. ✅ Maintain compliance
8. ✅ Compete effectively

**Partners are not just users - they are our business partners. Their success is our success.**

---

**Document Version**: 1.0  
**Last Updated**: November 2025  
**Owner**: CollEco Development Team
