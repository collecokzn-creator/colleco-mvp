# localStorage Data Schema

This document defines all localStorage keys used across the CollEco Travel platform for data consistency.

## 📊 Core Data Keys

### `colleco.bookings`
**Used by:** Analytics.jsx, Reports.jsx, AdminDashboard.jsx, TravelerDashboard.jsx, BusinessDashboard.jsx, Trips.jsx, Bookings.jsx  
**Type:** Array of booking objects  
**Schema:**
```javascript
{
  id: string,              // Unique booking ID (e.g., "BK001")
  destination: string,     // Destination name (e.g., "Cape Town")
  status: string,          // "confirmed" | "pending" | "cancelled"
  date: string,            // ISO date string (booking date)
  endDate?: string,        // ISO date string (trip end date)
  amount: number,          // Total booking amount in ZAR
  userId: string,          // User ID who made the booking
  user?: string,           // User name/display name
  country?: string         // Country code or name
}
```

### `colleco.travel.history`
**Used by:** Analytics.jsx, Reports.jsx, TravelerDashboard.jsx, Trips.jsx  
**Type:** Array of completed trip objects  
**Schema:**
```javascript
{
  id: string,              // Unique trip history ID (e.g., "TH001")
  destination: string,     // Destination name
  date: string,            // ISO date string (trip date)
  amount: number,          // Trip cost in ZAR
  user: string,            // User ID
  country?: string         // Country code or name
}
```

### `colleco.users`
**Used by:** AdminDashboard.jsx, BusinessDashboard.jsx  
**Type:** Array of user objects  
**Schema:**
```javascript
{
  id: string,              // Unique user ID
  name: string,            // Full name
  email: string,           // Email address
  role?: string,           // "admin" | "partner" | "client" | "business-traveler" | "influencer"
  type?: string,           // Alternative role field
  createdAt?: string       // ISO date string
}
```

### `colleco.listings`
**Used by:** AdminDashboard.jsx, PartnerDashboard.jsx  
**Type:** Array of listing/package objects  
**Schema:**
```javascript
{
  id: string,              // Unique listing ID
  title: string,           // Listing title
  status: string,          // "active" | "inactive" | "pending"
  partnerId?: string,      // Partner who owns the listing
  price?: number,          // Listing price
  category?: string        // "hotel" | "tour" | "activity" | "car-hire"
}
```

## 🔐 User Authentication Keys

### `colleco.user`
**Used by:** TravelerDashboard.jsx, UserContext  
**Type:** Single user object (currently logged-in user)

### `colleco.user.id`
**Used by:** AccommodationBooking.jsx  
**Type:** String - current user ID

### `user:{identifier}`
**Used by:** Login.jsx  
**Type:** User profile stored by email/phone  
**Pattern:** Separate storage per user identifier

### `user:lastIdentifier`
**Used by:** Login.jsx  
**Type:** String - last logged-in user identifier

### `user:persistence`
**Used by:** Login.jsx  
**Type:** "local" | "session"

### `user:biometrics`
**Used by:** Login.jsx  
**Type:** "0" | "1"

## 📝 Content & App State Keys

### `colleco.itineraries`
**Used by:** SavedItineraries.jsx, TravelerDashboard.jsx  
**Type:** Array of saved itinerary objects

### `colleco.wishlist`
**Used by:** Wishlist.jsx  
**Type:** Array of wishlist items

### `colleco.aiDraft`
**Used by:** Home.jsx  
**Type:** String - AI-generated draft itinerary

### `colleco.basket`
**Used by:** Home.jsx  
**Type:** Shopping cart data

### `aiItineraryDraft:v1`
**Used by:** Itinerary.jsx  
**Type:** AI itinerary draft (versioned)

### `quotes`
**Used by:** QuoteGenerator.jsx  
**Type:** Array of quote objects

### `custom_invoice_logo`
**Used by:** QuoteGenerator.jsx  
**Type:** Base64 image data

