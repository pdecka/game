'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  createTile,
  generateBoardId,
  generateRowId,
  generateRoundId,
  calculatePayout,
  type Difficulty,
  type TowerBoard,
  type TowerRow,
  type Tile,
  type TowerRound
} from '@/utils/towerConfig'

export type GameState = 'idle' | 'playing' | 'step_won' | 'lost' | 'cashed_out'

// The backend tower is always 3 columns per level with one safe column.
const TOWER_COLUMNS = 3
const TOWER_LEVELS = 11

interface UseTowerGameReturn {
  // Game state
  gameState: GameState
  currentBoard: TowerBoard | null
  currentStep: number
  selectedTile: Tile | null
  revealedTile: Tile | null
  currentMultiplier: number
  potentialPayout: number
  
  // Betting
  betAmount: number
  difficulty: Difficulty
  
  // History
  history: TowerRound[]
  
  // Actions
  startGame: (amount: number, diff: Difficulty) => void
  selectTile: (column: number) => void
  cashout: () => void
  reset: () => void
  setBetAmount: (amount: number) => void
  setDifficulty: (diff: Difficulty) => void
  
  // Computed values
  canPlay: boolean
  canSelectTile: boolean
  canCashout: boolean
  isGameOver: boolean
  stepsCompleted: number
  maxSteps: number
  totalPayout: number
  isWin: boolean
}

function buildRow(rowNumber: number): TowerRow {
  const tiles: Tile[] = []
  for (let column = 0; column < TOWER_COLUMNS; column++) {
    tiles.push(createTile(rowNumber, column, 'egg'))
  }
  return {
    id: generateRowId(rowNumber),
    rowNumber,
    tiles,
    isCompleted: false
  }
}

function buildBoard(difficulty: Difficulty): TowerBoard {
  const rows: TowerRow[] = []
  for (let row = 0; row < TOWER_LEVELS; row++) {
    rows.push(buildRow(row))
  }
  return {
    id: generateBoardId(),
    rows,
    difficulty,
    currentStep: 0,
    selectedPath: []
  }
}

