import { generateGameId, generateRandomNumber, createRoundResult, type RoundResult } from './colorConfig'

export type RoundPhase = 'betting' | 'locked' | 'result' | 'payout' | 'reset'

export interface RoundState {
  gameId: string
  phase: RoundPhase
  startTime: number
  endTime: number
  result: RoundResult | null
  countdown: number
  roundNumber: number
}

export interface RoundEngineConfig {
  bettingPhaseDuration: number
  lockedPhaseDuration: number
  resultPhaseDuration: number
  payoutPhaseDuration: number
  resetPhaseDuration: number
  totalRoundDuration: number
}

export const DEFAULT_ROUND_CONFIG: RoundEngineConfig = {
  bettingPhaseDuration: 30, // 30 seconds
  lockedPhaseDuration: 2,   // 2 seconds
  resultPhaseDuration: 3,    // 3 seconds
  payoutPhaseDuration: 2,   // 2 seconds
  resetPhaseDuration: 1,    // 1 second
  totalRoundDuration: 38    // Total: 38 seconds
}

export class RoundEngine {
  private config: RoundEngineConfig
  private currentRound: RoundState
  private roundNumber: number
  private intervalId: NodeJS.Timeout | null = null
  private callbacks: {
    onPhaseChange?: (phase: RoundPhase, state: RoundState) => void
    onCountdownUpdate?: (countdown: number) => void
    onRoundComplete?: (result: RoundResult) => void
    onNewRound?: (gameId: string) => void
  }

  constructor(config: Partial<RoundEngineConfig> = {}) {
    this.config = { ...DEFAULT_ROUND_CONFIG, ...config }
    this.roundNumber = 1
    this.currentRound = this.createNewRound()
    this.callbacks = {}
  }

  private createNewRound(): RoundState {
    const gameId = generateGameId()
    const now = Date.now()
    
    return {
      gameId,
      phase: 'betting',
      startTime: now,
      endTime: now + this.config.totalRoundDuration * 1000,
      result: null,
      countdown: this.config.bettingPhaseDuration,
      roundNumber: this.roundNumber
    }
  }

  private generateResult(): RoundResult {
    return createRoundResult(generateRandomNumber())
  }

  private updatePhase(newPhase: RoundPhase): void {
    this.currentRound.phase = newPhase
    
    // Update countdown based on phase
    switch (newPhase) {
      case 'betting':
        this.currentRound.countdown = this.config.bettingPhaseDuration
        break
      case 'locked':
        this.currentRound.countdown = this.config.lockedPhaseDuration
        break
      case 'result':
        this.currentRound.countdown = this.config.resultPhaseDuration
        break
      case 'payout':
        this.currentRound.countdown = this.config.payoutPhaseDuration
        break
      case 'reset':
        this.currentRound.countdown = this.config.resetPhaseDuration
        break
    }

    this.callbacks.onPhaseChange?.(newPhase, this.currentRound)
  }

  private advancePhase(): void {
    const currentPhase = this.currentRound.phase

    switch (currentPhase) {
      case 'betting':
        this.updatePhase('locked')
        break
      case 'locked':
        // Generate result when entering result phase
        this.currentRound.result = this.generateResult()
        this.updatePhase('result')
        break
      case 'result':
        this.updatePhase('payout')
        this.callbacks.onRoundComplete?.(this.currentRound.result!)
        break
      case 'payout':
        this.updatePhase('reset')
        break
      case 'reset':
        // Start new round
        this.roundNumber++
        this.currentRound = this.createNewRound()
        this.callbacks.onNewRound?.(this.currentRound.gameId)
        this.updatePhase('betting')
        break
    }
  }

  private tick(): void {
    // Decrement countdown
    this.currentRound.countdown--
    this.callbacks.onCountdownUpdate?.(this.currentRound.countdown)

    // Check if phase should advance
    if (this.currentRound.countdown <= 0) {
      this.advancePhase()
    }
  }

