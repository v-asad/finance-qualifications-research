# Content schema (CFA Level I, 2027 curriculum)

One JSON file per topic in `content/topics/<topicId>.json`. All content is **original** (written from scratch, never copied from CFA Institute curriculum text or any prep provider). It targets the **2027 Level I curriculum** (first exam window Feb 2027).

Topic IDs and file names:

| topicId | Name (2027) | Weight |
|---|---|---|
| `ethics` | Ethical and Professional Standards | 10–15 |
| `quant` | Quantitative Methods | 11–14 |
| `econ` | Economics | 6–9 |
| `fsa` | Financial Statement Analysis | 11–14 |
| `corp` | Corporate Finance | 6–9 |
| `equity` | Equities | 11–14 |
| `fi` | Fixed Income | 11–14 |
| `deriv` | Derivatives | 6–9 |
| `alts` | Alternative Investments | 6–9 |
| `pm` | Portfolio Construction | 8–12 |

Fixed Income is written in two parts: `fi.json` (LMs 1–10) and `fi2.json` (LMs 11–19). Both use `"id": "fi"`, and the loader merges them.

## Shape

```jsonc
{
  "id": "quant",
  "name": "Quantitative Methods",
  "weight": [11, 14],
  "blurb": "One sentence on what this topic is about and why it matters on the exam.",
  "accaNote": "One or two sentences on what an ACCA member already knows here.",
  "modules": [
    {
      "id": "quant-01",              // <topicId>-<2-digit LM number>
      "lm": 1,                       // official 2027 LM number within the topic
      "title": "Returns of Financial Assets and Instruments",   // official 2027 LM title
      "summary": "1–2 sentence plain-English summary.",
      "acca": {
        "overlap": "none" | "partial" | "strong",
        "papers": ["FM"],            // ACCA papers that cover this; [] if none
        "note": "What ACCA covered and what is new for CFA."
      },
      "lessons": [
        {
          "id": "quant-01-a",        // module id + letter
          "title": "Short lesson title",
          "minutes": 8,              // realistic time to read the cards and answer the questions (5–10)
          "fastTrack": ["FM"],       // ACCA papers whose holders can test out of this lesson; [] = must study
          "cards": [ /* 3–6 cards, see below */ ]
        }
      ],
      "questions": [ /* see below */ ],
      "flashcards": [ /* 3–8 per module */ ]
    }
  ]
}
```

### Cards (the teaching content of a lesson)

Each lesson has 3–6 cards that fit on a phone screen (≤ 90 words per card body). Kinds:

```jsonc
{ "kind": "concept", "title": "…", "body": "…" }
{ "kind": "formula", "title": "…", "formula": "FV = PV × (1 + r)^{N}",
  "where": [["FV", "future value"], ["r", "rate per period"]], "note": "optional one-liner" }
{ "kind": "example", "title": "…", "body": "worked example with numbers", "calc": "optional BA II Plus keystrokes, e.g. 5 [N] 8 [I/Y] -100 [PV] 0 [PMT] [CPT] [FV] → 146.93" }
{ "kind": "compare", "title": "…", "rows": [["", "IFRS", "US GAAP"], ["Interest paid", "CFO or CFF", "CFO"]] }   // first row is the header
{ "kind": "tip", "title": "Exam tip" | "Common trap" | "ACCA vs CFA", "body": "…" }
```

### Text formatting (`body`, `stem`, `explanation`, `note`, flashcards)

- Plain text with light markup: `**bold**`, `*italic*`, blank line = new paragraph, lines starting with `- ` = bullets.
- Superscript: `^{...}` (e.g. `(1 + r)^{N}`); subscript: `_{...}` (e.g. `R_{f}`). Always use braces.
- Use Unicode math symbols freely: × ÷ − ± √ Σ Π σ μ ρ β α ≈ ≤ ≥ → Δ.
- No HTML, no LaTeX, no images.

### Questions

```jsonc
{
  "id": "quant-01-q01",           // module id + q + 2 digits
  "lesson": "quant-01-a",         // lesson it belongs to, or null for exam-pool questions
  "pool": "lesson" | "exam",      // lesson = shown inside lessons; exam = reserved for mocks/checkpoints/review
  "difficulty": 1 | 2 | 3,        // 1 = recall, 2 = apply, 3 = multi-step / tricky
  "stem": "Question text. Vignette-style numbers allowed.",
  "options": ["…", "…", "…"],     // EXACTLY 3 options like the real exam (A/B/C)
  "answer": 0,                    // index of the correct option
  "explanation": "Why the answer is correct AND why each wrong option is wrong (2–5 sentences, show working for calculations).",
  "calc": "optional BA II Plus keystrokes"
}
```

Rules:
- Exactly 3 options, one unambiguously correct. Never "all/none of the above" (options are shuffled in the app).
- Distractors must be plausible: the result of common mistakes (wrong sign, wrong compounding, mixing up IFRS/US GAAP, etc.).
- Numeric options are rounded consistently and every calculation is **verified with Python** before writing.
- Per lesson: 3–5 `lesson` questions. Per module: an additional 4–6 `exam` pool questions (harder, exam-style, mixed difficulty 2–3).
- Ethics questions are short scenarios ("Is she in violation…?") testing the specific Standard.

### Flashcards

```jsonc
{ "id": "quant-01-f01", "front": "Prompt (formula name, definition, rule)", "back": "Answer" }
```

## Validation

Run `node scripts/validate-content.mjs` from `app/`. It checks ids, references, option counts, answer ranges and markup.
