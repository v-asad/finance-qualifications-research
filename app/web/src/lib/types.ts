export type Card =
  | { kind: 'concept'; title: string; body: string }
  | { kind: 'formula'; title: string; formula: string; where?: [string, string][]; note?: string }
  | { kind: 'example'; title: string; body: string; calc?: string }
  | { kind: 'compare'; title: string; rows: string[][] }
  | { kind: 'tip'; title: string; body: string };

export type Question = {
  id: string;
  lesson: string | null;
  pool: 'lesson' | 'exam';
  difficulty: 1 | 2 | 3;
  stem: string;
  options: string[];
  answer: number;
  explanation: string;
  calc?: string;
};

export type Flashcard = { id: string; front: string; back: string };

export type Lesson = { id: string; title: string; minutes: number; fastTrack: string[]; cards: Card[] };

export type Module = {
  id: string;
  lm: number;
  title: string;
  summary: string;
  acca: { overlap: 'none' | 'partial' | 'strong'; papers: string[]; note?: string };
  lessons: Lesson[];
  questions: Question[];
  flashcards: Flashcard[];
};

export type Topic = { id: string; name: string; weight: [number, number]; blurb: string; accaNote: string; modules: Module[] };

export type IndexLesson = { id: string; title: string; minutes: number; fastTrack: string[]; cards: number; questions: number };
export type IndexModule = {
  id: string; lm: number; title: string; summary: string; acca: Module['acca'];
  flashcards: number; examQuestions: number; lessons: IndexLesson[];
};
export type IndexTopic = { id: string; name: string; weight: [number, number]; blurb: string; accaNote: string; modules: IndexModule[] };
export type ContentIndex = { version: string; topics: IndexTopic[] };

export type Settings = {
  tz: string;
  onboarded: boolean;
  examDate: string;
  planStart: string | null;
  planDays: number;
  weekdayMinutes: number;
  weekendMinutes: number;
  restDay: number | null;
  sessionMinutes: number;
  reviewSize: number;
  accaBackground: boolean;
  accaOptions: string[];
  fastTrack: boolean;
  calculator: 'baii' | 'hp12c';
  showTimer: boolean;
  shuffleOptions: boolean;
  sound: boolean;
  reduceMotion: boolean;
  theme: 'system' | 'light' | 'dark';
  textSize: 's' | 'm' | 'l';
  showInLeague: boolean;
  remindersEnabled: boolean;
  reminderTime: string;
  streakSaver: boolean;
  streakSaverTime: string;
};

export type User = { id: number; username: string; displayName: string; isAdmin: boolean; settings: Settings; streakFreezes: number };

export type PlanItem = {
  id: number;
  day: number;
  seq: number;
  kind: 'lesson' | 'testout' | 'checkpoint' | 'mock' | 'period' | 'drill' | 'sprint' | 'review';
  ref: string;
  minutes: number;
  phase: 'learn' | 'consolidate' | 'final';
  doneAt: number | null;
  result: string | null;
  title: string;
  subtitle: string;
  topicId?: string;
  moduleId?: string;
  date: string;
  status: 'done' | 'overdue' | 'today' | 'upcoming';
};

export type Plan = {
  start: string;
  end: string;
  examDate: string;
  days: number;
  todayIdx: number;
  replannedAt: number | null;
  phases: { learn: number; consolidate: number; final: number };
  items: PlanItem[];
};

export type SessionItem = { type: 'q' | 'f'; id: string };
export type StudySession = {
  id: string;
  kind: 'lesson' | 'testout' | 'review' | 'practice' | 'checkpoint' | 'mock';
  ref: string | null;
  items: SessionItem[];
  meta: { title?: string; timed?: boolean; secondsPerItem?: number; passMark?: number; mockId?: string };
  state: any;
  startedAt: number;
  completedAt: number | null;
  summary: any;
};
