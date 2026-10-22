import { registerSW } from 'virtual:pwa-register';

type Sub = (v: boolean) => void;
const subs = new Set<Sub>();
export const needRefresh = {
  value: false,
  subscribe(fn: Sub) { subs.add(fn); return () => { subs.delete(fn); }; },
  set(v: boolean) { this.value = v; subs.forEach((s) => s(v)); },
};

let update: ((reload?: boolean) => Promise<void>) | null = null;

export function initPwa() {
  if (!('serviceWorker' in navigator)) return;
  update = registerSW({
    immediate: true,
    onNeedRefresh() { needRefresh.set(true); },
    onRegisteredSW(_url, reg) {
      // Check for new versions when the app comes back to the foreground (iOS keeps PWAs alive for days).
      if (!reg) return;
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void reg.update(); });
      setInterval(() => void reg.update(), 60 * 60 * 1000);
    },
  });
}

export function updateApp() {
  needRefresh.set(false);
  if (update) void update(true);
  else window.location.reload();
}

export async function getRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.ready;
}
