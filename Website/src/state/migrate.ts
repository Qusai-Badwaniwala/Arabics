import type { Card, ReviewLog } from 'ts-fsrs';

/** Bump only when the shape changes, and only ever by *adding*. */
export const SCHEMA = 1;

/** Ten new words a day (design spec §8). Schema 1's value, frozen: a future
 *  release that changes the default must introduce its own constant, because a
 *  state saved without the field has to keep the behaviour it already had. */
export const NEW_PER_DAY_V1 = 10;

/** A review, exactly as ts-fsrs recorded it, plus which lexeme it was for.
 *  `state` is the state *before* the review, so `state === State.New` marks a
 *  first meeting — which is how "introduced today" is counted without keeping
 *  a second, driftable tally. */
export type LogEntry = ReviewLog & { id: string };

export interface LearnerState {
  schema: number;
  createdAt: Date;
  /** lexeme id -> its FSRS card. Absent means never introduced. */
  cards: Record<string, Card>;
  /** Append-only. Never pruned: FSRS optimisation needs the full history and
   *  it cannot be reconstructed. */
  log: LogEntry[];
  /** lexeme id -> a gloss the learner corrected by hand. Wins over content. */
  glossEdits: Record<string, string>;
  newPerDay: number;
}

export function freshState(now: Date = new Date()): LearnerState {
  return {
    schema: SCHEMA,
    createdAt: now,
    cards: {},
    log: [],
    glossEdits: {},
    newPerDay: NEW_PER_DAY_V1,
  };
}

/**
 * The one place a stored blob becomes a LearnerState.
 *
 * Refuses rather than repairs. A blob this build cannot understand is left
 * untouched and the app declines to start — the alternative is booting empty
 * and then saving that emptiness over a year of work, which is exactly the
 * silent-data-loss bug the manifest script already shipped once.
 */
export function migrate(raw: unknown, now: Date = new Date()): LearnerState {
  if (raw === undefined || raw === null) return freshState(now);

  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Saved data is not an object.');
  }
  const blob = raw as Partial<LearnerState>;

  if (typeof blob.schema !== 'number') {
    throw new Error('Saved data has no schema version.');
  }
  if (blob.schema > SCHEMA) {
    throw new Error(
      `Saved data is from a newer version (schema ${blob.schema}, this build ` +
        `understands ${SCHEMA}). Update the app rather than downgrade the data.`,
    );
  }
  if (!blob.cards || typeof blob.cards !== 'object') {
    throw new Error('Saved data has no cards.');
  }

  // No upgrade steps exist yet. When one does it goes here, smallest schema
  // first, each step raising blob.schema by one.
  return {
    schema: SCHEMA,
    createdAt: blob.createdAt instanceof Date ? blob.createdAt : now,
    cards: blob.cards,
    log: blob.log ?? [],
    glossEdits: blob.glossEdits ?? {},
    newPerDay: blob.newPerDay ?? NEW_PER_DAY_V1,
  };
}
