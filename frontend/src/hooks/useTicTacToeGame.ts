'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { Player, TicTacToeGame, GameHistory, GameState, GameResult } from '@/utils/ticTacToeEngine'
import { checkWinner, getAvailableMoves, getGameStatistics } from '@/utils/ticTacToeEngine'
import type { Difficulty, AIMove } from '@/utils/ticTacToeAI'

interface UseTicTacToeGameReturn {
  // Game state
  game: TicTacToeGame | null
  gameState: GameState
  currentResult: GameResult
  gameHistory: GameHistory[]
  betAmount: number
  userSymbol: Player
  difficulty: Difficulty
  
  // Board state
  board: Player[]
  currentPlayer: Player
  winningLine: number[] | null
  moveCount: number
  
  // AI state
  isAIThinking: boolean
  lastAIMove: AIMove | null
  
  // Computed values
  canPlay: boolean
  canMove: boolean
  isUserTurn: boolean
  availableMoves: number[]
  totalPayout: number
  totalProfit: number
  winRate: number
  
  // Actions
  startGame: (betAmount: number, userSymbol: Player, difficulty: Difficulty) => void
  makePlayerMove: (position: number) => void
  reset: () => void
  setDifficulty: (difficulty: Difficulty) => void
  setUserSymbol: (symbol: Player) => void
  setBetAmount: (amount: number) => void
  
  // Utilities
  validateGame: () => { isValid: boolean; errors: string[] }
  getStatistics: () => ReturnType<typeof getGameStatistics>
  getGamePhase: () => string
}