### `partner_templates_{userId}`
**Used by:** PartnerTemplates.jsx, QuoteGenerator.jsx  
**Type:** Array of partner template objects  
**Pattern:** User-specific template storage

## 📦 Partner & Business Keys

### `colleco.partner.id`
**Used by:** PartnerSuccessDashboard.jsx, PartnerDashboard.jsx  
**Type:** String - current partner ID

### `colleco.partner.applicationId`
**Used by:** PartnerOnboarding.jsx, PartnerVerification.jsx, PartnerApplicationStatus.jsx  
**Type:** String - partner application ID

### `colleco.partner.metrics:{partnerId}`
**Used by:** partnerMetrics.js utility  
**Type:** Partner performance metrics object  
**Pattern:** Separate metrics per partner ID

## 📊 Analytics & Metrics Keys

### `colleco.downloads.metrics`
**Used by:** downloadTracker.js, Analytics.jsx  
**Type:** Download tracking metrics  
**Schema:**
```javascript
{
  totalDownloads: number,
  byOS: { [osName]: count },
  byDevice: { [deviceType]: count },
  byBrowser: { [browserName]: count },
  byLocation: { [country]: count }
}
```

### `colleco.usage.metrics`
**Used by:** usageAnalytics.js  
**Type:** App usage analytics

## ⚙️ Settings Keys

### `colleco.sidebar.role`
**Used by:** Sidebar.jsx, role-based navigation  
**Type:** "admin" | "partner" | "client" | "agent" | "influencer"

### `demoEvents`
**Used by:** Settings.jsx  
**Type:** "0" | "1"

### `smartAliases`
**Used by:** Settings.jsx  
**Type:** "0" | "1"

### `showWeather`
**Used by:** Settings.jsx  
**Type:** "0" | "1"

### `bookings:statusFilter`
**Used by:** Bookings.jsx  
**Type:** "all" | "confirmed" | "pending" | "cancelled"

### `bookings:sortBy`
**Used by:** Bookings.jsx  
**Type:** "date" | "destination" | "amount"

## 🎯 Data Consistency Guidelines

### 1. **Shared Keys Across Pages**
The following keys should maintain consistent data structure:
- `colleco.bookings` - Primary source for booking data
- `colleco.travel.history` - Completed trips
- `colleco.users` - User directory

### 2. **Fallback Strategy**
All dashboard pages should:
1. Try API endpoints first (when backend is available)
2. Fallback to localStorage data
3. Show demo data if localStorage is empty
4. Never show blank/broken UI

### 3. **Demo Data Population**
Use `scripts/seed-demo-data.js` to populate:
- Bookings (8 sample entries)
- Travel history (5 sample entries)
- Users (optional)
- Listings (optional)

### 4. **Time-Based Filtering**
When implementing time range filters:
- Parse ISO date strings from `date` field
- Filter by timeRange (7d, 30d, 90d)
- Recalculate metrics when timeRange changes

### 5. **Currency Formatting**
- Store amounts as numbers (in ZAR)
- Format for display: `R ${amount.toLocaleString()}`
- Admin uses dollar signs in UI but stores ZAR

## 🔄 Migration Notes

### Analytics & Reports Alignment (Dec 2025)
- **Before:** Reports.jsx used hardcoded static data
- **After:** Reports.jsx now reads from `colleco.bookings` and `colleco.travel.history`
- **Impact:** Consistent data across Analytics, Reports, and Admin dashboards

### Dashboard Fallbacks (Dec 2025)
- **AdminDashboard:** Now calculates from localStorage instead of hardcoded "1,234" users
- **TravelerDashboard:** Added localStorage fallback when `/api/bookings/upcoming` fails
- **BusinessDashboard:** Full localStorage fallback for all 5 API endpoints

## 📚 Related Documentation
- [Architecture Overview](./architecture-overview.md)
- [Integrations](./integrations.md)
- [Analytics Implementation](./ANALYTICS.md)
