# HANDOFF — Arabic Mastery

Written last, read first. If you are picking this up cold, this page and
`docs/progress.md` are the whole state. Nothing important lives only in a chat.

**Last updated:** 2026-08-12, after Phase 2, on branch `phase-0-1`, pushed.

---

## If you have just been told to begin

Read the next section ("Read this before you read anything else") first — it is
short and it is the part that makes the rest make sense. Then do these, in this
order. They are already decided; none of them needs asking again.

**1. The design identity pass. This is the top priority and it is a re-do.**
Qusai asked, explicitly and more than once, for the whole app — UI, UX, theme,
palette, frontend — to be state of the art. As of 2026-08-12 it is not, and he
said so. What shipped was a *craft* pass (size-specific tracking, 0.5px
hairlines, damped motion, press-on-pointer-down) — all real, all invisible
unless you go looking. **The day page currently looks like a todo app**: three
grey-bordered rows with checkboxes on a flat beige field. Named honestly, the
failures are:

- No signature on the screen he actually opens every morning. The root chip —
  the one element that could belong to no other app — appears on cards only.
- Parchment is a flat colour, not a material. No grain, no depth, no page.
- No ornament from the subject's own world: no mushaf illumination, no ayah
  rosette, no geometry. All of it was deferred under "restraint", and the
  deferring is what produced plainness.
- No moment of delight anywhere — least of all at *Conclude the day*, which is
  the emotional peak of the whole ritual and currently does nothing.
- Type is well set but not expressive. No display moment on the day page.

The brief: **the day page as an illuminated page, not a checklist.** Keep the
agreed direction — editorial luxury crossed with Apple's physics — but execute
it far harder. Use the design skills (`apple-design`, `impeccable`,
`emil-design-eng`, `frontend-design`, `animate`); screenshot every state in both
themes and *look*, repeatedly. Do not start this at the end of a long session;
it needs the context budget to iterate.

**2. The first cards make no sense to a human, and two things cause it.**

- *No first-run explanation exists at all.* He was shown a bare glyph, told to
  press space, then asked to rate his memory on a four-point scale invented by
  flashcard software he has never used. "First run" was named as a mode to
  design and then never designed. Build it.
- *Grade labels assume Anki literacy.* Decided: rename to **Forgot · Hard ·
  Knew it · Easy**, keeping the interval preview under each.

**3. Teaching order — decided by Qusai on 2026-08-12.** Cards now **lead with
real, root-bearing words** (اللَّه، رَبّ، قالَ، كِتاب، يَوْم) and particles move
back. Rationale: strict frequency order opens with و ال ل مِن ف — single letters
with no roots and barely a meaning, which is right for coverage and wrong for a
human being on day one. Function words are also acquired through use in
sentences rather than paired-associate drill.
Implementation note, and it matters: **particles must not simply vanish**, or
they are taught nowhere until the lesson block arrives in Phase 4. Defer them to
the end of the Level 1 set for now, and move them into lessons when Phase 4
gives them somewhere to go. Qusai was told this and can still overrule it.

**4. The app never shows him where he is.** No level, no CEFR band, no "12 of
300". He had to ask how long a level takes. The numbers are in "Measured facts"
below — put them on the day page rather than making him ask again.

**Then** carry on with Phase 3 (spec §13).

---

## Read this before you read anything else

This is not a product. It is **one person's instrument, built for one person**,
and every technical decision here follows from that.

**Qusai finds Arabic beautiful.** That is not a footnote on the motivation, it
*is* the motivation. He is not learning Arabic to put it on a CV or to order
coffee in Cairo. He wants the Quran and the classical texts — to read them
without a crutch, to hear them, and eventually to **think** in the language
rather than translate into it. That is why the vocabulary is Quran-weighted
instead of "practical", why there is no dialect, and why a feature that would be
sensible in a language app can still be wrong here.

**He will open this every day, for years.** That is the whole reason it has to
feel hand-made. "Premium", "artistic", "a wow element", "not AI slop" are his
words, and they are requirements, not taste. Something you will touch every
morning for three years is allowed to be beautiful; a thing that looks
generated will quietly stop being opened. If you are about to ship a screen that
would embarrass a designer, you have misunderstood the brief.

**Nothing here may shame him.** No guilt mechanics, no punishing streak, no red.
He gives it 45–60 minutes a day and holds that on bad days. The app's job is to
make a bad day survivable, not to grade him on it. The streak is information;
the checkboxes are his to tick; the quiz penalises nothing. Keep it that way.

