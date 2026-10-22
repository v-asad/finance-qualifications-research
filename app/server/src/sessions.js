import { randomUUID } from 'node:crypto';
import { db } from './db.js';
import { content } from './content.js';
import { dueItems, enroll, schedule, inReview } from './srs.js';
import { addActivity, claimQuests, moduleMastery } from './stats.js';
import { completePlanItem, insertToday, MOCK_PARTS } from './plan.js';

const MOCK_SIZE = 180;
const SESSION_TTL_MS = 3 * 86400000;

// ---------------- helpers ----------------

function shuffle(arr, seed = Math.random()) {
  const a = [...arr];
  let s = Math.floor(seed * 2 ** 31) || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const q = (id) => ({ type: 'q', id });
const f = (id) => ({ type: 'f', id });

function attemptStats(userId) {
  const rows = db.prepare(`SELECT item_id, COUNT(*) AS n, SUM(correct) AS c, MAX(created_at) AS last,
      (SELECT correct FROM attempts b WHERE b.user_id = a.user_id AND b.item_id = a.item_id ORDER BY created_at DESC LIMIT 1) AS lastCorrect
    FROM attempts a WHERE user_id = ? AND item_kind = 'q' GROUP BY item_id`).all(userId);
  return new Map(rows.map((r) => [r.item_id, r]));
}

/** Prefer unseen questions, then previously wrong, then least recently seen. */
function pickQuestions(pool, n, stats, seed) {
  const score = (id) => {
    const s = stats.get(id);
    if (!s) return 0;
    if (!s.lastCorrect) return 1;
    return 2 + s.c / s.n;
  };
  return shuffle(pool, seed).sort((a, b) => score(a.id) - score(b.id)).slice(0, n);
}

function weightedTopicCounts(total) {
  const topics = content.topics.filter((t) => t.modules.length);
  const mids = topics.map((t) => (t.weight[0] + t.weight[1]) / 2);
  const sum = mids.reduce((a, b) => a + b, 0);
  const raw = mids.map((m) => (m / sum) * total);
  const counts = raw.map(Math.floor);
  let left = total - counts.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { counts[i]++; left--; } });
  return topics.map((t, i) => [t, counts[i]]);
}

function examPool(filter = () => true) {
  const all = [...content.questions.values()].filter(filter);
  const exam = all.filter((x) => x.pool === 'exam');
  return { exam, all };
}

function weightedSample(userId, total, seed) {
  const stats = attemptStats(userId);
  const out = [];
  for (const [t, n] of weightedTopicCounts(total)) {
    const { exam, all } = examPool((x) => x.topicId === t.id);
    let picked = pickQuestions(exam, n, stats, seed);
    if (picked.length < n) {
      const ids = new Set(picked.map((x) => x.id));
      picked = picked.concat(pickQuestions(all.filter((x) => !ids.has(x.id)), n - picked.length, stats, seed));
    }
    out.push(...picked);
  }
  return shuffle(out, seed).map((x) => q(x.id));
}

// ---------------- mocks ----------------

