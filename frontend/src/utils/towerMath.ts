import {
  generateBoard,
  getMultiplierForStep,
  calculatePayout,
  getDifficultyConfig,
  getMaxMultiplier,
  type Difficulty,
  type TowerBoard,
  type Tile,
  type TowerRound
} from './towerConfig'

export interface TowerResult {
  board: TowerBoard
  stepCompleted: boolean
  isGameOver: boolean
  currentMultiplier: number
  potentialPayout: number
  selectedTile: Tile | null
  revealedTile: Tile | null
}

export interface TowerGameResult {
  board: TowerBoard
  stepsCompleted: number
  finalMultiplier: number
  payout: number
  outcome: 'lost' | 'cashed_out' | 'completed'
  path: number[]
}

export function selectTile(board: TowerBoard, column: number): TowerResult {
  const config = getDifficultyConfig(board.difficulty)
  const currentRow = board.rows[board.currentStep]
  
  if (!currentRow || board.currentStep >= config.maxSteps) {
    return {
      board,
      stepCompleted: false,
      isGameOver: true,
      currentMultiplier: getMultiplierForStep(board.currentStep, config),
      potentialPayout: 0,
      selectedTile: null,
      revealedTile: null
    }
  }
  
  // Find the tile at the specified column
  const selectedTile = currentRow.tiles.find(tile => tile.column === column)
  
  if (!selectedTile || selectedTile.isSelected) {
    return {
      board,
      stepCompleted: false,
      isGameOver: false,
      currentMultiplier: getMultiplierForStep(board.currentStep, config),
      potentialPayout: calculatePayout(0, getMultiplierForStep(board.currentStep, config)),
      selectedTile: null,
      revealedTile: null
    }
  }
  
  // Mark the tile as selected and revealed
  selectedTile.isSelected = true
  selectedTile.isRevealed = true
  
  // Update board state
  const updatedBoard = {
    ...board,
    currentStep: board.currentStep + 1,
    selectedPath: [...board.selectedPath, column]
  }
  
  // Mark the row as completed
  currentRow.isCompleted = true
  
  const isGameOver = selectedTile.type === 'monster' || board.currentStep >= config.maxSteps - 1
  const stepCompleted = selectedTile.type === 'egg'
  const currentMultiplier = getMultiplierForStep(updatedBoard.currentStep, config)
  
  return {
    board: updatedBoard,
    stepCompleted,
    isGameOver,
    currentMultiplier,
    potentialPayout: calculatePayout(0, currentMultiplier),
    selectedTile,
    revealedTile: selectedTile
  }
}

export function cashout(board: TowerBoard, betAmount: number): TowerGameResult {
  const config = getDifficultyConfig(board.difficulty)
  const currentMultiplier = getMultiplierForStep(board.currentStep, config)
  const payout = calculatePayout(betAmount, currentMultiplier)
  
  return {
    board,
    stepsCompleted: board.currentStep,
    finalMultiplier: currentMultiplier,
    payout,
    outcome: 'cashed_out',
    path: board.selectedPath
  }
}

export function evaluateFinalResult(board: TowerBoard, betAmount: number): TowerGameResult {
  const config = getDifficultyConfig(board.difficulty)
  const stepsCompleted = board.currentStep
  const finalMultiplier = getMultiplierForStep(stepsCompleted, config)
  const payout = calculatePayout(betAmount, finalMultiplier)
  
  let outcome: 'lost' | 'cashed_out' | 'completed' = 'lost'
  
  if (stepsCompleted >= config.maxSteps) {
    outcome = 'completed'
  } else if (stepsCompleted > 0) {
    // Check if the last selected tile was a monster
    const lastRow = board.rows[stepsCompleted - 1]
    const lastSelectedTile = lastRow.tiles.find(tile => tile.isSelected)
    if (lastSelectedTile && lastSelectedTile.type === 'monster') {
      outcome = 'lost'
    } else {
      outcome = 'cashed_out'
    }
  }
  
  return {
    board,
    stepsCompleted,
    finalMultiplier: outcome === 'lost' ? 0 : finalMultiplier,
    payout: outcome === 'lost' ? 0 : payout,
    outcome,
    path: board.selectedPath
  }
}

