# CollEco Travel — Page Mapping (Functional Overview)

This document records the app pages, what each page does, which roles can access them, and how pages connect to each other.

## 1 — Core System Pages

- Dashboard
  - Description: Unified summary view (KPIs, alerts, upcoming trips).
  - Accessible by: Admin, Partner, Client, Influencer

- Login / Register
  - Description: Authentication (email, phone, or SSO) with role detection.
  - Accessible by: All

- Profile Settings
  - Description: Manage personal or business info, documents, preferences.
  - Accessible by: All

- Notifications Center
  - Description: App-wide alerts (bookings, payouts, compliance).
  - Accessible by: All

- Help & Support
  - Description: Contact, FAQ, live chat.
  - Accessible by: All

Link flow: Login → Dashboard → Role Tools → Profile / Support

---

## 2 — Quotes & Bookings Module

- Quote Builder
  - Description: Generate multi-product quotes (flights, hotels, tours, cars).
  - Accessible by: Admin, Partner, Client

- Quote List / Manager
  - Description: View, edit, approve quotes.
  - Accessible by: Admin, Partner

- Booking Tracker
  - Description: Shows booking status and progress.
  - Accessible by: Admin, Partner, Client

- Booking Confirmation
  - Description: Final review + payment page.
  - Accessible by: Admin, Client

- Abandoned Quotes
  - Description: Re-engagement automation for follow-ups.
  - Accessible by: Admin

Link flow: Quote Builder → Quote List → Booking Confirmation → Booking Tracker

---

## 3 — Itinerary & Travel Management

- Itinerary Builder
  - Description: Create/edit itinerary (day-by-day).
  - Accessible by: Admin, Partner

- Itinerary Viewer
  - Description: Client-facing itinerary (visuals, maps, times).
  - Accessible by: Client

- Itinerary Collaboration
  - Description: Shared notes/chat between CollEco, partner, client.
  - Accessible by: Admin, Partner, Client

- Safety & Emergency Info
  - Description: Embedded contacts, insurance, safety protocols.
  - Accessible by: Client

Link flow: Quote → Itinerary → Client Itinerary Viewer

---

## 4 — Partner Management Module

- Partner Directory
  - Description: List of active partners.
  - Accessible by: Admin

- Partner Profile
  - Description: Partner details + product list.
  - Accessible by: Admin, Partner

- Product Manager
  - Description: Add/edit products (rooms, tours, cars).
  - Accessible by: Partner

- Partner Compliance
  - Description: Upload and verify documents.
  - Accessible by: Partner, Admin

- Partner Analytics
  - Description: Booking and revenue insights.
  - Accessible by: Partner, Admin

Link flow: Partner Profile → Product Manager → Compliance Tracker

---

## 5 — Finance & Payments

- Revenue Dashboard
  - Description: View service fee and commission totals.
  - Accessible by: Admin

- Payout Center
  - Description: Partner and Influencer payout management.
  - Accessible by: Admin, Partner, Influencer

- Invoice Generator
  - Description: Auto-generate client and partner invoices.
  - Accessible by: Admin

- Transaction Logs
  - Description: Track all payments and deductions.
  - Accessible by: Admin, Partner

- Service Fee Config
  - Description: Adjust CollEco fee tiers.
  - Accessible by: Admin

Link flow: Booking Confirmation → Payment → Payout Center → Reports

---

## 6 — Marketing & Promotions

- Campaign Manager
  - Description: Create & manage promotions.
  - Accessible by: Admin

- Partner Promotions
  - Description: Partners create limited-time offers.
  - Accessible by: Partner

- Featured Listings
  - Description: Paid exposure management.
  - Accessible by: Admin, Partner

- Content Hub
  - Description: Influencers upload destination media.
  - Accessible by: Admin, Influencer

- Affiliate Tracker
  - Description: Referral & campaign analytics.
  - Accessible by: Admin, Influencer

Link flow: Campaign Manager → Partner Promotions → Content Hub

---

## 7 — Client Management

- Client Directory
  - Description: View and manage registered clients.
  - Accessible by: Admin

- Client Profile
  - Description: Full client info, preferences, bookings.
  - Accessible by: Admin, Client

- Trip History
  - Description: Past and upcoming trips.
  - Accessible by: Client

- Feedback & Reviews
  - Description: Submit or view feedback.
  - Accessible by: Client, Admin

Link flow: Client Directory → Client Profile → Trip History

---

## 8 — Influencer / Affiliate Management

- Influencer Dashboard
  - Description: Overview of campaigns and performance.
  - Accessible by: Influencer

- Content Uploads
  - Description: Submit/manage approved content.
  - Accessible by: Influencer

- Affiliate Tracker
  - Description: View clicks, signups, conversions.
  - Accessible by: Influencer, Admin

- Earnings Summary
  - Description: Track affiliate commissions.
  - Accessible by: Influencer

- Partner Leads
  - Description: Submit partnership requests.
  - Accessible by: Influencer

Link flow: Influencer Dashboard → Content Upload → Earnings Tracker

---

## 9 — System & Settings

- Role Management
  - Description: Assign/edit role permissions.
  - Accessible by: Admin

- API Integration Hub
  - Description: Manage external service connections.
  - Accessible by: Admin

- System Logs
  - Description: Track backend and UI activity.
  - Accessible by: Admin

- Theme Settings
  - Description: Branding, theme colors, logo.
  - Accessible by: Admin

- White-Label Config
  - Description: Co-branded settings for agents.
  - Accessible by: Admin

Link flow: System Settings → Role Management → API Hub

---

## Page Connection Summary (Ecosystem Flow)

Login
  ↓
Dashboard
  ↓
Quotes → Booking → Itinerary
  ↓
Payments → Finance
  ↓
Partner / Client / Influencer Tools
  ↓
Reports & Analytics

---

## Next steps
- Convert these page mappings into ticket-sized tasks (UI, API, tests).
- Add acceptance criteria and wireframes for priority pages:
  - Start with Core System and Quotes/Bookings modules.
- Add RBAC rules and API contracts per page (if not already present).

