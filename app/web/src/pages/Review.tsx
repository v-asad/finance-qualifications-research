import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RotateCcw, XCircle, Target, Sigma, Scale, Timer, Trophy, Flag, AlertOctagon, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { useMe } from '../lib/me';
import { ErrorState, Section, Spinner } from '../components/ui';
import { MiniBars } from '../components/charts';
import { useContentIndex, TOPIC_META } from '../lib/content';
import { sessionRoute } from '../lib/routes';
import { pct } from '../lib/date';

export default function Review() {
  const { me } = useMe();
  const q = useQuery({ queryKey: ['review-summary'], queryFn: () => api('/api/review/summary'), staleTime: 10_000 });
  const index = useContentIndex(me?.contentVersion);
  if (q.isLoading) return <Spinner />;
  if (q.error || !q.data) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  const d = q.data;
  const due = d.counts.due || 0;
  const size = me!.user.settings.reviewSize;
  const forecast = Array.from({ length: 7 }, (_, i) => d.forecast.find((f: any) => f.d === i)?.n || 0);
  const dayLabels = Array.from({ length: 7 }, (_, i) => (i === 0 ? 'Today' : new Date(Date.now() + i * 86400000).toLocaleDateString('en-GB', { weekday: 'narrow' })));
  const partsDone = new Map<string, number>(d.mockParts.map((p: any) => [p.ref, p.accuracy]));
  const checkpoints = new Map<string, any>(d.mocks.filter((m: any) => m.kind === 'checkpoint').map((m: any) => [m.ref, m]));

  return (
    <div className="mx-auto max-w-2xl px-4 safe-top">
      <header className="pb-1 pt-4">
        <div className="eyebrow">Spaced repetition · mistakes · mocks</div>
        <h1 className="h1 mt-0.5">Review</h1>
      </header>

      <div className="relative mt-3 overflow-hidden rounded-[28px] bg-gradient-to-br from-teal-500 to-brand-700 p-5 text-white shadow-pop">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative">
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-white/75">Due now</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="tnum font-display text-5xl font-extrabold leading-none">{due}</span>
            <span className="font-semibold text-white/80">item{due === 1 ? '' : 's'}</span>
          </div>
          <div className="mt-1 text-sm text-white/80">{d.counts.dueQ || 0} questions · {d.counts.dueF || 0} flashcards · {d.counts.tomorrow || 0} more within 24h</div>
          {due > 0 ? (
            <Link to={sessionRoute('review')} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-display text-[1.05rem] font-extrabold text-brand-700 shadow-[0_4px_0_0_rgba(15,31,77,.35)] active:translate-y-1 active:shadow-none">
              <RotateCcw className="h-5 w-5" /> Review {Math.min(due, size)} now · ~{Math.max(3, Math.round(Math.min(due, size) * 0.5))} min
            </Link>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold">
              <CheckCircle2 className="h-5 w-5 text-gold-300" /> All caught up. Mistakes and new flashcards will appear here.
            </div>
          )}
        </div>
      </div>

      <Section title="Practice">
        <div className="grid grid-cols-2 gap-3">
          <Tile to={sessionRoute('practice', 'mistakes')} icon={<XCircle />} tint="bg-bad-500" title="Fix mistakes" sub={`${d.counts.wrong} open`} disabled={!d.counts.wrong} />
          <Tile to={sessionRoute('practice', 'weak')} icon={<Target />} tint="bg-gold-500" title="Weak spots" sub={d.weak[0] ? d.weak[0].title : 'after a few lessons'} disabled={!d.weak.length} />
          <Tile to={sessionRoute('practice', 'formulas')} icon={<Sigma />} tint="bg-violet-600" title="Formula sprint" sub="20 flashcards" />
          <Tile to={sessionRoute('practice', 'sprint:ethics')} icon={<Scale />} tint="bg-indigo-600" title="Ethics sprint" sub="15 scenarios" />
          <Tile to={sessionRoute('practice', 'mini:6')} icon={<Timer />} tint="bg-brand-600" title="Mini mock · 6" sub="~9 min, timed" />
          <Tile to={sessionRoute('practice', 'mini:15')} icon={<Timer />} tint="bg-brand-800" title="Mini mock · 15" sub="~22 min, timed" />
        </div>
      </Section>

      <Section title="Next 7 days">
        <div className="card card-pad">
          <MiniBars values={[due, ...forecast.slice(1)]} labels={dayLabels} />
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs dark:border-night-700">
            <div><div className="tnum font-display text-base font-extrabold">{d.counts.total || 0}</div><div className="font-semibold text-ink-mute dark:text-slate-400">in review loop</div></div>
            <div><div className="tnum font-display text-base font-extrabold">{d.counts.mature || 0}</div><div className="font-semibold text-ink-mute dark:text-slate-400">mature (7d+)</div></div>
            <div><div className="tnum font-display text-base font-extrabold">{d.counts.mistakes || 0}</div><div className="font-semibold text-ink-mute dark:text-slate-400">from mistakes</div></div>
          </div>
        </div>
      </Section>

      {d.weak.length > 0 && (
        <Section title="Weakest modules">
          <div className="card divide-soft overflow-hidden">
            {d.weak.map((w: any) => (
              <Link key={w.id} to={sessionRoute('practice', `module:${w.id}`)} className="list-row">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${TOPIC_META[w.topicId]?.bg}`}>{TOPIC_META[w.topicId]?.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{w.title}</div>
                  <div className="text-xs text-ink-mute dark:text-slate-400">accuracy {pct(w.accuracy)} · {w.seen}/{w.total} questions seen</div>
                </div>
                <span className="tnum text-sm font-extrabold text-bad-500">{Math.round(w.mastery * 100)}%</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="Mock exams · 180 questions each, in 4 parts">
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="card card-pad">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-400 text-ink"><Trophy className="h-6 w-6" /></div>
                <div className="flex-1">
                  <div className="font-display text-base font-extrabold">Mock exam {n}</div>
                  <div className="text-xs text-ink-mute dark:text-slate-400">Weighted like the real exam · 90 s per question</div>
                </div>
                {(() => { const m = d.mocks.find((x: any) => x.kind === 'full' && x.ref === String(n) && x.score !== null); return m ? <span className="tnum font-display text-lg font-extrabold text-ok-600">{pct(m.score)}</span> : null; })()}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((p) => {
                  const ref = `mock:${n}:${p}`;
                  const acc = partsDone.get(ref);
                  return (
                    <Link key={p} to={sessionRoute('mock', ref)} className={`rounded-2xl px-2 py-2.5 text-center active:scale-95 ${acc !== undefined ? 'bg-ok-50 text-ok-700 dark:bg-ok-500/10 dark:text-ok-500' : 'bg-slate-100 dark:bg-night-700'}`}>
                      <div className="text-[11px] font-bold opacity-70">Part {p}</div>
                      <div className="tnum text-sm font-extrabold">{acc !== undefined ? pct(acc) : 'Start'}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Topic checkpoints · 12 questions">
        <div className="card divide-soft overflow-hidden">
          {(index.data?.topics || []).map((t) => {
            const cp = checkpoints.get(`checkpoint:${t.id}`);
            return (
              <Link key={t.id} to={sessionRoute('checkpoint', `checkpoint:${t.id}`)} className="list-row">
                <Flag className={`h-5 w-5 shrink-0 ${cp ? 'text-ok-500' : 'text-slate-300 dark:text-night-500'}`} />
                <span className="flex-1 truncate font-semibold">{t.name}</span>
                {cp && <span className={`tnum text-sm font-extrabold ${cp.score >= 0.7 ? 'text-ok-600' : 'text-gold-600'}`}>{pct(cp.score)}</span>}
                <ChevronRight className="h-5 w-5 text-slate-300 dark:text-night-500" />
              </Link>
            );
          })}
        </div>
      </Section>

      {d.trouble.length > 0 && (
        <Section title="Trouble spots · missed 3+ times">
          <div className="card divide-soft overflow-hidden">
            {d.trouble.slice(0, 8).map((t: any) => (
              <div key={t.id} className="flex items-start gap-3 px-4 py-3">
                <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-bad-500" />
                <div className="min-w-0 flex-1 text-sm">{t.title.replace(/\*\*|\^\{|_\{|\}/g, '')}…</div>
                <span className="tnum shrink-0 text-xs font-bold text-bad-500">×{t.lapses}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
      <div className="h-4" />
    </div>
  );
}

function Tile({ to, icon, tint, title, sub, disabled }: { to: string; icon: React.ReactNode; tint: string; title: string; sub: string; disabled?: boolean }) {
  const inner = (
    <>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${tint} [&>svg]:h-5 [&>svg]:w-5`}>{icon}</div>
      <div className="mt-2 font-display font-extrabold">{title}</div>
      <div className="truncate text-xs text-ink-mute dark:text-slate-400">{sub}</div>
    </>
  );
  if (disabled) return <div className="card card-pad opacity-50">{inner}</div>;
  return <Link to={to} className="card card-pad block transition-transform active:scale-[0.97]">{inner}</Link>;
}
