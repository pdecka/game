export type DateYmd = string

export function istTodayYmd(now = new Date()): DateYmd {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function shiftYmd(ymd: DateYmd, days: number): DateYmd {
  const [y, m, d] = ymd.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + days))
  return next.toISOString().slice(0, 10)
}

export function defaultIstTwoDayRange(now = new Date()) {
  const to = istTodayYmd(now)
  return { from: shiftYmd(to, -1), to }
}

export function istDayBounds(fromYmd: DateYmd, toYmd: DateYmd) {
  const from = fromYmd <= toYmd ? fromYmd : toYmd
  const to = fromYmd <= toYmd ? toYmd : fromYmd
  return {
    from: `${from}T00:00:00.000+05:30`,
    to: `${to}T23:59:59.999+05:30`,
  }
}

export function ymdParts(ymd: DateYmd) {
  const [year, month, day] = ymd.split('-').map(Number)
  return { year, month, day }
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function weekdayMondayIndex(year: number, month: number, day: number) {
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return (dow + 6) % 7
}

export function formatIstRangeLabel(from: DateYmd, to: DateYmd) {
  if (from === to) return `${from} (IST)`
  return `${from} → ${to} (IST)`
}
