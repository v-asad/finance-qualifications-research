import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import { existsSync, readFileSync } from 'node:fs';
import { db } from './db.js';
import { content } from './content.js';
import {
  COOKIE, cookieOptions, hashPassword, verifyPassword, burnPasswordCheck, createSession, sessionUser, destroySession,
  destroyUserSessions, lockedUntil, recordFailure, clearFailures, inviteCode, rotateInviteCode, USERNAME_RE, validPassword,
} from './auth.js';
import { defaultSettings, readSettings, applyPatch, PLAN_KEYS } from './settings.js';
import { localDate, diffDays, addDays, isValidTz } from './time.js';
import { generatePlan, getPlan, replan, phaseLengths } from './plan.js';
import { dueCount, troubleSpots } from './srs.js';
import { streakInfo, heatmap, moduleMastery, topicMastery, readiness, questsFor, league } from './stats.js';
import { startSession, getSession, saveState, abandonSession, activeSessions, recordAnswer, completeSession } from './sessions.js';
import { publicKey, subscribe, unsubscribe, sendTo, startScheduler } from './push.js';

const PORT = Number(process.env.PORT || 8080);
const SECURE_COOKIES = process.env.SECURE_COOKIES !== 'false';
const WEB_DIST = process.env.WEB_DIST || new URL('../../web/dist', import.meta.url).pathname;

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL || 'info' },
  trustProxy: process.env.TRUST_PROXY || '127.0.0.1,::1,172.16.0.0/12',
  bodyLimit: 64 * 1024,
  connectionTimeout: 30000,
  requestTimeout: 30000,
  keepAliveTimeout: 65000,
});

await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: null,
    },
  },
  crossOriginEmbedderPolicy: false,
});
await app.register(cookie);
await app.register(rateLimit, {
  global: true,
  max: 300,
  timeWindow: '1 minute',
  keyGenerator: (req) => req.ip,
  errorResponseBuilder: (req, ctx) => ({ statusCode: 429, error: 'Too many requests', message: `Slow down. Try again in ${Math.ceil(ctx.ttl / 1000)}s.` }),
});

// ---------------- request guards ----------------

// CSRF: mutating API calls must be same-origin JSON.
app.addHook('onRequest', async (req, reply) => {
  if (!req.url.startsWith('/api/') || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return;
  const origin = req.headers.origin;
  if (origin) {
    let host;
    try { host = new URL(origin).host; } catch { host = null; }
    if (host !== req.headers.host) return reply.code(403).send({ error: 'Bad origin' });
  } else if (req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin') {
    return reply.code(403).send({ error: 'Bad origin' });
  }
  const ct = req.headers['content-type'] || '';
  if (req.method !== 'DELETE' && !ct.startsWith('application/json')) return reply.code(415).send({ error: 'JSON required' });
});

function auth(req, reply, done) {
  const user = sessionUser(req.cookies[COOKIE]);
  if (!user) {
    reply.code(401).send({ error: 'Not signed in' });
    return;
  }
  req.user = user;
  req.settings = readSettings(user);
  req.today = localDate(req.settings.tz);
  done();
}

function adminOnly(req, reply, done) {
  if (!req.user?.is_admin) { reply.code(403).send({ error: 'Admins only' }); return; }
  done();
}

const authLimit = { rateLimit: { max: 10, timeWindow: '1 minute' } };

app.setErrorHandler((err, req, reply) => {
  const status = err.statusCode || err.status || 500;
  if (status >= 500) req.log.error(err);
  reply.code(status).send({ error: status >= 500 ? 'Something went wrong' : err.message });
});

// ---------------- auth ----------------

function publicUser(u) {
  const s = readSettings(u);
  return { id: u.id, username: u.username, displayName: u.display_name, isAdmin: !!u.is_admin, settings: s, streakFreezes: u.streak_freezes };
}

app.post('/api/auth/register', { config: { rateLimit: { max: 5, timeWindow: '1 hour' } } }, async (req, reply) => {
  const { username, password, displayName, inviteCode: code, tz } = req.body || {};
  if (typeof username !== 'string' || !USERNAME_RE.test(username)) return reply.code(400).send({ error: 'Username: 3–24 letters, numbers, dot, dash or underscore' });
  if (!validPassword(password)) return reply.code(400).send({ error: 'Password must be at least 8 characters' });
  const isFirst = db.prepare('SELECT COUNT(*) AS n FROM users').get().n === 0;
  // Everyone needs the invite code, including the first (admin) account, so a public URL can't be claimed by a stranger.
  if (typeof code !== 'string' || code.trim().toUpperCase() !== inviteCode()) return reply.code(403).send({ error: 'That invite code is not valid' });
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) return reply.code(409).send({ error: 'That username is taken' });
  const name = typeof displayName === 'string' && displayName.trim() ? displayName.trim().slice(0, 40) : username;
  const settings = defaultSettings(isValidTz(tz) ? tz : 'UTC');
  const info = db.prepare('INSERT INTO users (username, display_name, pass_hash, is_admin, settings, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(username, name, await hashPassword(password), isFirst ? 1 : 0, JSON.stringify(settings), Date.now());
  const token = createSession(info.lastInsertRowid, req.headers['user-agent']);
  reply.setCookie(COOKIE, token, cookieOptions(SECURE_COOKIES));
  return { user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)) };
});

