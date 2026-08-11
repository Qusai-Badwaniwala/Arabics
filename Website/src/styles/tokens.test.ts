import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

// Design spec §9: two themes on one token file. A colour written anywhere else
// is a second source of truth, and the two will drift the first time one moves.
const COLOUR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|lab|color-mix)\(/;

const src = fileURLToPath(new URL('../', import.meta.url));
const website = fileURLToPath(new URL('../../', import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return ['.ts', '.tsx', '.css', '.html'].includes(extname(entry.name))
      ? [path]
      : [];
  });
}

const files = [
  ...walk(src),
  join(website, 'index.html'),
  fileURLToPath(new URL('../../../vite.config.ts', import.meta.url)),
].filter((f) => !f.endsWith('tokens.css'));

test('the app has at least one file to scan', () => {
  // A check that silently scans nothing is worse than no check at all.
  expect(files.length).toBeGreaterThan(5);
});

test.each(files)('%s holds no colour literal', (file) => {
  const offenders = readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((line, i) => [i + 1, line] as const)
    .filter(([, line]) => COLOUR.test(line));

  expect(
    offenders.map(([n, line]) => `${n}: ${line.trim()}`),
    'colours belong in tokens.css',
  ).toEqual([]);
});
