# Progress

Appended per phase. What was built, what was decided differently and why, what
broke and how it was found, and what was tried and abandoned.

---

## 2026-08-12 — Vision review: the plan re-grounded in evidence

Qusai asked for the whole vision played back before anything bigger got built,
and then changed six things. This is the record of what changed and why.

### What he decided

- **The finish line is a very strong B2, Quran-weighted.** C1/C2 general Arabic
  was on the table and was cut. This sets every vocabulary target.
- **The app teaches grammar.** A lesson block is core, not a textbook's job.
- **No microphone, ever.** No recording, no pronunciation check, no talking to
  the phone. Shadowing continues aloud, uncaptured.
- **A daily media pick replaces it** — curated video and podcast suggestions,
  marked done, advancing to the next.
- **One page is the app.** Today's blocks in a scroll, each with a checkbox, a
  final checkbox to conclude the day. Analytics and settings are the only other
  screens.
- **Nothing paid, ever**, and updates ship by pushing to git.

### The evidence pass, and what it changed

Requested explicitly: the method has to rest on what is known about second
language acquisition, not on plausible design. Six findings, all now in spec §3.

1. **95% coverage is "minimally acceptable"; 98% is independent reading**
   (Hu & Nation 2000, replicated 2023). The design used 95% everywhere.
   → The reader gains a second mode, and the finish line is restated at 98%.
2. **A word needs 7–8 encounters** for a coin-flip at two months. → Reading
   volume is half the vocabulary machine, so the reader moved from Phase 5 of
   the old plan to Phase 5 of a plan where it comes *before* the root atlas.
3. **CEFR counts word families, and an Arabic root is a word family.** The
   Quran's 4,776 lemmas are ~1,651 roots ≈ 1,600–2,000 families ≈ **B2**, not
   C2. → This is what made "strong B2" the honest description of finishing all
   seven levels, and it is why the root atlas is the central idea rather than a
   feature.
4. **Spacing + retrieval + feedback** beats everything else measured (Kim & Webb
   2022, 48 experiments). → Confirms FSRS as the core; cramming is a design
   error, not a user error.
5. **FSI puts Arabic at Category IV, ~2,200 hours** to professional proficiency.
   → The old spec claimed **Category V, which was simply wrong** and is
   corrected. At 50 min/day the honest figure is over seven years to that mark;
   the level table's own destination is nearer than that but not close to
   "20–24 months", so the pace claim is now stated plainly instead of sold.
6. **"As fast as humanly possible" buys exactly four levers:** more minutes,
   more reading, spacing over cramming, retrieval with feedback. Nothing
   supports raising new-word intake. → Intake stays fixed at 10/day and the app
   optimises minutes and encounters instead.

### The finding that changed the most

**Both graded readers are unusable, and they turned out not to matter.**

Qusai uploaded Al-Qirā'ah al-Rāshidah vols 1–3 and Qasas an-Nabiyyīn as EPUBs.
Unpacked and measured rather than assumed: both are OCR'd scans. Al-Qirā'ah
decodes with visible corruption — `الواردة #ي الحديث`, a literal `#` standing in
for في. The Qasas file prints its own OCR confidence on the page — *"estimated to
be only 37.43% accurate"* — and is an Urdu edition, not Arabic.

Then the measurement that resolved it. Counting, from the morphology file, how
many Quran verses fall at or above each coverage threshold for each vocabulary
size:

```
known   verses ≥95%   words     verses ≥98%
  300       483        3,531        470
  700     1,653       17,137      1,495
1,200     2,857       33,557      2,575
2,000     4,119       50,912      3,820
3,000     5,112       64,862      4,853
```

**Real Quran is readable from Level 1** — 483 verses, 3,531 words — in perfect
vocalised digital text with every morpheme scholar-tagged. And because verses
are short (median 10 words), the 98% "cold" set barely trails the 95% assisted
one, so reading unaided is available from the start rather than only at the end.

The graded readers stop being a blocker and become a wish-list item. What is
genuinely lost is *connected prose*: 483 scattered short verses is not a
narrative, and the extensive-reading literature wants both volume and
connectedness. Hand-authored graded sentences cover L1–L2.

### Decided differently, and why

