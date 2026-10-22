import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Map, RotateCcw, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { InstallBanner, UpdateBanner, OfflineBanner } from './banners';

const TABS = [
  { to: '/', label: 'Home', icon: Home, match: (p: string) => p === '/' },
  { to: '/learn', label: 'Learn', icon: BookOpen, match: (p: string) => p.startsWith('/learn') || p.startsWith('/formulas') },
  { to: '/roadmap', label: 'Roadmap', icon: Map, match: (p: string) => p.startsWith('/roadmap') },
  { to: '/review', label: 'Review', icon: RotateCcw, match: (p: string) => p.startsWith('/review') },
  { to: '/settings', label: 'Settings', icon: Settings, match: (p: string) => p.startsWith('/settings') },
];

export function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const due = useQuery({ queryKey: ['review-summary'], queryFn: () => api('/api/review/summary'), staleTime: 60_000 });
  const dueCount = due.data?.counts?.due || 0;

  return (
    <div className="min-h-[100dvh]">
      <OfflineBanner />
      <UpdateBanner />
      <main className="pb-tabbar">
        <Outlet />
      </main>
      <InstallBanner />
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/92 backdrop-blur-xl dark:border-night-700 dark:bg-night-850/92"
        style={{ paddingBottom: 'var(--safe-bottom)', paddingLeft: 'var(--safe-left)', paddingRight: 'var(--safe-right)' }}>
        <div className="mx-auto flex h-[var(--tabbar-h)] max-w-2xl items-stretch">
          {TABS.map((t) => {
            const active = t.match(pathname);
            const Icon = t.icon;
            return (
              <NavLink
                key={t.to}
                to={t.to}
                onClick={(e) => {
                  // Re-tapping the current tab scrolls to top (or pops to the tab root), like native apps.
                  if (active) {
                    e.preventDefault();
                    if (pathname !== t.to) navigate(t.to);
                    else window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5"
                aria-current={active ? 'page' : undefined}
              >
                <div className={`relative flex h-8 w-14 items-center justify-center rounded-2xl transition-colors ${active ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200' : 'text-slate-400 dark:text-slate-500'}`}>
                  <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.6 : 2.1} />
                  {t.to === '/review' && dueCount > 0 && (
                    <span className="tnum absolute -right-0.5 -top-1 min-w-[18px] rounded-full bg-bad-500 px-1 text-center text-[10px] font-extrabold leading-[18px] text-white ring-2 ring-white dark:ring-night-850">
                      {dueCount > 99 ? '99+' : dueCount}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] font-bold ${active ? 'text-brand-700 dark:text-brand-200' : 'text-slate-400 dark:text-slate-500'}`}>{t.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
