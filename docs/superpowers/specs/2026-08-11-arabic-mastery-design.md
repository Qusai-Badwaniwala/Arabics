# Arabic Mastery — Design Spec

**For:** Qusai, sole user
**Written:** 2026-08-11 · **Revised:** 2026-08-12 (vision review)
**Status:** agreed. This file is the single source of truth for the vision. If
a decision lives only in a conversation, it does not exist.

---

## 1. Purpose

A local-first PWA that takes one learner from "can decode the Arabic script but
understands nothing" to **reading the Quran and classical texts cold, and
thinking in Fusha** — a very strong B2, not a certificate.

It is a **curriculum with an engine**, not a flashcard app with Arabic in it.
The pedagogy is the product; the code exists to deliver it.

### The finish line, stated precisely

**A very strong B2 in Fusha, Quran-weighted.** Concretely, all of:

- Read any Quranic verse **cold** — unvocalised, no gloss, 98% word coverage.
- Read classical prose with a dictionary at hand, not at every line.
- Follow spoken Fusha at natural speed.
- Speak and think in it — haltingly at first, without translating in your head.

**Explicitly not the goal:** C1/C2 general Arabic. That needs 9,000–16,000 word
families and roughly four to seven more years; it was considered on 2026-08-12
and cut. Modern specialist registers (news, diplomacy, technical) are out of
scope. Dialect is out of scope. Handwriting is out of scope.

### Non-goals — permanent

No accounts. No server. No sync. No social features, sharing, or leaderboards.
No ads. No telemetry or any network call at runtime. No gamified currency,
lives, or energy. No guilt mechanics — a streak counter is fine, a streak that
punishes a sick day is not. **No Latin transliteration, anywhere, ever.**
**No microphone.** Nothing paid, ever — no paid service, API, host or asset.

**Analytics on-device is a core feature; analytics leaving the device is banned.**
These are different things and the distinction is load-bearing.

### Constraints

- Fully offline at runtime. All content, fonts and code bundled in the app.
- Installable PWA, primary target Android phone, secondary desktop.
- All learner data on-device, exportable and importable as a file.
- Free. Permanently. Any decision that would ever cost money is wrong.

---

## 2. Learner profile

| | |
|---|---|
| Starting point | Can sound out Arabic script; comprehension near zero |
| Target | Fusha only (no dialect), Quran-weighted |
| Motivation | Quran and classical texts; finds the language beautiful |
| Time | 45–60 min/day, held on bad days; more when possible |
| Device | Android phone, plus desktop |
| Handwriting | Not wanted — typing only |
| Speaking to a device | Not wanted — no recording, no pronunciation check |

---

## 3. The evidence base

Added 2026-08-12 at Qusai's request: the method must rest on what is actually
known about second-language acquisition, not on plausible-sounding design.
Every claim below is sourced, and each one changed something in this document.

**Lexical coverage thresholds (Hu & Nation 2000, replicated Kremmel et al.
2023).** 95% coverage gives *minimally acceptable* comprehension; **98% is the
threshold for independent, unassisted reading.** → The reader has two modes,
and the finish line is stated at 98%, not 95%.

**Encounters needed for retention.** A word met fewer than 5 times is rarely
retained; **7–8 encounters** gives roughly a 50% chance of retention two months
later. → Reading volume is not enrichment, it is the second half of the
vocabulary machine. The reader moves earlier in the plan, to Phase 5.

**Spacing and retrieval (Kim & Webb 2022 meta-analysis, 48 experiments, 3,411
learners; Karatas et al. 2025).** Spaced practice beats massed practice for both
vocabulary and grammar; retrieval with feedback beats re-exposure; expanding
intervals beat fixed ones. → FSRS with graded self-report is the correct core,
and cramming is a design error, not a user error.

**Extensive reading (meta-analysis, Educational Psychology Review 2025).**
Extensive reading produces measurable gains in comprehension, reading speed and
vocabulary. Fluency targets start just below 250–300 wpm. → Reading is a daily
block, every day, not a level-gated unlock.

**CEFR is counted in word *families*, not words.** ~500 families at A1 rising to
9,000–16,000 at C2. **An Arabic root is a word family.** The Quran's 4,776
lemmas cluster into ~1,651 roots — so "all of the Quran" is roughly 1,600–2,000
families, which lands near **B2**, not C2. → This is why the finish line is
stated as a strong B2, and why the root atlas is the central efficiency idea
rather than a nice feature.

