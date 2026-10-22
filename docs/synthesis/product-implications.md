# Product Implications: Building Exam-Prep Software for CFA, ACCA and CA

> **As of:** 22 Oct 2026. This is a design reference that turns the research in `docs/` into product and engineering requirements. It is opinionated where the research supports a clear choice. The assumption is that **CFA is the core product** and ACCA/CA come later.

## 1. Headline findings that shape the product

1. **Everything is mid-transition.** Build for versioned syllabi from day one.
   - CFA Level I changes significantly in **2027** (93 → 102 learning modules; Quant and Equities rewritten; ethics weight down to 10–15%; GIPS removed; topics renamed).
   - ACCA's current qualification ends **June 2027**; the redesign starts Jul/Sep 2027.
   - ICAP moved to **Scheme 2025**, ICAEW to **Next Generation ACA**, ICAS to **CA24**, CA ANZ revised in **T3 2026**.
2. **CFA has three distinct assessment archetypes:** standalone MCQ (L1), item-set vignettes (L2, L3) and essay sets (L3). L3 essay marking is the clearest under-served need.
3. **CFA Institute's own Learning Ecosystem** now ships 1,000+ practice questions, mocks and a Practice Pack. A third-party product must beat it on adaptivity, analytics, explanations and essay feedback, not on volume alone.
4. **Pass marks are hidden for CFA.** CFA uses an unpublished, equated MPS and reports scale scores (L1 1000–1900, pass 1600). Any "pass probability" feature must be framed as an estimate.
5. **Trademark and prep-provider rules constrain marketing and content** (see §7).

## 2. Core domain model

```
Body (CFA Institute, ACCA, ICAP, ICAI, ICAEW, …)
 └─ Qualification (CFA Program, ACCA Qualification, ICAP CA, …)
     └─ SyllabusVersion (e.g. CFA 2026, CFA 2027; ACCA 2026/27; effective_from, effective_to, exam windows covered)
         └─ Level / Stage (L1, L2, L3 | Applied Knowledge … | PRC, CAF, CFAP …)
             └─ Exam / Paper (CFA L1 | ACCA FR | ICAP CAF-5 …)  [variant: GLO/UK/PKN …]
                 └─ Topic (CFA: Fixed Income; ACCA: syllabus area "C")
                     └─ LearningModule (CFA LM; ACCA syllabus section)
                         └─ LearningOutcome (CFA LOS; ACCA LO code e.g. "C4g"; intellectual level)
                             └─ Concept / Formula (shared, cross-qualification graph nodes)
 └─ Pathway (CFA L3: Portfolio Management | Private Markets | Private Wealth)

Crosswalk (LearningOutcome[vN] ↔ LearningOutcome[vN+1]; type: same | renamed | split | merged | removed | new)
TopicWeight (Exam × Topic × SyllabusVersion → min%, max%)
ExamWindow (Exam × dates × registration deadlines × fee tiers × results date)
```

Design notes:

- **Learning outcomes are the atomic tagging unit.** Every question, flashcard, video and note is tagged to one or more learning outcomes in a specific syllabus version. Codes are stable only within a version, so store an internal UUID and keep the body's code as an attribute.
- **Concept nodes are shared across qualifications.** For example, "WACC" links CFA Corporate Issuers, ACCA FM/AFM and ICAP CFAP-4. This enables content reuse and cross-sell.
- **Crosswalks** let a user's mastery carry over when the syllabus rolls over (CFA 2026 → 2027) and support ACCA's official old→new exam mapping.
- **Variants** (ACCA LW/TX/ATX country variants; ICAEW tax years; ICAI tax law change to the Income-tax Act, 2025) are a dimension of Exam, not separate qualifications.

## 3. Item (question) types to support

| Type | Used by | Notes |
|---|---|---|
| MCQ, 3 options, single answer | CFA L1, L2, L3 item sets | CFA has no negative marking |
| MCQ 4 options / multiple response | ACCA OT, ICAI MCQ component, ICAEW Certificate | |
| Number entry | ACCA OT | Tolerance and rounding rules |
| Drag and drop / matching / hot spot / enhanced matching | ACCA OT | |
| **Item set (vignette + N questions)** | CFA L2 (22 × 4), CFA L3 (11 sets), ACCA OT cases (3 cases × 10 marks) | Vignette is a first-class entity; questions share it; timing per set |
| **Essay set (vignette + constructed responses)** | CFA L3 (11 sets) | Typed answers; graded against a rubric by points; need AI-assisted grading with rubric alignment and exemplar answers |
| Constructed response with spreadsheet / word processor | ACCA AS and SP, ICAEW, ICAS | Embedded spreadsheet with formula capture; marking on method as well as result |
| Pre-seen case study | ACCA SBL, ICAEW case studies, ICAP SCS | Pre-seen material released weeks ahead; exam adds unseen material |
| Data / analytics task | ICAEW CRDA, ICAS, ICAP AI & Data module | Dataset attached to item |

Item metadata (minimum): `learning_outcome_ids[]`, `syllabus_version`, `difficulty` (calibrated, IRT b), `discrimination` (IRT a), `cognitive_level` (CFA: know/apply/evaluate; ACCA intellectual level 1–3), `calc_required`, `formula_ids[]`, `time_estimate_s`, `exhibit_ids[]`, `source` (original / adapted), `review_status`, `errata`.

