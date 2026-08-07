/**
 * Tic Tac Toe Game Engine
 * Core game logic, state management, and validation
 */

export type Player = 'X' | 'O' | null
export type GameState = 'idle' | 'playing' | 'result'
export type GameResult = 'win' | 'lose' | 'tie' | null
export type Board = Player[]
export type Difficulty = 'easy' | 'medium' | 'hard' | 'house'

export interface TicTacToeGame {
  id: string
  board: Board
  currentPlayer: Player
  userSymbol: Player
  aiSymbol: Player
  gameState: GameState
  result: GameResult
  winner: Player
  winningLine: number[] | null
  moveCount: number
  timestamp: number
  betAmount: number
  payout: number
  difficulty: 'easy' | 'medium' | 'hard' | 'house'
}

export interface GameMove {
  position: number
  player: Player
  timestamp: number
}

export interface GameHistory {
  id: string
  betAmount: number
  result: GameResult
  payout: number
  difficulty: string
  userSymbol: Player | null
  moveCount: number
  timestamp: number
}

// Winning combinations (indices for 3x3 grid)
export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
]

// Create empty board
export function createEmptyBoard(): Board {
  return Array(9).fill(null)
}

// Create new game instance
export function createGame(
  betAmount: number,
  userSymbol: Player,
  difficulty: 'easy' | 'medium' | 'hard' | 'house' = 'medium'
): TicTacToeGame {
  const aiSymbol = userSymbol === 'X' ? 'O' : 'X'
  const firstPlayer = userSymbol === 'O' ? userSymbol : aiSymbol // User goes first if they choose O

  return {
    id: Date.now().toString(),
    board: createEmptyBoard(),
    currentPlayer: firstPlayer,
    userSymbol,
    aiSymbol,
    gameState: 'idle',
    result: null,
    winner: null,
    winningLine: null,
    moveCount: 0,
    timestamp: Date.now(),
    betAmount,
    payout: 0,
    difficulty
  }
}

// Validate if move is legal
export function isValidMove(board: Board, position: number): boolean {
  return position >= 0 && position < 9 && board[position] === null
}

// Make a move
export function makeMove(game: TicTacToeGame, position: number): TicTacToeGame {
  if (!isValidMove(game.board, position)) {
    return game
  }

  const newBoard = [...game.board]
  newBoard[position] = game.currentPlayer

  const newGame: TicTacToeGame = {
    ...game,
    board: newBoard,
    currentPlayer: game.currentPlayer === 'X' ? 'O' : 'X',
    moveCount: game.moveCount + 1,
    gameState: 'playing'
  }

  // Check for winner
  const winnerResult = checkWinner(newBoard)
  if (winnerResult) {
    newGame.winner = winnerResult.winner
    newGame.winningLine = winnerResult.line
    newGame.gameState = 'result'
    
    // Determine result from user's perspective
    if (winnerResult.winner === null) {
      newGame.result = 'tie'
      newGame.payout = game.betAmount // Refund on tie
    } else if (winnerResult.winner === game.userSymbol) {
      newGame.result = 'win'
      newGame.payout = game.betAmount * 2 // 2x payout (1x profit)
    } else {
      newGame.result = 'lose'
      newGame.payout = 0 // Full loss
    }
  } else if (newGame.moveCount === 9) {
    // Full board with no winner = tie
    newGame.result = 'tie'
    newGame.payout = game.betAmount // Refund on tie
    newGame.gameState = 'result'
  }

  return newGame
}

// Check for winner
export function checkWinner(board: Board): { winner: Player; line: number[] } | null {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combination }
    }
  }
  return null
}

// Check if game is over
export function isGameOver(board: Board): boolean {
  return checkWinner(board) !== null || board.every(cell => cell !== null)
}

// Get available moves
export function getAvailableMoves(board: Board): number[] {
  return board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1)
}

// Get board state as string for hashing
export function getBoardState(board: Board): string {
  return board.map(cell => cell || '_').join('')
}

// Calculate board evaluation score (for AI)
export function evaluateBoard(board: Board, aiSymbol: Player): number {
  const winner = checkWinner(board)
  if (winner) {
    if (winner.winner === aiSymbol) return 10
    if (winner.winner === null) return 0
    return -10
  }
  return 0
}

