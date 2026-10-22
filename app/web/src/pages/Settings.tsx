import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User, CalendarRange, BookOpen, GraduationCap, Bell, Palette, KeyRound, Shield, Info, LogOut, Download, RotateCcw, Trash2, Copy, RefreshCw, Smartphone } from 'lucide-react';
import { useMe } from '../lib/me';
import { api } from '../lib/api';
import type { Settings as S } from '../lib/types';
import { Button, Row, Section, Segmented, Sheet, Spinner, Stepper, Toggle, TopBar } from '../components/ui';
import { useToast } from '../components/toast';
import { useSheet } from '../lib/nav';
import { addDays, diffDays, fmtDay, fmtMinutes } from '../lib/date';
import { enablePush, disablePush, pushStatus } from '../lib/push';
import { isIOS, isStandalone } from '../components/banners';
import NotFound from './NotFound';

const SECTIONS = [
  { id: 'profile', title: 'Profile', icon: User, sub: 'Name, league' },
  { id: 'plan', title: 'Plan', icon: CalendarRange, sub: 'Exam date, 60-day plan, time budget' },
  { id: 'study', title: 'Study', icon: BookOpen, sub: 'Sessions, reviews, calculator' },
  { id: 'acca', title: 'ACCA background', icon: GraduationCap, sub: 'Options, fast-track' },
  { id: 'notifications', title: 'Notifications', icon: Bell, sub: 'Daily reminder, streak saver' },
  { id: 'appearance', title: 'Appearance', icon: Palette, sub: 'Theme, text size, motion, sound' },
  { id: 'account', title: 'Account & data', icon: KeyRound, sub: 'Password, export, reset' },
  { id: 'about', title: 'About & install', icon: Info, sub: 'Version, add to Home Screen' },
] as const;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Settings() {
  const { section } = useParams();
  const { me } = useMe();
  const navigate = useNavigate();
  if (!section) {
    return (
      <div className="mx-auto max-w-2xl px-4 safe-top">
        <header className="pb-1 pt-4">
          <div className="eyebrow">@{me!.user.username}</div>
          <h1 className="h1 mt-0.5">Settings</h1>
        </header>
        <div className="card divide-soft mt-4 overflow-hidden">
          {SECTIONS.map((s) => <Row key={s.id} icon={<s.icon className="h-5 w-5" />} title={s.title} sub={s.sub} onClick={() => navigate(`/settings/${s.id}`)} />)}
          {me!.user.isAdmin && <Row icon={<Shield className="h-5 w-5" />} title="Admin" sub="Invite code, users" onClick={() => navigate('/settings/admin')} />}
        </div>
        <SignOut />
      </div>
    );
  }
  const meta = SECTIONS.find((s) => s.id === section) || (section === 'admin' && me!.user.isAdmin ? { title: 'Admin' } : null);
  if (!meta) return <NotFound />;
  return (
    <div className="mx-auto max-w-2xl">
      <TopBar back="/settings" title={meta.title} />
      <div className="px-4 pb-6">
        {section === 'profile' && <Profile />}
        {section === 'plan' && <PlanSettings />}
        {section === 'study' && <Study />}
        {section === 'acca' && <Acca />}
        {section === 'notifications' && <Notifications />}
        {section === 'appearance' && <Appearance />}
        {section === 'account' && <Account />}
        {section === 'about' && <About />}
        {section === 'admin' && <Admin />}
      </div>
    </div>
  );
}

function useSet() {
  const { updateSettings } = useMe();
  const toast = useToast();
  return async (patch: Partial<S> & { displayName?: string }, msg?: string) => {
    try {
      const r = await updateSettings(patch);
      if (r.planRegenerated) toast({ text: 'Plan rebuilt with your new settings. Completed items stay done.', tone: 'ok' });
      else if (msg) toast({ text: msg, tone: 'ok' });
    } catch (e) {
      toast({ text: (e as Error).message, tone: 'error' });
    }
  };
}

