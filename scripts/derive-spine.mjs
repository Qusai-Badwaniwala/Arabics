// Pulls the top-N Quranic lemmas out of the corpus into a committed spine file.
//
// The corpus lives in content-inbox/, which is gitignored (0.69 GB), so a fresh
// clone cannot run this. That is why the spine is committed: everything the app
// and the gate need is derivable from files in the repo. Run this only when the
// vocabulary target changes (Phase 3 takes it to 2,000).
//
// Usage: node scripts/derive-spine.mjs [count]

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Never hand-parse a file URL — the space in "Project Arabic mastery" stays
// percent-encoded and readdir fails. (progress.md, 2026-08-11.)
const repo = new URL('../', import.meta.url);
const at = (p) => fileURLToPath(new URL(p, repo));

const count = Number(process.argv[2] ?? 300);
if (!Number.isInteger(count) || count < 1) {
  throw new Error(`count must be a positive integer, got ${process.argv[2]}`);
}

const src = at('content-inbox/vocabulary/quran-lemma-frequency-DERIVED.tsv');
let raw;
try {
  raw = readFileSync(src, 'utf8');
} catch (err) {
  // Loud, not silent: a missing corpus means this script could not do its job.
  throw new Error(
    `Corpus missing: ${src}\nThis script needs content-inbox/, which is not in ` +
      `git. The committed spine at content/lexeme-spine.tsv is what the app ` +
      `builds from — you probably do not need to run this.`,
    { cause: err },
  );
}

const rows = raw
  .replace(/^﻿/, '')
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => line.split('\t'));

if (rows.length < count) {
  throw new Error(`corpus has ${rows.length} lemmas, asked for ${count}`);
}

const out = ['rank\tlemma\troot\tpos\tcount'];
for (const [rank, lemma, root, pos, n] of rows.slice(0, count)) {
  out.push([rank, lemma.normalize('NFC'), root ?? '', pos, n].join('\t'));
}

const dest = at('content/lexeme-spine.tsv');
writeFileSync(dest, out.join('\n') + '\n', 'utf8');
console.log(`wrote ${count} lemmas to content/lexeme-spine.tsv`);
