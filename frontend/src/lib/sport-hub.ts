export type SportHubItem = {
  slug: string
  name: string
  desc: string
  image: string
  groups: string[]
  leagueIncludes?: string[]
}

export const SPORT_HUB: SportHubItem[] = [
  {
    slug: 'football',
    name: 'Football',
    desc: 'Club leagues, cups and internationals worldwide.',
    image: '/sports/soccer-thumb.png',
    groups: ['Soccer'],
  },
  {
    slug: 'cricket',
    name: 'Cricket',
    desc: 'Worldwide — India, England, Australia, USA and every other cricket nation.',
    image: '/sports/cricket-thumb.png',
    groups: ['Cricket'],
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    desc: 'NBA, WNBA and college basketball.',
    image: '/sports/basketball-thumb.png',
    groups: ['Basketball'],
  },
  {
    slug: 'tennis',
    name: 'Tennis',
    desc: 'ATP and WTA tours.',
    image: '/sports/tennis-thumb.png',
    groups: ['Tennis'],
  },
  {
    slug: 'baseball',
    name: 'Baseball',
    desc: 'MLB and other baseball fixtures.',
    image: '/sports/baseball-thumb.png',
    groups: ['Baseball'],
  },
  {
    slug: 'american-football',
    name: 'American Football',
    desc: 'NFL and college football.',
    image: '/sports/american-football-thumb.png',
    groups: ['American Football'],
  },
  {
    slug: 'ice-hockey',
    name: 'Ice Hockey',
    desc: 'NHL and hockey leagues.',
    image: '/sports/ice-hockey-thumb.png',
    groups: ['Ice Hockey'],
  },
  {
    slug: 'rugby',
    name: 'Rugby',
    desc: 'Union, league and international rugby.',
    image: '/sports/rugby-thumb.png',
    groups: ['Rugby'],
  },
]

export function sportBySlug(slug: string | undefined) {
  if (!slug) return undefined
  return SPORT_HUB.find((item) => item.slug === slug)
}

export function matchBelongsToSport(
  match: { sport?: string; league?: string; sport_title?: string },
  item: SportHubItem,
) {
  const group = String(match.sport || match.sport_title || '').toLowerCase()
  if (!item.groups.some((name) => name.toLowerCase() === group)) return false
  if (!item.leagueIncludes?.length) return true
  const hay = `${match.league || ''} ${match.sport || ''} ${match.sport_title || ''}`.toLowerCase()
  return item.leagueIncludes.some((keyword) => hay.includes(keyword))
}
