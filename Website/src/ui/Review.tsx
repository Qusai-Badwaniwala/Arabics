import { useEffect, useState } from 'react';
import { createEmptyCard, type Grade } from 'ts-fsrs';
import type { LearnerState } from '../state/migrate.ts';
import { setDone } from '../state/days.ts';
import { canSpeak, speak } from '../lib/tts.ts';
import {
  applyGrade,
  dueCards,
  GRADE_LABELS,
  GRADES,
  learnAhead,
  newWordsToday,
  previewIntervals,
  type Queued,
} from '../review/scheduler.ts';

interface Props {
  state: LearnerState;
  onUpdate: (state: LearnerState) => void;
  /** `due` drills what is scheduled; `new` introduces today's root families.
   *  Two blocks on the day page, one screen — they differ only in the queue. */
  mode: 'due' | 'new';
}

export function Review({ state, onUpdate, mode }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);

  // Recomputed every render rather than frozen at session start, so a card
  // graded "Again" rejoins the queue without any session bookkeeping.
  const now = new Date();
  const queue: Queued[] =
    mode === 'new'
      ? newWordsToday(state, now).map((lexeme) => ({
          lexeme,
          card: createEmptyCard(now),
          isNew: true,
        }))
      : (() => {
          const due = dueCards(state, now);
          return due.length > 0 ? due : learnAhead(state, now);
        })();
  const current = queue[0];
  const gloss = current
    ? (state.glossEdits[current.lexeme.id] ?? current.lexeme.gloss)
    : '';

  function grade(rating: Grade) {
    if (!current) return;
    const graded = applyGrade(
      state,
      current.lexeme.id,
      current.card,
      rating,
      new Date(),
    );
    // The last card of a block ticks its own checkbox. A block that finished
    // its work and still shows unticked is the app lying about the day.
    const remaining =
      mode === 'new'
        ? newWordsToday(graded, now).length
        : dueCards(graded, now).length;
    onUpdate(
      remaining === 0
        ? setDone(graded, now, mode === 'new' ? 'new' : 'review', true)
        : graded,
    );
    setRevealed(false);
    setDraft(null);
    setVoiceNote(null);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      // Let the focused control have its own keys.
      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName;
        if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'A') return;
      }
      if (!current) return;
      if (!revealed && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault();
        setRevealed(true);
        return;
      }
      if (revealed && event.key >= '1' && event.key <= '4') {
        const chosen = GRADES[Number(event.key) - 1];
        if (chosen) grade(chosen);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!current) {
    return (
      <>
        <div className="bar">
          <a className="btn btn-quiet" href="#day">
            Done
          </a>
        </div>
        <div className="grow">
          <div className="panel stack center">
            <p className="gloss">
              {mode === 'new' ? 'All met.' : 'Nothing left to review.'}
            </p>
            <a className="btn btn-primary" href="#day">
              Back to today
            </a>
          </div>
        </div>
      </>
    );
  }

  const { lexeme } = current;
  const intervals = previewIntervals(current.card, now);

  return (
    <>
      <div className="bar">
        <a className="btn btn-quiet" href="#day">
          Today
        </a>
        <span className="data">
          {queue.length} left{current.isNew ? ' · new word' : ''}
        </span>
      </div>

      <div className="grow pinned">
        <div
          className={`panel card center${revealed ? '' : ' tappable'}`}
          onClick={revealed ? undefined : () => setRevealed(true)}
        >
          {/* Keyed on the lexeme so the next word plays its arrival once, and
              a re-render — grading, editing a gloss — never replays it. */}
          <div className="word-slot" key={lexeme.id}>
            <div className="arabic study" dir="rtl" lang="ar">
              {lexeme.ar}
            </div>
            {lexeme.root && (
              <div
                className="root-chip"
                aria-label={`root ${lexeme.root.split('').join(' ')}`}
              >
                {[...lexeme.root].map((radical, i) => (
                  <span className="radical" key={`${radical}${i}`} aria-hidden>
                    {radical}
                  </span>
                ))}
              </div>
            )}
          </div>

          {revealed && (
            <div className="reveal stack" aria-live="polite">
              <hr className="rule" />
              {draft === null ? (
                <p className="gloss">{gloss}</p>
              ) : (
                <input
                  className="field"
                  autoFocus
                  value={draft}
                  aria-label="Gloss"
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                    if (e.key === 'Escape') setDraft(null);
                  }}
                  onBlur={() => {
                    const value = draft.trim();
                    const edits = { ...state.glossEdits };
                    if (value && value !== lexeme.gloss) {
                      edits[lexeme.id] = value;
                    } else {
                      delete edits[lexeme.id];
                    }
                    onUpdate({ ...state, glossEdits: edits });
                    setDraft(null);
                  }}
                />
              )}
              <p className="data">
                {lexeme.pos} · {lexeme.quranCount} times in the Quran
              </p>
              <div className="bar">
                <button
                  className="btn btn-quiet"
                  onClick={() => setDraft(gloss)}
                >
                  Edit gloss
                </button>
                {canSpeak && (
                  <button
                    className="btn btn-quiet"
                    onClick={() => {
                      if (!speak(lexeme.ar)) {
                        setVoiceNote('No Arabic voice on this device.');
                      }
                    }}
                  >
                    Listen
                  </button>
                )}
              </div>
              {voiceNote !== null && <p className="data">{voiceNote}</p>}
            </div>
          )}
          {!revealed && (
            <p className="chrome card-hint">Tap anywhere to reveal</p>
          )}
        </div>
      </div>

      <div className="actions">
        {revealed ? (
          <>
            <div className="grades">
              {GRADES.map((g) => (
                <button
                  key={g}
                  className={`grade${g === GRADES[0] ? ' grade-again' : ''}`}
                  onClick={() => grade(g)}
                >
                  {GRADE_LABELS[g]}
                  <small>{intervals[g]}</small>
                </button>
              ))}
            </div>
            <p className="chrome kbd-hint center">1–4 to grade</p>
          </>
        ) : (
          <>
            <button
              className="btn btn-primary"
              onClick={() => setRevealed(true)}
            >
              Show answer
            </button>
            <p className="chrome kbd-hint center">Space to show</p>
          </>
        )}
      </div>
    </>
  );
}