app.post('/api/auth/login', { config: authLimit }, async (req, reply) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || username.length > 24 || password.length > 200) {
    return reply.code(400).send({ error: 'Enter your username and password' });
  }
  const until = lockedUntil(username);
  if (until) return reply.code(429).send({ error: `Too many attempts. Try again in ${Math.ceil((until - Date.now()) / 60000)} min.` });
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) { await burnPasswordCheck(password); recordFailure(username); return reply.code(401).send({ error: 'Wrong username or password' }); }
  if (!(await verifyPassword(password, user.pass_hash))) { recordFailure(username); return reply.code(401).send({ error: 'Wrong username or password' }); }
  if (user.disabled) return reply.code(403).send({ error: 'This account is disabled' });
  clearFailures(username);
  const token = createSession(user.id, req.headers['user-agent']);
  reply.setCookie(COOKIE, token, cookieOptions(SECURE_COOKIES));
  return { user: publicUser(user) };
});

app.post('/api/auth/logout', async (req, reply) => {
  destroySession(req.cookies[COOKIE]);
  reply.clearCookie(COOKIE, { path: '/' });
  return { ok: true };
});

app.get('/api/me', { preHandler: auth }, async (req) => {
  const plan = db.prepare('SELECT 1 FROM plans WHERE user_id = ?').get(req.user.id);
  return { user: publicUser(req.user), hasPlan: !!plan, today: req.today, contentVersion: content.version };
});

// ---------------- content ----------------

app.get('/api/content/index', { preHandler: auth }, async (req, reply) => {
  reply.header('ETag', `"${content.version}"`).header('Cache-Control', 'private, no-cache');
  if (req.headers['if-none-match'] === `"${content.version}"`) return reply.code(304).send();
  reply.type('application/json');
  return content.indexJson;
});

app.get('/api/content/topic/:id', { preHandler: auth }, async (req, reply) => {
  const json = content.topicJson.get(req.params.id);
  if (!json) return reply.code(404).send({ error: 'Unknown topic' });
  const etag = `"${content.version}-${req.params.id}"`;
  reply.header('ETag', etag).header('Cache-Control', 'private, no-cache');
  if (req.headers['if-none-match'] === etag) return reply.code(304).send();
  reply.type('application/json');
  return json;
});

app.get('/api/content/formulas', { preHandler: auth }, async () => ({ version: content.version, formulas: content.formulas }));

// ---------------- plan ----------------

