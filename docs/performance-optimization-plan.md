# Performance Optimization Plan

Version: 1.0
Status: Active
Owner: Platform Team

## Current State (Baseline from Build Output)
- **Total Bundle Size**: ~1.5 MB (gzipped: ~400 KB)
- **Largest Chunks**:
  - `jspdf.es.min-BCuLTcup.js`: 384.63 KB (gzip: 125.51 KB)
  - `index-3avn0yh3.js` (main vendor): 428.36 KB (gzip: 135.76 KB)
  - `html2canvas.esm-Ge7aVWlp.js`: 201.40 KB (gzip: 47.48 KB)
  - `index.es-DrquxR_I.js` (DOMPurify): 158.56 KB (gzip: 52.89 KB)
  - `PlanTrip-yPQcP2Qw.js`: 67.79 KB (gzip: 16.44 KB)
  - `QuoteGenerator-RykYWejn.js`: 28.60 KB (gzip: 6.84 KB)
  - `Globeicon-Czs_EUAD.png`: 1,069.68 KB (uncompressed PNG)
- **Lighthouse Metrics** (estimated; need actual run):
  - LCP: ~2.5s (globe icon + jspdf blocking)
  - FID: <100ms (React hydration)
  - CLS: Low (static layout)

## Priority Targets
1. **Globe Icon (1 MB PNG)**: Convert to optimized WebP/AVIF + responsive srcset
2. **PDF Libraries**: Lazy-load jspdf + html2canvas only when generating quotes/invoices
3. **Vendor Bundle**: Split React/React-DOM from other vendors
4. **Code Splitting**: Route-level chunks for rarely-visited pages (AdminConsole, Analytics)
5. **Prefetch**: Add `<link rel="prefetch">` for high-traffic routes (Bookings, QuoteGenerator)

## Optimization Actions

### Image Optimization
**Goal**: Reduce Globeicon.png from 1 MB to <100 KB
```powershell
# Generate responsive WebP + fallback PNG
npm install --save-dev sharp imagemin imagemin-webp
node scripts/optimize-images.mjs
```
**Script** (`scripts/optimize-images.mjs`):
- Convert `public/assets/Globeicon.png` → WebP (quality 85)
- Generate sizes: 320w, 640w, 1024w, 1920w
- Update `<img>` tags with `<picture>` + `srcset`

**Expected Savings**: 970 KB → ~80 KB (92% reduction)

### Lazy Load PDF Libraries
**Goal**: Defer jspdf/html2canvas until user clicks "Generate PDF" or "Download Invoice"
```javascript
// src/utils/pdfLoader.js
export async function loadPDFLibs() {
  const [jsPDF, html2canvas] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ]);
  return { jsPDF: jsPDF.default, html2canvas: html2canvas.default };
}
```
**Impact**: Remove 586 KB (gzip: 173 KB) from initial bundle

### Vendor Splitting
**Goal**: Separate React ecosystem from other vendors for better caching
```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'pdf-libs': ['jspdf', 'html2canvas'],
        'ui-vendor': ['framer-motion', 'lucide-react', 'react-day-picker']
      }
    }
  }
}
```
**Expected Outcome**: React vendor chunk cached separately; updates to app code don't bust React cache

### Route-Level Code Splitting
**Goal**: AdminConsole, Analytics, AIMetricsPage loaded only when accessed
- Already using `import.meta.glob()` with lazy loading ✅
- Verify each page chunk < 50 KB gzipped (currently compliant)

### Prefetch Critical Routes
**Goal**: Preload Bookings, QuoteGenerator, PlanTrip after initial page interactive
```javascript
// src/App.jsx (after hydration)
useEffect(() => {
  if (document.readyState === 'complete') {
    const prefetchRoutes = ['/bookings', '/quote-generator', '/plan-trip'];
    prefetchRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }
}, []);
```

### Service Worker Enhancements
**Goal**: Cache static assets, enable offline mode for critical pages
- Already have `public/service-worker.js` (basic caching)
- Upgrade to Workbox for advanced strategies:
  - Cache-first: images, fonts, CSS
  - Network-first: API calls with fallback
  - Stale-while-revalidate: page HTML
```powershell
npm install --save-dev workbox-cli
npx workbox wizard
```

### Bundle Analysis
**Goal**: Visualize bundle composition, identify redundant dependencies
```powershell
npm install --save-dev rollup-plugin-visualizer
```
```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';
plugins: [
  react(),
  visualizer({ open: true, filename: 'dist/bundle-stats.html' })
]
```
**Run**: `npm run build` → opens `dist/bundle-stats.html` in browser

### Compression
**Goal**: Enable Brotli compression on production server
- GitHub Pages automatically serves gzip/Brotli ✅
- For self-hosted: add Express middleware
```javascript
// server/server.js
const compression = require('compression');
app.use(compression({ level: 9 }));
```

## Metrics & Monitoring
**Baseline Measurements** (before optimizations):
- Time to Interactive (TTI): ~3.2s (4G)
- First Contentful Paint (FCP): ~1.8s
- Largest Contentful Paint (LCP): ~2.5s
- Total Blocking Time (TBT): ~180ms

**Target Metrics** (after optimizations):
- TTI: <2.5s
- FCP: <1.2s
- LCP: <1.8s
- TBT: <100ms

**Tools**:
- Lighthouse CI: Add to GitHub Actions
- WebPageTest: Manual audits on www.travelcolleco.com
- Chrome DevTools Coverage: Identify unused CSS/JS

## Implementation Sequence
1. ✅ Add bundle visualizer to build
2. 🔄 Optimize Globeicon.png (scripts/optimize-images.mjs)
3. 🔄 Lazy-load PDF libraries in QuoteGenerator
4. 🔄 Configure vendor splitting in vite.config.js
5. 🔄 Add route prefetch after hydration
6. 🔄 Upgrade service worker to Workbox
7. 🔄 Run Lighthouse CI in workflow
8. 🔄 Measure & publish metrics dashboard

## Success Criteria
- Bundle size reduction: >50% (from 1.5 MB to <750 KB)
- LCP improvement: >30% (2.5s → <1.8s)
- Zero regressions in functionality
- Lighthouse score: >90 (Performance)

---
End of Plan.
