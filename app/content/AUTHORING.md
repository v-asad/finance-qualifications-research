# Authoring brief (for content writers)

You are writing study content for a mobile study app for **one real candidate** sitting **CFA Level I in late February 2027** (so the **2027 curriculum** applies). He works 10-hour days and studies in **~10-minute bursts on an iPhone**. He **completed ACCA ~2–3 years ago**.

## Sources

- Learning-module list, LO themes and key formulas: `/home/shady/projects/cfa/docs/cfa/level-1.md` (use the **2027** LM lists in section 6), `/home/shady/projects/cfa/docs/cfa/formulas-and-concepts.md`, `/home/shady/projects/cfa/docs/cfa/ethics-and-standards.md`.
- Use the official 2027 LM titles and LM order from `level-1.md`. Cover every 2027 LM in your topic.
- Write **original** text. Do not copy CFA Institute curriculum text or prep-provider material. You may use your own knowledge of the subject and web lookups to confirm facts.

## Format

Follow `/home/shady/projects/cfa/app/content/SCHEMA.md` exactly. Validate with:

```
cd /home/shady/projects/cfa/app && node scripts/validate-content.mjs content/topics/<file>.json
```

Fix every ERROR. Warnings should be rare.

## Size and style

- 1–3 lessons per LM depending on LM size (bigger LMs → 3). Each lesson = 3–6 cards + 3–5 lesson questions, ~8 minutes in total.
- 4–6 extra `exam`-pool questions per LM (exam-style, difficulty 2–3; these feed mocks and checkpoints, so make them as close to real CFA Level I style as you can).
- 3–8 flashcards per LM (formulas, definitions, rules, IFRS vs US GAAP differences, "which increases/decreases" relationships).
- Cards: phone-sized, punchy, ≤ 90 words body. Lead with intuition, then the rule/formula, then a short numeric example where useful, then an exam tip or common trap.
- Include BA II Plus keystrokes (`calc`) for TVM/cash-flow/statistics computations where natural.
- Questions mirror real Level I style: 3 options, one correct, plausible distractors from common mistakes. Explanations explain the correct answer and why the distractors are wrong, showing the working.
- Balance the correct-answer index roughly evenly across 0/1/2 (the app shuffles anyway).
- **Verify every number with Python** (`python3 -I -c "..."`) before writing it. Wrong answers are the worst possible defect.

## ACCA overlap (fast-track)

The candidate has passed all ACCA mandatory exams (assume these papers): **BT, MA, FA, LW, PM, TX, FR, AA, FM, SBL, SBR**, plus two options out of **AFM, APM, ATX, AAA** (the app asks which).

What ACCA covered (relevant to CFA L1):
- **FA / FR / SBR:** IFRS single-entity and group accounts, IAS 2 inventories, IAS 16/IAS 36/IAS 38, IFRS 16 leases (lessee), IAS 12 deferred tax, IFRS 15 revenue, IFRS 9 basics, IAS 7 cash flow statements, EPS (IAS 33), ratio interpretation. **Not covered:** US GAAP differences (LIFO, impairment test differences, cash-flow classification differences), analyst adjustments, financial-reporting-quality red flags.
- **FM:** time value of money, NPV/IRR/payback, capital rationing, working capital management (cash conversion cycle, receivables/payables/inventory policies, EOQ), sources of finance, cost of capital (WACC, CAPM, dividend growth model), Modigliani–Miller with and without tax, business valuation (asset, earnings/P/E, dividend valuation model, simple bond valuation and redemption yield), FX risk (PPP, IRP, forwards, money-market hedge), interest-rate risk (FRAs, futures, options, swaps — basic hedging), efficient market hypothesis basics.
- **MA / PM:** costing, budgeting, variances, basic statistics (expected values, simple regression/high-low for forecasting), performance measurement.
- **BT / SBL:** basic micro/macro economics (demand/supply, elasticity, market structures intro, fiscal/monetary policy), corporate governance, stakeholders, strategy, risk management, professional ethics (IESBA-style fundamental principles).
- **AFM (option):** APV, real options, Black–Scholes intro, M&A valuation, duration/convexity intro, advanced hedging with derivatives, CAPM and portfolio theory.
- **APM / ATX / AAA (options):** little CFA overlap.

Fast-track rules:
- Put papers in a lesson's `fastTrack` only if an ACCA holder of that paper would likely answer the lesson questions correctly with no new study. Be **conservative**: CFA tests analyst-side interpretation, US GAAP comparisons and specific terminology that ACCA does not.
- **Never** fast-track Ethics (CFA Code and Standards are new to him even though ACCA had an ethics code), hypothesis testing/regression, fixed-income analytics beyond simple pricing/yield, alternatives, or derivatives pricing beyond basic payoffs.
- `acca.overlap` at module level: `strong` = most of the LM is ACCA material; `partial` = some; `none` = new.
- Where a lesson is NOT fast-tracked but ACCA gives a head start, add a `tip` card titled **"ACCA vs CFA"** that tells him what's different (terminology, emphasis, IFRS vs US GAAP, sign conventions). This is high-value: it bridges his existing knowledge.

## Before you finish

1. Validator shows 0 errors.
2. You have re-checked every numeric question with Python.
3. Report: modules/lessons/questions/flashcards counts and anything you were unsure of.
4. Do NOT run git commands. Do NOT edit files other than your assigned topic file(s).