- **Catalogue the library, do not extract it.** Qusai proposed processing every
  uploaded book before building further. Two-thirds right: knowing what you have
  is cheap and worth doing, but most of that shelf is *reference to consult*,
  not *content to import*, and the real unknown was extraction quality — which
  one sample page answered, and answered badly. Survey → prove on a sample →
  extract per phase, on demand.
- **Public repo, not private.** The copyright problem dissolved once the reader
  came from the Quran: with no in-copyright text ever committed, there is
  nothing to hide, and public GitHub Pages is free forever where private hosting
  is not. A licence allow-list check in the gate keeps it that way.
- **No Firecrawl on the books.** The parse skill would have uploaded Qusai's
  copyrighted PDFs to a third party. PDF and EPUB extraction stays local.
- **`/mcp` left unauthorised on purpose.** Every API in this project is verified
  against the installed package's own `.d.ts`, which is more authoritative than
  published docs. Closed as "not a gap".

### Tried and abandoned

- **Arc 2 to C1/C2.** Drafted a tenth phase extending vocabulary to 9–16k word
  families for general Arabic. Cut by Qusai in favour of depth at B2. Do not
  reintroduce it as scope creep.
- **Cloudflare Pages + Access for a private deploy.** Researched as the free
  route to a private site; became unnecessary when the copyright issue
  dissolved. Recorded in case the constraint ever returns.

---

## 2026-08-11 — Design pass: editorial precision, Apple physics

Qusai's call, asked for directly: the build was austere where it should have
felt premium. Done now rather than at Phase 7, because the shell is what every
later phase inherits — tokens, type, motion vocabulary, how a surface behaves.
Direction chosen by him: **editorial luxury crossed with Apple's physics** — a
finely printed page that responds like a well-made instrument.

Skill invoked: `apple-design`. Not `emil-design-eng` as well — it covers the
same craft ground and the session was already long.

### Built

- **Type is now size-specific.** Separate tracking and leading tokens per step:
  display tightens (`-0.022em`), chrome opens (`0.14em`), body sits at zero. One
  `letter-spacing` for every size is wrong somewhere by definition.
  **`--track-arabic` is 0 and must stay 0** — letter-spacing severs the cursive
  joins and turns an Arabic word into loose letters.
- **Tabular numerals** everywhere a number changes, so the counter does not make
  the line twitch as it counts down.
- **Real hairlines.** `--hairline` is `0.5px` at 2dppx and above. A 1px border
  is a 3px slab on a phone.
- **Three-layer elevation** in day (contact, key, ambient) instead of one blurred
  box; night gets no shadow but an inset top edge, because in the dark lighter
  *is* raised.
- **Press feedback on pointer-down**, `scale(0.97)` in 100ms, plus
  `touch-action: manipulation` and no tap-highlight — the moment feedback waits
  for the click, directness falls off a cliff.
- **Motion is critically damped** — `cubic-bezier(0.32, 0.72, 0, 1)`, no
  overshoot anywhere. Bounce belongs to motion the hand actually threw, and
  nothing here is thrown. A new word *arrives* (keyed on lexeme id, so it plays
  once per word, never on a re-render); the answer *settles* in beneath it.
- **Tap anywhere on the card to reveal.** The button stays as the keyboard and
  screen-reader path; the card is a larger duplicate target, and the affordance
  sits on the card's bottom margin where it cannot push the word.
- **Reduced motion** keeps the fades and drops every translate and scale;
  `prefers-contrast: more` firms up every border.

### Decided differently, and why

- **No spring library.** Nothing here is gesture-driven, so an interruptible
  spring has nothing to interrupt; a tuned bezier is the same feel with no
  dependency. *If drag-to-grade is ever built, that changes — springs are the
  right tool the moment a finger is carrying velocity.*
- **No glass anywhere.** The design spec bans blur behind Arabic, and there is
  no scrolling content for translucent chrome to float over. Depth comes from
  shadow and edge instead.
- **The card fills its region** rather than floating in it. A 430px card on a
  915px phone left the answer and the grade buttons as two islands.

### What broke, and how it was found

- **The front of the card became a huge empty page** with a single letter near
  the top and nothing saying it could be tapped. Found by screenshotting it.
  Fixed with one element: the tap affordance, pinned to the card's bottom
  margin — it fills the void *and* explains the interaction, without moving
  anything above it.