## 4. Mock exam engine requirements

- **Faithful timing and structure per exam:**
  - CFA L1: 2 sessions × 2h15m, 90 Q each, optional break.
  - CFA L2: 2 sessions × 2h12m, 11 item sets each.
  - CFA L3: 2 sessions × 2h12m (132 min), mixed item sets and essays; pathway-specific content.
  - ACCA: per-exam durations and section structures in `acca/exams-and-format.md`.
- **Blueprinting:** assemble mocks to the official topic-weight ranges (`TopicWeight`) for the selected syllabus version and pathway.
- **CBT UI fidelity:** flagging, navigator, strikeout, highlighter, on-screen calculator rules (CFA allows only TI BA II Plus / HP 12C physical calculators, so the app should show calculator keystrokes in solutions).
- **Scoring:**
  - CFA: report % by topic with 50%/70% reference lines (mirrors the official score report) and an *estimated* scale score; never claim the real MPS.
  - ACCA: 50% pass; professional-skills marks separately.
  - ICAI: 40% per paper and 50% group aggregate; 60% exemption rule.
  - ICAEW: 55% / 50%.
- **Psychometrics:** calibrate items with IRT from user responses; use it for adaptive practice and score prediction.

## 5. Learner journey and progress tracking

| Feature | CFA specifics | ACCA / CA specifics |
|---|---|---|
| Registration & deadline tracker | Early/standard deadlines; fees US$1,140/1,490 (L1, L2), 1,240/1,590 (L3); rescheduling US$250; no paid deferrals from Feb 2027 | ACCA standard vs late (~2.5×); ICAI exam months; ICAEW sittings |
| Attempt rules | 6 per level; ≤2 per calendar year; ≥6 months apart | ICAEW 4; ACCA 7-yr SP clock; ICAI registration validity (4/5/10 yrs by level) |
| Non-exam requirements | PSM per level; 4,000 hrs / 36 months; references; membership | ACCA PER (36 months, 5 essential + 4 technical POs), EPSM; ICAP training contract; ICAI articleship, ICITSS/AICITSS, SPOM; ICAEW 450 days, Specialised Learning |
| Study plan | ~300+ hrs/level; schedule backwards from exam date by topic weight and mastery | Per-exam hours (indicative) |
| Results analytics | Ingest official score-report bands (user-entered) to target weak topics on retake | Same for ACCA results |

## 6. Content strategy

1. **Start with CFA Level I** (largest volume, ~85–100k sittings a year across 4 windows), on the **2027 curriculum** (first exam Feb 2027).
2. **Differentiate on Level III essays** (AI rubric grading) and the **Private Markets / Private Wealth pathways** (thin third-party coverage).
3. **Ethics is a high-leverage module:** tested at all levels; the 2024 Standards changes (I(E), V(B), VI(A)) make older material outdated. Use `cfa/ethics-and-standards.md` as the seed.
4. **Formula engine:** `cfa/formulas-and-concepts.md` is the seed for a formula library. Each formula should have variables, worked examples, calculator keystrokes and linked items. Validate against the official curriculum text before publishing.
5. **Errata pipeline:** CFA Institute and ACCA publish errata and examinable-document updates; content must be re-versioned.

## 7. Legal, trademark and compliance constraints

- **CFA Institute trademarks:** use "CFA® Program", "CFA® charterholder", "CFA® Program candidate"; never "a CFA", "CFA certified", "CFA Level 1 certified". Include the trademark notice. See `cfa/charter-and-membership.md` §4.
- **Prep Provider Program:** listed providers must not claim pass rates or use the CFA Institute logo, and only listed providers may use LOS text. Decide early whether to join the program; it affects whether we can reproduce LOS wording. Paraphrase otherwise.
- **Curriculum and past exams are copyrighted.** CFA Institute's curriculum, ACCA past exams and examiner reports, and institute study texts cannot be copied. Write original items; link to official free resources rather than embedding them.
- **ACCA:** BPP and Kaplan are ACCA's content partners; other providers must avoid implying approval. See `acca/ecosystem.md`.
- **Exam confidentiality:** CFA candidates sign a pledge not to disclose exam content. Do not crowdsource "recalled" questions.
- **Data protection:** users are global (China, India, Pakistan, UK, US). Plan for GDPR and PIPL considerations.

## 8. Suggested phasing

| Phase | Scope |
|---|---|
| 1 | CFA L1 (2027 curriculum): taxonomy, item bank, adaptive practice, mocks, formula library, study planner |
| 2 | CFA L2 item sets; L3 core + essays with AI grading; pathways |
| 3 | ACCA Applied Knowledge/Skills on the **2027 redesign** (avoid investing in a syllabus that closes June 2027, except for transition-period students) |
| 4 | CA: ICAP (CAF/CFAP) and ICAI (Intermediate/Final) for South Asia; ICAEW later |

## 9. Risks

- **Fast-moving syllabi:** annual updates; budget for continuous content maintenance.
- **CFA Institute competing directly** with its own practice tools and Learning Ecosystem.
- **Essay-grading accuracy** must be validated against charterholder grading before marketing.
- **Data gaps** listed in `open-questions.md`.
