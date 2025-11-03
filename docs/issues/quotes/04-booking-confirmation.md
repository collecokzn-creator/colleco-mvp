---
title: Booking Confirmation — Final review and payment
labels: enhancement, bookings, payments
assignees: ''
---

## Summary
Booking confirmation page: final review of charges, guest details, payment panel, and confirmation email.

## Roles
- Admin, Client

## Acceptance criteria
- Show booking line items and total payable
- Integrate payment button / test sandbox
- On success, create booking record and show Booking Tracker entry

## Tasks
- [ ] UI: Booking confirmation page and payment panel
- [ ] API: POST `/api/bookings` (convert quote -> booking), POST `/api/payments/initiate`
- [ ] Tests: Unit + mock payment flow + E2E smoke to payment success
