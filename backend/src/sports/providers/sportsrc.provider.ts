import axios from 'axios'
import { SportType, SportsMatchStatus } from '../sports.enums'
import type { ProviderMatch } from './cricket.provider'

export class SportSrcProvider {
  // Free API per SportsRC (no auth). Best-effort + cached fallback.
  private baseUrl = process.env.SPORTSRC_API_URL || 'https://www.sportsrc.org/api'

  private mapStatus(raw: string): SportsMatchStatus {
    const s = String(raw || '').toLowerCase()
    if (s.includes('live') || s.includes('inplay') || s.includes('in play')) return SportsMatchStatus.LIVE
    if (s.includes('ft') || s.includes('finished') || s.includes('ended') || s.includes('completed')) return SportsMatchStatus.FINISHED
    if (s.includes('cancel')) return SportsMatchStatus.CANCELLED
    return SportsMatchStatus.UPCOMING
  }

  async fetchMatches(sport: SportType.FOOTBALL | SportType.HOCKEY): Promise<ProviderMatch[]> {
    // SportsRC endpoints can vary; we implement a resilient parser.
    const sportPath = sport === SportType.FOOTBALL ? 'football' : 'hockey'
    const candidates = [
      `${this.baseUrl}/${sportPath}/matches`,
      `${this.baseUrl}/${sportPath}/live`,
      `${this.baseUrl}/${sportPath}`,
    ]

    for (const url of candidates) {
      try {
        const res = await axios.get(url, { timeout: 8000 })
        const items = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.matches || []
        const out: ProviderMatch[] = []

        for (const m of items) {
          const externalId = String(m?.id ?? m?.matchId ?? m?.match_id ?? '')
          const teamA = String(m?.homeTeam?.name ?? m?.home?.name ?? m?.team1 ?? m?.homeTeam ?? '').trim()
          const teamB = String(m?.awayTeam?.name ?? m?.away?.name ?? m?.team2 ?? m?.awayTeam ?? '').trim()
          if (!externalId || !teamA || !teamB) continue

          const league = String(m?.league?.name ?? m?.competition?.name ?? m?.tournament ?? m?.league ?? sportPath)
          const startTime = m?.startTime || m?.start_time || m?.date || m?.utcDate
          const start = startTime ? new Date(startTime) : undefined

          const status = this.mapStatus(m?.status ?? m?.state ?? m?.time ?? '')

          const score = {
            teamA: { score: m?.homeScore ?? m?.score?.home ?? m?.home?.score ?? 0 },
            teamB: { score: m?.awayScore ?? m?.score?.away ?? m?.away?.score ?? 0 },
          }

          out.push({
            sport,
            externalId,
            league,
            teamA,
            teamB,
            startTime: start && !isNaN(start.getTime()) ? start : undefined,
            status,
            score,
            result: m?.result ?? null,
          })
        }

        if (out.length > 0) return out
      } catch {
        // try next candidate
      }
    }

    return []
  }
}

