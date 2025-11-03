---
title: Quote Builder — Multi-product quote creation
labels: enhancement, quotes
assignees: ''
---

## Summary
Implement the Quote Builder to assemble flights, hotels, tours, cars and extras into a single quote.

## Roles
- Admin, Partner, Client

## Acceptance criteria
- Add multiple product rows with pricing, supplier, and markup controls.
- Calculate totals and margins.
- Save as Draft, Send to Client, or Convert to Booking.

## Tasks
- [ ] UI: Quote builder page and product picker
- [ ] API: POST `/api/quotes` (store snapshot of product rates)
- [ ] Tests: Unit + integration for pricing calculations

## Notes
- Preserve idempotencyKey when converting to booking to avoid duplicates.
