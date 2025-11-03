---
title: Dashboard — Unified summary view
labels: enhancement, core
assignees: ''
---

## Summary
Create the Dashboard page: a unified summary with KPIs, alerts, upcoming trips and quick actions tailored by role.

## Roles
- Admin, Partner, Client, Influencer

## Acceptance criteria
- Dashboard displays role-appropriate KPIs.
- Alerts widget surfaces booking/payout/compliance items.
- Upcoming trips list links to Itinerary Viewer.
- Quick actions: Create Quote, View Bookings, Start Campaign (when applicable).

## Tasks
- [ ] UI: Create Dashboard route and layout component
- [ ] API: Endpoint GET `/api/dashboard?role=` returning KPIs + alerts
- [ ] RBAC: Ensure correct role-based results and UI visibility
- [ ] Tests: Unit tests for components, integration test for `/api/dashboard`
- [ ] E2E smoke: Login → Dashboard loads KPIs and upcoming trips

## Notes / Data contracts
- Example response: { kpis: { revenue, bookings, payouts }, alerts: [...], upcoming: [...] }