// Get game statistics
export function getGameStatistics(history: GameHistory[]): {
  totalGames: number
  wins: number
  losses: number
  ties: number
  winRate: number
  totalBet: number
  totalPayout: number
  netProfit: number
  averageBet: number
  difficultyBreakdown: Record<string, number>
  symbolBreakdown: Record<string, number>
} {
  if (history.length === 0) {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      winRate: 0,
      totalBet: 0,
      totalPayout: 0,
      netProfit: 0,
      averageBet: 0,
      difficultyBreakdown: { easy: 0, medium: 0, hard: 0, house: 0 },
      symbolBreakdown: { X: 0, O: 0 }
    }
  }

  const wins = history.filter(game => game.result === 'win').length
  const losses = history.filter(game => game.result === 'lose').length
  const ties = history.filter(game => game.result === 'tie').length

  const totalBet = history.reduce((sum, game) => sum + game.betAmount, 0)
  const totalPayout = history.reduce((sum, game) => sum + game.payout, 0)
  const netProfit = totalPayout - totalBet

  const difficultyBreakdown: Record<string, number> = { easy: 0, medium: 0, hard: 0, house: 0 }
  const symbolBreakdown: Record<string, number> = { X: 0, O: 0 }

  history.forEach(game => {
    difficultyBreakdown[game.difficulty]++
    if (game.userSymbol) {
      symbolBreakdown[game.userSymbol]++
    }
  })

  return {
    totalGames: history.length,
    wins,
    losses,
    ties,
    winRate: (wins / history.length) * 100,
    totalBet,
    totalPayout,
    netProfit,
    averageBet: totalBet / history.length,
    difficultyBreakdown,
    symbolBreakdown
  }
}

// Format game result for display
export function formatGameResult(result: GameResult): {
  text: string
  color: string
  emoji: string
  description: string
} {
  switch (result) {
    case 'win':
      return {
        text: 'WIN',
        color: 'text-emerald-400',
        emoji: 'ð',
        description: 'You won the game!'
      }
    case 'lose':
      return {
        text: 'LOSE',
        color: 'text-red-400',
        emoji: 'â',
        description: 'AI won this round'
      }
    case 'tie':
      return {
        text: 'TIE',
        color: 'text-yellow-400',
        emoji: 'ð',
        description: 'Game ended in a draw'
      }
    default:
      return {
        text: 'READY',
        color: 'text-slate-400',
        emoji: 'ð',
        description: 'Ready to play'
      }
  }
}

// Get symbol display info
export function getSymbolInfo(symbol: Player): {
  emoji: string
  color: string
  name: string
} {
  if (symbol === 'X') {
    return {
      emoji: 'â',
      color: 'text-red-400',
      name: 'Cross'
    }
  } else if (symbol === 'O') {
    return {
      emoji: 'ð',
      color: 'text-emerald-400',
      name: 'Circle'
    }
  } else {
    return {
      emoji: '',
      color: 'text-slate-400',
      name: 'Empty'
    }
  }
}

// Validate game state
export function validateGame(game: TicTacToeGame): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check board size
  if (game.board.length !== 9) {
    errors.push('Board must have exactly 9 cells')
  }

  // Check symbols
  if (!['X', 'O'].includes(game.userSymbol || '')) {
    errors.push('User symbol must be X or O')
  }

  if (!['X', 'O'].includes(game.aiSymbol || '')) {
    errors.push('AI symbol must be X or O')
  }

  if (game.userSymbol === game.aiSymbol) {
    errors.push('User and AI symbols must be different')
  }

  // Check move count
  const filledCells = game.board.filter(cell => cell !== null).length
  if (game.moveCount !== filledCells) {
    errors.push('Move count does not match filled cells')
  }

  // Check winner consistency
  if (game.gameState === 'result') {
    const winnerResult = checkWinner(game.board)
    if (winnerResult) {
      if (winnerResult.winner !== game.winner) {
        errors.push('Winner mismatch')
      }
      if (!game.winningLine || !arraysEqual(winnerResult.line, game.winningLine)) {
        errors.push('Winning line mismatch')
      }
    } else if (game.moveCount < 9) {
      errors.push('Game ended without winner but board not full')
    }
  }

  // Check payout consistency
  if (game.gameState === 'result') {
    let expectedPayout = 0
    if (game.result === 'win') {
      expectedPayout = game.betAmount * 2
    } else if (game.result === 'tie') {
      expectedPayout = game.betAmount
    }
    // lose = 0

    if (game.payout !== expectedPayout) {
      errors.push('Payout calculation error')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Helper function to compare arrays
function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((val, index) => val === b[index])
}

// Get optimal move suggestion (for debugging/analysis)
export function getOptimalMove(board: Board, symbol: Player): number {
  const availableMoves = getAvailableMoves(board)
  
  // Check for winning move
  for (const move of availableMoves) {
    const testBoard = [...board]
    testBoard[move] = symbol
    if (checkWinner(testBoard)?.winner === symbol) {
      return move
    }
  }

  // Check for blocking move
  const opponent = symbol === 'X' ? 'O' : 'X'
  for (const move of availableMoves) {
    const testBoard = [...board]
    testBoard[move] = opponent
    if (checkWinner(testBoard)?.winner === opponent) {
      return move
    }
  }

  // Take center if available
  if (board[4] === null) return 4

  // Take corners
  const corners = [0, 2, 6, 8].filter(corner => board[corner] === null)
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)]
  }

  // Take any available move
  return availableMoves[0]
}

