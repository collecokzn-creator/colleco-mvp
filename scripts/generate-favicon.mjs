#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve paths safely across OS (Windows-friendly)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const src256 = path.resolve(root, 'public/assets/icons/colleco-logo-256.png');
const src512 = path.resolve(root, 'public/assets/icons/colleco-logo-512.png');
const outPath = path.resolve(root, 'public/favicon.ico');

(async () => {
  try {
    // Optional dependency: png-to-ico
    let toIco;
    try {
      ({ default: toIco } = await import('png-to-ico'));
    } catch (e) {
      console.warn('[favicon] png-to-ico not installed, skipping favicon.ico');
      process.exit(0);
    }
    // Optional dependency: sharp (for padding to square if needed)
    let sharpAvailable = true;
    let sharp;
    try {
      ({ default: sharp } = await import('sharp'));
    } catch (e) {
      sharpAvailable = false;
    }
    let srcPath = src256;
    if (!existsSync(srcPath)) {
      if (existsSync(src512)) {
        console.warn('[favicon] 256 png not found, using 512 png fallback');
        srcPath = src512;
      } else {
        console.warn('[favicon] No suitable source png found, skipping favicon.ico');
        process.exit(0);
      }
    }
    const buf = readFileSync(srcPath);
    try {
      const ico = await toIco(buf);
      writeFileSync(outPath, ico);
      console.log('[favicon] Generated favicon.ico');
    } catch (err) {
      if (err && err.code === 'ESIZE') {
        if (!sharpAvailable) {
          console.warn('[favicon] Source PNG not square and sharp not available; skipping favicon.ico');
          process.exit(0);
        }
        // Pad image to square then retry
        const image = sharp(buf);
        const meta = await image.metadata();
        const size = Math.max(meta.width || 0, meta.height || 0) || 512;
        const padded = await image
          .extend({
            top: Math.floor((size - (meta.height || size)) / 2),
            bottom: Math.ceil((size - (meta.height || size)) / 2),
            left: Math.floor((size - (meta.width || size)) / 2),
            right: Math.ceil((size - (meta.width || size)) / 2),
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png({ compressionLevel: 9 })
          .toBuffer();
        const ico = await toIco(padded);
        writeFileSync(outPath, ico);
        console.log('[favicon] Generated favicon.ico (padded to square)');
      } else {
        console.warn('[favicon] Failed to generate favicon.ico', err);
        process.exit(0);
      }
    }
  } catch (e) {
    console.warn('[favicon] Failed to generate favicon.ico', e);
    process.exit(0);
  }
})();
