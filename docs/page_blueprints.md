# Page & Tool Blueprints

This document defines the high-level page and tool blueprints for CollEco. Each page includes:
- Purpose
- Primary roles
- Key UI elements
- Actions and flows
- Backend links / data contracts
- Edge cases and error handling
- Acceptance criteria

---

## Batch 1 — Core Travel Functions

### Quotes (Admin / Partner)
Purpose
- Manage price quotes for clients. Create, edit, send, convert to bookings.
Primary roles
- Admin, Agent, Partner (DMC)
Key UI elements
- Header: "Quotes" + action "Create New Quote"
- Table: Client Name, Created At, Status, Total, Actions
- Action buttons per row: View, Edit, Convert to Booking, Send to Client
- Filters: Date range, Partner, Status, Destination
- Side tools: Quick filters, Export CSV, Notes panel
Actions & flows
- Create -> opens modal or page to select products, set prices, add margins -> save as Draft
- Edit -> in-place modal; changes tracked in history
- Send -> sends email/SMS with link -> sets status "Sent"
- Convert to Booking -> creates booking via /api/bookings, opens Payment panel
Backend links / data contracts
- GET /api/quotes?filters -> list
- POST /api/quotes -> create
- PUT /api/quotes/:id -> update
- POST /api/quotes/:id/send -> send to client
Edge cases
- Missing client contact info on Send
- Price conflicts if product rates changed since quote created
Acceptance criteria
- Create/Edit/Send/Convert work and change status accordingly
- Creation stores a snapshot of product rates used

### Bookings (Admin / Client)
Purpose
- Central place showing confirmed and pending bookings
Primary roles
- Admin, Client, Agent
Key UI elements
- List of bookings with status badges (PendingPayment, Confirmed, Cancelled)
- Booking detail view with items, pricing, messages (collab thread)
- Actions: View invoice, Download PDF, Request change, Cancel
- Payment panel for pending bookings (uses PaymentButton)
Backend links
- GET /api/bookings, GET /api/bookings/:id
- POST /api/bookings (already implemented)
- POST /api/payments/webhook
Edge cases
- Partial payments, failed webhook notifications, duplicate bookings
Acceptance criteria
- Booking list shows correct status after payment flow
- PaymentSuccess displays pricing breakdown

### Itineraries
Purpose
- Build and view client itineraries (multi-day plans)
Primary roles
- Agent, Client
Key UI elements
- Day-by-day timeline, map view, add/remove activities, total cost
- Actions: Publish itinerary, Export PDF, Send to client
Backend links
- GET/PUT /api/itineraries
Edge cases
- Offline edits, merging concurrent edits
Acceptance criteria
- Itinerary modifications persist and generate correct totals

---

## Batch 2 — Partner Functions

### Products (Partner Admin)
Purpose
- Manage partner product catalog (rooms, tours, cars)
Primary roles
- Partner admin, DMC
Key UI elements
- Product list, search, product editor, availability calendar
- Actions: Create product, Update rates, Delete, Bulk import
Backend links
- GET /api/providers/:id/products
- POST/PUT /api/providers/:id/products
Edge cases
- Rate overlap, invalid availability windows
Acceptance criteria
- Products CRUD works and availability updates reflect in search

### Leads & Performance
Purpose
- View incoming leads and partner performance dashboards
Primary roles
- Partner admin, CollEco operations
Key UI elements
- Leads list, lead detail modal, conversion funnel charts, booking counts
- Actions: Claim lead, Allocate to agent, Mark as contacted
Backend links
- GET /api/leads
- POST /api/leads/:id/claim
Acceptance criteria
- Lead states transition correctly and performance metrics updated

### Payouts
Purpose
- Partner payout schedule, commission statements
Primary roles
- Finance, Partner admin
Key UI elements
- Statement list, filters, payout preview, export CSV, Request instant payout
- Actions: Trigger payout, Download statement
Backend links
- GET /api/finance/statements
- POST /api/finance/payout
Acceptance criteria
- Commission calculations match pricingEngine outputs

---

## Batch 3 — Finance & Admin

### Reports
Purpose
- Aggregate revenue, fees, partner commissions, refunds
Primary roles
- Finance, Admin
Key UI elements
- KPIs (Gross sales, Fees collected, Commissions deducted), time-range picker
- Export controls (CSV, PDF)
Backend links
- GET /api/finance/summary?start=&end=
Acceptance criteria
- Numbers reconcile with booking.pricing and payout statements

### Commission Tier Management
Purpose
- Manage commission tiers (Bronze/Silver/Gold/Platinum)
Primary roles
- Finance, Admin
Key UI elements
- Tier table (range, rate, notes), edit modal, history/audit
- Actions: Update tier, Save, Recompute partner tiers
Backend links
- GET/PUT /api/admin/commission-tiers
- POST /api/admin/recompute-tiers
Acceptance criteria
- Tier edits persist and recompute endpoint updates partner records

---

## Batch 4 — Marketing & Engagement

### Campaigns & Promotions
Purpose
- Create marketing campaigns and assign featured partner slots
Primary roles
- Marketing, Admin
Key UI elements
- Campaign list, create/edit flow, preview, promotion calendar
- Actions: Schedule campaign, assign partners, track CTR
Backend links
- GET/POST /api/marketing/campaigns
Acceptance criteria
- Campaigns schedule correctly and front-end shows featured banners

---

## Batch 5 — Client Tools

### My Trips
Purpose
- Personal dashboard for clients: upcoming trips, past trips, saved quotes
Primary roles
- Client
Key UI elements
- Trip cards, reorder, share, download itinerary
Backend links
- GET /api/clients/:id/trips
Acceptance criteria
- Client can view trips and open itinerary or booking detail

### Notifications & Preferences
Purpose
- Manage email/SMS preferences, notification center
Primary roles
- Client, Admin
Key UI elements
- Toggle preferences, notification list, mark as read
Backend links
- GET/PUT /api/clients/:id/preferences
Acceptance criteria
- Preferences persist and affect notifications delivered

---

## Cross-cutting concerns
- RBAC: All endpoints respect role and API_TOKEN where applicable
- Webhooks: Payment provider webhooks map to /api/payments/webhook
- Auditing: Admin actions (tier changes, payouts) recorded to audit log
- Tests: Each blueprint should include at least one integration test and one E2E smoke scenario

---

## Next steps
1. Review and prioritize batches (start with Core Travel + Finance)
2. For each page, convert blueprints to ticket-sized implementation tasks (UI, API, tests)
3. Add minimal UI wireframes (optional) and acceptance tests


*** End of blueprints
