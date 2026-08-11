# Arabic Mastery — Design Spec

**Date:** 2026-08-11
**For:** Qusai, sole user
**Status:** awaiting approval

---

## 1. Purpose

A local-first PWA that takes one learner from "can decode the Arabic script but
understands nothing" to reading Quran and classical texts fluently, and speaking
Fusha.

It is a **curriculum with an engine**, not a flashcard app with Arabic in it. The
pedagogy below is the product; the code exists to deliver it.

### Non-goals — permanent

No accounts. No server. No sync. No social features, sharing, or leaderboards.
No ads. No telemetry or any network call at runtime. No gamified currency, lives,
or energy. No guilt mechanics — a streak counter is fine, a streak that punishes
a sick day is not. No Latin transliteration, anywhere, ever.

**Analytics on-device is a core feature; analytics leaving the device is banned.**
These are different things and the distinction is load-bearing.

### Constraints

- Fully offline at runtime. All content, fonts and code bundled in the app.
- Installable PWA, primary target Android phone, secondary desktop.
- All learner data on-device, exportable to a file.
- Free. No paid services, no APIs.

---

## 2. Learner profile

| | |
|---|---|
| Starting point | Can sound out Arabic script; comprehension near zero |
| Target | Fusha only (no dialect) |
| Motivation | Quran and classical texts; finds the language beautiful |
| Time | 45–60 min/day, held on bad days |
| Device | Android phone, plus desktop |
| Handwriting | Not wanted — typing only |

---

## 3. Method

### 3.1 Skills are parallel, not sequential

A level is **not** a skill unlock. Every level exercises all four strands —
read, listen, speak, write. What a level changes is which strand *dominates* and
which strand its **exit test** measures.

Rationale: gating speech behind reading produces a learner who reads well and
cannot talk. The mouth needs years of low-stakes repetition. Speaking starts in
week two — badly, aloud, to the phone — and is simply not *assessed* until
Level 6.

### 3.2 The daily loop (~50 min)

| Block | Min | Content |
|---|---|---|
| Review | 15 | FSRS-scheduled cards. Non-negotiable core. |
| New | 10 | 10 new words/day, always presented as a root family, never a flat list |
| Read | 15 | Graded text at ≥95% known-word coverage |
| Ear + Mouth | 10 | Listen → shadow aloud → record self once |

### 3.3 The four engine ideas

**1. Root atlas.** ~500 triliteral roots form the spine. Every lexeme attaches to
its root and its pattern. The learner never meets مَكْتَب as a novel word; they
meet it as *place-of* + a root they already own. This is the single largest
efficiency gain available in Arabic specifically, and it is why the content model
below is root-first rather than word-first.

**2. Pattern grid.** The 10 verb forms plus ~8 noun templates (اسم فاعل، اسم
مفعول، مصدر، اسم مكان، اسم آلة، صفة مشبهة، اسم تفضيل، جمع تكسير) are taught as
machinery. Learn فَعَّلَ once; it applies to every root thereafter.

**3. The 95% reader.** Every sentence is tagged with the exact lexeme ids it
contains. The reader serves only text where the learner already knows ≥95% of
the words, so reading is comprehension practice rather than decryption. Requires
lemma tagging from day one; no runtime NLP.

**4. Adaptive harakat fade.** Content is stored **fully vocalised, always**. A
single render function strips diacritics progressively. The fade is driven by
*per-word mastery*, not only by level:

| Mode | Rule |
|---|---|
| `full` | All stored diacritics rendered. Levels 1–2. |
| `partial` | Drop short vowels on words whose FSRS stability exceeds threshold; keep shadda always; keep full marks on new or weak words. Level 3. |
| `bare` | Strip all but shadda; tap any word to reveal full vocalisation. Levels 4+. |

Rationale: learners who only ever read vocalised text cannot read an unvocalised
page. Scheduling the fade is the fix. One function, one source of truth — the
mode can never drift between screens.

### 3.4 Two deliberate inversions of the traditional path

- **I'rāb (case endings) is taught last, at Level 7.** Every classical
  curriculum front-loads it. It is ~15% of the grammar and near-zero of the
  comprehension across the first 2,000 hours of reading, and it stalls learners
  at the door.
- **Unvocalised text begins at Level 4**, on a schedule, not "eventually."

### 3.5 Corpus weighting

Words 1–500 are the shared core (particles, pronouns, كان/قال/جعل) — identical
across Quranic and modern frequency lists, so no tradeoff exists there.

Words 500–2,000 are weighted toward **Quranic and classical frequency**.
Level 7 reading material is Quran and classical prose, not modern novels.

---

## 4. Levels

Estimates assume 50 min/day held honestly. **Cumulative to Level 6: 20–24
months.** The method does not remove the hours; it stops ~80% of them being
wasted on flat vocabulary lists and premature grammar tables.

