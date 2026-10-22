import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, CalendarDays, Clock, GraduationCap, Rocket, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useMe } from '../lib/me';
import { api } from '../lib/api';
import { Button, ProgressBar, Segmented, Stepper } from '../components/ui';
import { addDays, diffDays, fmtDay, fmtMinutes } from '../lib/date';
import { useToast } from '../components/toast';

const STEPS = ['', 'exam', 'time', 'acca', 'ready'] as const;
const DRAFT_KEY = 'ledger.onboarding';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Draft = {
  examDate: string;
  startMode: 'now' | 'late';
  weekdayMinutes: number;
  weekendMinutes: number;
  restDay: number | null;
  accaBackground: boolean;
  accaOptions: string[];
  fastTrack: boolean;
};

export default function Onboarding() {
  const { me, refresh } = useMe();
  const { step = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const s = me!.user.settings;
  const today = me!.today;
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
      if (saved) return saved;
    } catch { /* ignore */ }
    return { examDate: s.examDate, startMode: 'now', weekdayMinutes: s.weekdayMinutes, weekendMinutes: s.weekendMinutes, restDay: s.restDay, accaBackground: s.accaBackground, accaOptions: s.accaOptions, fastTrack: s.fastTrack };
  });
  useEffect(() => { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }, [draft]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  if (s.onboarded) return <Navigate to="/" replace />;
  const idx = STEPS.indexOf(step as any);
  if (idx < 0) return <Navigate to="/welcome" replace />;

  const next = () => navigate(`/welcome/${STEPS[idx + 1]}`);
  const daysToExam = diffDays(today, draft.examDate);
  const lateStart = addDays(draft.examDate, -61);
  const planStart = draft.startMode === 'late' && diffDays(today, lateStart) > 0 ? lateStart : today;
  const planDays = Math.max(14, Math.min(60, diffDays(planStart, draft.examDate)));
  const weekly = draft.weekdayMinutes * 5 + draft.weekendMinutes * 2 - (draft.restDay === null ? 0 : draft.restDay === 0 || draft.restDay === 6 ? draft.weekendMinutes : draft.weekdayMinutes);
  const totalHours = Math.round((weekly / 7) * planDays / 60);

  async function finish() {
    setBusy(true);
    try {
      await api('/api/settings', {
        method: 'PATCH',
        body: {
          examDate: draft.examDate, planStart, planDays,
          weekdayMinutes: draft.weekdayMinutes, weekendMinutes: draft.weekendMinutes, restDay: draft.restDay,
          accaBackground: draft.accaBackground, accaOptions: draft.accaOptions, fastTrack: draft.fastTrack,
          onboarded: true, tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      await api('/api/plan/generate', { body: {} });
      sessionStorage.removeItem(DRAFT_KEY);
      await qc.invalidateQueries();
      await refresh();
      navigate('/', { replace: true });
    } catch (e) {
      toast({ text: (e as Error).message, tone: 'error' });
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-5 safe-top" style={{ paddingBottom: 'calc(var(--safe-bottom) + 20px)' }}>
      <div className="flex h-14 items-center gap-3">
        {idx > 0 ? (
          <button onClick={() => navigate(-1)} className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-brand-700 active:bg-brand-100 dark:text-brand-300 dark:active:bg-night-700" aria-label="Back">
            <ChevronLeft className="h-7 w-7" />
          </button>
        ) : <div className="w-9" />}
        <ProgressBar value={idx / (STEPS.length - 1)} className="flex-1" />
      </div>

      <div key={step} className="flex flex-1 animate-rise flex-col">
        {step === '' && (
          <>
            <div className="mt-10 flex flex-1 flex-col items-center text-center">
              <img src="/icons/icon-192.png" alt="" className="mb-6 h-24 w-24 rounded-[26px] shadow-pop" />
              <h1 className="h1">Hi {me!.user.displayName}. Let’s pass Level I.</h1>
              <p className="mt-3 max-w-sm text-ink-mute dark:text-slate-400">
                A <b className="text-ink dark:text-white">60-day plan</b> built from the 2027 curriculum, cut into <b className="text-ink dark:text-white">10-minute sessions</b> you can do between meetings.
                Your ACCA background means we skip what you already know.
              </p>
              <ul className="mt-8 w-full space-y-3 text-left">
                {[
                  ['Open the app, tap Continue.', 'The next best 10 minutes are always one tap away.'],
                  ['Mistakes come back.', 'A review loop resurfaces what you got wrong or might forget.'],
                  ['Exam-faithful practice.', '3-option questions, checkpoints and two full mocks you can pause.'],
                ].map(([a, b]) => (
                  <li key={a} className="card card-pad flex gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-ok-500" strokeWidth={3} />
                    <div><div className="font-bold">{a}</div><div className="text-sm text-ink-mute dark:text-slate-400">{b}</div></div>
                  </li>
                ))}
              </ul>
            </div>
            <Button block onClick={next} className="mt-8">Set up my plan</Button>
          </>
        )}

        {step === 'exam' && (
          <>
            <StepHead icon={<CalendarDays />} title="When is your exam?" body="CFA Level I Feb 2027 window runs 22–28 Feb. Pick your scheduled day." />
            <label className="label" htmlFor="exam">Exam date</label>
            <input id="exam" type="date" className="field" value={draft.examDate} min={addDays(today, 14)} onChange={(e) => e.target.value && set('examDate', e.target.value)} />
            <p className="mt-2 text-sm font-semibold text-brand-700 dark:text-brand-300">{daysToExam} days from today · {fmtDay(draft.examDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>

            <div className="mt-8">
              <div className="label">When should the 60-day plan run?</div>
              <div className="space-y-3">
                <Choice active={draft.startMode === 'now'} onClick={() => set('startMode', 'now')}
                  title="Start today" body={daysToExam > 62 ? `Plan runs ${fmtDay(today)} – ${fmtDay(addDays(today, 59))}. After that: daily reviews and mocks until the exam.` : 'Plan runs from today up to the day before your exam.'} />
                {daysToExam > 62 && (
                  <Choice active={draft.startMode === 'late'} onClick={() => set('startMode', 'late')}
                    title="Finish right before the exam" body={`Plan runs ${fmtDay(lateStart)} – ${fmtDay(addDays(draft.examDate, -2))}. You can browse lessons freely until then, or start early any time.`} />
                )}
              </div>
            </div>
            <div className="flex-1" />
            <Button block onClick={next} className="mt-8">Continue</Button>
          </>
        )}

        {step === 'time' && (
          <>
            <StepHead icon={<Clock />} title="How much time do you have?" body="Be realistic. Short sessions add up, and the plan adapts if you fall behind." />
            <div className="card divide-soft">
              <div className="flex items-center justify-between gap-3 p-4">
                <div><div className="font-bold">Weekdays</div><div className="text-sm text-ink-mute dark:text-slate-400">Mon–Fri, per day</div></div>
                <Stepper value={draft.weekdayMinutes} onChange={(v) => set('weekdayMinutes', v)} min={10} max={240} step={10} format={fmtMinutes} />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div><div className="font-bold">Weekends</div><div className="text-sm text-ink-mute dark:text-slate-400">Sat–Sun, per day</div></div>
                <Stepper value={draft.weekendMinutes} onChange={(v) => set('weekendMinutes', v)} min={0} max={480} step={15} format={fmtMinutes} />
              </div>
              <div className="p-4">
                <div className="mb-2 font-bold">Rest day <span className="font-normal text-ink-mute dark:text-slate-400">(optional, streak-safe)</span></div>
                <div className="flex flex-wrap gap-2">
                  {[null, 0, 1, 2, 3, 4, 5, 6].map((d) => (
                    <button key={String(d)} onClick={() => set('restDay', d as number | null)}
                      className={`pill-tab ${draft.restDay === d ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft dark:bg-night-700 dark:text-slate-300'}`}>
                      {d === null ? 'None' : DAYS[d]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-3xl bg-brand-50 p-4 text-sm dark:bg-brand-500/10">
              <div className="font-bold text-brand-800 dark:text-brand-200">≈ {totalHours} hours over {planDays} days</div>
              <div className="mt-1 text-brand-900/70 dark:text-brand-100/70">
                CFA Institute says candidates average 300+ hours per level. Your ACCA background covers a chunk of FSA, Corporate Finance and Economics, and anything beyond the plan goes into reviews and mocks.
              </div>
            </div>
            <div className="flex-1" />
            <Button block onClick={next} className="mt-8">Continue</Button>
          </>
        )}

        {step === 'acca' && (
          <>
            <StepHead icon={<GraduationCap />} title="Your ACCA background" body="Lessons that ACCA already covered become 3-minute test-outs. Pass 4 of 5 and you skip the lesson." />
            <div className="card divide-soft">
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="font-bold">I passed the ACCA Qualification</div>
                <Segmented value={draft.accaBackground ? 'y' : 'n'} options={[{ value: 'y', label: 'Yes' }, { value: 'n', label: 'No' }]} onChange={(v) => set('accaBackground', v === 'y')} />
              </div>
              {draft.accaBackground && (
                <>
                  <div className="p-4">
                    <div className="font-bold">Which options did you take?</div>
                    <div className="mb-3 text-sm text-ink-mute dark:text-slate-400">All mandatory papers (FA, FR, FM, SBR, SBL…) are assumed.</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[['AFM', 'Adv. Financial Mgmt'], ['APM', 'Adv. Performance Mgmt'], ['ATX', 'Adv. Taxation'], ['AAA', 'Adv. Audit & Assurance']].map(([code, name]) => {
                        const on = draft.accaOptions.includes(code);
                        return (
                          <button key={code} onClick={() => set('accaOptions', on ? draft.accaOptions.filter((x) => x !== code) : [...draft.accaOptions, code])}
                            className={`rounded-2xl border-2 p-3 text-left transition-colors ${on ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15' : 'border-slate-200 dark:border-night-600'}`}>
                            <div className="font-display font-extrabold">{code}</div>
                            <div className="text-xs text-ink-mute dark:text-slate-400">{name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div><div className="font-bold">Fast-track overlapping lessons</div><div className="text-sm text-ink-mute dark:text-slate-400">Test out instead of re-studying</div></div>
                    <Segmented value={draft.fastTrack ? 'y' : 'n'} options={[{ value: 'y', label: 'On' }, { value: 'n', label: 'Off' }]} onChange={(v) => set('fastTrack', v === 'y')} />
                  </div>
                </>
              )}
            </div>
            <p className="mt-4 text-sm text-ink-mute dark:text-slate-400">Ethics, US GAAP differences, fixed-income analytics and alternatives are never skipped. They’re new for ACCA members.</p>
            <div className="flex-1" />
            <Button block onClick={next} className="mt-8">Continue</Button>
          </>
        )}

        {step === 'ready' && (
          <>
            <StepHead icon={<Rocket />} title="Your plan is ready to build" body="You can change any of this later in Settings → Plan." />
            <div className="card divide-soft">
              <Summary k="Exam" v={fmtDay(draft.examDate, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} />
              <Summary k="Plan" v={`${fmtDay(planStart)} → ${fmtDay(addDays(planStart, planDays - 1))} · ${planDays} days`} />
              <Summary k="Time" v={`${fmtMinutes(draft.weekdayMinutes)} weekdays · ${fmtMinutes(draft.weekendMinutes)} weekends`} />
              <Summary k="ACCA" v={draft.accaBackground ? `Yes${draft.accaOptions.length ? ` · ${draft.accaOptions.join(', ')}` : ''}${draft.fastTrack ? ' · fast-track on' : ''}` : 'No'} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[['Learn', '72%', 'all 102 modules'], ['Consolidate', '15%', 'checkpoints + Mock 1'], ['Final', '13%', 'Mock 2 + sprints']].map(([a, b, c]) => (
                <div key={a} className="rounded-2xl bg-white p-3 shadow-card dark:bg-night-800">
                  <div className="font-display text-lg font-extrabold text-brand-700 dark:text-brand-300">{b}</div>
                  <div className="text-xs font-bold">{a}</div>
                  <div className="text-[11px] text-ink-mute dark:text-slate-400">{c}</div>
                </div>
              ))}
            </div>
            <div className="flex-1" />
            <Button block onClick={finish} loading={busy} className="mt-8">Build my 60-day plan</Button>
          </>
        )}
      </div>
    </div>
  );
}

function StepHead({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="mb-6 mt-4">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200 [&>svg]:h-6 [&>svg]:w-6">{icon}</div>
      <h1 className="h1">{title}</h1>
      <p className="mt-2 text-ink-mute dark:text-slate-400">{body}</p>
    </div>
  );
}

function Choice({ active, onClick, title, body }: { active: boolean; onClick: () => void; title: string; body: string }) {
  return (
    <button onClick={onClick} className={`w-full rounded-3xl border-2 p-4 text-left transition-colors ${active ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15' : 'border-slate-200 bg-white dark:border-night-600 dark:bg-night-800'}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${active ? 'border-brand-600 bg-brand-600' : 'border-slate-300 dark:border-night-500'}`}>
          {active && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
        </div>
        <div className="font-bold">{title}</div>
      </div>
      <div className="mt-1 pl-9 text-sm text-ink-mute dark:text-slate-400">{body}</div>
    </button>
  );
}

function Summary({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <span className="text-sm font-bold text-ink-mute dark:text-slate-400">{k}</span>
      <span className="text-right font-semibold">{v}</span>
    </div>
  );
}
