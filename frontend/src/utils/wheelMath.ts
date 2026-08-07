import {
  DIFFICULTY_CONFIGS,
  createWheelBet,
  createWheelResult,
  createWheelRound,
  determineWin,
  calculatePayout,
  calculateProfit,
  type Difficulty,
  type WheelSegment,
  type WheelBet,
  type WheelResult,
  type WheelRound
} from './wheelConfig'

export interface WheelGameResult {
  bet: WheelBet
  result: WheelResult
  payout: number
  profit: number
  isWin: boolean
}

export function selectWeightedSegment(segments: WheelSegment[]): WheelSegment {
  // Calculate total weight
  const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0)
  
  // Generate random number between 0 and totalWeight
  const random = Math.random() * totalWeight
  
  // Find segment based on cumulative weight
  let cumulativeWeight = 0
  
  for (const segment of segments) {
    cumulativeWeight += segment.weight
    
    if (random <= cumulativeWeight) {
      return segment
    }
  }
  
  // Fallback (should never happen)
  return segments[0]
}

export function spinWheel(difficulty: Difficulty, betAmount: number): WheelGameResult {
  // Get configuration for selected difficulty
  const config = DIFFICULTY_CONFIGS[difficulty]
  
  // Select segment using weighted probability (deterministic)
  const selectedSegment = selectWeightedSegment(config.segments)
  
  // Calculate final angle for animation
  const segmentIndex = config.segments.findIndex(s => s.id === selectedSegment.id)
  const totalSegments = config.segments.length
  const segmentAngle = 360 / totalSegments
  const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2
  const targetAngle = -90 - segmentCenter // Pointer at top
  const extraRotations = 5 * 360 // 5 extra rotations
  const finalAngle = targetAngle + extraRotations
  
  // Create bet and result
  const bet = createWheelBet(betAmount, difficulty)
  const result = createWheelResult(selectedSegment, difficulty, finalAngle)
  
  // Determine outcome
  const isWin = determineWin(selectedSegment.multiplier)
  const payout = calculatePayout(betAmount, selectedSegment.multiplier)
  const profit = calculateProfit(betAmount, payout)
  
  return {
    bet,
    result,
    payout,
    profit,
    isWin
  }
}

export function evaluateGame(bet: WheelBet, result: WheelResult): WheelRound {
  return createWheelRound(bet, result)
}

export function calculateWinProbability(difficulty: Difficulty): number {
  const config = DIFFICULTY_CONFIGS[difficulty]
  const totalWeight = config.segments.reduce((sum, segment) => sum + segment.weight, 0)
  const winningWeight = config.segments
    .filter(segment => segment.multiplier > 0)
    .reduce((sum, segment) => sum + segment.weight, 0)
  
  return winningWeight / totalWeight
}

export function calculateExpectedValue(difficulty: Difficulty, betAmount: number): number {
  const config = DIFFICULTY_CONFIGS[difficulty]
  const totalWeight = config.segments.reduce((sum, segment) => sum + segment.weight, 0)
  
  let expectedValue = 0
  
  for (const segment of config.segments) {
    const probability = segment.weight / totalWeight
    const payout = segment.multiplier * betAmount
    expectedValue += probability * payout
  }
  
  return expectedValue - betAmount
}

export function getMultiplierProbabilities(difficulty: Difficulty): Record<string, number> {
  const config = DIFFICULTY_CONFIGS[difficulty]
  const totalWeight = config.segments.reduce((sum, segment) => sum + segment.weight, 0)
  
  const probabilities: Record<string, number> = {}
  
  for (const segment of config.segments) {
    const key = segment.multiplier.toFixed(2)
    if (!probabilities[key]) {
      probabilities[key] = 0
    }
    probabilities[key] += segment.weight / totalWeight
  }
  
  return probabilities
}

export function simulateGameSession(
  rounds: number,
  betAmount: number,
  difficulty: Difficulty
): {
  roundsPlayed: number
  totalBet: number
  totalPayout: number
  profit: number
  winRate: number
  averageMultiplier: number
  highestMultiplier: number
  lowestMultiplier: number
  segmentDistribution: Record<string, number>
} {
  let totalBet = 0
  let totalPayout = 0
  let wins = 0
  const multipliers: number[] = []
  const segmentDistribution: Record<string, number> = {}
  
  for (let i = 0; i < rounds; i++) {
    const gameResult = spinWheel(difficulty, betAmount)
    
    totalBet += betAmount
    totalPayout += gameResult.payout
    
    if (gameResult.isWin) {
      wins++
    }
    
    multipliers.push(gameResult.result.segment.multiplier)
    
    const key = gameResult.result.segment.label
    if (!segmentDistribution[key]) {
      segmentDistribution[key] = 0
    }
    segmentDistribution[key]++
  }
  
  const averageMultiplier = multipliers.reduce((sum, mult) => sum + mult, 0) / multipliers.length
  const highestMultiplier = Math.max(...multipliers)
  const lowestMultiplier = Math.min(...multipliers)
  
  return {
    roundsPlayed: rounds,
    totalBet,
    totalPayout,
    profit: totalPayout - totalBet,
    winRate: (wins / rounds) * 100,
    averageMultiplier,
    highestMultiplier,
    lowestMultiplier,
    segmentDistribution
  }
}