**FSI difficulty.** Arabic is **Category IV** — the hardest tier — at ~2,200
class hours to professional working proficiency (≈C1), plus directed study. At
50 min/day that is over seven years; at 90 min/day, about four. → The honest
statement of pace is below, and the earlier claim of "FSI Category V" was
simply wrong and has been corrected.

**What "as fast as humanly possible" actually buys.** The evidence supports
exactly four levers: **more minutes on task**, **more reading volume**,
**spacing over cramming**, and **retrieval with feedback**. Nothing supports
going faster by raising the new-word intake — the binding constraint is review
load and encounter count, not how many cards are introduced. The app therefore
optimises minutes and encounters, and holds intake fixed.

Sources: Hu & Nation (2000) and Kremmel et al. (2023) in *Language Learning*;
Kim & Webb (2022); Karatas et al. (2025) in *Language Teaching Research*;
*Educational Psychology Review* (2025) extensive-reading meta-analysis; Nation &
Waring (2019); FSI language difficulty rankings.

---

## 4. Method

### 4.1 Skills are parallel, not sequential

A level is **not** a skill unlock. Every level exercises all four strands —
read, listen, speak, write. What a level changes is which strand *dominates* and
which strand its **exit test** measures.

Rationale: gating speech behind reading produces a learner who reads well and
cannot talk. The mouth needs years of low-stakes repetition. Speaking starts in
week two — aloud, to the room, never to the phone — and is simply not *assessed*
until Level 6.

### 4.2 The daily loop (~50 min)

One scrolling page. Each block carries its own checkbox; the last one concludes
the day. See §6 for the shape.

| Block | Min | Content |
|---|---|---|
| Lesson | 5 | One grammar unit, taught in-app. Short, and only when the level calls for it. |
| Review | 15 | FSRS-scheduled cards. Non-negotiable core. |
| New | 10 | 10 new words/day, always presented as a root family, never a flat list |
| Read | 15 | Graded text at ≥95% known-word coverage, and ≥98% for reading cold |
| Listen | 5 | One curated video or podcast. Optional extra — mark done, get the next. |

### 4.3 The four engine ideas

**1. Root atlas.** ~500 triliteral roots form the spine. Every lexeme attaches to
its root and its pattern. The learner never meets مَكْتَب as a novel word; they
meet it as *place-of* + a root they already own. This is the single largest
efficiency gain available in Arabic specifically, and — because CEFR counts word
families and a root *is* a family — it is also what makes a B2 finish line
reachable at all.

**2. Pattern grid.** The 10 verb forms plus ~8 noun templates (اسم فاعل، اسم
مفعول، مصدر، اسم مكان، اسم آلة، صفة مشبهة، اسم تفضيل، جمع تكسير) are taught as
machinery. Learn فَعَّلَ once; it applies to every root thereafter.

**3. The 95/98 reader.** Every sentence is tagged with the exact lexeme ids it
contains. Two modes, both driven by the same set-membership check and no runtime
NLP:

| Mode | Threshold | What it is for |
|---|---|---|
| `practice` | ≥95% known | Reading with tap-to-gloss. The daily block. |
| `cold` | ≥98% known | Reading unaided. The thing being trained for. |

**4. Adaptive harakat fade.** Content is stored **fully vocalised, always**. A
single render function strips diacritics progressively, driven by *per-word
mastery* rather than by level:

| Mode | Rule |
|---|---|
| `full` | All stored diacritics rendered. Levels 1–2. |
| `partial` | Drop short vowels on words whose FSRS stability exceeds threshold; keep shadda always; keep full marks on new or weak words. Level 3. |
| `bare` | Strip all but shadda; tap any word to reveal full vocalisation. Levels 4+. |

Learners who only ever read vocalised text cannot read an unvocalised page.
Scheduling the fade is the fix. One function, one source of truth — the mode can
never drift between screens.

### 4.4 Where the reading material comes from

**Decided 2026-08-12, after measuring.** The graded classical readers Qusai
sourced — Al-Qirā'ah al-Rāshidah vols 1–3 and Qasas an-Nabiyyīn — are **OCR'd
scans, not text**, and the OCR is unusable: Al-Qirā'ah decodes with visible
corruption, and the Qasas file declares its own accuracy at 37.43% on the page
and is an Urdu edition besides.

