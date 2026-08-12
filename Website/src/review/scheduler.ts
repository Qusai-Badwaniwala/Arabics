import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
  type Card,
  type Grade,
} from 'ts-fsrs';
import {
  byRank,
  lexemeById,
  lexemesByRoot,
  type Lexeme,
} from '../content/content.ts';
import { sameDay } from '../lib/day.ts';
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

/** Cards whose time has come. The Review block's whole queue. */
export function dueCards(state: LearnerState, now: Date): Queued[] {
  const due: Queued[] = [];
  for (const lexeme of byRank) {
    const card = state.cards[lexeme.id];
    if (card && card.due.getTime() <= now.getTime()) {
      due.push({ lexeme, card, isNew: false });
    }
  }
  return due.sort((a, b) => a.card.due.getTime() - b.card.due.getTime());
}

/**
 * The backlog throttle (design spec §10).
 *
 * New words stop arriving while the review debt is above the limit, and resume
 * by themselves once it is cleared. This exists because compounding review debt
 * after a missed week is the most common way self-taught learners quit — the
 * app must not keep digging while the learner is trying to climb out.
 */
export function isThrottled(state: LearnerState, now: Date): boolean {
  return dueCards(state, now).length >= state.backlogLimit;
}

export function newRemaining(state: LearnerState, now: Date): number {
  if (isThrottled(state, now)) return 0;
  return Math.max(0, state.newPerDay - introducedToday(state, now));
}

/**
 * The day's new words, as root families rather than a flat frequency list.
 *
 * Walking by frequency alone hands you ten unrelated facts. Taking each word
 * with the siblings that share its root means you meet مَكْتَب as *place-of* a
 * root you now own, which is the whole efficiency argument of the design
 * (spec §4.3). Words with no root — particles — simply arrive alone.
 */
export function newWordsToday(state: LearnerState, now: Date): Lexeme[] {
  const budget = newRemaining(state, now);
  const picked: Lexeme[] = [];
  const taken = new Set<string>();

  for (const lexeme of byRank) {
    if (picked.length >= budget) break;
    if (state.cards[lexeme.id] || taken.has(lexeme.id)) continue;
    picked.push(lexeme);
    taken.add(lexeme.id);

    for (const siblingId of lexeme.root
      ? (lexemesByRoot.get(lexeme.root) ?? [])
      : []) {
      if (picked.length >= budget) break;
      if (taken.has(siblingId) || state.cards[siblingId]) continue;
      const sibling = lexemeById.get(siblingId);
      if (!sibling) continue;
      picked.push(sibling);
      taken.add(siblingId);
    }
  }
  return picked;
}

/**
 * What is actually due: overdue cards first, then today's new words.
 * Recomputed from state on every render, so a card graded "Again" rejoins the
 * queue by itself.
 */
export function buildQueue(state: LearnerState, now: Date): Queued[] {
  const fresh = newWordsToday(state, now).map((lexeme) => ({
    lexeme,
    card: createEmptyCard(now),
    isNew: true,
  }));
  return [...dueCards(state, now), ...fresh];
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
