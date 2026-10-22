import { db } from './db.js';
import { content } from './content.js';
import { addDays, diffDays, isWeekend, weekday } from './time.js';
import { userPapers } from './settings.js';

const TESTOUT_MINUTES = 3;
const CHECKPOINT_MINUTES = 18;
const MOCK_PART_MINUTES = 68;
export const MOCK_PARTS = 4;
const PERIOD_DAYS = 7;
const REVIEW_SHARE = 0.2;

/** Minutes available for planned items on a given date. */
function budget(settings, date) {
  if (settings.restDay !== null && weekday(date) === settings.restDay) return 0;
  const m = isWeekend(date) ? settings.weekendMinutes : settings.weekdayMinutes;
  return m * (1 - REVIEW_SHARE);
}

/** Learn-phase sequence: main topics in order, Ethics interleaved evenly. */
function learnSequence(settings) {
  const papers = userPapers(settings);
  const toItem = (l) => {
    const fast = l.fastTrack?.some((p) => papers.has(p));
    return { kind: fast ? 'testout' : 'lesson', ref: l.id, minutes: fast ? TESTOUT_MINUTES : l.minutes };
  };
  const main = [];
  const ethics = [];
  for (const t of content.topics) {
    for (const m of t.modules) for (const l of m.lessons) (t.id === 'ethics' ? ethics : main).push(toItem(l));
  }
  if (!ethics.length) return main;
  const gap = Math.max(1, Math.floor(main.length / (ethics.length + 1)));
  const out = [];
  let e = 0;
  main.forEach((item, i) => {
    out.push(item);
    if ((i + 1) % gap === 0 && e < ethics.length) out.push(ethics[e++]);
  });
  while (e < ethics.length) out.push(ethics[e++]);
  return out;
}

function consolidateSequence() {
  const topics = content.topics.map((t) => t.id);
  const cp = (id) => ({ kind: 'checkpoint', ref: `checkpoint:${id}`, minutes: CHECKPOINT_MINUTES });
  const mock = (n, p) => ({ kind: 'mock', ref: `mock:${n}:${p}`, minutes: MOCK_PART_MINUTES });
  const half = Math.ceil(topics.length / 2);
  return [
    ...topics.slice(0, half).map(cp),
    mock(1, 1), mock(1, 2),
    ...topics.slice(half).map(cp),
    mock(1, 3), mock(1, 4),
    { kind: 'drill', ref: 'drill:1', minutes: 15 },
    { kind: 'drill', ref: 'drill:2', minutes: 15 },
  ];
}

function finalSequence() {
  return [
    { kind: 'mock', ref: 'mock:2:1', minutes: MOCK_PART_MINUTES },
    { kind: 'mock', ref: 'mock:2:2', minutes: MOCK_PART_MINUTES },
    { kind: 'sprint', ref: 'sprint:ethics', minutes: 20 },
    { kind: 'mock', ref: 'mock:2:3', minutes: MOCK_PART_MINUTES },
    { kind: 'mock', ref: 'mock:2:4', minutes: MOCK_PART_MINUTES },
    { kind: 'drill', ref: 'drill:3', minutes: 15 },
    { kind: 'sprint', ref: 'sprint:formulas', minutes: 15 },
    { kind: 'review', ref: 'review:final', minutes: 15 },
  ];
}

/**
 * Pack ordered items across days so that cumulative item minutes track
 * cumulative available minutes. Returns [{...item, day}].
 */
function pack(items, days, settings, startDate) {
  if (!items.length || !days.length) return [];
  const budgets = days.map((d) => budget(settings, addDays(startDate, d)));
  let totalBudget = budgets.reduce((a, b) => a + b, 0);
  if (totalBudget <= 0) { budgets.fill(1); totalBudget = budgets.length; }
  const cum = [];
  budgets.reduce((acc, b, i) => (cum[i] = acc + b), 0);
  const totalMin = items.reduce((a, it) => a + it.minutes, 0) || 1;
  let run = 0;
  let d = 0;
  return items.map((it) => {
    const mid = (run + it.minutes / 2) / totalMin;
    run += it.minutes;
    while (d < days.length - 1 && (cum[d] / totalBudget < mid || budgets[d] === 0)) d++;
    return { ...it, day: days[d] };
  });
}

export function phaseLengths(total) {
  if (total < 10) return { learn: Math.max(1, total - 2), consolidate: Math.min(1, total - 1), final: total >= 3 ? 1 : 0 };
  const final = Math.max(2, Math.round(total * 0.13));
  const learn = Math.round(total * 0.72);
  return { learn, consolidate: total - learn - final, final };
}

/** Number of days in the plan given settings and its start date. */
export function planLength(settings, start) {
  const untilExam = diffDays(start, settings.examDate); // exam day itself is not a study day
  return Math.max(3, Math.min(settings.planDays, untilExam));
}

