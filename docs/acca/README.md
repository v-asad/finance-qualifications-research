# ACCA (Association of Chartered Certified Accountants): research pack

> **As of:** 22 October 2026. Prepared for designing an exam-prep and edtech product: content taxonomy, question bank, mock exam engine and progress tracking.
>
> **Headline:** the ACCA Qualification is **mid-transition**. The current 13-exam structure has its **last Applied Skills and Strategic Professional sittings in June 2027**. A **redesigned qualification** (Knowledge, Expertise and Strategic Professional levels, plus Essential Employability Modules, with only **one** Option) starts in **July/September 2027**. Build for both, with a mapping layer between them. See [future-qualification-2027.md](future-qualification-2027.md).

## Executive summary

| Topic | Key facts |
|---|---|
| **Who** | UK-headquartered global professional accountancy body, founded **1904**. Member of IFAC. Positions itself as "the only truly global professional accountancy body". |
| **Scale** (Oct 2026) | **"Over 266,100 members and 546,500 future members in 179 countries."** Annual accounts at 31 Mar 2025: 257,956 members and 530,124 future members. |
| **Exam volumes** | About **92k–121k students sit per session** (Sep 2026: 102,263 entered, 114,239 exams completed). June and December are the biggest sessions. About 15–17k new affiliates a year. |
| **Qualification (current)** | **13 exams**: Applied Knowledge (BT, MA, FA) → Applied Skills (LW, PM, TX, FR, AA, FM) → Strategic Professional: Essentials SBL and SBR, plus **2 of 4 Options** (AFM, APM, ATX, AAA). Also the **Ethics and Professional Skills Module (EPSM)** and the **Practical Experience Requirement** (36 months plus 9 performance objectives). |
| **Exams** | All CBE. **AK and LW (ENG/GLO) are on-demand.** Others run in **4 sessions a year** (Mar, Jun, Sep, Dec). Pass mark **50%**. Exam types: 2h objective tests (AK, LW), 3h OT plus constructed response (Applied Skills), and 3h15m fully written (Strategic Professional, with 20 professional-skills marks in the Options and an SBL case study with pre-seen). |
| **Pass rates** | AK 64–89%. Applied Skills about 40–55% (PM lowest at about 40–45%). Strategic Professional about 38–53% (AAA and APM lowest). Very stable over time. |
| **Time to qualify** | ACCA: "as little as three or four years" if working and studying. PER requires 36 months. Strategic Professional has a **7-year** completion window. |
| **Entry** | 2 A-levels + 3 GCSEs (5 subjects including English and Maths) or equivalent. Otherwise start with FIA (no entry requirements). Up to **9 exemptions** for degrees and professional qualifications. **No exemptions at Strategic Professional.** |
| **Cost (UK list, 2026)** | Registration £89; annual subscription £140. Applied Skills exam £160 (standard) / £409 (late). SBL £282. SBR and Options £208 (late £467). EPSM £83. Exemptions £86 (AK) / £114 (AS) each. |
| **Recognition** | Global. UK statutory audit route for ACCA members (requires UK/IRL variants of LW, TX and AAA, among other conditions). Many Joint Examination Schemes with national bodies. Academic awards with the University of London (BSc and MSc Professional Accountancy). *Detailed country-by-country statutory recognition was not researched.* |
| **Ecosystem** | ACCA's own free tools: **Study Hub** (full-syllabus content, quizzes, flashcards), **Practice Platform** (CBE replica, specimen and past exams, self-marking), mocks, Compass planner. Content Partners: **BPP and Kaplan**. **Approved Learning Partners** in Silver, Gold and Platinum tiers. Free community resource: OpenTuition. |

## Files

| File | Contents |
|---|---|
| [qualification-structure.md](qualification-structure.md) | Full current route, progression rules, time limits, EPSM, **PER** (5 Essentials + 4 of 17 Technical POs), embedded awards, FIA, **variants**, entry routes, duration |
| [future-qualification-2027.md](future-qualification-2027.md) | **Redesigned qualification**: levels, new exam codes (F1–F3, K1–K3, E1–E5, S1, S2, SAA, SCF, **SDS**, SPI, STA), EEMs, new formats and syllabus sections, **official current→new mapping**, deadlines, exemptions |
| [exams-and-format.md](exams-and-format.md) | On-demand vs session vs remote; **format table per exam**; CBE **question-type catalogue** and software functions; session calendar; marking and results; mock-engine checklist |
| [exemptions-fees-registration.md](exemptions-fees-registration.md) | Entry requirements, registration and subscription, exam fees (standard and late), on-demand fees, exemption policy and fees, audit-qualification caveats |
| [statistics.md](statistics.md) | Pass rates for **every exam and session, Mar 2023 – Sep 2026**; FIA rates; session volumes; membership counts |
| [ecosystem.md](ecosystem.md) | ACCA tools (Study Hub, Practice Platform, mocks, Compass), content partners, ALPs, study hours, **student pain points**, change log 2023–2027, IP and compliance notes |
| [syllabus/](syllabus/) | One file per exam. Aim, capabilities, **learning outcomes with IDs and intellectual levels**, exam format, examinable documents, recent changes, examiner-report weaknesses. |

