# Quick Start: Partner Communication Features

## 🚀 Get Started in 5 Minutes

---

## 1. Enable Notifications

In your `src/main.jsx`:

```jsx
import { NotificationProvider } from './components/NotificationCenter';

ReactDOM.createRoot(document.getElementById('root')).render(
  <NotificationProvider>
    <App />
  </NotificationProvider>
);
```

## 2. Add Notification Bell to Navbar

In your `src/components/Navbar.jsx` or `src/components/Header.jsx`:

```jsx
import { useState } from 'react';
import { NotificationBell, NotificationCenter } from './NotificationCenter';

function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav>
      {/* Your existing nav items */}
      
      <NotificationBell onClick={() => setShowNotifications(true)} />
      
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </nav>
  );
}
```

## 3. Add Navigation Links

Add these links to your partner navigation:

```jsx
<Link to="/messages">💬 Messages</Link>
<Link to="/collaborations">🤝 Collaborations</Link>
```

## 4. Send Your First Notification

Anywhere in your app:

```jsx
import { useContext } from 'react';
import { NotificationContext } from '../components/NotificationCenter';

function MyComponent() {
  const { addNotification } = useContext(NotificationContext);
  
  const handleBookingCreated = () => {
    addNotification({
      type: 'booking',
      title: 'New Booking',
      message: 'Safari booking confirmed for John Doe',
      actionUrl: '/bookings/123'
    });
  };
  
  return <button onClick={handleBookingCreated}>Create Booking</button>;
}
```

## 5. Send WhatsApp Message

```jsx
import { MessageTemplates } from '../api/whatsappApi';

// Send quote via WhatsApp
await MessageTemplates.sendQuote(
  '+27821234567',
  'https://yoursite.com/quotes/quote_001.pdf',
  'Q-2024-001'
);

// Send booking confirmation
await MessageTemplates.sendBookingConfirmation('+27821234567', {
  bookingNumber: 'BK-12345',
  packageName: '5-Day Safari',
  travelDate: '2024-12-15',
  numberOfTravelers: 4,
  totalAmount: 45000
});
```

## 6. Enable Push Notifications

```jsx
import { PushNotificationService } from '../components/NotificationCenter';

const enablePush = async () => {
  const granted = await PushNotificationService.requestPermission();
  if (granted) {
    console.log('Push notifications enabled!');
  }
};
```

## 7. Send a Chat Message

```jsx
import { sendMessage } from '../api/messaging';

await sendMessage({
  conversationId: 'conv_123',
  recipientId: 'partner_456',
  content: 'Hello! Let\'s collaborate on this package.',
  attachment: null
});
```

---

## Environment Variables

Create `.env` file:

```bash
# WhatsApp (get from Meta Business Suite)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_VERIFY_TOKEN=colleco_verify_token_2024
```

---

## Test It Works

1. **Messages:** Navigate to `/messages` → Start conversation → Send message
2. **Notifications:** Click notification bell → See list → Click notification
3. **Collaborations:** Navigate to `/collaborations` → Create new → Invite partners
4. **WhatsApp:** Send test message to your phone number

---

## Need Help?

📖 Full Documentation: `docs/COMMUNICATION_SYSTEM.md`  
📋 Implementation Summary: `docs/COMMUNICATION_IMPLEMENTATION_SUMMARY.md`  
🐛 Issues: Check browser console for errors  

---

## Common Issues

**Notifications not appearing?**
- Check `NotificationProvider` wraps your app
- Verify browser allows notifications
- Check browser console for errors

**Messages not sending?**
- Verify user is authenticated
- Check API endpoints are configured
- Review network tab in browser DevTools

**WhatsApp failing?**
- Verify environment variables are set
- Check phone number format (+27...)
- Ensure message template is approved in Meta Business Suite
- Review WhatsApp API credentials

---

**You're all set! 🎉**

Partners can now communicate effectively, receive real-time notifications, and collaborate seamlessly on the CollEco platform.
