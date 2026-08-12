import { lexemeById, type Lexeme } from '../content/content.ts';
import { dayKey, dayKeyBefore } from '../lib/day.ts';
import type { LearnerState } from '../state/migrate.ts';

export const QUIZ_LENGTH = 10;
const OPTIONS = 4;

export interface Question {
  lexeme: Lexeme;
  /** Glosses to choose between, already shuffled. One is the right answer. */
  options: string[];
  answer: string;
}

/** Deterministic PRNG. The quiz is seeded from the date, so closing the app
 *  and reopening it gives back the same questions instead of reshuffling into
 *  an easier set — and so the tests can assert on a real quiz. */
function rng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return () => {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], next: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a !== undefined && b !== undefined) {
      out[i] = b;
      out[j] = a;
    }
  }
  return out;
}

/** Every second day (design spec §10): not twice in a day, and not on the day
 *  after one. Skipping it costs nothing — it simply stays offered. */
export function quizDue(state: LearnerState, now: Date): boolean {
  if (metWords(state).length < OPTIONS) return false;
  const recent = new Set(state.quizzes.map((q) => dayKey(q.at)));
  return !recent.has(dayKey(now)) && !recent.has(dayKeyBefore(now, 1));
}

function metWords(state: LearnerState): Lexeme[] {
  const met: Lexeme[] = [];
  for (const id of Object.keys(state.cards)) {
    const lexeme = lexemeById.get(id);
    if (lexeme) met.push(lexeme);
  }
  return met;
}

function glossOf(state: LearnerState, lexeme: Lexeme): string {
  return state.glossEdits[lexeme.id] ?? lexeme.gloss;
}

/**
 * Ten questions over words already met, weakest first.
 *
 * Weakness is FSRS stability, so the quiz asks about what is actually slipping
 * rather than sampling at random. Distractors come from other met words, which
 * keeps the choice genuinely hard — a wrong answer you have never seen is not
 * a distractor, it is a giveaway.
 */
export function buildQuiz(state: LearnerState, now: Date): Question[] {
  const met = metWords(state);
  if (met.length < OPTIONS) return [];

  const next = rng(dayKey(now));
  const weakestFirst = [...met].sort(
    (a, b) =>
      (state.cards[a.id]?.stability ?? 0) - (state.cards[b.id]?.stability ?? 0),
  );
  const asked = weakestFirst.slice(0, QUIZ_LENGTH);

  return asked.map((lexeme) => {
    const answer = glossOf(state, lexeme);
    const pool = shuffle(
      met.filter((m) => m.id !== lexeme.id && glossOf(state, m) !== answer),
      next,
    ).slice(0, OPTIONS - 1);
    return {
      lexeme,
      answer,
      options: shuffle([answer, ...pool.map((m) => glossOf(state, m))], next),
    };
  });
}

/** The last n scores as percentages, oldest first — the sparkline's data. */
export function recentScores(state: LearnerState, n = 10): number[] {
  return state.quizzes
    .slice(-n)
    .map((q) => (q.asked === 0 ? 0 : Math.round((q.right / q.asked) * 100)));
}