export function useTicTacToeGame(): UseTicTacToeGameReturn {
  const { user, refreshWallet } = useAuth() as any

  const [game, setGame] = useState<TicTacToeGame | null>(null)
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([])
  const [betAmount, setBetAmount] = useState(10)
  const [userSymbol, setUserSymbol] = useState<Player>('X')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [lastAIMove, setLastAIMove] = useState<AIMove | null>(null)

  // Refs for managing state
  const gameRef = useRef<TicTacToeGame | null>(null)

  const serverOutcomeToResult = (outcome: string | undefined): GameResult => {
    if (outcome === 'win') return 'win'
    if (outcome === 'loss') return 'lose'
    if (outcome === 'draw') return 'tie'
    return null
  }

  const mapSession = useCallback(
    (session: any, prev: TicTacToeGame | null, diff: Difficulty, betAmt: number): TicTacToeGame => {
      const result = session.result || {}
      const finished = Boolean(result.finished)
      const gameResult = finished ? serverOutcomeToResult(result.outcome) : null
      return {
        id: session.id,
        board: result.board || Array(9).fill(null),
        currentPlayer: finished ? null : result.userSymbol,
        userSymbol: result.userSymbol,
        aiSymbol: result.aiSymbol,
        gameState: finished ? 'result' : 'playing',
        result: gameResult,
        winner:
          gameResult === 'win' ? result.userSymbol : gameResult === 'lose' ? result.aiSymbol : null,
        winningLine: result.winningLine || null,
        moveCount: result.moveCount ?? 0,
        timestamp: prev?.timestamp ?? Date.now(),
        betAmount: betAmt,
        payout: Number(session.winAmount ?? 0),
        difficulty: diff,
      }
    },
    []
  )

  // Handle game end
  const handleGameEnd = useCallback((finalGame: TicTacToeGame) => {
    const historyEntry: GameHistory = {
      id: finalGame.id,
      betAmount: finalGame.betAmount,
      result: finalGame.result,
      payout: finalGame.payout,
      difficulty: finalGame.difficulty,
      userSymbol: finalGame.userSymbol as Player | null,
      moveCount: finalGame.moveCount,
      timestamp: Date.now()
    }

    setGameHistory(prev => [historyEntry, ...prev.slice(0, 49)]) // Keep last 50 games
  }, [])

  // Start new game (server-side session; the bet is debited immediately)
  const startGame = useCallback(async (betAmt: number, symbol: Player, diff: Difficulty) => {
    if (betAmt < 1 || betAmt > 10000) {
      toast.error('Invalid bet amount')
      return
    }

    if (!symbol || (symbol !== 'X' && symbol !== 'O')) {
      toast.error('Invalid symbol')
      return
    }

    if (!user) {
      toast.error('Login to play')
      return
    }

    setIsAIThinking(true)
    try {
      const response = await api.post('/games/tic-tac-toe/start', {
        betAmount: betAmt,
        currency: 'INR',
        userSymbol: symbol,
        clientSeed: Date.now().toString(),
      })

      const newGame = mapSession(response.data, null, diff, betAmt)
      gameRef.current = newGame
      setGame(newGame)
      setBetAmount(betAmt)
      setUserSymbol(symbol)
      setDifficulty(diff)
      setLastAIMove(null)
      refreshWallet()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start game')
    } finally {
      setIsAIThinking(false)
    }
  }, [user, mapSession, refreshWallet])

  // Make player move — the server validates it and replies with its own move
  const makePlayerMove = useCallback(async (position: number) => {
    const current = gameRef.current
    if (!current || current.gameState !== 'playing') {
      return
    }

    if (!getAvailableMoves(current.board).includes(position)) {
      return
    }

    setIsAIThinking(true)
    try {
      const response = await api.post('/games/tic-tac-toe/move', {
        sessionId: current.id,
        position,
      })

      const prevBoard = current.board
      const updatedGame = mapSession(response.data, current, current.difficulty, current.betAmount)
      gameRef.current = updatedGame
      setGame(updatedGame)

      // Derive the AI's move from the board diff (for UI highlighting).
      const aiPos = updatedGame.board.findIndex(
        (cell, i) => cell === updatedGame.aiSymbol && prevBoard[i] === null && i !== position,
      )
      if (aiPos >= 0) {
        setLastAIMove({ position: aiPos, score: 0, depth: 0, thinkingTime: 0 })
      }

      if (updatedGame.gameState === 'result') {
        handleGameEnd(updatedGame)
        refreshWallet()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Move failed')
    } finally {
      setIsAIThinking(false)
    }
  }, [mapSession, handleGameEnd, refreshWallet])

  // Reset game
  const reset = useCallback(() => {
    setGame(null)
    gameRef.current = null
    setIsAIThinking(false)
    setLastAIMove(null)
  }, [])
  
  // Computed values
  const gameState = game?.gameState || 'idle'
  const currentResult = game?.result || null
  const board = game?.board || Array(9).fill(null)
  const currentPlayer = game?.currentPlayer || null
  const winningLine = game?.winningLine || null
  const moveCount = game?.moveCount || 0
  const canPlay = gameState === 'idle'
  const canMove = gameState === 'playing' && currentPlayer === userSymbol && !isAIThinking
  const isUserTurn = currentPlayer === userSymbol
  const availableMoves = game ? getAvailableMoves(game.board) : []
  const totalPayout = game?.payout || 0
  const totalProfit = totalPayout - betAmount
  const winRate = gameHistory.length > 0 
    ? (gameHistory.filter(h => h.result === 'win').length / gameHistory.length) * 100 
    : 0
  
  // Validate current game
  const validateGame = useCallback(() => {
    if (!game) {
      return { isValid: false, errors: ['No game in progress'] }
    }
    
    const errors: string[] = []
    
    // Check board validity
    if (game.board.length !== 9) {
      errors.push('Invalid board size')
    }
    
    // Check move count
    const filledCells = game.board.filter(cell => cell !== null).length
    if (game.moveCount !== filledCells) {
      errors.push('Move count mismatch')
    }
    
    // Check winner consistency
    if (game.gameState === 'result') {
      const winner = checkWinner(game.board)
      if (winner && winner.winner !== game.winner) {
        errors.push('Winner mismatch')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [game])
  
  // Get statistics
  const getStatistics = useCallback(() => {
    return getGameStatistics(gameHistory)
  }, [gameHistory])
  
  // Get game phase description
  const getGamePhase = useCallback(() => {
    if (!game) return 'Ready to play'
    
    switch (game.gameState) {
      case 'idle':
        return 'Waiting to start'
      case 'playing':
        return game.currentPlayer === game.userSymbol ? 'Your turn' : 'AI thinking...'
      case 'result':
        switch (game.result) {
          case 'win':
            return 'You won! ð'
          case 'lose':
            return 'AI won! â'
          case 'tie':
            return 'It\'s a tie! ð'
          default:
            return 'Game complete'
        }
      default:
        return 'Unknown'
    }
  }, [game])
  
  return {
    // Game state
    game,
    gameState,
    currentResult,
    gameHistory,
    betAmount,
    userSymbol,
    difficulty,
    
    // Board state
    board,
    currentPlayer,
    winningLine,
    moveCount,
    
    // AI state
    isAIThinking,
    lastAIMove,
    
    // Computed values
    canPlay,
    canMove,
    isUserTurn,
    availableMoves,
    totalPayout,
    totalProfit,
    winRate,
    
    // Actions
    startGame,
    makePlayerMove,
    reset,
    setDifficulty,
    setUserSymbol,
    setBetAmount,
    
    // Utilities
    validateGame,
    getStatistics,
    getGamePhase
  }
}

// Hook for managing betting
export function useTicTacToeBetting() {
  const [betAmount, setBetAmount] = useState(10)
  const [quickBetAmounts] = useState([1, 5, 10, 25, 50, 100])
  
  const setQuickBet = useCallback((amount: number) => {
    setBetAmount(amount)
  }, [])
  
  const incrementBet = useCallback(() => {
    setBetAmount(prev => Math.min(prev + 10, 10000))
  }, [])
  
  const decrementBet = useCallback(() => {
    setBetAmount(prev => Math.max(prev - 10, 1))
  }, [])
  
  const clearBets = useCallback(() => {
    setBetAmount(10)
  }, [])
  
  return {
    betAmount,
    quickBetAmounts,
    setBetAmount,
    setQuickBet,
    incrementBet,
    decrementBet,
    clearBets
  }
}

// Hook for managing game settings
export function useTicTacToeSettings() {
  const [userSymbol, setUserSymbol] = useState<Player | null>('X')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [autoReset, setAutoReset] = useState(true)
  const [showHints, setShowHints] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  return {
    userSymbol,
    setUserSymbol,
    difficulty,
    setDifficulty,
    autoReset,
    setAutoReset,
    showHints,
    setShowHints,
    soundEnabled,
    setSoundEnabled
  }
}

// Hook for managing animations
export function useTicTacToeAnimations() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationType, setAnimationType] = useState<string | null>(null)
  const [winningLineAnimation, setWinningLineAnimation] = useState(false)
  
  const startAnimation = useCallback((type: string, duration: number = 1000) => {
    setIsAnimating(true)
    setAnimationType(type)
    
    setTimeout(() => {
      setIsAnimating(false)
      setAnimationType(null)
    }, duration)
  }, [])
  
  const triggerWinAnimation = useCallback(() => {
    setWinningLineAnimation(true)
    setTimeout(() => {
      setWinningLineAnimation(false)
    }, 2000)
  }, [])
  
  return {
    isAnimating,
    animationType,
    winningLineAnimation,
    startAnimation,
    triggerWinAnimation
  }
}

// Hook for managing sound effects
export function useTicTacToeSounds() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(0.5)
  
  const playSound = useCallback((soundType: 'move' | 'win' | 'lose' | 'tie' | 'game_start') => {
    if (!soundEnabled) return
    
    // Placeholder for actual sound implementation
    console.log(`Playing sound: ${soundType} at volume ${volume}`)
    
    // In a real implementation, this would play actual sound files
    // const audio = new Audio(`/sounds/${soundType}.mp3`)
    // audio.volume = volume
    // audio.play().catch(err => console.warn('Failed to play sound:', err))
  }, [soundEnabled, volume])
  
  return {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    playSound
  }
}

// Hook for managing game persistence
export function useTicTacToePersistence() {
  const saveGameState = useCallback((gameHistory: GameHistory[], settings: any) => {
    try {
      const stateToSave = {
        gameHistory: gameHistory.slice(0, 10), // Save last 10 games
        settings: {
          userSymbol: settings.userSymbol,
          difficulty: settings.difficulty,
          autoReset: settings.autoReset,
          showHints: settings.showHints
        }
      }
      localStorage.setItem('ticTacToeGameState', JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save game state:', error)
    }
  }, [])
  
  const loadGameState = useCallback(() => {
    try {
      const saved = localStorage.getItem('ticTacToeGameState')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load game state:', error)
    }
    return null
  }, [])
  
  const clearGameState = useCallback(() => {
    try {
      localStorage.removeItem('ticTacToeGameState')
    } catch (error) {
      console.error('Failed to clear game state:', error)
    }
  }, [])
  
  return {
    saveGameState,
    loadGameState,
    clearGameState
  }
}

// Hook for managing game analytics
export function useTicTacToeAnalytics() {
  const trackEvent = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    // Placeholder for analytics tracking
    console.log('Analytics Event:', eventName, properties)
    
    // In a real implementation, this would send to analytics service
    // analytics.track(eventName, properties)
  }, [])
  
  const trackGameStart = useCallback((betAmount: number, userSymbol: Player, difficulty: Difficulty) => {
    trackEvent('game_started', {
      betAmount,
      userSymbol,
      difficulty
    })
  }, [trackEvent])
  
  const trackMove = useCallback((position: number, player: Player, gamePhase: string) => {
    trackEvent('move_made', {
      position,
      player,
      gamePhase
    })
  }, [trackEvent])
  
  const trackGameEnd = useCallback((result: GameResult, moveCount: number, payout: number) => {
    trackEvent('game_ended', {
      result,
      moveCount,
      payout
    })
  }, [trackEvent])
  
  return {
    trackEvent,
    trackGameStart,
    trackMove,
    trackGameEnd
  }
}

