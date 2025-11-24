# First-Time App Permissions Integration

## Quick Integration

Add onboarding permissions to your app by importing and adding to App.jsx:

```jsx
import OnboardingPermissions from './components/OnboardingPermissions';
import { useState, useEffect } from 'react';
import { useLocalStorageState } from './useLocalStorageState';

// Inside App component:
const [showOnboarding, setShowOnboarding] = useState(false);
const [activeRole] = useLocalStorageState("colleco.sidebar.role", null);

useEffect(() => {
  const onboardingCompleted = localStorage.getItem('colleco.onboarding.completed');
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true;
  
  if (activeRole && !onboardingCompleted && isPWA) {
    setTimeout(() => setShowOnboarding(true), 1000);
  }
}, [activeRole]);

const handleOnboardingComplete = () => {
  setShowOnboarding(false);
};

// In return statement, wrap everything:
return (
  <>
    {showOnboarding && <OnboardingPermissions onComplete={handleOnboardingComplete} />}
    {/* Rest of your app */}
  </>
);
```

## Permissions Requested

### 1. **Location Access** 📍
- **Why:** Find nearby experiences, weather, directions
- **Benefits:**
  - 🗺️ Nearby attractions
  - 🌤️ Local weather
  - 🚗 Navigation
  - ✈️ Airport proximity

### 2. **Push Notifications** 🔔
- **Why:** Instant updates for bookings, payments, messages
- **Benefits:**
  - 📋 Booking confirmations
  - 💰 Payment alerts
  - 💬 Client messages
  - ⚠️ Travel alerts

### 3. **Camera Access** 📷
- **Why:** Profile photos, document uploads, check-ins
- **Benefits:**
  - 👤 Profile photos
  - 📄 Document scanning
  - ✅ Self check-in
  - 📸 Travel memories

### 4. **Storage** 💾
- **Why:** Offline itineraries, cached data (auto-granted)
- **Benefits:**
  - 📱 Offline access
  - ⚡ Faster loading
  - 💼 Saved trips
  - 📊 Local data

## User Experience

**Step 1:** Location (Skippable)
**Step 2:** Notifications (Skippable)  
**Step 3:** Camera (Skippable)
**Step 4:** Complete! 🎉

Each permission shows:
- Icon and clear title
- Benefits explanation
- "Enable" button
- "Skip for Now" option
- Privacy note

## When It Triggers

✅ User is logged in  
✅ App installed as PWA  
✅ First time opening app  

## Privacy & Control

- All permissions are **optional**
- Users can **skip** any permission
- Can be changed later in **Settings → Notifications**
- Privacy note: "🔒 Your privacy matters"

## Stored Data

```javascript
localStorage.setItem('colleco.onboarding.completed', 'true');
localStorage.setItem('colleco.onboarding.permissions', JSON.stringify(permissions));
localStorage.setItem('colleco.onboarding.skipped', JSON.stringify(skipped));
localStorage.setItem('colleco.location', JSON.stringify({ lat, lng, timestamp }));
```

## Additional Permissions (Future)

Optionally request:
- **Contacts** - Share trips with friends
- **Calendar** - Sync bookings to calendar
- **Microphone** - Voice search (if adding voice features)
- **Bluetooth** - Connect to devices (if adding smart features)

## Testing

1. Clear localStorage: `localStorage.clear()`
2. Install app as PWA
3. Login
4. Onboarding wizard appears
5. Test each permission

---

**Component:** `src/components/OnboardingPermissions.jsx`  
**Integration:** Add to `src/App.jsx`  
**Status:** ✅ Ready to use
