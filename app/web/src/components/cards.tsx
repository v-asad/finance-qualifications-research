import { Lightbulb, AlertTriangle, GraduationCap, Calculator, Sigma, BookOpen, Columns2, PenLine } from 'lucide-react';
import type { Card } from '../lib/types';
import { Markup, Inline } from '../lib/markup';

const TIP_STYLE = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('acca')) return { box: 'bg-sky-100/80 dark:bg-sky-500/10', text: 'text-sky-500 dark:text-sky-300', icon: GraduationCap };
  if (t.includes('trap') || t.includes('mistake') || t.includes('careful')) return { box: 'bg-gold-300/30 dark:bg-gold-500/10', text: 'text-gold-600 dark:text-gold-300', icon: AlertTriangle };
  return { box: 'bg-violet-100/80 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-300', icon: Lightbulb };
};

export function CardView({ card }: { card: Card }) {
  switch (card.kind) {
    case 'concept':
      return (
        <article>
          <Kicker icon={BookOpen} label="Concept" />
          <h2 className="h2 mb-3">{card.title}</h2>
          <Markup text={card.body} className="text-[1.05rem] leading-relaxed" />
        </article>
      );
    case 'formula':
      return (
        <article>
          <Kicker icon={Sigma} label="Formula" />
          <h2 className="h2 mb-3">{card.title}</h2>
          <div className="overflow-x-auto rounded-3xl bg-brand-50 px-5 py-5 text-center font-mono text-[1.15rem] font-bold leading-relaxed text-brand-900 ring-1 ring-brand-100 dark:bg-night-700 dark:text-brand-100 dark:ring-night-600">
            <Inline text={card.formula} />
          </div>
          {card.where && card.where.length > 0 && (
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
              {card.where.map(([sym, desc], i) => (
                <div key={i} className="contents">
                  <dt className="font-mono font-bold text-brand-700 dark:text-brand-300"><Inline text={sym} /></dt>
                  <dd className="text-ink-soft dark:text-slate-300"><Inline text={desc} /></dd>
                </div>
              ))}
            </dl>
          )}
          {card.note && <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-ink-soft dark:bg-night-700 dark:text-slate-300"><Inline text={card.note} /></p>}
        </article>
      );
    case 'example':
      return (
        <article>
          <Kicker icon={PenLine} label="Worked example" />
          <h2 className="h2 mb-3">{card.title}</h2>
          <Markup text={card.body} className="text-[1.02rem] leading-relaxed" />
          {card.calc && <CalcBlock calc={card.calc} />}
        </article>
      );
    case 'compare':
      return (
        <article>
          <Kicker icon={Columns2} label="Compare" />
          <h2 className="h2 mb-3">{card.title}</h2>
          <div className="-mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[320px] border-separate border-spacing-0 overflow-hidden rounded-2xl text-[0.9rem] ring-1 ring-slate-200 dark:ring-night-600">
              <thead>
                <tr>
                  {card.rows[0].map((h, i) => (
                    <th key={i} className="bg-brand-600 px-3 py-2.5 text-left font-display font-extrabold text-white">{<Inline text={h} />}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {card.rows.slice(1).map((r, ri) => (
                  <tr key={ri} className={ri % 2 ? 'bg-slate-50 dark:bg-night-700/60' : 'bg-white dark:bg-night-800'}>
                    {r.map((c, ci) => (
                      <td key={ci} className={`border-t border-slate-100 px-3 py-2.5 align-top dark:border-night-600 ${ci === 0 ? 'font-bold' : ''}`}><Inline text={c} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      );
    case 'tip': {
      const s = TIP_STYLE(card.title);
      const Icon = s.icon;
      return (
        <article className={`rounded-3xl p-5 ${s.box}`}>
          <div className={`mb-2 flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-[0.08em] ${s.text}`}><Icon className="h-5 w-5" />{card.title}</div>
          <Markup text={card.body} className="text-[1.05rem] leading-relaxed" />
        </article>
      );
    }
    default:
      return null;
  }
}

function Kicker({ icon: Icon, label }: { icon: typeof BookOpen; label: string }) {
  return <div className="eyebrow mb-1.5 flex items-center gap-1.5 text-brand-600 dark:text-brand-300"><Icon className="h-3.5 w-3.5" />{label}</div>;
}

/** BA II Plus keystrokes, with [KEY] tokens rendered as calculator keys. */
export function CalcBlock({ calc, label = 'BA II Plus' }: { calc: string; label?: string }) {
  const parts = calc.split(/(\[[^\]]+\])/g).filter(Boolean);
  return (
    <div className="mt-4 rounded-2xl bg-ink p-4 text-white dark:bg-night-900">
      <div className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white/60"><Calculator className="h-3.5 w-3.5" />{label}</div>
      <div className="font-mono text-[0.9rem] leading-8">
        {parts.map((p, i) => p.startsWith('[')
          ? <kbd key={i} className="mx-0.5 inline-block rounded-md bg-white/15 px-1.5 py-0.5 text-[0.8rem] font-bold shadow-[0_2px_0_0_rgba(255,255,255,.15)]">{p.slice(1, -1)}</kbd>
          : <span key={i}>{p}</span>)}
      </div>
    </div>
  );
}
