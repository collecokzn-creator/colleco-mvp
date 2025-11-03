---
title: Login / Register — Authentication & role detection
labels: enhancement, core, auth
assignees: ''
---

## Summary
Implement the Login / Register flow with support for email, phone verification, and SSO. Role detection (Admin/Partner/Client/Influencer) must be surfaced after auth.

## Roles
- All

## Acceptance criteria
- Users can register and login via email/password and phone OTP.
- SSO (OAuth) hooks are available (config-only for now).
- After login, the app detects and routes to the correct dashboard for the role.

## Tasks
- [ ] UI: Login and registration components (form validation, error states)
- [ ] API: POST `/api/auth/login`, POST `/api/auth/register`, POST `/api/auth/otp` (stub)
- [ ] RBAC: Store role in session token and FW redirect rules
- [ ] Tests: Unit tests and an E2E sign-in smoke test

## Notes
- Use existing mock auth or a simple JWT session for local dev.