They are not needed. **The Quran itself is the graded reader**, and it is the
best possible one: perfect digital text, fully vocalised, every morpheme
scholar-tagged, already on disk. Measured against the derived frequency spine:

| Words known | Verses at ≥95% | Words of text | Verses at ≥98% |
|---|---|---|---|
| 300 (L1) | 483 | 3,531 | 470 |
| 700 (L2) | 1,653 | 17,137 | 1,495 |
| 1,200 (L3) | 2,857 | 33,557 | 2,575 |
| 2,000 (L4) | 4,119 | **50,912** | 3,820 |
| 3,000 (L5) | 5,112 | 64,862 | 4,853 |

Because verses are short (median 10 words), the "read it cold" set barely trails
the assisted one — so the 98% mode is available from the start, not only at the
end.

**What is lost, stated honestly:** 483 scattered short verses is not *connected
prose*, and extensive-reading research wants connected text and volume. Graded
narrative therefore remains on the wish list as a **digital text edition**, and
is no longer blocking anything. Hand-authored graded sentences fill the gap at
Levels 1–2 where verse coverage is thinnest.

### 4.5 Two deliberate inversions of the traditional path

- **I'rāb (case endings) is taught last, at Level 7.** Every classical
  curriculum front-loads it. It is ~15% of the grammar and near-zero of the
  comprehension across the first 2,000 hours of reading, and it stalls learners
  at the door.
- **Unvocalised text begins at Level 4**, on a schedule, not "eventually."

### 4.6 Corpus weighting

Words 1–500 are the shared core (particles, pronouns, كان/قال/جعل) — identical
across Quranic and modern frequency lists, so no tradeoff exists there.

Words 500–2,000 are weighted toward **Quranic and classical frequency**. Level 7
reading material is Quran and classical prose, not modern novels.

---

## 5. Levels

Every level exercises all four strands; the table names the dominant one and
what its exit test measures.

| # | Name | Dominant | Vocab / roots | Quran readable | CEFR | Exit test (administered by the app) |
|---|---|---|---|---|---|---|
| 1 | Decode & Anchor | Read | 300 / 60 | **74.2%** | A1 | Read an unseen vocalised 100-word text aloud; answer 5 comprehension questions |
| 2 | Sentence Sense | Read | 700 / 150 | **85.5%** | A2 | Translate an unseen vocalised paragraph; **derive** 3 never-seen words from owned roots |
| 3 | Verb Engine | Write | 1200 / 250 | **91.1%** | A2+ | Conjugate any owned root in any form; produce 10 sentences from a prompt |
| 4 | Bare Text | Read | 2000 / 350 | **95.2%** | B1 | Read an **unvocalised** paragraph cold at 90% comprehension |
| 5 | Ear | Listen | 3000 / 420 | **97.7%** | B1+ | Transcribe and understand 60s of unseen natural-speed audio |
| 6 | Mouth | Speak | 4000 / 480 | **99.0%** | B2 | 3-minute unscripted monologue on a random prompt, self-scored to a rubric |
| 7 | Wild | All | 4776 = all of it | **100%** | **Strong B2** | Real books. I'rāb and case endings taught properly here |

**The CEFR column is a domain-restricted claim**, and it is stated that way
deliberately. It describes Fusha reading of Quranic and classical text. It does
not claim B2 in modern news Arabic or in conversation with a Cairo taxi driver.

**The coverage column is measured, not estimated.** Derived on 2026-08-11 from
the Quranic Arabic Corpus morphology data. A word counts as readable only when
**every** lemma-bearing morpheme in it is known — the honest metric, not
morpheme-level coverage, which flatters by roughly seven points.

Three findings that shaped the table:

- **The entire Quran is 76,572 words drawn from only 4,776 unique lemmas.** The
  finish line is a concrete, countable object, not an open horizon.
- **451 lemmas gets you 80% of Quran words**, which independently confirms the
  ~300-word claim in *80% of Qur'anic Words* (that book counts morphemes; 272
  lemmas hits 80% on that measure).
- **Level 4's 2,000-word target lands at 95.2%** — exactly the threshold the
  reader uses. From Level 4 the whole Quran is in scope rather than a subset.

**Pace, stated honestly.** At 50 min/day this is a multi-year project — FSI puts
Arabic at ~2,200 hours to professional proficiency, which is over seven years at
that rate. The method does not remove the hours; it stops roughly 80% of them
being wasted on flat vocabulary lists and premature grammar tables. The only
honest accelerator is more minutes and more reading.

