'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import StatCard from '../components/StatCard'
import { useAdminDateRange } from '../components/DateRangeCalendar'
import DateRangePicker from '../components/DateRangePicker'
import { formatIstRangeLabel, istDayBounds } from '../../lib/istDates'
import { adminFinanceService } from '../../services/adminFinanceService'
import { downloadExcel, downloadPdf } from '../../lib/reportExport'

type Kind = 'all' | 'deposits' | 'withdrawals' | 'days' | 'bonus' | 'levels' | 'sports' | 'games'

type MoneyLine = { when: string; username: string; amount: number; currency: string; method: string; status: string }
type DayLine = {
  date: string
  deposits: number
  withdrawals: number
  bonus: number
  sportsPlayed: number
  sportsPaid: number
  casinoPlayed: number
  casinoPaid: number
}
type ReportPack = {
  from: string
  to: string
  summary: {
    depositsPaid: number
    depositsWaiting: number
    withdrawalsPaid: number
    withdrawalsWaiting: number
    bonusTotal: number
    sportsPlayed: number
    sportsPaid: number
    sportsProfit: number
    casinoPlayed: number
    casinoPaid: number
    casinoProfit: number
  }
  days: DayLine[]
  deposits: MoneyLine[]
  withdrawals: MoneyLine[]
  bonuses: Array<{ when: string; username: string; type: string; amount: number; currency: string; status: string }>
  levels: { counts: Array<{ level: string; players: number }>; players: Array<{ username: string; level: string; wageredInr: number }> }
  sports: Array<{ when: string; username: string; sport: string; pick: string; stake: number; odds: number; payout: number; status: string }>
  games: Array<{ when: string; username: string; game: string; stake: number; win: number; status: string }>
}

const KINDS: Array<{ id: Kind; label: string }> = [
  { id: 'all', label: 'All money' },
  { id: 'deposits', label: 'Deposits' },
  { id: 'withdrawals', label: 'Withdrawals' },
  { id: 'days', label: 'Each day' },
  { id: 'bonus', label: 'Bonus' },
  { id: 'levels', label: 'Player level' },
  { id: 'sports', label: 'Sports' },
  { id: 'games', label: 'Casino games' },
]

