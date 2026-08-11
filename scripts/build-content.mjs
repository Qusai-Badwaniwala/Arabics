// content/lexeme-spine.tsv (from the corpus) + content/lexeme-glosses.tsv (by
// hand) -> the JSON the app imports. Both inputs are committed, so this runs
// anywhere and the gate can prove the committed JSON is not stale.
//
//   node scripts/build-content.mjs           write the files
//   node scripts/build-content.mjs --check   fail if what is committed differs
//
// Everything mechanical (Arabic string, root, part of speech, frequency) comes
// from the corpus and is never re-typed by hand. The gloss file is keyed by
// rank for the same reason: a mistyped diacritic would silently join the wrong
// word to the wrong meaning, and nothing downstream could notice.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = new URL('../', import.meta.url);
const at = (p) => fileURLToPath(new URL(p, repo));

const POS = { P: 'particle', N: 'noun', V: 'verb' };
// Arabic letters, harakat and superscript marks. Anything else in a hand-typed
// display override is a paste accident.
const ARABIC_ONLY = /^[ء-ٰٕٱۡ ]+$/;

const read = (p) => readFileSync(at(p), 'utf8').replace(/^﻿/, '');

function rows(text) {
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => l.split('\t'));
}

export function buildContent() {
  const spine = rows(read('content/lexeme-spine.tsv')).slice(1);
  const glossRows = rows(read('content/lexeme-glosses.tsv'));

  const glosses = new Map();
  for (const [rank, gloss, display] of glossRows) {
    const n = Number(rank);
    if (!Number.isInteger(n))
      throw new Error(`gloss rank not a number: ${rank}`);
    if (glosses.has(n)) throw new Error(`gloss rank ${n} appears twice`);
    if (!gloss?.trim()) throw new Error(`gloss rank ${n} is empty`);
    if (display !== undefined && !ARABIC_ONLY.test(display)) {
      throw new Error(
        `display override for rank ${n} is not Arabic: ${display}`,
      );
    }
    glosses.set(n, { gloss: gloss.trim(), display: display?.trim() });
  }

  const lexemes = [];
  const seen = new Set();
  spine.forEach(([rank, lemma, root, pos, count], i) => {
    const n = Number(rank);
    if (n !== i + 1)
      throw new Error(`spine rank ${rank} out of order at row ${i + 1}`);
    if (!POS[pos])
      throw new Error(`unknown part of speech "${pos}" at rank ${n}`);

    const key = lemma.normalize('NFC');
    if (seen.has(key))
      throw new Error(`lemma repeated in the spine at rank ${n}`);
    seen.add(key);

    const g = glosses.get(n);
    if (!g) throw new Error(`rank ${n} has no gloss`);

    lexemes.push({
      // The vocalised corpus lemma is the id. It is intrinsic to the word, so
      // re-deriving the spine at a different size cannot repoint a saved card
      // at a different meaning the way a positional id would.
      id: key,
      ar: (g.display ?? lemma).normalize('NFC'),
      root: root ? root.normalize('NFC') : null,
      pos: POS[pos],
      gloss: g.gloss,
      rank: n,
      quranCount: Number(count),
      level: 1,
      // My glosses, not a scholar's. Phase 3's corpus import is what clears it.
      unverified: true,
    });
  });

  for (const n of glosses.keys()) {
    if (n < 1 || n > lexemes.length)
      throw new Error(`gloss rank ${n} has no lemma`);
  }

  const byRoot = new Map();
  for (const lex of lexemes) {
    if (!lex.root) continue;
    if (!byRoot.has(lex.root)) byRoot.set(lex.root, []);
    byRoot.get(lex.root).push(lex.id);
  }
  const roots = [...byRoot]
    .map(([root, ids]) => ({ root, radicals: [...root], lexemes: ids }))
    .sort(
      (a, b) =>
        b.lexemes.length - a.lexemes.length || a.root.localeCompare(b.root),
    );

  const review = ['rank\tlemma\tdisplay\troot\tpos\tgloss'];
  for (const l of lexemes) {
    review.push([l.rank, l.id, l.ar, l.root ?? '', l.pos, l.gloss].join('\t'));
  }

  return {
    'Website/src/content/lexemes.json': JSON.stringify(lexemes, null, 1) + '\n',
    'Website/src/content/roots.json': JSON.stringify(roots, null, 1) + '\n',
    'content/lexeme-review.tsv': review.join('\n') + '\n',
  };
}

const files = buildContent();
const check = process.argv.includes('--check');

if (check) {
  const stale = Object.keys(files).filter((p) => {
    let current;
    try {
      current = read(p);
    } catch {
      return true;
    }
    return current !== files[p];
  });
  if (stale.length) {
    console.error(
      `Committed content is stale:\n  ${stale.join('\n  ')}\n` +
        `Run: npm run content`,
    );
    process.exit(1);
  }
  const n = Object.keys(files).length;
  console.log(`content up to date (${n} files)`);
} else {
  for (const [p, body] of Object.entries(files)) {
    mkdirSync(dirname(at(p)), { recursive: true });
    writeFileSync(at(p), body, 'utf8');
  }
  console.log(
    `wrote ${Object.keys(files).length} files; ` +
      `${JSON.parse(files['Website/src/content/lexemes.json']).length} lexemes, ` +
      `${JSON.parse(files['Website/src/content/roots.json']).length} roots`,
  );
}