export function generateTowerGame(betAmount: number, difficulty: Difficulty): TowerGameResult {
  const board = generateBoard(difficulty)
  
  // Simulate playing through the board randomly for demo purposes
  const config = getDifficultyConfig(difficulty)
  let currentBoard = { ...board }
  let stepsCompleted = 0
  
  // Random walk through the tower
  while (stepsCompleted < config.maxSteps) {
    const currentRow = currentBoard.rows[stepsCompleted]
    const safeColumns = currentRow.tiles
      .filter(tile => tile.type === 'egg')
      .map(tile => tile.column)
    
    if (safeColumns.length === 0) break
    
    // Randomly choose a safe column (70% chance) or a random column (30% chance)
    const selectedColumn = Math.random() < 0.7 
      ? safeColumns[Math.floor(Math.random() * safeColumns.length)]
      : Math.floor(Math.random() * config.columns)
    
    const result = selectTile(currentBoard, selectedColumn)
    currentBoard = result.board
    
    if (!result.stepCompleted) break
    
    stepsCompleted++
    
    // Random chance to cashout (30% per step after step 3)
    if (stepsCompleted > 3 && Math.random() < 0.3) {
      return cashout(currentBoard, betAmount)
    }
  }
  
  return evaluateFinalResult(currentBoard, betAmount)
}

export function validateTileSelection(board: TowerBoard, column: number): boolean {
  if (board.currentStep >= getDifficultyConfig(board.difficulty).maxSteps) {
    return false
  }
  
  const currentRow = board.rows[board.currentStep]
  if (!currentRow || currentRow.isCompleted) {
    return false
  }
  
  const tile = currentRow.tiles.find(t => t.column === column)
  return tile !== undefined && !tile.isSelected
}

export function getWinProbability(difficulty: Difficulty, step: number): number {
  const config = getDifficultyConfig(difficulty)
  if (step >= config.maxSteps) return 0
  
  const totalTiles = config.columns
  const safeTiles = config.eggs
  return safeTiles / totalTiles
}

export function getExpectedValue(difficulty: Difficulty): number {
  const config = getDifficultyConfig(difficulty)
  let expectedValue = 0
  
  for (let step = 0; step < config.maxSteps; step++) {
    const probability = getWinProbability(difficulty, step)
    const multiplier = getMultiplierForStep(step, config)
    expectedValue += probability * multiplier
  }
  
  return expectedValue
}

export function getDifficultyStats(difficulty: Difficulty): {
  maxMultiplier: number
  expectedValue: number
  winProbability: number
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High'
} {
  const config = getDifficultyConfig(difficulty)
  const maxMultiplier = getMaxMultiplier(config)
  const expectedValue = getExpectedValue(difficulty)
  const winProbability = getWinProbability(difficulty, 0)
  
  let riskLevel: 'Low' | 'Medium' | 'High' | 'Very High' = 'Low'
  if (winProbability < 0.2) riskLevel = 'Very High'
  else if (winProbability < 0.4) riskLevel = 'High'
  else if (winProbability < 0.6) riskLevel = 'Medium'
  
  return {
    maxMultiplier,
    expectedValue,
    winProbability,
    riskLevel
  }
}

export function formatWinRate(wins: number, total: number): string {
  if (total === 0) return '0%'
  return ((wins / total) * 100).toFixed(1) + '%'
}

export function getAverageSteps(history: TowerRound[]): number {
  if (history.length === 0) return 0
  const totalSteps = history.reduce((sum, round) => sum + round.stepsCompleted, 0)
  return totalSteps / history.length
}

export function getHighestMultiplier(history: TowerRound[]): number {
  if (history.length === 0) return 0
  return Math.max(...history.map(round => round.finalMultiplier))
}

export function getTotalProfit(history: TowerRound[]): number {
  return history.reduce((sum, round) => sum + round.payout - round.betAmount, 0)
}

export function createTowerRound(
  betAmount: number,
  difficulty: Difficulty,
  result?: TowerGameResult
): TowerRound {
  const gameResult = result || generateTowerGame(betAmount, difficulty)
  
  return {
    id: `tower-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    betAmount,
    difficulty,
    board: gameResult.board,
    stepsCompleted: gameResult.stepsCompleted,
    finalMultiplier: gameResult.finalMultiplier,
    payout: gameResult.payout,
    outcome: gameResult.outcome,
    path: gameResult.path
  }
}
