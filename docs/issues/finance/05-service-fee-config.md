---
title: Service Fee Config — Manage CollEco fee tiers
labels: enhancement, finance
assignees: ''
---

## Summary
Admin UI to configure service fee tiers and recalculate partner commissions.

## Roles
- Admin

## Acceptance criteria
- Add/edit fee tiers and recompute partner payouts via a background job.

## Tasks
- [ ] UI: Fee tiers page
- [ ] API: GET/PUT `/api/admin/commission-tiers`, POST `/api/admin/recompute-tiers`
- [ ] Tests: Unit + integration
