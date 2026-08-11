import { get, set } from 'idb-keyval';
import { migrate, type LearnerState } from './migrate.ts';

const KEY = 'learner';

let onError: ((message: string) => void) | null = null;

/**
 * Reads the saved state, or throws.
 *
 * It never falls back to an empty state: booting empty and then autosaving
 * would erase whatever was actually there. A caller that catches this must
 * refuse to run the app, not start fresh.
 */
export async function loadState(): Promise<LearnerState> {
  // Ask for durable storage once. Android evicts IndexedDB from ordinary sites
  // under storage pressure, and this app has no server copy of anything.
  void navigator.storage?.persist?.();
  return migrate(await get<unknown>(KEY));
}

/** Called with a human-readable message when a write fails. */
export function setSaveErrorHandler(fn: (message: string) => void): void {
  onError = fn;
}

async function write(state: LearnerState): Promise<void> {
  try {
    await set(KEY, state);
  } catch (err) {
    // A tick shown but never stored is a lie. Say so rather than swallow it.
    onError?.(
      err instanceof Error ? err.message : 'Storage rejected the write.',
    );
    throw err;
  }
}

/**
 * Saves immediately — every grade, no debounce.
 *
 * The first version waited 400 ms to batch bursts of reviews. An end-to-end
 * test caught what that costs: grade a card, leave the page inside the window,
 * and the grade is gone. Reviews arrive seconds apart, so there is no burst to
 * batch, and losing one is unrecoverable.
 *
 * ponytail: one blob per write. If it ever gets slow, split the state into
 * per-card rows — do not bring the debounce back.
 */
export function saveState(state: LearnerState): void {
  void write(state).catch(() => {
    /* surfaced through onError; nothing else to do here */
  });
}

/** Replaces everything. Used by import; writes through before returning. */
export async function replaceState(state: LearnerState): Promise<void> {
  await write(state);
}
