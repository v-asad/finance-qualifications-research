import { Link } from 'react-router-dom';
import { Snowflake } from 'lucide-react';
import { addDays, diffDays, fmtDay } from '../lib/date';
import { TOPIC_META } from '../lib/content';
import { ProgressBar } from './ui';

type Day = { day: string; xp: number; sessions: number; seconds: number; frozen: number };

/** GitHub-style activity grid over the plan window, Monday-first columns. */
export function Heatmap({ from, to, days, today }: { from: string; to: string; days: Day[]; today: string }) {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const startOffset = (new Date(`${from}T12:00:00Z`).getUTCDay() + 6) % 7;
  const gridStart = addDays(from, -startOffset);
  const total = diffDays(gridStart, to) + 1;
  const weeks = Math.ceil(total / 7);
  const level = (d?: Day) => {
    if (!d || !d.sessions) return 0;
    const m = d.seconds / 60;
    return m >= 60 ? 4 : m >= 30 ? 3 : m >= 10 ? 2 : 1;
  };
  const colors = ['bg-slate-200/70 dark:bg-night-600', 'bg-brand-200 dark:bg-brand-900', 'bg-brand-400 dark:bg-brand-700', 'bg-brand-600 dark:bg-brand-500', 'bg-brand-800 dark:bg-brand-300'];
  const studied = days.filter((d) => d.sessions > 0).length;
  return (
    <div>
      <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
        <div className="flex gap-[5px]">
          {Array.from({ length: weeks }, (_, w) => (
            <div key={w} className="flex flex-col gap-[5px]">
              {Array.from({ length: 7 }, (_, d) => {
                const date = addDays(gridStart, w * 7 + d);
                const inRange = date >= from && date <= to;
                const rec = byDay.get(date);
                const future = date > today;
                return (
                  <div
                    key={d}
                    title={inRange ? `${fmtDay(date)}${rec?.sessions ? ` · ${Math.round(rec.seconds / 60)} min` : ''}` : undefined}
                    className={`relative h-[15px] w-[15px] rounded-[4px] ${!inRange ? 'opacity-0' : rec?.frozen && !rec.sessions ? 'bg-sky-300/60 dark:bg-sky-500/30' : future ? 'bg-slate-100 dark:bg-night-700' : colors[level(rec)]} ${date === today ? 'ring-2 ring-gold-400 ring-offset-1 ring-offset-white dark:ring-offset-night-800' : ''}`}
                  >
                    {rec?.frozen && !rec.sessions ? <Snowflake className="absolute inset-0 m-auto h-2.5 w-2.5 text-sky-600" /> : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-ink-mute dark:text-slate-400">
        <span><b className="tnum text-ink dark:text-white">{studied}</b> study days so far</span>
        <span className="flex items-center gap-1">Less {colors.slice(1).map((c) => <span key={c} className={`h-2.5 w-2.5 rounded-[3px] ${c}`} />)} More</span>
      </div>
    </div>
  );
}

export type TopicStat = { id: string; name: string; weight: [number, number]; mastery: number; accuracy: number | null; seen: number; total: number };

export function TopicMastery({ topics }: { topics: TopicStat[] }) {
  return (
    <div className="divide-soft">
      {topics.map((t) => {
        const meta = TOPIC_META[t.id];
        return (
          <Link key={t.id} to={`/learn/${t.id}`} className="list-row py-2.5">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${meta?.bg}`}>{meta?.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[0.92rem] font-semibold">{t.name}</span>
                <span className="tnum shrink-0 text-xs font-bold text-ink-mute dark:text-slate-400">{t.weight[0]}–{t.weight[1]}%</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <ProgressBar value={t.mastery} height="h-2" tone={meta?.ring || 'brand'} />
                <span className="tnum w-10 shrink-0 text-right text-xs font-extrabold">{Math.round(t.mastery * 100)}%</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/** Minimal bar chart for the 7-day review forecast. */
export function MiniBars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-24 items-end gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <span className="tnum text-[11px] font-bold text-ink-mute dark:text-slate-400">{v || ''}</span>
          <div className="w-full rounded-t-lg bg-brand-500/80 dark:bg-brand-400/80" style={{ height: `${Math.max(4, (v / max) * 60)}px`, opacity: v ? 1 : 0.25 }} />
          <span className="text-[10px] font-semibold text-ink-mute dark:text-slate-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
