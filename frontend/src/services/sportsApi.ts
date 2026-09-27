import { MatchData } from '@/components/sports/MatchCard'

// Odds are fetched through our backend proxy so The Odds API key never
// reaches the browser (see backend GET /api/sports/odds/upcoming).
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lucky-games.onrender.com/api'

export interface SportCategory {
  sport_title: string
  count: number
}

export interface SportsApiResponse {
  data: MatchData[]
  categories: SportCategory[]
  lastUpdated: Date
}

class SportsApiService {
  private cache: SportsApiResponse | null = null
  private cacheTimeout: number = 30000 // 30 seconds cache
  private lastFetch: number = 0

  async fetchUpcomingOdds(): Promise<SportsApiResponse> {
    const now = Date.now()
    
    // Return cached data if still valid
    if (this.cache && (now - this.lastFetch) < this.cacheTimeout) {
      return this.cache
    }

    try {
      const response = await fetch(`${API_BASE}/sports/odds/upcoming`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const rawData = await response.json()
      
      // Process and normalize the data
      const processedData = this.processApiResponse(rawData)
      
      // Update cache
      this.cache = processedData
      this.lastFetch = now
      
      return processedData
    } catch (error) {
      console.error('Error fetching sports data:', error)
      
      // Return cached data if available, even if expired
      if (this.cache) {
        console.warn('Using expired cache due to API error')
        return this.cache
      }
      
      throw error
    }
  }

  private processApiResponse(rawData: any[]): SportsApiResponse {
    // Deduplicate matches by ID
    const uniqueMatches = new Map<string, MatchData>()
    
    rawData.forEach(item => {
      if (!uniqueMatches.has(item.id)) {
        uniqueMatches.set(item.id, {
          id: item.id,
          sport_key: item.sport_key,
          sport_title: item.sport_title,
          commence_time: item.commence_time,
          home_team: item.home_team,
          away_team: item.away_team,
          bookmakers: item.bookmakers || []
        })
      }
    })

    const matches = Array.from(uniqueMatches.values())
    
    // Group by sport category and count matches
    const categoryMap = new Map<string, number>()
    matches.forEach(match => {
      categoryMap.set(match.sport_title, (categoryMap.get(match.sport_title) || 0) + 1)
    })

    const categories: SportCategory[] = Array.from(categoryMap.entries()).map(([sport_title, count]) => ({
      sport_title,
      count
    }))

    return {
      data: matches,
      categories,
      lastUpdated: new Date()
    }
  }

  // Get matches filtered by category
  async getMatchesByCategory(category?: string): Promise<MatchData[]> {
    const response = await this.fetchUpcomingOdds()
    
    if (!category) {
      return response.data
    }
    
    return response.data.filter(match => match.sport_title === category)
  }

  // Get single match by ID
  async getMatchById(matchId: string): Promise<MatchData | null> {
    const response = await this.fetchUpcomingOdds()
    return response.data.find(match => match.id === matchId) || null
  }

  // Force refresh cache
  async forceRefresh(): Promise<SportsApiResponse> {
    this.cache = null
    this.lastFetch = 0
    return this.fetchUpcomingOdds()
  }

  // Get cache status
  getCacheStatus(): { isCached: boolean; age: number; isValid: boolean } {
    const now = Date.now()
    const age = this.lastFetch ? now - this.lastFetch : 0
    const isValid = !!this.cache && age < this.cacheTimeout
    
    return {
      isCached: !!this.cache,
      age,
      isValid
    }
  }
}

// Export singleton instance
export const sportsApi = new SportsApiService()

// Export utility functions
export const formatOdds = (price: number): string => {
  return price.toFixed(2)
}

export const getOddsColor = (price: number): string => {
  if (price <= 1.5) return 'text-[#22c55e]' // Favorable odds
  if (price >= 3.0) return 'text-[#ef4444]' // Risky odds
  return 'text-white'
}

export const isMatchLive = (commenceTime: string): boolean => {
  return new Date().getTime() > new Date(commenceTime).getTime()
}

export const formatCommenceTime = (commenceTime: string): string => {
  const date = new Date(commenceTime)
  return date.toLocaleString()
}
