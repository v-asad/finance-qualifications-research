import { useQuery, useQueries } from '@tanstack/react-query';
import { api } from './api';
import type { ContentIndex, Topic, Question, Flashcard, Lesson, Module } from './types';

export const TOPIC_META: Record<string, { short: string; color: string; ring: string; bg: string; emoji: string }> = {
  ethics: { short: 'Ethics', color: 'text-violet-600 dark:text-violet-300', ring: 'bg-violet-500', bg: 'bg-violet-100 dark:bg-violet-500/15', emoji: '⚖️' },
  quant: { short: 'Quant', color: 'text-sky-600 dark:text-sky-300', ring: 'bg-sky-500', bg: 'bg-sky-100 dark:bg-sky-500/15', emoji: '∑' },
  econ: { short: 'Economics', color: 'text-teal-600 dark:text-teal-300', ring: 'bg-teal-500', bg: 'bg-teal-100 dark:bg-teal-500/15', emoji: '🌐' },
  fsa: { short: 'FSA', color: 'text-brand-700 dark:text-brand-300', ring: 'bg-brand-600', bg: 'bg-brand-100 dark:bg-brand-500/15', emoji: '📒' },
  corp: { short: 'Corp Fin', color: 'text-indigo-600 dark:text-indigo-300', ring: 'bg-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/15', emoji: '🏛️' },
  equity: { short: 'Equities', color: 'text-emerald-600 dark:text-emerald-300', ring: 'bg-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/15', emoji: '📈' },
  fi: { short: 'Fixed Inc', color: 'text-cyan-700 dark:text-cyan-300', ring: 'bg-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-500/15', emoji: '🧾' },
  deriv: { short: 'Derivatives', color: 'text-fuchsia-600 dark:text-fuchsia-300', ring: 'bg-fuchsia-500', bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/15', emoji: '⇄' },
  alts: { short: 'Alts', color: 'text-amber-700 dark:text-amber-300', ring: 'bg-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/15', emoji: '🏗️' },
  pm: { short: 'Portfolio', color: 'text-blue-700 dark:text-blue-300', ring: 'bg-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/15', emoji: '🧺' },
};

export const topicIdOf = (id: string) => id.split('-')[0];
export const moduleIdOf = (id: string) => id.split('-').slice(0, 2).join('-');

const FOREVER = { staleTime: Infinity, gcTime: 24 * 3600 * 1000 };

export function useContentIndex(version?: string) {
  return useQuery({
    queryKey: ['content-index', version ?? 'latest'],
    queryFn: () => api<ContentIndex>('/api/content/index'),
    ...FOREVER,
  });
}

export function useTopic(topicId: string | undefined, version?: string) {
  return useQuery({
    queryKey: ['topic', topicId, version ?? 'latest'],
    queryFn: () => api<Topic>(`/api/content/topic/${topicId}`),
    enabled: !!topicId,
    ...FOREVER,
  });
}

/** Loads every topic needed to resolve a set of item ids. */
export function useTopicsFor(ids: string[], version?: string) {
  const topicIds = [...new Set(ids.map(topicIdOf))];
  const results = useQueries({
    queries: topicIds.map((t) => ({
      queryKey: ['topic', t, version ?? 'latest'],
      queryFn: () => api<Topic>(`/api/content/topic/${t}`),
      ...FOREVER,
    })),
  });
  const loading = results.some((r) => r.isLoading);
  const error = results.find((r) => r.error)?.error as Error | undefined;
  const lookup = buildLookup(results.map((r) => r.data).filter(Boolean) as Topic[]);
  return { loading, error, lookup };
}

export type Lookup = {
  question: (id: string) => (Question & { moduleId: string; topicId: string }) | undefined;
  flashcard: (id: string) => (Flashcard & { moduleId: string; topicId: string }) | undefined;
  lesson: (id: string) => (Lesson & { moduleId: string; topicId: string }) | undefined;
  module: (id: string) => (Module & { topicId: string }) | undefined;
  topic: (id: string) => Topic | undefined;
};

export function buildLookup(topics: Topic[]): Lookup {
  const q = new Map();
  const f = new Map();
  const l = new Map();
  const m = new Map();
  const t = new Map();
  for (const topic of topics) {
    t.set(topic.id, topic);
    for (const mod of topic.modules) {
      m.set(mod.id, { ...mod, topicId: topic.id });
      for (const les of mod.lessons) l.set(les.id, { ...les, moduleId: mod.id, topicId: topic.id });
      for (const qq of mod.questions || []) q.set(qq.id, { ...qq, moduleId: mod.id, topicId: topic.id });
      for (const ff of mod.flashcards || []) f.set(ff.id, { ...ff, moduleId: mod.id, topicId: topic.id });
    }
  }
  return { question: (id) => q.get(id), flashcard: (id) => f.get(id), lesson: (id) => l.get(id), module: (id) => m.get(id), topic: (id) => t.get(id) };
}

export function useFormulas() {
  return useQuery({
    queryKey: ['formulas'],
    queryFn: () => api<{ version: string; formulas: any[] }>('/api/content/formulas'),
    ...FOREVER,
  });
}
