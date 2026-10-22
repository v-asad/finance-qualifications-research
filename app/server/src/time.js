// Calendar helpers. Dates are 'YYYY-MM-DD' strings in the user's time zone.

const fmtCache = new Map();
function formatter(tz) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    });
    fmtCache.set(tz, f);
  }
  return f;
}

export function isValidTz(tz) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function parts(tz, ms) {
  const p = Object.fromEntries(formatter(tz).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return p;
}

/** Local calendar date for a timestamp. */
export function localDate(tz, ms = Date.now()) {
  const p = parts(tz, ms);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Local minutes since midnight. */
export function localMinutes(tz, ms = Date.now()) {
  const p = parts(tz, ms);
  return Number(p.hour) * 60 + Number(p.minute);
}

const toUtc = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));

export function addDays(date, n) {
  return new Date(toUtc(date) + n * 86400000).toISOString().slice(0, 10);
}

export function diffDays(a, b) {
  return Math.round((toUtc(b) - toUtc(a)) / 86400000);
}

/** 0 = Sunday … 6 = Saturday */
export function weekday(date) {
  return new Date(toUtc(date)).getUTCDay();
}

export function isWeekend(date) {
  const w = weekday(date);
  return w === 0 || w === 6;
}

/** Monday of the week containing date. */
export function weekStart(date) {
  return addDays(date, -((weekday(date) + 6) % 7));
}

export const isDateStr = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(toUtc(s));