| # | Name | Dominant | Vocab / roots | Exit test (administered by the app) |
|---|---|---|---|---|
| 1 | Decode & Anchor | Read | 300 / 60 | Read an unseen vocalised 100-word text aloud; answer 5 comprehension questions |
| 2 | Sentence Sense | Read | 700 / 150 | Translate an unseen vocalised paragraph; **derive** 3 never-seen words from owned roots |
| 3 | Verb Engine | Write | 1200 / 250 | Conjugate any owned root in any form; produce 10 sentences from a prompt |
| 4 | Bare Text | Read | 2000 / 350 | Read an **unvocalised** paragraph cold at 90% comprehension |
| 5 | Ear | Listen | 3000 / 420 | Transcribe and understand 60s of unseen natural-speed audio |
| 6 | Mouth | Speak | 4000 / 480 | 3-minute unscripted monologue on a random prompt, self-scored to a rubric |
| 7 | Wild | All | 5000+ | Real books. I'rāb and case endings taught properly here |

Grammar introduced per level: L1 nominal sentence, pronouns, definiteness ·
L2 iḍāfa, adjective agreement, the 10 forms *recognised* · L3 past/present/
imperative, negation, jussive & subjunctive, broken plurals · L4 relative
clauses, conditionals, passive · L5–6 consolidation · L7 i'rāb.

---

## 5. Content model

Build-time JSON, committed to the repo, generated by `scripts/build-content.ts`.

```
roots.json      id · root (3–4 radicals) · core gloss · lexeme ids
lexemes.json    id · vocalised · lemma · rootId · patternId · gloss(en) · pos
                · freqRank · level · notes?
patterns.json   id · template (e.g. مَفْعَل) · name · meaning · examples
sentences.json  id · vocalised text · lexemeIds[] · gloss(en) · level · sourceId
lessons.json    level → ordered unit ids → content refs
resources.json  curated books/audio/links for the Resources shelf
```

The 95% reader is set membership over `lexemeIds`. No parser at runtime.

### Card types (SRS)

| Type | Prompt → Answer | Unlocks |
|---|---|---|
| `recognition` | Arabic → English | L1 |
| `listening` | Audio → meaning | L1 |
| `production` | English → Arabic (typed, Arabic keyboard) | L2 |
| `cloze` | Sentence with word blanked | L2 |
| `derivation` | Root + pattern → word | L3 |

---

## 6. Content pipeline

```
h:\Project Arabic mastery\
├── content-inbox\
│   ├── README.md                     naming + placement rules
│   ├── quran\ grammar\ vocabulary\ readers\ audio\ papers\
│   ├── manifest.json                 sha256 → what was extracted, when
│   └── _processed\                   files moved here after extraction
├── Website\                          the app
├── scripts\build-content.ts          inbox + curated sources → content JSON
└── docs\
```

Qusai drops files any time and says "process the inbox". Extraction is
**idempotent** — `manifest.json` records a hash per source file, so re-running
never duplicates lexemes and never overwrites hand-corrected glosses.

**Seed sources** (fetched in Phase 3, all free/public domain):
Quranic Arabic Corpus (word-by-word root/lemma/morphology tagging of the entire
Quran — effectively a prebuilt root atlas), Madinah Arabic Course books 1–3,
Qasas an-Nabiyyīn and Al-Qirā'ah al-Rāshidah (graded classical readers),
Al-Ājurrūmiyyah, Lane's Lexicon, Wright's Grammar.

Phase 1 does not wait on any of this: 300 lexemes and 60 roots are hand-authored.

---

## 7. Architecture

**Stack:** Vite + React + TypeScript. `vite-plugin-pwa` for manifest and service
worker. Fonts bundled locally (Amiri for Arabic; Inter and EB Garamond for
English) — no CDN, offline is hard-constrained.

**Navigation:** hash-synced view state, ~15 lines. No router dependency for
8 screens.

**Scheduling:** `ts-fsrs`. Not reimplemented.

**Persistence:** the entire learner state is one JSON object in IndexedDB via
`idb-keyval`, loaded into memory at boot, written debounced.
*ponytail: single blob, not per-card rows — move to rows when it measurably
slows, somewhere north of 10k cards.*

**Audio out:** `speechSynthesis` with an `ar` voice, feature-detected, silent
fallback to text-only if absent. Real recordings replace TTS later without a
data-model change — `lexemes.audioRef` is optional from day one.

**Audio in:** `MediaRecorder` for shadowing playback — fully offline.
`SpeechRecognition` is used for the pronunciation check *where available*;
on most Android builds it is network-backed, so offline it degrades to
record-and-compare-by-ear. This is stated in the UI, not hidden.

### Migrations (local-first rule)

