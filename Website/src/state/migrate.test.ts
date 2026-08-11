import { createEmptyCard } from 'ts-fsrs';
import { expect, test } from 'vitest';
import { freshState, migrate, NEW_PER_DAY_V1, SCHEMA } from './migrate.ts';

const now = new Date('2026-08-11T09:00:00Z');

test('nothing stored yet gives a fresh state', () => {
  const state = migrate(undefined, now);
  expect(state).toEqual(freshState(now));
  expect(state.schema).toBe(SCHEMA);
});

test('a stored state comes back with its cards and history intact', () => {
  const card = createEmptyCard(now);
  const stored = { ...freshState(now), cards: { قالَ: card } };
  const state = migrate(structuredClone(stored), now);
  expect(state.cards['قالَ']?.due).toEqual(card.due);
});

test('a state from a newer build is refused, not downgraded', () => {
  const stored = { ...freshState(now), schema: SCHEMA + 1 };
  // Silently accepting it would drop whatever the newer schema added, and the
  // next autosave would write that loss back to disk.
  expect(() => migrate(stored, now)).toThrow(/newer version/);
});

test('data that is not a learner state is refused', () => {
  expect(() => migrate('not a state', now)).toThrow();
  expect(() => migrate([], now)).toThrow();
  expect(() => migrate({ cards: {} }, now)).toThrow(/schema/);
  expect(() => migrate({ schema: SCHEMA }, now)).toThrow(/cards/);
});

test('a field added after a state was saved keeps the old behaviour', () => {
  // newPerDay is absent from this blob. It must resolve to what that user
  // already had, never to whatever the current default happens to be.
  const stored: Record<string, unknown> = { ...freshState(now) };
  delete stored['newPerDay'];
  delete stored['glossEdits'];
  const state = migrate(stored, now);
  expect(state.newPerDay).toBe(NEW_PER_DAY_V1);
  expect(state.glossEdits).toEqual({});
});
