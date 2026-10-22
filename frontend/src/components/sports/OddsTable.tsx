'use client'

const MARKET_TITLES: Record<string, string> = {
  h2h: 'Match Winner',
  spreads: 'Handicap',
  totals: 'Total',
  btts: 'Both Teams to Score',
  draw_no_bet: 'Draw No Bet',
  toss: 'Toss Winner',
  innings_runs: 'Innings runs',
  current_over_runs: 'This over',
  next_ball: 'Next ball',
  player_runs: 'Player runs',
  player_fifty: 'To score 50',
}

const GROUPS = [
  { id: 'match', label: 'Match' },
  { id: 'totals', label: 'Totals & lines' },
  { id: 'players', label: 'Players' },
  { id: 'overs', label: 'Overs & balls' },
  { id: 'more', label: 'More markets' },
] as const

interface Outcome {
  name: string
  price: number
  point?: number
  description?: string
}

interface Market {
  key: string
  last_update?: string
  outcomes: Outcome[]
}

interface Bookmaker {
  key: string
  title: string
  last_update?: string
  markets: Market[]
}

interface OddsTableProps {
  bookmakers: Bookmaker[]
  homeTeam?: string
  awayTeam?: string
  bettingOpen?: boolean
  onOddsClick?: (
    market: string,
    outcome: string,
    odds: number,
    bookmaker: string,
    point: number | undefined,
    bookmakerKey: string,
  ) => void
}

function marketTitle(key: string) {
  if (MARKET_TITLES[key]) return MARKET_TITLES[key]
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function outcomeLabel(outcome: Outcome) {
  const extra = outcome.description ? ` · ${outcome.description}` : ''
  if (outcome.point == null) return `${outcome.name}${extra}`
  if (/\b(over|under)\b/i.test(outcome.name)) return `${outcome.name} ${outcome.point}${extra}`
  const point = outcome.point > 0 ? `+${outcome.point}` : String(outcome.point)
  return `${outcome.name} ${point}${extra}`
}

function marketGroup(key: string): (typeof GROUPS)[number]['id'] {
  const k = key.toLowerCase()
  if (/(player|batter|batsman|bowler|wicket|goalscorer|to_score|anytime|top_)/.test(k)) return 'players'
  if (/(over|ball|innings|session|next_over|powerplay)/.test(k)) return 'overs'
  if (/(total|spread|handicap|runs|points|line)/.test(k)) return 'totals'
  if (/(h2h|moneyline|winner|draw_no_bet|toss|match)/.test(k)) return 'match'
  return 'more'
}

export default function OddsTable({ bookmakers, homeTeam, awayTeam, bettingOpen = true, onOddsClick }: OddsTableProps) {
  const marketKeys = Array.from(
    new Set(
      bookmakers.flatMap((book) => book.markets.map((market) => market.key)).filter((key) => !key.endsWith('_lay')),
    ),
  )
  const preferred = ['h2h', 'spreads', 'totals', 'btts', 'draw_no_bet']
  marketKeys.sort((a, b) => {
    const ai = preferred.indexOf(a)
    const bi = preferred.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  if (!bookmakers.length || !marketKeys.length) {
    return (
      <div className="rounded-2xl border border-line bg-card p-6 text-center">
        <p className="text-sm text-ink-2">Prices for this match are not up yet.</p>
        <p className="mt-1 text-xs text-ink-3">Open the match again in a minute — nested markets load from the live feed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {GROUPS.map((group) => {
        const keys = marketKeys.filter((key) => marketGroup(key) === group.id)
        if (!keys.length) return null
        return (
          <details key={group.id} open className="rounded-2xl border border-line bg-card">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink">
              {group.label}
              <span className="ml-2 text-xs font-normal text-ink-3">{keys.length}</span>
            </summary>
            <div className="space-y-4 border-t border-line px-4 py-3">
              {keys.map((marketKey) => (
                <section key={marketKey}>
                  <h3 className="text-sm font-semibold text-ink">{marketTitle(marketKey)}</h3>
                  <div className="mt-2 space-y-2">
                    {bookmakers.map((book) => {
                      const market = book.markets.find((item) => item.key === marketKey)
                      if (!market) return null
                      const outcomes = [...market.outcomes].sort((a, b) => {
                        const order = [homeTeam, 'Draw', awayTeam, 'Over', 'Under', 'Yes', 'No']
                        const ai = order.findIndex((name) => name?.toLowerCase() === a.name.toLowerCase())
                        const bi = order.findIndex((name) => name?.toLowerCase() === b.name.toLowerCase())
                        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
                      })
                      return (
                        <div key={book.key} className="rounded-xl bg-elevated p-3">
                          <p className="mb-2 text-xs font-medium text-ink-3">{book.title}</p>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {outcomes.map((outcome) => (
                              <button
                                key={`${book.key}-${outcome.name}-${outcome.point ?? ''}-${outcome.description ?? ''}`}
                                type="button"
                                disabled={!bettingOpen}
                                onClick={() =>
                                  onOddsClick?.(marketKey, outcome.name, outcome.price, book.title, outcome.point, book.key)
                                }
                                className="flex items-center justify-between rounded-lg border border-line bg-bg-2 px-3 py-2.5 text-left transition-colors hover:border-brand/40 hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <span className="truncate pr-2 text-sm text-ink-2">{outcomeLabel(outcome)}</span>
                                <span className="odds-num text-sm font-bold text-ink">{outcome.price.toFixed(2)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </details>
        )
      })}
    </div>
  )
}
