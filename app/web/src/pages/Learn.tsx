import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sigma, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { useMe } from '../lib/me';
import { useContentIndex, TOPIC_META } from '../lib/content';
import { ErrorState, ProgressBar, Section, Spinner } from '../components/ui';
import { PlanItemRow } from '../components/plan';
import { fmtMinutes } from '../lib/date';

export default function Learn() {
  const { me } = useMe();
  const index = useContentIndex(me?.contentVersion);
  const dash = useQuery({ queryKey: ['dashboard'], queryFn: () => api('/api/dashboard'), staleTime: 10_000 });
  const progress = useQuery({ queryKey: ['progress'], queryFn: () => api('/api/progress'), staleTime: 15_000 });

  if (index.isLoading) return <Spinner />;
  if (index.error || !index.data) return <ErrorState error={index.error} retry={() => index.refetch()} />;
  const lessons = progress.data?.lessons || {};
  const topicStats = new Map<string, any>((progress.data?.topics || []).map((t: any) => [t.id, t]));
  const todays = (dash.data?.todayItems || []).filter((i: any) => i.kind === 'lesson' || i.kind === 'testout');
  const remainingMin = todays.filter((i: any) => i.status !== 'done').reduce((a: number, b: any) => a + b.minutes, 0);

  return (
    <div className="mx-auto max-w-2xl px-4 safe-top">
      <header className="pb-1 pt-4">
        <div className="eyebrow">Curriculum 2027 · Level I</div>
        <h1 className="h1 mt-0.5">Learn</h1>
      </header>

      <Section title={`Today’s lessons${remainingMin ? ` · ${fmtMinutes(remainingMin)} left` : ''}`}>
        {todays.length ? (
          <div className="card divide-soft overflow-hidden">{todays.map((it: any) => <PlanItemRow key={it.id} item={it} />)}</div>
        ) : (
          <div className="card card-pad text-sm text-ink-mute dark:text-slate-400">No lessons scheduled today. Pick any topic below to get ahead.</div>
        )}
      </Section>

      <Link to="/formulas" className="card mt-4 flex items-center gap-3 p-4 active:scale-[0.99]">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"><Sigma className="h-6 w-6" /></div>
        <div className="flex-1">
          <div className="font-bold">Formula library</div>
          <div className="text-sm text-ink-mute dark:text-slate-400">Every formula in the curriculum, searchable</div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300 dark:text-night-500" />
      </Link>

      <Section title="Topics · exam weight">
        <div className="space-y-3">
          {index.data.topics.map((t) => {
            const meta = TOPIC_META[t.id];
            const all = t.modules.flatMap((m) => m.lessons);
            const done = all.filter((l) => lessons[l.id]).length;
            const stat = topicStats.get(t.id);
            return (
              <Link key={t.id} to={`/learn/${t.id}`} className="card block p-4 transition-transform active:scale-[0.99]">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${meta?.bg}`}>{meta?.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="truncate font-display text-[1.05rem] font-extrabold">{t.name}</div>
                      <div className="tnum shrink-0 text-xs font-bold text-ink-mute dark:text-slate-400">{t.weight[0]}–{t.weight[1]}%</div>
                    </div>
                    <div className="text-xs text-ink-mute dark:text-slate-400">{t.modules.length} modules · {all.length} lessons{stat ? ` · mastery ${Math.round(stat.mastery * 100)}%` : ''}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <ProgressBar value={done / Math.max(1, all.length)} height="h-2.5" tone={meta?.ring} />
                  <span className="tnum w-14 shrink-0 text-right text-xs font-extrabold">{done}/{all.length}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>
      <div className="h-4" />
    </div>
  );
}
