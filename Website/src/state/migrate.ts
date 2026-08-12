import type { Card, ReviewLog } from 'ts-fsrs';

/** Bump only when the shape changes, and only ever by *adding*. */
export const SCHEMA = 2;

/** Ten new words a day (design spec §4.2). Schema 1's value, frozen: a future
 *  release that changes the default must introduce its own constant, because a
 *  state saved without the field has to keep the behaviour it already had. */
export const NEW_PER_DAY_V1 = 10;

/** New words pause above this many due cards (design spec §10). Schema 2.
 *
 *  Note the difference from NEW_PER_DAY_V1 above, because it is easy to get
 *  backwards: that constant is frozen because the field's *default may change*
 *  and old states must keep the old one. This constant is applied to schema-1
 *  states on upgrade because the field is *new* — there was no throttle before,
 *  so there is no earlier behaviour to preserve, only an absence to fill. */
export const BACKLOG_LIMIT_V2 = 150;

/** The blocks of a day, in the order they appear. Adding one here is what puts
 *  it on the day page — there is no second list. */
export const BLOCKS = ['review', 'new', 'quiz'] as const;
export type BlockId = (typeof BLOCKS)[number];

/** A review, exactly as ts-fsrs recorded it, plus which lexeme it was for.
 *  `state` is the state *before* the review, so `state === State.New` marks a
 *  first meeting — which is how "introduced today" is counted without keeping
 *  a second, driftable tally. */
export type LogEntry = ReviewLog & { id: string };

/** What happened on one day. Keyed by local date in `days`. */
export interface DayRecord {
  /** Blocks ticked off, by id. A block ticks itself when its work is finished
   *  and can be ticked by hand when it is not — this is a personal instrument,
   *  not an exam. */
  done: BlockId[];
  /** The final checkbox. This, and only this, is what the streak counts. */
  concluded: boolean;
}

export interface QuizResult {
  at: Date;
  asked: number;
  right: number;
}

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
  /** 'YYYY-MM-DD' local -> what happened. The only record of a day; the streak
   *  is derived from it rather than counted separately. */
  days: Record<string, DayRecord>;
  quizzes: QuizResult[];
  backlogLimit: number;
}

export function freshState(now: Date = new Date()): LearnerState {
  return {
    schema: SCHEMA,
    createdAt: now,
    cards: {},
    log: [],
    glossEdits: {},
    newPerDay: NEW_PER_DAY_V1,
    days: {},
    quizzes: [],
    backlogLimit: BACKLOG_LIMIT_V2,
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

  // Upgrade steps go here, smallest schema first.
  //
  // 1 -> 2 adds the day record, the quiz history and the backlog throttle.
  // `days` and `quizzes` fill with nothing, which is exactly what a schema-1
  // learner had: no day was ever recorded, no quiz was ever taken. The streak
  // therefore starts at zero rather than inventing a history from the review
  // log, because a day of reviews is not the same thing as a day concluded.
  return {
    schema: SCHEMA,
    createdAt: blob.createdAt instanceof Date ? blob.createdAt : now,
    cards: blob.cards,
    log: blob.log ?? [],
    glossEdits: blob.glossEdits ?? {},
    newPerDay: blob.newPerDay ?? NEW_PER_DAY_V1,
    days: blob.days ?? {},
    quizzes: blob.quizzes ?? [],
    backlogLimit: blob.backlogLimit ?? BACKLOG_LIMIT_V2,
  };
}