Grammar introduced per level: L1 nominal sentence, pronouns, definiteness ·
L2 iḍāfa, adjective agreement, the 10 forms *recognised* · L3 past/present/
imperative, negation, jussive & subjunctive, broken plurals · L4 relative
clauses, conditionals, passive · L5–6 consolidation · L7 i'rāb.

---

## 6. The shape of the app

**Decided 2026-08-12. One page is the app.**

Open it and you are looking at today. You scroll down through the day's blocks
in order; each has a checkbox; the last one concludes the day. There is no
navigation to learn, no menu, no home screen to return to.

```
┌─────────────────────────────┐
│  إِتْقَان        Tue 12 Aug  ☾ ⚙ │   the day, the theme, settings
├─────────────────────────────┤
│  ▢  Lesson                  │   grammar unit, in-app
│  ▢  Review          32 due  │   FSRS cards
│  ▢  New words    root: كتب  │   ten, as one family
│  ▢  Read         12 verses  │   at your coverage
│  ▢  Listen         optional │   today's pick, mark done → next
├─────────────────────────────┤
│  ▣  Conclude the day        │
└─────────────────────────────┘
```

**Two exceptions, and only two:**

- **Analytics** — its own screen. Retention curve, words known, root coverage,
  level and CEFR band, streak, weekly report.
- **Settings** — its own screen. Everything configurable in one place.

**Blocks expand rather than navigate.** A 15-minute review session opens into a
focused mode and returns you to exactly where you were on the day page, with
that block checked. The day page remains the only place you can be lost in, and
you cannot get lost on it.

**Checkboxes are honest.** A block checks itself when its work is genuinely
finished, and can be checked by hand when it is not — this is a personal
instrument, not an exam. Nothing punishes an unchecked box.

---

## 7. Content model

Build-time JSON, committed to the repo, generated by `scripts/build-content.mjs`.

```
roots.json      id · root (3–4 radicals) · core gloss · lexeme ids
lexemes.json    id · vocalised · lemma · rootId · patternId · gloss(en) · pos
                · freqRank · level · notes?
patterns.json   id · template (e.g. مَفْعَل) · name · meaning · examples
sentences.json  id · vocalised text · lexemeIds[] · gloss(en) · level · sourceId
lessons.json    level → ordered unit ids → grammar unit content
media.json      curated videos and podcasts: title · source · duration · level
resources.json  curated books and links for the Resources shelf
```

The reader is set membership over `lexemeIds`. No parser at runtime.

### Card types (SRS)

| Type | Prompt → Answer | Unlocks |
|---|---|---|
| `recognition` | Arabic → English | L1 |
| `listening` | Audio → meaning | L1 |
| `production` | English → Arabic (typed, Arabic keyboard) | L2 |
| `cloze` | Sentence with word blanked | L2 |
| `derivation` | Root + pattern → word | L3 |

### The licence rule

**No verbatim text from an in-copyright source is ever committed.** Qusai's
books live in `content-inbox/`, which is gitignored; they are reference *I read*,
never text *I extract*. Every committed content file declares its source, and
sources must appear on a free-licence allow-list checked by the gate. This is
what keeps the repo publishable, which is what keeps hosting free.

---

## 8. Content pipeline

```
h:\Project Arabic mastery\
├── content-inbox\                    raw sources, gitignored, never published
│   ├── quran\ grammar\ vocabulary\ readers\ audio\ papers\
│   ├── manifest.json                 sha256 → what was extracted, when, licence
│   └── _processed\
├── content\                          committed inputs: spine + hand-authored
├── Website\                          the app
├── scripts\                          derive-spine · build-content · make-icons
└── docs\
```

Qusai drops files any time and says "process the inbox". Extraction is
**idempotent** — `manifest.json` records a hash per source file, so re-running
never duplicates lexemes and never overwrites hand-corrected glosses.

**Seed corpus — 25 files, 0.69 GB**, all recorded in `manifest.json` with sha256,
source URL and licence. The load-bearing ones:

