/**
 * Parses server card codes like 'AS', '10H', 'KD', 'QC' (suits S/H/D/C)
 * into rank + suit names used by the client card renderers.
 */

export type ServerSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades'

const SUIT_LETTER_MAP: Record<string, ServerSuit> = {
  S: 'spades',
  H: 'hearts',
  D: 'diamonds',
  C: 'clubs',
}

export function parseServerCard(code: string): { rank: string; suit: ServerSuit } {
  const suitLetter = code.slice(-1).toUpperCase()
  const rank = code.slice(0, -1).toUpperCase()
  return {
    rank,
    suit: SUIT_LETTER_MAP[suitLetter] ?? 'spades',
  }
}
