# Collaboration Integrations Guide

This guide outlines how to connect real channels and systems to the in-app collaboration features.

## WhatsApp

- Recommended: WhatsApp Business API via a provider (Meta Cloud API or BSP)
- Webhook -> map sender/booking -> call postMessage({ channel: 'whatsapp' })
- Outbound -> your backend sends via WhatsApp API; also log as a message in the thread

Payload to post:
```
POST /api/collab/{bookingId}/message
{
  "authorRole": "client|agent|productOwner",
  "authorName": "string",
  "channel": "whatsapp",
  "content": "text",
  "visibility": "all|agent-client|agent-po",
  "mentions": ["client"|"productOwner"]
}
```

## Email & SMS

- Providers: SendGrid / Mailgun, Twilio / Infobip
- Always mirror outbound/inbound as messages in the timeline for single-source-of-truth

## Push Notifications

- Web: Browser Notification API (already stubbed)
- Mobile: FCM or Expo Push; subscribe devices per role and booking

## Voice & Calls

- Simple: add Zoom/Teams links as messages or attachments
- Advanced: integrate a voice SDK (Twilio) and attach call recordings

## Open API (suggested surface)

- POST /api/collab/{bookingId}/message
- POST /api/collab/{bookingId}/attachment
- GET  /api/collab/{bookingId}
- GET  /api/collab -> list threads (with filters)

## Security & Privacy

- Enforce role-based access on server; do not return messages/attachments outside the user's allowed visibility
- Redact PII for product owners when needed
