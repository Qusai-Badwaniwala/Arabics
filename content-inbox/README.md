# Content Inbox

Drop books, papers, audio — anything — into the folder that fits. Then tell
Claude **"process the inbox"** and it gets read, the useful parts extracted and
tagged by root and pattern, and merged into the app's content.

**Name files however you like.** The content is read, not the filename. A rough
guess at the right folder is enough; misfiled is fine, it still gets read.

Formats that work: `.epub` `.pdf` `.txt` `.md` `.docx` `.csv` `.json` `.mp3`
`.m4a` `.wav`

## Folders

| Folder | What goes in it |
|---|---|
| `quran/` | Mushaf text, word-by-word data, tafsir, translations, recitation |
| `grammar/` | Nahw and sarf — courses, reference grammars, classical primers |
| `vocabulary/` | Frequency lists, dictionaries, word-list books |
| `readers/` | Graded readers, stories, anything meant to be *read* rather than studied |
| `audio/` | Recitation, lectures, audiobooks, anything with a voice |
| `papers/` | Research on language acquisition, SRS, vocabulary coverage |
| `_processed/` | **Don't put anything here.** Files move here automatically after extraction |

## How re-imports work

`manifest.json` records a sha256 of every file processed and what came out of it.
So:

- Running it twice never duplicates anything.
- A gloss you correct by hand is never overwritten by a later import.
- Adding one new book only processes that book.

Drop files in batches or one at a time. There's no wrong moment.

---

## Shopping list

Free / public domain — worth grabbing first:

- [ ] **Quranic Arabic Corpus** — corpus.quran.com. Word-by-word root, lemma and
      morphology tagging for the whole Quran. The single most valuable dataset
      for this app. → `quran/`
- [ ] **Madinah Arabic Course** (دروس اللغة العربية), Dr. V. Abdur Rahim, books 1–3.
      Free PDFs from the publisher. Arabic-only, no transliteration. → `grammar/`
- [ ] **Qasas an-Nabiyyīn** (قصص النبيين), Abul Hasan Ali Nadwi. The best graded
      classical reader there is. → `readers/`
- [ ] **Al-Qirā'ah al-Rāshidah** (القراءة الراشدة), Nadwi. Companion reader. → `readers/`
- [ ] **Al-Ājurrūmiyyah** (الآجرومية) — get an edition with commentary, e.g.
      *at-Tuḥfa as-Saniyya*. → `grammar/`
- [ ] **Lane's Arabic-English Lexicon** — the classical dictionary. → `vocabulary/`
- [ ] **Wright, *A Grammar of the Arabic Language*** — English reference grammar. → `grammar/`
- [ ] **Husary or Minshawi *muʿallim* recitation** — slow, deliberately
      articulated. Best free native audio for classical pronunciation. → `audio/`

Worth paying for:

- [ ] **Hans Wehr, *A Dictionary of Modern Written Arabic*** — organised **by
      root**. The physical form of this app's design. → `vocabulary/`
- [ ] **Buckwalter & Parkinson, *A Frequency Dictionary of Arabic*** — 5,000
      ranked lemmas with examples. Feeds the pipeline directly. → `vocabulary/`
- [ ] **Haywood & Nahmad, *A New Arabic Grammar of the Written Language*** → `grammar/`
- [ ] **Alan Jones, *Arabic Through the Qur'an*** → `grammar/`
- [ ] **Abdulazeez Abdulraheem, *80% of Qur'anic Words*** — roughly the Level 1
      word list. → `vocabulary/`

Method research, if you come across it:

- [ ] **Paul Nation, *Learning Vocabulary in Another Language*** — the evidence
      behind the 95% coverage rule. → `papers/`
- [ ] **FSRS papers, Jarrett Ye** — the scheduling algorithm. → `papers/`

Deliberately not on this list: anything dialect-heavy (Sowt and most Arabic
podcast networks), anything using Latin transliteration, and Al-Kitaab — good
book, but MSA-and-dialect focused, which isn't the target.
