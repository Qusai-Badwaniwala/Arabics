import { expect, test } from 'vitest';
import { concludeDay, dayRecord, isDone, setDone, streak } from './days.ts';
import { freshState, type LearnerState } from './migrate.ts';

const day = (iso: string) => new Date(`${iso}T09:00:00`);
const start = day('2026-08-12');

/** Concludes each listed day, as living through them would. */
function lived(days: string[]): LearnerState {
  let state = freshState(day(days[0] ?? '2026-08-12'));
  for (const d of days) state = concludeDay(state, day(d));
  return state;
}

test('a block ticks and unticks, and only for its own day', () => {
  let state = setDone(freshState(start), start, 'review', true);
  expect(isDone(state, start, 'review')).toBe(true);
  expect(isDone(state, start, 'new')).toBe(false);
  expect(isDone(state, day('2026-08-13'), 'review')).toBe(false);

  state = setDone(state, start, 'review', false);
  expect(isDone(state, start, 'review')).toBe(false);
});

test('ticking a block twice does not duplicate it', () => {
  let state = setDone(freshState(start), start, 'quiz', true);
  state = setDone(state, start, 'quiz', true);
  expect(dayRecord(state, start).done).toEqual(['quiz']);
});

test('the streak counts consecutive concluded days', () => {
  const state = lived(['2026-08-10', '2026-08-11', '2026-08-12']);
  expect(streak(state, start)).toBe(3);
});

test('a day still in progress does not break the streak', () => {
  // Yesterday and the day before were concluded; today is simply not over.
  const state = lived(['2026-08-10', '2026-08-11']);
  expect(dayRecord(state, start).concluded).toBe(false);
  expect(streak(state, start)).toBe(2);
});

test('a missed day breaks it', () => {
  const state = lived(['2026-08-09', '2026-08-11']);
  expect(streak(state, start)).toBe(1);
});

test('reviewing without concluding does not count', () => {
  // Blocks ticked but the day never concluded: the streak is about finishing,
  // and nothing anywhere penalises not finishing.
  const state = setDone(freshState(start), start, 'review', true);
  expect(streak(state, start)).toBe(0);
});

test('concluding is a toggle, so a mis-tap is undoable', () => {
  let state = concludeDay(freshState(start), start);
  expect(streak(state, start)).toBe(1);
  state = concludeDay(state, start);
  expect(streak(state, start)).toBe(0);
});
