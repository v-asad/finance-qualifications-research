// SM-2 style scheduler with exam-date-aware interval caps.
import { db } from './db.js';
import { diffDays } from './time.js';

const DAY = 86400000;
const RELEARN_MS = 10 * 60000;

function cap(intervalDays, today, examDate) {
  const left = Math.max(1, diffDays(today, examDate));
  return Math.max(1, Math.min(intervalDays, Math.max(1, Math.floor(left / 2)), 60));
}

/**
 * grade: 'again' | 'hard' | 'good' | 'easy'
 * reason: why the item entered the review loop (mistake | learned | slow)
 */
export function schedule(userId, item, grade, { today, examDate, reason = 'learned', now = Date.now() }) {
  const row = db.prepare('SELECT * FROM srs WHERE user_id = ? AND item_id = ?').get(userId, item.id);
  let { interval = 0, ease = 2.5, reps = 0, lapses = 0 } = row || {};
  let due;

  if (grade === 'again') {
    lapses += row ? 1 : 0;
    reps = 0;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
    due = now + RELEARN_MS;
  } else {
    if (grade === 'hard') {
      interval = reps === 0 ? 1 : Math.max(1, interval * 1.2);
      ease = Math.max(1.3, ease - 0.15);
    } else if (grade === 'good') {
      interval = reps === 0 ? 1 : reps === 1 ? 3 : interval * ease;
    } else {
      interval = reps === 0 ? 3 : interval * ease * 1.3;
      ease += 0.15;
    }
    reps += 1;
    interval = cap(interval, today, examDate);
    // Due a little before the same time of day so it is ready when they open the app.
    due = now + interval * DAY - 4 * 3600000;
  }

  db.prepare(`INSERT INTO srs (user_id, item_id, item_kind, module_id, due, interval, ease, reps, lapses, last_at, reason, created_at)
    VALUES (@userId, @id, @kind, @moduleId, @due, @interval, @ease, @reps, @lapses, @now, @reason, @now)
    ON CONFLICT(user_id, item_id) DO UPDATE SET due = @due, interval = @interval, ease = @ease, reps = @reps, lapses = @lapses, last_at = @now`)
    .run({ userId, id: item.id, kind: item.kind, moduleId: item.moduleId, due, interval, ease, reps, lapses, now, reason });
}

export function inReview(userId, itemId) {
  return !!db.prepare('SELECT 1 FROM srs WHERE user_id = ? AND item_id = ?').get(userId, itemId);
}

/** Add items as new cards due tomorrow-ish without counting a review. */
export function enroll(userId, items, reason, now = Date.now()) {
  const ins = db.prepare(`INSERT OR IGNORE INTO srs (user_id, item_id, item_kind, module_id, due, interval, ease, reps, lapses, last_at, reason, created_at)
    VALUES (?, ?, ?, ?, ?, 0, 2.5, 0, 0, NULL, ?, ?)`);
  let n = 0;
  db.transaction(() => {
    items.forEach((it, i) => {
      // Stagger new cards over the next couple of days so they don't all land at once.
      const due = now + DAY - 4 * 3600000 + (i % 3) * DAY * 0.5;
      n += ins.run(userId, it.id, it.kind, it.moduleId, Math.round(due), reason, now).changes;
    });
  })();
  return n;
}

export function dueCount(userId, now = Date.now()) {
  return db.prepare('SELECT COUNT(*) AS n FROM srs WHERE user_id = ? AND due <= ?').get(userId, now).n;
}

export function dueItems(userId, limit, now = Date.now()) {
  return db.prepare('SELECT item_id AS id, item_kind AS kind, module_id AS moduleId, lapses, reason FROM srs WHERE user_id = ? AND due <= ? ORDER BY due LIMIT ?')
    .all(userId, now, limit);
}

export function troubleSpots(userId, limit = 20) {
  return db.prepare('SELECT item_id AS id, item_kind AS kind, module_id AS moduleId, lapses FROM srs WHERE user_id = ? AND lapses >= 3 ORDER BY lapses DESC, due LIMIT ?')
    .all(userId, limit);
}