Schema changes may **only add**. A missing field resolves to **the behaviour the
user already had**, never the new default, in **exactly one place**
(`src/state/migrate.ts`). A repair may correct what the app *claims*; it may not
change what the app *asks of the user*. Full state export to a `.json` file is
available from Phase 1, so browser storage eviction can never cost a year.

---

## 8. Discipline system

- **10 new words/day**, presented as root families.
- **Backlog throttle:** new words auto-pause when due-card count exceeds
  threshold (initial value 150, tunable in one place), and resume when clear.
  This exists because compounding review debt after a missed week is the most
  common way self-taught learners quit.
- **Quiz every second day:** MCQ over met vocabulary. Score plus a sparkline of
  the last 10. Missed words get scheduled harder. No penalty, no gate.
- **Weekly report (Sunday):** words learned, retention rate, roots covered,
  weakest patterns, what to focus on next week.
- **Progress analytics:** retention curve, words known, root coverage, level
  progress, streak. On-device only.
- **Resources shelf:** curated books, recitations and podcasts bundled in
  `resources.json`, with one rotating daily pick. Links open the system browser
  when the device happens to have signal; the app itself never fetches.

---

## 9. Design system

Two themes on **one token file**, `src/styles/tokens.css` — parchment by day,
midnight by night.

| Token | Day | Night |
|---|---|---|
| `--ground` | `#F4EFE4` | `#0B0E14` |
| `--ink` | `#1A1614` | `#E8E3D8` |
| `--accent` | `#8C3A2B` | `#C9A227` |

**Rules:**

- **Glass and blur never sit behind Arabic text.** Harakat are 2px marks stacked
  above the line; low-contrast blurred surfaces destroy them. Glass is permitted
  on nav, sheets and overlays only.
- Arabic study items set at 48–64px, on solid panels, at high contrast.
- Arabic uses Amiri with `dir="rtl"`; mixed-direction runs are explicitly
  isolated.
- **A test fails the build if a colour literal appears outside `tokens.css`.**
  (CLAUDE.md rule 4 — one source of truth, with a test that fails on a
  duplicate.)
- Respects `prefers-reduced-motion`.

Design skills invoked per phase: `impeccable`, `emil-design-eng`,
`frontend-design`, `apple-design`, `animate`.

---

## 10. Testing and verification

- **Every phase ends with the app opened in a real browser** via
  chrome-devtools/playwright, used, and screenshotted. Tests passing is not
  evidence (CLAUDE.md rule 1).
- **Every regression test is proven to fail**: restore the defect, watch it fail,
  restore the fix (CLAUDE.md rule 2).
- Unit tests where logic is non-trivial: FSRS integration, harakat fade,
  95%-coverage filter, migrations, the token-literal check.
- `code-review` before merging each phase.

---

## 11. Phases

Every phase ends with Qusai opening it. Days are build days.

| # | Build | He can then | Days |
|---|---|---|---|
| 0 | Repo, Vite+React+TS+PWA, token file, both themes, Amiri, `content-inbox/`, project `CLAUDE.md`, hex-literal test | Install on phone; see one Arabic word rendered properly | 0.5 |
| 1 | 300 lexemes + 60 roots, FSRS review session, TTS, persistence, export | **Study daily.** First usable build | 2–3 |
| 2 | 10/day card, backlog throttle, MCQ quiz, grading + trend, weekly report, progress analytics, streak | Have a real ritual with feedback | 1–2 |
| 3 | Inbox extractor, Quranic Arabic Corpus import, frequency ranking, 2000+ tagged lexemes | Feed it his own books | 2–3 |
| 4 | Root browser, word families, pattern grid, derivation drills | Derive unseen words | 2–3 |
| 5 | Graded reader, 95% filter, tap-to-gloss, harakat fade engine | Read at his exact level | 3–4 |
| 6 | Listening drills, shadowing with record/playback, pronunciation check | Speak daily, hear himself | 2–3 |
| 7 | Levels wired up, 7 exit tests, Resources shelf with daily pick | See where he is and what unlocks | 2–3 |

**Review cadence:** phases 0 and 1 shown together; every phase individually
thereafter.

---

## 12. Known risks

| Risk | Mitigation |
|---|---|
| Content authoring quality — my Arabic glosses will contain errors | Phase 3 imports the Quranic Arabic Corpus, which is scholar-tagged; hand-authored Phase 1 entries are flagged `unverified` and correctable in-app |
| Android Arabic TTS voice absent on his device | Feature-detected; app degrades to text-only and Phase 6 real audio removes the dependency |
| Review debt spiral | Backlog throttle (§8) |
| 20–24 month timeline vs "as fast as humanly possible" | Stated plainly up front; Arabic is FSI Category V. Method saves waste, not hours |
| IndexedDB eviction on Android | Export from Phase 1; `navigator.storage.persist()` requested on install |