export function generatePlan(userId, settings, today) {
  const start = settings.planStart || today;
  const total = planLength(settings, start);
  const { learn, consolidate } = phaseLengths(total);
  const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);

  const learnDays = range(0, learn);
  const consDays = range(learn, learn + consolidate);
  const finalDays = range(learn + consolidate, total);

  const rows = [
    ...pack(learnSequence(settings), learnDays, settings, start).map((r) => ({ ...r, phase: 'learn' })),
    ...pack(consolidateSequence(), consDays.length ? consDays : [total - 1], settings, start).map((r) => ({ ...r, phase: 'consolidate' })),
    ...pack(finalSequence(), finalDays.length ? finalDays : [total - 1], settings, start).map((r) => ({ ...r, phase: 'final' })),
  ];
  // Period close at the end of each full 7-day period in the learn phase.
  for (let p = 1; p * PERIOD_DAYS <= learn; p++) {
    rows.push({ kind: 'period', ref: `period:${p}`, minutes: 10, day: p * PERIOD_DAYS - 1, phase: 'learn' });
  }
  rows.sort((a, b) => a.day - b.day || (a.kind === 'period') - (b.kind === 'period'));

  // Keep completion state for items already done (e.g. regenerating after a settings change).
  const done = new Map();
  for (const r of db.prepare('SELECT kind, ref, done_at, result FROM plan_items WHERE user_id = ? AND done_at IS NOT NULL').all(userId)) {
    done.set(`${r.kind}|${r.ref}`, r);
  }
  const lessonDone = new Set(db.prepare('SELECT lesson_id FROM lesson_progress WHERE user_id = ?').all(userId).map((r) => r.lesson_id));

  const end = addDays(start, total - 1);
  db.transaction(() => {
    db.prepare('DELETE FROM plan_items WHERE user_id = ?').run(userId);
    db.prepare(`INSERT INTO plans (user_id, start_date, end_date, exam_date, days, created_at) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET start_date = excluded.start_date, end_date = excluded.end_date, exam_date = excluded.exam_date, days = excluded.days, replanned_at = excluded.created_at`)
      .run(userId, start, end, settings.examDate, total, Date.now());
    const ins = db.prepare('INSERT INTO plan_items (user_id, day, seq, kind, ref, minutes, phase, done_at, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const seqByDay = new Map();
    for (const r of rows) {
      const seq = (seqByDay.get(r.day) || 0) + 1;
      seqByDay.set(r.day, seq);
      const prev = done.get(`${r.kind}|${r.ref}`);
      let doneAt = prev?.done_at ?? null;
      if (!doneAt && (r.kind === 'lesson' || r.kind === 'testout') && lessonDone.has(r.ref)) doneAt = Date.now();
      ins.run(userId, r.day, seq, r.kind, r.ref, r.minutes, r.phase, doneAt, prev?.result ?? null);
    }
  })();
  return getPlan(userId);
}

/** Spread every unfinished item from today to the end of the plan. */
export function replan(userId, settings, today) {
  const plan = db.prepare('SELECT * FROM plans WHERE user_id = ?').get(userId);
  if (!plan) return null;
  const todayIdx = Math.max(0, diffDays(plan.start_date, today));
  const lastIdx = plan.days - 1;
  if (todayIdx > lastIdx) return getPlan(userId);
  const pending = db.prepare('SELECT * FROM plan_items WHERE user_id = ? AND done_at IS NULL ORDER BY day, seq').all(userId);
  const days = Array.from({ length: lastIdx - todayIdx + 1 }, (_, i) => todayIdx + i);
  const placed = pack(pending, days, settings, plan.start_date);
  db.transaction(() => {
    const upd = db.prepare('UPDATE plan_items SET day = ?, seq = ? WHERE id = ?');
    const seqByDay = new Map();
    for (const p of placed) {
      const seq = (seqByDay.get(p.day) || 100) + 1;
      seqByDay.set(p.day, seq);
      upd.run(p.day, seq, p.id);
    }
    db.prepare('UPDATE plans SET replanned_at = ? WHERE user_id = ?').run(Date.now(), userId);
  })();
  return getPlan(userId);
}

export function getPlan(userId) {
  const plan = db.prepare('SELECT * FROM plans WHERE user_id = ?').get(userId);
  if (!plan) return null;
  const items = db.prepare('SELECT id, day, seq, kind, ref, minutes, phase, done_at AS doneAt, result FROM plan_items WHERE user_id = ? ORDER BY day, seq').all(userId);
  return { start: plan.start_date, end: plan.end_date, examDate: plan.exam_date, days: plan.days, replannedAt: plan.replanned_at, items };
}

/** Mark the first matching undone plan item as done. Returns the item id or null. */
export function completePlanItem(userId, kind, ref, result = null) {
  const row = db.prepare('SELECT id FROM plan_items WHERE user_id = ? AND kind = ? AND ref = ? AND done_at IS NULL ORDER BY day, seq LIMIT 1').get(userId, kind, ref);
  if (!row) return null;
  db.prepare('UPDATE plan_items SET done_at = ?, result = ? WHERE id = ?').run(Date.now(), result, row.id);
  return row.id;
}

/** Insert an item into today's list (e.g. a failed test-out becomes a full lesson). */
export function insertToday(userId, today, item) {
  const plan = db.prepare('SELECT start_date, days FROM plans WHERE user_id = ?').get(userId);
  if (!plan) return;
  const exists = db.prepare('SELECT 1 FROM plan_items WHERE user_id = ? AND kind = ? AND ref = ? AND done_at IS NULL').get(userId, item.kind, item.ref);
  if (exists) return;
  const day = Math.min(plan.days - 1, Math.max(0, diffDays(plan.start_date, today)));
  const seq = (db.prepare('SELECT MAX(seq) AS m FROM plan_items WHERE user_id = ? AND day = ?').get(userId, day).m || 0) + 1;
  db.prepare('INSERT INTO plan_items (user_id, day, seq, kind, ref, minutes, phase) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(userId, day, seq, item.kind, item.ref, item.minutes, item.phase || 'learn');
}
