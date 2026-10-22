# Ledger: CFA Level I in 60 days. Product and build plan

> **Status:** final plan, implemented in `app/`. **As of:** 22 Oct 2026.
> **User:** a working professional (10-hour workdays) sitting **CFA Level I in the Feb 2027 window (22–28 Feb 2027)**, so the **2027 curriculum** applies. ACCA-qualified about 2–3 years ago. Uses an iPhone and studies in **~10-minute bursts** during the day.
> **Hosting:** `https://cfa.tomo.study`, an installable PWA. Multi-user (friends), simple username + password.

## 1. Product principles

1. **10 seconds to value.** Open the app, tap one big button, and be learning. Every session fits in about 10 minutes and can be abandoned at any second without losing progress.
2. **The plan does the thinking.** A 60-day roadmap is generated up front. Each day has a short, concrete list. Falling behind is handled by the app (rollover and one-tap re-plan), not by guilt.
3. **Don't re-teach ACCA.** Lessons that ACCA FA/FR/FM/… already covered become **2-minute test-outs**. Where ACCA gives a head start, "ACCA vs CFA" cards teach only the differences.
4. **Retention over coverage.** A spaced-repetition review loop feeds on mistakes and on items likely to be forgotten. Intervals are capped so everything resurfaces before exam day.
5. **Exam-faithful practice.** 3-option MCQs with no negative marking, plus timed mini-mocks and full 180-question mocks that can be paused and resumed in 10-minute chunks.
6. **Duolingo's habit loop, adult edition.** Streaks, a daily ring, XP, quests and a friends league. No hearts or lives: mistakes are learning, never a paywall. Notifications are calm and opt-in (see `duolingo-research.md`).
7. **A finance-native look.** A blue palette, tabular numerals and ledger-style roadmap units ("Periods", "Period close", "Year-end close"). Weights are shown as the exam allocation.

## 2. The 60-day roadmap

- **Inputs** (Settings → Plan): exam date (default 22 Feb 2027), plan start date (default: the day you sign up), plan length **60 days** (shortened automatically if the exam is closer), weekday and weekend minutes, rest day (optional), ACCA options passed (AFM/APM/ATX/AAA) and the fast-track toggle.
- **Phases:**

| Phase | Share of plan | Days (60-day plan) | Contents |
|---|---|---|---|
| **Learn** | ~72% | 1–43 | All 102 learning modules in sequence. Ethics modules are interleaved every few days rather than blocked (spacing). Fast-track lessons appear as test-outs. Each 7-day "Period" ends with a **Period close** review node. |
| **Consolidate** | ~15% | 44–52 | A **topic checkpoint** (12 exam-style questions) per topic, weak-area drills, and **Mock 1** (180 questions in 12 resumable chunks). |
| **Final** | ~13% | 53–60 | **Mock 2**, an ethics sprint, a formula sprint, light review on the last day. |

- **Topic order:** Quant → Economics → FSA → Corporate Finance → Equities → Fixed Income → Derivatives → Alternatives → Portfolio Construction, with Ethics interleaved. Quant comes first because Fixed Income, Equities and Derivatives build on it. FSA comes early because it carries a lot of weight and ACCA gives a head start, which builds momentum.
- **Daily load:** items are packed into days by estimated minutes against that day's budget. About 20% of the budget is reserved for reviews.
- **Rollover:** unfinished items stay at the top of "Today" as *overdue*. The dashboard shows pace (on track / ahead / behind by N items).
- **Re-plan:** one tap redistributes all remaining items from today to the end of the plan. This is also suggested automatically when you are more than 2 days behind.
- **Test-out:** 5 questions, need 4/5 or better. A pass marks the lesson *tested out* and schedules its flashcards for review. A fail adds the full lesson to today.
- **After the plan:** if the plan ends before the exam, the app switches to **Maintenance mode**: daily reviews plus mini-mocks until the exam.

## 3. Information architecture

Bottom tab bar (5): **Home · Learn · Roadmap · Review · Settings**.

