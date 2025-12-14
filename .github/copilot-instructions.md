# Copilot Instructions for CollEco Travel MVP

## Project Overview

CollEco Travel is a React + Vite SPA with an Express backend for travel collaboration and events aggregation. The app supports location-aware product discovery, events from external providers, and role-based collaboration workflows.

**Tech Stack**: React 18, React Router v7, Vite 7, Tailwind CSS, Express, Vitest, Playwright

## Architecture Patterns

### Routing & Pages
- **Config-driven routing**: All routes defined in `src/config/pages.json` with path, component, and metadata (roles, auth requirements)
- **Dynamic component loading**: `src/App.jsx` uses `import.meta.glob()` to lazy-load all `src/pages/*.jsx` components
- **Template system**: Pages use `src/data/pageTemplates.js` which implements an extends/merge pattern from `src/config/pageTemplate.json`
- **Fallback component**: When a component is missing, `WorkspacePage` is used as the universal fallback
- **Hash routing for GitHub Pages**: Use `VITE_USE_HASH=1` in production to avoid 404s on deep links

### Role-Based Access Control (RBAC)
- **Roles**: Admin, Partner, Client, Influencer (see `docs/architecture-overview.md`)
- **Role storage**: Current role stored in localStorage as `colleco.sidebar.role`
- **Route guards**: `GuardedRoute` component in `src/App.jsx` checks `meta.requiresAuth` and `meta.roles` from pages.json
- **E2E race condition**: In Playwright tests with `window.__E2E__`, the guard reads localStorage directly to avoid timing issues

### State Management
- **localStorage-first**: Primary state persistence via `src/useLocalStorageState.js` custom hook
- **Collaboration store**: `src/utils/collabStore.js` manages threads, messages, attachments with event bus pattern
- **Voice assistant**: `src/utils/voiceAgent.js` singleton for voice-powered booking with Web Speech API
- **No Redux/Zustand**: Intentionally kept lightweight with React context and localStorage

### Backend API Patterns
- **Server**: `server/server.js` (Express) with AI parser, pricing engine, health endpoint
- **Mock-first**: Siteminder integration (`src/api/__mocks__/siteminder.mock.js`) auto-enables when `SITEMINDER_USE_MOCK=1` or no API URL set
- **AI features**: Token-bucket rate limiting, metrics history (JSONL logs), draft management via `server/data/ai_*.json`
- **Events providers**: Ticketmaster/SeatGeek with demo fallback (query `?demo=1` or `DEMO_EVENTS=1`)
- **Auth**: Optional API_TOKEN bearer auth for production deployments

## Styling Conventions

### Tailwind Configuration
- **Custom z-index scale**: `z-header:50`, `z-banner:70`, `z-modal:80`, `z-toast:90` (see `tailwind.config.js`)
- **Sticky positioning**: Always use `[top:calc(var(--header-h)+var(--banner-h))]` to avoid overlap with header/banner
- **Brand colors**: `brand-orange:#F47C20`, `brand-brown:#3A2C1A`, `cream` shades for backgrounds
- **Surface design**: Cards use `surface` (white) with `cream` page backgrounds for visual hierarchy

### Z-Index Policy
- **Never use arbitrary high z-index**: Max production z-index is 100 (SplashScreen); modals use `2147483646` only when required for overlay roots
- **Layer ordering**: skip-links (60) → banner (70) → modal (80) → toast (90)

## Build & Development Workflows

### Local Development
```powershell
# Standard dev server (port 5180 default, auto-increments if busy, host: true for LAN)
npm run dev

# Backend API (port 4000)
npm run server

# With provider keys
$env:TICKETMASTER_API_KEY="key"; $env:SEATGEEK_CLIENT_ID="id"; npm run server
```

**Note**: The dev server automatically exposes on LAN (`host: true` in `vite.config.js`). Access from mobile via your PC's IP address (e.g., `http://192.168.x.y:5180`).

