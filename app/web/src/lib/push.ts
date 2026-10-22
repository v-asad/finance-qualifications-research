import { api } from './api';
import { getRegistration } from './pwa';

export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function keyToBytes(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Must be called from a user gesture (iOS requirement). */
export async function enablePush() {
  if (!pushSupported()) throw new Error('Notifications aren’t supported here. On iPhone, add Ledger to your Home Screen first.');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Notifications were not allowed. You can enable them in iOS Settings → Notifications → Ledger.');
  const reg = await getRegistration();
  if (!reg) throw new Error('Service worker not ready yet. Try again in a moment.');
  const { key } = await api<{ key: string }>('/api/push/key');
  const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(key) }));
  await api('/api/push/subscribe', { body: { subscription: sub.toJSON() } });
}

export async function disablePush() {
  const reg = await getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  await api('/api/push/unsubscribe', { body: { endpoint: sub?.endpoint } }).catch(() => {});
  await sub?.unsubscribe().catch(() => {});
}

export async function pushStatus(): Promise<'unsupported' | 'denied' | 'on' | 'off'> {
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  const reg = await getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === 'granted' ? 'on' : 'off';
}
