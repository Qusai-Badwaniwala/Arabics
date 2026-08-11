import { useRef, useState } from 'react';
import { lexemes, roots } from '../content/content.ts';
import type { LearnerState } from '../state/migrate.ts';
import { replaceState } from '../state/store.ts';
import { downloadBackup, parseBackup } from '../lib/backup.ts';
import type { Theme } from '../lib/theme.ts';
import {
  dueCount,
  formatInterval,
  nextDue,
  reviewedToday,
} from '../review/scheduler.ts';

interface Props {
  state: LearnerState;
  theme: Theme;
  onTheme: (theme: Theme) => void;
  onReplace: (state: LearnerState) => void;
}

export function Home({ state, theme, onTheme, onReplace }: Props) {
  const [notice, setNotice] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const now = new Date();
  const due = dueCount(state, now);
  const met = Object.keys(state.cards).length;
  const done = reviewedToday(state, now);
  const next = nextDue(state, now);

  async function onFile(file: File) {
    try {
      const restored = parseBackup(await file.text());
      const cards = Object.keys(restored.cards).length;
      if (
        !confirm(
          `Replace everything on this device with this backup?\n\n` +
            `Backup: ${cards} words, ${restored.log.length} reviews.\n` +
            `Now: ${met} words, ${state.log.length} reviews.\n\n` +
            `This cannot be undone.`,
        )
      ) {
        setNotice('Import cancelled. Nothing changed.');
        return;
      }
      await replaceState(restored);
      onReplace(restored);
      setNotice(`Restored ${cards} words.`);
    } catch (err) {
      setNotice(
        `That file could not be read: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  return (
    <>
      <div className="bar">
        <span className="chrome">Arabic Mastery</span>
        <button
          className="btn btn-quiet"
          onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? 'Day' : 'Night'}
        </button>
      </div>

      <div className="grow">
        <div className="center">
          {/* The app's own name, in the language it teaches. */}
          <div className="arabic title-ar" dir="rtl" lang="ar">
            إِتْقَان
          </div>
          <div className="chrome">Mastery</div>
        </div>

        <div className="panel stack center">
          {due > 0 ? (
            <>
              <p className="gloss">
                {due} {due === 1 ? 'card' : 'cards'} waiting
              </p>
              <a className="btn btn-primary" href="#review" role="button">
                Start review
              </a>
            </>
          ) : (
            <>
              <p className="gloss">Nothing due.</p>
              <p className="data">
                {next
                  ? `Next card in ${formatInterval(
                      next.getTime() - now.getTime(),
                    )}.`
                  : 'Come back tomorrow for ten new words.'}
              </p>
            </>
          )}
          {done > 0 && <p className="data">{done} reviewed today</p>}
        </div>
      </div>

      <div className="stack center">
        <p className="data">
          {lexemes.length} words · {roots.length} roots · {met} met
        </p>
        <p className="chrome">
          Glosses are hand-written and unchecked. Correct any that are wrong.
        </p>
        <div className="bar">
          <button
            className="btn btn-quiet"
            onClick={() => downloadBackup(state)}
          >
            Export data
          </button>
          <button
            className="btn btn-quiet"
            onClick={() => fileInput.current?.click()}
          >
            Import backup
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void onFile(file);
          }}
        />
        {notice !== null && (
          <p className="data" role="status">
            {notice}
          </p>
        )}
      </div>
    </>
  );
}
