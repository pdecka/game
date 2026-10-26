'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  daysInMonth,
  defaultIstTwoDayRange,
  formatIstRangeLabel,
  istTodayYmd,
  shiftYmd,
  weekdayMondayIndex,
  ymdParts,
  type DateYmd,
} from '../../lib/istDates'

export type DateRange = { from: DateYmd; to: DateYmd }

export function useAdminDateRange(mode: 'two-day' | 'today' = 'two-day') {
  const initial = () => {
    if (mode === 'today') {
      const today = istTodayYmd()
      return { from: today, to: today }
    }
    return defaultIstTwoDayRange()
  }
  const [range, setRange] = useState<DateRange>(initial)
  const lastIstDay = useRef(istTodayYmd())

  useEffect(() => {
    const tick = () => {
      const today = istTodayYmd()
      if (today !== lastIstDay.current) {
        lastIstDay.current = today
        setRange(mode === 'today' ? { from: today, to: today } : defaultIstTwoDayRange())
      }
    }
    const timer = window.setInterval(tick, 15000)
    return () => window.clearInterval(timer)
  }, [mode])

  return { range, setRange }
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toYmd(year: number, month: number, day: number): DateYmd {
  return `${year}-${pad(month)}-${pad(day)}`
}

function inRange(ymd: DateYmd, from: DateYmd, to: DateYmd) {
  const a = from <= to ? from : to
  const b = from <= to ? to : from
  return ymd >= a && ymd <= b
}

export default function DateRangeCalendar({
  from,
  to,
  onChange,
}: {
  from: DateYmd
  to: DateYmd
  onChange: (next: DateRange) => void
}) {
  const today = istTodayYmd()
  const startParts = ymdParts(from || today)
  const [viewYear, setViewYear] = useState(startParts.year)
  const [viewMonth, setViewMonth] = useState(startParts.month)
  const dragStart = useRef<DateYmd | null>(null)
  const [hoverEnd, setHoverEnd] = useState<DateYmd | null>(null)

  useEffect(() => {
    const onUp = () => {
      if (!dragStart.current || !hoverEnd) return
      const start = dragStart.current
      const end = hoverEnd
      onChange({
        from: start <= end ? start : end,
        to: start <= end ? end : start,
      })
      dragStart.current = null
      setHoverEnd(null)
    }
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [hoverEnd, onChange])

  const cells = useMemo(() => {
    const firstPad = weekdayMondayIndex(viewYear, viewMonth, 1)
    const count = daysInMonth(viewYear, viewMonth)
    const items: Array<{ ymd: DateYmd; day: number } | null> = []
    for (let i = 0; i < firstPad; i += 1) items.push(null)
    for (let day = 1; day <= count; day += 1) {
      items.push({ ymd: toYmd(viewYear, viewMonth, day), day })
    }
    return items
  }, [viewYear, viewMonth])

  const previewTo = hoverEnd && dragStart.current ? hoverEnd : to
  const previewFrom = dragStart.current || from

  const shiftMonth = (delta: number) => {
    const next = new Date(Date.UTC(viewYear, viewMonth - 1 + delta, 1))
    setViewYear(next.getUTCFullYear())
    setViewMonth(next.getUTCMonth() + 1)
  }

  const finishDrag = (end: DateYmd) => {
    const start = dragStart.current || end
    const nextFrom = start <= end ? start : end
    const nextTo = start <= end ? end : start
    onChange({ from: nextFrom, to: nextTo })
    dragStart.current = null
    setHoverEnd(null)
  }

  return (
    <div className="rounded-xl border border-[#bbf7d0] bg-white p-3 shadow-sm min-w-[280px]">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="h-8 w-8 rounded-md bg-[#f0fdf4] text-[#14532d] hover:bg-[#dcfce7]"
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-[#14532d]">
          {MONTHS[viewMonth - 1]} {viewYear}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="h-8 w-8 rounded-md bg-[#f0fdf4] text-[#14532d] hover:bg-[#dcfce7]"
        >
          ›
        </button>
      </div>
      <p className="text-[11px] text-[#166534] mb-2">{formatIstRangeLabel(from, to)} · drag range · double-click a day</p>
      <div className="grid grid-cols-7 gap-1 text-[10px] font-semibold text-[#64748b] mb-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div
        className="grid grid-cols-7 gap-1 select-none"
        onMouseLeave={() => {
          if (dragStart.current) setHoverEnd(null)
        }}
      >
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`e-${idx}`} />
          const selected = inRange(cell.ymd, previewFrom, previewTo)
          const isToday = cell.ymd === today
          const isEdge = cell.ymd === previewFrom || cell.ymd === previewTo
          return (
            <button
              key={cell.ymd}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                dragStart.current = cell.ymd
                setHoverEnd(cell.ymd)
              }}
              onMouseEnter={() => {
                if (dragStart.current) setHoverEnd(cell.ymd)
              }}
              onMouseUp={() => finishDrag(cell.ymd)}
              onDoubleClick={() => {
                dragStart.current = null
                setHoverEnd(null)
                onChange({ from: cell.ymd, to: cell.ymd })
              }}
              className={`h-8 rounded-md text-xs font-medium transition-colors ${
                selected
                  ? isEdge
                    ? 'bg-[#16a34a] text-white'
                    : 'bg-[#bbf7d0] text-[#14532d]'
                  : 'text-[#020617] hover:bg-[#f0fdf4]'
              } ${isToday && !selected ? 'ring-1 ring-[#16a34a]' : ''}`}
            >
              {cell.day}
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => {
            const todayYmd = istTodayYmd()
            onChange({ from: todayYmd, to: todayYmd })
          }}
          className="rounded-md px-2 py-1 text-[11px] font-semibold bg-[#f0fdf4] text-[#166534]"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onChange(defaultIstTwoDayRange())}
          className="rounded-md px-2 py-1 text-[11px] font-semibold bg-[#16a34a] text-white"
        >
          Last 2 days
        </button>
        <button
          type="button"
          onClick={() => {
            const toYmd = istTodayYmd()
            onChange({ from: shiftYmd(toYmd, -6), to: toYmd })
          }}
          className="rounded-md px-2 py-1 text-[11px] font-semibold bg-[#f0fdf4] text-[#166534]"
        >
          7 days
        </button>
      </div>
    </div>
  )
}
