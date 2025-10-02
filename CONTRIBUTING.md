# Contributing

Thanks for your interest in contributing to Colleco MVP!

## Setup
- Node 18+ recommended
- Install deps: `npm install`
- Dev server: `npm run dev`
- Tests: `npm test`
- Build: `npm run build`

## Code Style & Linting
- ESLint is configured with React + Hooks.
- Run `npm run lint` before pushing (CI runs lint, tests, and build).
- Avoid `console.log` in production code; use `console.warn/error` sparingly.

## UI Layering (z-index) Policy
- Header/nav: z-50
- Sticky toolbars/panels: z-[45]
- Footer: z-40
- Skip link: z-60
- Status banner (offline/API): z-[70]
- Dropdowns/menus/floating buttons: z-50
- Modals: z-80; Toasts: z-90

Sticky elements: set `top: calc(var(--header-h) + var(--banner-h))`. Pages should pad top by the same to avoid overlap with fixed header.

## GitHub Pages Guardrails
- Use the Vite Pages workflow; ensure any Jekyll workflows are disabled/removed.
- Do not add `public/index.html` (only root `index.html` exists).
- Keep `public/manifest.webmanifest` and reference it as `/manifest.webmanifest`.
- For SPA routing, use hash routing in Pages (`VITE_USE_HASH=1`).

## Commit Messages
- Conventional style is appreciated: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, etc.

## Tests
- Unit tests live in `tests/`. Keep them fast.
- Add tests for public contracts (routing, manifest wiring, core UI policies).

## Questions
Open an issue or start a discussion if unsure about any of the above.
