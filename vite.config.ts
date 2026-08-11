import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// One source of truth for colour (CLAUDE.md rule 5): the PWA manifest and the
// <meta name="theme-color"> are read out of tokens.css at build time rather
// than re-typed here, so they cannot drift from the stylesheet.
const tokens = readFileSync(
  fileURLToPath(new URL('./Website/src/styles/tokens.css', import.meta.url)),
  'utf8',
);

function token(name: string): string {
  // First occurrence = the :root (day) block, which is what a cold install shows.
  const hit = new RegExp(`--${name}:\\s*([^;]+);`).exec(tokens);
  if (!hit?.[1]) throw new Error(`tokens.css has no --${name}`);
  return hit[1].trim();
}

const ground = token('ground');

export default defineConfig({
  root: 'Website',
  plugins: [
    react(),
    {
      name: 'theme-color-from-tokens',
      transformIndexHtml: (html) =>
        html.replace(
          '</title>',
          `</title>\n    <meta name="theme-color" content="${ground}" />`,
        ),
    },
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Arabic Mastery',
        short_name: 'Arabic',
        description: 'Read Quran and classical Arabic. Offline, on-device.',
        lang: 'en',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: ground,
        theme_color: ground,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // woff2 is NOT in the plugin default glob. Without it the Arabic font
        // is a network request, and this app has no network at runtime.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
