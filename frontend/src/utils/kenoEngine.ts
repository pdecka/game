/**
 * Keno game engine with state management
 * Handles game logic, state transitions, and result calculation
 */

import type { Difficulty } from './kenoPayout'
import { calculatePayout, getMinimumHitsToWin } from './kenoPayout'
import { generateKenoDraw, calculateMatches } from './shuffle'

export type GameState = 'idle' | 'selecting' | 'drawing' | 'result'

export interface KenoBet {
  id: string
  amount: number
  selectedNumbers: number[]
  difficulty: Difficulty
  timestamp: number
}

export interface KenoDraw {
  id: string
  numbers: number[]
  timestamp: number
  seed?: number // For provably fair
}

export interface KenoResult {
  id: string
  bet: KenoBet
  draw: KenoDraw
  matches: number
  payout: number
  profit: number
  multiplier: number
  isWin: boolean
  timestamp: number
}

export interface KenoRound {
  id: string
  result: KenoResult
  timestamp: number
}

export interface KenoGameState {
  state: GameState
  selectedNumbers: number[]
  currentBet: KenoBet | null
  currentDraw: KenoDraw | null
  currentResult: KenoResult | null
  gameHistory: KenoRound[]
  drawingNumbers: number[] // Numbers being revealed during animation
  animationIndex: number
}

export interface GameConfig {
  minBet: number
  maxBet: number
  maxSelections: number
  minSelections: number
  recommendedMinSelections: number
  animationDuration: number
}

export const KENO_GAME_CONFIG: GameConfig = {
  minBet: 1,
  maxBet: 10000,
  maxSelections: 10,
  minSelections: 1,
  recommendedMinSelections: 4,
  animationDuration: 3000 // 3 seconds for draw animation
}

export function createKenoGameState(): KenoGameState {
  return {
    state: 'idle',
    selectedNumbers: [],
    currentBet: null,
    currentDraw: null,
    currentResult: null,
    gameHistory: [],
    drawingNumbers: [],
    animationIndex: 0
  }
}

export function selectNumber(gameState: KenoGameState, number: number): KenoGameState {
  const { selectedNumbers, state } = gameState
  
  // Can only select numbers in idle or selecting state
  if (!['idle', 'selecting'].includes(state)) {
    return gameState
  }
  
  // Check if number is already selected
  if (selectedNumbers.includes(number)) {
    return {
      ...gameState,
      selectedNumbers: selectedNumbers.filter(n => n !== number),
      state: selectedNumbers.length > 1 ? 'selecting' : 'idle'
    }
  }
  
  // Check max selections
  if (selectedNumbers.length >= KENO_GAME_CONFIG.maxSelections) {
    return gameState
  }
  
  const newSelectedNumbers = [...selectedNumbers, number].sort((a, b) => a - b)
  
  return {
    ...gameState,
    selectedNumbers: newSelectedNumbers,
    state: newSelectedNumbers.length > 0 ? 'selecting' : 'idle'
  }
}

export function clearSelections(gameState: KenoGameState): KenoGameState {
  return {
    ...gameState,
    selectedNumbers: [],
    state: 'idle'
  }
}

export function quickPick(gameState: KenoGameState, count: number = 10): KenoGameState {
  // Generate random unique numbers
  const numbers: number[] = []
  const availableNumbers = Array.from({ length: 40 }, (_, i) => i + 1)
  
  for (let i = 0; i < Math.min(count, KENO_GAME_CONFIG.maxSelections); i++) {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length)
    numbers.push(availableNumbers[randomIndex])
    availableNumbers.splice(randomIndex, 1)
  }
  
  return {
    ...gameState,
    selectedNumbers: numbers.sort((a, b) => a - b),
    state: 'selecting'
  }
}

export function startGame(
  gameState: KenoGameState,
  betAmount: number,
  difficulty: Difficulty
): KenoGameState {
  const { selectedNumbers } = gameState
  
  // Validate selections
  if (selectedNumbers.length === 0) {
    return gameState
  }
  
  if (selectedNumbers.length < KENO_GAME_CONFIG.recommendedMinSelections) {
    // Allow but warn (in real implementation)
  }
  
  // Validate bet amount
  if (betAmount < KENO_GAME_CONFIG.minBet || betAmount > KENO_GAME_CONFIG.maxBet) {
    return gameState
  }
  
  // Create bet
  const bet: KenoBet = {
    id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount: betAmount,
    selectedNumbers: [...selectedNumbers],
    difficulty,
    timestamp: Date.now()
  }
  
  return {
    ...gameState,
    currentBet: bet,
    state: 'drawing',
    drawingNumbers: [],
    animationIndex: 0
  }
}

