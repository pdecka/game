/**
 * Tic Tac Toe AI System
 * Minimax algorithm with configurable difficulty levels
 */

import type { Player, Board } from './ticTacToeEngine'
import { WINNING_COMBINATIONS, getAvailableMoves, checkWinner, isValidMove } from './ticTacToeEngine'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'house'

export interface AIMove {
  position: number
  score: number
  depth: number
  thinkingTime: number
}

export interface AIConfig {
  difficulty: Difficulty
  mistakeProbability: number
  randomMoveProbability: number
  winRate: number
  thinkingTime: number
  useMinimax: boolean
  maxDepth: number
}

// Default AI configurations
export const AI_CONFIGS: Record<Difficulty, AIConfig> = {
  easy: {
    difficulty: 'easy',
    mistakeProbability: 0.4,    // 40% chance of making a mistake
    randomMoveProbability: 0.3,  // 30% chance of random move
    winRate: 0.45,               // Target 45% win rate for user
    thinkingTime: 500,           // 500ms thinking time
    useMinimax: false,          // Don't use minimax
    maxDepth: 1                  // Shallow search
  },
  medium: {
    difficulty: 'medium',
    mistakeProbability: 0.2,    // 20% chance of making a mistake
    randomMoveProbability: 0.1,  // 10% chance of random move
    winRate: 0.35,               // Target 35% win rate for user
    thinkingTime: 800,           // 800ms thinking time
    useMinimax: true,            // Use minimax
    maxDepth: 3                  // Medium depth search
  },
  hard: {
    difficulty: 'hard',
    mistakeProbability: 0.05,   // 5% chance of making a mistake
    randomMoveProbability: 0.05, // 5% chance of random move
    winRate: 0.25,               // Target 25% win rate for user
    thinkingTime: 1200,          // 1200ms thinking time
    useMinimax: true,            // Use minimax
    maxDepth: 6                  // Deep search
  },
  house: {
    difficulty: 'house',
    mistakeProbability: 0.02,   // 2% chance of making a mistake
    randomMoveProbability: 0.02, // 2% chance of random move
    winRate: 0.20,               // Target 20% win rate for user (house advantage)
    thinkingTime: 1000,          // 1000ms thinking time
    useMinimax: true,            // Use minimax
    maxDepth: 9                  // Full search
  }
}

// Minimax algorithm implementation
export class MinimaxAI {
  private config: AIConfig
  private aiSymbol: Player
  private userSymbol: Player

  constructor(config: AIConfig, aiSymbol: Player, userSymbol: Player) {
    this.config = config
    this.aiSymbol = aiSymbol
    this.userSymbol = userSymbol
  }

  // Get best move using minimax
  getBestMove(board: Board): AIMove {
    const startTime = Date.now()
    const availableMoves = getAvailableMoves(board)

    if (availableMoves.length === 0) {
      throw new Error('No available moves')
    }

    // Apply difficulty-based behavior
    if (this.shouldMakeRandomMove()) {
      return this.getRandomMove(board, startTime)
    }

    if (this.config.useMinimax) {
      return this.getMinimaxMove(board, startTime)
    } else {
      return this.getHeuristicMove(board, startTime)
    }
  }

  // Check if AI should make a random move based on difficulty
  private shouldMakeRandomMove(): boolean {
    return Math.random() < this.config.randomMoveProbability
  }

  // Get random move
  private getRandomMove(board: Board, startTime: number): AIMove {
    const availableMoves = getAvailableMoves(board)
    const position = availableMoves[Math.floor(Math.random() * availableMoves.length)]
    
    return {
      position,
      score: 0,
      depth: 0,
      thinkingTime: Date.now() - startTime
    }
  }

  // Get move using minimax algorithm
  private getMinimaxMove(board: Board, startTime: number): AIMove {
    let bestScore = -Infinity
    let bestPosition = -1
    let maxDepth = 0

    const availableMoves = getAvailableMoves(board)

    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = this.aiSymbol

      const score = this.minimax(testBoard, 0, false, -Infinity, Infinity, this.config.maxDepth)
      maxDepth = Math.max(maxDepth, this.getSearchDepth(testBoard, 0, false, this.config.maxDepth))

      if (score > bestScore) {
        bestScore = score
        bestPosition = move
      }
    }

