import { OddsMarket, OddsOutcome } from './providers/odds-api.provider'

export type EspnProp = {
  athlete?: { $ref?: string }
  team?: { $ref?: string }
  type?: { name?: string }
  current?: {
    over?: { decimal?: number }
    target?: { value?: number }
  }
}

const SKIP =
  /double chance|correct score|half time or full time|both teams to score|odd\/even|clean sheet|handicap|first corner|last corner|\bexact\b/i

type LineQuote = { key: string; who: string; line: number; price: number }

export function mapEspnProps(
  items: EspnProp[],
  athletes: Map<string, string>,
  teams: Map<string, string>,
): OddsMarket[] {
  const grouped = new Map<string, OddsMarket>()
  const lines: LineQuote[] = []

  for (const item of items) {
    const typeName = String(item?.type?.name || '').trim()
    if (!typeName || SKIP.test(typeName)) continue
    const price = Number(item?.current?.over?.decimal)
    if (!(price > 1)) continue

    const athleteId = refId(item?.athlete?.$ref, 'athletes')
    const teamId = refId(item?.team?.$ref, 'teams')
    const player = athleteId ? athletes.get(athleteId) || '' : ''
    const team = teamId ? teams.get(teamId) || '' : ''
    const line = Number(item?.current?.target?.value)
    const hasLine = Number.isFinite(line)
    const key = slug(typeName)

    if (player) {
      pushOutcome(grouped, key, { name: player, price })
      continue
    }
    if (hasLine) {
      lines.push({ key, who: team, line, price })
      continue
    }
    if (/moneyline/i.test(typeName)) {
      pushOutcome(grouped, key, { name: team || 'Draw', price })
      continue
    }
    if (team) pushOutcome(grouped, key, { name: team, price })
  }

  for (const outcome of resolveLines(lines)) {
    pushOutcome(grouped, outcome.key, { name: outcome.name, price: outcome.price, point: outcome.point })
  }

  const markets = [...grouped.values()].filter((market) => market.outcomes.length > 0)
  for (const market of markets) {
    market.outcomes.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name))
  }
  markets.sort((a, b) => rank(a.key) - rank(b.key) || a.key.localeCompare(b.key))
  return markets
}

function pushOutcome(grouped: Map<string, OddsMarket>, key: string, outcome: OddsOutcome) {
  if (!grouped.has(key)) grouped.set(key, { key, outcomes: [] })
  const market = grouped.get(key)!
  const existing = market.outcomes.find((row) => row.name === outcome.name && row.point === outcome.point)
  if (existing) existing.price = outcome.price
  else market.outcomes.push(outcome)
}

function resolveLines(quotes: LineQuote[]) {
  const buckets = new Map<string, LineQuote[]>()
  for (const quote of quotes) {
    const bucketKey = `${quote.key}::${quote.who}`
    const list = buckets.get(bucketKey) || []
    list.push(quote)
    buckets.set(bucketKey, list)
  }
  const resolved: Array<{ key: string; name: string; price: number; point: number }> = []
  for (const list of buckets.values()) {
    const sample = list[0]
    const byLine = new Map<number, number[]>()
    for (const quote of list) {
      const prices = byLine.get(quote.line) || []
      if (!prices.includes(quote.price)) prices.push(quote.price)
      byLine.set(quote.line, prices)
    }
    const labeled = labelLineGroup(byLine)
    if (!labeled) continue
    const prefix = sample.who ? `${sample.who} ` : ''
    for (const row of labeled) {
      resolved.push({ key: sample.key, name: `${prefix}${row.side}`, price: row.price, point: row.line })
    }
  }
  return resolved
}

function labelLineGroup(byLine: Map<number, number[]>) {
  const lines = [...byLine.keys()].sort((a, b) => a - b)
  if (lines.length < 2) return null
  if (lines.some((line) => (byLine.get(line) || []).length !== 2)) return null
  let best: { score: number; overs: number[]; unders: number[] } | null = null
  const limit = 1 << lines.length
  if (limit > 1024) return null
  for (let mask = 0; mask < limit; mask += 1) {
    const overs: number[] = []
    const unders: number[] = []
    for (let index = 0; index < lines.length; index += 1) {
      const prices = byLine.get(lines[index])!
      const pick = (mask >> index) & 1
      overs.push(prices[pick])
      unders.push(prices[1 - pick])
    }
    if (!nonDecreasing(overs) || !nonIncreasing(unders)) continue
    const score = overs[0] <= unders[0] ? 1 : 0
    if (!best || score > best.score) best = { score, overs, unders }
  }
  if (!best) return null
  return [
    ...lines.map((line, index) => ({ side: 'Over', line, price: best!.overs[index] })),
    ...lines.map((line, index) => ({ side: 'Under', line, price: best!.unders[index] })),
  ]
}

function nonDecreasing(values: number[]) {
  return values.every((value, index) => index === 0 || value >= values[index - 1])
}

function nonIncreasing(values: number[]) {
  return values.every((value, index) => index === 0 || value <= values[index - 1])
}

export function goalsFromBoxscore(boxscore: any): Map<string, number> | null {
  const sides = boxscore?.players
  if (!Array.isArray(sides) || !sides.length) return null
  const goals = new Map<string, number>()
  let found = false
  for (const side of sides) {
    const statistics = Array.isArray(side?.statistics) ? side.statistics : []
    for (const stat of statistics) {
      const names: unknown[] = Array.isArray(stat?.names) ? stat.names : []
      const labels: unknown[] = Array.isArray(stat?.labels) ? stat.labels : []
      const source = names.length ? names : labels
      const goalIndex = source.findIndex((label) => /^(goals?|g)$/i.test(String(label).trim()))
      if (goalIndex < 0) continue
      found = true
      for (const row of stat?.athletes || []) {
        const name = String(row?.athlete?.displayName || row?.athlete?.fullName || '').trim().toLowerCase()
        const value = Number(row?.stats?.[goalIndex])
        if (!name || !Number.isFinite(value)) continue
        goals.set(name, value)
      }
    }
  }
  return found ? goals : null
}

function rank(key: string) {
  if (key.includes('moneyline')) return 1
  if (key.includes('total') && !key.includes('player')) return 2
  if (key.includes('goalscorer')) return 3
  if (key.includes('to_score')) return 4
  return 5
}

function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 60)
}

function refId(ref: string | undefined, kind: 'athletes' | 'teams') {
  const match = String(ref || '').match(new RegExp(`/${kind}/(\\d+)`))
  return match ? match[1] : ''
}
