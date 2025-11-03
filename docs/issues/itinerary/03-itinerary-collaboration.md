---
title: Itinerary Collaboration — Shared notes & chat
labels: enhancement, collaboration
assignees: ''
---

## Summary
Shared collaboration tools (comments, change requests, lightweight chat) attached to an itinerary or booking.

## Roles
- Admin, Partner, Client

## Acceptance criteria
- Users can post comments on itinerary items and receive notifications.
- Simple presence (who's viewing) and threaded notes supported.

## Tasks
- [ ] UI: Collaboration panel and comment components
- [ ] API: POST/GET `/api/itineraries/:id/comments`, websocket or polling support
- [ ] Tests: Unit + integration

