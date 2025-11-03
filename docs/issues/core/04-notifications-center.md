---
title: Notifications Center — App alerts and preferences
labels: enhancement, core
assignees: ''
---

## Summary
A central notifications center for alerts (bookings, payouts, compliance), with preference toggles and read/unread state.

## Roles
- All

## Acceptance criteria
- Users can view and filter notifications by type and mark read/unread.
- Preference toggles update backend settings.
- Notifications are delivered to the UI when events occur (websocket or polling).

## Tasks
- [ ] UI: Notifications panel and page
- [ ] API: GET/PUT `/api/notifications`, PUT `/api/users/:id/preferences`
- [ ] Backend: Hook event emitters (or mocked polling) for notifications
- [ ] Tests: Unit + integration

