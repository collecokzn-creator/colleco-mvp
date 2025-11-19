#!/usr/bin/env node
import { mkdirSync, copyFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Optional dependency: sharp (only if installed)
let sharpAvailable = true;
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  sharpAvailable = false;
}

// Resolve paths safely across OS (Windows-friendly)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const srcIcon = path.resolve(root, 'src/assets/colleco-logo.png');
const outDir = path.resolve(root, 'public/assets/icons');
const shotsDir = path.resolve(root, 'public/assets/screenshots');

mkdirSync(outDir, { recursive: true });
mkdirSync(shotsDir, { recursive: true });

async function ensure(size) {
  const outPath = path.join(outDir, `colleco-logo-${size}.png`);
  if (!sharpAvailable) {
    // fallback: just copy original once (first call) if size 512, skip others
    if (!existsSync(outPath) && (size === 512 || size === 256)) {
      // Copy the base icon to ensure at least 256 and 512 exist for downstream scripts (e.g., favicon)
      copyFileSync(srcIcon, outPath);
    }
    return;
  }
  await sharp(srcIcon)
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 248, b: 241, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

const sizes = [16, 32, 180, 192, 256, 384, 512, 1024];

async function generateScreenshots() {
  if (!sharpAvailable) return;
  // Create simple padded variants for portrait and landscape from square icon as placeholder.
  const base = sharp(srcIcon).resize(1024, 1024, { fit: 'contain', background: { r:255,g:248,b:241,alpha:1 } });
  const portraitPath = path.join(shotsDir, 'screenshot-1080x1920.png');
  const landscapePath = path.join(shotsDir, 'screenshot-1920x1080.png');
  // Generate cream background padded images (placeholder); real app UI screenshots can replace these later.
  await base
    .extend({ top:448, bottom:448, left:28, right:28, background: { r: 255, g:248, b:241, alpha:1 } })
    .resize(1080, 1920)
    .png({ compressionLevel: 9 })
    .toFile(portraitPath);
  await base
    .extend({ top:28, bottom:28, left:448, right:448, background: { r:255,g:248,b:241,alpha:1 } })
    .resize(1920, 1080)
    .png({ compressionLevel: 9 })
    .toFile(landscapePath);
  return [portraitPath, landscapePath];
}

(async () => {
  try {
    await Promise.all(sizes.map(ensure));
    await generateScreenshots();
    console.log('Generated PWA icons:', sizes.join(', '));
  } catch (err) {
    console.error('Icon generation failed:', err);
    process.exit(1);
  }
})();
