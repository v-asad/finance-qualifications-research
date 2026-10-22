import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Crosshair, Info } from 'lucide-react';
import { api } from '../lib/api';
import type { Plan, PlanItem } from '../lib/types';
import { Button, ErrorState, ProgressBar, Sheet, Spinner } from '../components/ui';
import { KIND_META } from '../components/plan';
import { TOPIC_META } from '../lib/content';
import { useSheet } from '../lib/nav';
import { addDays, fmtDay, fmtMinutes, relDay } from '../lib/date';
import { itemRoute } from '../lib/routes';

const ZIGZAG = [0, 38, 64, 38, 0, -38, -64, -38];
const PHASE_LABEL: Record<string, { title: string; body: string }> = {
  learn: { title: 'Learn', body: 'Every learning module, with Ethics woven through.' },
  consolidate: { title: 'Consolidate', body: 'Topic checkpoints, weak-spot drills and Mock 1.' },
  final: { title: 'Final', body: 'Mock 2, ethics and formula sprints, final review.' },
};

type Period = { n: number; from: number; to: number; items: PlanItem[]; phase: string };

export default function Roadmap() {
  const q = useQuery({ queryKey: ['plan'], queryFn: () => api<{ plan: Plan | null; today: string }>('/api/plan'), staleTime: 15_000 });
  const node = useSheet('node');
  const legend = useSheet('legend');
  const navigate = useNavigate();
  const navType = useNavigationType();
  const currentRef = useRef<HTMLButtonElement | null>(null);
  const [currentVisible, setCurrentVisible] = useState(true);

  const plan = q.data?.plan;
  const current = useMemo(() => plan?.items.find((i) => i.status === 'overdue' || i.status === 'today') || plan?.items.find((i) => i.status === 'upcoming'), [plan]);

  const periods = useMemo<Period[]>(() => {
    if (!plan) return [];
    const out: Period[] = [];
    for (let d = 0; d < plan.days; d += 7) {
      const items = plan.items.filter((i) => i.day >= d && i.day < d + 7);
      out.push({ n: d / 7 + 1, from: d, to: Math.min(plan.days, d + 7) - 1, items, phase: items[0]?.phase || 'learn' });
    }
    return out;
  }, [plan]);

  // Jump to "today" on a fresh visit; keep the restored scroll position on back/forward.
  useEffect(() => {
    if (!plan || navType === 'POP') return;
    const t = setTimeout(() => currentRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' }), 50);
    return () => clearTimeout(t);
  }, [plan, navType]);

  useEffect(() => {
    const el = currentRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCurrentVisible(e.isIntersecting), { rootMargin: '-80px 0px -100px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [plan]);

  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  if (!plan) return <ErrorState error={new Error('No plan yet. Finish setup first.')} />;

  const selected = node.open ? plan.items.find((i) => String(i.id) === node.arg) : undefined;
  const done = plan.items.filter((i) => i.doneAt).length;
  let globalIdx = 0;
  let lastPhase = '';

  return (
    <div className="mx-auto max-w-2xl">
      <header className="sticky top-0 z-30 bg-[#F5F8FF]/90 px-4 pb-3 backdrop-blur-xl safe-top dark:bg-night-850/90">
        <div className="flex items-end justify-between pt-4">
          <div>
            <div className="eyebrow">{fmtDay(plan.start, { day: 'numeric', month: 'short' })} → {fmtDay(plan.end, { day: 'numeric', month: 'short' })} · exam {fmtDay(plan.examDate, { day: 'numeric', month: 'short' })}</div>
            <h1 className="h1 mt-0.5">Roadmap</h1>
          </div>
          <button onClick={() => legend.show()} className="flex h-10 w-10 items-center justify-center rounded-full text-brand-700 active:bg-brand-100 dark:text-brand-300 dark:active:bg-night-700" aria-label="Legend">
            <Info className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <ProgressBar value={done / Math.max(1, plan.items.length)} />
          <span className="tnum shrink-0 text-sm font-extrabold">{done}/{plan.items.length}</span>
        </div>
      </header>

      <div className="ledger-paper px-4 pb-10">
        {periods.map((p) => {
          const pDone = p.items.filter((i) => i.doneAt).length;
          const isCurrentPeriod = plan.todayIdx >= p.from && plan.todayIdx <= p.to;
          const phaseBanner = p.phase !== lastPhase ? p.phase : null;
          lastPhase = p.phase;
          let lastDay = -1;
          return (
            <section key={p.n} className="pt-6">
              {phaseBanner && (
                <div className="mb-4 rounded-3xl border-2 border-dashed border-brand-300/70 px-4 py-3 text-center dark:border-brand-700">
                  <div className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-brand-700 dark:text-brand-300">Phase · {PHASE_LABEL[phaseBanner].title}</div>
                  <div className="text-xs text-ink-mute dark:text-slate-400">{PHASE_LABEL[phaseBanner].body}</div>
                </div>
              )}
              <div className={`sticky top-[calc(var(--safe-top)+112px)] z-20 rounded-3xl p-4 shadow-card ${isCurrentPeriod ? 'bg-brand-600 text-white' : 'bg-white dark:bg-night-800'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className={`text-[0.7rem] font-bold uppercase tracking-[0.1em] ${isCurrentPeriod ? 'text-white/75' : 'text-ink-mute dark:text-slate-400'}`}>
                      Days {p.from + 1}–{p.to + 1} · {fmtDay(addDays(plan.start, p.from), { day: 'numeric', month: 'short' })} – {fmtDay(addDays(plan.start, p.to), { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="font-display text-lg font-extrabold">Period {p.n}</div>
                  </div>
                  <div className="text-right">
                    <div className="tnum font-display text-lg font-extrabold">{pDone}/{p.items.length}</div>
                    <div className={`text-[0.7rem] font-bold ${isCurrentPeriod ? 'text-white/75' : 'text-ink-mute dark:text-slate-400'}`}>{pDone === p.items.length && p.items.length ? 'closed ✓' : 'done'}</div>
                  </div>
                </div>
                <ProgressBar value={pDone / Math.max(1, p.items.length)} height="h-2" className={`mt-2 ${isCurrentPeriod ? '!bg-white/25' : ''}`} tone={isCurrentPeriod ? 'gold' : 'brand'} />
              </div>

              <div className="relative mt-4">
                {p.items.map((it) => {
                  const offset = ZIGZAG[globalIdx++ % ZIGZAG.length];
                  const showDay = it.day !== lastDay;
                  lastDay = it.day;
                  const isCurrent = current?.id === it.id;
                  return (
                    <div key={it.id}>
                      {showDay && (
                        <div className="flex items-center gap-2 pb-1 pl-10 pt-3">
                          <span className={`text-[0.72rem] font-extrabold uppercase tracking-[0.08em] ${it.day === plan.todayIdx ? 'text-gold-600 dark:text-gold-300' : 'text-ink-mute dark:text-slate-500'}`}>
                            Day {it.day + 1} · {relDay(it.date, q.data!.today)}
                          </span>
                        </div>
                      )}
                      <div className={`flex justify-center py-2 ${isCurrent ? 'pt-14' : ''}`} style={{ transform: `translateX(${offset}px)` }}>
                        <PathNode item={it} current={isCurrent} innerRef={isCurrent ? currentRef : undefined} onClick={() => node.show(String(it.id))} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-400 text-4xl shadow-[0_6px_0_0_theme(colors.gold.600)]">🏁</div>
          <div className="mt-3 font-display text-lg font-extrabold">Exam day</div>
          <div className="text-sm text-ink-mute dark:text-slate-400">{fmtDay(plan.examDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      {!currentVisible && current && (
        <button onClick={() => currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })}
          className="fixed right-4 z-30 flex animate-rise items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-pop active:scale-95"
          style={{ bottom: 'calc(var(--tabbar-h) + var(--safe-bottom) + 14px)' }}>
          <Crosshair className="h-4 w-4" /> Jump to today
        </button>
      )}

      <Sheet open={!!selected} onClose={node.hide} title={selected ? KIND_META[selected.kind].label : ''}
        footer={selected && (
          <Button block variant={selected.status === 'done' ? 'ghost' : 'primary'} onClick={() => navigate(itemRoute(selected), { replace: true })}>
            {selected.status === 'done' ? 'Do it again' : selected.status === 'upcoming' ? 'Start early' : 'Start'}
          </Button>
        )}>
        {selected && (
          <div className="pb-2">
            <div className="h2">{selected.title}</div>
            <div className="mt-1 text-sm text-ink-mute dark:text-slate-400">{selected.subtitle}</div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Fact k="Scheduled" v={relDay(selected.date, q.data!.today)} />
              <Fact k="Time" v={fmtMinutes(selected.minutes)} />
              <Fact k="Status" v={selected.status === 'done' ? (selected.result && selected.result !== 'done' ? selected.result : 'Done') : selected.status[0].toUpperCase() + selected.status.slice(1)} />
            </div>
            {selected.kind === 'testout' && <p className="mt-4 rounded-2xl bg-sky-100/70 p-3 text-sm dark:bg-sky-500/10">Your ACCA papers cover this. Score 4/5 to skip the lesson; otherwise it’s added to today.</p>}
            {selected.kind === 'mock' && <p className="mt-4 rounded-2xl bg-gold-300/30 p-3 text-sm dark:bg-gold-500/10">45 exam-style questions at 90 seconds each. Pause any time; the clock stops when you leave.</p>}
          </div>
        )}
      </Sheet>

      <Sheet open={legend.open} onClose={legend.hide} title="Reading the roadmap">
        <div className="space-y-3 pb-2 text-sm">
          {Object.entries(KIND_META).map(([k, m]) => {
            const Icon = m.icon;
            return (
              <div key={k} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${m.tint}`}><Icon className="h-5 w-5" /></div>
                <div className="font-semibold">{m.label}</div>
              </div>
            );
          })}
          <p className="pt-2 text-ink-mute dark:text-slate-400">Each week is a <b>Period</b>, closed off with a review, like a month-end close. Gold stamps are done; an amber ring means overdue. You can start anything early.</p>
        </div>
      </Sheet>
    </div>
  );
}

function PathNode({ item, current, innerRef, onClick }: { item: PlanItem; current: boolean; innerRef?: React.Ref<HTMLButtonElement>; onClick: () => void }) {
  const meta = KIND_META[item.kind];
  const Icon = item.status === 'done' ? Check : meta.icon;
  const topic = item.topicId ? TOPIC_META[item.topicId] : null;
  const big = item.kind === 'mock' || item.kind === 'checkpoint' || item.kind === 'period';
  const size = current ? 76 : big ? 68 : 60;
  const upcoming = item.status === 'upcoming' && !current;
  const color = item.status === 'done' ? 'bg-gold-400 text-ink' : upcoming ? 'bg-slate-200 text-slate-400 dark:bg-night-600 dark:text-night-500' : `${meta.tint} text-white`;
  const edge = item.status === 'done' ? '#D97706' : upcoming ? 'rgba(100,116,139,.35)' : 'rgba(11,27,63,.35)';
  return (
    <div className="flex w-[150px] flex-col items-center">
      <div className="relative">
        {current && <span className="absolute inset-0 animate-pulseRing rounded-full bg-brand-400" />}
        {current && (
          <div className="absolute -top-11 left-1/2 z-10 -translate-x-1/2 animate-bob whitespace-nowrap rounded-xl bg-white px-3 py-1.5 font-display text-sm font-extrabold uppercase tracking-wide text-brand-700 shadow-card ring-1 ring-brand-100 dark:bg-night-700 dark:text-brand-200 dark:ring-night-600">
            Start
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-[7px] border-t-[7px] border-x-transparent border-t-white dark:border-t-night-700" />
          </div>
        )}
        <button
          ref={innerRef}
          onClick={onClick}
          aria-label={`${item.title} · ${item.status}`}
          className={`relative flex items-center justify-center rounded-full transition-transform active:translate-y-1 ${color} ${item.status === 'overdue' ? 'ring-4 ring-gold-400 ring-offset-2 ring-offset-[#F5F8FF] dark:ring-offset-night-850' : ''}`}
          style={{ width: size, height: size, boxShadow: `0 6px 0 0 ${edge}` }}
        >
          <Icon className={upcoming ? 'h-6 w-6' : 'h-7 w-7'} strokeWidth={2.6} />
          {item.kind === 'testout' && item.status !== 'done' && <span className="absolute -right-1 -top-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-extrabold text-sky-500 shadow">ACCA</span>}
        </button>
      </div>
      <div className={`mt-3 line-clamp-2 text-center text-[0.78rem] font-bold leading-tight ${upcoming ? 'text-ink-mute dark:text-slate-500' : ''}`}>{item.title}</div>
      {topic && <div className={`mt-0.5 text-[0.68rem] font-bold ${topic.color}`}>{topic.short}</div>}
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-2.5 dark:bg-night-700">
      <div className="text-[11px] font-bold text-ink-mute dark:text-slate-400">{k}</div>
      <div className="mt-0.5 truncate text-sm font-extrabold">{v}</div>
    </div>
  );
}
