import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import path from 'path';

const sources = [
  ['src/assets/colleco-logo.png', 'public/assets/colleco-logo.png'],
  ['src/assets/Globeicon.png', 'public/assets/Globeicon.png']
];

for (const [, target] of sources) {
  const dir = target.split('/').slice(0, -1).join('/');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

for (const [src, dest] of sources) {
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`[branding] Copied ${src} -> ${dest}`);
  } else {
    console.warn(`[branding] Missing source file: ${src}`);
  }
}

// Optional: generate lightweight WebP thumbnails for Globeicon to reduce payload size.
try {
  const sharpModule = await import('sharp');
  const sharp = sharpModule.default || sharpModule;
  const src = 'src/assets/Globeicon.png';
  if (existsSync(src)) {
    const outDir = 'public/assets';
    const variants = [
      { size: 64, name: 'Globeicon-64.webp' },
      { size: 128, name: 'Globeicon-128.webp' },
      { size: 160, name: 'Globeicon-160.webp' },
    ];
    for (const v of variants) {
      const outPath = path.join(outDir, v.name);
      await sharp(src)
        .resize(v.size, v.size, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(outPath);
      console.log(`[branding] Generated ${outPath}`);
    }
  }
} catch (e) {
  // Sharp not available or failed; skip without breaking build
  // You can run `npm i sharp` locally to enable WebP thumbs
}
