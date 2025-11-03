---
title: Quote List / Manager — View, edit, approve quotes
labels: enhancement, quotes
assignees: ''
---

## Summary
List and manage quotes: search, filter, approve, send and convert to bookings.

## Roles
- Admin, Partner

## Acceptance criteria
- Quote list with filters and actions per row: View, Edit, Send, Convert
- Bulk export and quick filters

## Tasks
- [ ] UI: Quote list page
- [ ] API: GET `/api/quotes?filters`, POST `/api/quotes/:id/send`, PUT `/api/quotes/:id`
- [ ] Tests: Unit + integration
