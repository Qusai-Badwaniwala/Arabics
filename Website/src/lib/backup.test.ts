import { Rating } from 'ts-fsrs';
import { expect, test } from 'vitest';
import { freshState, SCHEMA } from '../state/migrate.ts';
import { applyGrade, buildQueue } from '../review/scheduler.ts';
import { backupFilename, parseBackup, serialize } from './backup.ts';

const now = new Date('2026-08-11T09:00:00Z');

function studiedState() {
  const state = freshState(now);
  const head = buildQueue(state, now)[0];
  if (!head) throw new Error('empty queue');
  return applyGrade(state, head.lexeme.id, head.card, Rating.Good, now);
}

test('a backup restores to exactly what was exported', () => {
  const before = studiedState();
  const after = parseBackup(serialize(before));
  // Deep equality includes the Dates: JSON turns them into strings, and a
  // restore that leaves them as strings would break every interval silently.
  expect(after).toEqual(before);
  expect(after.createdAt).toBeInstanceOf(Date);
  const id = Object.keys(after.cards)[0] ?? '';
  expect(after.cards[id]?.due).toBeInstanceOf(Date);
  expect(after.log[0]?.review).toBeInstanceOf(Date);
});

test('a file with an unreadable date is refused, not half-restored', () => {
  const broken = serialize(studiedState()).replace(
    /"due": "[^"]+"/,
    '"due": "sometime tuesday"',
  );
  expect(() => parseBackup(broken)).toThrow(/not a date/);
});

test('a backup from a newer build is refused', () => {
  const newer = serialize({ ...studiedState(), schema: SCHEMA + 1 });
  expect(() => parseBackup(newer)).toThrow(/newer version/);
});

test('the filename says which day it is from', () => {
  expect(backupFilename(now)).toBe('arabic-mastery-2026-08-11.json');
});
