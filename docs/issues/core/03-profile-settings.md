---
title: Profile Settings — Manage personal & business info
labels: enhancement, core
assignees: ''
---

## Summary
Profile settings page to manage personal details, business info, documents, and preferences.

## Roles
- All

## Acceptance criteria
- Users can edit name, contact info, language, timezone, and business details.
- Upload and store documents (e.g., compliance docs for partners).
- Preferences persisted to `/api/users/:id/preferences`.

## Tasks
- [ ] UI: Profile form with sections and file upload
- [ ] API: GET/PUT `/api/users/:id`, PUT `/api/users/:id/preferences`, POST `/api/users/:id/docs`
- [ ] Tests: Unit tests for form validation and file uploads

