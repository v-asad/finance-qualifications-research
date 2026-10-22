import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, FastForward, Play, Clock, Layers, Dumbbell, GraduationCap } from 'lucide-react';
import { api } from '../lib/api';
import { useMe } from '../lib/me';
import { useContentIndex, useTopic, TOPIC_META } from '../lib/content';
import { Button, ErrorState, ProgressBar, Section, Spinner, TopBar, Sheet } from '../components/ui';
import { Markup } from '../lib/markup';
import { sessionRoute } from '../lib/routes';
import { useSheet } from '../lib/nav';
import NotFound from './NotFound';

function useAccaPapers() {
  const s = useMe().me!.user.settings;
  if (!s.accaBackground || !s.fastTrack) return new Set<string>();
  return new Set(['BT', 'MA', 'FA', 'LW', 'PM', 'TX', 'FR', 'AA', 'FM', 'SBL', 'SBR', ...s.accaOptions]);
}

function useProgress() {
  return useQuery({ queryKey: ['progress'], queryFn: () => api('/api/progress'), staleTime: 15_000 });
}

function LessonStatus({ status }: { status?: string }) {
  if (status === 'done') return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ok-500 text-white"><Check className="h-5 w-5" strokeWidth={3} /></div>;
  if (status === 'tested_out') return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white"><FastForward className="h-4 w-4" /></div>;
  return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-night-600 dark:text-brand-200"><Play className="ml-0.5 h-4 w-4 fill-current" /></div>;
}