### Testing Strategy
- **Unit tests**: Vitest (`npm run test`) for helper functions
- **E2E smoke**: Playwright smoke suite via `npm run smoke:all` (builds → starts stack → runs tests)
- **Full E2E**: `npm run test:e2e` runs all Playwright tests across configured browsers and viewports
- **Mobile E2E**: CI workflow `.github/workflows/playwright-mobile.yml` runs mobile-specific specs with viewport configs (iPhone SE, iPhone 12, Galaxy S5)
- **Interactive E2E**: `npm run test:e2e:ui` for local debugging with Playwright UI mode
- **Retry strategy**: Playwright configured with `retries: 2` on CI, 0 locally for stability

### CI/CD Pipeline
- **Main workflows**: `.github/workflows/{ci.yml, e2e.yml, e2e-smoke.yml, deploy.yml}`
- **CI enables mock by default**: `SITEMINDER_USE_MOCK=1` and `SITEMINDER_MOCK_PORT=4015` in E2E jobs
- **Diagnostics**: Apply `e2e-diag` label to PRs to run `.github/workflows/e2e-diag-on-label.yml` with verbose logging
- **Artifact triage**: `scripts/ci-watch-all.ps1` polls failing runs and downloads artifacts to `artifacts/triage/run-<id>/`
- **Overflow management**: `scripts/auto-triage-overflow.js` auto-archives old triage artifacts

### Build Preparation
- **Prebuild scripts**: Automatically run via `npm run prebuild` hook
  - `scripts/copy-branding.mjs`: Copies logo assets to `public/assets/`
  - `scripts/generate-icons.mjs`: Generates PWA icons (requires sharp)
  - `scripts/generate-favicon.mjs`: Creates favicon from source images
- **Production build**: `npm run build` outputs to `dist/`
- **Preview**: `npm run preview` or `npm run preview:stable` (Express-based preview server on 5173)

## Key Files & Patterns

### Essential Config Files
- `src/config/pages.json`: Route definitions, RBAC metadata, component mappings
- `src/config/pageTemplate.json`: Base template definitions with extends/merge support
- `vite.config.js`: Dev server (port 5180/5173), proxy rules for `/api` and `/health`, GitHub Pages base path handling
- `playwright.config.ts`: E2E base URL `http://127.0.0.1:5173`, retries, multiple browser configs (Chromium, Firefox, WebKit), mobile viewports

### Data Flow Examples
- **Search**: `src/components/SearchBar.jsx` → `/api/search/suggestions` → backend `server/server.js` search endpoint
- **Events**: `src/pages/PlanTrip.jsx` → `/api/events/search?page=X&limit=8` → Ticketmaster/SeatGeek or demo fallback
- **AI Itinerary**: `src/utils/aiClient.js` → `POST /api/ai/stream` → SSE stream with line-by-line itinerary chunks
- **Collaboration**: `src/utils/collabStore.js` (localStorage) ↔ optional `POST /api/collab/:bookingId/message` for backend persistence

### Integration Stubs
- **WhatsApp**: `src/utils/whatsappStub.js` simulates inbound replies for demo
- **Notifications**: `src/utils/notify.js` wraps browser Notification API
- **Siteminder**: `src/api/siteminder.js` + `src/api/__mocks__/siteminder.mock.js` for booking provider

## Project-Specific Conventions

### Component Patterns
- **Lazy loading**: All page components in `src/pages/*.jsx` are lazy-loaded via `import.meta.glob()`
- **Fallback UI**: Use `<Suspense>` with loading spinners for route transitions
- **AutoFocus**: `src/components/AutoFocus.jsx` handles focus management on route changes for accessibility

### Error Handling
- **API calls**: Use `src/utils/api.js` wrapper which reads `VITE_API_TOKEN` and handles CORS/errors consistently
- **Health checks**: Always probe `/health` before running E2E; `scripts/orchestrate-e2e.js` implements multi-host fallback (127.0.0.1, localhost, ::1)