function getOrCreateMock(userId, n) {
  const ref = String(n);
  let mock = db.prepare("SELECT * FROM mocks WHERE user_id = ? AND kind = 'full' AND ref = ?").get(userId, ref);
  if (!mock) {
    // Avoid questions used in the user's other mocks where possible.
    const used = new Set(db.prepare("SELECT question_ids FROM mocks WHERE user_id = ? AND kind = 'full'").all(userId).flatMap((r) => JSON.parse(r.question_ids)));
    const stats = attemptStats(userId);
    const seed = Math.random();
    const ids = [];
    for (const [t, cnt] of weightedTopicCounts(MOCK_SIZE)) {
      const { exam, all } = examPool((x) => x.topicId === t.id);
      const fresh = exam.filter((x) => !used.has(x.id));
      let picked = pickQuestions(fresh, cnt, stats, seed);
      const have = new Set(picked.map((x) => x.id));
      if (picked.length < cnt) picked = picked.concat(pickQuestions(exam.filter((x) => !have.has(x.id)), cnt - picked.length, stats, seed));
      picked.forEach((x) => have.add(x.id));
      if (picked.length < cnt) picked = picked.concat(pickQuestions(all.filter((x) => !have.has(x.id)), cnt - picked.length, stats, seed));
      ids.push(...picked.map((x) => x.id));
    }
    const id = randomUUID();
    db.prepare('INSERT INTO mocks (id, user_id, kind, ref, question_ids, parts, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, userId, 'full', ref, JSON.stringify(shuffle(ids, seed)), MOCK_PARTS, Date.now());
    mock = db.prepare('SELECT * FROM mocks WHERE id = ?').get(id);
  }
  return mock;
}

function mockPart(mock, part) {
  const ids = JSON.parse(mock.question_ids);
  const size = Math.ceil(ids.length / mock.parts);
  return ids.slice((part - 1) * size, part * size);
}

function finishMockIfComplete(userId, mock) {
  const parts = db.prepare(`SELECT ref, summary FROM study_sessions WHERE user_id = ? AND kind = 'mock' AND completed_at IS NOT NULL AND ref LIKE ?`)
    .all(userId, `mock:${mock.ref}:%`);
  const byPart = new Map();
  for (const p of parts) byPart.set(p.ref, JSON.parse(p.summary));
  if (byPart.size < mock.parts) return null;
  let c = 0; let t = 0;
  for (const s of byPart.values()) { c += s.correct; t += s.total; }
  const score = t ? c / t : 0;
  db.prepare('UPDATE mocks SET completed_at = ?, score = ? WHERE id = ?').run(Date.now(), score, mock.id);
  return score;
}

// ---------------- session construction ----------------

/** Build the item list for a session. Throws { status, message } on bad input. */
export function buildSession(userId, kind, ref, settings) {
  const seed = Math.random();
  const stats = () => attemptStats(userId);
  const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };

  switch (kind) {
    case 'lesson': {
      const l = content.lessons.get(ref) || fail('Unknown lesson', 404);
      const m = content.modules.get(l.moduleId);
      return { items: m.questions.filter((x) => x.lesson === l.id).map((x) => q(x.id)), meta: { title: l.title } };
    }
    case 'testout': {
      const l = content.lessons.get(ref) || fail('Unknown lesson', 404);
      const m = content.modules.get(l.moduleId);
      const own = m.questions.filter((x) => x.lesson === l.id);
      const extra = shuffle(m.questions.filter((x) => x.pool === 'exam'), seed).slice(0, Math.max(0, 5 - own.length));
      return { items: shuffle([...own, ...extra], seed).slice(0, 5).map((x) => q(x.id)), meta: { title: l.title, passMark: 0.8 } };
    }
    case 'review': {
      if (ref && ref.startsWith('period:')) {
        const p = Number(ref.split(':')[1]);
        const plan = db.prepare('SELECT * FROM plans WHERE user_id = ?').get(userId);
        const lessonIds = db.prepare("SELECT ref FROM plan_items WHERE user_id = ? AND kind IN ('lesson','testout') AND day BETWEEN ? AND ?")
          .all(userId, (p - 1) * 7, p * 7 - 1).map((r) => r.ref);
        const mods = new Set(lessonIds.map((id) => content.lessons.get(id)?.moduleId).filter(Boolean));
        const st = stats();
        const qs = [...content.questions.values()].filter((x) => mods.has(x.moduleId) && (x.pool === 'exam' || st.has(x.id)));
        const fcs = shuffle([...content.flashcards.values()].filter((x) => mods.has(x.moduleId)), seed).slice(0, 5);
        const picked = pickQuestions(qs, 10, st, seed);
        if (!plan || (!picked.length && !fcs.length)) fail('Nothing to review yet for this period');
        return { items: shuffle([...picked.map((x) => q(x.id)), ...fcs.map((x) => f(x.id))], seed), meta: { title: `Period ${p} close` } };
      }
      const size = settings.reviewSize;
      const due = dueItems(userId, size).filter((it) => (it.kind === 'q' ? content.questions.has(it.id) : content.flashcards.has(it.id)));
      if (!due.length) fail('Nothing is due for review right now');
      return { items: due.map((it) => ({ type: it.kind, id: it.id })), meta: { title: ref === 'review:final' ? 'Final review' : 'Review' } };
    }
    case 'practice': {
      const st = stats();
      if (ref === 'mistakes') {
        const wrong = [...st.values()].filter((s) => !s.lastCorrect).sort((a, b) => b.last - a.last).map((s) => s.item_id).filter((id) => content.questions.has(id));
        if (!wrong.length) fail('No mistakes to practise. Nice.');
        return { items: wrong.slice(0, 10).map(q), meta: { title: 'Fix mistakes' } };
      }
      if (ref === 'weak' || ref?.startsWith('drill:')) {
        const mm = moduleMastery(userId);
        const started = Object.entries(mm).filter(([, v]) => v.seen > 0).sort((a, b) => a[1].mastery - b[1].mastery).slice(0, 3).map(([id]) => id);
        const mods = new Set(started.length ? started : [...content.modules.keys()].slice(0, 3));
        const pool = [...content.questions.values()].filter((x) => mods.has(x.moduleId));
        return { items: pickQuestions(pool, 10, st, seed).map((x) => q(x.id)), meta: { title: 'Weak-spot drill', modules: [...mods] } };
      }
      if (ref === 'formulas' || ref === 'sprint:formulas') {
        const touched = new Set(db.prepare('SELECT DISTINCT module_id FROM attempts WHERE user_id = ?').all(userId).map((r) => r.module_id));
        let cards = [...content.flashcards.values()].filter((x) => touched.has(x.moduleId));
        if (cards.length < 10) cards = [...content.flashcards.values()];
        return { items: shuffle(cards, seed).slice(0, 20).map((x) => f(x.id)), meta: { title: 'Formula & rules sprint' } };
      }
      if (ref === 'sprint:ethics') {
        const pool = [...content.questions.values()].filter((x) => x.topicId === 'ethics');
        if (!pool.length) fail('No ethics questions available');
        return { items: pickQuestions(pool, 15, st, seed).map((x) => q(x.id)), meta: { title: 'Ethics sprint' } };
      }
      if (ref?.startsWith('topic:')) {
        const id = ref.slice(6);
        const pool = [...content.questions.values()].filter((x) => x.topicId === id);
        if (!pool.length) fail('Unknown topic', 404);
        return { items: pickQuestions(pool, 10, st, seed).map((x) => q(x.id)), meta: { title: content.topics.find((t) => t.id === id)?.name } };
      }
      if (ref?.startsWith('module:')) {
        const id = ref.slice(7);
        const m = content.modules.get(id) || fail('Unknown module', 404);
        return { items: pickQuestions(m.questions.map((x) => content.questions.get(x.id)), 10, st, seed).map((x) => q(x.id)), meta: { title: m.title } };
      }
      if (ref?.startsWith('mini:')) {
        const n = ref === 'mini:15' ? 15 : 6;
        return { items: weightedSample(userId, n, seed), meta: { title: `Mini mock · ${n} questions`, timed: true, secondsPerItem: 90 } };
      }
      return fail('Unknown practice type');
    }
    case 'checkpoint': {
      const id = ref?.replace(/^checkpoint:/, '');
      const t = content.topics.find((x) => x.id === id) || fail('Unknown topic', 404);
      const { exam, all } = examPool((x) => x.topicId === t.id);
      let picked = pickQuestions(exam, 12, stats(), seed);
      if (picked.length < 12) {
        const have = new Set(picked.map((x) => x.id));
        picked = picked.concat(pickQuestions(all.filter((x) => !have.has(x.id)), 12 - picked.length, stats(), seed));
      }
      return { items: picked.map((x) => q(x.id)), meta: { title: `${t.name} checkpoint`, timed: true, secondsPerItem: 90 } };
    }
    case 'mock': {
      const [, n, p] = (ref || '').split(':').map(Number);
      if (!n || !p || p < 1 || p > MOCK_PARTS) fail('Unknown mock');
      const mock = getOrCreateMock(userId, n);
      return { items: mockPart(mock, p).filter((id) => content.questions.has(id)).map(q), meta: { title: `Mock ${n} · Part ${p} of ${MOCK_PARTS}`, timed: true, secondsPerItem: 90, mockId: mock.id } };
    }
    default:
      return fail('Unknown session kind');
  }
}

