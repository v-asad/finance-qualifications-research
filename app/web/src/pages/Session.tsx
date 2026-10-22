import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBlocker, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import { X, ChevronLeft, ChevronRight, Flag, Grid3x3, Clock, Check, XCircle, CheckCircle2, Flame, Zap, Target, Timer, RotateCcw, FastForward, Trophy, Sparkles, Snowflake, WifiOff } from 'lucide-react';
import { api, ApiError, flushOutbox, queueAnswer, uuid } from '../lib/api';
import { useMe } from '../lib/me';
import { useTopicsFor, type Lookup } from '../lib/content';
import type { StudySession, Card, Question } from '../lib/types';
import { Button, ProgressBar, Sheet, Spinner, Empty } from '../components/ui';
import { CardView, CalcBlock } from '../components/cards';
import { Markup } from '../lib/markup';
import { sounds } from '../lib/sound';
import { canGoBack, useSheet } from '../lib/nav';
import { fmtDuration, pct } from '../lib/date';
import { itemRoute, sessionRoute } from '../lib/routes';
import { useToast } from '../components/toast';

const EXAM_KINDS = new Set(['checkpoint', 'mock']);
const isExamMode = (s: StudySession) => EXAM_KINDS.has(s.kind) || !!s.meta?.timed;

// ---------------------------------------------------------------- loader

