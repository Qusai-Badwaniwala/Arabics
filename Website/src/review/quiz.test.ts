import { Rating } from 'ts-fsrs';
import { expect, test } from 'vitest';
import { freshState, type LearnerState } from '../state/migrate.ts';
import { applyGrade, buildQueue } from './scheduler.ts';
import { buildQuiz, quizDue, QUIZ_LENGTH, recentScores } from './quiz.ts';

const start = new Date('2026-08-12T09:00:00');
const plusDays = (n: number) =>
  new Date(start.getTime() + n * 24 * 60 * 60_000);

function met(count: number): LearnerState {
  let state = freshState(start);
  let day = start;
  while (Object.keys(state.cards).length < count) {
    const head = buildQueue(state, day)[0];
    if (!head) {
      day = new Date(day.getTime() + 24 * 60 * 60_000);
      continue;
    }
    state = applyGrade(state, head.lexeme.id, head.card, Rating.Easy, day);
  }
  return state;
}

test('the quiz waits until there are enough words to ask about', () => {
  expect(quizDue(freshState(start), start)).toBe(false);
  expect(buildQuiz(freshState(start), start)).toEqual([]);
  expect(quizDue(met(12), start)).toBe(true);
});

test('it comes round every second day, not every day', () => {
  const state = met(12);
  const taken: LearnerState = {
    ...state,
    quizzes: [{ at: start, asked: 10, right: 8 }],
  };
  expect(quizDue(taken, start)).toBe(false);
  expect(quizDue(taken, plusDays(1))).toBe(false);
  expect(quizDue(taken, plusDays(2))).toBe(true);
});

test('every question has one right answer among distinct options', () => {
  const questions = buildQuiz(met(20), start);
  expect(questions).toHaveLength(QUIZ_LENGTH);
  for (const q of questions) {
    expect(q.options).toHaveLength(4);
    expect(new Set(q.options).size).toBe(4);
    expect(q.options).toContain(q.answer);
    // Distractors are other words the learner has met. A gloss they have never
    // seen would not be a distractor, it would be a giveaway.
    expect(q.answer).toBe(q.lexeme.gloss);
  }
});

test('reopening the app the same day gives back the same quiz', () => {
  const state = met(20);
  const morning = buildQuiz(state, start);
  const evening = buildQuiz(state, new Date('2026-08-12T21:30:00'));
  expect(evening.map((q) => q.options)).toEqual(morning.map((q) => q.options));
  // A different day is a different quiz.
  expect(buildQuiz(state, plusDays(2))[0]?.options).not.toEqual(
    morning[0]?.options,
  );
});

test('it asks about the weakest words first', () => {
  const state = met(20);
  const asked = buildQuiz(state, start).map((q) => q.lexeme.id);
  const stabilities = asked.map((id) => state.cards[id]?.stability ?? 0);
  expect(stabilities).toEqual([...stabilities].sort((a, b) => a - b));
});

test('scores come back as percentages, oldest first', () => {
  const state: LearnerState = {
    ...freshState(start),
    quizzes: [
      { at: start, asked: 10, right: 5 },
      { at: plusDays(2), asked: 10, right: 9 },
    ],
  };
  expect(recentScores(state)).toEqual([50, 90]);
});