- **The "word does not move" test failed by 0.4px, and it was the test that was
  wrong.** `getBoundingClientRect` includes a mid-flight transform, so the
  baseline was measured during the new word's arrival animation. Measured the
  boxes directly to prove it: the card sat at y=112, height 432, in both states.
  The test now waits on `getAnimations()` before its baseline.
- **Then the test turned out to be toothless.** Restoring the old centred-card
  defect *passed*, because `flex: 1` on the card now holds the invariant
  independently. Removing both supports moves the word 38px and the test fails
  properly. Both rules are now commented as independently sufficient, so nobody
  deletes one as redundant.

---

## 2026-08-11 — Phases 0 and 1: the shell, the gate, and a usable review app

Branch `phase-0-1`. The app now runs, installs, works offline, and can be
studied from daily.

### Built

- **Phase 0.** Vite 8 + React 19 + TS 7, one `package.json` at the repo root
  with `root: 'Website'`, so there is one install, one gate and one CI job.
  `tokens.css` with both themes, Amiri bundled via `@fontsource`, PWA manifest
  and service worker, icons, and the gate itself — `format · lint · typecheck ·
  unit · content · build · UI`, wired identically into CI.
- **Phase 1.** 300 lexemes and 172 roots; FSRS review with per-grade interval
  previews; keyboard-only operation; TTS; IndexedDB persistence; JSON export
  *and* import; per-word gloss correction stored in learner state.

### Decided differently, and why

- **The lexemes are derived, not hand-authored.** The spec expected 300
  hand-written entries; the corpus was already on disk, so lemma, root, part of
  speech and Quran frequency now come from the Quranic Arabic Corpus and only
  the English glosses are mine. Less typing, and every mechanical field is
  scholar-tagged rather than remembered. The gloss file is keyed by **rank**,
  not by the Arabic string, so a mistyped diacritic cannot silently join the
  wrong word to the wrong meaning.
- **172 roots with no core gloss, instead of 60 roots with one.** Deriving a
  root's meaning from its most frequent word ("سمو → sky") would have been a
  guess presented as a fact. The root chip shows the radicals, which is true and
  useful; the glosses get authored in Phase 4 where the root browser displays
  them.
- **Import shipped alongside export.** The spec justified export as insurance
  against IndexedDB eviction. An export you cannot restore is not insurance, so
  the claim would have been false without it.
- **Gloss editing shipped in Phase 1, not later.** The design's stated
  mitigation for "my glosses will be wrong" is that they are correctable
  in-app. Shipping the wrong glosses without the correction would have made the
  mitigation fiction.
- **oxlint instead of eslint + typescript-eslint + plugins.** One binary, no
  config file, react-hooks rules included. `--deny-warnings`, because a linter
  whose warnings do not fail the gate is decoration.
  *Ceiling:* no type-aware rules (`no-floating-promises`). `tsc` strict plus
  `exactOptionalPropertyTypes` covers most of what that would have caught.
- **No Inter, no EB Garamond.** Amiri carries every word the learner *reads*,
  Arabic and English both; `system-ui` carries the instrument voice — counts,
  labels, buttons. One font file instead of three, and the pairing is a
  deliberate split of roles rather than a default.
- **The PWA manifest's colours are parsed out of `tokens.css` at build time**
  rather than re-typed in `vite.config.ts`. One source of truth by construction,
  not by discipline. A UI test asserts the parse happened.
- **`.mjs` scripts, not the spec's `build-content.ts`.** No ts-node, no build
  step for the build step; matches `manifest.mjs`, which was already there.

### Measured, not assumed

Gate on 2026-08-11: **45 unit tests, 8 UI tests across 2 devices (16 runs)**,
exit 0. Production bundle 280 KB (82 KB gzipped); precache 13 entries, 428 KiB.

### What broke, and how it was found

**Three defects. Two were found by using the app, not by the tests.**

1. **Grades could be lost on leaving the page.** Saves were debounced 400 ms to
   batch bursts. A Playwright test that graded a card and immediately reloaded
   caught it: inside that window, the grade was gone. Reviews arrive seconds
   apart — there was no burst to batch, and the loss is unrecoverable.
   *Fix:* write on every grade, no debounce. `ponytail:` note left against the
   single-blob write, saying to split into per-card rows rather than reinstate
   the debounce.

