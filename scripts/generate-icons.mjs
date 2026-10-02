// Generates the PWA icon set from an inline SVG so the icons cannot drift from
// the design tokens in app/globals.css. Run with: node scripts/generate-icons.mjs
//
// Output: public/icon-192.png, icon-512.png, icon-maskable-512.png,
//         apple-touch-icon.png, favicon-16x16.png, favicon-32x32.png
//
// These are committed, so this script only needs re-running if the palette
// changes. Palette values are read from the CSS below by hand and must be kept
// in sync with app/globals.css.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");

// Matches app/globals.css: --clay-surface / --clay-raised / --primary.
const CLAY_SURFACE = "#f5f0eb";
const CLAY_RAISED = "#faf6f0";
const TERRACOTTA = "#c4724a";
const INK = "#332a20";

/**
 * A suitcase mark, drawn as flat shapes so it stays legible at 16px. `padding`
 * is a fraction of the canvas: maskable icons must keep their content inside
 * the safe circle, which Android crops to.
 */
function iconSvg({ size, padding = 0.18, rounded = true }) {
  const inner = size * (1 - padding * 2);
  const radius = rounded ? size * 0.22 : 0;
  const x = size * padding;
  const y = size * padding;
  const cx = x + inner / 2;

  // Suitcase body and handle, expressed inside the padded inner square.
  const bodyW = inner * 0.72;
  const bodyH = inner * 0.54;
  const bodyX = cx - bodyW / 2;
  const bodyY = y + inner * 0.34;
  const bodyR = inner * 0.07;
  const stroke = Math.max(1, size * 0.012);

  // Handle: a symmetric inverted-U sitting on top of the body. Built from
  // explicit coordinates around the centre line so it cannot drift off-axis.
  const handleW = inner * 0.28;
  const handleH = inner * 0.13;
  const handleX = cx - handleW / 2;
  const handleY = y + inner * 0.21;
  const handleR = inner * 0.05;
  const handleStroke = stroke * 2.4;

  const strapW = inner * 0.07;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${CLAY_SURFACE}"/>
  <path d="M ${handleX} ${bodyY}
           L ${handleX} ${handleY + handleR}
           A ${handleR} ${handleR} 0 0 1 ${handleX + handleR} ${handleY}
           L ${handleX + handleW - handleR} ${handleY}
           A ${handleR} ${handleR} 0 0 1 ${handleX + handleW} ${handleY + handleR}
           L ${handleX + handleW} ${bodyY}"
        fill="none" stroke="${TERRACOTTA}" stroke-width="${handleStroke}" stroke-linecap="round"/>
  <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${bodyR}" fill="${CLAY_RAISED}"/>
  <rect x="${cx - strapW / 2}" y="${bodyY}" width="${strapW}" height="${bodyH}" fill="${TERRACOTTA}" opacity="0.85"/>
  <rect x="${bodyX}" y="${bodyY + bodyH * 0.34}" width="${bodyW}" height="${stroke * 1.6}" fill="${CLAY_SURFACE}" opacity="0.6"/>
</svg>`;
}

const targets = [
  { file: "icon-192.png", size: 192, options: { padding: 0.18 } },
  { file: "icon-512.png", size: 512, options: { padding: 0.18 } },
  // Maskable: Android crops to a circle inside the safe zone, so content needs
  // a much larger inset and a square background (no rounded corners).
  {
    file: "icon-maskable-512.png",
    size: 512,
    options: { padding: 0.3, rounded: false },
  },
  // Apple applies its own rounding and ignores transparency.
  {
    file: "apple-touch-icon.png",
    size: 180,
    options: { padding: 0.14, rounded: false },
  },
  { file: "favicon-16x16.png", size: 16, options: { padding: 0.1 } },
  { file: "favicon-32x32.png", size: 32, options: { padding: 0.12 } },
];

mkdirSync(publicDir, { recursive: true });

for (const { file, size, options } of targets) {
  const svg = iconSvg({ size, ...options });
  const png = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(resolve(publicDir, file), png);
  console.log(
    `${file.padEnd(26)} ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`,
  );
}

console.log(`\nwrote ${targets.length} icons to public/`);
console.log(
  `palette: surface ${CLAY_SURFACE} · raised ${CLAY_RAISED} · accent ${TERRACOTTA} · ink ${INK}`,
);
