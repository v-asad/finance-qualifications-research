import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { db, kvGet, kvSet } from './db.js';

const scrypt = promisify(scryptCb);
const SESSION_DAYS = 180;
export const COOKIE = 'ledger_session';

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password, stored) {
  const [alg, saltB64, keyB64] = String(stored).split('$');
  if (alg !== 'scrypt') return false;
  const expected = Buffer.from(keyB64, 'base64');
  const key = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return timingSafeEqual(key, expected);
}

// A fixed dummy hash so unknown usernames cost the same time as known ones.
let dummyHash = null;
export async function burnPasswordCheck(password) {
  dummyHash ??= await hashPassword('dummy-password-for-timing');
  await verifyPassword(password, dummyHash);
}

const sha = (s) => createHash('sha256').update(s).digest('hex');

export function createSession(userId, userAgent) {
  const token = randomBytes(32).toString('base64url');
  const now = Date.now();
  db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, last_seen, expires_at, user_agent) VALUES (?, ?, ?, ?, ?, ?)')
    .run(sha(token), userId, now, now, now + SESSION_DAYS * 86400000, (userAgent || '').slice(0, 200));
  return token;
}

export function sessionUser(token) {
  if (!token || token.length > 100) return null;
  const row = db.prepare(`
    SELECT s.token_hash, s.last_seen, s.expires_at, u.*
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?`).get(sha(token));
  if (!row) return null;
  const now = Date.now();
  if (row.expires_at < now || row.disabled) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(row.token_hash);
    return null;
  }
  // Rolling expiry, written at most once an hour.
  if (now - row.last_seen > 3600000) {
    db.prepare('UPDATE sessions SET last_seen = ?, expires_at = ? WHERE token_hash = ?')
      .run(now, now + SESSION_DAYS * 86400000, row.token_hash);
  }
  return row;
}

export function destroySession(token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token));
}

export function destroyUserSessions(userId, exceptToken) {
  if (exceptToken) db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').run(userId, sha(exceptToken));
  else db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

export const cookieOptions = (secure) => ({
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure,
  maxAge: SESSION_DAYS * 86400,
});

// ---- login throttling per username (on top of per-IP rate limits) ----
const MAX_FAILS = 8;
const LOCK_MS = 15 * 60000;
const WINDOW_MS = 15 * 60000;

export function lockedUntil(username) {
  const r = db.prepare('SELECT locked_until FROM login_failures WHERE username = ?').get(username);
  return r && r.locked_until > Date.now() ? r.locked_until : 0;
}

export function recordFailure(username) {
  const now = Date.now();
  const r = db.prepare('SELECT * FROM login_failures WHERE username = ?').get(username);
  if (!r || now - r.first_at > WINDOW_MS) {
    db.prepare('INSERT INTO login_failures (username, count, first_at, locked_until) VALUES (?, 1, ?, 0) ON CONFLICT(username) DO UPDATE SET count = 1, first_at = excluded.first_at, locked_until = 0')
      .run(username, now);
    return;
  }
  const count = r.count + 1;
  db.prepare('UPDATE login_failures SET count = ?, locked_until = ? WHERE username = ?')
    .run(count, count >= MAX_FAILS ? now + LOCK_MS : 0, username);
}

export function clearFailures(username) {
  db.prepare('DELETE FROM login_failures WHERE username = ?').run(username);
}

// ---- invite code ----
export function inviteCode() {
  let code = kvGet('invite_code');
  if (!code) {
    code = process.env.INVITE_CODE || randomBytes(5).toString('hex').toUpperCase();
    kvSet('invite_code', code);
  }
  return code;
}

export function rotateInviteCode() {
  const code = randomBytes(5).toString('hex').toUpperCase();
  kvSet('invite_code', code);
  return code;
}

export const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,24}$/;
export const validPassword = (p) => typeof p === 'string' && p.length >= 8 && p.length <= 200;
