---
title: Itinerary Builder — Create & edit itineraries
labels: enhancement, itinerary
assignees: ''
---

## Summary
Create an Itinerary Builder to design day-by-day plans with activities, transport, and timing. Support maps, images, and pricing per activity.

## Roles
- Admin, Partner

## Acceptance criteria
- Create multi-day itineraries with drag/drop day items.
- Save, publish, and export to PDF.
- Published itineraries generate a client-viewable share link.

## Tasks
- [ ] UI: Itinerary Builder page with day timeline and map view
- [ ] API: GET/PUT `/api/itineraries/:id`, POST `/api/itineraries`
- [ ] Tests: Unit + integration and E2E smoke

## Notes
- Keep itinerary data normalized (days -> activities -> resources)
