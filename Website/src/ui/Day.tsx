import { shortDate } from '../lib/day.ts';
import {
  concludeDay,
  dayRecord,
  isDone,
  setDone,
  streak,
} from '../state/days.ts';
import type { BlockId, LearnerState } from '../state/migrate.ts';
import { quizDue } from '../review/quiz.ts';
import {
  dueCards,
  isThrottled,
  newWordsToday,
  reviewedToday,
} from '../review/scheduler.ts';
import type { Theme } from '../lib/theme.ts';

interface Props {
  state: LearnerState;
  onUpdate: (state: LearnerState) => void;
  theme: Theme;
  onTheme: (theme: Theme) => void;
}

interface Block {
  id: BlockId;
  title: string;
  status: string;
  /** Absent when there is nothing to open — the block is still tickable. */
  href?: string;
}

export function Day({ state, onUpdate, theme, onTheme }: Props) {
  const now = new Date();
  const due = dueCards(state, now).length;
  const fresh = newWordsToday(state, now);
  const throttled = isThrottled(state, now);
  const record = dayRecord(state, now);
  const run = streak(state, now);

  // The roots of today's new words, so the block can say what family is coming
  // rather than only how many words.
  const families = [
    ...new Set(fresh.map((l) => l.root).filter((r): r is string => r !== null)),
  ];

  const blocks: Block[] = [
    {
      id: 'review',
      title: 'Review',
      status: due > 0 ? `${due} due` : 'nothing due',
      ...(due > 0 ? { href: '#review' } : {}),
    },
    {
      id: 'new',
      title: 'New words',
      status: throttled
        ? 'paused — clear the backlog first'
        : fresh.length > 0
          ? `${fresh.length} waiting${families.length ? ` · ${families.length} root${families.length > 1 ? 's' : ''}` : ''}`
          : 'all met today',
      ...(fresh.length > 0 && !throttled ? { href: '#new' } : {}),
    },
    {
      id: 'quiz',
      title: 'Quiz',
      status: quizDue(state, now) ? 'ready' : 'not today',
      ...(quizDue(state, now) ? { href: '#quiz' } : {}),
    },
  ];

  return (
    <>
      <div className="bar">
        <span className="arabic day-mark" dir="rtl" lang="ar">
          إِتْقَان
        </span>
        <span className="data">{shortDate(now)}</span>
        <span className="bar-end">
          <button
            className="btn btn-quiet"
            onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? 'Day' : 'Night'}
          </button>
          <a className="btn btn-quiet" href="#settings">
            Settings
          </a>
        </span>
      </div>

      <div className="stack">
        {blocks.map((block) => (
          <div className="panel block" key={block.id}>
            <button
              className="tick"
              aria-pressed={isDone(state, now, block.id)}
              aria-label={`Mark ${block.title} done`}
              onClick={() =>
                onUpdate(
                  setDone(state, now, block.id, !isDone(state, now, block.id)),
                )
              }
            >
              {isDone(state, now, block.id) ? '✓' : ''}
            </button>
            {block.href ? (
              <a className="block-open" href={block.href}>
                <span className="gloss">{block.title}</span>
                <span className="data">{block.status}</span>
              </a>
            ) : (
              <span className="block-open block-idle">
                <span className="gloss">{block.title}</span>
                <span className="data">{block.status}</span>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="stack center day-end">
        <hr className="rule" />
        <button
          className={`btn ${record.concluded ? 'btn-quiet' : 'btn-primary'}`}
          onClick={() => onUpdate(concludeDay(state, now))}
        >
          {record.concluded ? 'Day concluded ✓' : 'Conclude the day'}
        </button>
        <p className="data">
          {run > 0 && `${run} day${run > 1 ? 's' : ''} running · `}
          {reviewedToday(state, now)} reviewed today
        </p>
      </div>
    </>
  );
}