function describe(item) {
  const [kind] = [item.kind];
  if (kind === 'lesson' || kind === 'testout') {
    const l = content.lessons.get(item.ref);
    if (!l) return null;
    const m = content.modules.get(l.moduleId);
    const t = content.topics.find((x) => x.id === l.topicId);
    return { title: l.title, subtitle: `${t?.name} · LM ${m?.lm} ${m?.title}`, topicId: l.topicId, moduleId: l.moduleId };
  }
  if (kind === 'checkpoint') {
    const t = content.topics.find((x) => `checkpoint:${x.id}` === item.ref);
    return { title: `${t?.name ?? 'Topic'} checkpoint`, subtitle: '12 exam-style questions · timed', topicId: t?.id };
  }
  if (kind === 'mock') {
    const [, n, p] = item.ref.split(':');
    return { title: `Mock exam ${n} · Part ${p}/4`, subtitle: '45 questions · 90 s each · pause any time' };
  }
  if (kind === 'period') return { title: `Period ${item.ref.split(':')[1]} close`, subtitle: 'Review this week’s material' };
  if (kind === 'drill') return { title: 'Weak-spot drill', subtitle: 'Your three weakest modules' };
  if (kind === 'sprint') return item.ref === 'sprint:ethics' ? { title: 'Ethics sprint', subtitle: '15 Standards scenarios' } : { title: 'Formula sprint', subtitle: 'Formulas and rules flashcards' };
  if (kind === 'review') return { title: 'Final review', subtitle: 'Last look before exam day' };
  return { title: item.ref, subtitle: '' };
}

function planView(userId, today) {
  const plan = getPlan(userId);
  if (!plan) return null;
  const todayIdx = diffDays(plan.start, today);
  const items = plan.items.map((it) => {
    const d = describe(it);
    if (!d) return null;
    const status = it.doneAt ? 'done' : it.day < todayIdx ? 'overdue' : it.day === todayIdx ? 'today' : 'upcoming';
    return { ...it, ...d, date: addDays(plan.start, it.day), status };
  }).filter(Boolean);
  const lens = phaseLengths(plan.days);
  return { ...plan, todayIdx, phases: lens, items };
}

app.get('/api/plan', { preHandler: auth }, async (req) => ({ plan: planView(req.user.id, req.today), today: req.today }));

