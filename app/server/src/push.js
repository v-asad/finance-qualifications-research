import webpush from 'web-push';
import { db, kvGet, kvSet } from './db.js';
import { readSettings } from './settings.js';
import { localDate, localMinutes } from './time.js';
import { streakInfo } from './stats.js';
import { dueCount } from './srs.js';

function vapid() {
  let keys = kvGet('vapid');
  if (!keys) {
    keys = JSON.stringify(webpush.generateVAPIDKeys());
    kvSet('vapid', keys);
  }
  return JSON.parse(keys);
}

const keys = vapid();
webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@tomo.study', keys.publicKey, keys.privateKey);

export const publicKey = () => keys.publicKey;

export function subscribe(userId, sub) {
  if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || sub.endpoint.length > 1000) return false;
  if (!sub.keys?.p256dh || !sub.keys?.auth) return false;
  db.prepare('INSERT INTO push_subs (endpoint, user_id, keys, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, keys = excluded.keys')
    .run(sub.endpoint, userId, JSON.stringify({ p256dh: String(sub.keys.p256dh).slice(0, 200), auth: String(sub.keys.auth).slice(0, 100) }), Date.now());
  return true;
}

export function unsubscribe(userId, endpoint) {
  if (endpoint) db.prepare('DELETE FROM push_subs WHERE user_id = ? AND endpoint = ?').run(userId, endpoint);
  else db.prepare('DELETE FROM push_subs WHERE user_id = ?').run(userId);
}

export async function sendTo(userId, payload) {
  const subs = db.prepare('SELECT * FROM push_subs WHERE user_id = ?').all(userId);
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: JSON.parse(s.keys) }, JSON.stringify(payload), { TTL: 3600 });
      sent++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) db.prepare('DELETE FROM push_subs WHERE endpoint = ?').run(s.endpoint);
    }
  }
  return sent;
}

const hm = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));

/** Runs every minute: one daily reminder and an optional evening streak-saver, at most once each per day. */
async function tick() {
  const users = db.prepare('SELECT u.* FROM users u WHERE u.disabled = 0 AND EXISTS (SELECT 1 FROM push_subs p WHERE p.user_id = u.id)').all();
  for (const u of users) {
    const s = readSettings(u);
    if (!s.remindersEnabled) continue;
    const now = localMinutes(s.tz);
    const day = localDate(s.tz);
    const streak = streakInfo(u.id, day);
    const once = (kind) => db.prepare('INSERT OR IGNORE INTO push_log (user_id, day, kind) VALUES (?, ?, ?)').run(u.id, day, kind).changes > 0;

    if (now >= hm(s.reminderTime) && now < hm(s.reminderTime) + 30 && !streak.doneToday && once('daily')) {
      const due = dueCount(u.id);
      await sendTo(u.id, {
        title: 'Ten minutes for Level I?',
        body: due ? `${due} review${due === 1 ? '' : 's'} are ready, plus today's plan.` : "Today's plan is ready when you are.",
        url: '/',
        tag: 'daily',
      });
    }
    if (s.streakSaver && streak.current > 0 && !streak.doneToday && now >= hm(s.streakSaverTime) && now < hm(s.streakSaverTime) + 30 && once('streak')) {
      await sendTo(u.id, {
        title: `Keep your ${streak.current}-day streak`,
        body: 'One short review keeps it going.',
        url: '/review',
        tag: 'streak',
      });
    }
  }
}

export function startScheduler() {
  const run = () => tick().catch((e) => console.error('push tick failed', e));
  setTimeout(run, 5000);
  return setInterval(run, 60000);
}
