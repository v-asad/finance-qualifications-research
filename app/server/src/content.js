import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const CONTENT_DIR = process.env.CONTENT_DIR || new URL('../../content/topics', import.meta.url).pathname;

export const TOPIC_ORDER = ['quant', 'econ', 'fsa', 'corp', 'equity', 'fi', 'deriv', 'alts', 'pm', 'ethics'];
export const MANDATORY_PAPERS = ['BT', 'MA', 'FA', 'LW', 'PM', 'TX', 'FR', 'AA', 'FM', 'SBL', 'SBR'];
export const OPTION_PAPERS = ['AFM', 'APM', 'ATX', 'AAA'];

function load() {
  const byTopic = new Map();
  const files = existsSync(CONTENT_DIR) ? readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json')).sort() : [];
  for (const f of files) {
    let t;
    try {
      t = JSON.parse(readFileSync(join(CONTENT_DIR, f), 'utf8'));
    } catch (e) {
      console.error(`content: skipping ${f}: ${e.message}`);
      continue;
    }
    const existing = byTopic.get(t.id);
    if (existing) {
      // Split topics (fi.json + fi2.json): keep the first file's metadata, merge modules.
      existing.modules.push(...t.modules);
    } else {
      byTopic.set(t.id, { ...t, modules: [...t.modules] });
    }
  }

  const topics = TOPIC_ORDER.filter((id) => byTopic.has(id)).map((id) => {
    const t = byTopic.get(id);
    t.modules.sort((a, b) => a.lm - b.lm);
    return t;
  });

  const lessons = new Map();
  const modules = new Map();
  const questions = new Map();
  const flashcards = new Map();
  const formulas = [];

  for (const t of topics) {
    for (const m of t.modules) {
      modules.set(m.id, { ...m, topicId: t.id });
      m.lessons.forEach((l, i) => {
        lessons.set(l.id, { ...l, moduleId: m.id, topicId: t.id, index: i });
        l.cards.forEach((c, ci) => {
          if (c.kind === 'formula') formulas.push({ id: `${l.id}#${ci}`, lessonId: l.id, moduleId: m.id, topicId: t.id, ...c });
        });
      });
      for (const q of m.questions || []) questions.set(q.id, { ...q, moduleId: m.id, topicId: t.id });
      for (const fc of m.flashcards || []) flashcards.set(fc.id, { ...fc, moduleId: m.id, topicId: t.id });
    }
  }

  const index = {
    topics: topics.map((t) => ({
      id: t.id,
      name: t.name,
      weight: t.weight,
      blurb: t.blurb,
      accaNote: t.accaNote,
      modules: t.modules.map((m) => ({
        id: m.id,
        lm: m.lm,
        title: m.title,
        summary: m.summary,
        acca: m.acca,
        flashcards: (m.flashcards || []).length,
        examQuestions: (m.questions || []).filter((q) => q.pool === 'exam').length,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          minutes: l.minutes,
          fastTrack: l.fastTrack,
          cards: l.cards.length,
          questions: (m.questions || []).filter((q) => q.lesson === l.id).length,
        })),
      })),
    })),
  };

  const topicJson = new Map(topics.map((t) => [t.id, JSON.stringify(t)]));
  const hash = createHash('sha1');
  for (const [, s] of topicJson) hash.update(s);
  const version = hash.digest('hex').slice(0, 12);
  index.version = version;

  return { topics, lessons, modules, questions, flashcards, formulas, index, indexJson: JSON.stringify(index), topicJson, version };
}

export let content = load();

export function reloadContent() {
  content = load();
  return content;
}

export const topicOf = (itemId) => itemId.split('-')[0];
export const moduleOf = (itemId) => itemId.split('-').slice(0, 2).join('-');

export function itemMeta(itemId) {
  return content.questions.get(itemId) || content.flashcards.get(itemId) || null;
}
