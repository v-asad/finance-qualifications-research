import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.DB_PATH || new URL('../../data/cfa.db', import.meta.url).pathname;
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

const MIGRATIONS = [
  `
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    display_name TEXT NOT NULL,
    pass_hash TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    disabled INTEGER NOT NULL DEFAULT 0,
    settings TEXT NOT NULL DEFAULT '{}',
    streak_freezes INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    last_seen INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    user_agent TEXT
  );
  CREATE INDEX sessions_user ON sessions(user_id);
  CREATE TABLE kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE login_failures (
    username TEXT PRIMARY KEY COLLATE NOCASE,
    count INTEGER NOT NULL,
    first_at INTEGER NOT NULL,
    locked_until INTEGER NOT NULL DEFAULT 0
  );

  -- 60-day plan
  CREATE TABLE plans (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    exam_date TEXT NOT NULL,
    days INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    replanned_at INTEGER
  );
  CREATE TABLE plan_items (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    seq INTEGER NOT NULL,
    kind TEXT NOT NULL,
    ref TEXT NOT NULL,
    minutes INTEGER NOT NULL,
    phase TEXT NOT NULL,
    done_at INTEGER,
    result TEXT
  );
  CREATE INDEX plan_items_user ON plan_items(user_id, day, seq);

  -- learning state
  CREATE TABLE lesson_progress (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    status TEXT NOT NULL,
    best_score REAL NOT NULL DEFAULT 0,
    completions INTEGER NOT NULL DEFAULT 0,
    first_at INTEGER NOT NULL,
    last_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, lesson_id)
  );
  CREATE TABLE attempts (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT,
    item_id TEXT NOT NULL,
    item_kind TEXT NOT NULL,
    module_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    correct INTEGER NOT NULL,
    grade TEXT,
    chosen INTEGER,
    ms INTEGER,
    context TEXT NOT NULL,
    day TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX attempts_user_item ON attempts(user_id, item_id, created_at);
  CREATE INDEX attempts_user_day ON attempts(user_id, day);
  CREATE INDEX attempts_user_module ON attempts(user_id, module_id);
  CREATE TABLE srs (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_kind TEXT NOT NULL,
    module_id TEXT NOT NULL,
    due INTEGER NOT NULL,
    interval REAL NOT NULL DEFAULT 0,
    ease REAL NOT NULL DEFAULT 2.5,
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    last_at INTEGER,
    reason TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, item_id)
  );
  CREATE INDEX srs_due ON srs(user_id, due);

  CREATE TABLE study_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    ref TEXT,
    plan_item_id INTEGER,
    items TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT '{}',
    started_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    completed_at INTEGER,
    abandoned_at INTEGER,
    summary TEXT
  );
  CREATE INDEX study_sessions_user ON study_sessions(user_id, updated_at);

  CREATE TABLE mocks (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    ref TEXT NOT NULL,
    question_ids TEXT NOT NULL,
    parts INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    completed_at INTEGER,
    score REAL
  );

  CREATE TABLE activity (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    sessions INTEGER NOT NULL DEFAULT 0,
    lessons INTEGER NOT NULL DEFAULT 0,
    reviews INTEGER NOT NULL DEFAULT 0,
    seconds INTEGER NOT NULL DEFAULT 0,
    frozen INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day)
  );
  CREATE TABLE quest_claims (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    quest TEXT NOT NULL,
    PRIMARY KEY (user_id, day, quest)
  );
  CREATE TABLE push_subs (
    endpoint TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    keys TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE push_log (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    kind TEXT NOT NULL,
    PRIMARY KEY (user_id, day, kind)
  );
  `,
];

db.exec('CREATE TABLE IF NOT EXISTS _migrations (n INTEGER PRIMARY KEY)');
const applied = new Set(db.prepare('SELECT n FROM _migrations').all().map((r) => r.n));
MIGRATIONS.forEach((sql, i) => {
  if (applied.has(i)) return;
  db.transaction(() => {
    db.exec(sql);
    db.prepare('INSERT INTO _migrations (n) VALUES (?)').run(i);
  })();
});

export function kvGet(key) {
  return db.prepare('SELECT value FROM kv WHERE key = ?').get(key)?.value ?? null;
}
export function kvSet(key, value) {
  db.prepare('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
}
