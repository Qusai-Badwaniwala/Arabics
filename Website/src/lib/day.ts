/** One definition of "a day" for the whole app. The streak, the day page, the
 *  new-word budget and "reviewed today" all read this and nothing else, so
 *  they cannot disagree about when yesterday ended.
 *
 *  Local midnight is the boundary. ponytail: no configurable 4am rollover —
 *  add one if studying past midnight starts costing a day. */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function sameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

/** The day `n` days before `date`. Used to walk a streak backwards. */
export function dayKeyBefore(date: Date, n: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() - n);
  return dayKey(d);
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** "Tue 12 Aug" — the date as the day page shows it. Hand-rolled rather than
 *  Intl, so the header reads identically on every device and in every test. */
export function shortDate(date: Date): string {
  return `${WEEKDAY[date.getDay()]} ${date.getDate()} ${MONTH[date.getMonth()]}`;
}
