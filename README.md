# Colleco MVP

[![CI](https://github.com/collecokzn-creator/colleco-mvp/actions/workflows/ci.yml/badge.svg)](https://github.com/collecokzn-creator/colleco-mvp/actions/workflows/ci.yml)
[![E2E Smoke](https://github.com/collecokzn-creator/colleco-mvp/actions/workflows/e2e-smoke.yml/badge.svg)](https://github.com/collecokzn-creator/colleco-mvp/actions/workflows/e2e-smoke.yml)
[![E2E Full](https://github.com/collecokzn-creator/colleco-mvp/actions/workflows/e2e.yml/badge.svg)](https://github.com/collecokzn-creator/colleco-mvp/actions/workflows/e2e.yml)
[![Pages Deploy](https://github.com/collecokzn-creator/colleco-mvp/actions/workflows/deploy.yml/badge.svg)](https://github.com/collecokzn-creator/colleco-mvp/actions/workflows/deploy.yml)

A React + Vite SPA with a minimal Express backend for collaboration and events aggregation. Includes location-aware product discovery, events from trusted providers with a demo fallback, and an admin Settings page with provider toggles and API status.

## E2E & CI diagnostics

See `docs/E2E.md` for E2E run instructions, the `e2e-diag` label usage, and the repository CI watcher/pruning utilities for collecting failing-run artifacts.

## Quick start

Prereqs: Node 18+ recommended.

- Install deps
  ```powershell
  npm install
  ```
- Run backend (port 4000)
  ```powershell
  # optional provider keys for live events
  # $env:TICKETMASTER_API_KEY="your_key"; $env:SEATGEEK_CLIENT_ID="your_id"
  npm run server
  ```
- Run frontend (port 3000)
  ```powershell
  npm run dev
  ```

Open http://localhost:3000.

## Features
- URL-driven filters: continent → country → province → city → area
- Global Search with products, services, locations, and events (with provider badges)
- PlanTrip includes Catalog and Events tabs; Events support real pagination (Load more)
- Settings page with provider toggles and demo mode; API Status card with latency

## Events providers
- Supported: Ticketmaster (Discovery API), SeatGeek
- Configure via environment variables (backend):
  - `TICKETMASTER_API_KEY`
  - `SEATGEEK_CLIENT_ID`
- Provider toggles are persisted to `server/data/providers.json` and editable in Settings.

## Transfer service (Uber-like)
- Live map tracking requires Google Maps JavaScript API
- Configure via environment variable (frontend):
  - `VITE_GOOGLE_MAPS_API_KEY`
- Features: instant/prearranged booking, real-time tracking, in-transfer chat, driver ratings

## Weather forecasts
- Live weather data powered by Open-Meteo API (no key required)
- Toggle visibility in Settings page
- Shows current conditions + 7-day forecast with travel tips and packing suggestions

### Demo events fallback
- Works without any keys
- Enable via query `demo=1`, environment `DEMO_EVENTS=1`, or when no provider keys found

### Pagination
- Endpoint: `GET /api/events/search?q=&city=&country=&page=1&limit=8&demo=1`
- Returns: `{ ok, events, page, limit, total, hasMore }`

## Health and diagnostics
- `GET /health` — backend health
- Settings → API Status card shows:
  - Health, Providers, Events demo probe
  - Round-trip latency and last error

## Deployment notes
- Production build:
  ```powershell
  npm run build
  ```
Serve `dist/` with your preferred static host; run `npm run server` alongside for APIs.

### Production environment (backend)
For any internet-exposed deployment of the Express server, set these environment variables via your platform's secret manager (never commit secrets):

- NODE_ENV=production
- API_TOKEN=<strong-random-token>
- ALLOWED_ORIGINS=https://your-domain.com,https://<user>.github.io/<repo>
- AI_ANALYTICS=0 (set to 1 only if you need local analytics logs)

See SECURITY.md for complete hardening guidance (headers, CORS, rate limits, auth).

### UI Layering (z-index) Policy
## Mobile Access (LAN)

To open the app on your phone (same Wi-Fi network):

1. **Start the app for LAN access:**
	- Development (hot reload):
	  ```powershell
	  npm run dev:lan
	  ```
	- Preview (built static site):
	  ```powershell
	  npm run build
	  npm run preview:lan
	  ```

2. **Find your PC’s LAN IP address:**
	- In PowerShell:
	  ```powershell
	  ipconfig | Select-String IPv4
	  ```
	- Look for an address like `192.168.x.y`.

3. **On your phone’s browser, open:**
	- Dev: `http://192.168.x.y:5173`
	- Preview: `http://192.168.x.y:5173` (preview now uses the canonical port 5173)

4. **Windows Firewall tips:**
	- Allow Node.js or Vite through Windows Firewall when prompted.
	- Or manually add a rule for TCP port 5173 in Windows Defender Firewall (Inbound Rules).

5. **Troubleshooting:**
	- Ensure both devices are on the same Wi-Fi network.
	- Disable VPNs if they block LAN traffic.
	- Some corporate Wi-Fi may block client-to-client connections; try a home/private network.
	- If using the API, start it as well:
		```powershell
		$env:PORT = 4000
		npm run server
		```
	- Frontend tests use localhost for API by default; for mobile, ensure API is reachable if needed.

Always ensure sticky elements use `top: calc(var(--header-h) + var(--banner-h))` and pages add `padding-top` equal to the same to avoid overlap.

### GitHub Pages Guardrails (Vite)
- Disable or remove any Jekyll workflows; only use the Vite Pages workflow.
- Do NOT create `public/index.html` (it can cause raw JSX to be served). Keep the root `index.html` only.
- Keep `public/manifest.webmanifest` at the root of the deployed site and reference it as `/manifest.webmanifest`.
- For SPAs use hash routing in Pages (`VITE_USE_HASH=1`) to avoid deep-link 404s.

### Local smoke tests (E2E)
A minimal Cypress smoke test verifies the built app renders and the backend `/health` responds.

-- One command (build → start backend on 4000 → serve dist on 5173 → wait → run smoke):
	```powershell
	npm run smoke:all
	```
- Manual (step-by-step):
	```powershell
	# 1) Build
	npm run build

	# 2) Start backend and static preview (port 4000 and 5173)
	npm run smoke:start:stack

	# 3) In another terminal, run Cypress against the local API
	$env:API_BASE='http://localhost:4000'; npm run cy:run
	```
- Interactive mode:
	```powershell
	$env:API_BASE='http://localhost:4010'; npm run cy:open
	```

Notes:
- The backend may auto-fallback if the port is in use; `smoke:start:stack` pins it to 4010 to avoid conflicts.
- If you run the backend manually, set `API_BASE` to match its URL before running Cypress.

## Cypress Dashboard (optional)

You can record Cypress runs to the Cypress Dashboard for richer test insights and retries. To enable recordings in CI:

- Create a Cypress project and obtain a record key from the Dashboard (https://dashboard.cypress.io).
- Add the key to your repository secrets as `CYPRESS_RECORD_KEY`.
- The CI workflow (`.github/workflows/e2e-smoke.yml`) will automatically record runs when `CYPRESS_RECORD_KEY` is present and set the run group to `smoke-booking`.

Notes:
- Recording requires a Cypress account and may be subject to plan limits.
- You can view per-run artifacts, video, and retry analytics in the Dashboard.

## Troubleshooting
  - Ensure country/city or a search term ≥ 3 chars
  - Enable demo mode in Settings
  - Add provider keys and enable providers in Settings

A Vite + React 18 app styled with Tailwind. It includes a Trip Planner, Partner Dashboard, and a Collaboration Workspace with Analytics.

## Quick start

- Dev: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

Backend demo API (optional):
- Start server: `npm run server` (port 4000)
- Configure frontend to call it by setting `VITE_API_BASE=http://localhost:4000` in an `.env.local`
- Persistence: server writes to `server/data/collab.json`
- Role-based visibility: GET endpoints accept `?role=agent|client|productOwner` to filter what is returned
- Realtime (SSE): subscribe to `GET /events?role=...` (Server-Sent Events). Events: `message`, `attachment`, `read`

Auth (optional):
- Server: set `API_TOKEN=your-secret` before running `npm run server`
- Client: set `VITE_API_TOKEN=your-secret` in `.env.local`
- SSE: token is passed as a `?token=...` query param automatically when `VITE_API_TOKEN` is set

## Key routes

- `/plan-trip` — Trip Planner hub (Quotes, Itinerary, Bookings)
- `/partner-dashboard` — Partner tools (Promotions, Payouts, Compliance)
- `/collaboration` — Shared workspace for Agents, Clients, Product Owners
- `/collab-analytics` — Cross-thread analytics (filters, SLA, export)

## Collaboration Workspace

- Role-based visibility: All, Agent+Client, Agent+Product Owner
- Channels: In-App, WhatsApp, Email, SMS, Note
- Mentions: @client, @productOwner
- Attachments: Files and voice notes (WebM) with inline playback
- Notifications: Browser notifications for inbound messages (demo)
- Auto-simulate WhatsApp replies: Toggle in the sidebar for demo

Data is persisted in localStorage to keep the demo self-contained.

## Collaboration Analytics

- Date range filters and search
- Average response times by role
- Messages by channel
- Awaiting response and top bottlenecks (with SLA highlight)
- CSV export of thread-level metrics

## Integrations (stubs)

- WhatsApp stub: `src/utils/whatsappStub.js` — simulates inbound replies
- Notifications stub: `src/utils/notify.js` — wraps browser Notification API
- Collab store & events: `src/utils/collabStore.js` — messages, attachments, analytics, event bus

See `docs/integrations.md` for a suggested API surface and webhook mapping.

If trying the local API server:
- Endpoints: GET /api/collab, GET /api/collab/:bookingId, POST /api/collab/:bookingId/message, POST /api/collab/:bookingId/attachment, POST /webhook/whatsapp
- Example WhatsApp webhook:
	- POST http://localhost:4000/webhook/whatsapp with `{ "bookingId": "BKG-1", "fromName": "Client", "content": "Hello from WhatsApp" }`

## Siteminder mock (local dev & CI)

For development and CI we provide a small, mock-first Siteminder implementation so you can exercise booking/provider flows without external network calls or sandbox credentials.

- Enable the mock locally:
	- Run the mock server directly:
		```powershell
		npm run mock:siteminder
		```
		By default the mock listens on port 4015. Change it with `SITEMINDER_MOCK_PORT` if needed.

- Toggle mock mode for the app/orchestrator:
	- Temporary (single command):
		```powershell
		# set env var for this run
		$env:SITEMINDER_USE_MOCK = '1'; npm run e2e:orchestrate
		```
	- Or prefix commands with `cross-env` on non-PowerShell shells:
		```bash
		cross-env SITEMINDER_USE_MOCK=1 SITEMINDER_MOCK_PORT=4015 npm run e2e:orchestrate
		```

- CI: The E2E workflows enable the mock by default (see `.github/workflows/*`). They set:
	- `SITEMINDER_USE_MOCK=1`
	- `SITEMINDER_MOCK_PORT=4015`

- Files and docs:
	- Mock implementation: `scripts/mock-siteminder-server.js`
	- Mock shapes and contract: `src/api/__mocks__/siteminder.mock.js` and `docs/siteminder_integration_contract.md`

Notes:
- The app's Siteminder wrapper is mock-first: if `SITEMINDER_USE_MOCK=1` or `SITEMINDER_API_URL` is not set, the mock will be used automatically (`src/api/siteminder.js`).
- Use the mock for deterministic E2E runs and to develop booking flows without incurring provider costs or requiring sandbox credentials.

## Troubleshooting

- Notifications not showing: ensure the site is allowed to show notifications in your browser permissions.
- Audio recording not starting: confirm microphone permissions; some browsers need HTTPS for MediaRecorder.
- Large itinerary PDF: the Itinerary route includes PDF deps; route-level code-splitting is enabled.
- Invalid Hook Call (React):
	- Clear Vite prebundle cache: delete `node_modules/.vite`.
	- Ensure a single React copy: in `vite.config.js` add `resolve.dedupe = ['react','react-dom']` and `optimizeDeps.include = ['react','react-dom']`.
	- Restart dev server. Avoid multiple entry points mounting the app (only `src/main.jsx` should create the root).

## License

Internal MVP — not for public distribution.

## PWA & Branding Enhancements

This project now ships with a progressive enhancement layer for installability, richer icons, and offline resilience.

### Asset Pipeline
- Source of truth branding assets: `src/assets/colleco-logo.png` & `src/assets/Globeicon.png`.
- Prebuild scripts:
	- `scripts/copy-branding.mjs` copies canonical images into `public/assets/`.
	- `scripts/generate-icons.mjs` (uses optional `sharp`) generates multiple icon sizes and placeholder screenshots.
- Generated outputs:
	- Icons: 16, 32, 180, 192, 256, 384, 512, 1024 (`public/assets/icons/colleco-logo-<size>.png`).
	- Screenshots (placeholders): 1080x1920 & 1920x1080 (`public/assets/screenshots/`). Replace with real UI captures for store-quality installs.

### Manifest (`public/manifest.webmanifest`)
- Extended icon matrix now versioned `?v=17`.
- Includes `shortcuts` for Bookings & Itinerary.
- Includes `screenshots` (replace placeholders with real captures for better install dialog).
- Added `categories`, `orientation`, `id`, and text direction.

### Service Worker (`public/sw.js`)
- Cache name now `colleco-static-v20` (bump whenever shell/manifest changes).
- Strategies:
	- App shell routes: cache-first with offline fallback to enhanced `offline.html`.
	- Branding images: network-first → empty 204 fallback to avoid broken icons.
	- Other GET: stale-while-revalidate with background cache update.
- Update Prompt: client script injects a lightweight toast when a new SW is waiting; clicking Refresh posts `SKIP_WAITING` to activate immediately.

### Adding / Updating Icons
1. Replace `src/assets/colleco-logo.png` with >=1024x1024 square.
2. Run `npm run build` (prebuild runs branding, icons, favicon generation).
3. Increment version query (`?v=18` next) in manifest, HTML, and bump SW cache constant.
4. Re-run Lighthouse PWA audit.

### Improving Screenshot Quality
- Capture real UI states (Bookings list, Itinerary view) at 1080x1920 and 1920x1080.
- Overwrite placeholder PNGs in `public/assets/screenshots/` keeping filenames; rebuild.

### Optional Next Enhancements
- Replace placeholder screenshots with real UI states (improves store listing quality).
- Add analytics-driven precaching for most-used chunks.
- Integrate background sync / periodic sync for itinerary updates.
- Add push notifications (requires backend + credentials).

### Offline Considerations
- Branded `offline.html` included (Retry + Home buttons).
- Consider precaching most-used dynamic route chunks after usage telemetry.

### Testing Tips
- Lighthouse (Chrome) for installability and best practices.
- DevTools > Application: confirm new version numbers (icons ?v=17, SW cache v17).
- Incognito to validate first-load offline fallback & update prompt after build redeploy.

## Digital Itinerary Features

The itinerary is now delivered as a structured JSON document for richer mobile usage, deep linking, and calendar integration.

### Data Source
- Public JSON: `public/assets/data/itinerary.json` (served at `/assets/data/itinerary.json`).
- Schema (simplified):
	- `meta`: `{ version, generated, title, timezone }`
	- `items[]`: `{ id, day, title, description, start, end, lat, lng, location, type, trailProvider, trailUrl, distanceKm, elevationGainM, tags[], notes }`

### UI (`Itinerary` component)
- Groups items by `day` with timing, metrics (distance / elevation), and tags.
- Action buttons per item:
	- Trail: opens provider (AllTrails / Komoot / Wikiloc) or a provider search fallback.
	- Map: opens Google Maps with coordinates or location string.
	- Add Calendar: opens prefilled Google Calendar event creation URL.
	- ICS: downloads a standards-compliant single-event `.ics` file.
- Page-level: Download Full ICS (all events combined) for quick import to desktop/mobile calendars.

### Calendar & ICS Generation
- ICS is RFC 5545 style (UTC timestamps, escaped text, line folding at 75 chars).
- UIDs namespaced with `@colleco.itinerary`.
- Google Calendar URLs use `action=TEMPLATE` pattern with UTC date range.

### Offline & Caching
- Service Worker v19 adds network-first strategy for `/assets/data/itinerary.json` with cache fallback for offline repeat access and supports a manual cache clear message.
- JSON added to pre-cache list for first-load availability if online at install time.
- If offline and never cached, a minimal empty JSON payload is returned gracefully.
- UI refresh button triggers `CLEAR_ITINERARY_CACHE` message before refetch for guaranteed fresh pull.

### Local Overlay & Extensibility
- Local overlay: custom user-added items (marked LOCAL) + completion toggles are persisted in `localStorage` (`itineraryLocalOverlay:v1`).
- Manual refresh clears only the cached itinerary JSON while retaining local overlay.
- Future ideas:
	- Periodic Background Sync to refresh itinerary if connection restored.
	- Add geo-launch (intent:// on Android) variants for native map apps.
	- Merge server-driven updates with local deltas via diff algorithm.

### Maintenance Checklist (when updating itinerary)
1. Update `public/assets/data/itinerary.json` (ensure ISO timestamps with timezone offsets).
2. If structural schema changes: bump `meta.version`.
3. If app shell or caching strategy adjusted: bump `STATIC_CACHE` constant in `sw.js`.
4. Rebuild & verify update toast triggers (indicates SW version change).

### Accessibility & Mobile
- Action buttons sized for ~44px hit areas; on very narrow viewports buttons wrap fluidly.
- Tags use uppercase + letter-spacing for quick scanning.

### Visual Enhancements (Itinerary)
- Timeline layout with vertical day progression and dot markers.
- Type-based illustrative SVG cards (hike/meal/lodging/custom) under `public/assets/itinerary/`.
- Fade-in animation on scroll/initial render (`animate-fadeIn`).
- Local items ring highlight; DONE overlay with translucency.
- Type pill + tags for quick semantic scanning.
 - Tag filtering (multi-select) with persistent selection in localStorage.
 - Progress summary (completed / total + percentage) updates live.
 - Dark mode toggle (scoped) persisted as `itineraryTheme`.
 - Lazy-loaded media with blur-up transition and IntersectionObserver one-time animation.
 - Accessible buttons & high-contrast adjustments in dark theme.

### Newly Added Advanced Enhancements

These features extend the itinerary beyond the original v21 scope.

#### Import / Export Local Overlay
- Buttons: **Export Local** and **Import Local** (merge/replace modes).
- Export produces JSON (custom items + completion flags).
- Import validates shape and either merges or replaces the existing overlay.

#### Focus Mode
- Hides DONE items to reduce visual noise during active execution.
- Persists via `itineraryFocusMode` key.

#### Photo Thumbnails
- Optional `photo` + `photoAlt` fields on items.
- Files stored under `public/assets/itinerary/photos/` with optional `@2x` and `-wide` variants.
- Falls back to SVG type illustration if no photo provided.

#### Background Sync Stub (SW v21)
- Registers Background Sync + attempts Periodic Sync every ~15 min (if supported) to refresh itinerary JSON.
- Broadcasts a lightweight hash to clients after caching fresh content.

#### Change Detection & Update Badge
- Client compares incoming hash with baseline; shows banner + amber badge on Refresh when new data is available.
- Reload button clears cached JSON then refetches; Dismiss just updates baseline.

#### Persistence Summary
| Feature | Key |
|---------|-----|
| Dark mode | `itineraryTheme` |
| Tag filters | `itineraryTags` |
| Focus mode | `itineraryFocusMode` |
| Local overlay | `itineraryLocalOverlay:v1` |

#### Future Ideas
- Push notifications for server-driven changes.
- Visual diff of added/removed/modified items before reload.
- SHA-256 hashing via `crypto.subtle` for stronger collision resistance.
- Two-way sync of local custom items with remote backend.

## Release Notes (Recent)
 v29: Undo stack, modal multi-day repeat, drag handle + placeholder, keyboard drag & improved accessibility, restored bulk move, price visibility audit passed.
 v28: Persistent basket ordering, drag between days, keyboard reorder buttons, paid/included badges (no numeric prices), and multi-day repeat for local-only items.
 v27: In-day drag & drop reordering + bulk select and bulk day move (linked items update basket). Itinerary continues to intentionally hide prices; pricing only appears in Quotes & Fees widgets.
 v26: Basket replaces wishlist entirely; itinerary now offers in-place day reassignment & removal for basket-sourced items (two-way sync: changes propagate back to basket). Quote + itinerary flows unified under basket. 
 v25: Per-day basket assignment with delta sync; quote clone/delete actions; currency formatting utility across UI & PDFs.

## Basket-Driven Planning & Quotes

The Trip Planner uses a Basket as the single selection source for BOTH itinerary construction and quote generation.

### Current Capabilities (v28)
* Per-item Day assignment in Basket panel.
* Delta sync into itinerary (add, move, prune) with `_basketSource` tagging.
* In-itinerary controls for basket-sourced items: change Day (selector) or Remove.
* Two-way updates: Day change / removal inside itinerary updates the basket (authoritative) and triggers re-sync.
* Drag & drop reordering within a day (presentation order only; no price exposure).
* Bulk select + bulk day reassignment (linked items adjust basket day values).
* Drag between days (drop onto day container) auto-updates basket day for linked items.
* Keyboard accessible reorder buttons (↑/↓) in reorder mode.
* Paid vs Included badges (no monetary values) for quick scan.
* Multi-day duplicate tool for local (non-basket) items via prompt-driven day list.
* Quotes prefill only PAID items (price > 0); itinerary includes ALL items (including complimentary / zero-priced).
* Wishlist fully removed; legacy component retained as deprecated stub (`WishlistPanel.jsx`) for reference only.
* Itinerary deliberately omits pricing details to keep focus on experience flow; pricing lives in Quote PDFs and Fees breakdown components.

### Data Flow
```
Basket (all selected products) ──> Itinerary (ALL items) ──> Client Experience
				└──────────────> Quote (PAID items only)
```

### State & Keys
* Basket: `basket:v1`
* Auto-sync toggle: `basketAutoSync:v1`
* Quotes store: `quotes:v1`

### Editing Behavior
| Action | Effect |
|--------|--------|
| Change Day in Basket | Item moved to that day in itinerary on next render cycle. |
| Change Day in Itinerary (linked item) | Updates basket item `day` then delta sync repositions. |
| Remove in Itinerary (linked item) | Removes from basket; itinerary entry pruned by sync effect. |
| Remove in Basket | Corresponding itinerary item pruned (if `_basketSource`). |

### Why This Model?
Avoids dual picking (previous wishlist + itinerary) and aligns financial artifact (Quote) with operational plan (Itinerary) via a single canonical selection surface.

### Roadmap Ideas
* Drag & drop day reordering / within-day ordering.
* Quantity split across multiple days.
* Bulk day reassignment & multi-select.
* Price breakdown roll-up per day / per category.
* Server persistence & multi-user real-time collaboration.

### Quote Prefill
“Create Quote” pulls only basket items with `price > 0`. Complimentary items remain operational (itinerary) but excluded from pricing totals.

---

## Standalone Quotes Workflow

Not every client journey requires a full itinerary. The quotes system now functions independently, allowing you to generate and manage quotations without creating or populating day plans.

### Features
- Dedicated creation page at `/quote/new` with:
	- Client name, currency selector, tax rate, status field (Draft → Sent → Accepted / Declined lifecycle).
	- Flexible line items (title, description, category, unit price, quantity) with live subtotal, tax and total calculation.
	- Internal/client notes section (exported into PDF when present).
- Quotes list (`/quotes`): summary cards show item count, total, status, last updated time, and quick actions (Open, Export PDF).
- Enhanced PDF generation accepts the new structured model (supports currency + tax). Backwards compatible with legacy simple item arrays.
- Status & metadata (created/updated timestamps) embedded into exported PDF when using structured mode.
- Local persistence key: `quotes:v1`.

### Itinerary Decoupling
- A toggle on the Itinerary page controls whether selecting experiences (wishlist) influences itinerary progress: key `quotesAutoLink:v1`.
- When disabled, the itinerary progress step for selecting experiences ignores wishlist length—allowing purely quote-driven engagements.

### Data Model (Simplified)
```
Quote {
	id: string,
	clientName: string,
	currency: 'USD' | 'EUR' | 'ZAR' | 'GBP',
	taxRate: number,
	status: 'Draft' | 'Sent' | 'Accepted' | 'Declined',
	notes?: string,
	items: QuoteItem[],
	createdAt: ISOString,
	updatedAt: ISOString
}

QuoteItem {
	id: string,
	title: string,
	description?: string,
	category?: string,
	unitPrice: number,
	quantity: number
}
```

### Persistence Keys
| Feature | Key |
|---------|-----|
| Quotes store | `quotes:v1` |
| Auto-link toggle | `quotesAutoLink:v1` |

### Roadmap Ideas
- Email / share link for quotes.
- Version history per quote.
- Optional attachment support (e.g., brochure PDFs).
- Multi-currency rate snapshotting (lock FX on quote creation).

## v29 (Unreleased)
- Added redo (Ctrl/Cmd+Shift+Z) & UI button; undo/redo now cover memory note edits.
- Live ARIA announcements for drag, keyboard reorder, and inter-day moves.
- High contrast focus outline toggle (`itineraryHighContrastFocus:v1`).
- (Previously added this cycle) Undo stack, modal multi-day repeat, drag handle, keyboard drag, accessibility roles, bulk move restoration, price audit.

## v30 (Current)
- History panel: view and jump to recent undo states.
- Coalesced keyboard reordering: rapid Arrow key moves batch into a single undo entry for clarity.
- Toast visual announcements: ephemeral notifications mirror ARIA live region, user-toggleable.
- Preferences panel: toggle high contrast focus and toast notifications, persisted in localStorage.
- Persisted reorder mode: last active day and bulk mode remembered across reloads.
- All accessibility and state preferences use versioned localStorage keys for future migration.

### Accessibility & Preferences
- ARIA live region for all itinerary actions (drag, reorder, bulk move).
- Visual toasts mirror announcements for sighted users; can be disabled in Preferences.
- High contrast focus outlines toggle for improved keyboard navigation.
- Preferences panel (top right) consolidates all user-facing toggles.
- Reorder mode and bulk select mode persist via localStorage (`itineraryReorderDay:v1`, `itineraryBulkModeDay:v1`).

### Persistence Summary (updated)
| Feature | Key |
|---------|-----|
| High contrast focus | `itineraryHighContrastFocus:v1` |
| Toast notifications | `itineraryEnableToasts:v1` |
| Reorder mode | `itineraryReorderDay:v1` |
| Bulk mode | `itineraryBulkModeDay:v1` |
| ...existing keys... |


## AI Itinerary Generator (MVP)

An experimental natural-language to draft itinerary feature has been added.

### Endpoints (Local API Server)
- POST `/api/ai/itinerary` `{ prompt: string }` → returns structured parse + itinerary + pricing heuristic.
- GET `/api/ai/itinerary/stream?prompt=...` (SSE) → phased events: `parse`, `plan`, `pricing`, `done`.
 - POST `/api/ai/itinerary/refine` `{ prompt, instructions }` → heuristic refinement adjusting nights (+N more nights) and adding interests mentioned via `add hiking`, `add museum`, etc. Returns same shape under `data`.
 - POST `/api/ai/draft` `{ prompt, data }` → persists a server-side draft; returns `{ ok, id }`.
 - GET `/api/ai/draft/:id` → retrieves persisted draft.
 - POST `/api/ai/session` `{ prompt }` → starts a multi-turn session; returns `{ ok, id, data }` (initial parse payload in `data`).
 - POST `/api/ai/session/:id/refine` `{ instructions }` → applies refinement to latest session state; returns `{ ok, data }` with updated structure.
 - GET `/api/ai/session/:id` → full session object: `{ id, prompt, createdAt, history: [ { type:'parse'|'refine', data, instructions?, at } ] }`.
 - GET `/api/ai/metrics` → runtime counters `{ total, cacheHits, cacheMiss, rateLimited, refine, drafts, uptimeSec }`.

### Output Shape
```
{
	original: string,
	destinations: string[],
	startDate: ISODate|null,
	endDate: ISODate|null,
	nights: number,
	travelers: { adults: number, children: number },
	budget: { currency: string, amount: number|null, perPerson: boolean },
	interests: string[],
	itinerary: [ { day, title, destination, activities[] } ],
	pricing: { currency, total, breakdown: { lodging, activities, food }, note },
	meta: { heuristic: true, version: 1 }
}
```

### Frontend Panel
- Route: `/ai` (also accessible via Trip Planner dropdown).
- Modes: Streaming (phased) or Single-shot.
- Accessible live region announces phase progress (parse → plan → pricing → done).
- Cancel button aborts in-progress stream.
- Apply button stores a draft (`aiItineraryDraft:v1`) for later import into the Itinerary page (merge or replace).
- Refinement field allows incremental instructions (e.g., "add hiking", "add 2 more nights").
 - Session mode toggle: when enabled, the initial prompt creates a session, and subsequent refinements use the session refine endpoint (stateful multi-turn adjustments).
 - Upload Draft: (optional) persists the currently generated draft to the server via `/api/ai/draft` and shows the returned ID for future retrieval.
 - Status badges show whether response came from cache (`cached: true`) or was refined.

### Refinement Semantics
Heuristic refinement currently supports:
- Adding interests: phrases like `add hiking`, `add museum` (case-insensitive) append to the interests array if not present.
- Nights extension: patterns like `add 2 more nights` or `2 additional nights` increase `nights` (clamped to 30).
The itinerary & pricing are regenerated from the updated core fields. Future LLM integration can replace this layer while preserving the response contract.

### Sessions
Sessions encapsulate sequential refinements without resending the original prompt each time.
Workflow:
1. Create session (`POST /api/ai/session`).
2. Issue one or more refinement calls (`POST /api/ai/session/:id/refine`). Each adds an entry to `history`.
3. Retrieve accumulated state (`GET /api/ai/session/:id`).
Client UI reflects latest `data`; earlier snapshots remain in `history`.

#### Session History & Diff (Enhanced)
- Snapshot list displays each parse/refine with counts (nights, destinations, interests).
- Diff toggle compares the last two snapshots highlighting:
	- Nights delta
	- Added interests
	- Destination count change
Additional granular signals (latest change only):
- Day additions / removals
- Activity additions / removals (first few shown inline)
- Expandable full activity diff list (shows all added / removed activities grouped by day)
If no changes are detected across core fields, a neutral message appears for transparency.

### Draft Persistence
Local (browser) draft: `aiItineraryDraft:v1` stores the last applied generation for itinerary import (merge / replace).
Server draft: Persist with POST `/api/ai/draft` to obtain an ID; later fetch using GET `/api/ai/draft/:id` (enables sharing or reloading across browser sessions).

### Metrics & Observability
`GET /api/ai/metrics` returns ephemeral in-memory counters (reset on server restart):
| Field | Meaning |
|-------|---------|
| total | Total AI operations served (includes cache hits) |
| cacheHits | Number of prompt responses served from cache |
| cacheMiss | Number of fresh heuristic computations |
| rateLimited | Count of 429 rejections due to rate limiting |
| refine | Count of refinement operations (standalone + session) |
| drafts | Number of server draft creations |
| uptimeSec | Process uptime in seconds |
| avgLatencyMs.gen | Average generation latency (ms) |
| avgLatencyMs.refine | Average refinement latency (ms) |
| rateLimit.strategy | 'sliding_window' or 'token_bucket' |
| tokens.total | (Hybrid mode) cumulative estimated tokens consumed |
| costUsd | (Hybrid mode) cumulative estimated cost in USD |

Analytics log entries (non-PII) are appended to `server/data/ai_analytics.log` for future warehouse ingestion.

#### Metrics UI (Enhanced)
- Route: `/ai/metrics`
- 5s polling of `/api/ai/metrics` + 10s polling of `/api/ai/metrics/history`
- Sparklines: Total Requests, Refine Requests, Cache Hit Ratio (%), Total Tokens (if hybrid mode active)
- Cards: Total, Cache Hits, Cache Miss, Refines, Drafts, Rate Limited (+ token & cost cards when available)
- Latency: average (`avgLatencyMs.*`) plus percentile blocks (p50/p95/p99) for generation & refinement
- Expandable raw JSON view
- History endpoint: `GET /api/ai/metrics/history` returns `samples[]` (includes tokens, cost, latency percentiles p50/p95/p99, and delta fields)
 - Raw download: `GET /api/ai/metrics/history/download` serves a streaming JSONL file (`ai_metrics_history.jsonl`) combining persisted and in-memory snapshots for offline analysis.
- Rate limit strategy exposed (sliding window vs token bucket)
- Token & cost metrics only appear when `HYBRID_LLM=1` (stub adapter)

### Itinerary Integration (AI Items)
When importing a generated itinerary into the main Itinerary view, AI-sourced entries are tagged internally (e.g., `_aiSource`). The UI:
- Renders an "AI" badge on such items.
- Provides a "Hide AI Items" toggle (persisted as `itineraryHideAI:v1`) to declutter when mixing curated and AI-suggested content.

### Persistence Keys (AI-Related)
| Purpose | Key |
|---------|-----|
| Local AI draft (pending import) | `aiItineraryDraft:v1` |
| Hide AI-generated items toggle | `itineraryHideAI:v1` |

### Error Codes
| Scenario | Status | Payload |
|----------|--------|---------|
| Missing prompt | 400 | `{ error: 'prompt required' }` |
| Missing instructions (refine) | 400 | `{ error: 'instructions required' }` |
| Session not found | 404 | `{ error: 'session not found' }` |
| Draft not found | 404 | `{ error: 'not found' }` |
| Rate limit exceeded | 429 | `{ error: 'rate_limited' }` |

### Security Notes (Current Demo)
- In-memory rate limiting only; not production-grade.
- Draft & session data stored in-process / JSON files; treat as non-sensitive.
- When `API_TOKEN` is configured, each draft/session is tagged with a `tokenHash`; access (get/refine) requires matching bearer token (lightweight scoping, not full multi-tenant security).
Future enhancements: API keys per user role, hashed prompt storage, request signature, per-session TTL & revocation, structured audit logging, metrics persistence & per-token segmentation.
**Scoped Indicator:** The AI generator panel displays a `LOCK` badge beside the session id when token-scoped.

### Snapshot History & Deltas
Each snapshot inside `samples[]`:
```
{
	ts: number,
	total: number,
	cacheHits: number,
	cacheMiss: number,
	rateLimited: number,
	refine: number,
	drafts: number,
	tokens: { prompt:number, completion:number, total:number },
	costUsd: number,
	latency: {
		gen: { p50:number, p95:number, p99:number },
		refine: { p50:number, p95:number, p99:number }
	},
	// Present from second snapshot onward
	tokensDelta: { prompt:number, completion:number, total:number },
	costDelta: number,      // difference in costUsd vs previous snapshot (rounded 6dp)
	totalDelta: number      // difference in total operations vs previous snapshot
}
```
Use the delta fields to estimate burn in the last ~10s interval (snapshot cadence ~10,000ms).

### Hybrid LLM Mode (Experimental)
Set `HYBRID_LLM=1` in server environment to enable the hybrid enhancement step (`server/llmAdapter.js`).

Providers supported (env-driven):
- OpenAI: set `OPENAI_API_KEY`; optional `OPENAI_MODEL` (default `gpt-4o-mini`).
- Azure OpenAI: set `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`.
- If neither is set, a safe stub runs locally (no external calls) and estimates tokens heuristically.

Optional cost estimation:
- Set `LLM_COST_PER_1K_PROMPT` and `LLM_COST_PER_1K_COMPLETION` (numbers) to compute `meta.estimatedCostUsd` per request based on model usage (when usage is returned by the provider; stub will estimate).

Behavior when enabled:
- Adds a concise `meta.summary`.
- Appends a curated highlight activity to the first day (idempotent).
- Populates `meta.tokenUsage` from provider usage when available; aggregates into `/api/ai/metrics` tokens and cost.
- Flags `meta.llmEnhanced=true` and includes `meta.llmError` on failures (falls back to stub gracefully).

Operational notes:
- The server exposes `GET /api/ai/config` with `{ llm: { provider, model }, rateLimit, ... }` for UI hints (never exposes secrets).
- Calls are time-limited (~10s) and error-handled; failures do not break the baseline heuristic itinerary.
- Metrics history includes tokens, cost, and latency percentiles (p50/p95/p99) plus deltas.

### Heuristics & Limits
- Nights default: 5 (if not specified).
- Nights clamped 1–30; date spans >60 days ignored for duration.
- Travelers default: 2 adults.
- Budget scaling: If stated budget < heuristic total, pricing scales proportionally.
- Destination extraction: lexicon + simple capitalized token heuristic (capped at 5).
- Interests: keyword list (beach, museum, food, adventure, luxury, relax, culture, nightlife, hiking, family, romantic, history, art, shopping).
- Rate limiting (default): 20 AI requests per minute per IP (sliding window), 429 on exceed.
- Optional token bucket: set `AI_BUCKET_CAPACITY` (>0) & `AI_BUCKET_REFILL_MS` (ms per token). Provides burst absorption while smoothing average rate.
- Caching: SHA-256 hash key (first 32 chars) LRU (50 entries) avoids recompute.

### AI Config Endpoint
`GET /api/ai/config` → `{ hybridLLM, rateLimit: { strategy, ... }, metricsHistoryMax, snapshotIntervalMs }`
Use this to dynamically reflect capabilities (e.g., show token sparkline only if hybrid mode is active & tokens accumulating).

### Additional Environment Variables
| Variable | Purpose |
|----------|---------|
| API_TOKEN | Enables bearer auth + session/draft scoping (LOCK badge) |
| HYBRID_LLM=1 | Activates hybrid enhancement adapter & token/cost metrics |
| AI_BUCKET_CAPACITY | Enables token bucket limiter (capacity) |
| AI_BUCKET_REFILL_MS | Milliseconds per token refill for bucket limiter |

### Environment
Set `VITE_API_BASE` to point the frontend to the local API server (default `http://localhost:4000`).

#### Additional Server Env Vars
| Var | Purpose |
|-----|---------|
| API_TOKEN | Enables bearer auth + token-scoped drafts/sessions (LOCK badge) |
| HYBRID_LLM=1 | Activates hybrid enhancement adapter (`llmAdapter.js`) |
| AI_BUCKET_CAPACITY | Enable token bucket limiter (capacity per IP) |
| AI_BUCKET_REFILL_MS | Milliseconds per refill token (token bucket) |

### AI Config Endpoint (New)
`GET /api/ai/config` → `{ hybridLLM, rateLimit: { strategy, ...params }, metricsHistoryMax, snapshotIntervalMs }`
Useful for dynamically shaping UI (e.g., showing burst allowance or hybrid indicators). Client can poll once on mount.

### Future (Planned Evolution)
- Replace heuristic parser with LLM behind confidence gating & patch refinement.
- Geo enrichment (lat/lng, region inference) and supplier availability hints.
- Multi-turn conversational refinement (PATCH itinerary suggestions).
- Price source integration (lodging/activity vendor APIs) with margin logic.
- Persist analytics into a warehouse (current: local log `server/data/ai_analytics.log`).

## Security & Compliance Framework

### 🛡️ Enterprise-Grade Protection

CollEco Travel implements comprehensive security, compliance, and brand protection safeguards:

**POPI Act Compliance** (South African Data Protection):
- Explicit user consent before account creation
- Complete audit trails (3+ year retention)
- Data encryption (AES-256 at rest, TLS 1.3 in transit)
- User rights (access, correct, delete, portability)
- Data breach notification (<72 hours)

**Payment Security** (PCI DSS Level 1):
- Zero card data storage (tokenization only)
- 3D Secure verification (>R5,000 transactions)
- Quarterly security audits
- Annual penetration testing
- Real-time fraud detection

**Partner Agreement Enforcement**:
- Service Level Agreement (response time <2 hours, confirmation <4 hours)
- Quality standards (photos, cleanliness, accuracy)
- SLA monitoring with automated escalation
- Appeal process (30-day window)
- Blacklist system (permanent for violations)

**Brand Protection**:
- Fraud detection (registration, booking, payment)
- Zero-tolerance discrimination policy
- Guest safety standards enforcement
- Review authenticity verification
- Reputation monitoring and metrics

### 📋 Documentation

**Complete framework documentation is available in `docs/`**:

| Document | Purpose | Audience |
|----------|---------|----------|
| `docs/INDEX.md` | Navigation & quick lookup | Everyone |
| `docs/EXECUTIVE_SUMMARY.md` | Overview & timeline | Leadership |
| `docs/SECURITY_AND_BRAND_PROTECTION.md` | Security procedures | Technical, Compliance |
| `docs/PARTNER_AGREEMENT_ENFORCEMENT.md` | Partner SLA & enforcement | Legal, Operations |
| `docs/IMPLEMENTATION_ROADMAP.md` | 8-week implementation plan | Developers |
| `docs/DEV_QUICK_REFERENCE.md` | Implementation checklists | Developers |

### 🚀 Implementation Status

- ✅ **Complete**: Legal consent component, POPI Act framework, partner SLA terms, fraud detection architecture, security procedures
- 🔄 **Next**: Phase 1 development (integrate consent into all registration flows, implement backend API)
- 📅 **Timeline**: 8 weeks to production (Phase 1-4)
- 💰 **Investment**: R900k-1M + 2-4% payment processing fees

**Start here**: Read `docs/EXECUTIVE_SUMMARY.md` for overview and next steps.

### Key Requirements

**Before Production Launch**:
- [ ] External legal counsel approves all terms (POPI Act compliance)
- [ ] Penetration testing completed (zero critical vulnerabilities)
- [ ] Staff trained on compliance procedures
- [ ] Real contact information (no placeholders)
- [ ] Payment processor integrated (PayFast recommended)
- [ ] Audit logging operational
- [ ] Backup and disaster recovery tested

For detailed implementation guide, see `docs/IMPLEMENTATION_ROADMAP.md`.

## Release Notes (Addendum)
 v31 (Unreleased): AI Itinerary Generator MVP — heuristic parser + streaming & single-shot UI panel.
 v32 (December 8, 2025): Security & Compliance Framework — Complete POPI Act framework, partner SLA enforcement, fraud detection, brand protection systems documented and ready for implementation.


\n# CI retrigger 2025-10-20T08:01:13.0098947+02:00
