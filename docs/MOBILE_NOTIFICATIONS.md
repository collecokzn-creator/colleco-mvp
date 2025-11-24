# Mobile Push Notifications - Your Office in Your Pocket

## 📱 Complete Guide to Mobile Notifications

---

## Overview

CollEco provides **native mobile push notifications** that work on both **iOS** and **Android** devices. Get instant alerts with:

✅ **Vibration patterns** - Feel the notification  
✅ **CollEco logo badge** - See the notification icon in your status bar  
✅ **Sound alerts** - Hear important updates  
✅ **Action buttons** - Reply, view, or dismiss directly from notification  
✅ **App badge** - Home screen icon shows unread count  
✅ **Background notifications** - Receive alerts even when app is closed  

---

## How It Works

### Progressive Web App (PWA)

CollEco uses **Progressive Web App** technology to deliver native-like notifications:

1. **Install CollEco** on your phone (Add to Home Screen)
2. **Grant notification permission** when prompted
3. **Receive notifications** just like any native app
4. **Tap notification** to open relevant page in app

### Supported Platforms

| Platform | Support | Features |
|----------|---------|----------|
| **iOS** (Safari) | ✅ Full | Requires PWA installation via "Add to Home Screen" |
| **Android** (Chrome) | ✅ Full | Works in browser + PWA, auto-install prompt |
| **Android** (Firefox) | ✅ Full | Works in browser + PWA |
| **Desktop** (Chrome/Edge/Firefox) | ✅ Full | Browser notifications without installation |

---

## iOS Setup (iPhone/iPad)

### Step 1: Add to Home Screen

1. Open CollEco in **Safari** (must use Safari, not Chrome)
2. Tap the **Share button** (square with arrow ↗️) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** in the top right

