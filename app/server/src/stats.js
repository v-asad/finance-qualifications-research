import { db } from './db.js';
import { content } from './content.js';
import { addDays, diffDays, weekStart, localDate } from './time.js';

// ---------------- activity, streaks, freezes ----------------

export function addActivity(userId, day, { xp = 0, sessions = 0, lessons = 0, reviews = 0, seconds = 0 }) {
  const before = streakInfo(userId, day);
  const hadToday = !!db.prepare('SELECT 1 FROM activity WHERE user_id = ? AND day = ? AND sessions > 0').get(userId, day);

  // Cover missed days with streak freezes when activity resumes.
  if (sessions > 0 && !hadToday && before.last && before.last < day) {
    const gap = diffDays(before.last, day) - 1;
    const user = db.prepare('SELECT streak_freezes FROM users WHERE id = ?').get(userId);
    if (gap > 0 && gap <= user.streak_freezes) {
      const ins = db.prepare('INSERT INTO activity (user_id, day, frozen) VALUES (?, ?, 1) ON CONFLICT(user_id, day) DO UPDATE SET frozen = 1');
      for (let i = 1; i <= gap; i++) ins.run(userId, addDays(before.last, i));
      db.prepare('UPDATE users SET streak_freezes = streak_freezes - ? WHERE id = ?').run(gap, userId);
    }
  }

  db.prepare(`INSERT INTO activity (user_id, day, xp, sessions, lessons, reviews, seconds) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, day) DO UPDATE SET xp = xp + excluded.xp, sessions = sessions + excluded.sessions,
      lessons = lessons + excluded.lessons, reviews = reviews + excluded.reviews, seconds = seconds + excluded.seconds`)
    .run(userId, day, xp, sessions, lessons, reviews, seconds);

  const after = streakInfo(userId, day);
  let earnedFreeze = false;
  if (sessions > 0 && !hadToday && after.current > 0 && after.current % 7 === 0) {
    const r = db.prepare('UPDATE users SET streak_freezes = MIN(2, streak_freezes + 1) WHERE id = ? AND streak_freezes < 2').run(userId);
    earnedFreeze = r.changes > 0;
  }
  return { extended: sessions > 0 && !hadToday, streak: after.current, earnedFreeze };
}

/** Current streak counts today if active, otherwise up to yesterday (still alive until midnight). */
export function streakInfo(userId, today) {
  const rows = db.prepare('SELECT day, sessions, frozen FROM activity WHERE user_id = ? AND (sessions > 0 OR frozen = 1) ORDER BY day DESC LIMIT 400').all(userId);
  const set = new Map(rows.map((r) => [r.day, r]));
  const last = rows.find((r) => r.sessions > 0)?.day || null;
  let cursor = set.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (set.has(cursor)) { current++; cursor = addDays(cursor, -1); }
  // Longest streak
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const d of rows.map((r) => r.day).reverse()) {
    run = prev && diffDays(prev, d) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  const doneToday = !!set.get(today)?.sessions;
  return { current, longest, doneToday, last };
}

export function heatmap(userId, from, to) {
  return db.prepare('SELECT day, xp, sessions, seconds, frozen FROM activity WHERE user_id = ? AND day BETWEEN ? AND ? ORDER BY day').all(userId, from, to);
}

// ---------------- mastery & readiness ----------------

const HALF_LIFE_DAYS = 21;

/** Per-module mastery 0..1 from the latest attempt per question, recency weighted, times coverage. */
export function moduleMastery(userId) {
  const rows = db.prepare(`
    SELECT a.item_id, a.module_id, a.correct, a.created_at
    FROM attempts a
    JOIN (SELECT item_id, MAX(created_at) AS m FROM attempts WHERE user_id = ? AND item_kind = 'q' GROUP BY item_id) last
      ON last.item_id = a.item_id AND last.m = a.created_at
    WHERE a.user_id = ? AND a.item_kind = 'q'`).all(userId, userId);
  const now = Date.now();
  const agg = new Map();
  for (const r of rows) {
    const w = Math.pow(0.5, (now - r.created_at) / 86400000 / HALF_LIFE_DAYS);
    const a = agg.get(r.module_id) || { w: 0, c: 0, n: 0 };
    a.w += w; a.c += w * r.correct; a.n += 1;
    agg.set(r.module_id, a);
  }
  const testedOut = new Set(db.prepare("SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND status = 'tested_out'").all(userId).map((r) => r.lesson_id));
  const out = {};
  for (const [id, m] of content.modules) {
    const total = (m.questions || []).length || 1;
    const a = agg.get(id);
    const lessonsOut = m.lessons.filter((l) => testedOut.has(l.id)).length / (m.lessons.length || 1);
    if (!a) { out[id] = { mastery: lessonsOut * 0.6, accuracy: null, seen: 0, total }; continue; }
    const accuracy = a.c / a.w;
    const coverage = Math.min(1, Math.max(a.n / Math.max(4, total * 0.5), lessonsOut));
    out[id] = { mastery: accuracy * coverage, accuracy, seen: a.n, total };
  }
  return out;
}

