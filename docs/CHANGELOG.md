# Changelog

## 2025-12-11 — chore(lucide,security)

- Fix: Replaced underscore-aliased `lucide-react` imports across the codebase (use correct named exports).
- Fix: Resolved a malformed import in `src/components/FlightSelector.jsx`.
- Chore: Redacted exposed Google Maps API key in local audit and moved full audit to the ignored `security-reports/` folder.
- Chore: Added `docs/SECURITY_AUDIT_SUMMARY.md` with a public-safe summary and updated `.gitignore` to avoid accidental commits of full audit exports.

All changes were validated with unit tests and a production build.

Commits included:
- `chore(lucide): remove underscore aliases from lucide-react imports`
- `chore(security): add public audit summary and ensure private audit remains ignored`
