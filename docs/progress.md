# Progress

Appended per phase. What was built, what was decided differently and why, what
broke and how it was found, and what was tried and abandoned.

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