### Syllabus files (current 2026/27 syllabi)

| Level | Files |
|---|---|
| Applied Knowledge | [BT](syllabus/BT.md) · [MA](syllabus/MA.md) · [FA](syllabus/FA.md) |
| Applied Skills | [LW](syllabus/LW.md) · [PM](syllabus/PM.md) · [TX](syllabus/TX.md) · [FR](syllabus/FR.md) · [AA](syllabus/AA.md) · [FM](syllabus/FM.md) |
| Strategic Professional, Essentials | [SBL](syllabus/SBL.md) · [SBR](syllabus/SBR.md) |
| Strategic Professional, Options | [AFM](syllabus/AFM.md) · [APM](syllabus/APM.md) · [ATX](syllabus/ATX.md) · [AAA](syllabus/AAA.md) |

The learning-outcome codes in the syllabus files (e.g. `C4g`) follow ACCA's study-guide numbering. They can be used as stable keys for a content taxonomy, **within a syllabus year**. They are renumbered in some years (APM was in Sept 2026) and change completely in the 2027 redesign.

## Top implications for the product

1. **Versioned taxonomy.** The key is (exam code, variant, syllabus year), with an explicit 2026/27 → 2027/28 crosswalk. Examinable documents change every year: IFRS (IFRS 18 now examinable in FA, FR and SBR), ISAs, and the Finance Act for the tax variants.
2. **CBE-faithful mock engine.** Support all OT item types, OT cases, MTQs, spreadsheet and word-processor CR with formula capture, and professional-skills marking. ACCA's free Practice Platform is the UX reference and the bar to beat.
3. **Constructed-response marking is the biggest gap.** ACCA offers only self-marking. AI-assisted marking against marking guides would be a differentiator from Applied Skills upwards.
4. **Focus on the bottleneck exams:** PM, AA, FM, AAA, APM and SBR.
5. **Journey tracker:** exams, exemptions, EPSM, PER POs and months, the 7-year clock, entry deadlines (late fees are about 2.5×), and **2027 transition advice** (e.g. "finish BT before mid-July 2027", "finish all Applied Skills to avoid the DTI module").
6. **Variant handling:** LW, TX and ATX have up to about 17 country variants. Start with GLO/ENG, UK, and the high-volume variants (e.g. MYS, SGP, ZAF, PKN).

## Major caveats
- Fees are **UK list prices** and may differ by country. Centre on-demand fees are set by centres.
- Pass rates for Mar 2023 – Jun 2025 come from a third-party compilation of official figures (OpenTuition), cross-checked against ACCA releases for four later sessions with an exact match.
- Indicative study hours are **not ACCA figures**. ACCA explicitly does not prescribe hours.
- Some items are marked *unverified* in individual files: cross-exemptions with other bodies, the Oxford Brookes BSc closure date, the AFM formulae sheet, and some variant lists.
- The web-search budget ran out during the research. Some facts were confirmed by fetching ACCA pages directly rather than by search.

## Sources (key)
- ACCA – The ACCA Qualification, how it works: https://www.accaglobal.com/gb/en/qualifications/glance/acca/how.html
- ACCA – September 2026 results and boilerplate membership figures: https://www.accaglobal.com/gb/en/news/2026/October/Sept-exams.html
- ACCA – Future ACCA Qualification: https://www.accaglobal.com/ubcs/en/campaigns/accountancy-redefined/future-acca-qualification.html
- ACCA – Transition guidance: https://www.accaglobal.com/gb/en/campaigns/accountancy-redefined/future-acca-qualification/supporting-your-transition/acca-qualification-students.html
- ACCA – Fees and charges: https://www.accaglobal.com/gb/en/qualifications/accountancy-career/fees/fees-charges.html
- ACCA – About our exams: https://www.accaglobal.com/gb/en/student/exam-entry-and-administration/about-our-exams.html
- ACCA – Exemptions FAQ (audit qualification): https://www.accaglobal.com/gb/en/help/exemptions.html
- PQ Magazine (annual report membership figures): https://www.pqmagazine.com/
- Full source lists are at the bottom of each file.
