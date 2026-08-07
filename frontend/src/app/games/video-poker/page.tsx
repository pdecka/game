'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

export default function VideoPokerPage() {
  const [betAmount, setBetAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [hold, setHold] = useState<boolean[]>([false, false, false, false, false])

  const start = async () => {
    const amt = Number(betAmount)
    if (!amt || amt <= 0) return toast.error('Please enter a valid bet amount')
    setLoading(true)
    try {
      const res = await api.post('/games/video-poker/start', { betAmount: amt, currency: 'INR' })
      setSession(res.data)
      setHold([false, false, false, false, false])
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to start')
    } finally {
      setLoading(false)
    }
  }

  const draw = async () => {
    if (!session?.id) return
    setLoading(true)
    try {
      const res = await api.post('/games/video-poker/draw', { sessionId: session.id, hold })
      setSession(res.data)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Draw failed')
    } finally {
      setLoading(false)
    }
  }

  const hand = session?.result?.hand || []
  const drawn = Boolean(session?.result?.drawn)

  return (
    <div className="min-h-screen bg-[#e2e8f0] p-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-[#020617]">Video Poker</h1>
          <p className="text-sm text-[#64748b] mt-1">Deal 5 cards, hold any, then draw once.</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#020617] mb-2">Bet Amount (INR)</label>
              <Input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} />
            </div>
            <Button onClick={start} disabled={loading} className="w-full bg-[#22c55e] hover:opacity-90 text-white" size="lg">
              {loading ? 'Dealing...' : 'Deal'}
            </Button>

            <Button onClick={draw} disabled={loading || !session || drawn} variant="outline" className="w-full">
              {loading ? 'Drawing...' : drawn ? 'Drawn' : 'Draw'}
            </Button>

            {session ? (
              <div className="rounded-lg border border-[#e2e8f0] bg-[#e2e8f0]/30 p-4">
                <p className="text-sm text-[#64748b]">
                  Hand: <span className="text-[#020617] font-semibold">{session?.result?.handRank ?? '—'}</span>
                </p>
                <p className="text-sm text-[#64748b]">
                  Multiplier: <span className="text-[#020617] font-semibold">{session?.result?.payoutMultiplier ?? 0}</span>x
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#020617]">Cards</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                disabled={!session || drawn}
                onClick={() => setHold((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
                className={`h-24 rounded-xl border p-3 flex flex-col items-center justify-center transition ${
                  hold[i] ? 'border-[#22c55e] bg-[#22c55e]/10' : 'border-[#e2e8f0] bg-[#e2e8f0]/20'
                } ${drawn ? 'opacity-80' : 'hover:bg-[#e2e8f0]/35'}`}
              >
                <div className="text-lg font-black text-[#020617]">{hand[i] ?? '—'}</div>
                <div className="mt-2 text-[11px] text-[#64748b]">{hold[i] ? 'HOLD' : ' '}</div>
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-[#64748b]">Click cards to hold before drawing.</p>
        </div>
      </div>
    </div>
  )
}