export function analyzeBettingPattern(rounds: WheelRound[]): {
  preferredDifficulty: Difficulty
  difficultyDistribution: Record<Difficulty, number>
  averageBetAmount: number
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive'
  successRateByDifficulty: Record<Difficulty, number>
} {
  if (rounds.length === 0) {
    return {
      preferredDifficulty: 'easy',
      difficultyDistribution: { easy: 0, medium: 0, hard: 0, expert: 0 },
      averageBetAmount: 0,
      riskLevel: 'Conservative',
      successRateByDifficulty: { easy: 0, medium: 0, hard: 0, expert: 0 }
    }
  }
  
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']
  const difficultyDistribution: Record<Difficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0
  }
  
  rounds.forEach(round => {
    difficultyDistribution[round.bet.difficulty]++
  })
  
  const preferredDifficulty = (Object.entries(difficultyDistribution) as [Difficulty, number][])
    .reduce((a, b) => a[1] > b[1] ? a : b)[0]
  
  const averageBetAmount = rounds.reduce((sum, round) => sum + round.bet.amount, 0) / rounds.length
  
  // Determine risk level based on difficulty preference
  let riskLevel: 'Conservative' | 'Moderate' | 'Aggressive' = 'Conservative'
  if (preferredDifficulty === 'hard' || preferredDifficulty === 'expert') {
    riskLevel = 'Aggressive'
  } else if (preferredDifficulty === 'medium') {
    riskLevel = 'Moderate'
  }
  
  // Calculate success rate by difficulty
  const successRateByDifficulty: Record<Difficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0
  }
  
  difficulties.forEach(difficulty => {
    const difficultyRounds = rounds.filter(round => round.bet.difficulty === difficulty)
    const wins = difficultyRounds.filter(round => round.isWin).length
    successRateByDifficulty[difficulty] = difficultyRounds.length > 0 ? (wins / difficultyRounds.length) * 100 : 0
  })
  
  return {
    preferredDifficulty,
    difficultyDistribution,
    averageBetAmount,
    riskLevel,
    successRateByDifficulty
  }
}

export function calculateStreaks(rounds: WheelRound[]): {
  currentStreak: number
  currentStreakType: 'win' | 'loss' | null
  longestWinStreak: number
  longestLossStreak: number
  averageStreakLength: number
} {
  if (rounds.length === 0) {
    return {
      currentStreak: 0,
      currentStreakType: null,
      longestWinStreak: 0,
      longestLossStreak: 0,
      averageStreakLength: 0
    }
  }
  
  let currentStreak = 1
  let currentStreakType: 'win' | 'loss' = rounds[0].isWin ? 'win' : 'loss'
  let longestWinStreak = 0
  let longestLossStreak = 0
  const streaks: number[] = []
  
  for (let i = 1; i < rounds.length; i++) {
    if (rounds[i].isWin === rounds[i-1].isWin) {
      currentStreak++
    } else {
      // Update longest streaks
      if (currentStreakType === 'win') {
        longestWinStreak = Math.max(longestWinStreak, currentStreak)
      } else {
        longestLossStreak = Math.max(longestLossStreak, currentStreak)
      }
      
      streaks.push(currentStreak)
      
      // Reset current streak
      currentStreak = 1
      currentStreakType = rounds[i].isWin ? 'win' : 'loss'
    }
  }
  
  // Check final streak
  if (currentStreakType === 'win') {
    longestWinStreak = Math.max(longestWinStreak, currentStreak)
  } else {
    longestLossStreak = Math.max(longestLossStreak, currentStreak)
  }
  
  streaks.push(currentStreak)
  
  const averageStreakLength = streaks.reduce((sum, streak) => sum + streak, 0) / streaks.length
  
  return {
    currentStreak,
    currentStreakType,
    longestWinStreak,
    longestLossStreak,
    averageStreakLength
  }
}

