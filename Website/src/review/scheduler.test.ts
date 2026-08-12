import { Rating, State, type Grade } from 'ts-fsrs';
import { expect, test } from 'vitest';
import { byRank } from '../content/content.ts';
import { freshState, type LearnerState } from '../state/migrate.ts';
import {
  applyGrade,
  buildQueue,
  dueCards,
  dueCount,
  formatInterval,
  introducedToday,
  isThrottled,
  learnAhead,
  newWordsToday,
  nextDue,
  previewIntervals,
} from './scheduler.ts';

const start = new Date('2026-08-11T09:00:00');
const minutes = (n: number) => new Date(start.getTime() + n * 60_000);

/** Grades the head of the queue n times, as a session would. */
function study(
  state: LearnerState,
  n: number,
  rating: Grade = Rating.Good,
  now = start,
): LearnerState {
  let next = state;
  for (let i = 0; i < n; i++) {
    const head = buildQueue(next, now)[0] ?? learnAhead(next, now)[0];
    if (!head) break;
    next = applyGrade(next, head.lexeme.id, head.card, rating, now);
  }
  return next;
}

test('a first session offers exactly the daily new-word budget', () => {
  const state = freshState(start);
  const queue = buildQueue(state, start);
  expect(queue).toHaveLength(state.newPerDay);
  expect(queue.every((q) => q.isNew)).toBe(true);
});

test('new words follow frequency, but a root brings its family with it', () => {
  const words = newWordsToday(freshState(start), start);
  expect(words[0]?.id).toBe(byRank[0]?.id);

  // اللَّه is rank 6 and إِلٰه is rank 82; they share the root أله, so the
  // second arrives beside the first instead of seventy places later. Meeting a
  // word as a member of a family it already owns is the whole design (spec
  // §4.3) — a flat frequency walk hands you ten unrelated facts.
  const ranks = words.map((w) => w.rank);
  expect(ranks).toContain(82);
  expect(ranks.indexOf(82)).toBe(ranks.indexOf(6) + 1);

  // Frequency still governs: nothing rare jumps the queue on its own.
  const unrooted = words.filter((w) => w.root === null).map((w) => w.rank);
  expect(unrooted).toEqual([...unrooted].sort((a, b) => a - b));
});

test('every word in a day comes from a root already being introduced', () => {
  const words = newWordsToday(freshState(start), start);
  const seen = new Set<string>();
  for (const w of words) {
    if (w.root) seen.add(w.root);
  }
  // No word is pulled in for a root that is not itself part of today's intake.
  for (const w of words) {
    if (w.root) expect(seen.has(w.root)).toBe(true);
  }
  expect(words).toHaveLength(freshState(start).newPerDay);
});

test("the day's budget is spent once, not once per visit", () => {
  const after = study(freshState(start), 10);
  expect(introducedToday(after, start)).toBe(10);
  expect(dueCount(after, start)).toBe(0);
  // Later the same day the ten come back as reviews — but no eleventh word.
  const later = buildQueue(after, minutes(90));
  expect(later.length).toBe(10);
  expect(later.some((q) => q.isNew)).toBe(false);
});

test('tomorrow brings a fresh budget', () => {
  const after = study(freshState(start), 10);
  const tomorrow = new Date(start.getTime() + 24 * 60 * 60_000);
  expect(introducedToday(after, tomorrow)).toBe(0);
  expect(buildQueue(after, tomorrow).some((q) => q.isNew)).toBe(true);
});

test('a card on a learning step comes back inside the same session', () => {
  const after = study(freshState(start), 10);
  // Nothing is due yet — the learning steps are minutes away.
  expect(buildQueue(after, start)).toHaveLength(0);
  expect(learnAhead(after, start).length).toBeGreaterThan(0);
});

test('learn-ahead never reaches into tomorrow', () => {
  let state = study(freshState(start), 10);
  state = study(state, 30, Rating.Easy, minutes(11));
  const parked = minutes(30);
  expect(buildQueue(state, parked)).toHaveLength(0);
  expect(learnAhead(state, parked)).toHaveLength(0);
  expect(nextDue(state, parked)).not.toBeNull();
});

test('grading appends one review to the history and nothing else', () => {
  const state = freshState(start);
  const head = buildQueue(state, start)[0];
  if (!head) throw new Error('empty queue');

  const after = applyGrade(
    state,
    head.lexeme.id,
    head.card,
    Rating.Good,
    start,
  );
  expect(after.log).toHaveLength(1);
  expect(after.log[0]?.id).toBe(head.lexeme.id);
  // The log records the state *before* the review, which is what makes
  // "introduced today" countable from history alone.
  expect(after.log[0]?.state).toBe(State.New);
  expect(Object.keys(after.cards)).toEqual([head.lexeme.id]);
  expect(state.log).toHaveLength(0);
});

test('a forgotten card returns sooner than a remembered one', () => {
  const head = buildQueue(freshState(start), start)[0];
  if (!head) throw new Error('empty queue');
  const preview = previewIntervals(head.card, start);
  expect(Object.keys(preview)).toHaveLength(4);

  const again = applyGrade(
    freshState(start),
    head.lexeme.id,
    head.card,
    Rating.Again,
    start,
  ).cards[head.lexeme.id];
  const easy = applyGrade(
    freshState(start),
    head.lexeme.id,
    head.card,
    Rating.Easy,
    start,
  ).cards[head.lexeme.id];
  expect(again?.due.getTime()).toBeLessThan(easy?.due.getTime() ?? 0);
});

test('new words stop arriving while the review debt is above the limit', () => {
  // Build a state with more due cards than the throttle allows, by studying
  // many days and then walking far enough forward that everything is due.
  let state = freshState(start);
  let day = start;
  for (let i = 0; i < 20; i++) {
    state = study(state, 40, Rating.Easy, day);
    day = new Date(day.getTime() + 24 * 60 * 60_000);
  }
  const later = new Date(start.getTime() + 400 * 24 * 60 * 60_000);
  const due = dueCards(state, later).length;
  expect(due).toBeGreaterThan(0);

  const throttled = { ...state, backlogLimit: Math.max(1, due - 1) };
  expect(isThrottled(throttled, later)).toBe(true);
  expect(newWordsToday(throttled, later)).toHaveLength(0);

  // And it lets go by itself once the backlog is under the limit again.
  const clear = { ...state, backlogLimit: due + 1 };
  expect(isThrottled(clear, later)).toBe(false);
  expect(newWordsToday(clear, later).length).toBeGreaterThan(0);
});

test('intervals read the way a human says them', () => {
  expect(formatInterval(30_000)).toBe('<1m');
  expect(formatInterval(60_000)).toBe('1m');
  expect(formatInterval(59 * 60_000)).toBe('59m');
  expect(formatInterval(90 * 60_000)).toBe('2h');
  expect(formatInterval(36 * 3600_000)).toBe('2d');
  expect(formatInterval(45 * 24 * 3600_000)).toBe('2mo');
  expect(formatInterval(400 * 24 * 3600_000)).toBe('1y');
});
