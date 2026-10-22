// Validates content/topics/*.json against content/SCHEMA.md.
// Usage: node scripts/validate-content.mjs [file ...]
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'topics');
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(root).filter((f) => f.endsWith('.json')).map((f) => join(root, f));

const TOPICS = ['ethics', 'quant', 'econ', 'fsa', 'corp', 'equity', 'fi', 'deriv', 'alts', 'pm'];
const KINDS = ['concept', 'formula', 'example', 'compare', 'tip'];
const PAPERS = ['BT', 'MA', 'FA', 'LW', 'PM', 'TX', 'FR', 'AA', 'FM', 'SBL', 'SBR', 'AFM', 'APM', 'ATX', 'AAA'];

let errors = 0;
let warnings = 0;
const err = (f, m) => { errors++; console.log(`ERROR ${f}: ${m}`); };
const warn = (f, m) => { warnings++; console.log(`warn  ${f}: ${m}`); };

function checkText(f, where, s) {
  if (typeof s !== 'string' || !s.trim()) return err(f, `${where}: empty text`);
  if (/<[a-z/][^>]*>/i.test(s)) err(f, `${where}: contains HTML`);
  if (/\\(frac|sqrt|times|sum|left|right)/.test(s)) err(f, `${where}: contains LaTeX`);
  if (/\^[^{\s]{2,}/.test(s.replace(/\^\{[^}]*\}/g, ''))) warn(f, `${where}: superscript without braces: ${s.slice(0, 60)}`);
}

const seen = new Set();
const totals = { modules: 0, lessons: 0, cards: 0, lessonQ: 0, examQ: 0, flash: 0 };
const answerDist = [0, 0, 0];

for (const file of files) {
  const f = file.split('/').pop();
  let t;
  try { t = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { err(f, `invalid JSON: ${e.message}`); continue; }
  if (!TOPICS.includes(t.id)) err(f, `unknown topic id ${t.id}`);
  if (!Array.isArray(t.weight) || t.weight.length !== 2) err(f, 'weight must be [min,max]');
  for (const k of ['name', 'blurb', 'accaNote']) if (!t[k]) err(f, `missing ${k}`);
  if (!Array.isArray(t.modules) || !t.modules.length) { err(f, 'no modules'); continue; }

  for (const m of t.modules) {
    totals.modules++;
    const mp = `${m.id}`;
    if (!new RegExp(`^${t.id}-\\d{2}$`).test(m.id)) err(f, `bad module id ${m.id}`);
    if (seen.has(m.id)) err(f, `duplicate id ${m.id}`); seen.add(m.id);
    if (!Number.isInteger(m.lm)) err(f, `${mp}: lm must be integer`);
    for (const k of ['title', 'summary']) if (!m[k]) err(f, `${mp}: missing ${k}`);
    if (!m.acca || !['none', 'partial', 'strong'].includes(m.acca.overlap)) err(f, `${mp}: bad acca.overlap`);
    for (const p of m.acca?.papers || []) if (!PAPERS.includes(p)) err(f, `${mp}: unknown ACCA paper ${p}`);

    const lessonIds = new Set();
    if (!m.lessons?.length) err(f, `${mp}: no lessons`);
    for (const l of m.lessons || []) {
      totals.lessons++;
      if (!l.id?.startsWith(m.id + '-')) err(f, `${mp}: bad lesson id ${l.id}`);
      if (seen.has(l.id)) err(f, `duplicate id ${l.id}`); seen.add(l.id); lessonIds.add(l.id);
      if (!l.title) err(f, `${l.id}: missing title`);
      if (!(l.minutes >= 3 && l.minutes <= 15)) warn(f, `${l.id}: minutes ${l.minutes}`);
      if (!Array.isArray(l.fastTrack)) err(f, `${l.id}: fastTrack must be array`);
      for (const p of l.fastTrack || []) if (!PAPERS.includes(p)) err(f, `${l.id}: unknown paper ${p}`);
      if (t.id === 'ethics' && l.fastTrack?.length) err(f, `${l.id}: ethics lessons cannot be fast-tracked`);
      if (!(l.cards?.length >= 2)) err(f, `${l.id}: needs >= 2 cards`);
      for (const [i, c] of (l.cards || []).entries()) {
        totals.cards++;
        const w = `${l.id} card ${i}`;
        if (!KINDS.includes(c.kind)) { err(f, `${w}: bad kind ${c.kind}`); continue; }
        if (!c.title) err(f, `${w}: missing title`);
        if (c.kind === 'formula') {
          checkText(f, w, c.formula);
          if (c.where && !c.where.every((r) => Array.isArray(r) && r.length === 2)) err(f, `${w}: where must be [[sym, desc]]`);
        } else if (c.kind === 'compare') {
          if (!Array.isArray(c.rows) || c.rows.length < 2) err(f, `${w}: compare needs rows`);
          else if (!c.rows.every((r) => r.length === c.rows[0].length)) err(f, `${w}: ragged rows`);
        } else {
          checkText(f, w, c.body);
          if (c.body && c.body.split(/\s+/).length > 130) warn(f, `${w}: body long (${c.body.split(/\s+/).length} words)`);
        }
      }
    }

    const perLesson = {};
    for (const q of m.questions || []) {
      const w = q.id;
      if (!q.id?.startsWith(m.id + '-q')) err(f, `${mp}: bad question id ${q.id}`);
      if (seen.has(q.id)) err(f, `duplicate id ${q.id}`); seen.add(q.id);
      if (!['lesson', 'exam'].includes(q.pool)) err(f, `${w}: bad pool`);
      if (q.pool === 'lesson') {
        if (!lessonIds.has(q.lesson)) err(f, `${w}: lesson ${q.lesson} not in module`);
        perLesson[q.lesson] = (perLesson[q.lesson] || 0) + 1;
        totals.lessonQ++;
      } else totals.examQ++;
      if (![1, 2, 3].includes(q.difficulty)) err(f, `${w}: bad difficulty`);
      checkText(f, `${w} stem`, q.stem);
      if (!Array.isArray(q.options) || q.options.length !== 3) err(f, `${w}: must have 3 options`);
      else {
        q.options.forEach((o, i) => checkText(f, `${w} option ${i}`, String(o)));
        if (new Set(q.options.map(String)).size !== 3) err(f, `${w}: duplicate options`);
        if (q.options.some((o) => /all of the above|none of the above|both a and b/i.test(String(o)))) err(f, `${w}: positional option`);
      }
      if (![0, 1, 2].includes(q.answer)) err(f, `${w}: answer must be 0-2`); else answerDist[q.answer]++;
      checkText(f, `${w} explanation`, q.explanation);
    }
    for (const id of lessonIds) if ((perLesson[id] || 0) < 2) warn(f, `${id}: only ${perLesson[id] || 0} lesson questions`);
    const ex = (m.questions || []).filter((q) => q.pool === 'exam').length;
    if (ex < 3) warn(f, `${mp}: only ${ex} exam-pool questions`);

    for (const fc of m.flashcards || []) {
      totals.flash++;
      if (seen.has(fc.id)) err(f, `duplicate id ${fc.id}`); seen.add(fc.id);
      checkText(f, `${fc.id} front`, fc.front);
      checkText(f, `${fc.id} back`, fc.back);
    }
  }
}

console.log(`\n${files.length} files · ${JSON.stringify(totals)} · answer dist ${answerDist.join('/')}`);
console.log(`${errors} errors, ${warnings} warnings`);
process.exit(errors ? 1 : 0);