export function getOptimalDifficulty(): Difficulty {
  let bestDifficulty: Difficulty = 'easy'
  let bestEV = -Infinity
  
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']
  
  difficulties.forEach(difficulty => {
    const ev = calculateExpectedValue(difficulty, 1) // Calculate EV for 1 unit bet
    
    if (ev > bestEV) {
      bestEV = ev
      bestDifficulty = difficulty
    }
  })
  
  return bestDifficulty
}

export function getDifficultyRiskScore(difficulty: Difficulty): {
  score: number
  level: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
  description: string
} {
  const winProbability = calculateWinProbability(difficulty)
  
  let score: number
  let level: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
  let description: string
  
  if (winProbability >= 0.45) {
    score = 10
    level = 'Very Low'
    description = 'Very safe - high win probability'
  } else if (winProbability >= 0.40) {
    score = 30
    level = 'Low'
    description = 'Low risk - good win probability'
  } else if (winProbability >= 0.35) {
    score = 50
    level = 'Medium'
    description = 'Moderate risk - balanced odds'
  } else if (winProbability >= 0.30) {
    score = 75
    level = 'High'
    description = 'High risk - low win probability'
  } else {
    score = 95
    level = 'Very High'
    description = 'Very high risk - very low win probability'
  }
  
  return { score, level, description }
}

export function formatMultiplierForDisplay(multiplier: number): string {
  if (multiplier === 0) return '0x'
  if (multiplier >= 100) {
    return `${(multiplier / 100).toFixed(1)}kx`
  } else if (multiplier >= 10) {
    return `${multiplier.toFixed(0)}x`
  } else {
    return `${multiplier.toFixed(1)}x`
  }
}

export function validateGameResult(result: WheelGameResult): {
  isValid: boolean
  error?: string
} {
  if (result.result.segment.multiplier < 0) {
    return { isValid: false, error: 'Invalid multiplier (negative)' }
  }
  
  if (result.bet.amount <= 0) {
    return { isValid: false, error: 'Invalid bet amount' }
  }
  
  if (result.isWin !== determineWin(result.result.segment.multiplier)) {
    return { isValid: false, error: 'Win/loss determination mismatch' }
  }
  
  if (result.payout !== calculatePayout(result.bet.amount, result.result.segment.multiplier)) {
    return { isValid: false, error: 'Payout calculation mismatch' }
  }
  
  return { isValid: true }
}

export function calculateSegmentAngles(segments: WheelSegment[]): Array<{
  segment: WheelSegment
  startAngle: number
  endAngle: number
  midAngle: number
}> {
  const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0)
  let currentAngle = 0
  
  return segments.map(segment => {
    const weightRatio = segment.weight / totalWeight
    const angleSpan = weightRatio * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angleSpan
    const midAngle = currentAngle + angleSpan / 2
    
    currentAngle = endAngle
    
    return {
      segment,
      startAngle,
      endAngle,
      midAngle
    }
  })
}

export function getSegmentAtAngle(angles: Array<{
  segment: WheelSegment
  startAngle: number
  endAngle: number
  midAngle: number
}>, pointerAngle: number): WheelSegment | null {
  // Normalize angle to 0-360
  const normalizedAngle = ((pointerAngle % 360) + 360) % 360
  
  for (const angleInfo of angles) {
    const { segment, startAngle, endAngle } = angleInfo
    
    // Check if pointer angle falls within this segment
    if (normalizedAngle >= startAngle && normalizedAngle < endAngle) {
      return segment
    }
  }
  
  return null
}

export function getOutcomeColor(isWin: boolean): string {
  return isWin ? 'text-emerald-400' : 'text-red-400'
}

export function getOutcomeEmoji(isWin: boolean): string {
  return isWin ? 'ð' : 'ð'
}

export function getOutcomeText(isWin: boolean): string {
  return isWin ? 'WIN' : 'LOSS'
}

export function getMaxMultiplierForDifficulty(difficulty: Difficulty): number {
  const config = DIFFICULTY_CONFIGS[difficulty]
  return Math.max(...config.segments.map(s => s.multiplier))
}

export function getMinWinMultiplierForDifficulty(difficulty: Difficulty): number {
  const config = DIFFICULTY_CONFIGS[difficulty]
  const winningSegments = config.segments.filter(s => s.multiplier > 0)
  return winningSegments.length > 0 ? Math.min(...winningSegments.map(s => s.multiplier)) : 0
}

export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy': return 'text-emerald-400'
    case 'medium': return 'text-yellow-400'
    case 'hard': return 'text-orange-400'
    case 'expert': return 'text-red-400'
    default: return 'text-white'
  }
}

export function getDifficultyBgColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy': return 'bg-emerald-600'
    case 'medium': return 'bg-yellow-600'
    case 'hard': return 'bg-orange-600'
    case 'expert': return 'bg-red-600'
    default: return 'bg-gray-600'
  }
}