    // Apply mistake probability
    if (this.shouldMakeMistake() && availableMoves.length > 1) {
      const worseMoves = availableMoves.filter(move => move !== bestPosition)
      if (worseMoves.length > 0) {
        bestPosition = worseMoves[Math.floor(Math.random() * worseMoves.length)]
        bestScore = -5 // Lower score for mistake
      }
    }

    return {
      position: bestPosition,
      score: bestScore,
      depth: maxDepth,
      thinkingTime: Date.now() - startTime
    }
  }

  // Minimax algorithm with alpha-beta pruning
  private minimax(
    board: Board,
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number,
    maxDepth: number
  ): number {
    // Check for terminal state
    const winner = checkWinner(board)
    if (winner) {
      if (winner.winner === this.aiSymbol) return 10 - depth
      if (winner.winner === this.userSymbol) return depth - 10
      return 0 // Tie
    }

    if (depth >= maxDepth || getAvailableMoves(board).length === 0) {
      return this.evaluateBoard(board)
    }

    const availableMoves = getAvailableMoves(board)
    const currentPlayer = isMaximizing ? this.aiSymbol : this.userSymbol

    if (isMaximizing) {
      let maxScore = -Infinity
      for (const move of availableMoves) {
        const testBoard = [...board]
        testBoard[move] = currentPlayer
        const score = this.minimax(testBoard, depth + 1, false, alpha, beta, maxDepth)
        maxScore = Math.max(maxScore, score)
        alpha = Math.max(alpha, score)
        if (beta <= alpha) break // Alpha-beta pruning
      }
      return maxScore
    } else {
      let minScore = Infinity
      for (const move of availableMoves) {
        const testBoard = [...board]
        testBoard[move] = currentPlayer
        const score = this.minimax(testBoard, depth + 1, true, alpha, beta, maxDepth)
        minScore = Math.min(minScore, score)
        beta = Math.min(beta, score)
        if (beta <= alpha) break // Alpha-beta pruning
      }
      return minScore
    }
  }

  // Get search depth for analysis
  private getSearchDepth(board: Board, depth: number, isMaximizing: boolean, maxDepth: number): number {
    if (depth >= maxDepth || checkWinner(board) || getAvailableMoves(board).length === 0) {
      return depth
    }

    const availableMoves = getAvailableMoves(board)
    const currentPlayer = isMaximizing ? this.aiSymbol : this.userSymbol
    let maxDepthReached = depth

    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = currentPlayer
      const searchDepth = this.getSearchDepth(testBoard, depth + 1, !isMaximizing, maxDepth)
      maxDepthReached = Math.max(maxDepthReached, searchDepth)
    }

    return maxDepthReached
  }

  // Evaluate board position (heuristic)
  private evaluateBoard(board: Board): number {
    let score = 0

    // Evaluate each winning combination
    for (const combination of WINNING_COMBINATIONS) {
      const lineScore = this.evaluateLine(board, combination)
      score += lineScore
    }

    return score
  }

  // Evaluate a single line (row, column, or diagonal)
  private evaluateLine(board: Board, line: number[]): number {
    const aiCount = line.filter(pos => board[pos] === this.aiSymbol).length
    const userCount = line.filter(pos => board[pos] === this.userSymbol).length
    const emptyCount = line.filter(pos => board[pos] === null).length

    // AI has winning line
    if (aiCount === 3) return 100
    // User has winning line
    if (userCount === 3) return -100
    // AI has 2 in a row with empty
    if (aiCount === 2 && emptyCount === 1) return 10
    // User has 2 in a row with empty
    if (userCount === 2 && emptyCount === 1) return -10
    // AI has 1 in a row
    if (aiCount === 1 && emptyCount === 2) return 1
    // User has 1 in a row
    if (userCount === 1 && emptyCount === 2) return -1

    return 0
  }

  // Get heuristic move (for easy difficulty)
  private getHeuristicMove(board: Board, startTime: number): AIMove {
    const availableMoves = getAvailableMoves(board)

    // Priority 1: Win if possible
    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = this.aiSymbol
      if (checkWinner(testBoard)?.winner === this.aiSymbol) {
        return { position: move, score: 10, depth: 1, thinkingTime: Date.now() - startTime }
      }
    }

    // Priority 2: Block user win
    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = this.userSymbol
      if (checkWinner(testBoard)?.winner === this.userSymbol) {
        return { position: move, score: 9, depth: 1, thinkingTime: Date.now() - startTime }
      }
    }

    // Priority 3: Take center
    if (board[4] === null) {
      return { position: 4, score: 3, depth: 1, thinkingTime: Date.now() - startTime }
    }

    // Priority 4: Take corners
    const corners = [0, 2, 6, 8].filter(corner => board[corner] === null)
    if (corners.length > 0) {
      const corner = corners[Math.floor(Math.random() * corners.length)]
      return { position: corner, score: 2, depth: 1, thinkingTime: Date.now() - startTime }
    }

    // Priority 5: Take any available move
    const position = availableMoves[Math.floor(Math.random() * availableMoves.length)]
    return { position, score: 1, depth: 1, thinkingTime: Date.now() - startTime }
  }

  // Check if AI should make a mistake
  private shouldMakeMistake(): boolean {
    return Math.random() < this.config.mistakeProbability
  }
}