  public start(): void {
    if (this.intervalId) {
      this.stop()
    }

    this.intervalId = setInterval(() => {
      this.tick()
    }, 1000)

    this.callbacks.onNewRound?.(this.currentRound.gameId)
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  public getCurrentRound(): RoundState {
    return { ...this.currentRound }
  }

  public getGameId(): string {
    return this.currentRound.gameId
  }

  public getPhase(): RoundPhase {
    return this.currentRound.phase
  }

  public getCountdown(): number {
    return this.currentRound.countdown
  }

  public getRoundNumber(): number {
    return this.currentRound.roundNumber
  }

  public getResult(): RoundResult | null {
    return this.currentRound.result
  }

  public canBet(): boolean {
    return this.currentRound.phase === 'betting'
  }

  public isLocked(): boolean {
    return this.currentRound.phase === 'locked'
  }

  public isShowingResult(): boolean {
    return this.currentRound.phase === 'result'
  }

  public isPayout(): boolean {
    return this.currentRound.phase === 'payout'
  }

  public isResetting(): boolean {
    return this.currentRound.phase === 'reset'
  }

  public getTimeRemaining(): number {
    return Math.max(0, this.currentRound.endTime - Date.now())
  }

  public getPhaseDuration(phase: RoundPhase): number {
    switch (phase) {
      case 'betting':
        return this.config.bettingPhaseDuration
      case 'locked':
        return this.config.lockedPhaseDuration
      case 'result':
        return this.config.resultPhaseDuration
      case 'payout':
        return this.config.payoutPhaseDuration
      case 'reset':
        return this.config.resetPhaseDuration
    }
  }

  public onPhaseChange(callback: (phase: RoundPhase, state: RoundState) => void): void {
    this.callbacks.onPhaseChange = callback
  }

  public onCountdownUpdate(callback: (countdown: number) => void): void {
    this.callbacks.onCountdownUpdate = callback
  }

  public onRoundComplete(callback: (result: RoundResult) => void): void {
    this.callbacks.onRoundComplete = callback
  }

  public onNewRound(callback: (gameId: string) => void): void {
    this.callbacks.onNewRound = callback
  }

  public reset(): void {
    this.stop()
    this.roundNumber = 1
    this.currentRound = this.createNewRound()
  }

  public getStatus(): {
    gameId: string
    phase: RoundPhase
    countdown: number
    roundNumber: number
    timeRemaining: number
    canBet: boolean
    result: RoundResult | null
  } {
    return {
      gameId: this.currentRound.gameId,
      phase: this.currentRound.phase,
      countdown: this.currentRound.countdown,
      roundNumber: this.currentRound.roundNumber,
      timeRemaining: this.getTimeRemaining(),
      canBet: this.canBet(),
      result: this.currentRound.result
    }
  }
}

// Utility functions for round management
export function createMockRoundEngine(config: Partial<RoundEngineConfig> = {}): RoundEngine {
  return new RoundEngine(config)
}

export function formatPhaseName(phase: RoundPhase): string {
  switch (phase) {
    case 'betting':
      return 'Betting'
    case 'locked':
      return 'Locked'
    case 'result':
      return 'Result'
    case 'payout':
      return 'Payout'
    case 'reset':
      return 'Reset'
    default:
      return 'Unknown'
  }
}

export function getPhaseColor(phase: RoundPhase): string {
  switch (phase) {
    case 'betting':
      return 'text-emerald-400'
    case 'locked':
      return 'text-yellow-400'
    case 'result':
      return 'text-blue-400'
    case 'payout':
      return 'text-purple-400'
    case 'reset':
      return 'text-slate-400'
    default:
      return 'text-white'
  }
}

export function getPhaseDescription(phase: RoundPhase): string {
  switch (phase) {
    case 'betting':
      return 'Place your bets!'
    case 'locked':
      return 'Betting closed'
    case 'result':
      return 'Revealing result...'
    case 'payout':
      return 'Calculating payouts'
    case 'reset':
      return 'Preparing next round'
    default:
      return 'Unknown phase'
  }
}

export function calculateRoundProgress(state: RoundState, config: RoundEngineConfig): number {
  const totalDuration = config.totalRoundDuration
  const elapsed = (Date.now() - state.startTime) / 1000
  return Math.min(100, (elapsed / totalDuration) * 100)
}

export function getNextPhaseTime(phase: RoundPhase, config: RoundEngineConfig): number {
  switch (phase) {
    case 'betting':
      return config.bettingPhaseDuration
    case 'locked':
      return config.bettingPhaseDuration + config.lockedPhaseDuration
    case 'result':
      return config.bettingPhaseDuration + config.lockedPhaseDuration + config.resultPhaseDuration
    case 'payout':
      return config.bettingPhaseDuration + config.lockedPhaseDuration + config.resultPhaseDuration + config.payoutPhaseDuration
    case 'reset':
      return config.totalRoundDuration
    default:
      return 0
  }
}
