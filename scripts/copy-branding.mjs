import { copyFileSync, mkdirSync, existsSync } from 'fs';

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
