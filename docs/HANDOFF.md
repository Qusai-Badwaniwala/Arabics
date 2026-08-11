# HANDOFF — Arabic Mastery

Written last, read first. If you are picking this up cold, this page and
`docs/progress.md` are the whole state. Nothing important lives only in a chat.

**Last updated:** 2026-08-11, after the seed-corpus fetch (commit `b6d514f`).

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

**Phase 0 has not started.** `Website/` is empty. There is no application code.

Done so far:

- Design spec written and agreed.
- `content-inbox/` scaffold with an idempotent sha256 manifest.
- Seed corpus fetched: 25 files, 0.69 GB (see `content-inbox/manifest.json`).
- Quran coverage curve derived and measured (see below).

Next action: **build Phases 0 and 1 together** — Vite + React + TS + PWA shell,
token file, both themes, then 300 lexemes with FSRS review, TTS, persistence and
export. Qusai reviews once, at the end of Phase 1.

Blocked on nothing. Waiting only on Qusai dropping graded readers into
`content-inbox/readers/`, which Phase 1 does not need.

## How to run

```
node scripts/manifest.mjs        # regenerate the content-inbox ledger
node scripts/manifest.test.mjs   # its regression test
```

There is no app to run yet. When Phase 0 lands, this section gets the dev-server
and build commands, and **the gate below stops being a stub.**

## The gate

**Does not exist yet.** This is a known, deliberate gap: Phase 0's first commit
must define it as one command chain —
`format · lint · typecheck · unit tests · UI tests · build` — and CI must block
on it. Today the only automated check is `node scripts/manifest.test.mjs`.

Do not build a feature before the gate exists.

## How to ship and roll back

Not applicable yet — nothing is deployed and there is no remote. When it is:
the app is a static PWA, so rollback is redeploying the previous build, and
**service-worker cache must be verified as actually updated** before any fix is
called delivered.

## Toolchain

| | Version |
|---|---|
| Node | 24.11.0 |
| npm | 11.6.1 |
| git | 2.53.0.windows.1 |
| OS | Windows 11 Pro 26200 |

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

Regenerate rather than trust: the derivation reads
`content-inbox/quran/quran-morphology.txt`.

## Known gaps, stated deliberately

1. **No gate, no CI.** Phase 0 owes both. Highest priority.
2. **No application code.** `Website/` is empty.
3. **Graded classical readers are missing.** Qasas an-Nabiyyīn and Al-Qirā'ah
   al-Rāshidah. Levels 2–4 depend on graded prose and nothing fetched supplies
   it. Qusai is sourcing these.
4. **No native audio.** Phase 1 uses Android TTS; recitation audio is still
   needed for Phase 6 ear-training.
5. **Phase 1 lexeme glosses will be hand-authored and wrong in places.** They
   are flagged `unverified` and correctable in-app; Phase 3's corpus import is
   the fix.
6. **The Lane's-roots dataset contains AI-generated English summaries.** The
   verbatim Lane definitions are trustworthy; the `summary_en` field is not.
   Recorded in `manifest.json`.
7. **Arabic OCR in the archive.org text layers is unreliable.** Do not extract
   Arabic from `wright-*.txt` or `ajurrumiyyah-matn-arabic.txt`. Latin is fine.
8. **`claude.ai` and `Context7` MCP connectors are unauthorised**, so library
   APIs cannot be checked against live docs. Needs an interactive `/mcp`.
9. **Long sessions have frozen the client.** See progress.md, 2026-08-11.
   Work in short sessions and keep this file current — that is the mitigation.