// Hook for managing error handling
export function useTicTacToeErrorHandling() {
  const [error, setError] = useState<string | null>(null)
  const [errorCount, setErrorCount] = useState(0)
  
  const handleError = useCallback((error: string, recover: () => void) => {
    setError(error)
    setErrorCount(prev => prev + 1)
    
    // Auto-recover after 3 seconds
    setTimeout(() => {
      setError(null)
      recover()
    }, 3000)
  }, [])
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  return {
    error,
    errorCount,
    handleError,
    clearError
  }
}

// Hook for managing accessibility
export function useTicTacToeAccessibility() {
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [screenReader, setScreenReader] = useState(false)
  
  const handleKeyboardNavigation = useCallback((e: React.KeyboardEvent, position: number, onMove: (pos: number) => void) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        onMove(position)
        break
      case 'ArrowUp':
        e.preventDefault()
        // Navigate to cell above
        const row = Math.floor(position / 3)
        const col = position % 3
        if (row > 0) {
          const newPos = (row - 1) * 3 + col
          // Focus new cell
          const newCell = document.querySelector(`[data-position="${newPos}"]`) as HTMLElement
          newCell?.focus()
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        // Navigate to cell below
        const row2 = Math.floor(position / 3)
        const col2 = position % 3
        if (row2 < 2) {
          const newPos = (row2 + 1) * 3 + col2
          const newCell = document.querySelector(`[data-position="${newPos}"]`) as HTMLElement
          newCell?.focus()
        }
        break
      case 'ArrowLeft':
        e.preventDefault()
        // Navigate to cell left
        const row3 = Math.floor(position / 3)
        const col3 = position % 3
        if (col3 > 0) {
          const newPos = row3 * 3 + (col3 - 1)
          const newCell = document.querySelector(`[data-position="${newPos}"]`) as HTMLElement
          newCell?.focus()
        }
        break
      case 'ArrowRight':
        e.preventDefault()
        // Navigate to cell right
        const row4 = Math.floor(position / 3)
        const col4 = position % 3
        if (col4 < 2) {
          const newPos = row4 * 3 + (col4 + 1)
          const newCell = document.querySelector(`[data-position="${newPos}"]`) as HTMLElement
          newCell?.focus()
        }
        break
    }
  }, [])
  
  return {
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    screenReader,
    setScreenReader,
    handleKeyboardNavigation
  }
}
