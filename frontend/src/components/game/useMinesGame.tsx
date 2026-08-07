'use client'

import { useState, useCallback } from 'react'
import api from '@/lib/api'

export type GameState = 'idle' | 'playing' | 'lost' | 'cashed_out'

interface GameData {
  betAmount: number
  minesCount: number
  minePositions: boolean[]
  revealedTiles: boolean[]
  revealedCount: number
  currentMultiplier: number
  potentialWin: number
  sessionId?: string
}

const emptyGrid = () => Array(25).fill(false)

export function useMinesGame() {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [betAmount, setBetAmount] = useState('')
  const [minesCount, setMinesCount] = useState(3)
  const [gameData, setGameData] = useState<GameData>({
    betAmount: 0,
    minesCount: 3,
    minePositions: emptyGrid(),
    revealedTiles: emptyGrid(),
    revealedCount: 0,
    currentMultiplier: 1,
    potentialWin: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Client-side preview only; the authoritative multiplier comes from the server.
  const calculateMultiplier = useCallback((mines: number, revealed: number) => {
    const totalTiles = 25
    const safeSpots = totalTiles - mines
    if (safeSpots <= 0) return 0
    const probability = safeSpots / totalTiles
    return Math.pow(1 / probability, revealed) * 0.95
  }, [])

  // Start new game. Mine positions stay on the server until the game ends.
  const startGame = useCallback(async () => {
    const bet = parseFloat(betAmount)
    if (bet <= 0 || isNaN(bet)) {
      setError('Invalid bet amount')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/games/mines/start', {
        betAmount: bet,
        currency: 'INR',
        gridSize: 25,
        mines: minesCount,
        positions: [],
        clientSeed: Date.now().toString(),
      })

      setGameData({
        betAmount: bet,
        minesCount,
        minePositions: emptyGrid(),
        revealedTiles: emptyGrid(),
        revealedCount: 0,
        currentMultiplier: 1,
        potentialWin: bet,
        sessionId: response.data.id ?? response.data.sessionId,
      })

      setGameState('playing')
      return true
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place bet')
      return false
    } finally {
      setLoading(false)
    }
  }, [betAmount, minesCount])

  // Reveal a tile via the backend; the server decides whether it's a mine.
  const handleTileClick = useCallback(
    async (index: number) => {
      if (gameState !== 'playing' || loading) return
      if (gameData.revealedTiles[index]) return
      if (!gameData.sessionId) return

      setLoading(true)
      setError(null)

      try {
        const response = await api.post('/games/mines/reveal', {
          sessionId: gameData.sessionId,
          position: index,
        })

        const result = response.data?.result || {}
        const newRevealedTiles = [...gameData.revealedTiles]
        newRevealedTiles[index] = true
        const newRevealedCount = gameData.revealedCount + 1

        if (result.hitMine) {
          // Game over — server reveals all mine positions in the completed session.
          const minePositions = emptyGrid()
          ;(result.minePositions || []).forEach((pos: number) => {
            if (pos >= 0 && pos < 25) minePositions[pos] = true
          })
          setGameData((prev) => ({
            ...prev,
            minePositions,
            revealedTiles: newRevealedTiles,
            revealedCount: newRevealedCount,
            currentMultiplier: 0,
            potentialWin: 0,
          }))
          setGameState('lost')
        } else {
          const multiplier = result.multiplier ?? calculateMultiplier(gameData.minesCount, newRevealedCount)
          setGameData((prev) => ({
            ...prev,
            revealedTiles: newRevealedTiles,
            revealedCount: newRevealedCount,
            currentMultiplier: multiplier,
            potentialWin: result.potentialWin ?? prev.betAmount * multiplier,
          }))
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to reveal tile')
      } finally {
        setLoading(false)
      }
    },
    [gameState, gameData, loading, calculateMultiplier]
  )

  // Cashout — the server uses its own record of revealed tiles.
  const cashout = useCallback(async () => {
    if (gameState !== 'playing' || !gameData.sessionId) return

    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/games/mines/cashout', {
        sessionId: gameData.sessionId,
      })

      const result = response.data?.result || {}
      if (result.win) {
        // Reveal mines for the end-of-game board.
        const minePositions = emptyGrid()
        ;(result.minePositions || []).forEach((pos: number) => {
          if (pos >= 0 && pos < 25) minePositions[pos] = true
        })
        setGameData((prev) => ({ ...prev, minePositions }))
        setGameState('cashed_out')
      } else {
        setError('Cashout failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cashout failed')
    } finally {
      setLoading(false)
    }
  }, [gameState, gameData.sessionId])

  // Random pick
  const randomPick = useCallback(() => {
    if (gameState !== 'playing') return

    const unrevealedIndices = gameData.revealedTiles
      .map((revealed, index) => (!revealed ? index : -1))
      .filter((index) => index !== -1)

    if (unrevealedIndices.length === 0) return

    const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)]
    handleTileClick(randomIndex)
  }, [gameState, gameData.revealedTiles, handleTileClick])

  // Reset game
  const resetGame = useCallback(() => {
    setGameState('idle')
    setError(null)
    setGameData({
      betAmount: 0,
      minesCount,
      minePositions: emptyGrid(),
      revealedTiles: emptyGrid(),
      revealedCount: 0,
      currentMultiplier: 1,
      potentialWin: 0,
      sessionId: undefined,
    })
  }, [minesCount])

  // Update mines count and reset if not playing
  const updateMinesCount = useCallback(
    (newMines: number) => {
      setMinesCount(newMines)
      if (gameState === 'idle') {
        setGameData((prev) => ({
          ...prev,
          minesCount: newMines,
        }))
      }
    },
    [gameState]
  )

  return {
    gameState,
    betAmount,
    setBetAmount,
    minesCount,
    setMinesCount: updateMinesCount,
    gameData,
    startGame,
    handleTileClick,
    cashout,
    randomPick,
    resetGame,
    calculateMultiplier,
    loading,
    error,
  }
}