export function generateDraw(gameState: KenoGameState): KenoGameState {
  const { currentBet } = gameState
  
  if (!currentBet) {
    return gameState
  }
  
  // Generate draw numbers
  const drawNumbers = generateKenoDraw()
  
  const draw: KenoDraw = {
    id: `draw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    numbers: drawNumbers,
    timestamp: Date.now()
  }
  
  return {
    ...gameState,
    currentDraw: draw,
    drawingNumbers: []
  }
}

export function revealNextNumber(gameState: KenoGameState): KenoGameState {
  const { currentDraw, drawingNumbers, animationIndex } = gameState
  
  if (!currentDraw || animationIndex >= currentDraw.numbers.length) {
    return gameState
  }
  
  const nextNumber = currentDraw.numbers[animationIndex]
  const newDrawingNumbers = [...drawingNumbers, nextNumber]
  
  return {
    ...gameState,
    drawingNumbers: newDrawingNumbers,
    animationIndex: animationIndex + 1
  }
}

export function finishDraw(gameState: KenoGameState): KenoGameState {
  const { currentBet, currentDraw } = gameState
  
  if (!currentBet || !currentDraw) {
    return gameState
  }
  
  // Calculate matches
  const matches = calculateMatches(currentBet.selectedNumbers, currentDraw.numbers)
  
  // Calculate payout
  const { payout, profit, multiplier, isWin } = calculatePayout(
    currentBet.amount,
    matches,
    currentBet.difficulty
  )
  
  // Create result
  const result: KenoResult = {
    id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    bet: currentBet,
    draw: currentDraw,
    matches,
    payout,
    profit,
    multiplier,
    isWin,
    timestamp: Date.now()
  }
  
  // Create round
  const round: KenoRound = {
    id: `round-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    result,
    timestamp: Date.now()
  }
  
  return {
    ...gameState,
    currentResult: result,
    gameHistory: [round, ...gameState.gameHistory.slice(0, 49)], // Keep last 50 rounds
    state: 'result',
    drawingNumbers: currentDraw.numbers,
    animationIndex: currentDraw.numbers.length
  }
}

export function resetGame(gameState: KenoGameState): KenoGameState {
  return {
    ...gameState,
    selectedNumbers: [],
    currentBet: null,
    currentDraw: null,
    currentResult: null,
    state: 'idle',
    drawingNumbers: [],
    animationIndex: 0
  }
}

