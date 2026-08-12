import { dayKey, dayKeyBefore } from '../lib/day.ts';
import type { BlockId, DayRecord, LearnerState } from './migrate.ts';

const EMPTY: DayRecord = { done: [], concluded: false };

export function dayRecord(state: LearnerState, now: Date): DayRecord {
  return state.days[dayKey(now)] ?? EMPTY;
}

export function isDone(
  state: LearnerState,
  now: Date,
  block: BlockId,
): boolean {
  return dayRecord(state, now).done.includes(block);
}

/** Ticks or unticks a block. Unticking is allowed on purpose: a block that
 *  ticked itself when the queue emptied is a claim about the day, and the
 *  learner is the authority on whether it is true. */
export function setDone(
  state: LearnerState,
  now: Date,
  block: BlockId,
  done: boolean,
): LearnerState {
  const key = dayKey(now);
  const record = dayRecord(state, now);
  if (record.done.includes(block) === done) return state;
  return {
    ...state,
    days: {
      ...state.days,
      [key]: {
        ...record,
        done: done
          ? [...record.done, block]
          : record.done.filter((b) => b !== block),
      },
    },
  };
}

export function concludeDay(state: LearnerState, now: Date): LearnerState {
  const key = dayKey(now);
  const record = dayRecord(state, now);
  return {
    ...state,
    days: { ...state.days, [key]: { ...record, concluded: !record.concluded } },
  };
}

/**
 * Consecutive concluded days, counting back from today.
 *
 * Today not being concluded yet does not break the streak — it is not over.
 * A missed day does break it. There is no penalty attached anywhere; the
 * number is information, not a debt (design spec §1: no guilt mechanics).
 */
export function streak(state: LearnerState, now: Date): number {
  let n = 0;
  // Start at yesterday if today is still open, so an unfinished today never
  // reads as a broken streak.
  const start = state.days[dayKey(now)]?.concluded ? 0 : 1;
  for (let back = start; ; back++) {
    if (!state.days[dayKeyBefore(now, back)]?.concluded) break;
    n++;
  }
  return n;
}