![Add to Home Screen iOS](https://via.placeholder.com/400x300?text=iOS+Add+to+Home+Screen)

### Step 2: Open from Home Screen

1. Find the **CollEco icon** on your home screen
2. Tap to open (must open from home screen, not Safari)

### Step 3: Enable Notifications

1. When prompted, tap **"Allow"** for notifications
2. If you missed it, go to:
   - Settings → Notifications → CollEco
   - Enable "Allow Notifications"

### Step 4: Customize (Optional)

In iOS Settings → Notifications → CollEco:
- **Sounds**: Choose notification sound
- **Badges**: Show unread count on app icon
- **Lock Screen**: Show notifications on lock screen
- **Notification Center**: Show in notification center
- **Banners**: Choose banner style (Temporary/Persistent)

### iOS Limitations

⚠️ **Important:** iOS requires the app to be installed via "Add to Home Screen" for notifications to work. Browser-based notifications are not supported on iOS.

---

## Android Setup

### Step 1: Install App

**Option A: Auto-Prompt**
1. Open CollEco in Chrome
2. Tap **"Install"** or **"Add to Home screen"** when prompted
3. Tap **"Install"** in the confirmation dialog

**Option B: Manual Install**
1. Open CollEco in Chrome
2. Tap the menu (⋮) in top right
3. Tap **"Install app"** or **"Add to Home screen"**
4. Tap **"Install"**

![Install on Android](https://via.placeholder.com/400x300?text=Android+Install+Prompt)

### Step 2: Grant Notification Permission

1. Open CollEco app
2. When prompted, tap **"Allow"** for notifications
3. If you missed it, go to:
   - Settings → Apps → CollEco → Notifications
   - Enable notifications

### Step 3: Customize Notifications

**Per-Notification Customization:**
1. Long-press any CollEco notification
2. Tap **"Settings"** or gear icon
3. Customize:
   - Sound
   - Vibration pattern
   - LED color
   - Pop on screen
   - Override Do Not Disturb

**App-Level Settings:**
- Settings → Apps → CollEco → Notifications
- Customize categories (Messages, Bookings, Payments, etc.)

---

## Notification Types & Vibration Patterns

CollEco uses **custom vibration patterns** for different notification types:

| Type | Vibration Pattern | Use Case | Icon |
|------|------------------|----------|------|
| **Message** | •• (200-100-200ms) | New chat messages | 💬 |
| **Booking** | ••• (300-100-300-100-300ms) | New bookings, updates | 📋 |
| **Payment** | •—• (500-200-500ms) | Payment received/due | 💰 |
| **Quote** | •• (200-100-200ms) | Quote requests | 📄 |
| **Alert** | •••• (rapid) | Urgent notifications | ⚠️ |
| **System** | • (200ms) | General updates | ℹ️ |

**Legend:** • = short vibration, — = long vibration

---

## Interactive Notifications

Tap notification action buttons without opening the app:

### Message Notifications
```
┌─────────────────────────────────┐
│ 💬 CollEco - New Message        │
│                                 │
│ Safari Adventures               │
│ We can accommodate your group!  │
│                                 │
│ [💬 Reply]  [👁️ View]          │
└─────────────────────────────────┘
```

### Booking Notifications
```
┌─────────────────────────────────┐
│ 📋 CollEco - New Booking        │
│                                 │
│ John Doe booked a 5-day safari  │
│ Value: R45,000                  │
│                                 │
│ [📋 View Booking]  [✓ OK]      │
└─────────────────────────────────┘
```

### Quote Notifications
```
┌─────────────────────────────────┐
│ 📄 CollEco - Quote Request      │
│                                 │
│ Client requested quote for      │
│ Cape Town Adventure Package     │
│                                 │
│ [📄 View Quote]  [✓ OK]        │
└─────────────────────────────────┘
```

### Payment Notifications
```
┌─────────────────────────────────┐
│ 💰 CollEco - Payment Received   │
│                                 │
│ R45,000 received for BK-12345   │
│                                 │
│ [💰 View Payment]               │
└─────────────────────────────────┘
```

---

## App Badge (Home Screen Icon)

The CollEco icon on your home screen shows an **unread count badge**:

```
┌─────────────┐
│   CollEco   │
│   [ICON] ⓵  │  ← Badge showing 1 unread
│   CollEco   │
└─────────────┘
```

**What updates the badge:**
- New messages
- New bookings
- Quote requests
- Payment notifications
- System alerts

**Clear the badge:**
- Open the app and read notifications
- Swipe to clear notifications
- Badge auto-clears when you view items

---

## Permission Management

### Check Current Permission

```javascript
import { PushNotificationService } from '../components/NotificationCenter';

// Check if notifications are enabled
if (Notification.permission === 'granted') {
  console.log('Notifications enabled');
} else if (Notification.permission === 'denied') {
  console.log('Notifications blocked');
} else {
  console.log('Notifications not yet requested');
}

// Check if device is mobile
const isMobile = PushNotificationService.isMobileDevice();
console.log('Mobile device:', isMobile);

// Check if installed as PWA
const isPWA = PushNotificationService.isInstalledPWA();
console.log('Installed as PWA:', isPWA);
```

### Request Permission

```javascript
const granted = await PushNotificationService.requestPermission();
if (granted) {
  await PushNotificationService.subscribeToNotifications(userId);
}
```

### Revoke Permission

**iOS:**
1. Settings → Notifications → CollEco
2. Toggle off "Allow Notifications"

**Android:**
1. Settings → Apps → CollEco → Notifications
2. Toggle off notifications

**Desktop:**
1. Browser settings → Site settings → Notifications
2. Remove CollEco permission

---

## Testing Notifications

### Send Test Notification

```javascript
import { PushNotificationService } from '../components/NotificationCenter';

// Send test notification
await PushNotificationService.sendTestNotification();
```

This sends:
```
┌─────────────────────────────────┐
│ 🎉 CollEco Test                 │
│                                 │
│ Push notifications are working! │
│                                 │
└─────────────────────────────────┘
```

With:
- Vibration: 200ms-100ms-200ms
- Sound: Default notification sound
- Badge: CollEco logo

### Trigger Notification from Code

```javascript
import { PushNotificationService } from '../components/NotificationCenter';

// Send custom notification
await PushNotificationService.sendPushNotification(
  'New Booking',
  {
    body: 'Safari Adventures booked a 5-day package',
    type: 'booking',
    icon: '/assets/icons/colleco-logo-192.png',
    badge: '/assets/icons/colleco-logo-72.png',
    vibrate: [300, 100, 300, 100, 300], // Triple ping
    url: '/bookings/BK-12345',
    unreadCount: 3,
    actions: [
      { action: 'view', title: '📋 View Booking' },
      { action: 'dismiss', title: '✓ OK' }
    ]
  }
);
```

---

## Backend Integration

### Subscribe Endpoint

**POST** `/api/notifications/subscribe`

```javascript
{
  "userId": "user_123",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "auth": "...",
      "p256dh": "..."
    }
  },
  "deviceType": "mobile",
  "isPWA": true
}
```

### Send Notification from Backend

**Node.js Example (using web-push):**

```javascript
const webpush = require('web-push');

// Setup VAPID keys
webpush.setVapidDetails(
  'mailto:notifications@colleco.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send notification
const payload = JSON.stringify({
  title: 'New Booking',
  body: 'Safari Adventures booked a 5-day package',
  icon: '/assets/icons/colleco-logo-192.png',
  badge: '/assets/icons/colleco-logo-72.png',
  vibrate: [300, 100, 300, 100, 300],
  type: 'booking',
  url: '/bookings/BK-12345',
  unreadCount: 3
});

await webpush.sendNotification(subscription, payload);
```

**Python Example (using pywebpush):**

```python
from pywebpush import webpush, WebPushException

# Send notification
try:
    webpush(
        subscription_info=subscription,
        data=json.dumps({
            "title": "New Booking",
            "body": "Safari Adventures booked a 5-day package",
            "icon": "/assets/icons/colleco-logo-192.png",
            "badge": "/assets/icons/colleco-logo-72.png",
            "vibrate": [300, 100, 300, 100, 300],
            "type": "booking",
            "url": "/bookings/BK-12345"
        }),
        vapid_private_key=VAPID_PRIVATE_KEY,
        vapid_claims={
            "sub": "mailto:notifications@colleco.com"
        }
    )
except WebPushException as ex:
    print(f"Failed to send notification: {ex}")
```

---

## VAPID Keys Setup

Generate VAPID keys for secure push notifications:

### Using web-push (Node.js)

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Output:
```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib37gp2ENSg1CYQ2vUJ6...

Private Key:
VCgJFG9K3vH0lP8yQ2wRvUj7xT4kN6mL9sD5aF3bC8e...
=======================================
```

### Add to Environment Variables

```bash
VITE_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib37gp2ENSg1CYQ2vUJ6...
VAPID_PRIVATE_KEY=VCgJFG9K3vH0lP8yQ2wRvUj7xT4kN6mL9sD5aF3bC8e...
```

---

## Best Practices

### 1. Timing
- **Ask at the right moment** - Request permission after user performs an action (e.g., creates first booking)
- **Don't spam** - Only send important notifications
- **Respect quiet hours** - Avoid notifications late at night (use backend scheduling)

### 2. Content
- **Keep it short** - 60 characters max for title, 120 for body
- **Be specific** - "Safari Adventures booked 5-day package" vs "New booking"
- **Include actionable info** - Amount, date, name
- **Use emojis wisely** - 1-2 emojis for visual appeal

### 3. Frequency
- **Group related notifications** - Batch multiple messages into one
- **Allow user control** - Let users customize notification types
- **Track engagement** - Monitor which notifications get clicked

### 4. Mobile Optimization
- **Use appropriate vibration** - Match vibration to urgency
- **Set proper icons** - Always use CollEco logo for brand recognition
- **Add action buttons** - Make notifications actionable
- **Test on real devices** - Different phones behave differently

---

## Troubleshooting

### Notifications Not Appearing

**iOS:**
1. ✅ App installed via "Add to Home Screen"?
2. ✅ Opened from home screen (not Safari)?
3. ✅ Notifications enabled in Settings → Notifications → CollEco?
4. ✅ Using Safari (not Chrome)?
5. ✅ iOS 16.4 or later?

**Android:**
1. ✅ App installed or browser notifications enabled?
2. ✅ Permission granted?
3. ✅ Not in Do Not Disturb mode?
4. ✅ Notifications enabled in Settings → Apps → CollEco?
5. ✅ Chrome/Firefox up to date?

### Badge Not Showing

**iOS:**
- Settings → Notifications → CollEco → Enable "Badges"

**Android:**
- Settings → Apps → CollEco → Notifications → Enable "App icon badges"
- Long-press app icon → App info → Notifications → Enable badges

### No Vibration

**iOS:**
- Check device is not in Silent mode (switch on side)
- Settings → Sounds & Haptics → Enable vibrations

**Android:**
- Long-press notification → Settings → Enable "Vibrate"
- Check phone is not in Silent/Vibrate mode

### Notifications Delayed

- Check internet connection
- Verify backend is sending notifications
- Check service worker is active (DevTools → Application → Service Workers)
- Try re-subscribing to notifications

---

## Analytics & Tracking

Track notification performance:

```javascript
// Track notification shown
self.addEventListener('push', (event) => {
  // Track in analytics
  fetch('/api/notifications/analytics', {
    method: 'POST',
    body: JSON.stringify({
      action: 'shown',
      type: event.data.type,
      timestamp: Date.now()
    })
  });
});

// Track notification clicked
self.addEventListener('notificationclick', (event) => {
  fetch('/api/notifications/analytics', {
    method: 'POST',
    body: JSON.stringify({
      action: 'clicked',
      type: event.notification.data.type,
      timestamp: Date.now()
    })
  });
});

// Track notification dismissed
self.addEventListener('notificationclose', (event) => {
  fetch('/api/notifications/analytics', {
    method: 'POST',
    body: JSON.stringify({
      action: 'dismissed',
      type: event.notification.data.type,
      timestamp: Date.now()
    })
  });
});
```

**Metrics to Track:**
- Notification delivery rate
- Click-through rate (CTR)
- Dismissal rate
- Time to click
- Device type distribution
- Notification type performance

---

## Component Usage

### Setup Wizard

```jsx
import MobileNotificationSetup from '../components/MobileNotificationSetup';

function App() {
  const [showSetup, setShowSetup] = useState(true);

  return (
    <div>
      {showSetup && (
        <MobileNotificationSetup 
          onComplete={() => setShowSetup(false)} 
        />
      )}
    </div>
  );
}
```

### Send Notification

```jsx
import { useContext } from 'react';
import { NotificationContext } from '../components/NotificationCenter';
import { PushNotificationService } from '../components/NotificationCenter';

function BookingConfirmed() {
  const { addNotification } = useContext(NotificationContext);

  const handleBookingConfirmed = async () => {
    // In-app notification
    addNotification({
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Safari booking for John Doe confirmed',
      actionUrl: '/bookings/BK-12345'
    });

    // Push notification (mobile/desktop)
    await PushNotificationService.sendPushNotification(
      'Booking Confirmed',
      {
        body: 'Safari booking for John Doe confirmed',
        type: 'booking',
        url: '/bookings/BK-12345',
        unreadCount: 1
      }
    );
  };
}
```

---

## Summary

✅ **Mobile push notifications fully supported** on iOS and Android  
✅ **Vibration patterns** customized per notification type  
✅ **CollEco logo badge** in notification bar and home screen  
✅ **Action buttons** for quick interactions  
✅ **Background notifications** work even when app is closed  
✅ **PWA installation** for native-like experience  
✅ **Comprehensive documentation** for setup and troubleshooting  

**CollEco is truly your office in your pocket! 📱💼**

---

**Last Updated:** November 21, 2024  
**Version:** 2.0.0  
**Maintained by:** CollEco Development Team