| Route | Screen |
|---|---|
| `/` | **Home dashboard**: greeting and exam countdown; streak; daily ring; **Continue** (next best action); today's plan; daily quests; pace; reviews due; readiness estimate; topic mastery (weighted); 60-day activity heatmap; league snippet; next milestones |
| `/learn` | Today's curriculum, then the topic library (10 topics with weight, progress and mastery) |
| `/learn/:topicId` | Topic: modules, lessons, status, ACCA overlap badges |
| `/learn/:topicId/:moduleId` | Module: summary, lessons, flashcards, formulas, practice |
| `/formulas` | Searchable formula library (from formula cards) |
| `/roadmap` | Duolingo-style zig-zag path of the 60-day plan, grouped into weekly Periods |
| `/review` | Review hub: due count, start review, mistakes, weak spots, formula sprint, mini-mock, full mocks, checkpoints |
| `/settings/*` | Profile, Plan, Study, ACCA background, Notifications, Appearance, Data, Account, Admin |
| `/s/lesson/:lessonId` | Lesson session (cards, then questions) |
| `/s/testout/:lessonId` | Test-out session |
| `/s/review` | Review session (SRS) |
| `/s/practice/:kind` | Practice: mistakes, weak spots, formulas, topic drill |
| `/s/mock/:mockId` | Mock / checkpoint session (timed, resumable) |
| `/login`, `/register` | Auth |

### Next best action ("Continue")

1. Resume an unfinished session from the last 24 hours.
2. Reviews due ≥ 8 and no review done yet today → **Review**.
3. Next pending plan item (overdue first, then today).
4. Today done → reviews due → next item from tomorrow ("Get ahead") → mini-mock.

## 4. Learning engine

- **Content:** 10 topics, 102 learning modules (2027 LM list), about 220 lessons. Each lesson has 3–6 phone-sized cards (concept, formula, worked example with BA II Plus keystrokes, IFRS-vs-US GAAP compare tables, exam tips, "ACCA vs CFA") and 3–5 questions. Each module also has 4–6 exam-pool questions and 3–8 flashcards. All content is original. See `app/content/SCHEMA.md`.
- **Lesson flow:** cards (swipe or Next), then questions. Each answer gets immediate feedback in a bottom sheet with an explanation. Wrong answers are re-asked at the end of the lesson (the Duolingo "redo" mechanic). Then a results screen: XP, accuracy, time, and "N items added to review".
- **Spaced repetition:** SM-2-style scheduler over questions and flashcards.
  - Wrong answer: due again in the next review session, interval reset, lapse counted.
  - Correct answer: interval grows (1 → 3 → 7 → 16 → … days) scaled by ease. Slow correct answers count as "hard".
  - Intervals are capped at half of the days left to the exam, so everything resurfaces before exam day.
  - Leeches (≥ 4 lapses) are flagged as **trouble spots** on Home and in Review.
- **Mastery:** per module, recency-weighted accuracy × coverage. Topic mastery is the average over modules. **Readiness** = Σ(topic weight midpoint × mastery), blended with mock scores. Shown with a disclaimer: CFA Institute does not publish the minimum passing score; aim for 70%+ on mocks.
- **Mocks:** full mocks have 180 questions drawn by topic-weight midpoints from the exam pool (unseen questions first), 2 sessions × 2h15m equivalent. The timer pauses when the app closes. Mini-mocks have 6 or 15 questions at 90 seconds each. Checkpoints have 12 questions per topic.

## 5. Motivation layer (adapted from Duolingo)

