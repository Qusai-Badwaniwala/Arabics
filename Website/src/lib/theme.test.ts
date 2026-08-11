import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { THEME_KEY } from './theme.ts';

// index.html applies the stored theme before first paint, so it must read the
// same key theme.ts writes. Two literals, one value — this is the test that
// fails if they drift.
test('index.html reads the key theme.ts writes', () => {
  const html = readFileSync(
    fileURLToPath(new URL('../../index.html', import.meta.url)),
    'utf8',
  );
  const key = /localStorage\.getItem\('([^']+)'\)/.exec(html);
  expect(key?.[1], 'index.html no longer reads a theme from localStorage').toBe(
    THEME_KEY,
  );
});
