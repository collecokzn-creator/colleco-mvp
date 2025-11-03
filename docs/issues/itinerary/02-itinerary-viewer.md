---
title: Itinerary Viewer — Client-facing itinerary
labels: enhancement, itinerary
assignees: ''
---

## Summary
Client-facing itinerary viewer with visuals, maps, timing, and the ability to download or share.

## Roles
- Client

## Acceptance criteria
- Clients can view published itineraries via a share link.
- Viewer shows day-by-day breakdown, map, contact/safety info.
- Responsive layout for mobile.

## Tasks
- [ ] UI: Viewer page and share link handling
- [ ] API: GET `/api/itineraries/:id/public` for published itineraries
- [ ] Tests: Unit + E2E smoke
