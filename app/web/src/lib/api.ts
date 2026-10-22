export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Opts = { method?: string; body?: unknown; signal?: AbortSignal; keepalive?: boolean };

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn; };

export async function api<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const { method = opts.body !== undefined ? 'POST' : 'GET', body, signal, keepalive } = opts;
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      signal,
      keepalive,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError(0, 'You appear to be offline');
  }
  if (res.status === 401 && !path.startsWith('/api/auth/')) onUnauthorized?.();
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok) throw new ApiError(res.status, data?.error || data?.message || `Request failed (${res.status})`);
  return data as T;
}

export const uuid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });

// ---------------- answer outbox (works offline) ----------------

export type Answer = {
  id: string;
  sessionId: string;
  itemId: string;
  type: 'q' | 'f';
  correct?: boolean;
  chosen?: number;
  grade?: 'again' | 'hard' | 'good' | 'easy';
  ms?: number;
};

const OUTBOX_KEY = 'ledger.outbox';
const readOutbox = (): Answer[] => {
  try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]'); } catch { return []; }
};
const writeOutbox = (a: Answer[]) => {
  try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(a.slice(-2000))); } catch { /* storage full: drop */ }
};

let flushing: Promise<boolean> | null = null;

export function queueAnswer(a: Answer) {
  writeOutbox([...readOutbox(), a]);
  void flushOutbox();
}

async function doFlush(): Promise<boolean> {
  for (;;) {
    const box = readOutbox();
    if (!box.length) return true;
    const batch = box.slice(0, 100);
    try {
      await api('/api/answers', { body: { answers: batch } });
    } catch (e) {
      // Permanently rejected batches (e.g. content changed) are dropped; anything else is retried later.
      const permanent = e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 429 && e.status !== 401;
      if (!permanent) return false;
    }
    const sent = new Set(batch.map((b) => b.id));
    writeOutbox(readOutbox().filter((b) => !sent.has(b.id)));
  }
}

/** Sends queued answers. Resolves true when the outbox is empty. Concurrent calls share one run. */
export function flushOutbox(): Promise<boolean> {
  // .finally() runs asynchronously, so the lock is always released after it was set.
  if (!flushing) flushing = doFlush().finally(() => { flushing = null; });
  return flushing;
}

export const pendingAnswers = () => readOutbox().length;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flushOutbox());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void flushOutbox(); });
  setInterval(() => { if (readOutbox().length) void flushOutbox(); }, 30000);
}
