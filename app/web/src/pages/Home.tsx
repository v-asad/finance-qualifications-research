import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Snowflake, Play, RotateCcw, CalendarClock, Gauge, BookCheck, Target, Trophy, ChevronRight, AlertTriangle, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';
import { useMe } from '../lib/me';
import { Button, ErrorState, ProgressBar, Ring, Section, Spinner } from '../components/ui';
import { PlanItemRow } from '../components/plan';
import { Heatmap, TopicMastery } from '../components/charts';
import { fmtDay, fmtMinutes, greeting, pct, relDay } from '../lib/date';
import { itemRoute, sessionRoute } from '../lib/routes';
import { useToast } from '../components/toast';

export default function Home() {
  const { me } = useMe();
  const q = useQuery({ queryKey: ['dashboard'], queryFn: () => api('/api/dashboard'), staleTime: 10_000 });
  if (q.isLoading) return <Spinner />;
  if (q.error || !q.data) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const d = q.data;

  return (
    <div className="mx-auto max-w-2xl px-4 safe-top">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 pb-1 pt-4">
        <div className="min-w-0">
          <div className="eyebrow">{fmtDay(d.today, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <h1 className="h1 mt-0.5 line-clamp-2">{greeting()}, {me!.user.displayName.split(' ')[0]}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-1">
          <div className={`chip text-sm ${d.streak.doneToday ? 'bg-gold-300/40 text-gold-600 dark:bg-gold-500/20 dark:text-gold-300' : 'bg-slate-200/70 text-ink-mute dark:bg-night-700 dark:text-slate-400'}`} title="Day streak">
            <Flame className={`h-4 w-4 ${d.streak.doneToday ? 'fill-gold-400 text-gold-500' : ''}`} />
            <span className="tnum">{d.streak.current}</span>
          </div>
          {d.streak.freezes > 0 && (
            <div className="chip bg-sky-300/30 text-sky-500 dark:bg-sky-500/15 dark:text-sky-300" title="Streak freezes">
              <Snowflake className="h-4 w-4" /><span className="tnum">{d.streak.freezes}</span>
            </div>
          )}
        </div>
      </header>

      <Hero d={d} />
      <Pace d={d} />

      {/* Today */}
      <Section title={d.pace?.phase === 'before' ? 'Before your plan starts' : 'Today’s plan'} action={<Link to="/roadmap" className="text-sm font-bold text-brand-700 dark:text-brand-300">Roadmap</Link>}>
        {d.todayItems.length ? (
          <div className="card divide-soft overflow-hidden">
            {d.todayItems.map((it: any) => <PlanItemRow key={it.id} item={it} />)}
          </div>
        ) : (
          <div className="card card-pad text-sm text-ink-mute dark:text-slate-400">
            {d.plan ? 'Nothing scheduled today. Reviews and mini-mocks keep you sharp.' : 'No plan yet.'}
          </div>
        )}
      </Section>

      {/* Stat tiles */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Tile to="/review" icon={<RotateCcw />} label="Reviews due" value={d.reviewsDue} sub={d.trouble ? `${d.trouble} trouble spots` : 'spaced repetition'} accent={d.reviewsDue > 0} />
        <Tile to="/review" icon={<Gauge />} label="Readiness" value={pct(d.readiness.score)} sub={d.readiness.lastMock !== null ? `last mock ${pct(d.readiness.lastMock)}` : 'estimate · aim 70%+'} />
        <Tile to="/learn" icon={<BookCheck />} label="Lessons" value={`${d.totals.lessonsDone}/${d.totals.lessonsTotal}`} sub={`${Math.round((d.totals.lessonsDone / Math.max(1, d.totals.lessonsTotal)) * 100)}% of curriculum`} />
        <Tile to="/review" icon={<Target />} label="Accuracy" value={pct(d.totals.accuracy)} sub={`${d.totals.answered} questions answered`} />
      </div>

      {/* Quests */}
      <Section title="Daily quests">
        <div className="card divide-soft">
          {d.quests.map((qq: any) => (
            <div key={qq.id} className="flex items-center gap-3 px-4 py-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${qq.done ? 'bg-ok-500 text-white' : 'bg-gold-300/40 text-gold-600 dark:bg-gold-500/15 dark:text-gold-300'}`}>
                {qq.done ? <CheckCircle2 className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[0.92rem] font-semibold">{qq.label}</span>
                  <span className="tnum shrink-0 text-xs font-bold text-ink-mute dark:text-slate-400">{qq.progress}/{qq.target}</span>
                </div>
                <ProgressBar value={qq.progress / qq.target} height="h-2" tone={qq.done ? 'ok' : 'gold'} className="mt-1.5" />
              </div>
              <span className="tnum shrink-0 text-xs font-extrabold text-gold-600 dark:text-gold-300">+{qq.xp} XP</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Topic mastery */}
      <Section title="Mastery by topic · exam weight" action={<Link to="/learn" className="text-sm font-bold text-brand-700 dark:text-brand-300">Library</Link>}>
        <div className="card overflow-hidden py-1">
          <TopicMastery topics={d.topics} />
        </div>
      </Section>

      {/* Activity */}
      {d.plan && (
        <Section title={`Activity · ${fmtDay(d.plan.start, { day: 'numeric', month: 'short' })} – ${fmtDay(d.plan.end || d.heatmap.to, { day: 'numeric', month: 'short' })}`}>
          <div className="card card-pad">
            <Heatmap from={d.heatmap.from} to={d.heatmap.to} days={d.heatmap.days} today={d.today} />
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center dark:border-night-700">
              <Mini label="Today" value={fmtMinutes(d.totals.todayMinutes)} />
              <Mini label="Total time" value={fmtMinutes(d.totals.minutes)} />
              <Mini label="Total XP" value={d.totals.xp.toLocaleString()} />
            </div>
          </div>
        </Section>
      )}

      {/* Milestones + tomorrow */}
      {(d.milestones.length > 0 || d.tomorrow.length > 0) && (
        <Section title="Coming up">
          <div className="card divide-soft overflow-hidden">
            {d.milestones.map((m: any) => (
              <Link key={m.id} to={itemRoute(m)} className="list-row">
                <CalendarClock className="h-5 w-5 shrink-0 text-brand-500" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{m.title}</div>
                  <div className="text-xs text-ink-mute dark:text-slate-400">{relDay(m.date, d.today)}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 dark:text-night-500" />
              </Link>
            ))}
            {d.tomorrow.length > 0 && (
              <div className="px-4 py-3 text-sm text-ink-mute dark:text-slate-400">
                <b className="text-ink dark:text-white">Tomorrow:</b> {d.tomorrow.length} item{d.tomorrow.length > 1 ? 's' : ''} · {fmtMinutes(d.tomorrow.reduce((a: number, b: any) => a + b.minutes, 0))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* League */}
      {d.league.rows.length > 1 && (
        <Section title={`League · week of ${fmtDay(d.league.from, { day: 'numeric', month: 'short' })}`}>
          <div className="card divide-soft overflow-hidden">
            {d.league.rows.map((r: any) => (
              <div key={r.id} className={`flex items-center gap-3 px-4 py-2.5 ${r.id === me!.user.id ? 'bg-brand-50 dark:bg-brand-500/10' : ''}`}>
                <span className={`tnum w-6 text-center font-display font-extrabold ${r.rank === 1 ? 'text-gold-500' : 'text-ink-mute dark:text-slate-400'}`}>{r.rank}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-display text-sm font-extrabold text-brand-700 dark:bg-night-600 dark:text-brand-200">{r.name.slice(0, 1).toUpperCase()}</div>
                <span className="flex-1 truncate font-semibold">{r.name}{r.id === me!.user.id ? ' (you)' : ''}</span>
                <span className="tnum text-sm font-extrabold">{r.xp} XP</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="h-4" />
    </div>
  );
}

function Hero({ d }: { d: any }) {
  const navigate = useNavigate();
  const n = d.next;
  let title = 'Mini mock';
  let sub = '6 exam-style questions · ~9 min';
  let to = sessionRoute('practice', 'mini:6');
  let icon = <Play className="h-5 w-5 fill-current" />;
  if (n.type === 'resume') {
    title = `Resume: ${n.session.title || 'session'}`;
    sub = `${n.session.progress}/${n.session.total} done · picks up where you left off`;
    to = `${sessionRoute(n.session.kind, n.session.ref)}?sid=${n.session.id}`;
  } else if (n.type === 'review') {
    title = `Review ${n.due} item${n.due === 1 ? '' : 's'}`;
    sub = `~${Math.max(3, Math.round(Math.min(n.due, 15) * 0.5))} min · locks in what you learned`;
    to = sessionRoute('review');
    icon = <RotateCcw className="h-5 w-5" />;
  } else if (n.type === 'plan' || n.type === 'ahead') {
    title = n.item.title;
    sub = `${n.type === 'ahead' ? 'Get ahead · ' : ''}${n.item.kind === 'testout' ? 'ACCA test-out · ' : ''}${fmtMinutes(n.item.minutes)}`;
    to = itemRoute(n.item);
  }
  const ringValue = d.ring.total ? d.ring.done / d.ring.total : d.streak.doneToday ? 1 : 0;

  return (
    <div className="relative mt-3 overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-5 text-white shadow-pop">
      <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-16 right-16 h-40 w-40 rounded-full bg-sky-300/10" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-white/70">
            {d.pace ? (d.pace.phase === 'before' ? `Plan starts ${fmtDay(d.plan.start)}` : d.pace.phase === 'maintenance' ? 'Maintenance mode' : `Day ${d.pace.dayNumber} of ${d.pace.days} · ${d.pace.phase}`) : 'No plan'}
          </div>
          <div className="mt-1 font-display text-[2.1rem] font-extrabold leading-none">
            <span className="tnum">{d.daysToExam}</span>
            <span className="ml-1.5 text-base font-bold text-white/80">days to Level I</span>
          </div>
          <div className="mt-1 text-xs font-semibold text-white/70">{fmtDay(d.examDate, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
        <Ring value={ringValue} size={68} stroke={7} track="stroke-white/20" color="stroke-gold-400">
          <div className="text-center leading-none">
            <div className="tnum font-display text-base font-extrabold">{d.ring.done}/{d.ring.total || 0}</div>
            <div className="text-[9px] font-bold uppercase tracking-wide text-white/70">today</div>
          </div>
        </Ring>
      </div>

      <button onClick={() => navigate(to)} className="relative mt-5 flex w-full items-center gap-3 rounded-2xl bg-white p-3 pr-4 text-left text-ink shadow-[0_4px_0_0_rgba(15,31,77,0.35)] transition-transform active:translate-y-1 active:shadow-none">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-brand-600">{n.type === 'resume' ? 'Resume' : 'Continue'}</div>
          <div className="truncate font-display text-[1.05rem] font-extrabold">{title}</div>
          <div className="truncate text-xs font-semibold text-ink-mute">{sub}</div>
        </div>
        <ChevronRight className="h-6 w-6 shrink-0 text-brand-500" />
      </button>
      {d.ring.allDone && (
        <div className="relative mt-3 flex items-center gap-2 text-sm font-semibold text-white/90">
          <Sparkles className="h-4 w-4 text-gold-300" /> Today’s plan is done. Anything more is a bonus.
        </div>
      )}
    </div>
  );
}

function Pace({ d }: { d: any }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (!d.pace || d.pace.phase === 'before') return null;
  const replan = async () => {
    setBusy(true);
    try {
      await api('/api/plan/replan', { body: {} });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      await qc.invalidateQueries({ queryKey: ['plan'] });
      toast({ text: 'Plan rebalanced from today', tone: 'ok' });
    } catch (e) {
      toast({ text: (e as Error).message, tone: 'error' });
    } finally { setBusy(false); }
  };
  if (d.pace.behind > 0) {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-3xl bg-gold-300/30 p-4 dark:bg-gold-500/10">
        <AlertTriangle className="h-6 w-6 shrink-0 text-gold-600 dark:text-gold-300" />
        <div className="min-w-0 flex-1 text-sm">
          <div className="font-bold">{d.pace.behind} item{d.pace.behind > 1 ? 's' : ''} behind · {fmtMinutes(d.pace.behindMinutes)}</div>
          <div className="text-ink-soft dark:text-slate-300">{d.pace.suggestReplan ? 'Spread them over the remaining days?' : 'They’re at the top of today’s list.'}</div>
        </div>
        {d.pace.suggestReplan && <Button size="sm" variant="gold" loading={busy} onClick={replan}>Re-plan</Button>}
      </div>
    );
  }
  if (d.pace.ahead > 0) {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-3xl bg-ok-50 p-4 text-sm dark:bg-ok-500/10">
        <Trophy className="h-6 w-6 shrink-0 text-ok-600 dark:text-ok-500" />
        <div><b>{d.pace.ahead} item{d.pace.ahead > 1 ? 's' : ''} ahead of plan.</b> <span className="text-ink-soft dark:text-slate-300">Nice buffer for exam week.</span></div>
      </div>
    );
  }
  return null;
}

function Tile({ to, icon, label, value, sub, accent }: { to: string; icon: React.ReactNode; label: string; value: React.ReactNode; sub: string; accent?: boolean }) {
  return (
    <Link to={to} className="card card-pad block transition-transform active:scale-[0.98]">
      <div className={`flex items-center gap-1.5 text-xs font-bold ${accent ? 'text-bad-500' : 'text-ink-mute dark:text-slate-400'} [&>svg]:h-4 [&>svg]:w-4`}>{icon}{label}</div>
      <div className="tnum mt-1 font-display text-[1.6rem] font-extrabold leading-tight">{value}</div>
      <div className="truncate text-xs text-ink-mute dark:text-slate-400">{sub}</div>
    </Link>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="tnum font-display text-base font-extrabold">{value}</div>
      <div className="text-[11px] font-semibold text-ink-mute dark:text-slate-400">{label}</div>
    </div>
  );
}