export default function SessionPage() {
  const { kind = '', ref } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { me } = useMe();
  const [session, setSession] = useState<StudySession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loading = useRef(false);
  const sid: string | undefined = (location.state as any)?.sid || new URLSearchParams(location.search).get('sid') || undefined;

  useEffect(() => {
    if (session && (!sid || session.id === sid) && session.kind === kind) return;
    if (loading.current) return;
    loading.current = true;
    setError(null);
    (async () => {
      try {
        let s: StudySession | null = null;
        if (sid) {
          try { s = (await api<{ session: StudySession }>(`/api/sessions/${sid}`)).session; } catch (e) {
            if (!(e instanceof ApiError && e.status === 404)) throw e;
          }
        }
        if (!s) s = (await api<{ session: StudySession }>('/api/sessions', { body: { id: uuid(), kind, ref: ref ?? null } })).session;
        setSession(s);
        // Remember the session id in this history entry so back/forward/refresh return to the same session.
        if ((location.state as any)?.sid !== s.id || location.search.includes('sid=')) {
          const params = new URLSearchParams(location.search);
          params.delete('sid');
          const qs = params.toString();
          navigate({ pathname: location.pathname, search: qs ? `?${qs}` : '' }, { replace: true, state: { ...(location.state as object), sid: s.id } });
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        loading.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, ref, sid]);

  const ids = useMemo(() => {
    if (!session) return [];
    const list = session.items.map((i) => i.id);
    if (session.kind === 'lesson' && session.ref) list.push(session.ref);
    return list;
  }, [session]);
  const content = useTopicsFor(ids, me?.contentVersion);

  if (error) return <SessionError message={error} />;
  if (!session || content.loading) return <div className="min-h-[100dvh]"><Spinner label="Opening session…" /></div>;
  if (content.error) return <SessionError message={content.error.message} />;
  return <Player key={session.id} session={session} lookup={content.lookup} />;
}

function SessionError({ message }: { message: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 safe-top">
      <Empty icon={<WifiOff className="h-10 w-10" />} title="Can’t start this session" body={message}
        action={<Button variant="ghost" onClick={() => (canGoBack() ? navigate(-1) : navigate('/', { replace: true }))}>Go back</Button>} />
    </div>
  );
}

// ---------------------------------------------------------------- player

type Step =
  | { type: 'card'; card: Card; key: string }
  | { type: 'q'; id: string; key: string; redo?: boolean }
  | { type: 'f'; id: string; key: string };

type PState = {
  step: number;
  answers: Record<string, { chosen?: number; correct: boolean; grade?: string }>;
  redo: string[];
  chosen: number | null;
  checked: boolean;
  revealed: boolean;
  elapsed: number;
  exam: Record<string, number>;
  flagged: string[];
  answered: number;
  streak: number;
};

const blank = (): PState => ({ step: 0, answers: {}, redo: [], chosen: null, checked: false, revealed: false, elapsed: 0, exam: {}, flagged: [], answered: 0, streak: 0 });

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Display order of options for a question: stable per session so resuming shows the same order. */
function optionOrder(sessionId: string, q: Question, shuffle: boolean) {
  const idx = q.options.map((_, i) => i);
  if (!shuffle) return idx;
  let x = hash(sessionId + q.id) || 1;
  for (let i = idx.length - 1; i > 0; i--) {
    x = Math.imul(x ^ (x >>> 13), 1597334677) >>> 0;
    const j = x % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

function Player({ session, lookup }: { session: StudySession; lookup: Lookup }) {
  const { me } = useMe();
  const settings = me!.user.settings;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const exam = isExamMode(session);
  const allowRedo = !exam && session.kind !== 'testout';
  const storeKey = `ledger.session.${session.id}`;

  const [st, setSt] = useState<PState>(() => {
    const server = session.state && Object.keys(session.state).length ? session.state : null;
    let local: PState | null = null;
    try { local = JSON.parse(localStorage.getItem(storeKey) || 'null'); } catch { local = null; }
    const best = [local, server].filter(Boolean).sort((a: any, b: any) => (b.answered ?? 0) - (a.answered ?? 0) || (b.step ?? 0) - (a.step ?? 0))[0];
    return { ...blank(), ...(best || {}), chosen: best?.checked ? best.chosen : null } as PState;
  });
  const [summary, setSummary] = useState<any>(session.summary);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [quitOpen, setQuitOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const leaving = useRef(false);
  const nav = useSheet('navigator');

  // ---- steps ----
  const steps = useMemo<Step[]>(() => {
    const out: Step[] = [];
    if (session.kind === 'lesson' && session.ref) {
      const lesson = lookup.lesson(session.ref);
      lesson?.cards.forEach((card, i) => out.push({ type: 'card', card, key: `c${i}` }));
    }
    for (const it of session.items) {
      if (it.type === 'q' && lookup.question(it.id)) out.push({ type: 'q', id: it.id, key: it.id });
      if (it.type === 'f' && lookup.flashcard(it.id)) out.push({ type: 'f', id: it.id, key: it.id });
    }
    if (!exam) st.redo.forEach((id, i) => out.push({ type: 'q', id, key: `redo-${i}-${id}`, redo: true }));
    return out;
  }, [session, lookup, exam, st.redo]);

  const baseCount = steps.filter((s) => !(s.type === 'q' && s.redo)).length;
  const questionSteps = steps.filter((s) => s.type !== 'card');
  const step = steps[Math.min(st.step, steps.length - 1)];
  const finished = !!summary;
  const inProgress = !finished && (st.step > 0 || st.answered > 0 || Object.keys(st.exam).length > 0);

  // ---- persistence ----
  const saveTimer = useRef<number | undefined>(undefined);
  const latest = useRef(st);
  latest.current = st;
  useEffect(() => {
    if (finished) return;
    try { localStorage.setItem(storeKey, JSON.stringify(st)); } catch { /* full */ }
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      api(`/api/sessions/${session.id}/state`, { method: 'PUT', body: { state: latest.current } }).catch(() => {});
    }, 1200);
  }, [st, finished, session.id, storeKey]);
  useEffect(() => {
    const flush = () => {
      if (finished) return;
      fetch(`/api/sessions/${session.id}/state`, { method: 'PUT', keepalive: true, credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ state: latest.current }) }).catch(() => {});
    };
    window.addEventListener('pagehide', flush);
    return () => { window.removeEventListener('pagehide', flush); flush(); };
  }, [finished, session.id]);

  // ---- clock: only counts while the app is visible ----
  useEffect(() => {
    if (finished) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') setSt((s) => ({ ...s, elapsed: s.elapsed + 1000 }));
    }, 1000);
    return () => window.clearInterval(t);
  }, [finished]);
  const stepStart = useRef(Date.now());
  useEffect(() => { stepStart.current = Date.now(); }, [st.step]);

  const timeLimit = exam ? questionSteps.length * (session.meta?.secondsPerItem || 90) * 1000 : 0;
  const remaining = timeLimit ? Math.max(0, timeLimit - st.elapsed) : 0;

  // ---- leaving: back button / swipe / X ----
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !leaving.current && inProgress && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => { if (blocker.state === 'blocked') setQuitOpen(true); }, [blocker.state]);

  const leave = useCallback(() => {
    leaving.current = true;
    setQuitOpen(false);
    if (blocker.state === 'blocked') blocker.proceed();
    else if (canGoBack()) navigate(-1);
    else navigate('/', { replace: true });
  }, [blocker, navigate]);

  const stay = () => {
    setQuitOpen(false);
    if (blocker.state === 'blocked') blocker.reset();
  };

  // ---- finishing ----
  const finish = useCallback(async (state: PState) => {
    setFinishing(true);
    setFinishError(null);
    try {
      if (exam) {
        // Exam-mode answers are revealed (and recorded) only on submit.
        for (const s of questionSteps) {
          if (s.type !== 'q') continue;
          const q = lookup.question(s.id)!;
          const chosen = state.exam[s.id];
          queueAnswer({ id: `${session.id}-${s.id}`.slice(0, 64), sessionId: session.id, itemId: s.id, type: 'q', correct: chosen === q.answer, chosen: chosen ?? -1 });
        }
      }
      await api(`/api/sessions/${session.id}/state`, { method: 'PUT', body: { state } }).catch(() => {});
      const ok = await flushOutbox();
      if (!ok) throw new ApiError(0, 'You appear to be offline. Your answers are saved; finish when you reconnect.');
      const res = await api<{ summary: any }>(`/api/sessions/${session.id}/complete`, { body: { seconds: Math.round(state.elapsed / 1000) } });
      localStorage.removeItem(storeKey);
      setSummary(res.summary);
      leaving.current = true;
      navigate('.', { replace: true, state: { sid: session.id, done: true } });
      void qc.invalidateQueries();
      sounds.complete();
      if (!settings.reduceMotion && (res.summary.accuracy >= 0.8 || res.summary.passed)) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.3 }, colors: ['#2463EB', '#38BDF8', '#FBBF24', '#16A34A'], disableForReducedMotion: true });
      }
    } catch (e) {
      setFinishError((e as Error).message);
    } finally {
      setFinishing(false);
    }
  }, [exam, questionSteps, lookup, session.id, storeKey, navigate, qc, settings.reduceMotion]);

  // Auto-submit when the exam clock runs out.
  const autoSubmitted = useRef(false);
  useEffect(() => {
    if (exam && timeLimit && remaining <= 0 && !finished && !finishing && !autoSubmitted.current) {
      autoSubmitted.current = true;
      toast({ text: 'Time’s up. Submitting your answers.', tone: 'info' });
      void finish(latest.current);
    }
  }, [exam, timeLimit, remaining, finished, finishing, finish, toast]);

  // ---- actions (learn mode) ----
  const goTo = useCallback((next: PState) => {
    latest.current = next;
    setSt(next);
    window.scrollTo({ top: 0 });
    if (next.step >= steps.length) void finish(next);
  }, [steps.length, finish]);

  const advance = useCallback(() => {
    const s = latest.current;
    goTo({ ...s, step: s.step + 1, chosen: null, checked: false, revealed: false });
  }, [goTo]);

  const check = useCallback(() => {
    if (!step || step.type !== 'q' || st.chosen === null) return;
    const q = lookup.question(step.id)!;
    const correct = st.chosen === q.answer;
    const ms = Date.now() - stepStart.current;
    queueAnswer({ id: uuid(), sessionId: session.id, itemId: q.id, type: 'q', correct, chosen: st.chosen, ms });
    if (correct) sounds.correct(); else sounds.wrong();
    setSt((s) => {
      const first = !s.answers[q.id];
      const answers = first ? { ...s.answers, [q.id]: { chosen: s.chosen!, correct } } : s.answers;
      const redo = !correct && allowRedo && !step.redo && !s.redo.includes(q.id) ? [...s.redo, q.id] : s.redo;
      return { ...s, answers, redo, checked: true, answered: s.answered + (first ? 1 : 0), streak: correct ? s.streak + 1 : 0 };
    });
  }, [step, st.chosen, lookup, session.id, allowRedo]);

  const gradeCard = useCallback((grade: 'again' | 'good' | 'easy') => {
    if (!step || step.type !== 'f') return;
    queueAnswer({ id: uuid(), sessionId: session.id, itemId: step.id, type: 'f', grade, ms: Date.now() - stepStart.current });
    if (grade === 'again') sounds.wrong(); else sounds.correct();
    const s = latest.current;
    goTo({ ...s, answers: { ...s.answers, [step.id]: { correct: grade !== 'again', grade } }, answered: s.answered + 1, step: s.step + 1, chosen: null, checked: false, revealed: false });
  }, [step, session.id, goTo]);

  // ---- keyboard (desktop / iPad keyboards) ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished || quitOpen || submitOpen || nav.open) return;
      if (!step) return;
      const k = e.key.toLowerCase();
      if (step.type === 'q') {
        const order = optionOrder(session.id, lookup.question(step.id)!, settings.shuffleOptions);
        const pick = ['1', '2', '3'].indexOf(k) >= 0 ? ['1', '2', '3'].indexOf(k) : ['a', 'b', 'c'].indexOf(k);
        if (pick >= 0 && pick < order.length) {
          if (exam) setSt((s) => ({ ...s, exam: { ...s.exam, [step.id]: order[pick] } }));
          else if (!st.checked) setSt((s) => ({ ...s, chosen: order[pick] }));
        }
        if (k === 'enter') { if (exam) return; if (st.checked) advance(); else check(); }
      } else if (step.type === 'card' && (k === 'enter' || k === 'arrowright')) advance();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finished, quitOpen, submitOpen, nav.open, step, st.checked, exam, advance, check, session.id, lookup, settings.shuffleOptions]);

  // ---------------------------------------------------------------- render

  if (finished) return <Results session={session} summary={summary} lookup={lookup} state={st} exam={exam} />;
  if (!steps.length) return <SessionError message="This session has no content yet." />;

  const progress = exam ? Object.keys(st.exam).length / Math.max(1, questionSteps.length) : Math.min(st.step, baseCount) / Math.max(1, baseCount);
  const onX = () => (inProgress ? setQuitOpen(true) : leave());

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-night-850">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl safe-top dark:bg-night-850/95">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-3">
          <button onClick={onX} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-400 active:bg-slate-100 dark:active:bg-night-700" aria-label="Close session">
            <X className="h-7 w-7" strokeWidth={2.4} />
          </button>
          <ProgressBar value={progress} height="h-4" tone={st.streak >= 3 ? 'gold' : 'ok'} />
          {exam ? (
            settings.showTimer && <div className={`tnum flex shrink-0 items-center gap-1 rounded-xl px-2 py-1 text-sm font-extrabold ${remaining < 60000 ? 'bg-bad-50 text-bad-600 dark:bg-bad-500/15' : 'text-ink-soft dark:text-slate-300'}`}><Clock className="h-4 w-4" />{fmtDuration(remaining / 1000)}</div>
          ) : (
            st.streak >= 3 && <div className="flex shrink-0 animate-pop items-center gap-1 text-sm font-extrabold text-gold-500"><Flame className="h-4 w-4 fill-gold-400" />{st.streak}</div>
          )}
        </div>
        {session.meta?.title && <div className="mx-auto max-w-2xl truncate px-5 pb-1 text-xs font-bold text-ink-mute dark:text-slate-400">{session.meta.title}{step?.type === 'q' && step.redo ? ' · Second try' : ''}</div>}
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 pb-48 pt-4">
        {exam ? (
          <ExamView session={session} steps={questionSteps as any} st={st} setSt={setSt} lookup={lookup} shuffle={settings.shuffleOptions} />
        ) : step?.type === 'card' ? (
          <SwipeArea onNext={advance} onPrev={() => st.step > 0 && steps[st.step - 1]?.type === 'card' && setSt((s) => ({ ...s, step: s.step - 1 }))}>
            <div key={step.key} className="animate-rise"><CardView card={step.card} /></div>
          </SwipeArea>
        ) : step?.type === 'q' ? (
          <QuestionView key={step.key} q={lookup.question(step.id)!} order={optionOrder(session.id, lookup.question(step.id)!, settings.shuffleOptions)}
            chosen={st.chosen} checked={st.checked} onChoose={(i) => !st.checked && setSt((s) => ({ ...s, chosen: i }))} redo={step.redo} />
        ) : step?.type === 'f' ? (
          <FlashcardView key={step.key} card={lookup.flashcard(step.id)!} revealed={st.revealed} />
        ) : null}
      </div>

      {/* Bottom action area */}
      {exam ? (
        <ExamBar st={st} setSt={setSt} steps={questionSteps as any} onNavigator={() => nav.show()} onSubmit={() => setSubmitOpen(true)} />
      ) : step?.type === 'q' && st.checked ? (
        <Feedback q={lookup.question(step.id)!} correct={st.chosen === lookup.question(step.id)!.answer} onContinue={advance} finishing={finishing} />
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-slate-100 bg-white dark:border-night-700 dark:bg-night-850" style={{ paddingBottom: 'calc(var(--safe-bottom) + 14px)' }}>
          <div className="mx-auto flex max-w-2xl gap-3 px-5 pt-4">
            {step?.type === 'card' && st.step > 0 && steps[st.step - 1]?.type === 'card' && (
              <Button variant="ghost" onClick={() => setSt((s) => ({ ...s, step: s.step - 1 }))} aria-label="Previous card"><ChevronLeft className="h-5 w-5" /></Button>
            )}
            {step?.type === 'card' && <Button block onClick={advance} loading={finishing}>{st.step + 1 < steps.length && steps[st.step + 1].type === 'q' ? 'Start questions' : 'Continue'}</Button>}
            {step?.type === 'q' && <Button block disabled={st.chosen === null} onClick={check}>Check</Button>}
            {step?.type === 'f' && !st.revealed && <Button block onClick={() => setSt((s) => ({ ...s, revealed: true }))}>Show answer</Button>}
            {step?.type === 'f' && st.revealed && (
              <div className="grid w-full grid-cols-3 gap-2">
                <Button variant="bad" onClick={() => gradeCard('again')}>Forgot</Button>
                <Button variant="primary" onClick={() => gradeCard('good')}>Got it</Button>
                <Button variant="ok" onClick={() => gradeCard('easy')}>Easy</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {finishError && (
        <div className="fixed inset-x-4 z-40 rounded-3xl bg-ink p-4 text-white shadow-pop" style={{ bottom: 'calc(var(--safe-bottom) + 100px)' }}>
          <div className="text-sm font-semibold">{finishError}</div>
          <Button size="sm" variant="gold" className="mt-3" onClick={() => finish(latest.current)} loading={finishing}>Try again</Button>
        </div>
      )}

      <Sheet open={quitOpen} onClose={stay} title="Take a break?"
        footer={
          <div className="flex flex-col gap-2">
            <Button block onClick={stay}>Keep going</Button>
            <Button block variant="quiet" onClick={leave}>Leave for now</Button>
          </div>
        }>
        <p className="text-ink-soft dark:text-slate-300">Your progress is saved. Tap <b>Resume</b> on Home to pick up exactly here{exam ? ', and the clock stays paused' : ''}.</p>
      </Sheet>

      {exam && (
        <>
          <Sheet open={nav.open} onClose={nav.hide} title="Questions">
            <div className="grid grid-cols-6 gap-2 pb-2">
              {questionSteps.map((s, i) => {
                const answered = st.exam[s.id] !== undefined;
                const flagged = st.flagged.includes(s.id);
                return (
                  <button key={s.key} onClick={() => { setSt((x) => ({ ...x, step: i })); nav.hide(); }}
                    className={`tnum relative h-11 rounded-xl text-sm font-extrabold ${i === st.step ? 'ring-2 ring-brand-500' : ''} ${answered ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft dark:bg-night-700 dark:text-slate-300'}`}>
                    {i + 1}
                    {flagged && <Flag className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-gold-400 text-gold-500" />}
                  </button>
                );
              })}
            </div>
            <p className="pb-2 text-xs text-ink-mute dark:text-slate-400">{Object.keys(st.exam).length}/{questionSteps.length} answered · {st.flagged.length} flagged</p>
          </Sheet>
          <Sheet open={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit answers?"
            footer={
              <div className="flex flex-col gap-2">
                <Button block loading={finishing} onClick={() => { setSubmitOpen(false); void finish(latest.current); }}>Submit</Button>
                <Button block variant="quiet" onClick={() => setSubmitOpen(false)}>Keep working</Button>
              </div>
            }>
            {(() => {
              const left = questionSteps.length - Object.keys(st.exam).length;
              return <p className="text-ink-soft dark:text-slate-300">{left > 0 ? <>You have <b>{left} unanswered</b> question{left > 1 ? 's' : ''}. There’s no penalty for guessing on the real exam, so pick something.</> : 'All questions answered. You’ll see results with explanations next.'}</p>;
            })()}
          </Sheet>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- pieces

function SwipeArea({ children, onNext, onPrev }: { children: React.ReactNode; onNext: () => void; onPrev: () => void }) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return (
    <div
      onTouchStart={(e) => { start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchEnd={(e) => {
        if (!start.current) return;
        const dx = e.changedTouches[0].clientX - start.current.x;
        const dy = e.changedTouches[0].clientY - start.current.y;
        // Ignore swipes starting at the screen edge (that's the iOS back gesture).
        if (start.current.x > 24 && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? onNext : onPrev)();
        start.current = null;
      }}
    >
      {children}
    </div>
  );
}

const LETTERS = ['A', 'B', 'C', 'D'];

function QuestionView({ q, order, chosen, checked, onChoose, redo }: { q: Question; order: number[]; chosen: number | null; checked: boolean; onChoose: (i: number) => void; redo?: boolean }) {
  return (
    <div className="animate-rise">
      {redo && <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gold-300/40 px-3 py-1 text-xs font-extrabold text-gold-600 dark:bg-gold-500/15 dark:text-gold-300"><RotateCcw className="h-3.5 w-3.5" /> Previous mistake</div>}
      <Markup text={q.stem} className="text-[1.08rem] font-semibold leading-relaxed" />
      <div className="mt-6 space-y-3" role="radiogroup">
        {order.map((orig, pos) => {
          const isChosen = chosen === orig;
          const isAnswer = q.answer === orig;
          let cls = 'border-slate-200 bg-white dark:border-night-600 dark:bg-night-800';
          let badge = 'border-slate-200 text-ink-mute dark:border-night-500 dark:text-slate-400';
          if (checked && isAnswer) { cls = 'border-ok-500 bg-ok-50 dark:bg-ok-500/10'; badge = 'border-ok-500 bg-ok-500 text-white'; }
          else if (checked && isChosen) { cls = 'border-bad-500 bg-bad-50 animate-shake dark:bg-bad-500/10'; badge = 'border-bad-500 bg-bad-500 text-white'; }
          else if (isChosen) { cls = 'border-brand-500 bg-brand-50 dark:bg-brand-500/15'; badge = 'border-brand-500 bg-brand-500 text-white'; }
          return (
            <button key={orig} role="radio" aria-checked={isChosen} disabled={checked} onClick={() => { sounds.tap(); onChoose(orig); }}
              className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors duration-100 ${cls}`}
              style={{ boxShadow: checked ? 'none' : '0 3px 0 0 rgba(148,163,184,.35)' }}>
              <span className={`tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-extrabold ${badge}`}>{LETTERS[pos]}</span>
              <span className="pt-0.5 text-[1rem] leading-snug"><Markup text={String(q.options[orig])} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Feedback({ q, correct, onContinue, finishing }: { q: Question; correct: boolean; onContinue: () => void; finishing: boolean }) {
  const { me } = useMe();
  return (
    <div className={`fixed inset-x-0 bottom-0 z-30 animate-sheetIn ${correct ? 'bg-ok-50 dark:bg-[#0d2a1b]' : 'bg-bad-50 dark:bg-[#2c1215]'}`} style={{ paddingBottom: 'calc(var(--safe-bottom) + 14px)' }}>
      <div className="mx-auto max-w-2xl px-5 pt-4">
        <div className={`flex items-center gap-2 font-display text-xl font-extrabold ${correct ? 'text-ok-600 dark:text-ok-500' : 'text-bad-600 dark:text-bad-500'}`}>
          {correct ? <CheckCircle2 className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
          {correct ? 'Correct!' : 'Not quite'}
        </div>
        <div className="mt-2 max-h-[38dvh] overflow-y-auto overscroll-contain pr-1 text-[0.95rem] text-ink-soft dark:text-slate-200">
          <Markup text={q.explanation} />
          {q.calc && <CalcBlock calc={q.calc} label={me!.user.settings.calculator === 'hp12c' ? 'BA II Plus keystrokes' : 'BA II Plus'} />}
        </div>
        <Button block variant={correct ? 'ok' : 'bad'} className="mt-4" onClick={onContinue} loading={finishing} autoFocus>Continue</Button>
      </div>
    </div>
  );
}

function FlashcardView({ card, revealed }: { card: { front: string; back: string }; revealed: boolean }) {
  return (
    <div className="animate-rise">
      <div className="eyebrow mb-2 text-brand-600 dark:text-brand-300">Flashcard</div>
      <div className="rounded-3xl bg-brand-50 p-6 text-center ring-1 ring-brand-100 dark:bg-night-800 dark:ring-night-600">
        <Markup text={card.front} className="font-display text-xl font-extrabold leading-snug" />
      </div>
      {revealed ? (
        <div className="mt-4 animate-rise rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-100 dark:bg-night-700 dark:ring-night-600">
          <Markup text={card.back} className="text-[1.05rem] leading-relaxed" />
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-ink-mute dark:text-slate-400">Say the answer in your head, then reveal.</p>
      )}
    </div>
  );
}

function ExamView({ session, steps, st, setSt, lookup, shuffle }: { session: StudySession; steps: Step[]; st: PState; setSt: React.Dispatch<React.SetStateAction<PState>>; lookup: Lookup; shuffle: boolean }) {
  const s = steps[Math.min(st.step, steps.length - 1)];
  if (!s || s.type !== 'q') return null;
  const q = lookup.question(s.id)!;
  const order = optionOrder(session.id, q, shuffle);
  const chosen = st.exam[s.id];
  const flagged = st.flagged.includes(s.id);
  return (
    <div key={s.id} className="animate-rise">
      <div className="mb-3 flex items-center justify-between">
        <span className="tnum text-sm font-extrabold text-ink-mute dark:text-slate-400">Question {st.step + 1} of {steps.length}</span>
        <button onClick={() => setSt((x) => ({ ...x, flagged: flagged ? x.flagged.filter((f) => f !== s.id) : [...x.flagged, s.id] }))}
          className={`chip ${flagged ? 'bg-gold-300/50 text-gold-600 dark:bg-gold-500/20 dark:text-gold-300' : 'bg-slate-100 text-ink-mute dark:bg-night-700 dark:text-slate-400'}`}>
          <Flag className={`h-3.5 w-3.5 ${flagged ? 'fill-gold-400' : ''}`} /> {flagged ? 'Flagged' : 'Flag'}
        </button>
      </div>
      <Markup text={q.stem} className="text-[1.05rem] font-semibold leading-relaxed" />
      <div className="mt-6 space-y-3">
        {order.map((orig, pos) => (
          <button key={orig} onClick={() => { sounds.tap(); setSt((x) => ({ ...x, exam: { ...x.exam, [s.id]: orig } })); }}
            className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${chosen === orig ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15' : 'border-slate-200 bg-white dark:border-night-600 dark:bg-night-800'}`}>
            <span className={`tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-extrabold ${chosen === orig ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 text-ink-mute dark:border-night-500 dark:text-slate-400'}`}>{LETTERS[pos]}</span>
            <span className="pt-0.5 leading-snug"><Markup text={String(q.options[orig])} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ExamBar({ st, setSt, steps, onNavigator, onSubmit }: { st: PState; setSt: React.Dispatch<React.SetStateAction<PState>>; steps: Step[]; onNavigator: () => void; onSubmit: () => void }) {
  const last = st.step >= steps.length - 1;
  const go = (d: number) => { setSt((x) => ({ ...x, step: Math.max(0, Math.min(steps.length - 1, x.step + d)) })); window.scrollTo({ top: 0 }); };
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-slate-100 bg-white dark:border-night-700 dark:bg-night-850" style={{ paddingBottom: 'calc(var(--safe-bottom) + 14px)' }}>
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 pt-3">
        <Button variant="ghost" onClick={() => go(-1)} disabled={st.step === 0} aria-label="Previous"><ChevronLeft className="h-5 w-5" /></Button>
        <Button variant="ghost" onClick={onNavigator} aria-label="All questions"><Grid3x3 className="h-5 w-5" /></Button>
        {last ? <Button block onClick={onSubmit}>Submit</Button> : <Button block onClick={() => go(1)}>Next <ChevronRight className="h-5 w-5" /></Button>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- results

function Results({ session, summary, lookup, state, exam }: { session: StudySession; summary: any; lookup: Lookup; state: PState; exam: boolean }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const qs = session.items.filter((i) => i.type === 'q' && lookup.question(i.id));
  const wrong = qs.filter((i) => (exam ? state.exam[i.id] !== lookup.question(i.id)!.answer : state.answers[i.id] && !state.answers[i.id].correct));
  const review = exam ? qs : wrong;
  const testout = session.kind === 'testout';
  const accuracy = summary.total ? summary.accuracy : null;

  const headline = testout
    ? summary.passed ? 'Tested out!' : 'Worth a proper look'
    : exam ? `${pct(summary.accuracy)} on ${summary.total} questions`
      : summary.perfect ? 'Flawless lesson!' : session.kind === 'review' ? 'Review complete' : 'Lesson complete!';
  const sub = testout
    ? summary.passed ? 'Your ACCA knowledge covers this. The lesson is marked done.' : 'The full lesson has been added to today’s plan.'
    : exam ? (summary.accuracy >= 0.7 ? 'At or above the 70% comfort zone.' : 'CFA doesn’t publish the pass mark; aim for 70%+ on mocks.')
      : summary.streakExtended ? `Streak extended to ${summary.streak} day${summary.streak > 1 ? 's' : ''}.` : 'Nice work. It all counts.';

  async function next() {
    setBusy(true);
    try {
      const d = await api('/api/dashboard');
      const n = d.next;
      const to = n.type === 'resume' ? `${sessionRoute(n.session.kind, n.session.ref)}?sid=${n.session.id}`
        : n.type === 'review' ? sessionRoute('review')
          : n.type === 'plan' || n.type === 'ahead' ? itemRoute(n.item) : sessionRoute('practice', 'mini:6');
      navigate(to, { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  }
  const done = () => (canGoBack() ? navigate(-1) : navigate('/', { replace: true }));

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-night-850">
      <div className="mx-auto max-w-2xl px-5 pb-44 safe-top">
        <div className="flex flex-col items-center pt-12 text-center">
          <div className={`flex h-24 w-24 animate-pop items-center justify-center rounded-full ${testout && !summary.passed ? 'bg-sky-100 text-sky-500 dark:bg-sky-500/15' : 'bg-gold-400 text-ink'}`} style={{ boxShadow: '0 6px 0 0 rgba(217,119,6,.6)' }}>
            {testout ? (summary.passed ? <FastForward className="h-11 w-11" /> : <RotateCcw className="h-11 w-11" />) : exam ? <Trophy className="h-11 w-11" /> : <Sparkles className="h-11 w-11" />}
          </div>
          <h1 className="h1 mt-5">{headline}</h1>
          <p className="mt-1.5 max-w-sm text-ink-mute dark:text-slate-400">{sub}</p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat icon={<Zap />} tint="text-gold-500" label="XP" value={`+${summary.xpTotal ?? summary.xp}`} />
          <Stat icon={<Target />} tint="text-ok-500" label="Accuracy" value={accuracy === null ? '—' : pct(accuracy)} />
          <Stat icon={<Timer />} tint="text-brand-500" label="Time" value={fmtDuration(summary.seconds)} />
        </div>

        {(summary.streakExtended || summary.earnedFreeze || summary.quests?.length > 0 || summary.mockScore !== undefined) && (
          <div className="mt-4 space-y-2">
            {summary.streakExtended && <Pill icon={<Flame className="h-5 w-5 fill-gold-400 text-gold-500" />} text={`${summary.streak}-day streak`} />}
            {summary.earnedFreeze && <Pill icon={<Snowflake className="h-5 w-5 text-sky-500" />} text="Earned a streak freeze for a full week" />}
            {summary.quests?.map((q: any) => <Pill key={q.id} icon={<CheckCircle2 className="h-5 w-5 text-ok-500" />} text={`Quest complete: ${q.label} · +${q.xp} XP`} />)}
            {summary.mockScore !== undefined && <Pill icon={<Trophy className="h-5 w-5 text-gold-500" />} text={`Full mock complete: ${pct(summary.mockScore)}`} />}
          </div>
        )}

        {review.length > 0 && (
          <section className="mt-8">
            <h2 className="eyebrow mb-2">{exam ? 'Answers & explanations' : `Added to your review loop · ${review.length}`}</h2>
            <div className="space-y-2">
              {review.map((it, i) => {
                const q = lookup.question(it.id)!;
                const chosen = exam ? state.exam[it.id] : state.answers[it.id]?.chosen;
                const ok = chosen === q.answer;
                return (
                  <details key={it.id} className="group card overflow-hidden">
                    <summary className="flex cursor-pointer list-none items-start gap-3 p-4">
                      {ok ? <Check className="mt-0.5 h-5 w-5 shrink-0 text-ok-500" strokeWidth={3} /> : <X className="mt-0.5 h-5 w-5 shrink-0 text-bad-500" strokeWidth={3} />}
                      <div className="line-clamp-2 flex-1 text-sm font-semibold">{exam ? `${i + 1}. ` : ''}{q.stem.replace(/\*\*|\^\{|_\{|\}/g, '')}</div>
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="border-t border-slate-100 px-4 pb-4 pt-3 text-sm dark:border-night-700">
                      {chosen !== undefined && chosen >= 0 && !ok && <p className="mb-1 text-bad-600 dark:text-bad-500"><b>Your answer:</b> <Markup text={String(q.options[chosen])} className="inline" /></p>}
                      {(chosen === undefined || chosen < 0) && <p className="mb-1 text-bad-600 dark:text-bad-500"><b>Not answered</b></p>}
                      <p className="mb-2 text-ok-600 dark:text-ok-500"><b>Correct:</b> <Markup text={String(q.options[q.answer])} className="inline" /></p>
                      <Markup text={q.explanation} className="text-ink-soft dark:text-slate-300" />
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-slate-100 bg-white dark:border-night-700 dark:bg-night-850" style={{ paddingBottom: 'calc(var(--safe-bottom) + 14px)' }}>
        <div className="mx-auto flex max-w-2xl flex-col gap-2 px-5 pt-4">
          <Button block onClick={next} loading={busy}>Keep going · next up</Button>
          <Button block variant="quiet" onClick={done}>Done for now</Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string; tint: string }) {
  return (
    <div className="rounded-3xl border-2 border-slate-100 p-3 text-center dark:border-night-700">
      <div className={`mx-auto mb-1 flex justify-center ${tint} [&>svg]:h-5 [&>svg]:w-5`}>{icon}</div>
      <div className="tnum font-display text-xl font-extrabold">{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute dark:text-slate-400">{label}</div>
    </div>
  );
}

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold dark:bg-night-800">{icon}{text}</div>;
}