export function startSession(userId, { id, kind, ref, planItemId }, settings) {
  const sid = typeof id === 'string' && /^[a-zA-Z0-9-]{8,64}$/.test(id) ? id : randomUUID();
  const existing = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(sid);
  if (existing) {
    if (existing.user_id !== userId) throw Object.assign(new Error('Not found'), { status: 404 });
    return serialize(existing);
  }
  // Resume an unfinished session of the same kind/ref instead of starting over.
  const open = db.prepare(`SELECT * FROM study_sessions WHERE user_id = ? AND kind = ? AND COALESCE(ref, '') = ? AND completed_at IS NULL AND abandoned_at IS NULL AND updated_at > ? ORDER BY updated_at DESC LIMIT 1`)
    .get(userId, kind, ref || '', Date.now() - SESSION_TTL_MS);
  if (open) return serialize(open);

  const { items, meta } = buildSession(userId, kind, ref, settings);
  if (!items.length && kind !== 'lesson') throw Object.assign(new Error('No questions available yet'), { status: 400 });
  const now = Date.now();
  db.prepare('INSERT INTO study_sessions (id, user_id, kind, ref, plan_item_id, items, state, started_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(sid, userId, kind, ref || null, Number.isInteger(planItemId) ? planItemId : null, JSON.stringify({ items, meta }), '{}', now, now);
  return serialize(db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(sid));
}

export function serialize(s) {
  const { items, meta } = JSON.parse(s.items);
  return {
    id: s.id, kind: s.kind, ref: s.ref, planItemId: s.plan_item_id, items, meta,
    state: JSON.parse(s.state || '{}'), startedAt: s.started_at, updatedAt: s.updated_at,
    completedAt: s.completed_at, summary: s.summary ? JSON.parse(s.summary) : null,
  };
}

export function getSession(userId, id) {
  const s = db.prepare('SELECT * FROM study_sessions WHERE id = ? AND user_id = ?').get(id, userId);
  return s ? serialize(s) : null;
}

export function saveState(userId, id, state) {
  const json = JSON.stringify(state ?? {});
  if (json.length > 60000) throw Object.assign(new Error('State too large'), { status: 413 });
  const r = db.prepare('UPDATE study_sessions SET state = ?, updated_at = ? WHERE id = ? AND user_id = ? AND completed_at IS NULL').run(json, Date.now(), id, userId);
  return r.changes > 0;
}

export function abandonSession(userId, id) {
  db.prepare('UPDATE study_sessions SET abandoned_at = ? WHERE id = ? AND user_id = ? AND completed_at IS NULL').run(Date.now(), id, userId);
}

export function activeSessions(userId) {
  return db.prepare(`SELECT * FROM study_sessions WHERE user_id = ? AND completed_at IS NULL AND abandoned_at IS NULL AND updated_at > ? ORDER BY updated_at DESC LIMIT 5`)
    .all(userId, Date.now() - SESSION_TTL_MS).map(serialize)
    .filter((s) => (s.state?.answered || 0) > 0 || (s.state?.step || 0) > 0);
}

// ---------------- answers ----------------

const CONTEXT = { lesson: 'lesson', testout: 'testout', review: 'review', practice: 'practice', checkpoint: 'checkpoint', mock: 'mock' };

/** Record one answer and update the review loop. Idempotent on answer id. */
export function recordAnswer(userId, body, { today, examDate }) {
  const { id, sessionId, itemId, type, correct, chosen, grade, ms } = body;
  if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{8,64}$/.test(id)) throw Object.assign(new Error('Bad answer id'), { status: 400 });
  const item = type === 'f' ? content.flashcards.get(itemId) : content.questions.get(itemId);
  if (!item) throw Object.assign(new Error('Unknown item'), { status: 400 });
  const session = sessionId ? db.prepare('SELECT kind, ref FROM study_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId) : null;
  const context = CONTEXT[session?.kind] || 'practice';
  const isCorrect = type === 'f' ? grade !== 'again' : !!correct;
  const now = Date.now();

  const inserted = db.prepare(`INSERT OR IGNORE INTO attempts (id, user_id, session_id, item_id, item_kind, module_id, topic_id, correct, grade, chosen, ms, context, day, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, userId, sessionId || null, itemId, type === 'f' ? 'f' : 'q', item.moduleId, item.topicId, isCorrect ? 1 : 0,
      ['again', 'hard', 'good', 'easy'].includes(grade) ? grade : null, Number.isInteger(chosen) ? chosen : null,
      Number.isFinite(ms) ? Math.max(0, Math.min(3600000, Math.round(ms))) : null, context, today, now).changes;
  if (!inserted) return { duplicate: true };

  const srsItem = { id: itemId, kind: type === 'f' ? 'f' : 'q', moduleId: item.moduleId };
  const opts = { today, examDate };
  let addedToReview = false;
  if (type === 'f') {
    schedule(userId, srsItem, ['again', 'hard', 'good', 'easy'].includes(grade) ? grade : 'good', { ...opts, reason: 'learned' });
  } else if (context === 'review') {
    schedule(userId, srsItem, !correct ? 'again' : ms > 90000 ? 'hard' : 'good', opts);
  } else if (!correct) {
    addedToReview = !inReview(userId, itemId);
    schedule(userId, srsItem, 'again', { ...opts, reason: 'mistake' });
  } else if (inReview(userId, itemId)) {
    schedule(userId, srsItem, ms > 90000 ? 'hard' : 'good', opts);
  } else if (ms > 120000 && context !== 'mock') {
    // Correct but very slow: worth seeing again.
    schedule(userId, srsItem, 'hard', { ...opts, reason: 'slow' });
    addedToReview = true;
  }
  return { ok: true, addedToReview };
}

// ---------------- completion ----------------

const XP = { lesson: 10, perfectBonus: 5, testoutPass: 15, testoutFail: 5 };

export function completeSession(userId, id, clientSummary, { today, examDate }) {
  const s = db.prepare('SELECT * FROM study_sessions WHERE id = ? AND user_id = ?').get(id, userId);
  if (!s) throw Object.assign(new Error('Session not found'), { status: 404 });
  if (s.completed_at) return JSON.parse(s.summary);

  const { items, meta } = JSON.parse(s.items);
  const answers = db.prepare('SELECT item_id, item_kind, correct, ms, created_at FROM attempts WHERE user_id = ? AND session_id = ? ORDER BY created_at').all(userId, id);
  // First attempt per item decides the score (redo attempts don't inflate it).
  const first = new Map();
  for (const a of answers) if (!first.has(a.item_id)) first.set(a.item_id, a);
  const scored = [...first.values()].filter((a) => a.item_kind === 'q');
  const correct = scored.filter((a) => a.correct).length;
  const total = s.kind === 'lesson' ? items.length : scored.length;
  const accuracy = total ? correct / total : 1;
  const reviewed = first.size;
  const elapsed = Math.round(Math.min(Number(clientSummary?.seconds) || (Date.now() - s.started_at) / 1000, 3 * 3600));
  const perfect = s.kind === 'lesson' && total > 0 && correct === total;
  const result = { kind: s.kind, ref: s.ref, title: meta?.title, correct, total, accuracy, seconds: elapsed, day: today, perfect: perfect ? 1 : 0 };

  let xp = 0;
  let lessons = 0;
  let reviews = 0;

  if (s.kind === 'lesson') {
    const lesson = content.lessons.get(s.ref);
    xp = XP.lesson + (perfect ? XP.perfectBonus : 0);
    lessons = 1;
    const now = Date.now();
    db.prepare(`INSERT INTO lesson_progress (user_id, lesson_id, status, best_score, completions, first_at, last_at) VALUES (?, ?, 'done', ?, 1, ?, ?)
      ON CONFLICT(user_id, lesson_id) DO UPDATE SET status = 'done', best_score = MAX(best_score, excluded.best_score), completions = completions + 1, last_at = excluded.last_at`)
      .run(userId, s.ref, accuracy, now, now);
    completePlanItem(userId, 'lesson', s.ref, 'done');
    completePlanItem(userId, 'testout', s.ref, 'studied');
    if (lesson) enrollModuleIfDone(userId, lesson.moduleId);
  } else if (s.kind === 'testout') {
    const passed = accuracy >= (meta?.passMark ?? 0.8) && total > 0;
    result.passed = passed;
    xp = passed ? XP.testoutPass : XP.testoutFail;
    lessons = passed ? 1 : 0;
    const lesson = content.lessons.get(s.ref);
    completePlanItem(userId, 'testout', s.ref, passed ? 'passed' : 'failed');
    if (passed) {
      const now = Date.now();
      db.prepare(`INSERT INTO lesson_progress (user_id, lesson_id, status, best_score, completions, first_at, last_at) VALUES (?, ?, 'tested_out', ?, 0, ?, ?)
        ON CONFLICT(user_id, lesson_id) DO UPDATE SET best_score = MAX(best_score, excluded.best_score), last_at = excluded.last_at`)
        .run(userId, s.ref, accuracy, now, now);
      if (lesson) enrollModuleIfDone(userId, lesson.moduleId);
    } else if (lesson) {
      insertToday(userId, today, { kind: 'lesson', ref: lesson.id, minutes: lesson.minutes, phase: 'learn' });
    }
  } else if (s.kind === 'review') {
    xp = reviewed;
    reviews = reviewed;
    if (s.ref?.startsWith('period:')) completePlanItem(userId, 'period', s.ref, `${Math.round(accuracy * 100)}%`);
    else if (s.ref === 'review:final') completePlanItem(userId, 'review', s.ref, `${Math.round(accuracy * 100)}%`);
  } else if (s.kind === 'practice') {
    xp = Math.max(1, correct + (reviewed - scored.length));
    reviews = reviewed;
    if (s.ref?.startsWith('drill:')) completePlanItem(userId, 'drill', s.ref, `${Math.round(accuracy * 100)}%`);
    if (s.ref?.startsWith('sprint:')) completePlanItem(userId, 'sprint', s.ref, `${Math.round(accuracy * 100)}%`);
  } else if (s.kind === 'checkpoint') {
    xp = scored.length;
    completePlanItem(userId, 'checkpoint', s.ref, `${Math.round(accuracy * 100)}%`);
    db.prepare('INSERT INTO mocks (id, user_id, kind, ref, question_ids, parts, created_at, completed_at, score) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)')
      .run(randomUUID(), userId, 'checkpoint', s.ref, JSON.stringify(items.map((i) => i.id)), Date.now(), Date.now(), accuracy);
  } else if (s.kind === 'mock') {
    xp = scored.length;
    completePlanItem(userId, 'mock', s.ref, `${Math.round(accuracy * 100)}%`);
  }

  result.xp = xp;
  db.prepare('UPDATE study_sessions SET completed_at = ?, updated_at = ?, summary = ? WHERE id = ?').run(Date.now(), Date.now(), JSON.stringify(result), id);

  if (s.kind === 'mock' && meta?.mockId) {
    const mock = db.prepare('SELECT * FROM mocks WHERE id = ?').get(meta.mockId);
    const score = mock ? finishMockIfComplete(userId, mock) : null;
    if (score !== null) result.mockScore = score;
  }

  const act = addActivity(userId, today, { xp, sessions: 1, lessons, reviews, seconds: elapsed });
  const quests = claimQuests(userId, today);
  const full = { ...result, streak: act.streak, streakExtended: act.extended, earnedFreeze: act.earnedFreeze, quests: quests.map((x) => ({ id: x.id, label: x.label, xp: x.xp })), xpTotal: xp + quests.reduce((a, b) => a + b.xp, 0) };
  db.prepare('UPDATE study_sessions SET summary = ? WHERE id = ?').run(JSON.stringify(full), id);
  return full;
}

/** When every lesson of a module is done or tested out, its flashcards join the review loop. */
function enrollModuleIfDone(userId, moduleId) {
  const m = content.modules.get(moduleId);
  if (!m) return;
  const done = new Set(db.prepare('SELECT lesson_id FROM lesson_progress WHERE user_id = ?').all(userId).map((r) => r.lesson_id));
  if (!m.lessons.every((l) => done.has(l.id))) return;
  enroll(userId, (m.flashcards || []).map((fc) => ({ id: fc.id, kind: 'f', moduleId })), 'learned');
}