| Mechanic | Our version |
|---|---|
| Streak | A day counts when you complete any session. Streak freezes: earn 1 for every 7-day streak (max 2), applied automatically |
| Daily ring | Progress on today's plan items (not arbitrary XP) |
| XP | Lesson 10 (+5 for a perfect lesson), test-out 15, review item 1, mock question 1, quest bonuses |
| Quests | 3 a day, chosen deterministically (e.g. "Finish 2 lessons", "Review 15 items", "5 correct in a row") |
| League | Weekly XP table among users on this instance (friends). Can be hidden in Settings |
| Celebrations | Confetti and stamps on lesson/period completion, streak milestones, mock passes |
| Notifications | Opt-in web push (iOS 16.4+ when installed): one daily reminder at a chosen time, plus an optional evening streak-saver. Never more than 2 a day |
| **Not adopted** | Hearts/lives, gems shop, paywalls, guilt-trip copy |

## 6. Visual design

- **Palette (blue):** brand `#1D4ED8` (blue-700); primary `#2563EB`; sky accent `#38BDF8`; navy ink `#0B1B3F`; success `#16A34A`; error `#DC2626`; warning `#F59E0B`; surface `#F5F8FF`, with a full dark theme (navy `#0A1222` surfaces).
- **Type:** system UI (SF Pro on iPhone) with tabular numerals for all figures. Rounded, heavy weights for headings.
- **Components:** "chunky" 3D buttons (a darker bottom border that compresses on press), large touch targets (≥ 44pt), bottom sheets for feedback, cards with soft shadows.
- **Roadmap:** zig-zag nodes on a dotted ledger rule. Each Period header shows days, dates and progress. Node states: locked / available / current (pulsing, "Start") / done (gold stamp) / tested-out ("ACCA" badge) / overdue (amber ring). A "Today" anchor auto-scrolls into view.
- **Motion:** 150–250 ms ease-out. Respects `prefers-reduced-motion` and the in-app "Reduce motion" setting.

## 7. Mobile and navigation details

- **Every screen has a URL.** Browser and iOS back/forward work naturally. Tabs remember their scroll position.
- **Sheets and dialogs are history entries** (`?sheet=…`), so Back closes the sheet instead of leaving the page.
- **In a session, Back opens a "Quit session?" sheet.** Progress is saved continuously, so quitting is safe. Forward or reopening resumes.
- **Completed sessions are replaced in history** with their results, so Back never re-enters a finished lesson.
- **Deep links opened cold** (no history) get a parent-route fallback for the in-app back button.
- **iOS standalone PWA:**
  - `viewport-fit=cover` with safe-area insets, `100dvh` layouts, no input zoom (16px inputs), no rubber-band on fixed chrome.
  - apple-touch-icon and status bar style.
  - Long-lived rolling session cookie (the iOS PWA has storage separate from Safari).
  - An update-available toast. bfcache-safe refresh on `pageshow`.
- **Offline:** the app shell and content are cached by the service worker. Answers are queued in an outbox and synced when back online.

## 8. Architecture

- **Web:** React + TypeScript + Vite, React Router (data router with `useBlocker`), TanStack Query, Tailwind CSS, vite-plugin-pwa (Workbox).
- **Server:** Node 22 + Fastify, SQLite (better-sqlite3, WAL) at `app/data/cfa.db`, scrypt password hashing, opaque session tokens (hashed in the DB) in `HttpOnly; Secure; SameSite=Lax` cookies, web-push (VAPID).
- **Security:**
  - Rate limiting: global 300 requests/min per IP; auth endpoints 10/min per IP; per-username lockout after 8 failed logins (15 min); registration 5/hour per IP.
  - 64 KB body limit, Origin check on mutating requests, security headers and CSP.
  - Invite code required to register. The first user becomes admin.
- **Deployment:** Docker container `cfa-app` joined to the existing `tomo_default` network. The existing Caddy (`tomo-caddy-1`) gets a `cfa.tomo.study` site block (automatic TLS, request-size limits). DNS: **A record `cfa` → `169.58.118.82`**.
- **Edge DDoS:** app-level limits stop abuse and brute force. For volumetric DDoS, put the DNS record behind Cloudflare's proxy (the app already trusts `X-Forwarded-For` only from Caddy).

## 9. Out of scope (v1)

AI tutor, audio summaries, Level II/III, payment, email-based password reset (the admin can reset passwords instead).