app.post('/api/plan/generate', { preHandler: auth, config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (req) => {
  generatePlan(req.user.id, req.settings, req.today);
  return { plan: planView(req.user.id, req.today) };
});

app.post('/api/plan/replan', { preHandler: auth, config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (req) => {
  replan(req.user.id, req.settings, req.today);
  return { plan: planView(req.user.id, req.today) };
});

// ---------------- dashboard ----------------

function nextAction(userId, view, due, active, streak) {
  const resume = active[0];
  if (resume) return { type: 'resume', session: { id: resume.id, kind: resume.kind, ref: resume.ref, title: resume.meta?.title, progress: resume.state?.answered || 0, total: resume.items.length } };
  const reviewedToday = db.prepare("SELECT 1 FROM study_sessions WHERE user_id = ? AND kind = 'review' AND completed_at > ?").get(userId, Date.now() - 12 * 3600000);
  if (due >= 8 && !reviewedToday) return { type: 'review', due };
  if (view) {
    const pending = view.items.filter((i) => i.status === 'overdue' || i.status === 'today');
    if (pending.length) return { type: 'plan', item: pending[0] };
    if (due > 0) return { type: 'review', due };
    const ahead = view.items.find((i) => i.status === 'upcoming');
    if (ahead) return { type: 'ahead', item: ahead };
  } else if (due > 0) return { type: 'review', due };
  return { type: 'mini', streakDone: streak.doneToday };
}

app.get('/api/dashboard', { preHandler: auth }, async (req) => {
  const uid = req.user.id;
  const today = req.today;
  const view = planView(uid, today);
  const streak = streakInfo(uid, today);
  const due = dueCount(uid);
  const mods = moduleMastery(uid);
  const topics = topicMastery(uid, mods);
  const ready = readiness(uid, topics);
  const active = activeSessions(uid);

  let pace = null;
  let todayItems = [];
  let tomorrow = [];
  if (view) {
    const scheduledSoFar = view.items.filter((i) => i.day <= view.todayIdx);
    const behind = view.items.filter((i) => i.status === 'overdue');
    todayItems = view.items.filter((i) => i.status === 'overdue' || i.day === view.todayIdx);
    tomorrow = view.items.filter((i) => i.day === view.todayIdx + 1);
    const ahead = view.items.filter((i) => i.doneAt && i.day > view.todayIdx).length;
    pace = {
      dayNumber: view.todayIdx + 1,
      days: view.days,
      phase: view.todayIdx < view.phases.learn ? 'learn' : view.todayIdx < view.phases.learn + view.phases.consolidate ? 'consolidate' : view.todayIdx < view.days ? 'final' : view.todayIdx < 0 ? 'before' : 'maintenance',
      done: view.items.filter((i) => i.doneAt).length,
      total: view.items.length,
      expected: scheduledSoFar.length,
      behind: behind.length,
      behindMinutes: behind.reduce((a, b) => a + b.minutes, 0),
      ahead,
      status: behind.length > 0 ? (behind.length > 6 ? 'behind' : 'slightly-behind') : ahead > 0 ? 'ahead' : 'on-track',
      suggestReplan: behind.length > 0 && behind.reduce((a, b) => a + b.minutes, 0) > (req.settings.weekdayMinutes * 2),
    };
  }
  const todayDone = todayItems.filter((i) => i.status === 'done').length;
  const lessonsTotal = content.lessons.size;
  const lessonsDone = db.prepare('SELECT COUNT(*) AS n FROM lesson_progress WHERE user_id = ?').get(uid).n;
  const totals = db.prepare('SELECT COALESCE(SUM(xp),0) AS xp, COALESCE(SUM(seconds),0) AS seconds FROM activity WHERE user_id = ?').get(uid);
  const answered = db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(correct),0) AS c FROM attempts WHERE user_id = ? AND item_kind = 'q'").get(uid);
  const todayAct = db.prepare('SELECT * FROM activity WHERE user_id = ? AND day = ?').get(uid, today) || { xp: 0, seconds: 0 };
  const hmFrom = view ? view.start : addDays(today, -59);
  const hmTo = view ? addDays(view.start, view.days - 1) : today;
  const lg = league(today);
  const milestones = view ? view.items.filter((i) => !i.doneAt && ['checkpoint', 'mock', 'period'].includes(i.kind) && i.day >= view.todayIdx).slice(0, 3) : [];

  return {
    today,
    displayName: req.user.display_name,
    examDate: req.settings.examDate,
    daysToExam: diffDays(today, req.settings.examDate),
    plan: view ? { start: view.start, end: view.end, days: view.days, todayIdx: view.todayIdx, phases: view.phases } : null,
    pace,
    todayItems,
    tomorrow,
    ring: { done: todayItems.filter((i) => i.day === view?.todayIdx && i.status === 'done').length, total: todayItems.filter((i) => i.day === view?.todayIdx).length, allDone: todayDone === todayItems.length && todayItems.length > 0 },
    streak: { ...streak, freezes: req.user.streak_freezes },
    reviewsDue: due,
    trouble: troubleSpots(uid, 5).length,
    quests: questsFor(uid, today),
    readiness: ready,
    topics,
    heatmap: { from: hmFrom, to: hmTo, days: heatmap(uid, hmFrom, hmTo) },
    league: { ...lg, rows: lg.rows.slice(0, 5), me: lg.rows.find((r) => r.id === uid) || null },
    active: active.map((s) => ({ id: s.id, kind: s.kind, ref: s.ref, title: s.meta?.title, progress: s.state?.answered || 0, total: s.items.length })),
    next: nextAction(uid, view, due, active, streak),
    milestones,
    totals: { xp: totals.xp, minutes: Math.round(totals.seconds / 60), lessonsDone, lessonsTotal, answered: answered.n, accuracy: answered.n ? answered.c / answered.n : null, todayXp: todayAct.xp, todayMinutes: Math.round(todayAct.seconds / 60) },
  };
});

// ---------------- progress views ----------------

app.get('/api/progress', { preHandler: auth }, async (req) => {
  const uid = req.user.id;
  const lessons = Object.fromEntries(db.prepare('SELECT lesson_id, status, best_score, completions, last_at FROM lesson_progress WHERE user_id = ?').all(uid)
    .map((r) => [r.lesson_id, { status: r.status, best: r.best_score, completions: r.completions, lastAt: r.last_at }]));
  const mods = moduleMastery(uid);
  return { lessons, modules: mods, topics: topicMastery(uid, mods) };
});

app.get('/api/review/summary', { preHandler: auth }, async (req) => {
  const uid = req.user.id;
  const now = Date.now();
  const counts = db.prepare(`SELECT
      SUM(CASE WHEN due <= ? THEN 1 ELSE 0 END) AS due,
      SUM(CASE WHEN due <= ? AND item_kind = 'q' THEN 1 ELSE 0 END) AS dueQ,
      SUM(CASE WHEN due <= ? AND item_kind = 'f' THEN 1 ELSE 0 END) AS dueF,
      SUM(CASE WHEN due > ? AND due <= ? THEN 1 ELSE 0 END) AS tomorrow,
      COUNT(*) AS total,
      SUM(CASE WHEN reason = 'mistake' THEN 1 ELSE 0 END) AS mistakes,
      SUM(CASE WHEN interval >= 7 THEN 1 ELSE 0 END) AS mature
    FROM srs WHERE user_id = ?`).get(now, now, now, now, now + 86400000, uid);
  const wrong = db.prepare(`SELECT COUNT(*) AS n FROM (SELECT item_id, (SELECT correct FROM attempts b WHERE b.user_id = a.user_id AND b.item_id = a.item_id ORDER BY created_at DESC LIMIT 1) AS lc
    FROM attempts a WHERE user_id = ? AND item_kind = 'q' GROUP BY item_id) WHERE lc = 0`).get(uid).n;
  const mods = moduleMastery(uid);
  const weak = Object.entries(mods).filter(([, v]) => v.seen > 0).sort((a, b) => a[1].mastery - b[1].mastery).slice(0, 5)
    .map(([id, v]) => ({ id, title: content.modules.get(id)?.title, topicId: content.modules.get(id)?.topicId, ...v }));
  const trouble = troubleSpots(uid, 20).map((t) => ({ ...t, title: (content.questions.get(t.id)?.stem || content.flashcards.get(t.id)?.front || '').slice(0, 120) }));
  const forecast = db.prepare(`SELECT CAST((due - ?) / 86400000 AS INTEGER) AS d, COUNT(*) AS n FROM srs WHERE user_id = ? AND due > ? AND due <= ? GROUP BY d ORDER BY d`)
    .all(now, uid, now, now + 7 * 86400000);
  const mocks = db.prepare('SELECT id, kind, ref, score, completed_at AS completedAt, created_at AS createdAt FROM mocks WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(uid);
  const mockParts = db.prepare("SELECT ref, json_extract(summary, '$.accuracy') AS accuracy, completed_at AS completedAt FROM study_sessions WHERE user_id = ? AND kind = 'mock' AND completed_at IS NOT NULL").all(uid);
  return { counts: { ...counts, wrong }, weak, trouble, forecast, mocks, mockParts };
});

app.get('/api/league', { preHandler: auth }, async (req) => {
  const lg = league(req.today);
  return { ...lg, me: req.user.id };
});

// ---------------- sessions ----------------

app.post('/api/sessions', { preHandler: auth }, async (req) => {
  const { id, kind, ref, planItemId } = req.body || {};
  return { session: startSession(req.user.id, { id, kind, ref, planItemId }, req.settings) };
});

app.get('/api/sessions/active', { preHandler: auth }, async (req) => ({ sessions: activeSessions(req.user.id) }));

app.get('/api/sessions/:id', { preHandler: auth }, async (req, reply) => {
  const s = getSession(req.user.id, req.params.id);
  if (!s) return reply.code(404).send({ error: 'Session not found' });
  return { session: s };
});

app.put('/api/sessions/:id/state', { preHandler: auth, config: { rateLimit: { max: 240, timeWindow: '1 minute' } } }, async (req) => {
  return { ok: saveState(req.user.id, req.params.id, req.body?.state) };
});

app.post('/api/sessions/:id/complete', { preHandler: auth }, async (req) => {
  return { summary: completeSession(req.user.id, req.params.id, req.body || {}, { today: req.today, examDate: req.settings.examDate }) };
});

app.delete('/api/sessions/:id', { preHandler: auth }, async (req) => {
  abandonSession(req.user.id, req.params.id);
  return { ok: true };
});

app.post('/api/answers', { preHandler: auth, config: { rateLimit: { max: 240, timeWindow: '1 minute' } } }, async (req) => {
  const list = Array.isArray(req.body?.answers) ? req.body.answers.slice(0, 200) : [req.body];
  const results = list.map((a) => {
    try { return recordAnswer(req.user.id, a, { today: req.today, examDate: req.settings.examDate }); } catch (e) { return { error: e.message }; }
  });
  return { results };
});

// ---------------- settings & account ----------------

app.patch('/api/settings', { preHandler: auth }, async (req, reply) => {
  const { displayName, ...patch } = req.body || {};
  const res = applyPatch(req.settings, patch);
  if (!res.ok) return reply.code(400).send({ error: res.error });
  db.prepare('UPDATE users SET settings = ? WHERE id = ?').run(JSON.stringify(res.settings), req.user.id);
  if (typeof displayName === 'string' && displayName.trim()) db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(displayName.trim().slice(0, 40), req.user.id);
  const planChanged = PLAN_KEYS.some((k) => k in patch && JSON.stringify(patch[k]) !== JSON.stringify(req.settings[k]));
  const hasPlan = !!db.prepare('SELECT 1 FROM plans WHERE user_id = ?').get(req.user.id);
  if (planChanged && hasPlan) generatePlan(req.user.id, res.settings, localDate(res.settings.tz));
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return { user: publicUser(user), planRegenerated: planChanged && hasPlan };
});

app.post('/api/account/password', { preHandler: auth, config: authLimit }, async (req, reply) => {
  const { current, next } = req.body || {};
  if (!(await verifyPassword(String(current || ''), req.user.pass_hash))) return reply.code(400).send({ error: 'Current password is wrong' });
  if (!validPassword(next)) return reply.code(400).send({ error: 'New password must be at least 8 characters' });
  db.prepare('UPDATE users SET pass_hash = ? WHERE id = ?').run(await hashPassword(next), req.user.id);
  destroyUserSessions(req.user.id, req.cookies[COOKIE]);
  return { ok: true };
});

app.post('/api/account/signout-others', { preHandler: auth }, async (req) => {
  destroyUserSessions(req.user.id, req.cookies[COOKIE]);
  return { ok: true };
});

app.post('/api/account/reset-progress', { preHandler: auth, config: authLimit }, async (req, reply) => {
  if (req.body?.confirm !== 'RESET') return reply.code(400).send({ error: 'Type RESET to confirm' });
  const uid = req.user.id;
  db.transaction(() => {
    for (const t of ['attempts', 'srs', 'lesson_progress', 'study_sessions', 'mocks', 'activity', 'quest_claims', 'plan_items', 'plans']) db.prepare(`DELETE FROM ${t} WHERE user_id = ?`).run(uid);
    db.prepare('UPDATE users SET streak_freezes = 0 WHERE id = ?').run(uid);
    const s = { ...req.settings, onboarded: false, planStart: null };
    db.prepare('UPDATE users SET settings = ? WHERE id = ?').run(JSON.stringify(s), uid);
  })();
  return { ok: true };
});

app.post('/api/account/delete', { preHandler: auth, config: authLimit }, async (req, reply) => {
  if (!(await verifyPassword(String(req.body?.password || ''), req.user.pass_hash))) return reply.code(400).send({ error: 'Password is wrong' });
  if (req.user.is_admin && db.prepare('SELECT COUNT(*) AS n FROM users WHERE is_admin = 1').get().n === 1 && db.prepare('SELECT COUNT(*) AS n FROM users').get().n > 1) {
    return reply.code(400).send({ error: 'Make another user admin before deleting the only admin' });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
  reply.clearCookie(COOKIE, { path: '/' });
  return { ok: true };
});

app.get('/api/account/export', { preHandler: auth }, async (req, reply) => {
  const uid = req.user.id;
  const data = { exportedAt: new Date().toISOString(), user: publicUser(req.user) };
  for (const t of ['plans', 'plan_items', 'lesson_progress', 'attempts', 'srs', 'activity', 'mocks']) data[t] = db.prepare(`SELECT * FROM ${t} WHERE user_id = ?`).all(uid);
  reply.header('Content-Disposition', `attachment; filename="ledger-${req.user.username}-${req.today}.json"`);
  return data;
});

// ---------------- admin ----------------

app.get('/api/admin', { preHandler: [auth, adminOnly] }, async () => ({
  inviteCode: inviteCode(),
  users: db.prepare(`SELECT u.id, u.username, u.display_name AS displayName, u.is_admin AS isAdmin, u.disabled, u.created_at AS createdAt,
      (SELECT MAX(day) FROM activity a WHERE a.user_id = u.id AND a.sessions > 0) AS lastActive,
      (SELECT COALESCE(SUM(xp),0) FROM activity a WHERE a.user_id = u.id) AS xp
    FROM users u ORDER BY u.id`).all(),
}));

app.post('/api/admin/invite', { preHandler: [auth, adminOnly] }, async () => ({ inviteCode: rotateInviteCode() }));

app.post('/api/admin/users/:id', { preHandler: [auth, adminOnly], config: authLimit }, async (req, reply) => {
  const id = Number(req.params.id);
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!target) return reply.code(404).send({ error: 'No such user' });
  const { action } = req.body || {};
  if (id === req.user.id && action !== 'reset-password') return reply.code(400).send({ error: 'You cannot do that to yourself' });
  if (action === 'disable') { db.prepare('UPDATE users SET disabled = 1 WHERE id = ?').run(id); destroyUserSessions(id); return { ok: true }; }
  if (action === 'enable') { db.prepare('UPDATE users SET disabled = 0 WHERE id = ?').run(id); return { ok: true }; }
  if (action === 'make-admin') { db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(id); return { ok: true }; }
  if (action === 'reset-password') {
    const temp = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
    db.prepare('UPDATE users SET pass_hash = ? WHERE id = ?').run(await hashPassword(temp), id);
    destroyUserSessions(id);
    clearFailures(target.username);
    return { ok: true, tempPassword: temp };
  }
  return reply.code(400).send({ error: 'Unknown action' });
});

// ---------------- push ----------------

app.get('/api/push/key', { preHandler: auth }, async () => ({ key: publicKey() }));
app.post('/api/push/subscribe', { preHandler: auth }, async (req, reply) => {
  if (!subscribe(req.user.id, req.body?.subscription)) return reply.code(400).send({ error: 'Invalid subscription' });
  return { ok: true };
});
app.post('/api/push/unsubscribe', { preHandler: auth }, async (req) => { unsubscribe(req.user.id, req.body?.endpoint); return { ok: true }; });
app.post('/api/push/test', { preHandler: auth, config: { rateLimit: { max: 3, timeWindow: '1 minute' } } }, async (req) => {
  const sent = await sendTo(req.user.id, { title: 'Notifications are on', body: 'You will get one calm reminder a day.', url: '/settings/notifications', tag: 'test' });
  return { sent };
});

app.get('/api/health', { config: { rateLimit: false } }, async () => ({ ok: true, content: content.version, lessons: content.lessons.size, questions: content.questions.size }));

// ---------------- static web app ----------------

if (existsSync(WEB_DIST)) {
  const indexHtml = readFileSync(`${WEB_DIST}/index.html`, 'utf8');
  // Hashed assets are immutable; everything else (index.html, sw.js, manifest, icons) must revalidate.
  app.addHook('onSend', async (req, reply, payload) => {
    if (req.url.startsWith('/api/')) return payload;
    reply.header('Cache-Control', req.url.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache');
    return payload;
  });
  await app.register(fastifyStatic, {
    root: WEB_DIST,
    wildcard: false,
    index: false,
    cacheControl: false,
  });
  // Static files register exact routes; everything else that isn't an API call gets the SPA shell.
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api/')) return reply.code(404).send({ error: 'Not found' });
    // Missing hashed assets must 404 (not return the HTML shell) so stale clients can detect it and reload.
    if (req.url.startsWith('/assets/') || /\.(js|css|png|svg|webmanifest|map)$/.test(req.url.split('?')[0])) return reply.code(404).type('text/plain').send('Not found');
    if (req.method !== 'GET') return reply.code(404).send({ error: 'Not found' });
    reply.header('Cache-Control', 'no-cache').type('text/html').send(indexHtml);
  });
} else {
  app.log.warn(`web dist not found at ${WEB_DIST}`);
}

startScheduler();
await app.listen({ port: PORT, host: '0.0.0.0' });
