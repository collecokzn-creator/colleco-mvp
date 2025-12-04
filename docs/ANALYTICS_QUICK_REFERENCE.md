# CollEco Analytics Quick Reference

## Quick Start

### 1. Track App Download

```javascript
import { trackDownload } from '../utils/downloadTracker.js';

// Called when app is installed
await trackDownload('app-store'); // or 'play-store', 'website', etc.
```

### 2. Track User Session

```javascript
import {
  startSession,
  endSession,
  trackPageView,
  trackFeatureUsage,
  trackConversion
} from '../utils/usageAnalytics.js';

// Start session on app init
startSession('user-123');

// Track navigation
trackPageView('/home');
trackPageView('/quote-generator');

// Track feature usage
trackFeatureUsage('QuoteGenerator', 'view');
trackFeatureUsage('QuoteGenerator', 'submit');

// Track conversion
trackConversion('booking_completed', 5000);

// End session on unmount
endSession();
```

### 3. Get Analytics

```javascript
// Download stats
const downloadStats = getDownloadStats();
const topCountries = getTopDownloadCountries(10);
const deviceBreakdown = getDeviceBreakdown();

// Usage stats
const usageStats = getUsageStats('7d');
const featureAdoption = getFeatureAdoption('7d');
const conversionFunnel = getConversionFunnel();
const retentionRate = getRetentionRate(7);
```

## API Endpoints

```bash
# Download tracking
POST /api/analytics/downloads
POST /api/analytics/installations
POST /api/analytics/updates

# Usage tracking
POST /api/analytics/sessions
POST /api/analytics/events

# Queries
GET /api/analytics/dashboard
GET /api/analytics/downloads
GET /api/analytics/usage
GET /api/analytics/export?format=csv|json
```

## Common Patterns

### In App.jsx
```javascript
useEffect(() => {
  startSession(userId || 'anonymous');
  return () => endSession();
}, []);

useEffect(() => {
  trackPageView(location.pathname);
}, [location.pathname]);
```

### In Feature Component
```javascript
const handleClick = () => {
  trackFeatureUsage('FeatureName', 'click');
  // ... execute feature
};

const handleComplete = () => {
  trackFeatureUsage('FeatureName', 'complete');
};
```

### In Checkout
```javascript
const handleBooking = (booking) => {
  // ... save booking
  trackConversion('booking_completed', booking.totalAmount);
};
```

## Storage

**localStorage Keys**:
- `colleco.downloads.metrics` - Download records
- `colleco.usage.sessions` - User sessions
- `colleco.usage.events` - Events
- `colleco.app.launched` - First launch timestamp

**Max Records**: 10,000 per collection

## Time Ranges

```javascript
getUsageStats('24h')  // Last 24 hours
getUsageStats('7d')   // Last 7 days
getUsageStats('30d')  // Last 30 days
getUsageStats('90d')  // Last 90 days
getUsageStats('all')  // All time
```

## Data Captured

### Downloads
- Timestamp, source (app-store, play-store, website, etc.)
- Device: type, OS, browser, version
- Location: country, region, city, timezone, coordinates

### Sessions
- Start/end time, duration, user ID
- Page views, feature interactions
- Source (referrer, direct)

### Events
- Type: pageview, feature, conversion, action
- Page/feature name, action, metadata
- Timestamp, session ID

### Conversions
- Type: booking_completed, purchase, signup, etc.
- Value (e.g., booking amount)
- Custom metadata

## Testing

```bash
npm run test -- tests/analytics.test.js
```

**Coverage**: Download tracking, session management, feature usage, conversions, export, time ranges, and more.

## View Analytics Dashboard

Navigate to `/analytics` in the app to see:
- **Downloads Tab**: Regional distribution, device breakdown
- **Usage Tab**: Feature adoption, conversion rates, page traffic
- **Travel Tab**: Personal travel statistics

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Downloads not showing | Ensure `trackDownload()` is called on install |
| Session duration = 0 | Call `endSession()` on app unmount/page unload |
| Features not tracked | Verify `trackFeatureUsage()` is called in handlers |
| Data not persisting | Check localStorage is enabled |
| Backend not receiving data | Verify routes registered in `server.js` |

## Files Reference

| File | Purpose |
|------|---------|
| `src/utils/downloadTracker.js` | Download tracking logic |
| `src/utils/usageAnalytics.js` | Session/usage tracking |
| `server/routes/analytics.js` | Backend analytics API |
| `src/pages/Analytics.jsx` | Analytics dashboard UI |
| `tests/analytics.test.js` | Test suite (50+ tests) |

---

**For detailed docs**: See `docs/ANALYTICS_SYSTEM.md`