// Main AI function to get move
export function getAIMove(
  board: Board,
  aiSymbol: Player,
  userSymbol: Player,
  difficulty: Difficulty = 'medium'
): Promise<AIMove> {
  return new Promise((resolve) => {
    const config = AI_CONFIGS[difficulty]
    const ai = new MinimaxAI(config, aiSymbol, userSymbol)
    
    // Add thinking delay for realism
    setTimeout(() => {
      try {
        const move = ai.getBestMove(board)
        
        // Ensure minimum thinking time
        const minThinkingTime = 200
        const actualThinkingTime = Math.max(move.thinkingTime, minThinkingTime)
        
        setTimeout(() => {
          resolve({
            ...move,
            thinkingTime: actualThinkingTime
          })
        }, actualThinkingTime - move.thinkingTime)
      } catch (error) {
        // Fallback to random move if AI fails
        const availableMoves = getAvailableMoves(board)
        const position = availableMoves[Math.floor(Math.random() * availableMoves.length)]
        resolve({
          position,
          score: 0,
          depth: 0,
          thinkingTime: config.thinkingTime
        })
      }
    }, 100) // Small initial delay
  })
}

// Get AI move analysis (for debugging/educational purposes)
export function getAIMoveAnalysis(
  board: Board,
  aiSymbol: Player,
  userSymbol: Player,
  difficulty: Difficulty = 'medium'
): {
  bestMove: number
  alternatives: { position: number; score: number }[]
  reasoning: string
  difficulty: Difficulty
} {
  const config = AI_CONFIGS[difficulty]
  const ai = new MinimaxAI(config, aiSymbol, userSymbol)
  const availableMoves = getAvailableMoves(board)
  
  const alternatives: { position: number; score: number }[] = []
  
  // Analyze all available moves
  for (const move of availableMoves) {
    const testBoard = [...board]
    testBoard[move] = aiSymbol
    const score = ai['evaluateBoard'](testBoard)
    alternatives.push({ position: move, score })
  }
  
  // Sort by score
  alternatives.sort((a, b) => b.score - a.score)
  
  const bestMove = alternatives[0]?.position || -1
  
  // Generate reasoning
  let reasoning = ''
  if (config.useMinimax) {
    reasoning = `Using minimax algorithm with depth ${config.maxDepth}. `
  } else {
    reasoning = 'Using heuristic evaluation. '
  }
  
  reasoning += `Difficulty: ${config.difficulty}. `
  reasoning += `Mistake probability: ${(config.mistakeProbability * 100)}%. `
  reasoning += `Target win rate: ${(config.winRate * 100)}%.`
  
  return {
    bestMove,
    alternatives,
    reasoning,
    difficulty
  }
}

