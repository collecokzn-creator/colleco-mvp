# CollEco Communication & Collaboration System

## Complete Guide to Partner Communication Features

---

## Table of Contents

1. [Overview](#overview)
2. [Real-Time Chat & Messaging](#real-time-chat--messaging)
3. [Notification System](#notification-system)
4. [WhatsApp Integration](#whatsapp-integration)
5. [Partner Collaboration](#partner-collaboration)
6. [WebSocket Implementation](#websocket-implementation)
7. [API Reference](#api-reference)
8. [Setup & Configuration](#setup--configuration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The CollEco platform provides comprehensive communication and collaboration tools to enable seamless interaction between partners, clients, and team members.

### Key Features

✅ **Real-time Chat** - Instant messaging between partners and clients  
✅ **Push Notifications** - Browser and mobile push alerts  
✅ **WhatsApp Integration** - Send quotes, confirmations, and messages via WhatsApp  
✅ **Partner Collaboration** - Multi-partner booking workflows  
✅ **In-App Notifications** - Toast and dropdown notifications  
✅ **File Sharing** - Attach documents, images, PDFs  
✅ **Read Receipts** - Track message delivery and read status  
✅ **Typing Indicators** - See when someone is typing  

### Communication Channels

| Channel | Use Case | Implementation |
|---------|----------|----------------|
| **In-App Chat** | Partner-to-partner, Partner-to-client messaging | ChatBox component + WebSocket |
| **WhatsApp** | Client communication, booking confirmations | WhatsApp Business API |
| **Email** | Formal quotes, invoices, itineraries | Email API |
| **SMS** | Quick alerts, OTPs | SMS Gateway |
| **Push Notifications** | Real-time alerts when app is closed | Service Worker + Push API |
| **In-App Notifications** | Activity updates within the app | NotificationCenter component |

---

## Real-Time Chat & Messaging

### Components

#### 1. MessagingCenter

Central hub for all conversations.

**Location:** `src/components/MessagingCenter.jsx`

**Features:**
- Conversation list with unread counts
- Partner directory
- Search and filtering
- Quick actions

**Usage:**

```jsx
import MessagingCenter from '../components/MessagingCenter';

function App() {
  return <MessagingCenter />;
}
```

**Access:** Available at `/messages` route for all authenticated users.

#### 2. ChatBox

Individual conversation interface.

**Location:** `src/components/ChatBox.jsx`

**Features:**
- Thread-based messaging
- File attachments (images, PDFs)
- Emoji support
- Message search
- Read receipts
- Typing indicators

**Props:**

```jsx
<ChatBox
  conversationId="conv_123"
  recipientId="partner_456"
  recipientName="Sunshine Hotels"
  onClose={() => setActiveChat(null)}
/>
```

### Message Types

#### Text Message

```javascript
{
  id: "msg_12345",
  conversationId: "conv_123",
  senderId: "user_789",
  senderName: "John Doe",
  recipientId: "partner_456",
  content: "Hello! I'd like to discuss a collaboration.",
  attachment: null,
  timestamp: "2024-11-21T10:30:00Z",
  read: false
}
```

#### Message with Attachment

```javascript
{
  id: "msg_12346",
  conversationId: "conv_123",
  senderId: "user_789",
  content: "Here's the quote for your review",
  attachment: {
    name: "Quote_2024_001.pdf",
    type: "application/pdf",
    url: "https://storage.colleco.com/files/quote_001.pdf"
  },
  timestamp: "2024-11-21T10:32:00Z",
  read: false
}
```

### Starting a Conversation

```javascript
import { sendMessage } from '../api/messaging';

const startConversation = async (partnerId, message) => {
  const conversationId = generateConversationId(currentUserId, partnerId);
  
  await sendMessage({
    conversationId,
    recipientId: partnerId,
    content: message
  });
};
```

### File Attachments

**Supported Types:**
- Images: PNG, JPG, GIF (max 5MB)
- Documents: PDF, DOC, DOCX (max 10MB)

**Upload Flow:**

```javascript
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  
  // Validate size
  if (file.size > 10 * 1024 * 1024) {
    alert('File must be less than 10MB');
    return;
  }
  
  // Convert to base64 for preview
  const reader = new FileReader();
  reader.onload = (event) => {
    setAttachment({
      name: file.name,
      type: file.type,
      url: event.target.result
    });
  };
  reader.readAsDataURL(file);
};
```

---

## Notification System

### Components

#### NotificationCenter

Dropdown panel showing all notifications.

**Location:** `src/components/NotificationCenter.jsx`

**Features:**
- Filter by type (all, unread, bookings, messages, quotes)
- Mark as read
- Delete notifications
- Action links

#### NotificationBell

Bell icon with unread badge for navbar.

```jsx
import { NotificationBell, NotificationCenter } from '../components/NotificationCenter';

function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  
  return (
    <>
      <NotificationBell onClick={() => setShowNotifications(true)} />
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}
```

#### ToastNotification

Pop-up toast for real-time alerts.

```jsx
import { ToastNotification } from '../components/NotificationCenter';

<ToastNotification
  notification={{
    type: 'success', // success, error, warning, info
    title: 'Booking Confirmed',
    message: 'Your booking has been successfully confirmed.'
  }}
  onClose={() => setToast(null)}
/>
```

### NotificationContext

Global state management for notifications.

**Setup:**

```jsx
import { NotificationProvider } from '../components/NotificationCenter';

function App() {
  return (
    <NotificationProvider>
      {/* Your app components */}
    </NotificationProvider>
  );
}
```

**Usage:**

```javascript
import { useContext } from 'react';
import { NotificationContext } from '../components/NotificationCenter';

function MyComponent() {
  const { addNotification } = useContext(NotificationContext);
  
  const handleBookingConfirmed = () => {
    addNotification({
      type: 'booking',
      title: 'New Booking',
      message: 'You have a new booking request from John Doe',
      actionUrl: '/bookings/123'
    });
  };
}
```

### Notification Types

| Type | Icon | Use Case | Color |
|------|------|----------|-------|
| `booking` | 📋 | New bookings, booking updates | Green |
| `message` | 💬 | New messages, replies | Blue |
| `quote` | 📄 | Quote requests, quote updates | Purple |
| `payment` | 💰 | Payment received, payment due | Yellow |
| `alert` | ⚠️ | Urgent alerts, warnings | Red |
| `system` | ℹ️ | System updates, maintenance | Gray |

### Push Notifications

Browser push notifications for real-time alerts.

**Request Permission:**

```javascript
import { PushNotificationService } from '../components/NotificationCenter';

const enablePushNotifications = async () => {
  const granted = await PushNotificationService.requestPermission();
  
  if (granted) {
    await PushNotificationService.subscribeToNotifications(userId);
    console.log('Push notifications enabled');
  }
};
```

**Send Push Notification:**

```javascript
await PushNotificationService.sendPushNotification(
  'New Booking Request',
  {
    body: 'You have a new booking from Safari Adventures',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    url: '/bookings/456'
  }
);
```

---

## WhatsApp Integration

### WhatsApp Business API Setup

**Prerequisites:**
1. WhatsApp Business API account
2. Verified business phone number
3. Facebook Business Manager account
4. Message templates approved by WhatsApp

**Environment Variables:**

```bash
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token
```

### Sending Messages

#### Template Message

Pre-approved templates for booking confirmations, payment receipts, etc.

```javascript
import { sendTemplateMessage } from '../api/whatsappApi';

await sendTemplateMessage(
  '+27821234567', // Recipient phone
  'booking_confirmation', // Template name
  ['John Doe', 'BK-12345', '2024-12-15'] // Parameters
);
```

#### Text Message

Free-form text (requires 24-hour session window).

```javascript
import { sendTextMessage } from '../api/whatsappApi';

await sendTextMessage(
  '+27821234567',
  'Thank you for your booking! We will send you the itinerary shortly.'
);
```

#### Document (Quote/Invoice)

```javascript
import { sendDocument } from '../api/whatsappApi';

await sendDocument(
  '+27821234567',
  'https://storage.colleco.com/quotes/quote_001.pdf',
  'Quote_2024_001.pdf',
  'Here is your travel quote. Valid for 14 days.'
);
```

#### Interactive Buttons

```javascript
import { sendInteractiveButtons } from '../api/whatsappApi';

await sendInteractiveButtons(
  '+27821234567',
  'Would you like to proceed with this booking?',
  [
    { id: 'accept', title: 'Yes, Book Now' },
    { id: 'modify', title: 'Request Changes' },
    { id: 'decline', title: 'Not Interested' }
  ]
);
```

### Pre-Built Templates

The `MessageTemplates` object provides ready-to-use functions:

#### Send Booking Confirmation

```javascript
import { MessageTemplates } from '../api/whatsappApi';

await MessageTemplates.sendBookingConfirmation('+27821234567', {
  bookingNumber: 'BK-12345',
  packageName: '5-Day Safari Adventure',
  travelDate: '2024-12-15',
  numberOfTravelers: 4,
  totalAmount: 45000
});
```

#### Send Quote

```javascript
await MessageTemplates.sendQuote(
  '+27821234567',
  'https://storage.colleco.com/quotes/quote_001.pdf',
  'Q-2024-001'
);
```

#### Send Itinerary

```javascript
await MessageTemplates.sendItinerary(
  '+27821234567',
  'https://storage.colleco.com/itineraries/itin_001.pdf',
  'Cape Town Adventure'
);
```

#### Send Payment Reminder

```javascript
await MessageTemplates.sendPaymentReminder(
  '+27821234567',
  'BK-12345',
  15000,
  '2024-11-30'
);
```

#### Send Collaboration Request

```javascript
await MessageTemplates.sendCollaborationRequest(
  '+27821234567', // Partner phone
  'Sunshine Hotels',
  {
    packageName: 'Corporate Retreat Package',
    dates: '2024-12-10 to 2024-12-15',
    numberOfGuests: 25
  }
);
```

### Webhook Handling

**Webhook Endpoint:** `/api/webhooks/whatsapp`

**Verification (GET request):**

```javascript
import { verifyWebhook } from '../api/whatsappApi';

app.get('/api/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  const result = verifyWebhook(mode, token, challenge);
  
  if (result) {
    res.status(200).send(result);
  } else {
    res.sendStatus(403);
  }
});
```

**Message Handling (POST request):**

```javascript
import { handleWhatsAppWebhook } from '../api/whatsappApi';

app.post('/api/webhooks/whatsapp', async (req, res) => {
  const webhookData = req.body;
  
  const result = await handleWhatsAppWebhook(webhookData);
  
  if (result.type === 'message') {
    // Handle incoming message
    console.log('Received message:', result.text, 'from:', result.from);
    
    // Store in database, trigger notifications, etc.
  } else if (result.type === 'status') {
    // Handle message status update
    console.log('Message', result.messageId, 'status:', result.status);
  }
  
  res.sendStatus(200);
});
```

### WhatsApp Message Status

| Status | Description |
|--------|-------------|
| `sent` | Message sent to WhatsApp servers |
| `delivered` | Message delivered to recipient's device |
| `read` | Recipient opened the message |
| `failed` | Message failed to send |

---

## Partner Collaboration

### PartnerCollaboration Component

Multi-partner booking and package building workspace.

**Location:** `src/components/PartnerCollaboration.jsx`

**Features:**
- Create multi-partner packages
- Invite partners to collaborate
- Define service responsibilities
- Commission split management
- Real-time collaboration chat
- Approval workflows

### Creating a Collaboration

```javascript
const createCollaboration = () => {
  const collaboration = {
    title: '5-Day Safari Package',
    description: 'Corporate group safari with luxury accommodation',
    bookingId: 'BK-12345',
    selectedPartners: ['hotel_001', 'safari_002', 'transport_003'],
    services: [
      {
        type: 'Accommodation',
        provider: 'hotel_001',
        description: '4 nights at luxury lodge',
        cost: 20000,
        markup: 5000,
        responsibility: 'hotel_001'
      },
      {
        type: 'Safari Activities',
        provider: 'safari_002',
        description: 'Daily game drives and bush walks',
        cost: 15000,
        markup: 3000,
        responsibility: 'safari_002'
      },
      {
        type: 'Transport',
        provider: 'transport_003',
        description: 'Airport transfers and game drive vehicles',
        cost: 8000,
        markup: 2000,
        responsibility: 'transport_003'
      }
    ],
    commissionSplit: 'equal'
  };
  
  // Save collaboration
};
```

### Commission Split Models

#### Equal Split

All partners receive equal commission.

```javascript
commissionSplit: 'equal'
```

#### Percentage Based

Define percentage per partner.

```javascript
commissionSplit: 'percentage',
customSplit: {
  'hotel_001': 40,
  'safari_002': 35,
  'transport_003': 25
}
```

#### Fixed Amounts

Define fixed amounts per partner.

```javascript
commissionSplit: 'fixed',
customSplit: {
  'hotel_001': 4000,
  'safari_002': 3500,
  'transport_003': 2500
}
```

### Collaboration Workflows

#### 1. Invitation Workflow

```mermaid
Partner A creates collaboration
→ Invites Partner B, C, D
→ Partners receive notification
→ Partners accept/decline
→ Collaboration becomes active
```

#### 2. Service Definition

Each partner defines their contribution:
- Service type
- Description
- Cost
- Markup
- Delivery dates

#### 3. Approval Process

- All partners review the package
- Partners approve/request changes
- Once all approve, collaboration is active
- Package can be offered to clients

### Collaboration Status

| Status | Description |
|--------|-------------|
| `pending` | Awaiting partner responses |
| `active` | All partners accepted, collaboration ongoing |
| `completed` | Booking fulfilled, package delivered |
| `cancelled` | Collaboration cancelled |

---

## WebSocket Implementation

### WebSocketManager Class

Handles real-time bidirectional communication.

**Location:** `src/api/messaging.js`

**Features:**
- Auto-reconnection with exponential backoff
- Message handlers
- Connection status tracking
- Heartbeat/ping-pong

### Usage

```javascript
import { WebSocketManager } from '../api/messaging';

const wsManager = new WebSocketManager(userId);

// Connect
wsManager.connect();

// Listen for messages
wsManager.onMessage((data) => {
  if (data.type === 'new_message') {
    console.log('New message:', data.message);
    // Update UI
  } else if (data.type === 'typing') {
    console.log(data.userName, 'is typing...');
  }
});

// Listen for connection status
wsManager.onStatusChange((status) => {
  if (status === 'connected') {
    console.log('Connected to server');
  } else if (status === 'disconnected') {
    console.log('Disconnected, attempting reconnection...');
  } else if (status === 'failed') {
    console.log('Failed to connect');
  }
});

// Send message
wsManager.send({
  type: 'message',
  conversationId: 'conv_123',
  content: 'Hello!'
});

// Disconnect
wsManager.disconnect();
```

### Message Types

#### New Message

```javascript
{
  type: 'new_message',
  message: {
    id: 'msg_12345',
    conversationId: 'conv_123',
    senderId: 'user_789',
    content: 'Hello!',
    timestamp: '2024-11-21T10:30:00Z'
  }
}
```

#### Typing Indicator

```javascript
{
  type: 'typing',
  conversationId: 'conv_123',
  userId: 'user_789',
  userName: 'John Doe'
}
```

#### Read Receipt

```javascript
{
  type: 'read_receipt',
  messageId: 'msg_12345',
  userId: 'user_456',
  timestamp: '2024-11-21T10:32:00Z'
}
```

#### Notification

```javascript
{
  type: 'notification',
  notification: {
    title: 'New Booking',
    message: 'You have a new booking request',
    actionUrl: '/bookings/123'
  }
}
```

---

## API Reference

### Messaging Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Send a message |
| GET | `/api/conversations/:id` | Get conversation by ID |
| GET | `/api/users/:id/conversations` | Get user's conversations |
| POST | `/api/conversations/:id/read` | Mark messages as read |
| POST | `/api/messages/attachments` | Upload attachment |

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id/notifications` | Get notifications |
| POST | `/api/notifications` | Create notification |
| POST | `/api/notifications/:id/read` | Mark as read |
| POST | `/api/notifications/push/subscribe` | Subscribe to push |

### Collaboration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/collaborations` | Create collaboration |
| GET | `/api/users/:id/collaborations` | Get collaborations |
| PUT | `/api/collaborations/:id/status` | Update status |
| POST | `/api/collaborations/:id/messages` | Add message |

### WhatsApp Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/whatsapp/send-template` | Send template message |
| POST | `/api/whatsapp/send-text` | Send text message |
| POST | `/api/whatsapp/send-document` | Send document |
| GET/POST | `/api/webhooks/whatsapp` | WhatsApp webhook |

---

## Setup & Configuration

### 1. Environment Variables

Create `.env` file:

```bash
# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# SMS
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=CollEco

# WebSocket
WS_PORT=8080
```

### 2. Install Dependencies

```bash
npm install ws socket.io axios
```

### 3. Configure Notification Context

In `src/main.jsx`:

```jsx
import { NotificationProvider } from './components/NotificationCenter';

ReactDOM.createRoot(document.getElementById('root')).render(
  <NotificationProvider>
    <App />
  </NotificationProvider>
);
```

### 4. Add Routes

In `src/config/pages.json`:

```json
{
  "path": "/messages",
  "component": "MessagingCenter",
  "requiresAuth": true,
  "roles": ["admin", "partner", "agent"]
},
{
  "path": "/collaborations",
  "component": "PartnerCollaboration",
  "requiresAuth": true,
  "roles": ["admin", "partner"]
}
```

### 5. Setup Service Worker (for Push Notifications)

Create `public/sw.js`:

```javascript
self.addEventListener('push', event => {
  const data = event.data.json();
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: data.vibrate,
    data: {
      url: data.url
    }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

Register in `src/main.jsx`:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## Best Practices

### 1. Message Etiquette

- Be professional and respectful
- Keep messages concise and clear
- Use attachments for detailed information
- Respond within 24 hours
- Use WhatsApp for urgent client communication

### 2. Notification Management

- Don't spam users with notifications
- Allow users to configure notification preferences
- Group related notifications
- Use appropriate notification types
- Include actionable links in notifications

### 3. WhatsApp Guidelines

- Get user consent before messaging
- Use approved message templates
- Don't send marketing messages outside 24-hour window
- Respect WhatsApp's commerce policies
- Include opt-out option in template messages

### 4. Collaboration Best Practices

- Define clear roles and responsibilities
- Document all agreements
- Communicate commission splits upfront
- Use collaboration chat for transparency
- Approve packages before offering to clients

### 5. Performance Optimization

- Lazy load chat history (pagination)
- Compress file attachments
- Cache frequently accessed conversations
- Debounce typing indicators
- Use WebSocket for real-time features only

### 6. Security

- Encrypt sensitive messages
- Validate file uploads (type, size)
- Sanitize user input
- Use HTTPS for all API calls
- Implement rate limiting

---

## Troubleshooting

### Chat Issues

#### Messages not sending

**Problem:** Messages appear stuck or not delivering

**Solutions:**
1. Check WebSocket connection status
2. Verify API endpoint is reachable
3. Check browser console for errors
4. Ensure user is authenticated
5. Verify recipient ID is valid

#### Messages not appearing in real-time

**Problem:** Messages only appear after page refresh

**Solutions:**
1. Verify WebSocket connection is active
2. Check message handlers are registered
3. Ensure conversation ID matches
4. Check for JavaScript errors in console

### WhatsApp Issues

#### Template messages failing

**Problem:** Template message API returns error

**Solutions:**
1. Verify template is approved in Meta Business Suite
2. Check template name spelling
3. Ensure parameter count matches template
4. Verify phone number format (+27...)
5. Check API access token is valid

#### Webhook not receiving messages

**Problem:** WhatsApp webhook endpoint not being called

**Solutions:**
1. Verify webhook URL is publicly accessible (not localhost)
2. Check verify token matches
3. Ensure endpoint returns 200 status
4. Check Meta Business Suite webhook configuration
5. Review webhook logs in Meta Business Suite

### Notification Issues

#### Push notifications not appearing

**Problem:** Browser push notifications not showing

**Solutions:**
1. Check notification permission is granted
2. Verify service worker is registered
3. Check browser supports notifications (Chrome, Firefox, Edge)
4. Ensure site is HTTPS (required for push)
5. Check notification payload is valid

#### Notification bell not updating

**Problem:** Unread count not updating

**Solutions:**
1. Verify NotificationContext is provided
2. Check addNotification is being called
3. Ensure localStorage is not blocked
4. Check React state updates are triggered
5. Verify notification type is valid

### WebSocket Issues

#### Frequent disconnections

**Problem:** WebSocket keeps disconnecting and reconnecting

**Solutions:**
1. Check server WebSocket implementation
2. Verify network stability
3. Increase reconnection delay
4. Check for proxy/firewall issues
5. Ensure server sends ping/pong heartbeats

#### Messages delayed or lost

**Problem:** WebSocket messages arrive late or not at all

**Solutions:**
1. Check server message queue
2. Verify connection is open before sending
3. Implement message acknowledgments
4. Check for network congestion
5. Use message persistence (database backup)

### Collaboration Issues

#### Partners not receiving invitations

**Problem:** Collaboration invites not arriving

**Solutions:**
1. Check notification system is working
2. Verify partner ID is correct
3. Ensure partner has valid email/phone
4. Check spam/junk folders
5. Try resending invitation

#### Commission calculations incorrect

**Problem:** Commission split math doesn't add up

**Solutions:**
1. Verify commission split model (equal/percentage/fixed)
2. Check custom split values sum correctly
3. Ensure service costs are accurate
4. Review markup calculations
5. Check for rounding errors

---

## Support & Resources

### Documentation
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [WebSocket API MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

### Getting Help
- Email: dev@colleco.com
- Slack: #colleco-dev
- GitHub Issues: github.com/colleco/mvp/issues

### Feature Requests
Submit feature requests via GitHub Issues with label `enhancement`.

---

## Changelog

### v1.0.0 (2024-11-21)
- ✅ Real-time chat and messaging
- ✅ Notification center with push support
- ✅ WhatsApp Business API integration
- ✅ Partner collaboration workspace
- ✅ WebSocket implementation
- ✅ File attachments
- ✅ Read receipts and typing indicators

### Coming Soon
- 🔄 Voice/video calls
- 🔄 Screen sharing for collaboration
- 🔄 Advanced search and filtering
- 🔄 Message translation
- 🔄 Emoji reactions
- 🔄 Message pinning
- 🔄 Scheduled messages

---

**Last Updated:** November 21, 2024  
**Version:** 1.0.0  
**Maintained by:** CollEco Development Team