2. **The Arabic word slid up the screen when the answer appeared.** Found by
   screenshotting the two card states and comparing, not by any assertion. The
   panel was centred vertically, so revealing the gloss made it taller and
   re-centred it — moving the word at the exact moment the eye was on it, which
   the design explicitly forbids.
   *Fix:* the card is pinned to the top of its region and the action zone has a
   fixed height, so growth only goes downwards. A UI test now compares the
   word's bounding box before and after the reveal.

3. **Every gap in the app was wrong,** because `p` still had its default
   margins fighting the flex `gap` tokens. Visible only by looking; no test
   could have reached it. Also invisible in the same pass: the divider under the
   word, a 1px `--rule` line on a panel one shade lighter than it. It is now a
   short centred `--ink-muted` mark, which is both visible and closer to the
   manuscript reference it came from.

Two smaller ones, both caught by their own tests on first run: `formatInterval`
reported 30 seconds as "1m" (rounding before thresholding — the scheduler was
making a promise it had not made), and a test of mine asserted the daily budget
by counting *all* due cards rather than new ones.

**Both structural tests were proven to fail before being trusted** (rule 2): a
`#8C3A2B` was pasted into `Home.tsx` and the colour-literal test was watched to
fail on it; `THEME_KEY` was renamed and the drift test was watched to fail on
that. `oxlint --deny-warnings` was likewise checked to exit 1 on a planted
unused variable, and `build-content.mjs --check` to exit 1 on stale output.

### Tried and abandoned

- **Vertically centring the study card.** It looks better on a desktop and is
  wrong on the thing that matters: see defect 2. Do not re-centre it.
- **`@fontsource/inter` and `eb-garamond`.** Two more dependencies and ~150 KB
  for a role `system-ui` fills at zero cost. If the type ever needs a specific
  Latin voice, add one — not three.
- **Top-level `await` in `main.tsx`.** Works, but leans on the build target
  supporting it; a `.then(render).catch(fatal)` chain is the same length and
  makes the failure path explicit.
- **Testing-library and a jsdom environment.** Playwright already drives the
  real built app on two devices. Four dependencies and a second rendering
  environment to test the same components less faithfully.

### Deliberate refusals

`loadState` **throws** rather than returning an empty state when the stored blob
cannot be read, and `main.tsx` renders a dead-end screen saying nothing was
overwritten. Booting empty and then autosaving that emptiness is precisely how
`manifest.mjs` destroyed its own ledger last session. Same reasoning in
`migrate`: a state from a newer schema is refused, never downgraded.

---

## 2026-08-11 — Design and seed corpus (pre-Phase 0)

Commits `79a8998`, `76db2c4`, `8d9c8d4`, `b6d514f`.

### Built

- Design spec agreed:
  [`superpowers/specs/2026-08-11-arabic-mastery-design.md`](superpowers/specs/2026-08-11-arabic-mastery-design.md).
- `content-inbox/` drop folder with `scripts/manifest.mjs` (sha256 ledger,
  idempotent re-import) and `scripts/manifest.test.mjs`.
- Seed corpus fetched: 25 files, 0.69 GB. Quranic Arabic Corpus morphology,
  Tanzil Quran text in three vocalisation variants, Lane's Lexicon (Quranic
  roots JSON + full Perseus XML), kaikki Arabic Wiktionary, Madinah Durus 1–3
  with English keys, Wright vols 1–2, Al-Ājurrūmiyyah with two commentaries.

### Decided differently, and why

- **Skills are parallel, not sequential.** Qusai asked for levels shaped
  "L1 = read, L2 = speak". Rejected: gating speech behind reading reliably
  produces someone who reads well and cannot talk. Every level exercises all
  four strands; only the *dominant* strand and the exit test change.
- **I'rāb (case endings) moved to Level 7, last.** Every classical curriculum
  front-loads it. It is ~15% of the grammar and near-zero of the comprehension
  across the first 2,000 hours of reading.
- **Harakat fade is per-word, not per-level.** A word loses its vowels once the
  learner's own FSRS stability on it crosses a threshold. Same code cost as a
  level-based fade, strictly better behaviour. The data was already there.
