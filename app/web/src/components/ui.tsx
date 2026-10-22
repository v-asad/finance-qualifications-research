import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { useGoBack } from '../lib/nav';

export function Button({ variant = 'primary', size, block, loading, className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ok' | 'bad' | 'gold' | 'ghost' | 'quiet'; size?: 'sm'; block?: boolean; loading?: boolean;
}) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || loading}
      className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${block ? 'btn-block' : ''} ${className}`}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : children}
    </button>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-mute dark:text-slate-400" role="status">
      <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
      {label && <span className="text-sm font-semibold">{label}</span>}
    </div>
  );
}

export function ProgressBar({ value, className = '', tone = 'brand', height = 'h-3' }: { value: number; className?: string; tone?: 'brand' | 'ok' | 'gold' | 'sky' | string; height?: string }) {
  const color = tone === 'brand' ? 'bg-brand-500' : tone === 'ok' ? 'bg-ok-500' : tone === 'gold' ? 'bg-gold-400' : tone === 'sky' ? 'bg-sky-400' : tone;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div className={`${height} w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-night-600 ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)}>
      <div className={`relative h-full rounded-full ${color} transition-[width] duration-500 ease-out`} style={{ width: `${v * 100}%` }}>
        {v > 0.04 && <div className="absolute inset-x-2 top-[3px] h-[3px] rounded-full bg-white/30" />}
      </div>
    </div>
  );
}

export function Ring({ value, size = 72, stroke = 8, children, track = 'stroke-slate-200 dark:stroke-night-600', color = 'stroke-brand-500' }: {
  value: number; size?: number; stroke?: number; children?: ReactNode; track?: string; color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={track} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" className={`${color} transition-[stroke-dashoffset] duration-700 ease-out`}
          strokeDasharray={c} strokeDashoffset={c * (1 - v)} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** Page header with a back button that also works for cold deep links. */
export function TopBar({ title, back, right, sub, transparent }: { title?: ReactNode; back?: string; right?: ReactNode; sub?: ReactNode; transparent?: boolean }) {
  const goBack = useGoBack(back || '/');
  return (
    <header className={`sticky top-0 z-30 ${transparent ? '' : 'bg-[#F5F8FF]/90 backdrop-blur-xl dark:bg-night-850/90'} safe-top`}>
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-1 px-2">
        {back !== undefined ? (
          <button onClick={goBack} className="flex h-11 w-11 items-center justify-center rounded-full text-brand-700 active:bg-brand-100 dark:text-brand-300 dark:active:bg-night-700" aria-label="Back">
            <ChevronLeft className="h-7 w-7" />
          </button>
        ) : <div className="w-2" />}
        <div className="min-w-0 flex-1">
          {typeof title === 'string' ? <h1 className="truncate font-display text-lg font-extrabold">{title}</h1> : title}
          {sub && <div className="truncate text-xs font-semibold text-ink-mute dark:text-slate-400">{sub}</div>}
        </div>
        {right}
      </div>
    </header>
  );
}

/** Bottom sheet. Pair with useSheet() so Back closes it. */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fadeIn bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div ref={ref} tabIndex={-1} className="relative flex max-h-[88dvh] w-full max-w-xl animate-sheetIn flex-col rounded-t-[28px] bg-white shadow-pop outline-none dark:bg-night-800">
        <div className="flex items-center gap-2 px-5 pb-2 pt-3">
          <div className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-slate-200 dark:bg-night-600" />
          <div className="mt-3 min-w-0 flex-1 font-display text-lg font-extrabold">{title}</div>
          <button onClick={onClose} className="mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-ink-soft active:bg-slate-200 dark:bg-night-700 dark:text-slate-300" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-slate-100 px-5 pt-3 dark:border-night-700" style={{ paddingBottom: 'calc(var(--safe-bottom) + 14px)' }}>{footer}</div>}
        {!footer && <div style={{ height: 'calc(var(--safe-bottom) + 8px)' }} />}
      </div>
    </div>,
    document.body,
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-ok-500' : 'bg-slate-300 dark:bg-night-500'}`}>
      <span className={`absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
    </button>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-night-700">
      {options.map((o) => (
        <button key={String(o.value)} onClick={() => onChange(o.value)}
          className={`flex-1 rounded-xl px-2 py-2 text-sm font-bold transition-all ${value === o.value ? 'bg-white text-brand-700 shadow-sm dark:bg-night-500 dark:text-white' : 'text-ink-mute dark:text-slate-400'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({ value, onChange, min, max, step, format }: { value: number; onChange: (v: number) => void; min: number; max: number; step: number; format?: (v: number) => string }) {
  return (
    <div className="flex items-center gap-2">
      <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-brand-700 active:bg-slate-200 disabled:opacity-40 dark:bg-night-700 dark:text-brand-300"
        disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))} aria-label="Decrease">−</button>
      <span className="tnum min-w-[72px] text-center font-display text-base font-extrabold">{format ? format(value) : value}</span>
      <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-brand-700 active:bg-slate-200 disabled:opacity-40 dark:bg-night-700 dark:text-brand-300"
        disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))} aria-label="Increase">+</button>
    </div>
  );
}

export function Row({ icon, title, sub, right, onClick, chevron = true, danger }: { icon?: ReactNode; title: ReactNode; sub?: ReactNode; right?: ReactNode; onClick?: () => void; chevron?: boolean; danger?: boolean }) {
  const Comp: any = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} className={`list-row ${onClick ? '' : 'active:bg-transparent dark:active:bg-transparent'}`}>
      {icon && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-night-700 dark:text-brand-300">{icon}</div>}
      <div className="min-w-0 flex-1">
        <div className={`font-semibold ${danger ? 'text-bad-600 dark:text-bad-500' : ''}`}>{title}</div>
        {sub && <div className="text-sm text-ink-mute dark:text-slate-400">{sub}</div>}
      </div>
      {right}
      {onClick && chevron && <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 dark:text-night-500" />}
    </Comp>
  );
}

export function Section({ title, action, children, className = '' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`mt-6 ${className}`}>
      {(title || action) && (
        <div className="mb-2 flex items-end justify-between px-1">
          {title && <h2 className="eyebrow">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Empty({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      {icon && <div className="mb-3 text-brand-500">{icon}</div>}
      <div className="h3">{title}</div>
      {body && <p className="mt-1 max-w-xs text-sm text-ink-mute dark:text-slate-400">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <Empty
      title="Couldn’t load this"
      body={(error as Error)?.message || 'Something went wrong.'}
      action={retry && <Button variant="ghost" size="sm" onClick={retry}>Try again</Button>}
    />
  );
}