**He wants it to be true.** He asked for the method to rest on actual
second-language-acquisition research rather than plausible-sounding design, and
that is why spec §3 exists with sources. The same standard applies to the app
itself: a number that was not measured is a lie, and a screen that claims
something it cannot do is a defect, not a placeholder. When in doubt, measure it
and say what you measured.

**He finds the defects that matter by using the thing.** Nearly every real bug
in this project was found by opening the app and looking at it, not by the
tests — a quiz that highlighted the wrong answer, a word that slid up the screen,
harakat clipped by a line-height. Get him something runnable, then go and look
at it yourself before you say it works.

He also edits files in his own editor between turns. Read before you overwrite.

---

## What this is

A local-first PWA that takes one learner — Qusai, sole user — from "can decode
Arabic script but understands nothing" to **reading the Quran and classical
texts cold, and thinking in Fusha**.

The finish line is **a very strong B2, Quran-weighted** — read any verse
unvocalised with no gloss at 98% coverage, follow spoken Fusha, speak and think
in it. C1/C2 general Arabic was considered on 2026-08-12 and deliberately cut.

It is a **curriculum with an engine**, not a flashcard app. Full design, now
evidence-sourced:
[`docs/superpowers/specs/2026-08-11-arabic-mastery-design.md`](superpowers/specs/2026-08-11-arabic-mastery-design.md).

## What it refuses to be

No accounts. No server. No sync. No social, sharing, or leaderboards. No ads.
No telemetry, and **no network call at runtime at all**. No gamified currency,
lives, or energy. No guilt mechanics. **No Latin transliteration, anywhere,
ever. No microphone, ever. Nothing paid, ever** — no paid service, API, host or
asset, at any point.

Progress analytics on-device is a core feature. Analytics leaving the device is
banned. These are different things and the distinction is load-bearing.

## Where work stopped

**Phases 0, 1, the design pass and Phase 2 are built, green and pushed.**
Branch `phase-0-1`, unmerged — Qusai merges into `master` himself.

What exists:

- Vite + React + TS + PWA shell, two themes on one token file, Amiri bundled.
- 300 lexemes and 172 roots, derived from the Quranic Arabic Corpus.
- **The Day page**: one scrolling page of today's blocks — Review, New words,
  Quiz — each with a checkbox, and a final one that concludes the day. Blocks
  open into a focused mode and return. Settings is the only other screen.
- FSRS review with interval previews, keyboard-only operation, TTS.
- **New words arrive as root families**, not a flat frequency list.
- **Backlog throttle**: new words pause above 150 due cards and resume alone.
- **MCQ quiz every second day**, weakest words first, with a score sparkline.
- **Streak** derived from concluded days — no penalty attached anywhere.
- Persistence in IndexedDB at schema 2, JSON export **and import**, in-app
  gloss correction.
- The gate, and CI wired to it.

**Next is not Phase 3.** It is the four items at the top of this file — the
design identity pass, first-run onboarding, the teaching-order change and
showing him his level — all raised by Qusai on 2026-08-12 after using the app.
Phase 3 (library survey and content pipeline, spec §13) follows them.

**Nothing is blocked.** All four are decided; start cold from this file.

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
- `vitest run` — **68 tests**, measured 2026-08-12. Zero collected test files is
  an error, not a pass.
- `scripts/manifest.test.mjs`, then `build-content.mjs --check`, which fails if
  the committed content JSON is stale relative to its sources.
- `vite build`.
- `playwright test` — **10 tests across 2 devices (20 runs)**, against the built
  app on `vite preview`, phone and desktop.

CI runs the identical chain on every push:
[`.github/workflows/gate.yml`](../.github/workflows/gate.yml) →
<https://github.com/Qusai-Badwaniwala/Arabics/actions>. It was still on its
first run when this was written — **check it is green before trusting it**, and
if Playwright behaves differently on Linux, fix the test rather than the gate.

## Git, and how to ship

**Remote:** `https://github.com/Qusai-Badwaniwala/Arabics.git` (public).
`master` is the deploy branch — **never commit to it**; work on a branch and let
Qusai merge. `phase-0-1` holds everything through Phase 2.

**Commits use `184258864+Qusai-Badwaniwala@users.noreply.github.com`**, set in
this repo's local git config on 2026-08-12. His account blocks pushes that
expose his real address, so history was rewritten once to strip it — verified by
checking the HEAD tree hash was byte-identical before and after. **Do not commit
with any other email**; the push will be rejected, and fixing it after the fact
means another rewrite. The pre-rewrite commits are still on this machine under
`refs/original/` as the undo; they are local only and can be deleted once you
are confident.

