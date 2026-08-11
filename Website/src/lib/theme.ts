export type Theme = 'light' | 'dark';

/** Also read by the inline script in index.html, which applies the theme
 *  before first paint. theme.test.ts asserts the two keys stay identical. */
export const THEME_KEY = 'am-theme';

/** A device preference, not learner data: it stays in localStorage and out of
 *  the exported state, so restoring a backup on the desktop cannot flip the
 *  phone's theme. */
export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function currentTheme(): Theme {
  return storedTheme() ?? systemTheme();
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset['theme'] = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode. The attribute still holds for this session.
  }
}
