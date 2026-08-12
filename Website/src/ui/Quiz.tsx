import { useState } from 'react';
import { setDone } from '../state/days.ts';
import type { LearnerState } from '../state/migrate.ts';
import { buildQuiz, recentScores } from '../review/quiz.ts';

interface Props {
  state: LearnerState;
  onUpdate: (state: LearnerState) => void;
}

export function Quiz({ state, onUpdate }: Props) {
  const now = new Date();
  const [questions] = useState(() => buildQuiz(state, now));
  const [at, setAt] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [right, setRight] = useState(0);

  const question = questions[at];
  const finished = at >= questions.length;

  function answer(option: string) {
    if (chosen !== null || !question) return;
    setChosen(option);
    if (option === question.answer) setRight((n) => n + 1);
  }

  function next() {
    const last = at === questions.length - 1;
    if (last) {
      const scored = right + 0;
      onUpdate(
        setDone(
          {
            ...state,
            quizzes: [
              ...state.quizzes,
              { at: new Date(), asked: questions.length, right: scored },
            ],
          },
          now,
          'quiz',
          true,
        ),
      );
    }
    setAt((n) => n + 1);
    setChosen(null);
  }

  if (questions.length === 0) {
    return (
      <>
        <div className="bar">
          <a className="btn btn-quiet" href="#day">
            Today
          </a>
        </div>
        <div className="grow">
          <div className="panel stack center">
            <p className="gloss">Not enough words met yet.</p>
            <p className="data">
              The quiz needs at least four words to ask about.
            </p>
            <a className="btn btn-primary" href="#day">
              Back to today
            </a>
          </div>
        </div>
      </>
    );
  }

  if (finished) {
    const scores = recentScores(state);
    const score = Math.round((right / questions.length) * 100);
    return (
      <>
        <div className="bar">
          <a className="btn btn-quiet" href="#day">
            Today
          </a>
        </div>
        <div className="grow">
          <div className="panel stack center">
            <p className="gloss">
              {right} of {questions.length}
            </p>
            <p className="data">{score}%</p>
            {scores.length > 1 && <Sparkline values={scores} />}
            <p className="chrome">
              Missed words are already scheduled harder. Nothing is penalised.
            </p>
            <a className="btn btn-primary" href="#day">
              Back to today
            </a>
          </div>
        </div>
      </>
    );
  }

  if (!question) return null;

  return (
    <>
      <div className="bar">
        <a className="btn btn-quiet" href="#day">
          Today
        </a>
        <span className="data">
          {at + 1} / {questions.length}
        </span>
      </div>

      {/* Not the full study card, and not stretched: the options are the
          content here, so the prompt sits directly above them rather than
          floating in a centred region with a void between the two. */}
      <div className="stack">
        <div className="panel center">
          <div className="word-slot" key={question.lexeme.id}>
            <div className="arabic study" dir="rtl" lang="ar">
              {question.lexeme.ar}
            </div>
          </div>
        </div>

        {question.options.map((option) => (
          <button
            key={option}
            className={`btn option${
              chosen === null
                ? ''
                : option === question.answer
                  ? ' option-right'
                  : option === chosen
                    ? ' option-wrong'
                    : ''
            }`}
            onClick={() => answer(option)}
            disabled={chosen !== null}
          >
            {option}
          </button>
        ))}
        {chosen !== null && (
          <button className="btn btn-primary" onClick={next} autoFocus>
            {at === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </>
  );
}

/** The last ten scores. Inline SVG rather than a chart library — it is a
 *  polyline, and a dependency for a polyline is a dependency for nothing. */
function Sparkline({ values }: { values: number[] }) {
  const w = 160;
  const h = 32;
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(h - (v / 100) * h).toFixed(1)}`)
    .join(' ');
  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      role="img"
      aria-label={`Last ${values.length} scores: ${values.join(', ')} percent`}
    >
      <polyline points={points} fill="none" strokeWidth="1.5" />
    </svg>
  );
}
