# HANDOFF — Arabic Mastery

Written last, read first. If you are picking this up cold, this page and
`docs/progress.md` are the whole state. Nothing important lives only in a chat.

**Last updated:** 2026-08-11, after Phases 0 and 1, on branch `phase-0-1`.

---

## What this is

A local-first PWA that takes one learner — Qusai, sole user — from "can decode
Arabic script but understands nothing" to reading Quran and classical texts, and
speaking Fusha.

It is a **curriculum with an engine**, not a flashcard app. Full design:
[`docs/superpowers/specs/2026-08-11-arabic-mastery-design.md`](superpowers/specs/2026-08-11-arabic-mastery-design.md).

## What it refuses to be

No accounts. No server. No sync. No social, sharing, or leaderboards. No ads.
No telemetry, and **no network call at runtime at all**. No gamified currency,
lives, or energy. No guilt mechanics. **No Latin transliteration, anywhere,
ever.**

Progress analytics on-device is a core feature. Analytics leaving the device is
banned. These are different things and the distinction is load-bearing.

## Where work stopped

**Phases 0 and 1 are built and green.** The app runs, installs, works offline,
and can be studied from daily. It is on branch `phase-0-1`, unmerged, awaiting
Qusai opening it.

What exists:

- Vite + React + TS + PWA shell, two themes on one token file, Amiri bundled.
- 300 lexemes and 172 roots, derived from the Quranic Arabic Corpus.
- FSRS review session with interval previews, keyboard-only operation, TTS.
- Persistence in IndexedDB, JSON export **and import**, in-app gloss correction.
- The gate, and CI wired to it.

Next: **Phase 2** — the 10/day card, backlog throttle, MCQ quiz, weekly report,
progress analytics, streak.

Blocked on nothing. Waiting only on Qusai dropping graded readers into
`content-inbox/readers/`, which Phase 2 does not need either.

## How to run

```
npm install
npx playwright install chromium   # once, for the UI tests

npm run dev        # dev server, port 5173
npm run build      # production build into Website/dist
npm run preview    # serves the build on port 4173 — this is what the UI tests use
npm run gate       # everything below, in order. Must pass before anything ships.
```

Content and icons are generated, committed, and checked by the gate:

```
npm run content                  # spine + glosses -> the JSON the app imports
node scripts/derive-spine.mjs N  # re-cut the spine from the corpus (needs content-inbox/)
node scripts/make-icons.mjs      # re-render the PWA icons from tokens.css
node scripts/manifest.mjs        # regenerate the content-inbox ledger
```

**Never run a build while the dev server is running**, and stop `npm run
preview` before `npm run gate` — the UI tests refuse to share port 4173.

## Getting it onto the phone

Measured 2026-08-11 against this build, not assumed:

| Served at | `isSecureContext` | `navigator.serviceWorker` | App runs | Installable / offline |
|---|---|---|---|---|
| `http://localhost:4173` | true | present, controlling | yes | yes |
| `http://192.168.x.x:4173` | **false** | **absent entirely** | yes | **no** |

So plain LAN HTTP is fine for looking at the app and studying from it, and
cannot install it or test offline — a service worker needs a secure context.
Two ways round it, neither of which sends anything off this machine:

1. **USB port forwarding (preferred).** Phone on USB with developer options and
   USB debugging on; desktop Chrome → `chrome://inspect/#devices` → Port
   forwarding → `4173` → `localhost:4173`. The phone then loads
   `http://localhost:4173`, which *is* a secure context, so install and offline
   both work properly.
2. **Wi-Fi, with a flag.** `npm run preview -- --host`, then on the phone
   `chrome://flags/#unsafely-treat-insecure-origin-as-secure` → add
   `http://<this machine's LAN IP>:4173` → relaunch Chrome. Turn the flag off
   afterwards.

Windows Firewall will prompt on the first `--host` run; allow it on **private**
networks only. (Checking the existing rules needs an elevated shell, so the
current state is unverified.)

## The gate

One chain, `npm run gate`:

**format · lint · typecheck · unit tests · content checks · build · UI tests**

- `prettier --check` — prose (`*.md`) is excluded; it reflows hand-wrapped text.
- `oxlint --deny-warnings` — a warning fails the gate, or it is not a gate.
- `tsc --noEmit` — strict, plus `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`.
- `vitest run` — **45 tests**, measured 2026-08-11. Zero collected test files is
  an error, not a pass.
- `scripts/manifest.test.mjs`, then `build-content.mjs --check`, which fails if
  the committed content JSON is stale relative to its sources.
- `vite build`.
- `playwright test` — **8 tests across 2 devices (16 runs)**, against the built
  app on `vite preview`, phone and desktop.

CI runs the identical chain: [`.github/workflows/gate.yml`](../.github/workflows/gate.yml).
It is inert until a remote exists.

## How to ship and roll back

Nothing is deployed and there is no remote. When there is: the app is a static
PWA, so rollback is redeploying the previous build, and **service-worker cache
must be verified as actually updated** before any fix is called delivered. The
service worker is `registerType: 'autoUpdate'` with `skipWaiting`, so a reload
after the new build lands is enough — but verify it, do not assume it.