function rupee(amount: number) {
  const value = Number(amount || 0)
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const KIND_HELP: Record<Kind, string> = {
  all: 'One view of money in, money out, bonus, sports, and casino for the dates you picked.',
  deposits: 'Every deposit in these dates. Paid means the money was added. Waiting means it is not approved yet.',
  withdrawals: 'Every withdrawal in these dates. Paid means the money was sent. Waiting means it is not approved yet.',
  days: 'One line for each day, so you can compare deposits, withdrawals, bonus, sports, and casino.',
  bonus: 'Every bonus given in these dates.',
  levels: 'How many players are on each level right now. This uses all of their play, not only the dates above.',
  sports: 'Sports bets only. Profit is settled stake minus money paid back.',
  games: 'Casino games only. Profit is finished stake minus money paid back.',
}

export default function ReportsEnhanced() {
  const [loading, setLoading] = useState(false)
  const { range, setRange } = useAdminDateRange('today')
  const [playerName, setPlayerName] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [kind, setKind] = useState<Kind>('all')
  const [report, setReport] = useState<ReportPack | null>(null)

  const load = async (username = appliedName) => {
    try {
      setLoading(true)
      const bounds = istDayBounds(range.from, range.to)
      const data = await adminFinanceService.getReportDetail({
        from: bounds.from,
        to: bounds.to,
        username: username || undefined,
      })
      setReport(data)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(appliedName)
    const timer = window.setInterval(() => {
      if (document.hidden) return
      void load(appliedName)
    }, 30000)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to, appliedName])

  const table = useMemo(() => {
    if (!report) return { headers: ['Report'], rows: [] as string[][] }
    if (kind === 'deposits') {
      return {
        headers: ['Date and time', 'Player', 'Amount', 'How paid', 'Status'],
        rows: report.deposits.map((row) => [row.when, row.username, rupee(row.amount), row.method, row.status]),
      }
    }
    if (kind === 'withdrawals') {
      return {
        headers: ['Date and time', 'Player', 'Amount', 'How paid', 'Status'],
        rows: report.withdrawals.map((row) => [row.when, row.username, rupee(row.amount), row.method, row.status]),
      }
    }
    if (kind === 'days') {
      return {
        headers: ['Date', 'Deposits', 'Withdrawals', 'Bonus', 'Sports played', 'Sports paid', 'Casino played', 'Casino paid'],
        rows: report.days.map((row) => [
          row.date,
          rupee(row.deposits),
          rupee(row.withdrawals),
          rupee(row.bonus),
          rupee(row.sportsPlayed),
          rupee(row.sportsPaid),
          rupee(row.casinoPlayed),
          rupee(row.casinoPaid),
        ]),
      }
    }
    if (kind === 'bonus') {
      return {
        headers: ['Date and time', 'Player', 'Bonus type', 'Amount', 'Status'],
        rows: report.bonuses.map((row) => [row.when, row.username, row.type, rupee(row.amount), row.status]),
      }
    }
    if (kind === 'levels') {
      return {
        headers: ['Player', 'Level', 'Total play (INR)'],
        rows: report.levels.players.map((row) => [row.username, row.level, rupee(row.wageredInr)]),
      }
    }
    if (kind === 'sports') {
      return {
        headers: ['Date and time', 'Player', 'Sport', 'Pick', 'Stake', 'Odds', 'Paid', 'Status'],
        rows: report.sports.map((row) => [row.when, row.username, row.sport, row.pick, rupee(row.stake), String(row.odds), rupee(row.payout), row.status]),
      }
    }
    if (kind === 'games') {
      return {
        headers: ['Date and time', 'Player', 'Game', 'Stake', 'Win', 'Status'],
        rows: report.games.map((row) => [row.when, row.username, row.game, rupee(row.stake), rupee(row.win), row.status]),
      }
    }
    const summary = report.summary
    return {
      headers: ['What', 'Amount'],
      rows: [
        ['Deposits paid', rupee(summary.depositsPaid)],
        ['Deposits waiting', rupee(summary.depositsWaiting)],
        ['Withdrawals paid', rupee(summary.withdrawalsPaid)],
        ['Withdrawals waiting', rupee(summary.withdrawalsWaiting)],
        ['Bonus given', rupee(summary.bonusTotal)],
        ['Sports money played', rupee(summary.sportsPlayed)],
        ['Sports money paid back', rupee(summary.sportsPaid)],
        ['Sports profit', rupee(summary.sportsProfit)],
        ['Casino money played', rupee(summary.casinoPlayed)],
        ['Casino money paid back', rupee(summary.casinoPaid)],
        ['Casino profit', rupee(summary.casinoProfit)],
      ],
    }
  }, [kind, report])

  const cards = useMemo(() => {
    const summary = report?.summary
    const blank = loading ? '...' : 'Rs 0.00'
    const show = (value?: number) => (loading ? '...' : rupee(value || 0))
    if (kind === 'deposits') {
      return [
        { title: 'Deposits paid', value: summary ? show(summary.depositsPaid) : blank, trend: 'Money already added' },
        { title: 'Still waiting', value: summary ? show(summary.depositsWaiting) : blank, trend: 'Not approved yet' },
        { title: 'Lines', value: String(report?.deposits.length || 0), trend: 'Rows in this list' },
      ]
    }
    if (kind === 'withdrawals') {
      return [
        { title: 'Withdrawals paid', value: summary ? show(summary.withdrawalsPaid) : blank, trend: 'Money already sent' },
        { title: 'Still waiting', value: summary ? show(summary.withdrawalsWaiting) : blank, trend: 'Not approved yet' },
        { title: 'Lines', value: String(report?.withdrawals.length || 0), trend: 'Rows in this list' },
      ]
    }
    if (kind === 'bonus') {
      return [
        { title: 'Bonus given', value: summary ? show(summary.bonusTotal) : blank, trend: 'In the selected dates' },
        { title: 'Bonus lines', value: String(report?.bonuses.length || 0), trend: 'Rows in this list' },
      ]
    }
    if (kind === 'levels') {
      return (report?.levels.counts || ['Member', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map((level) => ({ level, players: 0 }))).map(
        (row) => ({ title: row.level, value: String(row.players), trend: 'Players on this level' }),
      )
    }
    if (kind === 'sports') {
      return [
        { title: 'Sports played', value: summary ? show(summary.sportsPlayed) : blank, trend: 'Stake in these dates' },
        { title: 'Sports paid back', value: summary ? show(summary.sportsPaid) : blank, trend: 'Winnings returned' },
        { title: 'Sports profit', value: summary ? show(summary.sportsProfit) : blank, trend: 'Played minus paid back' },
      ]
    }
    if (kind === 'games') {
      return [
        { title: 'Casino played', value: summary ? show(summary.casinoPlayed) : blank, trend: 'Stake in these dates' },
        { title: 'Casino paid back', value: summary ? show(summary.casinoPaid) : blank, trend: 'Winnings returned' },
        { title: 'Casino profit', value: summary ? show(summary.casinoProfit) : blank, trend: 'Played minus paid back' },
      ]
    }
    return [
      { title: 'Deposits paid', value: summary ? show(summary.depositsPaid) : blank, trend: 'Selected dates' },
      { title: 'Withdrawals paid', value: summary ? show(summary.withdrawalsPaid) : blank, trend: 'Selected dates' },
      { title: 'Bonus given', value: summary ? show(summary.bonusTotal) : blank, trend: 'Selected dates' },
      { title: 'Sports profit', value: summary ? show(summary.sportsProfit) : blank, trend: 'Played minus paid back' },
      { title: 'Casino profit', value: summary ? show(summary.casinoProfit) : blank, trend: 'Played minus paid back' },
    ]
  }, [kind, loading, report])

  const exportTitle = `${KINDS.find((item) => item.id === kind)?.label || 'Report'} ${formatIstRangeLabel(range.from, range.to)}`

  const exportRows = () => {
    if (kind === 'all') {
      return table.rows.map((row) => [row[0], Number(String(row[1]).replace(/[^\d.-]/g, '')) || 0])
    }
    return table.rows
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#14532d]">Reports</h1>
          <p className="mt-1 text-sm text-[#64748b]">{formatIstRangeLabel(range.from, range.to)}. Use the arrows for one day, or open the calendar and drag for more days.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
          <input
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') setAppliedName(playerName.trim())
            }}
            placeholder="All players"
            aria-label="Player name"
            className="h-10 w-44 rounded-lg border border-[#bbf7d0] bg-white px-3 text-sm text-[#14532d] placeholder:text-[#64748b]"
          />
          <button
            type="button"
            onClick={() => setAppliedName(playerName.trim())}
            className="h-10 rounded-lg bg-[#16a34a] px-4 text-sm font-semibold text-white hover:bg-[#15803d]"
          >
            {loading ? 'Loading...' : 'Find'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {KINDS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setKind(item.id)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${kind === item.id ? 'bg-[#14532d] text-white' : 'border border-[#bbf7d0] bg-white text-[#14532d]'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-[#166534]">{KIND_HELP[kind]}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCard key={card.title} title={card.title} value={card.value} trend={card.trend} />
        ))}
      </div>

      <div className="rounded-xl bg-white border border-[#bbf7d0] p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[#14532d]">{KINDS.find((item) => item.id === kind)?.label}</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => downloadExcel(`report-${kind}.xls`, exportTitle, table.headers, exportRows())}
              className="rounded-lg border border-[#14532d] px-4 py-2 text-sm font-semibold text-[#14532d]"
            >
              Download Excel
            </button>
            <button
              type="button"
              onClick={() => downloadPdf(`report-${kind}.pdf`, exportTitle, table.headers, table.rows)}
              className="rounded-lg border border-[#14532d] px-4 py-2 text-sm font-semibold text-[#14532d]"
            >
              Download PDF
            </button>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[#64748b] border-b border-[#e2e8f0] bg-[#e2e8f0]">
                {table.headers.map((header) => (
                  <th key={header} className="py-3 pr-4 font-medium whitespace-nowrap">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.length ? (
                table.rows.map((row, index) => (
                  <tr key={`${kind}-${index}`} className="border-b border-[#e2e8f0] text-[#020617]">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="py-3 pr-4 whitespace-nowrap">{cell}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={table.headers.length} className="py-8 text-center text-[#64748b]">
                    Nothing in these dates
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
