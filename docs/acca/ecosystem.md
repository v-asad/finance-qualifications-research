# The ACCA learning ecosystem, student pain points, and recent changes

> **As of:** 22 October 2026. This file covers who teaches ACCA, what ACCA gives students for free, what is paid, where the gaps are, and what is changing in 2025–2027. Statements are sourced from ACCA pages unless marked **[synthesis]** (our analysis) or **[unverified]**.

---

## 1. Key players

### 1.1 ACCA itself (first-party tools)

| Tool | What it is | Cost | Product relevance |
|---|---|---|---|
| **ACCA Study Hub** | Digital platform inside MyACCA with "free online study content which covers the full syllabus", chapter quizzes, "practice and revision questions and flashcards". Covers FIA, AK, AS and SP. Web and mobile. ACCA calls it "complementary … not a replacement" for tuition. | Free to registered students. Tutors can **buy** extra mocks, question banks and tuition slides. | Our direct free competitor for core notes. ACCA claims it is "proven to increase pass rates". |
| **ACCA Practice Platform (CBE Practice Platform)** | Free on-demand replica of the live **session CBE** software, loaded with **specimen and past exam content**. Students can self-mark against marking guides and sample answers, view feedback and track performance. There are "two or three temporary, minor differences" from the live software. | Free | The **only** authentic interface replica. Any mock engine we build should copy its UX (spreadsheet and word-processor response areas, scratchpad, navigator, flag for review). It will be updated for all redesigned exams in **March 2027**. |
| **Pre-exam mocks** | New mock exams for Applied Skills and SP released on the Practice Platform before each session (e.g. the pre-September mock went live 14 Aug), plus tutor **debrief videos** (released about a week later on YouTube). | Free | ACCA: "Students who complete a mock exam have a **12% better pass rate**." Its "Do → Debrief → Develop" loop is a good model to borrow. |
| **Practice Tests** (on-demand exams) | Sets of **3 tests** per on-demand exam (FIA, BT, MA, FA, LW) with a personalised feedback diagram by syllabus area. | £10 / £14 / £18 per set | Paid niche, covering AK and LW only. |
| **Get Ready Modules** (Student VLC) | Self-check quizzes on underpinning knowledge, plus "knowledge recap" e-learning (recap modules for the Options). | Free | A diagnostic or prerequisite-check feature with ACCA precedent. |
| **Compass planner** | A study-plan tool. Default **12-week study period per exam** (one exam per quarter), with configurable plans and daily tasks. | Free | Planner baseline; we need to beat it on adaptivity. |
| **InSession / InSession Plus** | Countdown emails and weekly tutor videos in the month before the session (PM, AA, FR, APM). | Free | Shows where ACCA sees the risk: PM, AA, FR and APM are low-pass exams. |
| **Kickstart, Back on Track, webinars** | Onboarding support and fail-recovery programmes ("first fail", "narrow fail", "repeated fail"). "My Exam Performance" shows strengths and weaknesses after results. | Free | Resit and fail-recovery is an explicit ACCA journey worth serving. |
| **ACCA-X** (on edX) | Free and paid online courses, mainly Foundations and Applied Knowledge. Being updated for F and K exams in **April 2027**. | Free / paid | Competes at entry level. |
| **Student Accountant** (magazine, app) and **technical articles / examiner's reports** | Per-exam technical articles, examining-team guidance and post-session examiner's reports. | Free | The highest-signal source for "what examiners want" and common errors; these should be ingested into our content. |
| **Learning Community** | ACCA's online peer community. | Free | |

### 1.2 Content partners (publishers)
ACCA's **Content Partner programme** currently lists **two** partners: **BPP Learning Media** and **Kaplan Publishing**. ACCA "strongly recommend[s]" their question and answer banks "as your primary resource when it comes to question practice". A separate **Recognised Content Provider** programme covers variant exams and other qualifications.
- Becker (and others) previously held approved-content status; they are **not** on ACCA's current list. *[unverified: exact change date]*
- Typical publisher products: Study Text, Practice & Revision Kit (exam kit), Pocket Notes, Passcards, online question banks, and mock exams. **[synthesis]**