## Toolchain

| | Version |
|---|---|
| Node | 24.11.0 |
| npm | 11.6.1 |
| git | 2.53.0.windows.1 |
| OS | Windows 11 Pro 26200 |

| Dependency | Version | |
|---|---|---|
| react / react-dom | 19.2.8 | |
| ts-fsrs | 5.4.1 | scheduling, not reimplemented |
| idb-keyval | 6.3.0 | one blob in IndexedDB |
| @fontsource/amiri | 5.3.0 | Arabic *and* Latin, bundled, no CDN |
| vite | 8.2.1 | |
| vite-plugin-pwa | 1.3.0 | manifest + workbox service worker |
| typescript | 7.0.2 | |
| vitest | 4.1.10 | |
| @playwright/test | 1.62.1 | |
| oxlint | 1.78.0 | one binary, zero config, react-hooks rules included |
| prettier | 3.9.6 | |

Shell is PowerShell 5.1. Two things bite here: `Set-Content -Encoding utf8`
writes a **BOM** (this already caused a data-loss bug — see progress.md), and
here-strings are unreliable, so multi-line commit messages go through a file.

## Measured facts

Derived 2026-08-11 from the Quranic Arabic Corpus morphology data. A word counts
as readable only when every lemma-bearing morpheme in it is known.

- The entire Quran is **76,572 words drawn from 4,776 unique lemmas.**
- 300 lemmas → 74.2% · 700 → 85.5% · 1,200 → 91.1% · **2,000 → 95.2%** ·
  3,000 → 97.7% · 4,776 → 100%.
- Level 4's 2,000-word target hits the graded reader's own 95% threshold, so
  **the Quran itself becomes valid reader input at Level 4.** This is the pivot
  the whole schedule turns on.

**Two different coverage numbers exist and they are not interchangeable.** The
figures above are *word*-level. `quran-lemma-frequency-DERIVED.tsv` carries a
`cum_coverage_pct` column that is *morpheme*-level and reads about seven points
higher (81.1% at rank 300). The app displays neither, on purpose, until levels
land in Phase 7.

Regenerate rather than trust: the derivation reads
`content-inbox/quran/quran-morphology.txt`.

## How the content is built

```
content-inbox/…/quran-lemma-frequency-DERIVED.tsv   gitignored, 0.69 GB corpus
        │  scripts/derive-spine.mjs  (run by hand, rarely)
        ▼
content/lexeme-spine.tsv        committed: rank, lemma, root, pos, count
content/lexeme-glosses.tsv      committed: rank -> English gloss, by hand
        │  scripts/build-content.mjs  (in the gate, with --check)
        ▼
Website/src/content/*.json      committed, imported by the app
content/lexeme-review.tsv       committed, human-readable, for checking glosses
```

The gloss file is keyed by **rank**, never by the Arabic string: a re-typed
diacritic would join the wrong word to the wrong meaning and nothing downstream
could notice. Nothing mechanical is ever hand-copied.

## Known gaps, stated deliberately

1. **The 300 glosses are mine, not a scholar's.** Every lexeme carries
   `unverified: true`. Read `content/lexeme-review.tsv` and correct anything
   wrong — either in the app (the correction is stored per-word and exported) or
   in `content/lexeme-glosses.tsv` followed by `npm run content`.
2. **Six corpus lemmas are inflection fragments, not citable words** (ranks 186,
   208, 239, 263, 286, 288). Their display forms were supplied by hand and are
   the only Arabic in the repo I typed rather than derived.
3. **Root glosses do not exist.** The design promised "60 roots"; what shipped is
   172 roots with their word families and *no* core gloss, because a derived
   gloss would have been a guess wearing a fact's clothing. The root browser in
   Phase 4 is where they get authored.
4. **Graded classical readers are missing.** Qasas an-Nabiyyīn and Al-Qirā'ah
   al-Rāshidah. Levels 2–4 depend on graded prose. Qusai is sourcing these.
5. **No native audio.** TTS only, and only where the device has an Arabic voice —
   the card says so out loud when it does not. Recitation audio is still needed
   for Phase 6.
6. **No analytics, streak, quiz or new-word card yet.** Phase 2 owns all of it.
   Today the daily limit is a fixed 10 and there is no backlog throttle, so a
   fortnight away will produce a wall of due cards.
7. **The Lane's-roots dataset contains AI-generated English summaries.** The
   verbatim Lane definitions are trustworthy; the `summary_en` field is not.
8. **Arabic OCR in the archive.org text layers is unreliable.** Do not extract
   Arabic from `wright-*.txt` or `ajurrumiyyah-matn-arabic.txt`. Latin is fine.
9. **`claude.ai` and `Context7` MCP connectors are unauthorised**, so library
   APIs cannot be checked against live docs. Everything here was checked against
   the installed packages' own type definitions instead. Needs an interactive
   `/mcp` to fix.
10. **Long sessions have frozen the client.** See progress.md, 2026-08-11.
    Work in short sessions and keep this file current — that is the mitigation.
