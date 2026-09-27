'use client'

import { useState } from 'react'
import { X, Shield, CheckCircle, XCircle, Hash, Clock, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface ProvablyFairModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId?: string
  gameCompleted: boolean
  serverSeedHash?: string
  clientSeed?: string
  nonce?: number
  algorithmVersion?: string
}

export default function ProvablyFairModal({
  isOpen,
  onClose,
  sessionId,
  gameCompleted,
  serverSeedHash,
  clientSeed,
  nonce,
  algorithmVersion
}: ProvablyFairModalProps) {
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (!sessionId) return

    setVerifying(true)
    setError(null)
    setVerificationResult(null)

    try {
      const response = await api.get(`/games/mines/verify/${sessionId}`)
      setVerificationResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f212e] rounded-xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Provably Fair</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Explanation */}
          <div className="bg-[#1a2c38] rounded-lg p-4 border border-white/10">
            <p className="text-sm text-slate-300 leading-relaxed">
              This game uses cryptographic commitment to ensure fairness. The server commits to a random seed 
              before the game starts by publishing its hash. After the game ends, the seed is revealed so you can 
              independently verify that the outcome was generated fairly.
            </p>
          </div>

          {/* Game Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Game Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#1a2c38] rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Hash className="w-3 h-3" />
                  Server Seed Hash
                </div>
                <div className="text-white text-sm font-mono break-all">
                  {serverSeedHash || 'Not available'}
                </div>
              </div>

              <div className="bg-[#1a2c38] rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Hash className="w-3 h-3" />
                  Client Seed
                </div>
                <div className="text-white text-sm font-mono break-all">
                  {clientSeed || 'Not available'}
                </div>
              </div>

              <div className="bg-[#1a2c38] rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Clock className="w-3 h-3" />
                  Nonce
                </div>
                <div className="text-white text-sm font-mono">
                  {nonce ?? 'Not available'}
                </div>
              </div>

              <div className="bg-[#1a2c38] rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Cpu className="w-3 h-3" />
                  Algorithm Version
                </div>
                <div className="text-white text-sm font-mono">
                  {algorithmVersion || 'mines-v1'}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Section */}
          {gameCompleted && sessionId && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Verify Fairness</h3>
              
              {!verificationResult && (
                <Button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                >
                  {verifying ? 'Verifying...' : 'Verify Game Result'}
                </Button>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {verificationResult && (
                <div className={`rounded-lg p-4 border ${
                  verificationResult.verified 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {verificationResult.verified ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <p className={`font-semibold ${
                        verificationResult.verified ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {verificationResult.verified ? 'VERIFIED' : 'VERIFICATION FAILED'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {verificationResult.verified 
                          ? 'The game result is cryptographically verified as fair' 
                          : 'The game result could not be verified'}
                      </p>
                    </div>
                  </div>

                  {/* Verification Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hash Valid:</span>
                      <span className={verificationResult.hashValid ? 'text-emerald-400' : 'text-red-400'}>
                        {verificationResult.hashValid ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Positions Match:</span>
                      <span className={verificationResult.positionsMatch ? 'text-emerald-400' : 'text-red-400'}>
                        {verificationResult.positionsMatch ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Original Mine Positions:</span>
                      <span className="text-white font-mono">
                        {JSON.stringify(verificationResult.originalMinePositions)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Regenerated Mine Positions:</span>
                      <span className="text-white font-mono">
                        {JSON.stringify(verificationResult.regeneratedMinePositions)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Server Seed (Revealed):</span>
                      <span className="text-white font-mono break-all max-w-[200px]">
                        {verificationResult.serverSeed}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!gameCompleted && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                Complete the game to verify its fairness. The server seed will be revealed after the game ends.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
