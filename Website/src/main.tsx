import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/amiri/arabic-400.css';
import '@fontsource/amiri/latin-400.css';
import './styles/tokens.css';
import './styles/app.css';
import { App, Fatal } from './ui/App.tsx';
import { loadState } from './state/store.ts';

const container = document.getElementById('root');
if (!container) throw new Error('index.html lost its #root');
const root = createRoot(container);

// State loads before the first render, so no screen paints a zero it will
// immediately correct. If it cannot be read, the app refuses to start rather
// than booting empty and autosaving that emptiness over real data.
loadState()
  .then((initial) =>
    root.render(
      <StrictMode>
        <App initial={initial} />
      </StrictMode>,
    ),
  )
  .catch((err: unknown) =>
    root.render(
      <Fatal message={err instanceof Error ? err.message : String(err)} />,
    ),
  );
