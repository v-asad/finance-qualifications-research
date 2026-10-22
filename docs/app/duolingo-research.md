# Duolingo product strategy and UI/UX: research for a CFA Level I PWA

> **As of:** 22 Oct 2026. **Purpose:** decide what to borrow from Duolingo, and what to avoid, for a mobile-first PWA with a blue theme ("Ledger", see `plan.md`). The user is a time-poor professional (10-hour workdays, about 10-minute study bursts on an iPhone) preparing for CFA Level I in about 60 days.
>
> **Confidence labels used throughout:**
> - **[Official]**: Duolingo blog, shareholder letters, SEC filings, earnings calls, or Duolingo research papers.
> - **[Insider]**: first-person accounts from Duolingo staff in interviews or newsletters (e.g., Lenny's Newsletter).
> - **[3rd-party]**: teardowns, wikis, community guides, reconstructed design tokens. Plausible but not verified.
> - **[Observed]**: a description of the app's UI based on common knowledge of the product. It was not re-verified for this document, and details change often because Duolingo A/B tests constantly.
>
> Numbers are only included when a source states them. Where sources conflict, both versions are given.

---

## 1. Core strategy and metrics

### 1.1 The strategic thesis: habit first, then learning

Duolingo's central bet is that **daily return is the precondition for learning**. In their words: "we can't teach people if they stop using Duolingo" [Official, *Improving the streak*, 2020]. Nearly every engagement mechanic serves one North Star.

- **North Star: CURR (Current User Retention Rate).** This is the share of "current" users (active today and at least once in the prior 6 days) who come back. Jorge Mazal, former Head of Product for growth, built a user-state model with New, Current, Reactivated (back after 7–29 days), Resurrected (back after 30+ days), At-risk WAU, At-risk MAU and Dormant. He then ran a sensitivity analysis on each transition rate. **"CURR had a gigantic impact on DAU, 5 times the impact of the second-best metric."** A Retention Team was formed with CURR as its North Star [Insider, Lenny's Newsletter, *How Duolingo reignited user growth*].
- **Reported outcome of that program:** DAU grew **4.5x over four years**, and CURR rose **21%**, which "cut daily churn of the best users by over 40%" [Insider].
- **What did not work** (also useful): a Gardenscapes-style "moves" counter took about two months to build and was **neutral** on retention and DAU. Referral work lifted new users by **only 3%** [Insider]. Gamification copied from games without a link to the habit loop failed.
- The CEO said in the Q4 2022 call that **CURR was about 80%, up from about 65%** over 2–3 years [Official, earnings call transcript].

### 1.2 Headline metrics (official unless noted)

| Period | DAU | MAU | Paid subs | Streak stats | Source |
|---|---|---|---|---|---|
| Q4 2022 | 16.3M (+62% YoY) | DAU/MAU about 27% (from about 24%) | 4.2M | **63% of DAUs had a 7+ day streak** (from 53%). **Over 3M DAUs had a 1+ year streak.** It took 8 years to reach 1M year-streakers and 21 months to go from 1M to 3M. | Q4 2022 earnings call |
| Q2 2024 | 34.1M (+59%) | n/a | n/a | **"Over 20% of our DAUs now have streaks longer than a year"** (CEO) | Q2 2024 release / 8-K |
| Q1 2025 | 46.6M (+49%) | 130.2M | 10.3M (+40%) | n/a | Q1 2025 letter |
| Q2 2025 | 47.7M (+40%) | 128.3M | 10.9M (+37%) | n/a | Q2 2025 letter |
| Q3 2025 | 50.5M (+36%) | 135.3M (+20%) | 11.5M (+34%), 9.0% of LTM MAUs | n/a | Q3 2025 letter |
| Q4 2025 / Q1 2026 | 52.7M / 56.5M (reported) | n/a | n/a | n/a | **[3rd-party, unverified]** statistics blog citing letters |

Strategic signals from the Q3 2025 letter [Official]:
- Leadership moved toward longer-term initiatives, **prioritising "user growth over monetization in the A/B tests that get launched"**, and is investing in teaching quality.
- **Chess became "our fastest-growing subject,"** and player-vs-player was added.
- Roadmap items included a new **flashcards exercise**, a guided **Video Call** format to drive Max adoption, and Year in Review.
- Less "unhinged" social-media content was cited as one factor in slower Q3 DAU growth. Brand personality is treated as a growth lever.

### 1.3 Retention levers ranked by evidence quality

| Lever | Evidence | Strength |
|---|---|---|
| Streak decoupled from daily goal (1 lesson keeps the streak) | +3.3% D14 retention, +1% DAU, +10.5% learners on a streak (+19% for new learners) | [Official] A/B test, relative lifts |
| 7-day streak as a predictor | 7-day streakers are "2.4x more likely to continue using Duolingo the next day" | [Official] correlational |
| Leaderboards (Leagues) | Learning time **+17%**. Highly engaged learners (1h/day, 5 days/week) **tripled**. D1/D7 significant | [Insider] |
| Notification bandit | **+0.5% DAU, +2% new-user retention** over a strong baseline | [Official] KDD 2020 paper |
| iOS widget | Half of widget users have a 6+ month streak. Retention "notably better" even after selection correction (no number given) | [Official] blog |
| Streak milestones (phoenix redesign) | "More people keeping their streaks alive" (no number) | [Official] blog, directional |
| "Commit to my goal" CTA copy, user-chosen streak goal | "Significantly increased retention" (no number) | [Insider] |
| Adaptive difficulty with a "hard exercise" label | More study time, more next-day return, more Plus trials (no numbers) | [Official] blog, directional |
| Birdbrain / half-life regression spaced repetition | 12% engagement lift after HLR shipped | [3rd-party report quoting Settles], VentureBeat |

**Experiment culture:** "over 600 streak-related experiments" in about four years [Insider, Jackson Shuttleworth, Lenny's podcast]. Notable miss: **coupling streaks to XP confused users**. Simplifying to "one lesson a day" worked better. Shuttleworth also stressed that **streaks cannot compensate for a product users don't find valuable**.

### 1.4 Takeaways for a 60-day exam app

- Our horizon is **60 days, not years**. Long-tail mechanics (10-tier leagues, 365-day streak identity, cosmetic shops) pay off over months to years. Short-horizon mechanics (daily streak, daily goal, short sessions, review loop, clear path) pay off in days.
- Duolingo optimises DAU. We should optimise **exam readiness per minute**, and use DAU-style habit mechanics only as means to that end. The 2022 path redesign was partly motivated by users "extending streaks with easy lessons that didn't teach much" [Official, Q4 2022 call]. That failure mode is a direct risk for us if review-only "streak savers" count as a full day.

---

## 2. Mechanic-by-mechanic breakdown

Verdict key: **Adopt** (use as is), **Adapt** (change for our user), **Avoid**.

### 2.1 Streak
- **What:** a count of consecutive days with at least one completed lesson. The flame icon sits in the top bar. Milestones are celebrated (7, 30, 50, 100, 365…). Since 2020 it has been separate from the daily XP goal.
- **Why it works:** loss aversion plus identity ("I'm a 40-day person"). A very low daily threshold makes the habit nearly frictionless.
- **Evidence:** see 1.2–1.3. Over 20% of DAUs had a year-plus streak by Q2 2024 [Official].
- **Verdict: Adopt with one adaptation.** Keep the bar low: **any completed session of at least 3 minutes, or 10 or more review cards, extends the streak.** Show the streak prominently but calmly. The exam is the real goal. Celebrate 3, 7, 14, 30, 45 and 60 days, which fit a 60-day plan. Do not make the streak the only success signal (see 2.2).

### 2.2 Daily goal / XP
- **What:** XP is earned per lesson (10–15 base, plus bonuses for combos, perfect lessons and Legendary). The daily goal used to be Casual, Regular, Serious or Intense, on an XP scale. XP also feeds leagues and quests.
- **Why it works:** a clear quantum of progress, and it drives league competition.
- **Evidence:** linking the streak to the XP goal *hurt* habit formation. Almost 40% of learners active two days in a row without a streak had the "intense" goal [Official].
- **Verdict: Adapt.** Use **minutes or plan items as the daily goal** (a ring like Apple Fitness), and keep it separate from the streak. Keep XP as a light secondary currency for quests and the friends league. Never make XP the thing users chase at the cost of correctness. XP should reward **correct first attempts and reviews**, not speed-running easy content.

### 2.3 Streak Freeze / Streak Repair / Weekend Amulet
- **What:** a freeze auto-protects a missed day. Users can hold up to 2 at a time [3rd-party], and freezes can be bought with gems or earned. Repair restores a broken streak, usually for gems or with Super. Events sometimes let lapsed long-streakers earn a streak back with 3 lessons [3rd-party, Android Authority].
- **Why it works:** it reduces the fear that "one missed day ruins everything," which otherwise stops people from starting a streak at all [Official, quoted via CMU write-up].
- **Verdict: Adapt (generously, and free).** A professional on 10-hour days *will* miss days: travel, closing weeks, illness. Give **1 automatic freeze per week, free, plus 1 "rest day" per week if chosen in the plan**, so the planned rest day never breaks the streak. **Never monetize streak repair.** Paid streak repair is cited as a deceptive pattern [3rd-party, deceptive.design].

### 2.4 Hearts → Energy
- **What:** under Hearts, users had 5 hearts and lost one per mistake. At zero they had to wait (refill estimates vary between sources: about 4h per heart vs. a full refill in about a day), practise to earn hearts back, spend gems, or subscribe to Super for unlimited hearts. **In 2025 Duolingo began replacing Hearts with Energy** [Official, *duolingo-energy* blog and Q2 2025 letter]. Each exercise uses energy, correct streaks earn some back, energy "fully recharges in about a day," and ads or gems refill it. Third-party reports give a 25-unit bar.
- **Duolingo's own reasoning:** a heart lost per mistake "was not the most effective way to support learning." Beginners were **"2X more likely to run out of hearts mid-lesson"** [Official].
- **Reception:** the change drew backlash, including a Change.org petition in Sept 2025. Some users find Energy feels *more* restrictive because even correct answers cost something [3rd-party].
- **Verdict: Avoid entirely.** Hearts and Energy are **monetisation pacing systems for free users**, not learning tools. For an exam candidate, mistakes are the most valuable data. They should feed the review queue, not block study. We already decided on "no hearts or lives" in `plan.md`.

### 2.5 Gems (currency) and the shop
- **What:** a soft currency from lessons, quests, chests and league finishes. It is spent on freezes, refills, timer boosts, outfits and League Repair (2,000 gems [3rd-party]).
- **Verdict: Avoid** a currency economy. It adds cognitive load and dark-pattern risk for little value over 60 days. Rewards can be direct (a free freeze, a badge, a "Perfect week" mark).

### 2.6 Leagues (leaderboards)
- **What:** a weekly XP leaderboard of about 30 matched users [3rd-party]. Matching uses similar study habits and timezone [Official]. **10 tiers:** Bronze → Silver → Gold → Sapphire → Ruby → Emerald → Amethyst → Pearl → Obsidian → Diamond. Promotion slots narrow from about 20/30 in Bronze to about 5 in Obsidian, with demotion at the bottom [3rd-party]. Diamond top-10 can enter a 3-round Tournament [Official]. Users can opt out by making the profile private [Official].
- **Evidence:** the strongest single lever in Mazal's account. **+17% learning time, and 3x highly engaged learners** [Insider].
- **Risks:** it rewards XP farming (easy lessons) over learning. Demotion anxiety is a frequent complaint about an "unhealthy" relationship with the app.
- **Verdict: Adapt, small and opt-in.** Use a **friends-only weekly league** (the app is multi-user among friends). Rank on **"focused minutes" or plan items completed**, not raw XP, so nobody can farm it. Do not use demotion tiers. Make it opt-out at any time. Strangers-based leagues are pointless at our scale and would only add noise.

### 2.7 Quests (Daily, Monthly, Friends Quests)
- **What:** **Daily Quests** are 3 small tasks (e.g., earn N XP, get N combos, complete N lessons with 90%+), rewarded with a chest. **Monthly** quests award a badge. **Friends Quests** pair you with a friend for a shared weekly target over 5 days, with rewards such as a 30-minute XP boost or gems for both [Official / 3rd-party].
- **Why it works:** it varies the daily task and gives small, completable goals that each take about 5 minutes. Friends Quests add social accountability without the zero-sum competition of leagues.
- **Verdict: Adopt (light).** Use **3 daily micro-quests generated from the plan**, for example "Clear 10 due reviews", "Score 80%+ on a Quant drill" or "Learn 1 new FSA lesson". Add an optional **co-op weekly quest with a friend** ("Together: 300 questions this week"). Co-op suits adults better than zero-sum competition.

### 2.8 Combo, perfect-lesson and bonus mechanics
- **What [Observed]:** "N in a row" combo callouts within lessons, a perfect-lesson bonus XP, and an accuracy and time summary at the end.
- **Verdict: Adopt (subtle).** A "5 in a row" toast is nice positive feedback. Avoid timing pressure except in mock or timed modes, because CFA pacing (about 90 seconds per question) is a separate skill trained in mocks.

### 2.9 Legendary levels
- **What:** after completing a node, users can take a harder "Legendary" version with no hints for more XP. The node turns gold. Since the 2022 path, Legendary applies at the unit level [Official]. It historically cost gems or required Super.
- **Verdict: Adapt as "Mastered".** A topic or Period becomes **gold ("Mastered")** when the user passes a no-hints, exam-style checkpoint at 70% or more. This is a meaningful signal for exam readiness. It must be free.

### 2.10 Practice Hub / review
- **What:** a dumbbell tab with Mistakes review, Words, Speaking, Listening and Stories. Much of it is **Super-only** [Official]. Free users get review via path nodes and "personalized practice".
- **Verdict: Adopt (free, central).** Our `/review` hub (Due reviews, Mistakes, Weak spots, Formula sprint, Mini-mock) is our version of this, and it is the most important learning feature for exam prep. Never paywall it.

### 2.11 Birdbrain and spaced repetition
- **What:** Birdbrain is an ML model that estimates both learner ability and exercise difficulty, and predicts P(correct) per exercise [Official]. It targets a "Goldilocks" difficulty. When a learner gets everything right, it serves items with about **70% predicted success** [3rd-party quoting Settles]. It was first run in "shadow mode" before being used [3rd-party, IEEE Spectrum]. Separately, **half-life regression (HLR)** models each item's memory half-life, h = 2^(Θ·x), and schedules review before recall falls to about 50% [Official / 3rd-party].
- **Verdict: Adapt (simplified).** Use an FSRS/SM-2-style scheduler with **intervals capped to the exam date** (`plan.md` already does this). Target about 70–85% expected recall in review sets. Show a "hard question" label on stretch items. Duolingo found this kind of label **increased study time and next-day return** [Official].

### 2.12 Duolingo Max (AI)
- **What:** a premium tier launched in March 2023 on GPT-4 with **Explain My Answer** and **Roleplay**, later **Video Call** with Lily. Launch price was $29.99/month or $167.99/year in the US [Official / press].
- **Verdict: Adapt "Explain My Answer".** After any wrong answer, a "Why?" button can show the authored explanation (with LOS reference). An LLM follow-up ("Explain like I'm an ACCA accountant", "Show me a worked example") is optional. This is high-value for CFA, because explanations matter more than the answer. Roleplay and video call are not relevant.

### 2.13 Widgets / Live surfaces
- **What:** an iOS widget showing only two things, whether today is done and the streak count. Duo's mood escalates as midnight nears [Official]. **Half of widget users have a 6+ month streak** [Official].
- **Verdict: Not available to a PWA.** iOS widgets need a native app. The closest PWA equivalents are the **app badge** (Badging API: number of due reviews, or 1 if today isn't done) and a **Home Screen install** prompt explained at the right moment.

### 2.14 Year in Review, share cards, social feed
- **Verdict: Low priority.** A shareable "Exam-ready" or "60-day streak" card is a nice touch at the end. Skip feeds.

### 2.15 Duolingo Math, Music and Chess (multi-subject strategy)
- Math and Music were added to the main app in 2023, and Chess in 2025 [Official]. Chess was the fastest-growing subject by Q3 2025 [Official]. The same path, streak and XP system carries over to non-language subjects. **This shows that the path and habit shell is subject-agnostic**, which supports applying it to CFA. Math showed that the path works for **procedural, numeric skills**, which is relevant to Quant and FSA.

---

## 3. Learning path design (the 2022 redesign)

### 3.1 What changed and why
- **Launch:** the new home screen rolled out to all learners on **1 Nov 2022**. iOS rollout began in late Aug 2022 [Official / press].
- **Before ("tree"):** skills were grouped into rows. Each skill had crown levels, and learners chose which skill to do next. Tips were a separate tab and Stories were a separate tab.
- **After ("path"):** a **single linear path** of nodes. **Each node equals one old crown level**, and levels from different skills are **interleaved** (spaced). Lessons are grouped into **units** with descriptive headers ("Get directions" rather than "City 3"). A **Guidebook** per unit replaced Tips. **Stories moved into the path.** Practice is built into the path, so reviewing feels like forward progress. **Legendary became unit-level** [Official].
- **Why:** learners were unsure whether they were using Duolingo "the 'correct' or 'best' way." The goal was to give them a clear path, apply spaced repetition (the "hover"/"waterfall" method Duolingo had already recommended), and stop users from extending streaks with easy, low-learning lessons [Official, blog and Q4 2022 call].
- **Evidence:** Duolingo reports that path learners had **higher reading and listening scores** than tree learners. This was an observational comparison with no sample sizes published [Official, efficacy blog; treat with caution].
- **Backlash:** long-time users disliked losing choice and overview. Common complaints [3rd-party, PiunikaWeb, uxdesign.cc critique]: endless scrolling, no way to see the whole course at a glance, being "forced" to repeat content, and difficulty targeting a weak skill. The CEO said the change would not be reversed.

**Lesson for us:** the path is excellent for "what do I do now?" and for interleaving and spacing. However, an exam candidate **also needs a syllabus-level overview** (topic weights, mastery per topic) and **free choice** for targeted practice. Our IA already has both: the Roadmap path *and* Learn (topic library) plus Review. Keep both.

### 3.2 Structure (hierarchy)
- **Course → Sections → Units → Nodes (levels) → Lessons/sessions.** Sections are large CEFR-aligned blocks (e.g., Section 1 ... Section N). Each section contains many units, and each unit has about 5–9 nodes [Observed / 3rd-party; counts vary by course and change over time].
- **Node types [Official + Observed]:**
  - **Lesson node** (star or skill icon). Typically several lessons per node; the node fills as you progress.
  - **Practice / personalized practice node** (dumbbell). AI-selected review of weak items.
  - **Story node** (book). A short narrative reading and listening exercise.
  - **Character / "Side Quest" nodes.** A character avatar beside the path; timed bonus content with stars [Official, *ways to practice*].
  - **Chest / reward node.** Grants gems or XP boost [Observed].
  - **Unit review / Legendary trophy** at the end of the unit (trophy icon, turns gold when Legendary) [Official].
  - **DuoRadio** (podcast-style listening) and **Match Madness** appear in some courses [Official].
- **Jump ahead:** at the start of a unit or section a **"Jump here?"** bubble lets the learner take a test-out. Passing moves the path forward; failing returns them [3rd-party, Lingoly; not confirmed in official help]. Placement at onboarding works the same way at course level.

### 3.3 Detailed UI description of the path [Observed]
- **Layout:** a single vertical, scrollable column. Nodes are **circular "chunky" buttons** (about 70pt, with a darker bottom lip) arranged in a **gentle zig-zag/sine curve**. Offsets alternate left and right of centre (roughly 0, +40, +70, +40, 0, −40, −70...), so the path snakes. Large mascot or character illustrations sit in the gaps the curve leaves.
- **Unit header:** a full-width **coloured banner card** pinned at the top of the visible unit. It shows "SECTION 1, UNIT 3" (small caps label), the unit title (e.g., "Order food"), and a **Guidebook** button on the right (notebook icon). Each unit gets its own colour (green, purple, blue, pink...), and the header changes colour as you scroll into the next unit. It acts as a sticky header. Between units a divider line with the next unit's title appears.
- **Node states:**
  - **Locked:** grey fill (#E5E5E5-ish) with a grey icon. Tapping shows a tooltip such as "Complete all levels above to unlock this."
  - **Current/active:** unit-colour fill with a **progress ring** around the node, a bouncing **"START"** speech-bubble tooltip above it, and sometimes a mascot beside it. Tapping opens a **popover card** under the node showing the lesson title, "Lesson 2 of 4", and a big "START +10 XP" button.
  - **Completed:** unit-colour fill with a check or star icon. Tapping offers "Review" (+5 XP) and "Legendary" options.
  - **Legendary/mastered:** **gold** fill with a gold trophy.
- **Scrolling:** the path auto-scrolls so the current node is centred on open. If you scroll away, a **floating round arrow button** (bottom-right, above the tab bar) jumps back to the current node [Official mention]. Upcoming units are visible but locked, so the course feels finite yet long.
- **Top bar (sticky):** course flag, **streak flame + count**, **gems**, **hearts/energy**. Tapping each opens a dropdown sheet (e.g., the streak calendar).
- **Bottom tab bar:** Learn (home/path), Practice (dumbbell; varies), Leagues (shield), Quests (chest), Profile, More/Shop. The exact set varies by platform and experiment.
- **Section overview:** a separate screen lists Sections as cards (level, CEFR, progress, "Jump to Section N"). This is partly an answer to the "no overview" criticism.

### 3.4 Mapping to our Roadmap
| Duolingo | Ledger (CFA) |
|---|---|
| Section | **Phase** (Learn / Consolidate / Final) |
| Unit (with header + Guidebook) | **Period** (7-day block) with header "PERIOD 3 · Days 15–21 · FSA + Ethics" and a **Summary** button (formula sheet / key LOS) in place of the Guidebook |
| Lesson node | Lesson (cards → questions), ~6–10 min |
| Practice node | **Review** node (due SRS items) |
| Story node | **Case / vignette** node (a short worked scenario, e.g., an ethics case or a ratio walk-through) |
| Jump here | **Test-out** (5 Q, ≥4/5) for ACCA-overlap lessons; already in plan |
| Unit review / Legendary trophy | **Period close** checkpoint; gold = Mastered |
| Section end / placement | **Topic checkpoint**, **Mock 1/2** ("Year-end close") |
| Chest | Avoid (no currency); possibly a "Period closed" celebration instead |

---

## 4. Lesson UX

### 4.1 Screen anatomy [Observed]
1. **Top bar:** a close **X** (left; tapping it opens a "Wait, don't go! You'll lose your progress" confirm sheet), a **thick rounded progress bar** (green fill, with a lighter highlight stripe on top of the fill and a "5 IN A ROW" flame label as combos build), and hearts/energy on the right.
2. **Prompt:** an instruction headline ("Select the correct meaning", "Write this in English"). Bold, about 22–24pt, left-aligned. Sometimes a "NEW WORD" or "HARD EXERCISE" purple/orange tag sits above it.
3. **Body:** the exercise. Character illustration plus speech bubble, word-bank chips (chunky pill buttons that animate from bank to answer line), multiple-choice cards (chunky tiles with an optional number-key hint and image), match pairs (2 columns of tiles), or a text input. Speaker buttons are blue chunky squares.
4. **Footer:** a full-width **CHECK** button pinned to the bottom. It is **disabled grey** until an answer is selected, then turns **green**. "SKIP" or "CAN'T LISTEN NOW" sometimes appears secondary on the left.

### 4.2 Interaction and feedback loop [Observed]
- Select an option: the tile gets a **blue (Macaw) border and light-blue fill**. Pressing a chunky button pushes it **down by its lip height**, and a soft tap sound plays.
- **CHECK** triggers the **feedback bottom sheet**, which slides up over the footer:
  - **Correct:** light-green sheet (#D7FFB8-ish) with a green check badge, a green headline ("Nicely done!", "Excellent!", "Amazing!"), optional meaning or tip, and a flag/report icon. The **CONTINUE** button is green. A bright **"ding"** chime plays.
  - **Incorrect:** light-red sheet (#FFDFE0-ish) with a red X badge, headline "Correct solution:" plus the correct answer in red text, and a red **GOT IT** button. A low **"bonk"** sound plays. Max adds an "Explain my answer" button here.
- Wrong items are **re-queued at the end of the lesson** ("Let's fix your mistakes" / "Previous mistake" tag). The lesson can't end until they're answered correctly. This is a key learning mechanic.
- Combo celebration: after N correct in a row, a **mascot pop-in** with "You're on fire! 5 in a row" between exercises.
- **Haptics:** light impact on tap and success/error notification haptics on iOS native [Observed; no official source found]. **PWA note:** iOS Safari does **not** support `navigator.vibrate`, so haptics are effectively unavailable in an iOS PWA. Compensate with sound and motion.
- **Timing:** a standard lesson is about **10–15 exercises and roughly 2–5 minutes** [Observed estimate; unverified]. The feedback sheet stays until the user taps Continue. No auto-advance means the learner controls the pace.
- **Copy voice:** short, encouraging, varied ("Not quite correct. Try again!" style), never shaming within a lesson [Official, design.duolingo.com writing/voice page, now redirected].

### 4.3 End-of-lesson sequence [Observed]
1. **"Lesson complete!"** celebration: a full-screen mascot animation (Rive state-machine driven [Official, Duolingo uses Rive]) with confetti and fanfare.
2. **Stat cards (3, chunky tiles):** **TOTAL XP** (gold), **accuracy** ("AMAZING 93%", green), and **time** ("SPEEDY 3:12", blue). The numbers count up.
3. **Streak screen** (first lesson of the day): a large flame animation, the count ticking up (e.g., 41 → **42**), a week strip (M T W T F S S) with today filling in, and "Keep it up!" copy. It also offers widget install or "commit" prompts.
4. **Quest progress**: bars filling for each daily quest, with a chest opening if complete.
5. **League update**: "You moved up to #4."
6. Sometimes an ad (free tier), a Super upsell, a friends-follow prompt or a widget prompt.
- Each screen has one **CONTINUE** button. **This chain is long (4–6 taps).** It's great for dopamine and **bad for a 10-minute professional session**.

### 4.4 Verdict for Ledger
- **Adopt:** the anatomy (X, progress bar, prompt, body, pinned CHECK), the disabled→enabled CHECK, the feedback bottom sheet with correct answer **plus explanation**, re-queueing missed items at the end, the combo toast, and chunky tactile buttons.
- **Adapt:**
  - Incorrect sheet: show **why** (the explanation, the LOS tag, and a "Add to review / Already in review" note). Explanation length: 1–3 lines, with "More" expandable.
  - Exam fidelity: CFA questions are 3-option (A/B/C). Use number keys and large option cards. Show a calculator hint (BA II Plus keystrokes) for quant items.
  - **End screens collapsed into ONE summary screen**: accuracy, minutes, items to review, streak tick (an inline animation, not a separate screen), quest progress, plus **two buttons: "Done" (primary) and "One more (~5 min)" (secondary)**. The user is busy, so get them out fast and leave them proud.
  - Allow **exit anytime with no loss**: autosave per answer and resume within 24h. Don't use Duolingo's "you'll lose progress" guilt sheet.
- **Avoid:** upsells, ads, long celebration chains, timers in learning mode.

---

## 5. Visual design system and a blue translation

### 5.1 Duolingo's system (what's known)

**Colors.** These are from Duolingo's official brand site (design.duolingo.com, which now redirects to the blog design hub). Values are corroborated by multiple third-party reconstructions.

| Name | Hex | Role |
|---|---|---|
| Feather Green | `#58CC02` | Primary brand / CTA / correct |
| Mask Green | `#89E219` | Secondary green (highlights) |
| (Green lip / pressed) | `#58A700` | Button bottom lip [3rd-party token] |
| Macaw (blue) | `#1CB0F6` | Selection, links, secondary buttons, info |
| Humpback (dark blue) | `#2B70C9` | Deeper blue accent [recall of official page; verify] |
| Beetle (purple) | `#CE82FF` | "New word", Super, special |
| Cardinal (red) | `#FF4B4B` | Incorrect, hearts |
| Fox (orange) | `#FF9600` | Streak flame, hard |
| Bee (yellow) | `#FFC800` | XP, gold, Legendary |
| Eel | `#4B4B4B` | Body text |
| Wolf / Hare | `#777777` / `#AFAFAF` | Secondary text / disabled [3rd-party] |
| Swan | `#E5E5E5` | Borders, locked nodes |
| Polar | `#F7F7F7` | Subtle backgrounds |

**Typography.** **Feather Bold** is a custom display face used for the wordmark and big headlines. **DIN Round** (licensed, Monotype) is used for UI and body text. Button labels are **uppercase, about 15px, weight 700, letter-spacing about 0.8px** [3rd-party reconstruction]. Sources conflict on whether headings use Feather or DIN Round. In-app, headings appear to be DIN Round Bold [Observed]. Neither font is freely licensable for us.

**Buttons ("chunky" / 3D) [3rd-party + Observed].**
- Radius **about 12–16px**, height **about 48–50px**, full-width in the footer.
- The **solid bottom lip** is about **4px** in a darker shade of the fill (e.g., green `#58CC02` with lip `#58A700`). It is implemented as `box-shadow: 0 4px 0 <darker>` or `border-bottom: 4px solid`.
- **Pressed:** `transform: translateY(4px)` and the lip disappears, so the button physically "sinks".
- Secondary/outline buttons: white fill, 2px `#E5E5E5` border with a 4px grey lip (2px border plus extra bottom border), and blue or grey text.
- Option tiles and cards use the same lip treatment with a 2px border and a grey lip. When selected, the border and lip turn blue and the background goes light blue.

**Illustration [Official].** Built from **three basic shapes: rounded rectangle, circle and rounded triangle. "Pointy shapes are off-brand."** The style is flat with a limited palette, uses the fewest details needed, exaggerates characters, and favours bold silhouettes. Since 2018 it has used bright colours, rounded buttons and white backgrounds [Official, *Shape language*].

**Motion [Official + Observed].** **Rive** state machines drive characters, and Duolingo has written about World Character visemes for lip-sync. Celebrations are timing-first ("timing and rhythm were central" for the phoenix streak milestone). UI micro-motion is springy: bounce-in tooltips, progress-bar fills with overshoot, number count-ups.

**Sound [Observed / 3rd-party].** Signature short earcons: a bright "ding" for correct, a dull "bonk" for incorrect, a fanfare for lesson complete, and a satisfying tap. There is a setting to disable sound effects. No official sound-design write-up was found.

**Core tabs refresh (Feb 2026) [Official].** The direction is toward **less decoration, consolidated type styles, whitespace instead of containers, and flatter cards with fewer borders**, with tiered header sizes. Duolingo itself is moving toward a cleaner, more "grown-up" look. This is a useful signal for a premium adult product.

### 5.2 Translating to a premium blue palette for a finance professional

**Design intent:** keep Duolingo's **tactility** (chunky buttons, clear states, celebratory micro-moments). Drop the **childlike saturation, mascot slapstick and shouty uppercase**. The reference points are a mix of Duolingo's interaction model with the restraint of a good banking app or Bloomberg-lite.

**Proposed tokens (light mode):**

| Token | Hex | Use | Notes |
|---|---|---|---|
| `--ink-900` | `#0B1B33` | Headlines, key numerals | Deep navy, reads "finance" |
| `--ink-700` | `#33415C` | Body text | Contrast on white about 10:1 |
| `--ink-500` | `#64748B` | Secondary text | Meets 4.5:1 on white |
| `--line` | `#E3E8F0` | Borders, locked nodes | Swan equivalent |
| `--surface` | `#FFFFFF` / `--surface-2` `#F5F7FB` | Cards / page | Polar equivalent with a cool tint |
| `--primary-500` | `#2463EB` | Primary CTA fill, active node | White text contrast about 5.2:1 (passes AA) |
| `--primary-700` | `#1A47B8` | **Button lip** / pressed | The "chunky" lip shade |
| `--primary-100` | `#E6EEFF` | Selected option fill | Macaw-select equivalent |
| `--accent-teal` | `#0EA5A4` | Secondary data series / review nodes | Distinct from primary |
| `--gold-500` | `#E0A100` (lip `#B07E00`) | Streak, Mastered, XP | Gold reads "achievement" in finance without childish orange |
| `--success-500` | `#16A34A` (bg `#E8F7EE`, lip `#11803A`) | Correct | Keep green **for correctness only**; universal semantics |
| `--danger-500` | `#DC2626` (bg `#FDECEC`, lip `#B01E1E`) | Incorrect | |
| `--warn-500` | `#EA7A0C` | Overdue / behind pace | |

- **Dark mode:** set surfaces to `#0B1220` / `#111A2E`, text to `#E6ECF5`, primary to `#4C82F7` with lip `#2F5FD0`. Lips should get *darker*, not lighter, in dark mode so the 3D cue survives.
- **Unit (Period) header colours:** rotate within the blue family (`#2463EB`, `#1E3A8A` navy, `#0EA5A4` teal, `#4F46E5` indigo) rather than a rainbow. Topic identity can use a muted 10-colour set matched to the 10 CFA topics, with the same lightness so none dominates.
- **Correct/incorrect must not rely on colour alone:** pair them with an icon (check/cross) and text, since about 8% of men have colour-vision deficiency.

**Typography (licensable alternatives):**
- **Display / headings:** **Nunito** (rounded terminals, free, weights 700–900) gives the DIN Round feel. For a more premium, less playful option, use **SF Pro Rounded** via `font-family: ui-rounded` on iOS, which is free on-device and falls back to Nunito.
- **Body / numerics:** **Inter** (or the system SF Pro, `-apple-system`) with `font-feature-settings: "tnum" 1, "lnum" 1` (**tabular, lining numerals**). This is non-negotiable for a finance audience: figures in tables, ratios and P&L lines must align.
- **Scale (mobile):** 28/34 display, 22/28 H1, 18/24 H2, 16/24 body, 14/20 secondary, 12/16 caption. Button labels: **16px semibold, sentence case** (Duolingo's all-caps reads childish and shouty to adults; e.g., "Check" and "Continue"), with letter-spacing 0.
- **Formulas:** render with KaTeX. Use a monospace-ish tabular style for keystroke sequences (BA II Plus).

**Buttons (CSS sketch):**
```css
.btn{height:52px;border-radius:14px;background:var(--primary-500);color:#fff;
     font:600 16px/1 var(--font-ui);box-shadow:0 4px 0 var(--primary-700);
     transition:transform 80ms ease-out, box-shadow 80ms ease-out;}
.btn:active{transform:translateY(4px);box-shadow:0 0 0 var(--primary-700);}
.btn:disabled{background:var(--line);color:var(--ink-500);box-shadow:0 4px 0 #CBD3E1;}
.tile{border:2px solid var(--line);box-shadow:0 4px 0 var(--line);border-radius:14px;}
.tile[aria-pressed=true]{border-color:var(--primary-500);background:var(--primary-100);
     box-shadow:0 4px 0 var(--primary-500);}
```

**Spacing and shape:** use a 4-pt base (8/12/16/24/32). Card radius 16, button radius 14, chip radius 999. Minimum tap targets 44×44pt (Apple HIG). Leave safe-area padding for the iPhone home indicator (`env(safe-area-inset-bottom)`) under the pinned CHECK button.

**Iconography:** use a rounded, 2px-stroke or duotone set (e.g., Phosphor "bold"/"duotone", or Lucide with round caps) to echo the "no pointy shapes" rule. Topic icons should be simple and geometric (a balance-sheet/table glyph for FSA, sigma for Quant, scales for Ethics...).

**Mascot/illustration:** **skip the mascot**, or use a minimal abstract brand mark (e.g., a ledger tick). A cartoon owl-like character undermines credibility with a 30-something accountant. Celebrations can use **geometry**: a confetti burst in palette colours, a gold seal stamp for "Period closed", or a ticker-style number count-up.

**Motion:** keep it short (150–250ms UI, at most 800ms celebrations) and spring-based (e.g., Motion/Framer `type:"spring", stiffness 500, damping 30`). Respect `prefers-reduced-motion`. Use Lottie or Rive for the 2–3 hero moments only (streak tick, Period close, mock result).

**Sound:** 3 earcons (correct, incorrect, complete). Keep them quiet and short (under 400ms). Default **ON but respecting the silent switch** (Web Audio on iOS is muted by the ring/silent switch only in some contexts, so test it). Provide a settings toggle. Many sessions happen in offices or on commutes, so consider **default OFF with a one-time "Enable sounds?" choice**.

---

## 6. Notifications and re-engagement

### 6.1 What Duolingo does
- **Daily practice reminder:** sent at a time learned from the user's past practice. Duolingo's system optimises send time and template. One commentator reports a fixed 8 PM ET for their account [3rd-party]. A widely cited community claim of "about 23.5 hours after the last lesson" could not be verified.
- **Template selection is a bandit:** the "Recovering Difference Softmax" algorithm (Yancey and Settles, KDD 2020). Templates have **eligibility rules** (e.g., streak-wager templates only for some users; Monday-only templates), are compared only against eligible peers, and are **demoted when recently seen** to fight novelty decay. Repeat spacing uses the same forgetting-curve idea as word learning. The result was **+0.5% DAU and +2% new-user retention** [Official]. A dataset of about 200M notifications over 34–35 days was released.
- **"Protect the channel":** the growth team adopted a rule against increasing notification volume without strong justification **and CEO approval** [Insider, Mazal]. Duolingo treats push permission as a scarce asset that spam destroys.
- **Streak-saver notification:** an evening alert when the streak is at risk was "the first significant win" for streaks [3rd-party summary of the Lenny's podcast].
- **Tone:** Duo's "passive-aggressive" persistence became a meme, and Duolingo leans into it in marketing. The official blog acknowledges people "swipe away these reminders and feel a bit guilty" [Official]. **This guilt tone is exactly what we should not copy for an adult professional.**
- **Other surfaces:** the iOS widget (escalating Duo mood), the lock-screen widget, email digests, and league "you're about to be demoted" pushes [3rd-party].

### 6.2 iOS PWA web push constraints (critical for us)
- **iOS/iPadOS 16.4+ (March 2023):** Web Push works **only for Home Screen web apps**, not in Safari tabs [Official, WebKit].
- The web app must have a **manifest with `display: standalone` or `fullscreen`**. Otherwise "Add to Home Screen" creates a bookmark that opens in the browser [Official].
- **Permission must be requested in response to a direct user gesture**, such as tapping a "Turn on reminders" button. Auto-prompting on load fails [Official].
- **Stack:** Push API + Notifications API + Service Worker. Delivery is via APNs. **No Apple Developer account is needed**, but servers must allow `*.push.apple.com` [Official]. Standard VAPID Web Push libraries work.
- **Badging API:** `navigator.setAppBadge(n)` / `clearAppBadge()` work in Home Screen web apps, including from a push event in the background. Badges show once notification permission is granted. Users can toggle badges separately [Official].
- **Focus modes** apply, and notifications appear on the Lock Screen, Notification Center and paired Apple Watch [Official].
- **iOS 18.4+ (March 2025): Declarative Web Push.** Notifications can be displayed from a JSON payload **without a service worker** having to run, which is more reliable. It is still Home-Screen-only [Official, WebKit "Meet Declarative Web Push"; 3rd-party, Progressier]. Use it where supported and fall back to classic SW push.
- **Storage is separate:** the installed PWA has **separate storage/session from Safari**. A user who logged in in Safari must log in again in the installed app, and a push subscription made in Safari doesn't carry over [3rd-party, Pushpad]. Prompt to install *before* deep onboarding, or make re-login trivial.
- **Practical caveats [3rd-party / general knowledge, verify on device]:** there is no install prompt event (`beforeinstallprompt`) on iOS, so you must show **manual instructions** (Share → Add to Home Screen) with a short illustrated sheet. There is no background sync or periodic background tasks, so **all reminder scheduling must be server-side** (cron → web push). There is no `navigator.vibrate`. Silent pushes are not allowed: every push must show a notification, or the subscription may be revoked.

### 6.3 Ledger notification policy (recommended)
1. **Opt-in, explained, at the right moment.** After the **first completed session**, show an install-to-Home-Screen card, then on the next open a "Remind me to study?" card with **user-chosen time slots**. Professionals have predictable gaps (e.g., 07:45 commute, 12:30 lunch, 21:00). Only then call `Notification.requestPermission()` on tap.
2. **Max 1 reminder per day by default** (2 with an opt-in). Skip it if the day's target is already done. Never send during user-defined quiet hours. Use **no streak-loss guilt or mascot sadness**.
3. **Useful copy, not nagging.** Each push should carry a **concrete, finishable action with a time cost**:
   - "8 reviews due · about 4 min. Keep FSA fresh."
   - "Today: Bond pricing (8 min). You're 1 day ahead of plan."
   - "Streak 12 days. A 3-minute review keeps it going." (only in the final evening slot, and only if the user opted into streak reminders)
4. **Back off when ignored.** After 3 ignored reminders in a row, halve frequency. After 7 days inactive, send **one** warm "re-plan" message ("Life happens. Tap to rebuild your plan around the days left."), then stop until the user returns. This is our version of "protect the channel".
5. **App badge** = number of due reviews (capped at 99) or 1 if today's plan isn't started. Clear it when today is done. This is a quiet, non-interruptive cue that works like Duolingo's widget.
6. **Weekly digest** (optional, Sunday evening): minutes studied, topics advanced, readiness estimate, and next week's focus. A professional respects a report.
7. **Exam countdown milestones:** a one-time push at 30, 14, 7 and 1 days before the exam with a specific instruction (e.g., "Mock 2 this weekend").
8. Simple rules plus a few A/B-able templates are enough at our scale. A bandit is overkill.

---

## 7. Prioritized recommendations for the CFA app

**P0: must have (core habit + learning loop)**
1. **One-tap "Continue"** to the next best action, with a session that fits 10 minutes and can be abandoned without loss (autosave per answer, resume within 24h). *Rationale: time-poor user; Duolingo's "start in under 30 seconds" onboarding principle.*
2. **Duolingo lesson anatomy:** X, progress bar, prompt, chunky option tiles, pinned **Check** (disabled until selected), and a **feedback bottom sheet** with the correct answer **and explanation**. Missed questions are **re-queued at the end** and auto-added to SRS.
3. **Streak separate from the daily goal.** The streak requires only about 3 minutes or 10 reviews. The daily goal is a minutes ring driven by the plan. *Evidence: +3.3% D14, +19% new-learner streak share when decoupled [Official].*
4. **Free, automatic streak protection:** 1 freeze per week plus planned rest days that never break the streak. Nothing is monetised.
5. **No hearts, energy or gems.** Mistakes never block learning.
6. **Spaced-repetition review queue** (exam-date-capped) as a first-class tab, with a "hard question" label on stretch items. *Evidence: Birdbrain/HLR; hard-label lifted study time [Official].*
7. **Single collapsed end-of-session screen** (accuracy, minutes, items added to review, inline streak tick, quest progress) with **Done** (primary) and **One more (~5 min)** (secondary).
8. **Blue chunky design system** (Section 5.2 tokens) with tabular numerals, sentence-case buttons, 44pt targets, safe-area padding and reduced-motion support.

**P1: should have (motivation and structure)**
9. **Roadmap path:** a zig-zag path of 60 days grouped into weekly **Periods**. It has a sticky coloured Period header with a Summary button, node states (locked / current with progress ring and "Start" bubble / done / **gold Mastered**), a floating "jump to today" button, and review, case, test-out and Period-close node types.
10. **Test-out ("Jump here") for ACCA-overlap lessons** (5 Q, ≥4/5). This directly saves the user hours.
11. **Topic library with weights and mastery** alongside the path. This avoids the 2022 "no overview, no choice" backlash.
12. **Opt-in, time-slot reminders via Web Push**, with a Home Screen install flow and a permission request on user gesture. Max 1 per day, back off when ignored, and a re-plan message after a lapse. Include the **app badge**.
13. **3 daily micro-quests generated from the plan** (each 5 minutes or less).
14. **"Why?" explanation expansion** on every question. Optionally an LLM "explain differently / worked example" follow-up (the Max "Explain My Answer" pattern).

**P2: nice to have**
15. **Friends weekly league** ranked on focused minutes or plan items. No demotion, opt-out, and a co-op weekly quest ("Together: 300 Qs").
16. **Milestone celebrations** (7/14/30/45/60 days; Period close; Mock completed) with a short Rive/Lottie animation and an optional share card.
17. **3 earcons** (correct/incorrect/complete) with an off-by-default or one-time choice. Visual press feedback substitutes for haptics (unavailable in iOS PWAs).
18. **Weekly digest** and exam-countdown pushes.
19. **Readiness estimate** (topic-weighted mastery × recent accuracy) on Home. This is the adult replacement for the streak as the "score that matters".

**Avoid (explicitly)**
- Hearts/Energy, gems/shop, paid streak repair, League Repair, ads and upsells.
- Guilt-laden copy and sad-mascot notifications. "You'll lose your progress" exit sheets.
- Multi-screen end-of-lesson chains. Stranger leaderboards with demotion. Timers outside mock mode.
- XP that can be farmed by repeating easy content (Duolingo's own 2022 diagnosis).
- All-caps shouty labels, childish saturation, a cartoon mascot as the primary brand device.

**Open questions to validate with the user (cheap tests)**
- Sound on or off by default? Ask once.
- Is a friends league motivating, or stressful, for this user's friend group?
- Ideal reminder slots. Offer 2 defaults (e.g., 07:45 and 21:00) and learn from completion times.
- Does the gold "Mastered" threshold (≥70% no-hints checkpoint) feel meaningful against real CFA difficulty? Calibrate after Mock 1.

---

## Sources

**Duolingo official (blog, research, investor)**
- Improving the streak (2020): https://blog.duolingo.com/improving-the-streak
- New home screen design / learning path (2022): https://blog.duolingo.com/new-duolingo-home-screen-design
- Results of Duolingo efficacy studies (path vs tree): https://blog.duolingo.com/results-duolingo-efficacy-studies
- Ways to practice in Duolingo (Practice Hub, Legendary, review, Side Quests): https://blog.duolingo.com/ways-to-practice-in-duolingo
- Duolingo Energy: https://blog.duolingo.com/duolingo-energy/
- Leagues and leaderboards: https://blog.duolingo.com/duolingo-leagues-leaderboards/
- Friends Quests: https://blog.duolingo.com/friends-quests/
- Introducing Birdbrain: https://blog.duolingo.com/learning-how-to-help-you-learn-introducing-birdbrain
- How we learn how you learn (half-life regression): https://blog.duolingo.com/how-we-learn-how-you-learn
- Difficult exercises / hard-exercise label: https://blog.duolingo.com/duolingo-difficult-exercises
- Hi, it's Duo: the AI behind the meme (notification bandit): https://blog.duolingo.com/hi-its-duo-the-ai-behind-the-meme/
- Streak milestone design and animation: https://blog.duolingo.com/streak-milestone-design-animation
- Widget feature: https://blog.duolingo.com/widget-feature/
- Core tabs redesign (Feb 2026): https://blog.duolingo.com/core-tabs-redesign/
- Shape language, Duolingo's art style: https://blog.duolingo.com/shape-language-duolingos-art-style/
- World character visemes (Rive): https://blog.duolingo.com/world-character-visemes
- Duolingo Max: https://blog.duolingo.com/duolingo-max
- Chess course: https://blog.duolingo.com/chess-course
- Design hub (design.duolingo.com now redirects here): https://blog.duolingo.com/hub/design/
- Brand guidelines, color (historic URL; values cited via search snippets): https://design.duolingo.com/identity/color
- Illustration guidelines (historic): https://design.duolingo.com/illustration
- Yancey and Settles, "A Sleeping, Recovering Bandit Algorithm for Optimizing Recurring Notifications," KDD 2020: https://research.duolingo.com/papers/yancey.kdd20.pdf
- Duolingo Research: https://research.duolingo.com/
- Q3 2025 shareholder letter (SEC 8-K): https://www.sec.gov/Archives/edgar/data/1562088/000162828025049514/q3fy25duolingo9-30x25share.htm
- Q2 2025 shareholder letter (SEC 8-K): https://www.sec.gov/Archives/edgar/data/1562088/000156208825000165/q2fy25duolingo6-30x25share.htm
- Q1 2025 shareholder letter (SEC 8-K): https://www.sec.gov/Archives/edgar/data/1562088/000156208825000098/q1fy25duolingo3-31x25share.htm
- Q2 2024 press release (">20% of DAUs have streaks longer than a year"): https://www.sec.gov/Archives/edgar/data/1562088/000156208824000203/q2fy24duolingo06-30x24pres.htm
- Q4 2022 earnings call transcript (Motley Fool): https://www.fool.com/earnings/call-transcripts/2023/02/28/duolingo-duol-q4-2022-earnings-call-transcript/

**Insider interviews / newsletters**
- Jorge Mazal, "How Duolingo reignited user growth" (Lenny's Newsletter): https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth
- "Behind the product: Duolingo streaks" with Jackson Shuttleworth (Lenny's): https://lennysnewsletter.com/p/behind-the-product-duolingo-streaks

**Apple / WebKit (PWA push)**
- Web Push for Web Apps on iOS and iPadOS (16.4): https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- Meet Declarative Web Push: https://webkit.org/?p=16535
- Progressier, Declarative Web Push support notes: https://progressier.com/pwa-capabilities/declarative-web-push
- Pushpad, iOS special requirements for web push: https://pushpad.xyz/blog/ios-special-requirements-for-web-push-notifications
- 9to5Mac on iOS 16.4 web app features: https://9to5mac.com/2023/02/16/iphone-web-app-new-features-ios-16-4/

**Third-party (lower confidence)**
- Leagues mechanics teardown (Deconstructor of Fun): https://duolingo.deconstructoroffun.com/mechanics/leagues
- Duolingo DESIGN.md reconstruction (tokens, button specs): https://www.shadcn.io/design/duolingo/raw
- Brand palettes (Feather/Mask Green): https://brandpalettes.com/duolingo-colors/
- Energy rollout and backlash (Android Authority): https://www.androidauthority.com/quitting-duolingo-energy-system-3599842/
- Change.org "Hearts, not Energy" petition: https://www.change.org/p/duolingo-hearts-not-energy
- Duolingo replacing hearts with energy (repost of The Verge): https://rss.boorghani.com/?p=308817
- Streak revival event (Android Authority): https://androidauthority.com/duolingo-revive-broken-streak-event-3673004/
- Deceptive.design comment on paid streak repair: https://www.deceptive.design/articles/when-a-user-uses-duolingo-on-a-series-of-consecutive-days-this-is-called-a-streak-if-users-miss-a-day-they-can-pay-to-repair-it
- Jump Here explainer (Lingoly): https://lingoly.io/duolingo-jump-here/
- Path backlash coverage (PiunikaWeb): https://piunikaweb.com/2022/10/17/duolingo-app-update-with-path-ui-faces-backlash-from-users/
- "Down the wrong path" critique (uxdesign.cc; 403 when fetched, cited by title): https://uxdesign.cc/down-the-wrong-path-the-disaster-of-the-latest-duolingo-ui-update-a4cdd1e6ea1c
- NBC News interview with Luis von Ahn on the redesign: https://www.nbcnews.com/tech/tech-news/duolingos-update-redesign-luis-von-ahn-interview-rcna44655
- Onboarding / gradual engagement (Appcues GoodUX): https://goodux.appcues.com/blog/duolingo-user-onboarding
- VentureBeat on Duolingo AI (70% target difficulty, HLR lift): https://venturebeat.com/ai/how-duolingo-uses-ai-in-every-part-of-its-app
- IEEE Spectrum on Birdbrain: https://spectrum.ieee.org/duolingo
- Vicki Boykis, "Duo, the Push, and the Bandits": https://vicki.substack.com/p/duo-the-push-and-the-bandits
- CMU UXA note on streaks / Streak Freeze: https://cmu-uxa.notion.site/Performative-Progress-Strava-Mules-Duolingo-Streaks-1c18eb2b3ca480f59cd2e4123ac0d7d2
- Statistics compilation (unverified Q4 2025 / Q1 2026 DAU): https://voxbooster.com/blog/duolingo-statistics-2026

**Not verified / gaps:** official league promotion counts; exact Energy capacity and costs; lesson length in exercises and minutes; official sound/haptic design; the "23.5-hour" reminder timing claim; Humpback hex; current official typography roles (Feather vs DIN Round for headings); Q4 2025 and later streak statistics.
