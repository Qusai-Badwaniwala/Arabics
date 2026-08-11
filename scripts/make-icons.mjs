// Renders the PWA icons from tokens.css + the bundled Amiri font, so the icon
// on the home screen cannot drift from the app's own palette and typeface.
//
// Committed output: Website/public/icon-192.png, icon-512.png,
// icon-maskable-512.png. Re-run only when the mark or the palette changes:
//
//   node scripts/make-icons.mjs
//
// The mark is ʿayn — the letter عربي starts with, and the most unmistakably
// Arabic silhouette at 48px, which is the size that actually matters.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const repo = new URL('../', import.meta.url);
const at = (p) => fileURLToPath(new URL(p, repo));

const tokens = readFileSync(at('Website/src/styles/tokens.css'), 'utf8');
const token = (name) => {
  const hit = new RegExp(`--${name}:\\s*([^;]+);`).exec(tokens);
  if (!hit?.[1]) throw new Error(`tokens.css has no --${name}`);
  return hit[1].trim();
};

const font = readFileSync(
  at('node_modules/@fontsource/amiri/files/amiri-arabic-400-normal.woff2'),
).toString('base64');

/** @param {number} scale glyph size as a fraction of the canvas */
const page = (scale) => `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: Amiri;
    src: url(data:font/woff2;base64,${font}) format('woff2');
  }
  html, body { margin: 0; }
  body {
    width: 512px; height: 512px;
    display: grid; place-items: center;
    background: ${token('ground')};
  }
  span {
    font-family: Amiri, serif;
    font-size: ${Math.round(512 * scale)}px;
    line-height: 1;
    color: ${token('accent')};
    /* Amiri's em box is far larger than the ink of a single ʿayn, and the
       glyph sits low and to the right inside it. These two factors were
       measured off a render, not guessed — re-measure if the glyph changes. */
    transform: translate(
      ${Math.round(512 * scale * -0.14)}px,
      ${Math.round(512 * scale * -0.33)}px
    );
  }
</style>
<span dir="rtl" lang="ar">ع</span>
`;

const out = at('Website/public');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
try {
  for (const [file, scale, size] of [
    ['icon-512.png', 0.7, 512],
    ['icon-192.png', 0.7, 192],
    // Maskable icons get cropped to a circle on Android; 0.8 of the canvas is
    // the only region guaranteed to survive it.
    ['icon-maskable-512.png', 0.56, 512],
  ]) {
    const tab = await browser.newPage({
      viewport: { width: 512, height: 512 },
      deviceScaleFactor: size / 512,
    });
    const tmp = join(tmpdir(), `arabic-icon-${file}.html`);
    writeFileSync(tmp, page(scale), 'utf8');
    await tab.goto(`file://${tmp.replace(/\\/g, '/')}`);
    await tab.screenshot({ path: join(out, file) });
    await tab.close();
    console.log(`wrote Website/public/${file}`);
  }
} finally {
  await browser.close();
}
