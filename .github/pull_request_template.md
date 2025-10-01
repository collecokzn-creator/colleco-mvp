## Summary

- What changed and why? Link issues if applicable.

## Type of change

- [ ] Bug fix
- [ ] Feature
- [ ] Chore/Refactor
- [ ] Security/Hardening

## Security checklist

- [ ] No secrets committed
- [ ] CORS `ALLOWED_ORIGINS` updated if needed
- [ ] `API_TOKEN` required for protected routes in prod
- [ ] Rate limiting in place for new endpoints
- [ ] Inputs validated or sanitized (where applicable)

## Validation

- [ ] Lint passes
- [ ] Tests pass
- [ ] Production build succeeds
- [ ] Local smoke test (optional)

## Notes

- Any follow-ups or rollout steps

## Merge Readiness (CI/CD & Deploy)

- [ ] GitHub Pages workflow enabled (deploy.yml) and legacy Jekyll workflow is disabled
- [ ] For Pages: hash routing active via `VITE_USE_HASH=1`; base path set (`VITE_BASE_PATH`)
- [ ] Backend environment prepared (production):
	- [ ] `NODE_ENV=production`
	- [ ] `API_TOKEN` set and required for protected routes
	- [ ] `ALLOWED_ORIGINS` includes the frontend origin(s)
	- [ ] Optional SMTP and provider keys are configured if those features are used
- [ ] Post-merge verification plan:
	- [ ] `/health` reachable
	- [ ] CORS preflight succeeds from frontend
	- [ ] Deep links work on Pages (hash routes)
	- [ ] PWA manifest loads at `/manifest.webmanifest`