export function playFullGame(
  selectedNumbers: number[],
  betAmount: number,
  difficulty: Difficulty
): KenoResult {
  // Simulate complete game flow
  const bet: KenoBet = {
    id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount: betAmount,
    selectedNumbers: [...selectedNumbers],
    difficulty,
    timestamp: Date.now()
  }
  
  const drawNumbers = generateKenoDraw()
  const draw: KenoDraw = {
    id: `draw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    numbers: drawNumbers,
    timestamp: Date.now()
  }
  
  const matches = calculateMatches(selectedNumbers, drawNumbers)
  const { payout, profit, multiplier, isWin } = calculatePayout(
    betAmount,
    matches,
    difficulty
  )
  
  return {
    id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    bet,
    draw,
    matches,
    payout,
    profit,
    multiplier,
    isWin,
    timestamp: Date.now()
  }
}

export function canSelectNumbers(gameState: KenoGameState): boolean {
  return ['idle', 'selecting'].includes(gameState.state)
}

export function canStartGame(gameState: KenoGameState): boolean {
  return gameState.selectedNumbers.length > 0 && gameState.state === 'selecting'
}

export function isGameActive(gameState: KenoGameState): boolean {
  return ['drawing', 'result'].includes(gameState.state)
}

export function getGameStateText(gameState: GameState): string {
  const texts: Record<GameState, string> = {
    'idle': 'Select Numbers',
    'selecting': 'Select Numbers',
    'drawing': 'Drawing Numbers',
    'result': 'Game Complete'
  }
  
  return texts[gameState]
}

export function getGameStateColor(gameState: GameState): string {
  const colors: Record<GameState, string> = {
    'idle': 'text-slate-400',
    'selecting': 'text-blue-400',
    'drawing': 'text-orange-400',
    'result': 'text-emerald-400'
  }
  
  return colors[gameState]
}

export function getGameProgress(gameState: KenoGameState): number {
  const { state, animationIndex, currentDraw } = gameState
  
  if (state === 'idle' || state === 'selecting') return 0
  if (state === 'result') return 100
  
  if (state === 'drawing' && currentDraw) {
    return (animationIndex / currentDraw.numbers.length) * 100
  }
  
  return 0
}

export function validateBet(amount: number, selections: number[]): {
  isValid: boolean
  error?: string
} {
  if (amount <= 0) {
    return { isValid: false, error: 'Bet amount must be greater than 0' }
  }
  
  if (amount < KENO_GAME_CONFIG.minBet) {
    return { isValid: false, error: `Minimum bet is ${KENO_GAME_CONFIG.minBet}` }
  }
  
  if (amount > KENO_GAME_CONFIG.maxBet) {
    return { isValid: false, error: `Maximum bet is ${KENO_GAME_CONFIG.maxBet}` }
  }
  
  if (selections.length === 0) {
    return { isValid: false, error: 'Please select at least one number' }
  }
  
  if (selections.length > KENO_GAME_CONFIG.maxSelections) {
    return { isValid: false, error: `Maximum ${KENO_GAME_CONFIG.maxSelections} selections allowed` }
  }
  
  return { isValid: true }
}

export function formatGameId(gameId: string): string {
  return gameId.slice(-8).toUpperCase()
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function getWinRate(history: KenoRound[]): number {
  if (history.length === 0) return 0
  
  const wins = history.filter(round => round.result.isWin).length
  return (wins / history.length) * 100
}

export function getTotalProfit(history: KenoRound[]): number {
  return history.reduce((total, round) => total + round.result.profit, 0)
}

export function getAverageBet(history: KenoRound[]): number {
  if (history.length === 0) return 0
  
  const totalBet = history.reduce((total, round) => total + round.result.bet.amount, 0)
  return totalBet / history.length
}

export function getAverageMatches(history: KenoRound[]): number {
  if (history.length === 0) return 0
  
  const totalMatches = history.reduce((total, round) => total + round.result.matches, 0)
  return totalMatches / history.length
}

export function getMostSelectedNumbers(history: KenoRound[]): number[] {
  if (history.length === 0) return []
  
  const numberCounts: Record<number, number> = {}
  
  // Initialize all numbers with 0
  for (let i = 1; i <= 40; i++) {
    numberCounts[i] = 0
  }
  
  // Count selections
  history.forEach(round => {
    round.result.bet.selectedNumbers.forEach(num => {
      if (num >= 1 && num <= 40) {
        numberCounts[num]++
      }
    })
  })
  
  const maxCount = Math.max(...Object.values(numberCounts))
  return Object.entries(numberCounts)
    .filter(([_, count]) => count === maxCount)
    .map(([num]) => parseInt(num))
}

export function getMostDrawnNumbers(history: KenoRound[]): number[] {
  if (history.length === 0) return []
  
  const numberCounts: Record<number, number> = {}
  
  // Initialize all numbers with 0
  for (let i = 1; i <= 40; i++) {
    numberCounts[i] = 0
  }
  
  // Count draws
  history.forEach(round => {
    round.result.draw.numbers.forEach(num => {
      if (num >= 1 && num <= 40) {
        numberCounts[num]++
      }
    })
  })
  
  const maxCount = Math.max(...Object.values(numberCounts))
  return Object.entries(numberCounts)
    .filter(([_, count]) => count === maxCount)
    .map(([num]) => parseInt(num))
}

export function generateMockHistory(count: number = 20): KenoRound[] {
  const history: KenoRound[] = []
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']
  
  for (let i = 0; i < count; i++) {
    // Generate random selections
    const selectionCount = Math.floor(Math.random() * 7) + 4 // 4-10 selections
    const selectedNumbers: number[] = []
    const availableNumbers = Array.from({ length: 40 }, (_, j) => j + 1)
    
    for (let j = 0; j < selectionCount; j++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length)
      selectedNumbers.push(availableNumbers[randomIndex])
      availableNumbers.splice(randomIndex, 1)
    }
    
    const betAmount = Math.floor(Math.random() * 500) + 10
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
    
    const result = playFullGame(selectedNumbers, betAmount, difficulty)
    
    const round: KenoRound = {
      id: `round-${i}`,
      result,
      timestamp: Date.now() - (i * 60000)
    }
    
    history.push(round)
  }
  
  return history
}

export function getNumberStatus(
  number: number,
  selectedNumbers: number[],
  drawnNumbers: number[]
): 'unselected' | 'selected' | 'drawn' | 'match' {
  const isSelected = selectedNumbers.includes(number)
  const isDrawn = drawnNumbers.includes(number)
  
  if (isSelected && isDrawn) return 'match'
  if (isSelected) return 'selected'
  if (isDrawn) return 'drawn'
  return 'unselected'
}

export function getNumberStatusColor(status: 'unselected' | 'selected' | 'drawn' | 'match'): string {
  switch (status) {
    case 'unselected': return 'bg-slate-700 text-slate-300 border-slate-600'
    case 'selected': return 'bg-purple-600 text-white border-purple-700'
    case 'drawn': return 'bg-red-600 text-white border-red-700'
    case 'match': return 'bg-emerald-600 text-white border-emerald-700'
    default: return 'bg-slate-700 text-slate-300 border-slate-600'
  }
}

export function getNumberStatusHoverColor(status: 'unselected' | 'selected' | 'drawn' | 'match'): string {
  switch (status) {
    case 'unselected': return 'hover:bg-slate-600'
    case 'selected': return 'hover:bg-purple-700'
    case 'drawn': return 'hover:bg-red-700'
    case 'match': return 'hover:bg-emerald-700'
    default: return 'hover:bg-slate-600'
  }
}
