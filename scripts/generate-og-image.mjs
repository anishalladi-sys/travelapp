// Generates public/og-image.png (1200x630) from inline SVG so the social card
// matches the design tokens without needing an image generator.
//
// This is a stopgap with the right palette and composition. If you want a
// photographic or illustrated card, replace the file with an AI-generated one
// using the prompt in public/OG-IMAGE-PROMPT.txt -- the dimensions matter,
// the filename matters, nothing else in the app does.
//
// Run: node scripts/generate-og-image.mjs

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, "..", "public", "og-image.png");

const W = 1200;
const H = 630;

// Matches app/globals.css --clay-surface / --clay-raised / --primary / foreground.
const SURFACE = "#f5f0eb";
const RAISED = "#faf6f0";
const PRESSED = "#ebe3da";
const ACCENT = "#c4724a";
const INK = "#332a20";
const MUTED = "#6b6055";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
    <filter id="softer" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="34"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="${SURFACE}"/>

  <!-- Clay panel: a raised slab with a very soft drop shadow. -->
  <ellipse cx="600" cy="330" rx="470" ry="230" fill="${PRESSED}" opacity="0.55" filter="url(#softer)"/>
  <rect x="96" y="66" width="1008" height="498" rx="44" fill="${RAISED}"/>
  <rect x="96" y="66" width="1008" height="498" rx="44" fill="none" stroke="${PRESSED}" stroke-width="3"/>

  <!-- Left: wordmark. Text here is safe. Social platforms put their own
       caption below the image, they do not cover the artwork. -->
  <text x="168" y="252" font-family="Georgia, 'Playfair Display', serif" font-size="62" font-weight="700" fill="${INK}">Travel App</text>
  <text x="170" y="308" font-family="Georgia, serif" font-size="27" fill="${MUTED}">Plan your adventures</text>

  <!-- Terracotta rule between the two halves. -->
  <rect x="168" y="348" width="86" height="5" rx="2.5" fill="${ACCENT}"/>

  <text x="168" y="418" font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="23" fill="${MUTED}">Create trips, organise activities by date,</text>
  <text x="168" y="452" font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="23" fill="${MUTED}">and keep budgets and documents in one place.</text>

  <!-- Right: a clay suitcase, drawn with soft shadows and no gloss. -->
  <g>
    <ellipse cx="856" cy="470" rx="196" ry="30" fill="${PRESSED}" opacity="0.8" filter="url(#soft)"/>

    <!-- handle -->
    <path d="M 790 262 L 790 214 A 26 26 0 0 1 816 188 L 896 188 A 26 26 0 0 1 922 214 L 922 262"
          fill="none" stroke="${ACCENT}" stroke-width="17" stroke-linecap="round"/>

    <!-- body -->
    <rect x="742" y="262" width="228" height="196" rx="26" fill="${RAISED}"/>
    <rect x="742" y="262" width="228" height="196" rx="26" fill="none" stroke="${PRESSED}" stroke-width="3"/>

    <!-- strap -->
    <rect x="845" y="262" width="22" height="196" fill="${ACCENT}" opacity="0.9"/>

    <!-- lid seam -->
    <rect x="742" y="338" width="228" height="7" fill="${SURFACE}" opacity="0.85"/>

    <!-- travel sticker, the one saturated detail -->
    <circle cx="786" cy="420" r="21" fill="${ACCENT}" opacity="0.18"/>
    <circle cx="786" cy="420" r="9" fill="${ACCENT}" opacity="0.75"/>
  </g>
</svg>`.replace(/<!--[^>]*?-->/gs, "");

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
writeFileSync(outPath, png);
console.log(`wrote public/og-image.png  ${W}x${H}  ${(png.length / 1024).toFixed(1)} KB`);
