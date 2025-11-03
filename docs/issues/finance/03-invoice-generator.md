---
title: Invoice Generator — Auto-generate invoices
labels: enhancement, finance
assignees: ''
---

## Summary
Automatic invoice generation for clients and partners after booking or payout events.

## Roles
- Admin

## Acceptance criteria
- Generate downloadable PDF invoices from booking data.
- Attach invoice to booking emails.

## Tasks
- [ ] Service: Generate invoice PDF from booking object
- [ ] API: GET `/api/finance/invoices/:id`, POST `/api/finance/invoices/generate`
- [ ] Tests: Unit + integration