export function topicMastery(userId, mods = moduleMastery(userId)) {
  return content.topics.map((t) => {
    let w = 0; let s = 0; let seen = 0; let total = 0; let accW = 0; let accS = 0;
    for (const m of t.modules) {
      const mm = mods[m.id];
      const lw = m.lessons.length || 1;
      w += lw; s += lw * mm.mastery; seen += mm.seen; total += mm.total;
      if (mm.accuracy !== null) { accW += mm.seen; accS += mm.seen * mm.accuracy; }
    }
    return { id: t.id, name: t.name, weight: t.weight, mastery: w ? s / w : 0, accuracy: accW ? accS / accW : null, seen, total };
  });
}

export function readiness(userId, topics = topicMastery(userId)) {
  let w = 0; let s = 0;
  for (const t of topics) { const mid = (t.weight[0] + t.weight[1]) / 2; w += mid; s += mid * t.mastery; }
  const fromMastery = w ? s / w : 0;
  const mock = db.prepare("SELECT score FROM mocks WHERE user_id = ? AND kind = 'full' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1").get(userId);
  const mocks = db.prepare(`SELECT kind, ref, score, completed_at AS completedAt FROM mocks WHERE user_id = ? AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 10`).all(userId);
  const score = mock ? 0.5 * fromMastery + 0.5 * mock.score : fromMastery;
  return { score, fromMastery, lastMock: mock?.score ?? null, mocks };
}

// ---------------- quests ----------------

const QUESTS = [
  { id: 'lessons2', label: 'Finish 2 lessons', target: 2, xp: 10 },
  { id: 'review15', label: 'Review 15 items', target: 15, xp: 10 },
  { id: 'streak5', label: 'Get 5 correct in a row', target: 5, xp: 10 },
  { id: 'minutes20', label: 'Study for 20 minutes', target: 20, xp: 10 },
  { id: 'xp50', label: 'Earn 50 XP', target: 50, xp: 10 },
  { id: 'perfect', label: 'Ace a lesson with no mistakes', target: 1, xp: 15 },
  { id: 'answer30', label: 'Answer 30 questions', target: 30, xp: 10 },
];

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function questsFor(userId, day) {
  const h = hashStr(`${userId}:${day}`);
  const pool = [...QUESTS];
  const picked = [];
  let x = h;
  while (picked.length < 3) {
    x = Math.imul(x ^ (x >>> 15), 2246822507) >>> 0;
    picked.push(pool.splice(x % pool.length, 1)[0]);
  }
  const act = db.prepare('SELECT * FROM activity WHERE user_id = ? AND day = ?').get(userId, day) || {};
  const answers = db.prepare("SELECT correct FROM attempts WHERE user_id = ? AND day = ? AND item_kind = 'q' ORDER BY created_at").all(userId, day);
  let best = 0; let run = 0;
  for (const a of answers) { run = a.correct ? run + 1 : 0; best = Math.max(best, run); }
  const perfect = db.prepare(`SELECT COUNT(*) AS n FROM study_sessions WHERE user_id = ? AND kind = 'lesson' AND completed_at IS NOT NULL
    AND json_extract(summary, '$.perfect') = 1 AND json_extract(summary, '$.day') = ?`).get(userId, day).n;
  const claimed = new Set(db.prepare('SELECT quest FROM quest_claims WHERE user_id = ? AND day = ?').all(userId, day).map((r) => r.quest));
  const progress = {
    lessons2: act.lessons || 0,
    review15: act.reviews || 0,
    streak5: best,
    minutes20: Math.floor((act.seconds || 0) / 60),
    xp50: act.xp || 0,
    perfect,
    answer30: answers.length,
  };
  return picked.map((q) => ({ ...q, progress: Math.min(q.target, progress[q.id] || 0), done: claimed.has(q.id) || (progress[q.id] || 0) >= q.target, claimed: claimed.has(q.id) }));
}

/** Award XP for newly completed quests. Returns the quests completed now. */
export function claimQuests(userId, day) {
  const done = questsFor(userId, day).filter((q) => q.done && !q.claimed);
  for (const q of done) {
    db.prepare('INSERT OR IGNORE INTO quest_claims (user_id, day, quest) VALUES (?, ?, ?)').run(userId, day, q.id);
    db.prepare('UPDATE activity SET xp = xp + ? WHERE user_id = ? AND day = ?').run(q.xp, userId, day);
  }
  return done;
}

// ---------------- league ----------------

export function league(today) {
  const from = weekStart(today);
  const to = addDays(from, 6);
  const rows = db.prepare(`
    SELECT u.id, u.display_name AS name, u.username, u.settings, COALESCE(SUM(a.xp), 0) AS xp
    FROM users u LEFT JOIN activity a ON a.user_id = u.id AND a.day BETWEEN ? AND ?
    WHERE u.disabled = 0
    GROUP BY u.id ORDER BY xp DESC, u.id`).all(from, to);
  return {
    from, to,
    rows: rows
      .filter((r) => { try { return JSON.parse(r.settings || '{}').showInLeague !== false; } catch { return true; } })
      .map((r, i) => ({ rank: i + 1, id: r.id, name: r.name, username: r.username, xp: r.xp })),
  };
}

export const todayFor = (settings) => localDate(settings.tz);
