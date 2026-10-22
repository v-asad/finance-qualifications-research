import { isValidTz, isDateStr } from './time.js';
import { OPTION_PAPERS } from './content.js';

export const DEFAULT_EXAM_DATE = '2027-02-22';

export function defaultSettings(tz) {
  return {
    tz: isValidTz(tz) ? tz : 'UTC',
    onboarded: false,
    examDate: DEFAULT_EXAM_DATE,
    planStart: null,
    planDays: 60,
    weekdayMinutes: 60,
    weekendMinutes: 150,
    restDay: null,
    sessionMinutes: 10,
    reviewSize: 15,
    accaBackground: true,
    accaOptions: [],
    fastTrack: true,
    calculator: 'baii',
    showTimer: true,
    shuffleOptions: true,
    sound: true,
    reduceMotion: false,
    theme: 'system',
    textSize: 'm',
    showInLeague: true,
    remindersEnabled: false,
    reminderTime: '12:30',
    streakSaver: true,
    streakSaverTime: '21:00',
  };
}

const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
const int = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

const RULES = {
  tz: (v) => typeof v === 'string' && isValidTz(v),
  onboarded: (v) => typeof v === 'boolean',
  examDate: isDateStr,
  planStart: (v) => v === null || isDateStr(v),
  planDays: (v) => int(v, 14, 120),
  weekdayMinutes: (v) => int(v, 0, 600),
  weekendMinutes: (v) => int(v, 0, 900),
  restDay: (v) => v === null || int(v, 0, 6),
  sessionMinutes: (v) => [5, 10, 15, 20].includes(v),
  reviewSize: (v) => int(v, 5, 50),
  accaBackground: (v) => typeof v === 'boolean',
  accaOptions: (v) => Array.isArray(v) && v.length <= 4 && v.every((p) => OPTION_PAPERS.includes(p)),
  fastTrack: (v) => typeof v === 'boolean',
  calculator: (v) => ['baii', 'hp12c'].includes(v),
  showTimer: (v) => typeof v === 'boolean',
  shuffleOptions: (v) => typeof v === 'boolean',
  sound: (v) => typeof v === 'boolean',
  reduceMotion: (v) => typeof v === 'boolean',
  theme: (v) => ['system', 'light', 'dark'].includes(v),
  textSize: (v) => ['s', 'm', 'l'].includes(v),
  showInLeague: (v) => typeof v === 'boolean',
  remindersEnabled: (v) => typeof v === 'boolean',
  reminderTime: (v) => typeof v === 'string' && HM.test(v),
  streakSaver: (v) => typeof v === 'boolean',
  streakSaverTime: (v) => typeof v === 'string' && HM.test(v),
};

/** Settings keys that change the generated plan. */
export const PLAN_KEYS = ['examDate', 'planStart', 'planDays', 'weekdayMinutes', 'weekendMinutes', 'restDay', 'accaBackground', 'accaOptions', 'fastTrack'];

export function readSettings(user) {
  let s = {};
  try { s = JSON.parse(user.settings || '{}'); } catch { /* corrupted: fall back to defaults */ }
  return { ...defaultSettings(s.tz), ...s };
}

/** Returns { ok, settings, error } merging a validated patch over current settings. */
export function applyPatch(current, patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ok: false, error: 'Invalid settings' };
  const next = { ...current };
  for (const [k, v] of Object.entries(patch)) {
    const rule = RULES[k];
    if (!rule) return { ok: false, error: `Unknown setting: ${k}` };
    if (!rule(v)) return { ok: false, error: `Invalid value for ${k}` };
    next[k] = v;
  }
  if (next.weekdayMinutes === 0 && next.weekendMinutes === 0) return { ok: false, error: 'Study time cannot be zero every day' };
  return { ok: true, settings: next };
}

export function userPapers(settings) {
  if (!settings.accaBackground || !settings.fastTrack) return new Set();
  return new Set(['BT', 'MA', 'FA', 'LW', 'PM', 'TX', 'FR', 'AA', 'FM', 'SBL', 'SBR', ...settings.accaOptions]);
}
