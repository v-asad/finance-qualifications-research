import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import { useMe } from '../lib/me';
import { Button } from '../components/ui';

function Frame({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 safe-top" style={{ paddingBottom: 'calc(var(--safe-bottom) + 24px)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/icons/icon-192.png" alt="" className="mb-4 h-16 w-16 rounded-[18px] shadow-pop" />
          <h1 className="h1">{title}</h1>
          <p className="mt-1.5 text-[0.95rem] text-ink-mute dark:text-slate-400">{sub}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function PasswordField({ value, onChange, autoComplete, id }: { value: string; onChange: (v: string) => void; autoComplete: string; id: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} className="field pr-12" type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} required minLength={8} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 active:bg-slate-100 dark:active:bg-night-700" aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

export function Login() {
  const { refresh } = useMe();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/api/auth/login', { body: { username: username.trim(), password } });
      await refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Frame title="Welcome back" sub="CFA Level I, ten minutes at a time.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="u">Username</label>
          <input id="u" className="field" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} required />
        </div>
        <div>
          <label className="label" htmlFor="p">Password</label>
          <PasswordField id="p" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        {error && <p className="rounded-2xl bg-bad-50 px-4 py-3 text-sm font-semibold text-bad-600 dark:bg-bad-500/10 dark:text-bad-500" role="alert">{error}</p>}
        <Button type="submit" block loading={busy} disabled={!username || !password}>Sign in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-mute dark:text-slate-400">
        New here? <Link to={`/register${location.search}`} replace className="font-bold text-brand-700 dark:text-brand-300">Create an account</Link>
      </p>
    </Frame>
  );
}

export function Register() {
  const { refresh } = useMe();
  const location = useLocation();
  const [form, setForm] = useState({ displayName: '', username: '', password: '', inviteCode: new URLSearchParams(location.search).get('invite') || '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setBusy(true);
    try {
      await api('/api/auth/register', { body: { ...form, username: form.username.trim(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone } });
      await refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Frame title="Create your account" sub="You’ll need the invite code from whoever shared this app.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="n">Your name</label>
          <input id="n" className="field" value={form.displayName} onChange={(e) => set('displayName')(e.target.value)} autoComplete="given-name" placeholder="e.g. Ali" maxLength={40} />
        </div>
        <div>
          <label className="label" htmlFor="u">Username</label>
          <input id="u" className="field" value={form.username} onChange={(e) => set('username')(e.target.value)} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} required maxLength={24} />
          <p className="mt-1 text-xs text-ink-mute dark:text-slate-400">3–24 letters, numbers, dots, dashes or underscores.</p>
        </div>
        <div>
          <label className="label" htmlFor="p">Password</label>
          <PasswordField id="p" value={form.password} onChange={set('password')} autoComplete="new-password" />
        </div>
        <div>
          <label className="label" htmlFor="i">Invite code</label>
          <input id="i" className="field font-mono uppercase tracking-widest" value={form.inviteCode} onChange={(e) => set('inviteCode')(e.target.value)} autoCapitalize="characters" autoCorrect="off" spellCheck={false} />
        </div>
        {error && <p className="rounded-2xl bg-bad-50 px-4 py-3 text-sm font-semibold text-bad-600 dark:bg-bad-500/10 dark:text-bad-500" role="alert">{error}</p>}
        <Button type="submit" block loading={busy} disabled={!form.username || !form.password}>Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-mute dark:text-slate-400">
        Already have an account? <Link to={`/login${location.search}`} replace className="font-bold text-brand-700 dark:text-brand-300">Sign in</Link>
      </p>
    </Frame>
  );
}
