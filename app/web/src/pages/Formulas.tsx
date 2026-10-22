import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useFormulas, TOPIC_META } from '../lib/content';
import { Markup, plain } from '../lib/markup';
import { ErrorState, Spinner, TopBar } from '../components/ui';

export default function Formulas() {
  const q = useFormulas();
  const [params, setParams] = useSearchParams();
  const topic = params.get('topic') || 'all';
  const [text, setText] = useState('');
  const term = useDeferredValue(text.trim().toLowerCase());

  const list = useMemo(() => {
    const all = q.data?.formulas || [];
    return all.filter((f: any) => (topic === 'all' || f.topicId === topic)
      && (!term || `${f.title} ${plain(f.formula)} ${(f.where || []).map((w: string[]) => w.join(' ')).join(' ')}`.toLowerCase().includes(term)));
  }, [q.data, topic, term]);

  return (
    <div className="mx-auto max-w-2xl">
      <TopBar back="/learn" title="Formula library" sub={q.data ? `${q.data.formulas.length} formulas` : undefined} />
      <div className="sticky top-[calc(var(--safe-top)+56px)] z-20 bg-[#F5F8FF]/95 px-4 pb-2 backdrop-blur-xl dark:bg-night-850/95">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input className="field pl-11 pr-11" placeholder="Search: duration, WACC, Sharpe…" value={text} onChange={(e) => setText(e.target.value)} type="search" enterKeyHint="search" />
          {text && <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400" onClick={() => setText('')} aria-label="Clear"><X className="h-5 w-5" /></button>}
        </div>
        <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4">
          {['all', ...Object.keys(TOPIC_META)].map((t) => (
            <button key={t} onClick={() => setParams(t === 'all' ? {} : { topic: t }, { replace: true })}
              className={`pill-tab shrink-0 ${topic === t ? 'bg-brand-600 text-white' : 'bg-white text-ink-soft shadow-card dark:bg-night-800 dark:text-slate-300'}`}>
              {t === 'all' ? 'All' : TOPIC_META[t].short}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2 px-4 pt-2">
        {q.isLoading && <Spinner />}
        {q.error && <ErrorState error={q.error} retry={() => q.refetch()} />}
        {list.map((f: any) => (
          <div key={f.id} className="card card-pad">
            <div className="flex items-start justify-between gap-2">
              <div className="font-bold">{f.title}</div>
              <Link to={`/learn/${f.topicId}/${f.moduleId}`} className={`chip shrink-0 ${TOPIC_META[f.topicId]?.bg} ${TOPIC_META[f.topicId]?.color}`}>{TOPIC_META[f.topicId]?.short}</Link>
            </div>
            <div className="mt-2 overflow-x-auto rounded-xl bg-brand-50 px-3 py-2.5 font-mono text-[0.95rem] font-semibold text-brand-900 dark:bg-night-700 dark:text-brand-100"><Markup text={f.formula} /></div>
            {f.where?.length > 0 && (
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                {f.where.map(([s, d]: string[]) => (<><dt key={`${s}-t`} className="font-mono font-bold text-ink-soft dark:text-slate-300"><Markup text={s} /></dt><dd key={`${s}-d`} className="text-ink-mute dark:text-slate-400">{d}</dd></>))}
              </dl>
            )}
            {f.note && <p className="mt-2 text-sm text-ink-mute dark:text-slate-400">{f.note}</p>}
          </div>
        ))}
        {q.data && !list.length && <p className="py-10 text-center text-sm text-ink-mute dark:text-slate-400">No formulas match “{text}”.</p>}
        <div className="h-6" />
      </div>
    </div>
  );
}
