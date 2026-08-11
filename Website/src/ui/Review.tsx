import { useEffect, useState } from 'react';
import type { Grade } from 'ts-fsrs';
import type { LearnerState } from '../state/migrate.ts';
import { canSpeak, speak } from '../lib/tts.ts';
import {
  applyGrade,
  buildQueue,
  GRADE_LABELS,
  GRADES,
  learnAhead,
  previewIntervals,
  reviewedToday,
} from '../review/scheduler.ts';

interface Props {
  state: LearnerState;
  onUpdate: (state: LearnerState) => void;
}

export function Review({ state, onUpdate }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);

  // Recomputed every render rather than frozen at session start, so a card
  // graded "Again" rejoins the queue without any session bookkeeping.
  const now = new Date();
  const due = buildQueue(state, now);
  const queue = due.length > 0 ? due : learnAhead(state, now);
  const current = queue[0];
  const gloss = current
    ? (state.glossEdits[current.lexeme.id] ?? current.lexeme.gloss)
    : '';

  function grade(rating: Grade) {
    if (!current) return;
    onUpdate(
      applyGrade(state, current.lexeme.id, current.card, rating, new Date()),
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
          <a className="btn btn-quiet" href="#home">
            Home
          </a>
        </div>
        <div className="grow">
          <div className="panel stack center">
            <p className="gloss">Done for today.</p>
            <p className="data">
              {reviewedToday(state, now)} reviewed. Ten new words tomorrow.
            </p>
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
        <a className="btn btn-quiet" href="#home">
          Home
        </a>
        <span className="data">
          {queue.length} left{current.isNew ? ' · new word' : ''}
        </span>
      </div>

      <div className="grow pinned">
        <div className="panel card center">
          <div className="word-slot">
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
