'use client'

import { useEffect, useRef, useState } from 'react'
import { FiCalendar, FiInfo } from 'react-icons/fi'
import DateRangeCalendar, { type DateRange } from './DateRangeCalendar'
import { formatIstRangeLabel, istTodayYmd, shiftYmd, type DateYmd } from '../../lib/istDates'

function buttonLabel(from: DateYmd, to: DateYmd) {
  const today = istTodayYmd()
  if (from === to) return from === today ? `Today · ${from}` : from
  return `${from} → ${to}`
}

export default function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: DateYmd
  to: DateYmd
  onChange: (next: DateRange) => void
}) {
  const [open, setOpen] = useState(false)
  const [tip, setTip] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const step = (days: number) => {
    if (from === to) {
      const next = shiftYmd(from, days)
      onChange({ from: next, to: next })
      return
    }
    onChange({ from: shiftYmd(from, days), to: shiftYmd(to, days) })
  }

  return (
    <div ref={wrapRef} className="relative flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => step(-1)}
        className="h-10 w-10 shrink-0 rounded-lg border border-[#bbf7d0] bg-white text-[#14532d] hover:bg-[#f0fdf4] text-lg font-semibold"
        aria-label="Previous day"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-lg border border-[#bbf7d0] bg-white px-3 py-2 text-sm font-semibold text-[#14532d] hover:bg-[#f0fdf4]"
      >
        <FiCalendar className="h-4 w-4 text-[#16a34a]" />
        {buttonLabel(from, to)}
      </button>

      <button
        type="button"
        onClick={() => step(1)}
        className="h-10 w-10 shrink-0 rounded-lg border border-[#bbf7d0] bg-white text-[#14532d] hover:bg-[#f0fdf4] text-lg font-semibold"
        aria-label="Next day"
      >
        ›
      </button>

      <div
        className="relative"
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
      >
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#16a34a] hover:bg-[#f0fdf4]"
          aria-label="Date help"
        >
          <FiInfo className="h-4 w-4" />
        </button>
        {tip ? (
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-[#bbf7d0] bg-white p-3 text-[11px] leading-relaxed text-[#166534] shadow-lg">
            IST {formatIstRangeLabel(from, to)}. Drag for a range, double-click one day. Resets at 12:00 AM India time.
          </div>
        ) : null}
      </div>

      {open ? (
        <div className="absolute left-0 top-12 z-50">
          <DateRangeCalendar
            from={from}
            to={to}
            onChange={(next) => {
              onChange(next)
              if (next.from === next.to) setOpen(false)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
