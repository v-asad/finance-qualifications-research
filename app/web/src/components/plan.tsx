import { Link } from 'react-router-dom';
import { BookOpen, FastForward, Flag, Trophy, Stamp, Target, Zap, RotateCcw, Check, Clock, type LucideIcon } from 'lucide-react';
import type { PlanItem } from '../lib/types';
import { itemRoute } from '../lib/routes';
import { TOPIC_META } from '../lib/content';
import { fmtMinutes } from '../lib/date';

export const KIND_META: Record<PlanItem['kind'], { icon: LucideIcon; label: string; tint: string }> = {
  lesson: { icon: BookOpen, label: 'Lesson', tint: 'bg-brand-600' },
  testout: { icon: FastForward, label: 'ACCA test-out', tint: 'bg-sky-500' },
  checkpoint: { icon: Flag, label: 'Checkpoint', tint: 'bg-indigo-600' },
  mock: { icon: Trophy, label: 'Mock exam', tint: 'bg-gold-500' },
  period: { icon: Stamp, label: 'Period close', tint: 'bg-brand-800' },
  drill: { icon: Target, label: 'Drill', tint: 'bg-bad-500' },
  sprint: { icon: Zap, label: 'Sprint', tint: 'bg-violet-600' },
  review: { icon: RotateCcw, label: 'Review', tint: 'bg-teal-600' },
};

export function KindBadge({ item, size = 40 }: { item: Pick<PlanItem, 'kind' | 'status'>; size?: number }) {
  const meta = KIND_META[item.kind];
  const Icon = item.status === 'done' ? Check : meta.icon;
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-2xl text-white ${item.status === 'done' ? 'bg-ok-500' : meta.tint}`} style={{ width: size, height: size }}>
      <Icon className="h-[46%] w-[46%]" strokeWidth={2.6} />
    </div>
  );
}

export function PlanItemRow({ item, compact }: { item: PlanItem; compact?: boolean }) {
  const done = item.status === 'done';
  const topic = item.topicId ? TOPIC_META[item.topicId] : null;
  return (
    <Link to={itemRoute(item)} className={`list-row ${done ? 'opacity-70' : ''}`}>
      <KindBadge item={item} />
      <div className="min-w-0 flex-1">
        <div className={`truncate font-semibold ${done ? 'line-through decoration-slate-300 dark:decoration-night-500' : ''}`}>{item.title}</div>
        {!compact && (
          <div className="flex items-center gap-1.5 truncate text-[0.8rem] text-ink-mute dark:text-slate-400">
            {topic && <span className={`font-bold ${topic.color}`}>{topic.short}</span>}
            {topic && <span>·</span>}
            <span className="truncate">{item.kind === 'testout' ? 'Skip it if you know it · 5 questions' : item.subtitle.replace(/^[^·]+·\s*/, topic ? '' : '$&')}</span>
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {item.status === 'overdue' && <span className="chip bg-gold-300/40 text-gold-600 dark:bg-gold-500/15 dark:text-gold-300">Overdue</span>}
        {done && item.result && item.result !== 'done' && <span className="chip bg-ok-50 text-ok-600 dark:bg-ok-500/15 dark:text-ok-500">{item.result}</span>}
        {!done && <span className="tnum flex items-center gap-1 text-xs font-semibold text-ink-mute dark:text-slate-400"><Clock className="h-3.5 w-3.5" />{fmtMinutes(item.minutes)}</span>}
      </div>
    </Link>
  );
}
