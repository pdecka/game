export type BetHistoryItem = {
  id: string
  source: 'sports' | 'game'
  userId: string
  username: string
  playedAt: string
  game: string
  prediction: string
  outcome: string
  detail: string
  amount: number
  currency: string
  odds: number | null
  payout: number
  status: string
}

export type BetHistoryResponse = {
  items: BetHistoryItem[]
  total: number
  page: number
  pageSize: number
  order: 'asc' | 'desc'
  summary: {
    total: number
    totalStake: number
    totalPayout: number
    open: number
  }
}

export function formatBetMoney(amount: number, currency = 'INR') {
  const value = Number(amount || 0)
  if (currency === 'INR') return `₹${value.toFixed(2)}`
  return `${value.toFixed(2)} ${currency}`
}

export function formatBetWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

export function formatOdds(odds: number | null) {
  if (odds == null || !Number.isFinite(Number(odds))) return '—'
  return Number(odds).toFixed(2)
}

export function betStatusLabel(status: string) {
  if (status === 'pending') return 'Pending'
  if (status === 'won') return 'Won'
  if (status === 'lost') return 'Lost'
  if (status === 'push') return 'Push'
  if (status === 'void') return 'Void'
  if (status === 'cancelled') return 'Cancelled'
  return status
}
