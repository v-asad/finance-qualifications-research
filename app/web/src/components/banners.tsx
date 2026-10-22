import { useEffect, useState } from 'react';
import { Share, X, WifiOff, Sparkles, PlusSquare } from 'lucide-react';
import { pendingAnswers } from '../lib/api';
import { needRefresh, updateApp } from '../lib/pwa';

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function InstallBanner() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('ledger.installDismissed') === '1');
  if (dismissed || isStandalone() || !isIOS()) return null;
  return (
    <div className="fixed inset-x-3 z-40 animate-rise rounded-3xl bg-ink p-4 text-white shadow-pop dark:bg-night-600" style={{ bottom: 'calc(var(--tabbar-h) + var(--safe-bottom) + 10px)' }}>
      <button className="absolute right-3 top-3 rounded-full p-1 text-white/70 active:bg-white/10" aria-label="Dismiss"
        onClick={() => { localStorage.setItem('ledger.installDismissed', '1'); setDismissed(true); }}>
        <X className="h-5 w-5" />
      </button>
      <div className="pr-8 font-display text-base font-extrabold">Install Ledger on your iPhone</div>
      <p className="mt-1 text-sm text-white/80">
        Tap <Share className="mx-0.5 inline h-4 w-4 -translate-y-0.5" /> <b>Share</b>, then <PlusSquare className="mx-0.5 inline h-4 w-4 -translate-y-0.5" /> <b>Add to Home Screen</b>.
        It opens full-screen and can send you a daily reminder.
      </p>
    </div>
  );
}

export function UpdateBanner() {
  const [show, setShow] = useState(needRefresh.value);
  useEffect(() => needRefresh.subscribe(setShow), []);
  if (!show) return null;
  return (
    <div className="fixed inset-x-3 z-50 flex animate-rise items-center gap-3 rounded-2xl bg-brand-700 px-4 py-3 text-white shadow-pop" style={{ top: 'calc(var(--safe-top) + 8px)' }}>
      <Sparkles className="h-5 w-5 shrink-0 text-gold-300" />
      <div className="flex-1 text-sm font-semibold">A new version is ready.</div>
      <button className="rounded-xl bg-white px-3 py-1.5 text-sm font-extrabold text-brand-700 active:opacity-80" onClick={() => updateApp()}>Update</button>
    </div>
  );
}

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(pendingAnswers());
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    const t = setInterval(() => setPending(pendingAnswers()), 3000);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); clearInterval(t); };
  }, []);
  if (online) return null;
  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-gold-400 px-4 py-1.5 text-xs font-bold text-ink safe-top">
      <WifiOff className="h-3.5 w-3.5" /> Offline{pending ? ` · ${pending} answers will sync` : ' · lessons you opened still work'}
    </div>
  );
}