| Source | Why it matters |
|---|---|
| Quranic Arabic Corpus morphology (GPL) | Root + lemma + POS for all 130,030 Quran morphemes. The root atlas *and* the reader. |
| Tanzil Quran text ×3 | Vocalised and bare renderings of the same text — ground truth for the harakat fade, and the reader's corpus |
| Lane's Lexicon Quranic roots + full Perseus XML | Verbatim classical definitions |
| kaikki Arabic Wiktionary (512 MB) | Glosses and forms for non-Quranic vocabulary |
| Madinah Durus 1–3 + English keys | The Arabic-only course; keys are a gloss source |
| Wright's Grammar vols 1–2, Al-Ājurrūmiyyah + commentaries | Reference grammar for the lesson units |
| Wightwick, *Arabic Verbs & Essentials of Grammar* | Reference for the pattern grid |

**Reference-only, never extracted:** the in-copyright books in `readers/` —
Kendall *Diplomacy Arabic*, Manning *Intelligence Arabic*, Amir Tag Elsir *366*,
Mustafa Amin *لا*, and the OCR'd graded readers.

### The media catalogue

Videos and podcasts are **scraped and curated at build time** into `media.json`
and committed. At runtime the app reads that local list, offers one pick a day,
and hands the link to the system browser when tapped. **The app itself never
makes a network call.** Refreshing the catalogue is a git push, which is already
the update mechanism.

---

## 9. Architecture

**Stack:** Vite + React + TypeScript. `vite-plugin-pwa` for manifest and service
worker. Fonts bundled locally (Amiri) — no CDN, offline is hard-constrained.

**Navigation:** hash-synced view state. One page plus two screens does not need
a router.

**Scheduling:** `ts-fsrs`. Not reimplemented.

**Persistence:** the entire learner state is one JSON object in IndexedDB via
`idb-keyval`, loaded into memory at boot, written on every change.
*ponytail: single blob, not per-card rows — move to rows when it measurably
slows, somewhere north of 10k cards. Do not reintroduce a debounce; it lost a
grade once already.*

**Audio out:** `speechSynthesis` with an `ar` voice, feature-detected, and the
card says so plainly when no Arabic voice exists. Real recordings replace TTS
later without a data-model change — `lexemes.audioRef` is optional from day one.

**Audio in: none.** No `MediaRecorder`, no `SpeechRecognition`, no microphone
permission ever requested. Shadowing is done aloud, to the room, uncaptured.
This was Qusai's call on 2026-08-12 and it removes the design's worst
dependency — offline speech recognition — entirely.

**Deploy:** public GitHub repo → CI runs the gate → GitHub Pages. Free,
permanently. A failing gate blocks the deploy. Updating the app is a push.

### Migrations (local-first rule)

Schema changes may **only add**. A missing field resolves to **the behaviour the
user already had**, never the new default, in **exactly one place**
(`src/state/migrate.ts`). A blob this build cannot understand is refused, never
repaired — booting empty and autosaving that emptiness is the failure mode this
project has already shipped once. Full state export *and import* from Phase 1.

---

## 10. Discipline system

- **10 new words/day**, presented as root families. Held fixed: the evidence
  says intake is not the binding constraint.
- **Backlog throttle:** new words auto-pause when due-card count exceeds
  threshold (initial value 150, tunable in one place), and resume when clear.
  Compounding review debt after a missed week is the most common way
  self-taught learners quit.
- **Quiz every second day:** MCQ over met vocabulary, with a sparkline of the
  last 10. Missed words get scheduled harder. No penalty, no gate.
- **Weekly report (Sunday):** words learned, retention rate, roots covered,
  weakest patterns, what to focus on next week.
- **Progress analytics:** retention curve, words known, root coverage, level and
  CEFR band, streak. On-device only.
- **Resources shelf:** curated books and recitations in `resources.json`, with
  one rotating daily pick.

---

## 11. Design system

Two themes on **one token file**, `src/styles/tokens.css` — parchment by day,
midnight by night.

| Token | Day | Night |
|---|---|---|
| `--ground` | `#F4EFE4` | `#0B0E14` |
| `--ink` | `#1A1614` | `#E8E3D8` |
| `--accent` | `#8C3A2B` | `#C9A227` |

**Direction, chosen 2026-08-12: editorial luxury crossed with Apple's physics** —
a finely printed page that responds like a well-made instrument. Hand-crafted,
artistic, state of the art. Explicitly not templated, not generic, not AI slop.

**Rules:**

- **Glass and blur never sit behind Arabic text.** Harakat are 2px marks stacked
  above the line; low-contrast blurred surfaces destroy them. Glass is permitted
  on nav, sheets and overlays only.
