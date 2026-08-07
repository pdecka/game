'use client'

import { Clock, AlertCircle } from 'lucide-react'
import { formatPhaseName, getPhaseColor, getPhaseDescription } from '@/utils/roundEngine'
import type { RoundPhase } from '@/utils/roundEngine'

interface ColorTimerProps {
  gameId: string
  phase: string
  countdown: number
  roundNumber: number
}

export default function ColorTimer({ gameId, phase, countdown, roundNumber }: ColorTimerProps) {
  const getPhaseIcon = () => {
    switch (phase) {
      case 'betting':
        return <Clock className="h-5 w-5" />
      case 'locked':
        return <AlertCircle className="h-5 w-5" />
      case 'result':
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      case 'payout':
        return <div className="h-5 w-5 animate-pulse">ð</div>
      case 'reset':
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
      default:
        return <Clock className="h-5 w-5" />
    }
  }
  
  const getTimerColor = () => {
    switch (phase) {
      case 'betting':
        return countdown <= 5 ? 'text-red-400' : 'text-emerald-400'
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
  
  const getProgressColor = () => {
    switch (phase) {
      case 'betting':
        return countdown <= 5 ? 'bg-red-500' : 'bg-emerald-500'
      case 'locked':
        return 'bg-yellow-500'
      case 'result':
        return 'bg-blue-500'
      case 'payout':
        return 'bg-purple-500'
      case 'reset':
        return 'bg-slate-500'
      default:
        return 'bg-gray-500'
    }
  }
  
  const getProgressWidth = () => {
    const maxCountdown = 30 // Maximum betting time
    return Math.max(0, (countdown / maxCountdown) * 100)
  }
  
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="bg-[#0f212e] rounded-lg border border-white/10 p-6">
      <div className="space-y-4">
        {/* Game ID and Round Number */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">Game ID</div>
            <div className="text-lg font-bold text-white font-mono">
              {gameId.slice(-8)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Round</div>
            <div className="text-lg font-bold text-white">
              #{roundNumber}
            </div>
          </div>
        </div>
        
        {/* Phase and Timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${getPhaseColor(phase as RoundPhase)}`}>
              {getPhaseIcon()}
            </div>
            <div>
              <div className={`text-lg font-bold ${getPhaseColor(phase as RoundPhase)}`}>
                {formatPhaseName(phase as RoundPhase)}
              </div>
              <div className="text-sm text-slate-400">
                {getPhaseDescription(phase as RoundPhase)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getTimerColor()}`}>
              {formatCountdown(countdown)}
            </div>
            <div className="text-sm text-slate-400">
              {phase === 'betting' ? 'Time to bet' : 'Remaining'}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Progress</span>
            <span>{Math.round(getProgressWidth())}%</span>
          </div>
          <div className="w-full bg-[#1a2c38] rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
              style={{ width: `${getProgressWidth()}%` }}
            ></div>
          </div>
        </div>
        
        {/* Phase-specific messages */}
        {phase === 'betting' && countdown <= 5 && (
          <div className="text-center p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="text-red-400 font-medium animate-pulse">
              Hurry up! Betting closes in {countdown} seconds
            </div>
          </div>
        )}
        
        {phase === 'locked' && (
          <div className="text-center p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <div className="text-yellow-400 font-medium">
              Betting closed - Result incoming...
            </div>
          </div>
        )}
        
        {phase === 'result' && (
          <div className="text-center p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <div className="text-blue-400 font-medium">
              Revealing winning number...
            </div>
          </div>
        )}
        
        {phase === 'payout' && (
          <div className="text-center p-3 bg-purple-500/20 border border-purple-500/50 rounded-lg">
            <div className="text-purple-400 font-medium">
              Calculating payouts...
            </div>
          </div>
        )}
        
        {phase === 'reset' && (
          <div className="text-center p-3 bg-slate-500/20 border border-slate-500/50 rounded-lg">
            <div className="text-slate-400 font-medium">
              Preparing next round...
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-slate-400">Phase</div>
            <div className={`text-sm font-medium ${getPhaseColor(phase as RoundPhase)}`}>
              {formatPhaseName(phase as RoundPhase)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Countdown</div>
            <div className={`text-sm font-medium ${getTimerColor()}`}>
              {countdown}s
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Status</div>
            <div className={`text-sm font-medium ${getPhaseColor(phase as RoundPhase)}`}>
              {phase === 'betting' ? 'Open' : 'Closed'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
