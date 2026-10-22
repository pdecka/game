import { NormalizedEvent } from './odds-api.provider'

type CricinfoTeam = { team?: { longName?: string; name?: string } }
type CricinfoMatch = {
  objectId?: number
  slug?: string
  title?: string
  status?: string | { description?: string }
  startTime?: string
  teams?: CricinfoTeam[]
  series?: { name?: string; longName?: string }
  format?: string
  stage?: string
}

export class CricinfoProvider {
  async refresh(): Promise<NormalizedEvent[]> {
    const urls = [
      'https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current?lang=en&latest=true',
      'https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current?lang=en&recent=true',
    ]
    const events: NormalizedEvent[] = []
    const seen = new Set<string>()
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 ArenaBet' },
          signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) continue
        const json = (await res.json()) as {
          matches?: CricinfoMatch[] | Record<string, CricinfoMatch[]>
          content?: { matches?: CricinfoMatch[] | Record<string, CricinfoMatch[]> }
        }
        const rows = this.flattenMatches(json.matches || json.content?.matches)
        for (const row of rows) {
          const mapped = this.mapMatch(row)
          if (!mapped || seen.has(mapped.externalId)) continue
          seen.add(mapped.externalId)
          events.push(mapped)
        }
      } catch {
        // ESPN scoreboard still covers cricket if this feed is down.
      }
    }
    return events
  }

  private flattenMatches(raw: CricinfoMatch[] | Record<string, CricinfoMatch[]> | undefined): CricinfoMatch[] {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    return Object.values(raw).flatMap((value) => (Array.isArray(value) ? value : []))
  }

  private mapMatch(row: CricinfoMatch): NormalizedEvent | null {
    const id = row.objectId
    const teams = Array.isArray(row.teams) ? row.teams : []
    const home = String(teams[0]?.team?.longName || teams[0]?.team?.name || '').trim()
    const away = String(teams[1]?.team?.longName || teams[1]?.team?.name || '').trim()
    if (!id || !home || !away) return null
    const statusText = typeof row.status === 'string' ? row.status : String(row.status?.description || '')
    const completed = /result|complete|abandon/i.test(statusText)
    const series = String(row.series?.longName || row.series?.name || row.title || 'Cricket')
    return {
      externalId: `cricinfo-${id}`,
      sportKey: 'cricket/international',
      sportGroup: 'Cricket',
      sportTitle: series,
      homeTeam: home,
      awayTeam: away,
      commenceTime: row.startTime || new Date().toISOString(),
      bookmakers: [],
      source: 'espn',
      completed,
    }
  }
}
