# Ledger: CFA Level I in 60 days

A mobile-first PWA for passing CFA® Level I (2027 curriculum) in 10-minute sessions. It has a 60-day roadmap, ACCA fast-track, spaced-repetition review, timed mocks and a Duolingo-style habit loop. Product plan: [`../docs/app/plan.md`](../docs/app/plan.md).

Live at **https://cfa.tomo.study**.

## Stack

| Part | Tech |
|---|---|
| Web | React 18, TypeScript, Vite, React Router (data router), TanStack Query, Tailwind CSS, vite-plugin-pwa (Workbox, injectManifest) |
| Server | Node 22, Fastify 5, SQLite (better-sqlite3, WAL), scrypt passwords, web-push |
| Content | `content/topics/*.json`: 10 topics, 102 learning modules, 250 lessons, 1,157 cards, 1,390 questions, 676 flashcards (original; schema in `content/SCHEMA.md`) |
| Deploy | Docker container `cfa-app` on the `tomo_default` network behind the existing Caddy (`tomo-caddy-1`), which terminates TLS |

## Layout

```
app/
├── content/        topic JSON + schema + authoring brief
├── scripts/        validate-content.mjs
├── server/src/     index.js (routes), db, auth, plan (60-day generator), srs, sessions, stats, push
├── web/src/        pages (Home, Learn, Topic, Roadmap, Review, Settings, Session, Onboarding, Auth), components, lib
├── Dockerfile
└── compose.yaml
```

## Run locally

```bash
cd server && npm ci && DB_PATH=/tmp/ledger.db SECURE_COOKIES=false PORT=18111 node src/index.js
cd web && npm ci && npm run dev        # http://localhost:5173 (proxies /api to :18111)
node scripts/validate-content.mjs      # content checks
```

## Deploy / update

```bash
cd /home/shady/projects/cfa/app
docker compose up -d --build
```

- **Data:** the SQLite database lives in `app/data/cfa.db` (bind-mounted, git-ignored). Back it up with `sqlite3 data/cfa.db ".backup data/backup.db"`.
- **Reverse proxy:** the `cfa.tomo.study` block in `/home/shady/projects/tomo/Caddyfile` proxies to `cfa-app:8080`. Reload with `docker exec tomo-caddy-1 caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile`.
- **DNS:** `A cfa → 169.58.118.82`.

## Accounts

- Username + password. Registration requires the **invite code**. The first account becomes admin.
- Admins can rotate the code, reset passwords (temporary password) and disable users in **Settings → Admin**.
- Invite link format: `https://cfa.tomo.study/register?invite=CODE`.

## Security

- **Rate limits:**
  - 300 requests/min per IP overall
  - 10/min on login and password endpoints
  - 5/hour for registration
- **Lockout:** 8 failed logins lock that username for 15 min.
- **Request handling:**
  - 64 KB JSON body limit (1 MB at Caddy)
  - mutating API calls must be same-origin JSON (CSRF)
  - CSP and security headers via helmet
- **Sessions and passwords:** `HttpOnly; Secure; SameSite=Lax` session cookies (opaque tokens, hashed in the DB, 180-day rolling); scrypt password hashes.
- **Network:** the container has no public port and is only reachable through Caddy. The app trusts `X-Forwarded-For` only from the Docker network.
- **Volumetric DDoS:** app-level limits don't stop it. Put the DNS record behind Cloudflare's proxy if needed.

## Navigation details (iOS and web)

- Every screen and every bottom sheet has a URL (`?sheet=`), so Back/Forward and the iOS swipe gesture behave natively.
- In a session, Back opens a "Take a break?" sheet. Progress is saved continuously (localStorage + server), and Forward or Home → Resume continues exactly where you stopped.
- Finished sessions replace their history entry with the results, so Back never re-enters a completed lesson.
- Answers go through an offline outbox and sync when the connection returns. The app shell and content are cached by the service worker.