- **Corpus weighted to Quranic/classical** past the first 500 words, because
  Qusai's actual goal is Quran and classical texts. Words 1–500 are shared
  between Quranic and modern frequency lists, so nothing is lost there.
- **Did not use the official corpus.quran.com download.** It requires submitting
  an email address. GPL mirrors carry identical data with no submission, so no
  data left the machine.

### Measured, not assumed

Derived the Quran coverage curve from the morphology data rather than trusting
any published claim. Measured at **word** level — a word is readable only if
every lemma-bearing morpheme in it is known — because morpheme-level coverage
flatters by roughly five points.

```
Quran = 76,572 words from 4,776 unique lemmas
  300 lemmas -> 74.2%     2,000 -> 95.2%     4,000 -> 99.0%
  700        -> 85.5%     3,000 -> 97.7%     4,776 -> 100%
```

451 lemmas reach 80% of words, which independently confirms the ~300-word claim
in *80% of Qur'anic Words* (that book counts morphemes; 272 lemmas hits 80% on
that measure). The level table's vocabulary targets were set before this was
measured and turned out to be well calibrated — Level 4 lands exactly on the
graded reader's 95% threshold.

### What broke, and how it was found

**Two defects in `manifest.mjs`, both found by writing its test, neither by
running the script.**

1. `Set-Content -Encoding utf8` in PowerShell 5.1 writes a UTF-8 **BOM**.
   `JSON.parse` rejects it. A bare `.catch(() => ({ sources: [] }))` swallowed
   the error and silently replaced the entire manifest with an empty one —
   discarding every extraction record. Exactly the silent-data-loss class the
   local-first rule exists to prevent.
   *Fix:* strip the BOM, and only tolerate `ENOENT`. A corrupt manifest now
   aborts loudly and leaves the file untouched.

2. The fix had its own bug. A `JSON.parse` throw inside `.then()`'s **success**
   handler is not caught by that same `.then()`'s rejection handler, so the
   friendly abort never fired and a raw `SyntaxError` escaped instead.
   *Fix:* `readFile().catch()` for the I/O, a separate `try/catch` for the parse.

Per rule 2, the original defect was then restored and the test watched to fail
on `extraction state must survive a BOM-prefixed re-run` before the fix went
back. It is a real test.

Also fixed: the first `.gitignore` silently dropped the `content-inbox/*/.gitkeep`
files, so the folder structure would have vanished on a clone. Git cannot
re-include a file inside an excluded directory — the directories must be
re-included first with `!content-inbox/**/`. Verified with `git check-ignore -v`
against a dummy dropped file.

### Tried and abandoned

- **`fileURLToPath` instead of hand-rolled URL munging.** The first version of
  `manifest.mjs` stripped the leading slash off `import.meta.url` with a regex;
  the space in "Project Arabic mastery" stayed percent-encoded and `readdir`
  failed. Do not hand-parse file URLs.
- **CAMeL Arabic Frequency Lists** — the GitHub repo contains only a README and
  licence; the data is hosted elsewhere. Not pursued, because Quranic frequency
  derived from the morphology file is better targeted for this curriculum anyway.
- **Hans Wehr and Buckwalter/Parkinson digitised** — both in copyright. Left on
  the buy-it list rather than sourced.

### Operational note — the client froze

Between roughly 14:30 and 18:00 the Claude Code client stopped processing
messages. Investigated afterwards; MCP logs were clean (all servers connected in
under 2 s and closed cleanly), disk had 98 GB free, and there were no orphaned
processes. The one hard finding: **the session transcript reached 1.05 MB across
463 entries, roughly 290,000 tokens against a 200,000-token window**, and had
been compacting continuously. Four `/clear` restarts are visible in the session
files at 15:31, 15:48, 15:58 and 16:11.

Not proven to be the cause — the freeze was not observed live. But two things
contributed and are avoidable:

- Dumping a full Lane's Lexicon entry (~5,900 tokens) to inspect a JSON file's
  shape, where a three-line preview would have answered the same question.
- Running the whole design-and-fetch stage as one unbroken session.

*Mitigation, now in force:* this file and `HANDOFF.md` exist, so a session is
disposable. Work in short sessions; write the resume point before context gets
tight, not after.
