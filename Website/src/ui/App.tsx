import { useEffect, useState } from 'react';
import type { LearnerState } from '../state/migrate.ts';
import { saveState, setSaveErrorHandler } from '../state/store.ts';
import { applyTheme, currentTheme, type Theme } from '../lib/theme.ts';
import { Day } from './Day.tsx';
import { Quiz } from './Quiz.tsx';
import { Review } from './Review.tsx';
import { Settings } from './Settings.tsx';

/** The day page is the app. Everything else is a block opened from it, and
 *  every one of them returns here. There is nowhere else to be. */
const VIEWS = ['day', 'review', 'new', 'quiz', 'settings'] as const;
export type View = (typeof VIEWS)[number];

function readHash(): View {
  const hash = location.hash.replace('#', '');
  return (VIEWS as readonly string[]).includes(hash) ? (hash as View) : 'day';
}

export function App({ initial }: { initial: LearnerState }) {
  const [state, setState] = useState<LearnerState>(initial);
  const [view, setView] = useState<View>(readHash);
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const onHash = () => setView(readHash());
    window.addEventListener('hashchange', onHash);
    setSaveErrorHandler(setSaveError);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => applyTheme(theme), [theme]);

  const update = (next: LearnerState) => {
    setState(next);
    saveState(next);
  };

  return (
    <div className="app">
      {saveError !== null && (
        <p className="panel chrome" role="alert">
          Not saved: {saveError}. Export your data before closing the app.
        </p>
      )}
      {view === 'review' && (
        <Review state={state} onUpdate={update} mode="due" />
      )}
      {view === 'new' && <Review state={state} onUpdate={update} mode="new" />}
      {view === 'quiz' && <Quiz state={state} onUpdate={update} />}
      {view === 'settings' && (
        <Settings
          state={state}
          theme={theme}
          onTheme={setTheme}
          onReplace={setState}
        />
      )}
      {view === 'day' && (
        <Day state={state} onUpdate={update} theme={theme} onTheme={setTheme} />
      )}
    </div>
  );
}

/** Shown instead of the app when saved data cannot be read. Nothing is written
 *  in this state — the point is that the data on disk stays untouched. */
export function Fatal({ message }: { message: string }) {
  return (
    <div className="app">
      <div className="grow">
        <div className="panel stack">
          <h1 className="gloss">Your saved data could not be read.</h1>
          <p className="data">{message}</p>
          <p>
            Nothing has been overwritten. Close the app and report this rather
            than clearing site data — the review history is still on the device.
          </p>
        </div>
      </div>
    </div>
  );
}
