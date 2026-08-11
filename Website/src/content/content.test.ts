import { expect, test } from 'vitest';
import { byRank, lexemeById, lexemes, roots } from './content.ts';

// content.ts casts the generated JSON to its interfaces. These are the checks
// that make that cast honest — a generator change that breaks the shape fails
// here rather than at runtime on the learner's phone.

const ARABIC = /^[؀-ۿݐ-ݿ ]+$/;

test('every lexeme has the shape the app relies on', () => {
  expect(lexemes.length).toBeGreaterThan(0);
  for (const l of lexemes) {
    expect(typeof l.id, l.id).toBe('string');
    expect(typeof l.ar, l.id).toBe('string');
    expect(typeof l.gloss, l.id).toBe('string');
    expect(l.gloss.trim(), l.id).not.toBe('');
    expect(['noun', 'verb', 'particle'], l.id).toContain(l.pos);
    expect(Number.isInteger(l.rank), l.id).toBe(true);
    expect(l.quranCount, l.id).toBeGreaterThan(0);
    expect(l.root === null || typeof l.root === 'string', l.id).toBe(true);
  }
});

test('ranks are a complete run from 1, with no repeats', () => {
  expect(byRank.map((l) => l.rank)).toEqual(lexemes.map((_, i) => i + 1));
  expect(lexemeById.size).toBe(lexemes.length);
});

test('no Latin transliteration reaches the Arabic fields', () => {
  // A permanent product rule (design spec §1), not a style preference.
  for (const l of lexemes) {
    expect(l.ar, `${l.id} is displayed with non-Arabic characters`).toMatch(
      ARABIC,
    );
    expect(l.id).toMatch(ARABIC);
  }
});

test('ids are stored composed, so a card cannot be looked up twice', () => {
  // Two Unicode spellings of the same vocalised word would key two cards for
  // one item, and only one of them would ever be reviewed.
  for (const l of lexemes) {
    expect(l.id.normalize('NFC'), l.id).toBe(l.id);
    expect(l.ar.normalize('NFC'), l.id).toBe(l.ar);
  }
});

test('roots and lexemes agree about which words belong to which root', () => {
  const fromLexemes = new Set(
    lexemes.map((l) => l.root).filter((r): r is string => r !== null),
  );
  expect(new Set(roots.map((r) => r.root))).toEqual(fromLexemes);

  for (const root of roots) {
    expect(root.radicals.join(''), root.root).toBe(root.root);
    expect(root.lexemes.length, root.root).toBeGreaterThan(0);
    for (const id of root.lexemes) {
      expect(lexemeById.get(id)?.root, id).toBe(root.root);
    }
  }
});
