import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

type Toast = { id: number; text: string; tone: 'ok' | 'error' | 'info'; action?: { label: string; run: () => void } };
const Ctx = createContext<(t: Omit<Toast, 'id'> | string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const id = useRef(0);
  const push = useCallback((t: Omit<Toast, 'id'> | string) => {
    const toast: Toast = typeof t === 'string' ? { id: ++id.current, text: t, tone: 'info' } : { ...t, id: ++id.current };
    setToasts((xs) => [...xs.slice(-2), toast]);
    setTimeout(() => setToasts((xs) => xs.filter((x) => x.id !== toast.id)), toast.action ? 8000 : 3200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4" style={{ paddingTop: 'calc(var(--safe-top) + 10px)' }} aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto flex w-full max-w-md animate-rise items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-pop dark:bg-night-600">
              {t.tone === 'ok' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-ok-500" /> : t.tone === 'error' ? <AlertTriangle className="h-5 w-5 shrink-0 text-gold-400" /> : <Info className="h-5 w-5 shrink-0 text-sky-400" />}
              <span className="flex-1">{t.text}</span>
              {t.action && (
                <button className="rounded-lg px-2 py-1 font-bold text-sky-300 active:opacity-70" onClick={() => { t.action!.run(); setToasts((xs) => xs.filter((x) => x.id !== t.id)); }}>
                  {t.action.label}
                </button>
              )}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
