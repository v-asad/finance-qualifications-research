import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from './api';
import type { Settings, User } from './types';
import { setSoundEnabled } from './sound';

type MeData = { user: User; hasPlan: boolean; today: string; contentVersion: string };

type Ctx = {
  me: MeData | null;
  loading: boolean;
  offline: boolean;
  refresh: () => Promise<unknown>;
  updateSettings: (patch: Partial<Settings> & { displayName?: string }) => Promise<{ planRegenerated: boolean }>;
  setMe: (d: MeData | null) => void;
};

const MeContext = createContext<Ctx | null>(null);

export function applyAppearance(s: Pick<Settings, 'theme' | 'textSize' | 'reduceMotion' | 'sound'>) {
  try {
    localStorage.setItem('ledger.theme', s.theme);
    localStorage.setItem('ledger.textSize', s.textSize);
    localStorage.setItem('ledger.reduceMotion', s.reduceMotion ? '1' : '0');
  } catch { /* private mode */ }
  const dark = s.theme === 'dark' || (s.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.dataset.text = s.textSize;
  if (s.reduceMotion) document.documentElement.dataset.reduceMotion = '1';
  else delete document.documentElement.dataset.reduceMotion;
  const meta = document.querySelectorAll('meta[name="theme-color"]');
  meta.forEach((m) => {
    if (s.theme === 'system') m.setAttribute('content', m.getAttribute('media')?.includes('dark') ? '#0A1222' : '#F5F8FF');
    else m.setAttribute('content', dark ? '#0A1222' : '#F5F8FF');
  });
  setSoundEnabled(s.sound);
}

const CACHE_KEY = 'ledger.me';

export function MeProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [cached] = useState<MeData | null>(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; }
  });
  const q = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await api<MeData>('/api/me');
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    retry: (n, e) => !(e instanceof ApiError && e.status === 401) && n < 2,
    staleTime: 60_000,
  });

  const offline = q.isError && !!cached;
  // Use the cached profile while /api/me is in flight (instant cold start) or when offline.
  const me = q.data !== undefined ? q.data : cached;

  useEffect(() => {
    if (q.data !== undefined) {
      try {
        if (q.data) localStorage.setItem(CACHE_KEY, JSON.stringify(q.data));
        else localStorage.removeItem(CACHE_KEY);
      } catch { /* ignore */ }
    }
  }, [q.data]);

  useEffect(() => {
    if (me?.user) applyAppearance(me.user.settings);
  }, [me?.user]);

  // Follow OS theme changes live when set to "system".
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const fn = () => { if (me?.user?.settings.theme === 'system') applyAppearance(me.user.settings); };
    mq.addEventListener?.('change', fn);
    return () => mq.removeEventListener?.('change', fn);
  }, [me?.user]);

  const setMe = useCallback((d: MeData | null) => qc.setQueryData(['me'], d), [qc]);

  const updateSettings = useCallback(async (patch: Partial<Settings> & { displayName?: string }) => {
    const prev = qc.getQueryData<MeData | null>(['me']);
    if (prev) {
      const { displayName, ...rest } = patch;
      const optimistic = { ...prev, user: { ...prev.user, displayName: displayName ?? prev.user.displayName, settings: { ...prev.user.settings, ...rest } } };
      qc.setQueryData(['me'], optimistic);
    }
    try {
      const res = await api<{ user: User; planRegenerated: boolean }>('/api/settings', { method: 'PATCH', body: patch });
      qc.setQueryData(['me'], (old: MeData | null | undefined) => (old ? { ...old, user: res.user } : old));
      if (res.planRegenerated) {
        void qc.invalidateQueries({ queryKey: ['plan'] });
        void qc.invalidateQueries({ queryKey: ['dashboard'] });
      }
      return { planRegenerated: res.planRegenerated };
    } catch (e) {
      qc.setQueryData(['me'], prev);
      throw e;
    }
  }, [qc]);

  return (
    <MeContext.Provider value={{ me, loading: q.isLoading && !cached, offline, refresh: () => q.refetch(), updateSettings, setMe }}>
      {children}
    </MeContext.Provider>
  );
}

export function useMe() {
  const c = useContext(MeContext);
  if (!c) throw new Error('useMe outside provider');
  return c;
}

/** Settings of the signed-in user (only use inside authenticated routes). */
export function useSettings(): Settings {
  return useMe().me!.user.settings;
}
