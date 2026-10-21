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
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-line bg-white shadow-panel">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-brand" />
            <h2 className="text-xl font-bold text-ink">Provably Fair</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-ink hover:bg-brand/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Explanation */}
          <div className="rounded-lg border border-line bg-elevated p-4">
            <p className="text-sm leading-relaxed text-ink-2">
              This game uses cryptographic commitment to ensure fairness. The server commits to a random seed 
              before the game starts by publishing its hash. After the game ends, the seed is revealed so you can 
              independently verify that the outcome was generated fairly.
            </p>
          </div>

          {/* Game Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">Game Information</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-line bg-elevated p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-ink-3">
                  <Hash className="h-3 w-3" />
                  Server Seed Hash
                </div>
                <div className="break-all font-mono text-sm text-ink">
                  {serverSeedHash || 'Not available'}
                </div>
              </div>

              <div className="rounded-lg border border-line bg-elevated p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-ink-3">
                  <Hash className="h-3 w-3" />
                  Client Seed
                </div>
                <div className="break-all font-mono text-sm text-ink">
                  {clientSeed || 'Not available'}
                </div>
              </div>

              <div className="rounded-lg border border-line bg-elevated p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-ink-3">
                  <Clock className="h-3 w-3" />
                  Nonce
                </div>
                <div className="font-mono text-sm text-ink">
                  {nonce ?? 'Not available'}
                </div>
              </div>

              <div className="rounded-lg border border-line bg-elevated p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-ink-3">
                  <Cpu className="h-3 w-3" />
                  Algorithm Version
                </div>
                <div className="font-mono text-sm text-ink">
                  {algorithmVersion || 'mines-v1'}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Section */}
          {gameCompleted && sessionId && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-ink">Verify Fairness</h3>
              
              {!verificationResult && (
                <Button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full bg-brand font-semibold text-white hover:bg-brand-2"
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
                      <CheckCircle className="h-6 w-6 text-brand" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <p className={`font-semibold ${
                        verificationResult.verified ? 'text-brand-2' : 'text-red-500'
                      }`}>
                        {verificationResult.verified ? 'VERIFIED' : 'VERIFICATION FAILED'}
                      </p>
                      <p className="text-xs text-ink-3">
                        {verificationResult.verified 
                          ? 'The game result is cryptographically verified as fair' 
                          : 'The game result could not be verified'}
                      </p>
                    </div>
                  </div>

                  {/* Verification Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-2">Hash Valid:</span>
                      <span className={verificationResult.hashValid ? 'text-brand-2' : 'text-red-500'}>
                        {verificationResult.hashValid ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-2">Positions Match:</span>
                      <span className={verificationResult.positionsMatch ? 'text-brand-2' : 'text-red-500'}>
                        {verificationResult.positionsMatch ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-2">Original Mine Positions:</span>
                      <span className="font-mono text-ink">
                        {JSON.stringify(verificationResult.originalMinePositions)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-2">Regenerated Mine Positions:</span>
                      <span className="font-mono text-ink">
                        {JSON.stringify(verificationResult.regeneratedMinePositions)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-2">Server Seed (Revealed):</span>
                      <span className="max-w-[200px] break-all font-mono text-ink">
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