### 1.3 Approved Learning Partners (ALPs: tuition providers)
- **Three tiers:** **Silver** (new providers, or those not yet meeting Gold targets), **Gold** (meets performance targets across the institution's operations), and **Platinum** (ACCA Qualification tuition only; meets extra best-practice statements and **specific pass-rate targets**).
- ALPs get free access to Study Hub student resources, the **Educator Hub**, "Digital Train the Trainer" and "Digital Train the Marker".
- A "comprehensive update" on the ALP programme for the redesign is due **by December 2026**.
- Large global and UK ALPs include **Kaplan, BPP, First Intuition, LSBF** and many regional providers (e.g. in Pakistan, India, Malaysia, Vietnam, Nigeria and the UAE). **[synthesis: names from general knowledge and partner pages; tier status not verified]**
- **OpenTuition** offers free ACCA notes, lectures, forums, an AI tutor and pass-rate polls. It is a widely used free resource and a strong community competitor. **[observed on opentuition.com]**

### 1.4 Universities
- **University of London:** BSc Professional Accountancy (requires FR, TX and AA passed; grants PM and FM). Next intake **March 2027**. MSc Professional Accountancy (academic direction by UCL).
- **Accredited university programmes** give exemptions (up to 9 exams) and conditional exemptions while students are enrolled.

---

## 2. Study hours

- **ACCA does not prescribe study hours.** The 2027/28 syllabi state: "The ACCA Qualification does not prescribe or recommend any particular number of learning hours for examinations because study and learning patterns and styles vary greatly…"
- ACCA's **Compass** default is **12 weeks per exam**.
- The EEMs have ACCA estimates: Responsible Business Management about 60 h, Digital Tech & Innovation about 100 h, Ethical Sustainable Leadership about 70 h. EPSM is about 20 h.
- **Indicative per-exam hours, for planning defaults only.** These are **[synthesis/unverified]** typical ranges used by tuition providers and students, not ACCA figures:

| Exam group | Indicative total hours (tuition + self-study + revision) |
|---|---|
| BT, LW | ~80–120 |
| MA, FA | ~100–150 |
| PM, TX, FR, AA, FM | ~150–250 (FR, PM and TX often at the upper end) |
| SBR, SBL | ~200–300 |
| AFM, APM, ATX, AAA | ~200–300 |

Recommendation: make plan durations **user-configurable** with these as defaults, and calibrate them from our own user data.

---

## 3. Student pain points (input for product design)

Sources: examiner's reports (see per-exam files in [syllabus/](syllabus/)), the pass-rate data in [statistics.md](statistics.md), and ACCA's own support programmes, which show where ACCA sees risk. Items are **[synthesis]** unless otherwise cited.

1. **Exam technique beats knowledge at Applied Skills and above.** Examiner's reports repeatedly cite these failings:
   - not answering the actual requirement (verb mismatch, e.g. "evaluate" answered as "describe");
   - poor time management, with the last question rushed or left blank;
   - not applying knowledge to the scenario (generic, "knowledge-dump" answers);
   - weak professional-skills marks at Strategic Professional.

   Product: requirement-verb training, timed section drills, scenario-application feedback.
2. **Constructed-response practice is hard to self-mark.** OTs are auto-marked, but CR answers need expert judgement. ACCA's Practice Platform offers **self-marking only**. **AI-assisted marking against official marking guides is the largest gap** in free tooling.
3. **Using the CBE interface.** Spreadsheet answer areas have quirks: one worksheet only, no inserting rows, formulae shown to markers, scratchpad **not marked**. Students who practise only on paper lose marks. Product: an interface-faithful mock engine.
4. **Low-pass "bottleneck" exams:** PM (~40–45%), AA (~43–47%), FM (~46–52%), AAA (~38–42%) and APM (~40–42%). Students commonly report **repeat attempts**. A resit-focused journey ("narrow fail" vs "repeated fail") matches ACCA's own Back on Track segmentation.
5. **Choosing Options.** Two of four are required now; **one of five from Sept 2027**. Students choose by career and by pass-rate perception. A recommendation tool could use their AS results and job role.
6. **Underpinning-knowledge gaps after exemptions.** Exempt students (e.g. from FR or FM) struggle at SBR or AFM. ACCA built Get Ready Modules for this. Product: diagnostic quizzes on prerequisite topics.
7. **Long, self-paced journey with a 7-year SP clock, plus PER admin.** Motivation and planning are hard. PER statements (200–500 words × 9 POs) and supervisor sign-off are a separate burden. Product: a journey tracker with exams, EPSM, PER POs and deadlines.
8. **Changing syllabi.** Annual examinable-documents updates (IFRS, ISAs, Finance Act for tax variants), and now the **2027 redesign**, cause uncertainty: "What do I lose? Which exams should I finish before June 2027?" A transition advisor and versioned content are needed.
9. **Cost sensitivity in key markets** (Pakistan, India, Nigeria, Vietnam and others). Late-entry fees are 2.2–2.6× standard. Free resources (Study Hub, OpenTuition) set a low price anchor.
10. **Data and technology skills.** The redesign adds programming, data science, AI/LLMs (DTI EEM, SDS option) and sustainability reporting. Few students have these skills, and third-party material is still scarce.

---

## 4. Recent and upcoming changes (2023–2027)

| When | Change | Source |
|---|---|---|
| Aug–Sep 2023 | PER changes: elements no longer signed off individually; PO3 renamed to add sustainability; strict-liability clause; IFAC evidence for supervisors; "import approved" time needs employer sign-off | ACCA Changes to PER |
| From about 2023 | SBL is 3h15m (reading and planning time included) with a pre-seen released 2 weeks before. ATX moved to a 50 + 25 + 25 structure; Strategic Professional options carry 20 professional-skills marks. See the syllabus files for exact dates. | syllabus/SBL.md, ATX.md and others (subagent research) |
| After Jun 2025 | **SBR-UK withdrawn**; UK students sit SBR-INT | syllabus/SBR.md |
| 2025/26 | SBR updated for **IFRS 18**; IFRS S1/S2 (sustainability) examinable in SBR | syllabus/SBR.md |
| Sep 2026 | **APM restructured**: sections A–F, 13 new outcomes (SLAs, regression, ML/AI, data models); BCG, Porter's five forces and McKinsey 7S removed | syllabus/APM.md |
| After Jun 2026 | Variants withdrawn: FTX-MYS, LW-LSO, TX-HUN | ACCA variant exams page |
| Ongoing | **Remote session exams withdrawn in countries with centre provision**; remote exams only where there are no centres. Remote attempts from a different country are nullified. | ACCA exam availability page |
| By Dec 2026 | ALP programme update for the redesign | ACCA learning providers page |
| Jan–Apr 2027 | Study Hub (F/K in Jan; E/SP in Mar), Practice Platform (all exams, Mar) and ACCA-X (F/K, Apr) updated for the redesign | ACCA timeline |
| **June 2027** | **Final sitting of current Applied Skills and SP exams** (LW-ENG/GLO on-demand until about July 2027) | ACCA timeline and transition guide |
| Jul 2027 | Foundations, Knowledge and EEMs launch | ACCA timeline |
| **Sep 2027** | First Expertise and new SP exams; **one Option instead of two; new SDS Data Science Professional option** | ACCA timeline |
| Future (date to be confirmed) | Up to 6 months of PER via simulated experience in Optional EEMs | ACCA transition guide |
| Jun 2027 | LW-BWA withdrawn | ACCA variant exams page |

Full details: [future-qualification-2027.md](future-qualification-2027.md).

---

## 5. IP and compliance notes for building a product
- **Exam and module content is ACCA IP.** The Ethics Module rules prohibit copying or sharing module content and quiz answers, and prohibit accessing modules "to create derivative works or build a product or service which competes with or is substantially similar to the Ethics Modules". Do **not** reproduce EPSM or EEM content.
- **Past exams, specimen exams and examiner's reports** are published free by ACCA. Using them verbatim in a commercial product likely needs permission or licensing. **[unverified: check ACCA copyright terms]** Original questions written to the syllabus and study guide are the safe default.
- Partnering routes include ACCA's **Content Partner** and **Recognised Content Provider** programmes and the **ALP** programme. These are worth investigating if we want an "ACCA approved" badge.

---

## Sources
- ACCA – Study options (Study Hub, Content Partners BPP and Kaplan, Recognised Content Provider): https://www.accaglobal.com/gb/en/student/prepare-for-exams/additional-study-resources/approved-content.html
- ACCA – Additional study resources: https://www.accaglobal.com/gb/en/student/prepare-for-exams/additional-study-resources.html
- ACCA – Practice Platform and CBE support: https://www.accaglobal.com/gb/en/student/exam-support-resources/professional-exams-study-resources/cbe-platform-support.html
- ACCA – Mock exams (12% claim): https://www.accaglobal.com/gb/en/student/prepare-for-exams/InSession-exam-countdown-emails/mock-exam-event.html
- ACCA – Practice tests: https://www.accaglobal.com/gb/en/student/exam-support-resources/practice-tests.html
- ACCA – Get Ready modules: https://www.accaglobal.com/gb/en/student/exam-entry-and-administration/prepare-for-exams/InSession-exam-countdown-emails/self-check-modules.html
- ACCA – Compass planner: https://www.accaglobal.com/gb/en/student/prepare-for-exams/InSession-exam-countdown-emails/compass-planner.html
- ACCA – Planning your route (12-week default): https://www.accaglobal.com/gb/en/student/prepare-for-exams/routeplanning.html
- ACCA – InSession Plus: https://www.accaglobal.com/gb/en/student/prepare-for-exams/InSession-exam-countdown-emails/in-session-plus.html
- ACCA – Get Back on Track: https://www.accaglobal.com/gb/en/student/exam-entry-and-administration/exam-results/exam-performance.html
- ACCA – Approved Learning Partner programme (Silver, Gold, Platinum): https://www.accaglobal.com/gb/en/learning-provider/approved-learning-partner.html
- ACCA – Study Hub for learning providers: https://www.accaglobal.com/gb/en/learning-provider/studyhub.html
- ACCA – Future qualification for learning providers (ALP update by Dec 2026): https://www.accaglobal.com/gb/en/learning-provider/future-qual-lp.html
- ACCA – Timeline of the redesign: https://www.accaglobal.com/gb/en/campaigns/accountancy-redefined/future-acca-qualification/timeline.html
- ACCA – Transition guidance (EEM hours): https://www.accaglobal.com/gb/en/campaigns/accountancy-redefined/future-acca-qualification/supporting-your-transition/acca-qualification-students.html
- ACCA – K1 syllabus 2027/28 (learning hours statement): https://www.accaglobal.com/content/dam/accarelaunch/ila/exam-artefacts/applied-knowledge/k1-financial-accounting/K1%20Jul27-%20Aug28%20Syllabus%20and%20Study%20Guide.pdf
- ACCA – Changes to PER: https://www.accaglobal.com/gb/en/affiliates/completing-your-per/changes-to-per.html
- ACCA – Ethics module rules: https://www.accaglobal.com/gb/en/student/ethics/ethics-module-rules.html
- ACCA – Variant exams (withdrawals): https://www.accaglobal.com/gb/en/student/exam-entry-and-administration/about-our-exams/variant-papers.html
- ACCA – Exam availability and booking (remote withdrawal): https://www.accaglobal.com/gb/en/student/exam-entry-and-administration/computer-based-exams.html
- ACCA – BSc Professional Accountancy: https://www.accaglobal.com/gb/en/qualifications/glance/bsc-professional-accountancy.html
- OpenTuition (free ACCA resource, community polls): https://opentuition.com/acca/