function Field({ label, sub, children }: { label: string; sub?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0">
        <div className="font-semibold">{label}</div>
        {sub && <div className="text-sm text-ink-mute dark:text-slate-400">{sub}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Profile() {
  const { me } = useMe();
  const set = useSet();
  const [name, setName] = useState(me!.user.displayName);
  const s = me!.user.settings;
  return (
    <>
      <Section title="Display name">
        <div className="flex gap-2">
          <input className="field" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          <Button disabled={!name.trim() || name === me!.user.displayName} onClick={() => set({ displayName: name.trim() }, 'Name updated')}>Save</Button>
        </div>
      </Section>
      <Section>
        <div className="card divide-soft">
          <Field label="Show me in the league" sub="Friends on this app see your weekly XP"><Toggle label="League" checked={s.showInLeague} onChange={(v) => set({ showInLeague: v })} /></Field>
          <Field label="Username" sub="Used to sign in"><span className="font-mono text-sm">@{me!.user.username}</span></Field>
        </div>
      </Section>
    </>
  );
}

function PlanSettings() {
  const { me } = useMe();
  const set = useSet();
  const qc = useQueryClient();
  const toast = useToast();
  const s = me!.user.settings;
  const today = me!.today;
  const [busy, setBusy] = useState<string | null>(null);
  const replan = useSheet('replan');
  const rebuild = useSheet('rebuild');
  const plan = useQuery({ queryKey: ['plan'], queryFn: () => api('/api/plan'), staleTime: 15_000 });

  const run = async (what: 'replan' | 'generate') => {
    setBusy(what);
    try {
      await api(`/api/plan/${what}`, { body: {} });
      await qc.invalidateQueries();
      toast({ text: what === 'replan' ? 'Remaining items spread from today' : 'Plan rebuilt', tone: 'ok' });
      (what === 'replan' ? replan : rebuild).hide();
    } catch (e) { toast({ text: (e as Error).message, tone: 'error' }); } finally { setBusy(null); }
  };

  const p = plan.data?.plan;
  return (
    <>
      {p && (
        <div className="mt-2 rounded-3xl bg-brand-600 p-4 text-white">
          <div className="text-xs font-bold uppercase tracking-[0.08em] text-white/70">Current plan</div>
          <div className="mt-1 font-display text-lg font-extrabold">{fmtDay(p.start)} → {fmtDay(p.end)} · {p.days} days</div>
          <div className="text-sm text-white/80">Learn {p.phases.learn}d · Consolidate {p.phases.consolidate}d · Final {p.phases.final}d · exam in {diffDays(today, s.examDate)} days</div>
        </div>
      )}
      <Section title="Dates">
        <div className="card divide-soft">
          <Field label="Exam date"><input type="date" className="field !w-auto !py-2" value={s.examDate} min={addDays(today, 7)} onChange={(e) => e.target.value && set({ examDate: e.target.value })} /></Field>
          <Field label="Plan start"><input type="date" className="field !w-auto !py-2" value={s.planStart || today} onChange={(e) => e.target.value && set({ planStart: e.target.value })} /></Field>
          <Field label="Plan length" sub="Shortened automatically if the exam is closer"><Stepper value={s.planDays} min={14} max={120} step={5} onChange={(v) => set({ planDays: v })} format={(v) => `${v} days`} /></Field>
        </div>
      </Section>
      <Section title="Time budget">
        <div className="card divide-soft">
          <Field label="Weekdays"><Stepper value={s.weekdayMinutes} min={10} max={240} step={10} onChange={(v) => set({ weekdayMinutes: v })} format={fmtMinutes} /></Field>
          <Field label="Weekends"><Stepper value={s.weekendMinutes} min={0} max={480} step={15} onChange={(v) => set({ weekendMinutes: v })} format={fmtMinutes} /></Field>
          <div className="px-4 py-3.5">
            <div className="mb-2 font-semibold">Rest day</div>
            <div className="flex flex-wrap gap-2">
              {[null, 0, 1, 2, 3, 4, 5, 6].map((d) => (
                <button key={String(d)} onClick={() => set({ restDay: d as number | null })}
                  className={`pill-tab ${s.restDay === d ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft dark:bg-night-700 dark:text-slate-300'}`}>{d === null ? 'None' : DAYS[d]}</button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 px-1 text-xs text-ink-mute dark:text-slate-400">Changing dates, time or ACCA settings rebuilds the plan. Anything you’ve completed stays completed.</p>
      </Section>
      <Section title="Adjust">
        <div className="card divide-soft overflow-hidden">
          <Row icon={<RefreshCw className="h-5 w-5" />} title="Re-plan from today" sub="Spread every unfinished item over the remaining days" onClick={() => replan.show()} />
          <Row icon={<RotateCcw className="h-5 w-5" />} title="Rebuild plan" sub="Regenerate the whole schedule from your settings" onClick={() => rebuild.show()} />
        </div>
      </Section>
      <Sheet open={replan.open} onClose={replan.hide} title="Re-plan from today?" footer={<Button block loading={busy === 'replan'} onClick={() => run('replan')}>Re-plan</Button>}>
        <p className="text-ink-soft dark:text-slate-300">Overdue and upcoming items are redistributed from today to the last plan day, keeping their order. Nothing is deleted.</p>
      </Sheet>
      <Sheet open={rebuild.open} onClose={rebuild.hide} title="Rebuild the plan?" footer={<Button block loading={busy === 'generate'} onClick={() => run('generate')}>Rebuild</Button>}>
        <p className="text-ink-soft dark:text-slate-300">The schedule is regenerated from your current settings. Completed lessons, test-outs and mocks keep their completed status.</p>
      </Sheet>
    </>
  );
}

function Study() {
  const { me } = useMe();
  const set = useSet();
  const s = me!.user.settings;
  return (
    <>
      <Section title="Sessions">
        <div className="card divide-soft">
          <Field label="Review session size" sub="Items per review"><Stepper value={s.reviewSize} min={5} max={50} step={5} onChange={(v) => set({ reviewSize: v })} /></Field>
          <Field label="Shuffle answer options" sub="Stops you memorising positions"><Toggle label="Shuffle" checked={s.shuffleOptions} onChange={(v) => set({ shuffleOptions: v })} /></Field>
          <Field label="Show timer in mocks"><Toggle label="Timer" checked={s.showTimer} onChange={(v) => set({ showTimer: v })} /></Field>
        </div>
      </Section>
      <Section title="Calculator">
        <Segmented value={s.calculator} onChange={(v) => set({ calculator: v })} options={[{ value: 'baii', label: 'TI BA II Plus' }, { value: 'hp12c', label: 'HP 12C' }]} />
        <p className="mt-2 px-1 text-xs text-ink-mute dark:text-slate-400">Worked solutions show BA II Plus keystrokes. These are the only two calculator models allowed in the exam room (Professional / Platinum versions included).</p>
      </Section>
    </>
  );
}

function Acca() {
  const { me } = useMe();
  const set = useSet();
  const s = me!.user.settings;
  return (
    <>
      <Section>
        <div className="card divide-soft">
          <Field label="ACCA qualified"><Toggle label="ACCA" checked={s.accaBackground} onChange={(v) => set({ accaBackground: v })} /></Field>
          <Field label="Fast-track overlapping lessons" sub="Test out with 4/5 instead of studying"><Toggle label="Fast-track" checked={s.fastTrack} onChange={(v) => set({ fastTrack: v })} /></Field>
        </div>
      </Section>
      {s.accaBackground && (
        <Section title="Options you passed">
          <div className="grid grid-cols-2 gap-2">
            {[['AFM', 'Advanced Financial Management'], ['APM', 'Advanced Performance Management'], ['ATX', 'Advanced Taxation'], ['AAA', 'Advanced Audit & Assurance']].map(([c, n]) => {
              const on = s.accaOptions.includes(c);
              return (
                <button key={c} onClick={() => set({ accaOptions: on ? s.accaOptions.filter((x) => x !== c) : [...s.accaOptions, c] })}
                  className={`rounded-2xl border-2 p-3 text-left ${on ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15' : 'border-slate-200 bg-white dark:border-night-600 dark:bg-night-800'}`}>
                  <div className="font-display font-extrabold">{c}</div><div className="text-xs text-ink-mute dark:text-slate-400">{n}</div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 px-1 text-xs text-ink-mute dark:text-slate-400">Mandatory papers (BT, MA, FA, LW, PM, TX, FR, AA, FM, SBL, SBR) are assumed. AFM unlocks a few extra test-outs in portfolio maths, duration and derivatives.</p>
        </Section>
      )}
    </>
  );
}

function Notifications() {
  const { me } = useMe();
  const set = useSet();
  const toast = useToast();
  const s = me!.user.settings;
  const [status, setStatus] = useState<string>('…');
  const [busy, setBusy] = useState(false);
  useEffect(() => { void pushStatus().then(setStatus); }, []);
  const needsInstall = isIOS() && !isStandalone();

  const turnOn = async () => {
    setBusy(true);
    try { await enablePush(); await set({ remindersEnabled: true }); setStatus('on'); toast({ text: 'Reminders on', tone: 'ok' }); } catch (e) { toast({ text: (e as Error).message, tone: 'error' }); } finally { setBusy(false); }
  };
  const turnOff = async () => {
    setBusy(true);
    try { await disablePush(); await set({ remindersEnabled: false }); setStatus('off'); } finally { setBusy(false); }
  };

  return (
    <>
      {needsInstall ? (
        <div className="mt-2 rounded-3xl bg-gold-300/30 p-4 text-sm dark:bg-gold-500/10">
          <div className="flex items-center gap-2 font-bold"><Smartphone className="h-5 w-5" /> Install first</div>
          <p className="mt-1 text-ink-soft dark:text-slate-300">iPhone only allows notifications for apps on the Home Screen. Tap Share → Add to Home Screen, open Ledger from there, sign in, and come back here.</p>
        </div>
      ) : (
        <Section>
          <div className="card divide-soft">
            <Field label="Push reminders" sub={status === 'denied' ? 'Blocked in system settings' : status === 'unsupported' ? 'Not supported on this browser' : status === 'on' ? 'On for this device' : 'Off'}>
              {status === 'on' && s.remindersEnabled
                ? <Button size="sm" variant="ghost" loading={busy} onClick={turnOff}>Turn off</Button>
                : <Button size="sm" loading={busy} disabled={status === 'unsupported' || status === 'denied'} onClick={turnOn}>Turn on</Button>}
            </Field>
            {s.remindersEnabled && (
              <>
                <Field label="Daily reminder" sub="Only if you haven’t studied yet"><input type="time" className="field !w-auto !py-2" value={s.reminderTime} onChange={(e) => e.target.value && set({ reminderTime: e.target.value })} /></Field>
                <Field label="Streak saver" sub="An evening nudge when your streak is at risk"><Toggle label="Streak saver" checked={s.streakSaver} onChange={(v) => set({ streakSaver: v })} /></Field>
                {s.streakSaver && <Field label="Streak saver time"><input type="time" className="field !w-auto !py-2" value={s.streakSaverTime} onChange={(e) => e.target.value && set({ streakSaverTime: e.target.value })} /></Field>}
                <div className="px-4 py-3"><Button size="sm" variant="ghost" onClick={() => api('/api/push/test', { body: {} }).then((r) => toast(r.sent ? 'Test sent' : 'No device subscribed')).catch((e) => toast({ text: e.message, tone: 'error' }))}>Send a test</Button></div>
              </>
            )}
          </div>
          <p className="mt-2 px-1 text-xs text-ink-mute dark:text-slate-400">At most two notifications a day, never guilt-trippy. Times use your time zone ({s.tz}).</p>
        </Section>
      )}
    </>
  );
}

function Appearance() {
  const { me } = useMe();
  const set = useSet();
  const s = me!.user.settings;
  return (
    <>
      <Section title="Theme"><Segmented value={s.theme} onChange={(v) => set({ theme: v })} options={[{ value: 'system', label: 'Auto' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /></Section>
      <Section title="Text size"><Segmented value={s.textSize} onChange={(v) => set({ textSize: v })} options={[{ value: 's', label: 'Small' }, { value: 'm', label: 'Default' }, { value: 'l', label: 'Large' }]} /></Section>
      <Section>
        <div className="card divide-soft">
          <Field label="Sound effects"><Toggle label="Sound" checked={s.sound} onChange={(v) => set({ sound: v })} /></Field>
          <Field label="Reduce motion" sub="Fewer animations, no confetti"><Toggle label="Reduce motion" checked={s.reduceMotion} onChange={(v) => set({ reduceMotion: v })} /></Field>
        </div>
      </Section>
    </>
  );
}

function Account() {
  const toast = useToast();
  const qc = useQueryClient();
  const { refresh } = useMe();
  const pw = useSheet('password');
  const reset = useSheet('reset');
  const del = useSheet('delete');
  const [form, setForm] = useState({ current: '', next: '', confirm: '', password: '' });
  const [busy, setBusy] = useState(false);
  const act = async (fn: () => Promise<unknown>, ok: string, after?: () => void) => {
    setBusy(true);
    try { await fn(); toast({ text: ok, tone: 'ok' }); after?.(); } catch (e) { toast({ text: (e as Error).message, tone: 'error' }); } finally { setBusy(false); }
  };
  return (
    <>
      <Section>
        <div className="card divide-soft overflow-hidden">
          <Row icon={<KeyRound className="h-5 w-5" />} title="Change password" onClick={() => pw.show()} />
          <Row icon={<LogOut className="h-5 w-5" />} title="Sign out other devices" onClick={() => act(() => api('/api/account/signout-others', { body: {} }), 'Other devices signed out')} />
          <Row icon={<Download className="h-5 w-5" />} title="Export my data" sub="JSON download" onClick={() => { window.location.href = '/api/account/export'; }} />
        </div>
      </Section>
      <Section title="Danger zone">
        <div className="card divide-soft overflow-hidden">
          <Row icon={<RotateCcw className="h-5 w-5" />} title="Reset all progress" danger onClick={() => reset.show()} />
          <Row icon={<Trash2 className="h-5 w-5" />} title="Delete account" danger onClick={() => del.show()} />
        </div>
      </Section>

      <Sheet open={pw.open} onClose={pw.hide} title="Change password"
        footer={<Button block loading={busy} disabled={form.next.length < 8 || form.next !== form.confirm} onClick={() => act(() => api('/api/account/password', { body: { current: form.current, next: form.next } }), 'Password changed', () => { setForm({ current: '', next: '', confirm: '', password: '' }); pw.hide(); })}>Update password</Button>}>
        <div className="space-y-3 pb-2">
          <input className="field" type="password" placeholder="Current password" autoComplete="current-password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
          <input className="field" type="password" placeholder="New password (8+ characters)" autoComplete="new-password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
          <input className="field" type="password" placeholder="Repeat new password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </div>
      </Sheet>
      <Sheet open={reset.open} onClose={reset.hide} title="Reset all progress?"
        footer={<Button block variant="bad" loading={busy} onClick={() => act(() => api('/api/account/reset-progress', { body: { confirm: 'RESET' } }), 'Progress reset', async () => { await qc.invalidateQueries(); await refresh(); })}>Reset everything</Button>}>
        <p className="text-ink-soft dark:text-slate-300">Deletes your plan, answers, reviews, mocks and streak, and takes you back to setup. This can’t be undone.</p>
      </Sheet>
      <Sheet open={del.open} onClose={del.hide} title="Delete your account?"
        footer={<Button block variant="bad" loading={busy} disabled={!form.password} onClick={() => act(() => api('/api/account/delete', { body: { password: form.password } }), 'Account deleted', () => { localStorage.clear(); window.location.replace('/login'); })}>Delete permanently</Button>}>
        <p className="mb-3 text-ink-soft dark:text-slate-300">Everything is removed. Enter your password to confirm.</p>
        <input className="field" type="password" placeholder="Password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </Sheet>
    </>
  );
}

function About() {
  const { me } = useMe();
  return (
    <>
      <div className="mt-2 flex flex-col items-center text-center">
        <img src="/icons/icon-192.png" alt="" className="h-20 w-20 rounded-[22px] shadow-pop" />
        <div className="mt-3 font-display text-xl font-extrabold">Ledger</div>
        <div className="text-sm text-ink-mute dark:text-slate-400">CFA® Level I · 2027 curriculum · content {me!.contentVersion}</div>
      </div>
      <Section title="Install on iPhone">
        <div className="card card-pad text-sm text-ink-soft dark:text-slate-300">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>Open <b>cfa.tomo.study</b> in Safari.</li>
            <li>Tap the <b>Share</b> button, then <b>Add to Home Screen</b>.</li>
            <li>Open Ledger from the Home Screen and sign in once.</li>
            <li>Turn on reminders in Settings → Notifications.</li>
          </ol>
          <p className="mt-3 text-xs text-ink-mute dark:text-slate-400">{isStandalone() ? '✓ You’re using the installed app.' : 'You’re in the browser right now.'}</p>
        </div>
      </Section>
      <p className="mt-6 px-1 text-xs leading-relaxed text-ink-mute dark:text-slate-400">
        Independent study tool with original content. Not affiliated with or endorsed by CFA Institute. CFA® and Chartered Financial Analyst® are registered trademarks of CFA Institute. CFA Institute does not publish the minimum passing score; readiness figures are estimates.
      </p>
    </>
  );
}

function Admin() {
  const toast = useToast();
  const q = useQuery({ queryKey: ['admin'], queryFn: () => api('/api/admin') });
  const [temp, setTemp] = useState<{ user: string; pw: string } | null>(null);
  if (q.isLoading) return <Spinner />;
  const d = q.data;
  const link = `${window.location.origin}/register?invite=${d.inviteCode}`;
  const copy = (t: string) => navigator.clipboard?.writeText(t).then(() => toast({ text: 'Copied', tone: 'ok' })).catch(() => toast(t));
  const action = async (id: number, actionName: string, username: string) => {
    try {
      const r = await api(`/api/admin/users/${id}`, { body: { action: actionName } });
      if (r.tempPassword) setTemp({ user: username, pw: r.tempPassword });
      else toast({ text: 'Done', tone: 'ok' });
      void q.refetch();
    } catch (e) { toast({ text: (e as Error).message, tone: 'error' }); }
  };
  return (
    <>
      <Section title="Invite friends">
        <div className="card card-pad">
          <div className="text-sm text-ink-mute dark:text-slate-400">Invite code</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 font-mono text-2xl font-extrabold tracking-[0.2em]">{d.inviteCode}</div>
            <Button size="sm" variant="ghost" onClick={() => copy(d.inviteCode)}><Copy className="h-4 w-4" /></Button>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => copy(link)}>Copy invite link</Button>
            <Button size="sm" variant="ghost" onClick={() => api('/api/admin/invite', { body: {} }).then(() => q.refetch())}>New code</Button>
          </div>
        </div>
      </Section>
      <Section title={`Users · ${d.users.length}`}>
        <div className="card divide-soft overflow-hidden">
          {d.users.map((u: any) => (
            <div key={u.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{u.displayName} <span className="font-mono text-xs text-ink-mute">@{u.username}</span></div>
                  <div className="text-xs text-ink-mute dark:text-slate-400">{u.isAdmin ? 'Admin · ' : ''}{u.disabled ? 'Disabled · ' : ''}{u.xp} XP · last active {u.lastActive || 'never'}</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="chip bg-slate-100 dark:bg-night-700" onClick={() => action(u.id, 'reset-password', u.username)}>Reset password</button>
                {!u.isAdmin && <button className="chip bg-slate-100 dark:bg-night-700" onClick={() => action(u.id, u.disabled ? 'enable' : 'disable', u.username)}>{u.disabled ? 'Enable' : 'Disable'}</button>}
                {!u.isAdmin && <button className="chip bg-slate-100 dark:bg-night-700" onClick={() => action(u.id, 'make-admin', u.username)}>Make admin</button>}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Sheet open={!!temp} onClose={() => setTemp(null)} title="Temporary password">
        <p className="text-ink-soft dark:text-slate-300">Give this to <b>@{temp?.user}</b>. They can change it in Settings → Account.</p>
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-100 p-3 dark:bg-night-700">
          <span className="flex-1 font-mono text-lg font-bold">{temp?.pw}</span>
          <Button size="sm" variant="ghost" onClick={() => temp && copy(temp.pw)}><Copy className="h-4 w-4" /></Button>
        </div>
      </Sheet>
    </>
  );
}

function SignOut() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  return (
    <div className="mt-6 pb-6">
      <Button block variant="ghost" loading={busy} onClick={async () => {
        setBusy(true);
        await api('/api/auth/logout', { body: {} }).catch(() => {});
        localStorage.removeItem('ledger.me');
        qc.clear();
        window.location.replace('/login');
      }}>
        <LogOut className="h-5 w-5" /> Sign out
      </Button>
    </div>
  );
}