export function TopicPage() {
  const { topicId } = useParams();
  const { me } = useMe();
  const index = useContentIndex(me?.contentVersion);
  const progress = useProgress();
  const papers = useAccaPapers();
  if (index.isLoading) return <><TopBar back="/learn" /><Spinner /></>;
  if (index.error) return <><TopBar back="/learn" /><ErrorState error={index.error} /></>;
  const t = index.data!.topics.find((x) => x.id === topicId);
  if (!t) return <NotFound />;
  const meta = TOPIC_META[t.id];
  const lessons = progress.data?.lessons || {};
  const mods = progress.data?.modules || {};

  return (
    <div className="mx-auto max-w-2xl">
      <TopBar back="/learn" title={t.name} sub={`${t.weight[0]}–${t.weight[1]}% of the exam`} />
      <div className="px-4">
        <div className={`rounded-3xl p-4 ${meta?.bg}`}>
          <div className="text-3xl">{meta?.emoji}</div>
          <p className="mt-2 text-[0.95rem]">{t.blurb}</p>
          {me!.user.settings.accaBackground && (
            <p className="mt-2 flex gap-2 text-sm text-ink-soft dark:text-slate-300"><GraduationCap className="mt-0.5 h-4 w-4 shrink-0" />{t.accaNote}</p>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link to={sessionRoute('practice', `topic:${t.id}`)} className="btn btn-ghost btn-sm"><Dumbbell className="h-4 w-4" /> Practice topic</Link>
          <Link to={sessionRoute('checkpoint', `checkpoint:${t.id}`)} className="btn btn-ghost btn-sm"><Layers className="h-4 w-4" /> Checkpoint</Link>
        </div>

        {t.modules.map((m) => {
          const mm = mods[m.id];
          const done = m.lessons.filter((l) => lessons[l.id]).length;
          return (
            <Section key={m.id} title={`LM ${m.lm}`} action={mm?.seen ? <span className="tnum text-xs font-bold text-ink-mute dark:text-slate-400">mastery {Math.round(mm.mastery * 100)}%</span> : undefined}>
              <div className="card overflow-hidden">
                <Link to={`/learn/${t.id}/${m.id}`} className="block px-4 pb-3 pt-4 active:bg-brand-50 dark:active:bg-night-700">
                  <div className="font-display text-[1.02rem] font-extrabold leading-snug">{m.title}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar value={done / m.lessons.length} height="h-2" tone={meta?.ring} />
                    <span className="tnum shrink-0 text-xs font-bold text-ink-mute dark:text-slate-400">{done}/{m.lessons.length}</span>
                  </div>
                </Link>
                <div className="divide-soft border-t border-slate-100 dark:border-night-700">
                  {m.lessons.map((l) => {
                    const fast = l.fastTrack.some((p) => papers.has(p));
                    const st = lessons[l.id]?.status;
                    return (
                      <Link key={l.id} to={sessionRoute(fast && !st ? 'testout' : 'lesson', l.id)} className="list-row">
                        <LessonStatus status={st} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold">{l.title}</div>
                          <div className="flex items-center gap-2 text-xs text-ink-mute dark:text-slate-400">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{fast && !st ? '3' : l.minutes} min</span>
                            <span>{l.cards} cards · {l.questions} Qs</span>
                            {fast && <span className="chip bg-sky-100 py-0.5 text-sky-500 dark:bg-sky-500/15 dark:text-sky-300">ACCA {l.fastTrack.filter((p) => papers.has(p)).join('/')}</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Section>
          );
        })}
        <div className="h-6" />
      </div>
    </div>
  );
}

export function ModulePage() {
  const { topicId, moduleId } = useParams();
  const { me } = useMe();
  const topic = useTopic(topicId, me?.contentVersion);
  const progress = useProgress();
  const papers = useAccaPapers();
  const sheet = useSheet('flashcards');
  if (topic.isLoading) return <><TopBar back={`/learn/${topicId}`} /><Spinner /></>;
  if (topic.error) return <><TopBar back={`/learn/${topicId}`} /><ErrorState error={topic.error} retry={() => topic.refetch()} /></>;
  const m = topic.data!.modules.find((x) => x.id === moduleId);
  if (!m) return <NotFound />;
  const lessons = progress.data?.lessons || {};
  const mm = progress.data?.modules?.[m.id];
  const formulas = m.lessons.flatMap((l) => l.cards.filter((c) => c.kind === 'formula')) as any[];

  return (
    <div className="mx-auto max-w-2xl">
      <TopBar back={`/learn/${topicId}`} title={`LM ${m.lm}`} sub={topic.data!.name} />
      <div className="px-4">
        <h1 className="h2">{m.title}</h1>
        <p className="mt-2 text-ink-soft dark:text-slate-300">{m.summary}</p>
        {mm?.seen > 0 && (
          <div className="card card-pad mt-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="eyebrow">Mastery</div>
              <ProgressBar value={mm.mastery} className="mt-2" />
            </div>
            <div className="tnum font-display text-2xl font-extrabold">{Math.round(mm.mastery * 100)}%</div>
          </div>
        )}
        {me!.user.settings.accaBackground && m.acca?.note && (
          <div className="mt-4 rounded-3xl bg-sky-100/70 p-4 text-sm dark:bg-sky-500/10">
            <div className="flex items-center gap-2 font-bold text-sky-500 dark:text-sky-300"><GraduationCap className="h-4 w-4" /> ACCA overlap: {m.acca.overlap}{m.acca.papers.length ? ` · ${m.acca.papers.join(', ')}` : ''}</div>
            <p className="mt-1 text-ink-soft dark:text-slate-300">{m.acca.note}</p>
          </div>
        )}

        <Section title="Lessons">
          <div className="card divide-soft overflow-hidden">
            {m.lessons.map((l, i) => {
              const fast = l.fastTrack.some((p) => papers.has(p));
              const st = lessons[l.id]?.status;
              return (
                <div key={l.id} className="flex items-center gap-3 px-4 py-3">
                  <LessonStatus status={st} />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{i + 1}. {l.title}</div>
                    <div className="text-xs text-ink-mute dark:text-slate-400">{l.minutes} min · {l.cards.length} cards</div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <Link to={sessionRoute('lesson', l.id)} className="btn btn-primary btn-sm min-h-[36px] px-3">{st ? 'Redo' : 'Start'}</Link>
                    {fast && !st && <Link to={sessionRoute('testout', l.id)} className="text-center text-xs font-bold text-sky-500">Test out</Link>}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to={sessionRoute('practice', `module:${m.id}`)} className="btn btn-ghost btn-sm"><Dumbbell className="h-4 w-4" /> Practice</Link>
          <Button variant="ghost" size="sm" onClick={() => sheet.show()}><Layers className="h-4 w-4" /> {m.flashcards.length} flashcards</Button>
        </div>

        {formulas.length > 0 && (
          <Section title="Key formulas">
            <div className="space-y-2">
              {formulas.map((f, i) => (
                <div key={i} className="card card-pad">
                  <div className="text-sm font-bold text-ink-mute dark:text-slate-400">{f.title}</div>
                  <div className="mt-1 overflow-x-auto font-mono text-[0.95rem] font-semibold text-brand-800 dark:text-brand-200"><Markup text={f.formula} /></div>
                </div>
              ))}
            </div>
          </Section>
        )}
        <div className="h-6" />
      </div>

      <Sheet open={sheet.open} onClose={sheet.hide} title={`Flashcards · LM ${m.lm}`}>
        <div className="space-y-2">
          {m.flashcards.map((f) => (
            <details key={f.id} className="group rounded-2xl bg-slate-50 p-4 dark:bg-night-700">
              <summary className="cursor-pointer list-none font-semibold"><Markup text={f.front} /></summary>
              <div className="mt-2 border-t border-slate-200 pt-2 text-ink-soft dark:border-night-600 dark:text-slate-300"><Markup text={f.back} /></div>
            </details>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