### Environment Variables
- **Frontend** (`VITE_` prefix):
  - `VITE_API_BASE`: Backend URL (default: `http://localhost:4000`)
  - `VITE_BASE_PATH`: Deployment subpath for GitHub Pages
  - `VITE_USE_HASH`: Enable hash routing (`1` for GitHub Pages)
  - `VITE_GOOGLE_MAPS_API_KEY`: For transfer service live map
- **Backend**:
  - `API_TOKEN`: Bearer token for production auth
  - `TICKETMASTER_API_KEY`, `SEATGEEK_CLIENT_ID`: Events provider keys
  - `DEMO_EVENTS`: Enable demo fallback (`1`)
  - `SITEMINDER_USE_MOCK`: Use mock Siteminder server (`1`)
  - `AI_ANALYTICS`: Enable AI analytics logging (`1`)

### Port Conventions
- **Dev frontend**: 5180 (default), 5173 (LAN mode), auto-increments if busy
- **Production preview**: 5173 (canonical)
- **Backend API**: 4000 (default), 4010 (smoke tests)
- **Mock Siteminder**: 4015 (CI/dev)

## Common Tasks

### Adding a New Page
1. Create `src/pages/NewPage.jsx` with default export
2. Add route entry to `src/config/pages.json` under appropriate group
3. Optionally add template override or `meta: { requiresAuth: true, roles: ['admin'] }`
4. Component auto-discovered via glob pattern, no manual import needed

### Debugging E2E Failures
1. Check `test-results/` and `playwright-report/` for local runs
2. For CI failures, use `scripts/ci-watch-all.ps1` to auto-download artifacts
3. Apply `e2e-diag` label to PR for verbose diagnostics job
4. Use `npx playwright show-report` to view HTML test report with traces and screenshots

### Enabling Live Events
1. Obtain API keys from Ticketmaster Developer Portal and SeatGeek
2. Set environment variables:
   ```powershell
   $env:TICKETMASTER_API_KEY="your_key"
   $env:SEATGEEK_CLIENT_ID="your_id"
   npm run server
   ```
3. Toggle providers in Settings UI or edit `server/data/providers.json`

### Deploying to GitHub Pages
1. Set repository secrets: `VITE_BASE_PATH=/colleco-mvp`, `VITE_USE_HASH=1`
2. Build workflow auto-deploys from main branch via `.github/workflows/deploy.yml`
3. Never create `public/index.html` (causes JSX to render as text)
4. Manifest must be at `/manifest.webmanifest` in deployed site

## Documentation References

- **Architecture**: `docs/architecture-overview.md` (role map, auth, integrations)
- **E2E**: `docs/E2E.md` (local runs, CI watcher, triage workflow)
- **Integrations**: `docs/integrations.md` (API surface, webhook contracts)
- **CI**: `docs/ci.md` (workflow overview)
- **Siteminder**: `docs/siteminder_integration_contract.md` (booking provider contract)
- **Communications**: `docs/COMMUNICATION_SYSTEM.md` (collab workspace design)
- **Voice Assistant**: `docs/VOICE_COMMANDS_QUICK_REFERENCE.md` (voice booking commands and NLP)

## Anti-Patterns to Avoid

- ❌ Don't create multiple React roots (only `src/main.jsx` mounts the app)
- ❌ Don't hardcode absolute z-index values above 100 (use Tailwind scale)
- ❌ Don't use `&&` for command chaining in PowerShell (use `;` or `|`)
- ❌ Don't bypass config-driven routing (always add routes to pages.json first)
- ❌ Don't commit secrets (use `.env.local` which is gitignored)
- ❌ Don't skip prebuild scripts (they generate required assets)

## Quick Reference Commands

```powershell
# Full dev stack
npm install
npm run server  # terminal 1
npm run dev     # terminal 2

# Complete build + test pipeline
npm run build && npm run test && npm run smoke:all

# E2E (full orchestrated)
npm run e2e:orchestrate

# Interactive E2E debugging
npm run cy:open

# CI artifact monitoring (4 hours)
pwsh ./scripts/ci-watch-all.ps1 -Hours 4

# Clean cache/artifacts
Remove-Item node_modules/.vite -Recurse -Force
```
