# Branding Assets Guide

This project expects branding images to live under `public/assets/` so they are served at stable URLs (not fingerprinted by the bundler). The React components and PWA metadata reference those public paths directly.

## Required Files
| Purpose | Filename | Recommended Size | Notes |
|---------|----------|------------------|-------|
| Primary App Icon / Favicon / PWA 512 | `colleco-logo.png` | 512x512 (transparent) | Master logo. Used everywhere; resized for smaller uses. |
| PWA 192 (optional but recommended) | `colleco-logo-192.png` | 192x192 | If absent, `colleco-logo.png` still works, but Lighthouse may warn. |
| Globe footer icon | `Globeicon.png` | 256x256 (or 128x128+) | Displayed small in footer; keep adequate padding. |
| Favicon multi-size (optional) | `favicon.ico` | 16,32,48 inside ICO | Generated from logo for legacy agents. |

## Current Code Expectations
- HTML & manifest: `/assets/colleco-logo.png?v=14`
- Navbar: `/assets/colleco-logo.png?v=14`
- Footer globe: `/assets/Globeicon.png?v=14`
- Service Worker cache version: `colleco-static-v14`

If you introduce new image content, bump the version query (e.g. `?v=15`) and also bump the SW cache constant so clients reliably re-fetch.

## Adding / Updating Assets
1. Drop the PNGs into `public/assets/` using the exact filenames.
2. (Optional) Generate additional sizes:
   - 192: resize the 512 master maintaining transparency.
   - ICO: include 16, 32, 48 px layers.
3. Bump version query & SW cache.
4. Hard reload with DevTools (Disable cache) + unregister old service worker.

## Service Worker Notes
The SW no longer precaches branding images (v14) to avoid install failures if they are missing. It will try network first; if absent you get an empty 204 response (no broken image icon). Once you add the real files and bump versions, users will start seeing them.

## Favicon / ICO Generation (PowerShell Example)
```powershell
# Requires ImageMagick (magick) installed and on PATH
magick convert colleco-logo.png -resize 48x48 favicon-48.png
magick convert colleco-logo.png -resize 32x32 favicon-32.png
magick convert colleco-logo.png -resize 16x16 favicon-16.png
magick convert favicon-16.png favicon-32.png favicon-48.png favicon.ico
```
Place `favicon.ico` at project root `public/` (same level as `index.html`) or inside `public/` (served as `/favicon.ico`). Add a `<link rel="icon" href="/favicon.ico?v=14">` before the PNG link.

## Versioning Strategy
| Element | What to Change | Why |
|---------|----------------|-----|
| Query Param `?v=` | Increment (e.g. 14→15) | Forces browser refetch favicons/images. |
| SW Cache Name | Update suffix (e.g. `-v15`) | Clears old precached entries. |
| Manifest icons (if new files) | Update sizes / filenames | Ensures PWA install uses correct assets. |

## Troubleshooting Checklist
1. Open DevTools > Network, disable cache, load `/assets/colleco-logo.png?v=14` – must be 200 OK.
2. Unregister old service worker, reload, ensure new SW shows `colleco-static-v14`.
3. If favicon still old, close all tabs for the origin, reopen, or clear only cached images/files.
4. Confirm no build step is moving/renaming files (keep them in `public/assets`).

## Future Improvements
- Add a dedicated Open Graph image `og-cover.png` (1200x630) for richer shares.
- Provide dark-mode variant if needed (name suggestion: `colleco-logo-dark.png`).
- Automate asset resizing with an npm script.

---
Maintain this document when branding assets or versioning practices change.
