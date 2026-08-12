import { useRef, useState } from 'react';
import { lexemes, roots } from '../content/content.ts';
import { downloadBackup, parseBackup } from '../lib/backup.ts';
import type { Theme } from '../lib/theme.ts';
import { replaceState } from '../state/store.ts';
import { NEW_PER_DAY_V1, type LearnerState } from '../state/migrate.ts';
import { streak } from '../state/days.ts';

interface Props {
  state: LearnerState;
  theme: Theme;
  onTheme: (theme: Theme) => void;
  onReplace: (state: LearnerState) => void;
}

export function Settings({ state, theme, onTheme, onReplace }: Props) {
  const [notice, setNotice] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const now = new Date();
  const met = Object.keys(state.cards).length;

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
        <a className="btn btn-quiet" href="#day">
          Today
        </a>
        <span className="chrome">Settings</span>
      </div>

      <div className="stack">
        <section className="panel stack">
          <h2 className="chrome">Appearance</h2>
          <Row
            label="Theme"
            value={theme === 'dark' ? 'Midnight' : 'Parchment'}
          >
            <button
              className="btn btn-quiet"
              onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              Switch
            </button>
          </Row>
        </section>

        <section className="panel stack">
          <h2 className="chrome">Pace</h2>
          <Row label="New words a day" value={String(state.newPerDay)} />
          <Row
            label="New words pause above"
            value={`${state.backlogLimit} due`}
          />
          <p className="chrome">
            Both are fixed for now. The evidence says intake is not what limits
            progress — minutes and reading are.
          </p>
        </section>

        <section className="panel stack">
          <h2 className="chrome">Your data</h2>
          <Row label="Words met" value={`${met} of ${lexemes.length}`} />
          <Row label="Roots in the atlas" value={String(roots.length)} />
          <Row label="Reviews recorded" value={String(state.log.length)} />
          <Row
            label="Corrected glosses"
            value={String(Object.keys(state.glossEdits).length)}
          />
          <Row
            label="Days concluded in a row"
            value={String(streak(state, now))}
          />
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
          <p className="chrome">
            Everything lives on this device only. Export before clearing browser
            data — there is no copy anywhere else.
          </p>
        </section>

        <section className="panel stack">
          <h2 className="chrome">About</h2>
          <p className="data">
            Glosses are hand-written and unchecked. Correct any that are wrong
            from the answer side of a card; corrections are yours and travel
            with your export.
          </p>
          <p className="data">
            Ten new words a day is the schema-1 default ({NEW_PER_DAY_V1}) and
            has not changed.
          </p>
        </section>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="row">
      <span>{label}</span>
      <span className="row-value">
        <span className="data">{value}</span>
        {children}
      </span>
    </div>
  );
}