**Deploy, when Phase 9 arrives:** GitHub Pages from `master`, gated by CI. Free
permanently, and updating the app is a push. Public is safe because of the
licence rule in spec §7 — no in-copyright text is ever committed, so there is
nothing to hide.

Rollback is redeploying the previous build, and **service-worker cache must be
verified as actually updated** before any fix is called delivered. The service
worker is `registerType: 'autoUpdate'` with `skipWaiting`, so a reload after the
new build lands is enough — but verify it, do not assume it.

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

### How long a level takes

Asked by Qusai on 2026-08-12; keep the answer here so nobody re-derives it.
At 10 new words a day, the intake arithmetic is exact:

| Level | CEFR | Words | Days of intake | ≈ |
|---|---|---|---|---|
| 1 | A1 | 300 | 30 | 1 month |
| 2 | A2 | 700 | 70 | 2½ months |
| 3 | A2+ | 1,200 | 120 | 4 months |
| 4 | B1 | 2,000 | 200 | 6½ months |
| 5 | B1+ | 3,000 | 300 | 10 months |
| 6 | B2 | 4,000 | 400 | 13 months |
| 7 | strong B2 | 4,776 | 478 | **~16 months** |

Three caveats, all of which must be said whenever this table is quoted:

1. That is the day the **last new word is introduced**, not the day he knows it.
   Mastery lags intake, and a level switches on its **exit test**, from his own
   data — never on a calendar.
2. A missed week pauses intake while the backlog clears, so the calendar
   stretches. By design; that is the throttle working, not a failure.
3. Sixteen months at 50 min/day is ~400 hours, against FSI's ~2,200 for Arabic.
   So the **vocabulary** finishes in about sixteen months; the **fluency** keeps
   going, and the difference is made up of reading volume. This is the strongest
   single argument for the reader mattering more than the card count.

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

1. **Nothing is deployed yet.** The code is safe on GitHub but there is no site.
   Phase 9 owns it: GitHub Pages, CI-gated, free. Until then the only way to run
   it is locally.
2. **The 300 glosses are mine, not a scholar's.** Every lexeme carries
   `unverified: true`. Read `content/lexeme-review.tsv` and correct anything
   wrong — either in the app (the correction is stored per-word and exported) or
   in `content/lexeme-glosses.tsv` followed by `npm run content`.
3. **Six corpus lemmas are inflection fragments, not citable words** (ranks 186,
   208, 239, 263, 286, 288). Their display forms were supplied by hand and are
   the only Arabic in the repo I typed rather than derived.
4. **Root glosses do not exist.** 172 roots ship with their word families and
   *no* core gloss, because a derived gloss would have been a guess wearing a
   fact's clothing. Phase 6's root atlas is where they get authored.
5. **Both graded readers are OCR'd scans and unusable.** Measured 2026-08-12:
   Al-Qirā'ah al-Rāshidah decodes with visible corruption; the Qasas
   an-Nabiyyīn file declares its own OCR accuracy at 37.43% on the page and is
   an Urdu edition. **Do not build a pipeline for them.** The reader is built
   from the Quran instead (spec §4.4) — no longer blocking. A *digital text*
   edition of either book would still add connected prose at L1–L2.
6. **No connected graded prose at Levels 1–2.** The Quran gives 483 readable
   verses at 300 words, but they are scattered short verses, not narrative.
   Hand-authored graded sentences are the plan.
7. **No native audio.** TTS only, and only where the device has an Arabic voice —
   the card says so plainly when it does not. Recitation audio still wanted.
8. **No feedback on pronunciation, permanently, by choice.** No microphone means
   no way to catch a sound being drilled wrong for months. Accepted 2026-08-12;
   listening volume is the substitute.
9. **The day has three blocks, not six.** Lesson, Read and Listen arrive in
    Phases 4, 5 and 7. They are absent rather than greyed out on purpose: a
    block that cannot do its job should not be on the page claiming it can.
10. **The Lane's-roots dataset contains AI-generated English summaries.** The
    verbatim Lane definitions are trustworthy; the `summary_en` field is not.
11. **Arabic OCR anywhere in `content-inbox/` is unreliable.** Applies to
    `wright-*.txt`, `ajurrumiyyah-matn-arabic.txt`, and every EPUB in
    `readers/`. Latin text layers are fine; Arabic ones are not.
12. **`claude.ai` and `Context7` MCP connectors are unauthorised.** Decided
    2026-08-12 to leave them that way: every API here is checked against the
    installed packages' own type definitions, which is more authoritative than
    published docs. Not a gap worth closing.
13. **Long sessions have frozen the client.** See progress.md, 2026-08-11.
    Work in short sessions and keep this file current — that is the mitigation.
