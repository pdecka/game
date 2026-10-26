export type SportHubItem = {
  slug: string
  name: string
  groups: string[]
  leagueIncludes?: string[]
}

export const SPORT_HUB: SportHubItem[] = [
  { slug: 'football', name: 'Football', groups: ['Soccer'] },
  { slug: 'cricket', name: 'Cricket', groups: ['Cricket'] },
  { slug: 'basketball', name: 'Basketball', groups: ['Basketball'] },
  { slug: 'tennis', name: 'Tennis', groups: ['Tennis'] },
  { slug: 'baseball', name: 'Baseball', groups: ['Baseball'] },
  { slug: 'american-football', name: 'American Football', groups: ['American Football'] },
  { slug: 'ice-hockey', name: 'Ice Hockey', groups: ['Ice Hockey'] },
  { slug: 'rugby', name: 'Rugby', groups: ['Rugby'] },
  { slug: 'golf', name: 'Golf', groups: ['Golf'] },
  { slug: 'boxing', name: 'Boxing', groups: ['Boxing', 'MMA'] },
  { slug: 'f1-racing', name: 'F1 Racing', groups: ['Racing'] },
  { slug: 'horse-racing', name: 'Horse Racing', groups: ['Horse Racing'] },
  { slug: 'election', name: 'Election', groups: ['Politics'] },
]

export function sportBySlug(slug: string | undefined) {
  if (!slug) return undefined
  return SPORT_HUB.find((item) => item.slug === slug)
}

export function matchBelongsToSport(
  match: { sport?: string; league?: string },
  item: SportHubItem,
) {
  const group = String(match.sport || '').toLowerCase()
  if (!item.groups.some((name) => name.toLowerCase() === group)) return false
  if (!item.leagueIncludes?.length) return true
  const hay = `${match.league || ''} ${match.sport || ''}`.toLowerCase()
  return item.leagueIncludes.some((keyword) => hay.includes(keyword))
}