// Generate mock history for testing
export function generateMockHistory(count: number = 20): GameHistory[] {
  const history: GameHistory[] = []
  const difficulties: ('easy' | 'medium' | 'hard' | 'house')[] = ['easy', 'medium', 'hard', 'house']
  const symbols: ('X' | 'O')[] = ['X', 'O']
  const results: ('win' | 'lose' | 'tie')[] = ['win', 'lose', 'tie']

  for (let i = 0; i < count; i++) {
    const result = results[Math.floor(Math.random() * results.length)]
    const betAmount = Math.floor(Math.random() * 500) + 10
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
    const userSymbol = symbols[Math.floor(Math.random() * symbols.length)]
    
    let payout = 0
    if (result === 'win') {
      payout = betAmount * 2
    } else if (result === 'tie') {
      payout = betAmount
    }

    history.push({
      id: Date.now().toString() + i,
      betAmount,
      result,
      payout,
      difficulty,
      userSymbol,
      moveCount: Math.floor(Math.random() * 9) + 1,
      timestamp: Date.now() - (i * 60000) // 1 minute apart
    })
  }

  return history
}

// Get cell position from index
export function getCellPosition(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / 3),
    col: index % 3
  }
}

// Get index from cell position
export function getCellIndex(row: number, col: number): number {
  return row * 3 + col
}

// Check if position is in winning line
export function isInWinningLine(position: number, winningLine: number[] | null): boolean {
  return winningLine ? winningLine.includes(position) : false
}

// Get game phase description
export function getGamePhase(game: TicTacToeGame): string {
  switch (game.gameState) {
    case 'idle':
      return 'Waiting to start'
    case 'playing':
      return game.currentPlayer === game.userSymbol ? 'Your turn' : 'AI thinking...'
    case 'result':
      return formatGameResult(game.result).description
    default:
      return 'Unknown'
  }
}

// Calculate expected value for RTP verification
export function calculateExpectedValue(difficulty: 'easy' | 'medium' | 'hard' | 'house'): number {
  // These are theoretical values - in production they'd be controlled by backend
  const winRates = {
    easy: 0.45,    // 45% win rate
    medium: 0.35,  // 35% win rate
    hard: 0.25,    // 25% win rate
    house: 0.20    // 20% win rate (house advantage)
  }

  const tieRate = 0.10 // 10% tie rate (approximately)
  const winRate = winRates[difficulty]
  const loseRate = 1 - winRate - tieRate

  // Expected value calculation
  // Win: 2x return (1x profit)
  // Tie: 1x return (0 profit/loss)
  // Lose: 0x return (-1x loss)
  const expectedValue = (winRate * 2) + (tieRate * 1) + (loseRate * 0)

  return expectedValue * 100 // Return as percentage
}

// Get difficulty configuration
export function getDifficultyConfig(difficulty: 'easy' | 'medium' | 'hard' | 'house'): {
  name: string
  description: string
  winRate: number
  color: string
  bgColor: string
  borderColor: string
  aiThinkingTime: number
} {
  const configs = {
    easy: {
      name: 'Easy',
      description: 'AI makes frequent mistakes',
      winRate: 0.45,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-600',
      borderColor: 'border-emerald-400',
      aiThinkingTime: 500
    },
    medium: {
      name: 'Medium',
      description: 'Balanced gameplay',
      winRate: 0.35,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600',
      borderColor: 'border-blue-400',
      aiThinkingTime: 800
    },
    hard: {
      name: 'Hard',
      description: 'AI plays optimally',
      winRate: 0.25,
      color: 'text-red-400',
      bgColor: 'bg-red-600',
      borderColor: 'border-red-400',
      aiThinkingTime: 1200
    },
    house: {
      name: 'House Mode',
      description: 'AI has advantage',
      winRate: 0.20,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600',
      borderColor: 'border-purple-400',
      aiThinkingTime: 1000
    }
  }

  return configs[difficulty]
}
