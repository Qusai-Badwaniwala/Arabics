import { migrate, type LearnerState } from '../state/migrate.ts';

/** Export exists so browser storage eviction cannot cost a year of work. An
 *  export you cannot import back is not a backup, so both live here. */
const DATE_FIELDS = new Set(['createdAt', 'due', 'last_review', 'review']);

export function serialize(state: LearnerState): string {
  return JSON.stringify(state, null, 1);
}

/** Parses an exported file. Throws on anything it does not fully understand —
 *  a partly-read backup restored over live data is worse than no restore. */
export function parseBackup(text: string): LearnerState {
  const raw: unknown = JSON.parse(text, (key, value: unknown) => {
    if (!DATE_FIELDS.has(key) || typeof value !== 'string') return value;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`"${key}" is not a date: ${value}`);
    }
    return date;
  });
  return migrate(raw);
}

export function backupFilename(now: Date = new Date()): string {
  const stamp = now.toISOString().slice(0, 10);
  return `arabic-mastery-${stamp}.json`;
}

export function downloadBackup(state: LearnerState): void {
  const url = URL.createObjectURL(
    new Blob([serialize(state)], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = backupFilename();
  link.click();
  URL.revokeObjectURL(url);
}