// Validate AI move
export function validateAIMove(
  board: Board,
  move: AIMove,
  aiSymbol: Player
): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!isValidMove(board, move.position)) {
    errors.push('Move position is invalid')
  }
  
  if (move.score < -10 || move.score > 10) {
    errors.push('Move score is out of range')
  }
  
  if (move.depth < 0 || move.depth > 9) {
    errors.push('Move depth is invalid')
  }
  
  if (move.thinkingTime < 0 || move.thinkingTime > 5000) {
    errors.push('Thinking time is unrealistic')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get AI performance statistics
export function getAIPerformanceStats(
  games: Array<{
    result: 'win' | 'lose' | 'tie'
    difficulty: Difficulty
    moveCount: number
  }>
): {
  totalGames: number
  winRate: number
  loseRate: number
  tieRate: number
  averageMoves: number
  difficultyStats: Record<Difficulty, {
    games: number
    winRate: number
    averageMoves: number
  }>
} {
  const totalGames = games.length
  if (totalGames === 0) {
    return {
      totalGames: 0,
      winRate: 0,
      loseRate: 0,
      tieRate: 0,
      averageMoves: 0,
      difficultyStats: {
        easy: { games: 0, winRate: 0, averageMoves: 0 },
        medium: { games: 0, winRate: 0, averageMoves: 0 },
        hard: { games: 0, winRate: 0, averageMoves: 0 },
        house: { games: 0, winRate: 0, averageMoves: 0 }
      }
    }
  }

  const wins = games.filter(game => game.result === 'win').length
  const losses = games.filter(game => game.result === 'lose').length
  const ties = games.filter(game => game.result === 'tie').length
  
  const averageMoves = games.reduce((sum, game) => sum + game.moveCount, 0) / totalGames
  
  // Difficulty-specific stats
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'house']
  const difficultyStats: Record<Difficulty, { games: number; winRate: number; averageMoves: number }> = {} as any
  
  for (const diff of difficulties) {
    const diffGames = games.filter(game => game.difficulty === diff)
    const diffWins = diffGames.filter(game => game.result === 'win').length
    const diffAvgMoves = diffGames.length > 0 
      ? diffGames.reduce((sum, game) => sum + game.moveCount, 0) / diffGames.length 
      : 0
    
    difficultyStats[diff] = {
      games: diffGames.length,
      winRate: diffGames.length > 0 ? (diffWins / diffGames.length) * 100 : 0,
      averageMoves: diffAvgMoves
    }
  }
  
  return {
    totalGames,
    winRate: (wins / totalGames) * 100,
    loseRate: (losses / totalGames) * 100,
    tieRate: (ties / totalGames) * 100,
    averageMoves,
    difficultyStats
  }
}

// Simulate AI vs AI game (for testing)
export function simulateAIGame(
  difficulty1: Difficulty,
  difficulty2: Difficulty,
  maxMoves: number = 9
): {
  winner: 'X' | 'O' | 'tie'
  moves: number[]
  finalBoard: Board
} {
  const board = Array(9).fill(null)
  const moves: number[] = []
  let currentPlayer: Player = 'X'
  
  for (let moveCount = 0; moveCount < maxMoves; moveCount++) {
    const difficulty = currentPlayer === 'X' ? difficulty1 : difficulty2
    const aiSymbol = currentPlayer
    const userSymbol = currentPlayer === 'X' ? 'O' : 'X'
    
    // Get AI move (synchronous for simulation)
    const config = AI_CONFIGS[difficulty]
    const ai = new MinimaxAI(config, aiSymbol, userSymbol)
    const move = ai.getBestMove(board)
    
    board[move.position] = currentPlayer
    moves.push(move.position)
    
    // Check for winner
    const winner = checkWinner(board)
    if (winner) {
      return {
        winner: winner.winner!,
        moves,
        finalBoard: [...board]
      }
    }
    
    // Switch players
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X'
  }
  
  return {
    winner: 'tie',
    moves,
    finalBoard: [...board]
  }
}

// Get AI configuration for backend control
export function getAIConfiguration(difficulty: Difficulty): AIConfig {
  return { ...AI_CONFIGS[difficulty] }
}

// Update AI configuration (for backend control)
export function updateAIConfiguration(
  difficulty: Difficulty,
  updates: Partial<AIConfig>
): AIConfig {
  AI_CONFIGS[difficulty] = { ...AI_CONFIGS[difficulty], ...updates }
  return AI_CONFIGS[difficulty]
}
