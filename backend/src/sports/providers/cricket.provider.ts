import axios from 'axios'
import { SportType, SportsMatchStatus } from '../sports.enums'

export type ProviderMatch = {
  sport: SportType
  externalId: string
  league: string
  teamA: string
  teamB: string
  startTime?: Date
  status: SportsMatchStatus
  score?: any
  result?: any
}

export class CricketProvider {
  // Free, unauthenticated endpoint (scraper-backed). Best-effort.
  // If it changes upstream, we still keep system stable by falling back to cached DB.
  private baseUrl = process.env.CRICKET_API_URL || 'https://cricbuzz-live.vercel.app'

  async fetchLiveAndUpcoming(): Promise<ProviderMatch[]> {
    const out: ProviderMatch[] = []
    const endpoints = ['/v1/matches/live', '/v1/matches/recent']

    for (const ep of endpoints) {
      try {
        const res = await axios.get(`${this.baseUrl}${ep}`, { timeout: 8000 })
        const items = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.matches || []

        for (const m of items) {
          const externalId = String(m?.id ?? m?.matchId ?? m?.match_id ?? '')
          const teamA = String(m?.team1?.name ?? m?.teamA?.name ?? m?.team1 ?? m?.teamA ?? '').trim()
          const teamB = String(m?.team2?.name ?? m?.teamB?.name ?? m?.team2 ?? m?.teamB ?? '').trim()
          if (!externalId || !teamA || !teamB) continue

          const statusRaw = String(m?.status ?? m?.state ?? '').toLowerCase()
          let status = SportsMatchStatus.UPCOMING
          if (statusRaw.includes('live') || statusRaw.includes('in progress')) status = SportsMatchStatus.LIVE
          if (statusRaw.includes('complete') || statusRaw.includes('finished') || statusRaw.includes('result')) status = SportsMatchStatus.FINISHED

          const league = String(m?.series ?? m?.league ?? m?.tournament ?? 'Cricket')
          const startTime = m?.startTime || m?.start_time || m?.dateTimeGMT || m?.date
          const start = startTime ? new Date(startTime) : undefined

          out.push({
            sport: SportType.CRICKET,
            externalId,
            league,
            teamA,
            teamB,
            startTime: start && !isNaN(start.getTime()) ? start : undefined,
            status,
            score: m?.score || m?.scores || null,
            result: m?.result || null,
          })
        }
      } catch {
        // ignore; we fall back to cached DB
      }
    }

    // de-dup by externalId
    const seen = new Set<string>()
    return out.filter((m) => {
      if (seen.has(m.externalId)) return false
      seen.add(m.externalId)
      return true
    })
  }

  async fetchMatchDetails(externalId: string): Promise<Partial<ProviderMatch> | null> {
    try {
      const res = await axios.get(`${this.baseUrl}/v1/score/${externalId}`, { timeout: 8000 })
      const data = res.data?.data ?? res.data
      if (!data) return null
      return {
        sport: SportType.CRICKET,
        externalId,
        score: data?.score || data?.scores || data,
        result: data?.result || null,
      }
    } catch {
      return null
    }
  }
}