export function useTowerGame(): UseTowerGameReturn {
  const { user, refreshWallet } = useAuth() as any
  
  const [gameState, setGameState] = useState<GameState>('idle')
  const [currentBoard, setCurrentBoard] = useState<TowerBoard | null>(null)
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [revealedTile, setRevealedTile] = useState<Tile | null>(null)
  const [currentMultiplier, setCurrentMultiplier] = useState(1)
  const [potentialPayout, setPotentialPayout] = useState(0)
  const [betAmount, setBetAmount] = useState(10)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [history, setHistory] = useState<TowerRound[]>([])
  const [currentBetAmount, setCurrentBetAmount] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    return () => {
      if (stepTimeoutRef.current) {
        clearTimeout(stepTimeoutRef.current)
      }
    }
  }, [])
  
  const startGame = useCallback(
    async (amount: number, diff: Difficulty) => {
      if (gameState !== 'idle' || loading) return
      if (!user) {
        toast.error('Login to play')
        return
      }
      if (amount <= 0) {
        toast.error('Invalid bet amount')
        return
      }
      
      setLoading(true)
      try {
        const response = await api.post('/games/tower/start', {
          betAmount: amount,
          currency: 'INR',
          clientSeed: Date.now().toString()
        })
        
        const data = response.data
        
        setSessionId(data?.id ?? null)
        setCurrentBoard(buildBoard(diff))
        setCurrentBetAmount(amount)
        setGameState('playing')
        setSelectedTile(null)
        setRevealedTile(null)
        setCurrentMultiplier(1)
        setPotentialPayout(amount)
        refreshWallet?.()
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Bet failed')
      } finally {
        setLoading(false)
      }
    },
    [gameState, loading, user, refreshWallet]
  )
  
  const pushRound = useCallback(
    (board: TowerBoard, steps: number, finalMultiplier: number, payout: number, outcome: 'lost' | 'cashed_out' | 'completed') => {
      const newRound: TowerRound = {
        id: generateRoundId(),
        timestamp: Date.now(),
        betAmount: currentBetAmount,
        difficulty: board.difficulty,
        board,
        stepsCompleted: steps,
        finalMultiplier,
        payout,
        outcome,
        path: board.selectedPath
      }
      setHistory(prev => [newRound, ...prev].slice(0, 20))
    },
    [currentBetAmount]
  )
  
  const selectTileAction = useCallback(
    async (column: number) => {
      if (!currentBoard || gameState !== 'playing' || loading || !sessionId) return
      if (column < 0 || column >= TOWER_COLUMNS) return
      
      setLoading(true)
      try {
        const response = await api.post('/games/tower/action', {
          sessionId,
          action: 'pick',
          column
        })
        
        const data = response.data
        const res = data?.result || {}
        const rowIndex = currentBoard.currentStep
        
        if (data?.status === 'completed' || res.finished) {
          if (res.outcome === 'loss') {
            const pickedColumn = Number(res.pick ?? column)
            const safeColumn = Number(res.safe ?? 0)
            
            const newRows = currentBoard.rows.map((row, idx) => {
              if (idx !== rowIndex) return row
              return {
                ...row,
                tiles: row.tiles.map(tile => {
                  if (tile.column === pickedColumn) {
                    return { ...tile, type: 'monster' as const, isRevealed: true, isSelected: true }
                  }
                  if (tile.column === safeColumn) {
                    return { ...tile, type: 'egg' as const, isRevealed: true }
                  }
                  return tile
                })
              }
            })
            
            const newBoard: TowerBoard = {
              ...currentBoard,
              rows: newRows,
              selectedPath: [...currentBoard.selectedPath, pickedColumn]
            }
            const monsterTile = newRows[rowIndex].tiles.find(tile => tile.column === pickedColumn) ?? null
            
            setCurrentBoard(newBoard)
            setSelectedTile(monsterTile)
            setRevealedTile(monsterTile)
            setCurrentMultiplier(0)
            setPotentialPayout(0)
            setGameState('lost')
            pushRound(newBoard, rowIndex, 0, 0, 'lost')
            refreshWallet?.()
          } else {
            // Server completed the session in the player's favour (e.g. top of tower).
            const winAmount = Number(data?.winAmount ?? 0)
            const finalMultiplier = Number(res.multiplier ?? currentMultiplier)
            
            const newBoard: TowerBoard = {
              ...currentBoard,
              currentStep: currentBoard.rows.length,
              selectedPath: [...currentBoard.selectedPath, column]
            }
            setCurrentBoard(newBoard)
            setCurrentMultiplier(finalMultiplier)
            setPotentialPayout(winAmount)
            setGameState('cashed_out')
            pushRound(newBoard, newBoard.rows.length, finalMultiplier, winAmount, 'completed')
            refreshWallet?.()
          }
        } else {
          const pickedColumn = Number(res.lastPick ?? column)
          const newLevel = Number(res.level ?? rowIndex + 1)
          const newMultiplier = Number(res.multiplier ?? currentMultiplier)
          
          let rows = currentBoard.rows
          while (rows.length <= newLevel) {
            rows = [...rows, buildRow(rows.length)]
          }
          
          const newRows = rows.map((row, idx) => {
            if (idx !== rowIndex) return row
            return {
              ...row,
              isCompleted: true,
              tiles: row.tiles.map(tile =>
                tile.column === pickedColumn
                  ? { ...tile, type: 'egg' as const, isRevealed: true, isSelected: true }
                  : tile
              )
            }
          })
          
          const newBoard: TowerBoard = {
            ...currentBoard,
            rows: newRows,
            currentStep: newLevel,
            selectedPath: [...currentBoard.selectedPath, pickedColumn]
          }
          const eggTile = newRows[rowIndex].tiles.find(tile => tile.column === pickedColumn) ?? null
          
          setCurrentBoard(newBoard)
          setSelectedTile(eggTile)
          setRevealedTile(eggTile)
          setCurrentMultiplier(newMultiplier)
          setPotentialPayout(calculatePayout(currentBetAmount, newMultiplier))
          setGameState('step_won')
          
          stepTimeoutRef.current = setTimeout(() => {
            setGameState(prev => (prev === 'step_won' ? 'playing' : prev))
          }, 1000)
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Action failed')
      } finally {
        setLoading(false)
      }
    },
    [currentBoard, gameState, loading, sessionId, currentBetAmount, currentMultiplier, pushRound, refreshWallet]
  )
  
  const cashoutAction = useCallback(async () => {
    if (!currentBoard || (gameState !== 'playing' && gameState !== 'step_won') || loading || !sessionId) return
    
    setLoading(true)
    try {
      const response = await api.post('/games/tower/action', {
        sessionId,
        action: 'cashout'
      })
      
      const data = response.data
      const res = data?.result || {}
      const winAmount = Number(data?.winAmount ?? calculatePayout(currentBetAmount, currentMultiplier))
      const finalMultiplier = Number(res.multiplier ?? currentMultiplier)
      
      setGameState('cashed_out')
      setCurrentMultiplier(finalMultiplier)
      setPotentialPayout(winAmount)
      pushRound(currentBoard, currentBoard.currentStep, finalMultiplier, winAmount, 'cashed_out')
      refreshWallet?.()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cashout failed')
    } finally {
      setLoading(false)
    }
  }, [currentBoard, gameState, loading, sessionId, currentBetAmount, currentMultiplier, pushRound, refreshWallet])
  
  const reset = useCallback(() => {
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current)
      stepTimeoutRef.current = null
    }
    setGameState('idle')
    setCurrentBoard(null)
    setSelectedTile(null)
    setRevealedTile(null)
    setCurrentMultiplier(1)
    setPotentialPayout(0)
    setCurrentBetAmount(0)
    setSessionId(null)
  }, [])
  
  // Computed values
  const currentStep = currentBoard?.currentStep || 0
  const maxSteps = currentBoard?.rows.length ?? TOWER_LEVELS
  const canPlay = gameState === 'idle'
  const canSelectTile = gameState === 'playing' && currentBoard !== null && !loading
  const canCashout = gameState === 'playing' && currentStep > 0 && !loading
  const isGameOver = gameState === 'lost' || gameState === 'cashed_out'
  const stepsCompleted = currentStep
  const totalPayout = potentialPayout
  const isWin = gameState === 'cashed_out' && totalPayout > currentBetAmount
  
  return {
    gameState,
    currentBoard,
    currentStep,
    selectedTile,
    revealedTile,
    currentMultiplier,
    potentialPayout,
    betAmount,
    difficulty,
    history,
    startGame: (amount: number, diff: Difficulty) => {
      void startGame(amount, diff)
    },
    selectTile: (column: number) => {
      void selectTileAction(column)
    },
    cashout: () => {
      void cashoutAction()
    },
    reset,
    setBetAmount,
    setDifficulty,
    canPlay,
    canSelectTile,
    canCashout,
    isGameOver,
    stepsCompleted,
    maxSteps,
    totalPayout,
    isWin
  }
}
