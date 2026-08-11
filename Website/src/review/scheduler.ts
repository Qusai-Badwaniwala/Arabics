import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
  type Card,
  type Grade,
} from 'ts-fsrs';
import { byRank, type Lexeme } from '../content/content.ts';
import type { LearnerState } from '../state/migrate.ts';

/** Default FSRS parameters. Tuning them needs a review history to optimise
 *  against, which is what state.log is being kept for. */
const engine = fsrs();

export const GRADES: Grade[] = [
  Rating.Again,
  Rating.Hard,
  Rating.Good,
  Rating.Easy,
];

export const GRADE_LABELS: Record<Grade, string> = {
  [Rating.Again]: 'Again',
  [Rating.Hard]: 'Hard',
  [Rating.Good]: 'Good',
  [Rating.Easy]: 'Easy',
};

/** When nothing is due yet but a card is a few minutes out, finishing it now
 *  beats sitting on an empty screen. Only applies once the real queue is
 *  empty, so it can never pull tomorrow's work forward. */
const LEARN_AHEAD_MS = 20 * 60 * 1000;

export interface Queued {
  lexeme: Lexeme;
  card: Card;
  isNew: boolean;
}

function sameDay(a: Date, b: Date): boolean {
  // Local midnight is the day boundary. ponytail: no configurable rollover —
  // add one if studying past midnight starts costing a day's count.
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** First meetings so far today. Derived from the log, so it cannot drift from
 *  what actually happened. */
export function introducedToday(state: LearnerState, now: Date): number {
  return state.log.filter(
    (e) => e.state === State.New && sameDay(e.review, now),
  ).length;
}

export function reviewedToday(state: LearnerState, now: Date): number {
  return state.log.filter((e) => sameDay(e.review, now)).length;
}

/** When the next card falls due, or null if none is scheduled ahead. */
export function nextDue(state: LearnerState, now: Date): Date | null {
  let soonest: Date | null = null;
  for (const card of Object.values(state.cards)) {
    if (card.due.getTime() <= now.getTime()) continue;
    if (!soonest || card.due < soonest) soonest = card.due;
  }
  return soonest;
}

export function newRemaining(state: LearnerState, now: Date): number {
  return Math.max(0, state.newPerDay - introducedToday(state, now));
}

/**
 * What is actually due: overdue cards first, then today's new words in
 * frequency order. Recomputed from state on every render, so a card graded
 * "Again" rejoins the queue by itself.
 */
export function buildQueue(state: LearnerState, now: Date): Queued[] {
  const due: Queued[] = [];
  for (const lexeme of byRank) {
    const card = state.cards[lexeme.id];
    if (card && card.due.getTime() <= now.getTime()) {
      due.push({ lexeme, card, isNew: false });
    }
  }
  due.sort((a, b) => a.card.due.getTime() - b.card.due.getTime());

  const fresh: Queued[] = [];
  let budget = newRemaining(state, now);
  for (const lexeme of byRank) {
    if (budget === 0) break;
    if (state.cards[lexeme.id]) continue;
    fresh.push({ lexeme, card: createEmptyCard(now), isNew: true });
    budget--;
  }
  return [...due, ...fresh];
}

/**
 * Cards a few minutes out. Offered only once the real queue is empty, so a
 * learning card on a 10-minute step finishes in this session instead of
 * stranding the learner on an empty screen — and never so early that it pulls
 * tomorrow's work forward. Kept out of the home screen's count on purpose:
 * "waiting" has to mean waiting.
 */
export function learnAhead(state: LearnerState, now: Date): Queued[] {
  const soon: Queued[] = [];
  for (const lexeme of byRank) {
    const card = state.cards[lexeme.id];
    if (!card) continue;
    const wait = card.due.getTime() - now.getTime();
    if (wait > 0 && wait <= LEARN_AHEAD_MS) {
      soon.push({ lexeme, card, isNew: false });
    }
  }
  return soon.sort((a, b) => a.card.due.getTime() - b.card.due.getTime());
}

/** How many cards are waiting right now, new words included. */
export function dueCount(state: LearnerState, now: Date): number {
  return buildQueue(state, now).length;
}

export function formatInterval(ms: number): string {
  // Threshold on the raw milliseconds: rounding first turns 30 seconds into
  // "1m", which is a promise the scheduler is not making.
  if (ms < 60_000) return '<1m';
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.round(months / 12)}y`;
}

/** The interval each button would give, shown on the button itself. The
 *  learner should be able to see what a grade costs before pressing it. */
export function previewIntervals(card: Card, now: Date): Record<Grade, string> {
  const preview = engine.repeat(card, now);
  const out = {} as Record<Grade, string>;
  for (const g of GRADES) {
    out[g] = formatInterval(preview[g].card.due.getTime() - now.getTime());
  }
  return out;
}

/** Applies a grade and returns the next state. Pure — the caller saves it. */
export function applyGrade(
  state: LearnerState,
  id: string,
  card: Card,
  rating: Grade,
  now: Date,
): LearnerState {
  const { card: next, log } = engine.next(card, now, rating);
  return {
    ...state,
    cards: { ...state.cards, [id]: next },
    log: [...state.log, { id, ...log }],
  };
}