- Arabic study items set at 48–64px, on solid panels, at high contrast.
- **Letter-spacing on Arabic is always 0.** It severs the cursive joins.
- Tracking and leading are **size-specific**; one value for every size is wrong
  somewhere by definition.
- Motion is **critically damped** — no overshoot unless a gesture threw it.
  Feedback lands on pointer-down, never on release.
- Hairlines are 0.5px above 2dppx. A 1px border is a 3px slab on a phone.
- **A test fails the build if a colour literal appears outside `tokens.css`.**
- Respects `prefers-reduced-motion`, `prefers-contrast`, and keyboard operation.

Design skills invoked per phase: `apple-design`, `impeccable`, `emil-design-eng`,
`frontend-design`, `animate`. Every phase is held to this bar; polish is not a
phase.

---

## 12. Testing and verification

- **Every phase ends with the app opened in a real browser** via
  chrome-devtools/playwright, used, and screenshotted. Tests passing is not
  evidence.
- **Every regression test is proven to fail**: restore the defect, watch it
  fail, restore the fix. And when a restored defect *passes*, the test is dead —
  find what is really holding the invariant.
- Unit tests where logic is non-trivial: FSRS integration, harakat fade,
  coverage filter, migrations, the token-literal check, the licence allow-list.
- `code-review` before merging each phase.

---

## 13. Phases

Every phase ends with Qusai opening it. The CEFR column is the level **his own
study** reaches once that phase's capability exists — not a property of the code.

| # | Build | He can then | CEFR | Days |
|---|---|---|---|---|
| 0 ✅ | Repo, Vite+React+TS+PWA, token file, both themes, Amiri, hex-literal test, the gate | Install it; see one Arabic word rendered properly | — | done |
| 1 ✅ | 300 lexemes + 172 roots, FSRS review, TTS, persistence, export/import, gloss correction | **Study daily.** First usable build | — | done |
| 1.5 ✅ | Design pass: editorial precision, Apple physics | Feel that it was made on purpose | — | done |
| 2 ✅ | **The Day page** — single-scroll blocks, checkboxes, day conclusion, settings screen, streak, backlog throttle, 10/day root family, quiz | Have the real ritual, with feedback | — | done |
| 3 | **Library survey + content pipeline** — catalogue every source, prove extraction, full corpus import, 2,000+ tagged lexemes, licence allow-list check | Feed it his own books | — | 2–3 |
| 4 | **Lessons** — grammar taught in-app, L1–L4 units as the day's first block | Learn grammar without a separate textbook | **A1** | 3–4 |
| 5 | **The reader** — 95% and 98% modes over the Quran, tap-to-gloss, harakat fade | Read real Quran at exactly his level, daily | **A2** | 3–4 |
| 6 | **Root atlas + pattern grid** — word families, derivation drills | Derive words he has never seen | **B1** | 2–3 |
| 7 | **Listening + media queue** — curated catalogue, daily pick, done → next | Train the ear on real speech | **B1+** | 2 |
| 8 | **Levels, exit tests, analytics screen** — CEFR mapping, weekly report, resources shelf | See exactly where he is | **B2** | 3–4 |
| 9 | **Deploy** — remote, CI-gated PWA on GitHub Pages, update and rollback verified | Update by pushing | — | 1 |

**Review cadence:** every phase shown individually.

---

## 14. Known risks

| Risk | Mitigation |
|---|---|
| Content authoring quality — my Arabic glosses will contain errors | Phase 3 imports the scholar-tagged corpus; hand-authored entries are flagged `unverified` and correctable in-app |
| Android Arabic TTS voice absent on his device | Feature-detected; the card says so plainly rather than mispronouncing |
| Review debt spiral | Backlog throttle (§10) |
| No connected graded prose at L1–L2 | Hand-authored graded sentences; a digital-text edition of a graded reader remains on the wish list |
| Multi-year timeline vs "as fast as humanly possible" | Stated plainly in §5. The only honest levers are minutes and reading volume |
| IndexedDB eviction on Android | Export from Phase 1; `navigator.storage.persist()` requested at boot |
| Copyrighted books leaking into a public repo | §7 licence rule, enforced by a gate check |
| No feedback on pronunciation, by choice | Accepted. Listening volume is the substitute; the risk of drilling a wrong sound is real and known |
