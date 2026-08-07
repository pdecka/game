'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import EnhancedPage from '../ui/pages-enhanced/EnhancedPage'
import ModalComponent from '../ui/components/ModalComponent'
import { adminAuthService, GameSetting } from '../services/adminAuthService'

function num(v: any, fallback: number) {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}

export default function GameManagementPage() {
  const [settings, setSettings] = useState<GameSetting[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<GameSetting | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const data = await adminAuthService.getGameSettings()
        if (mounted) setSettings(data)
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load game settings')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const cards = useMemo(() => {
    const total = settings.length
    const enabled = settings.filter((s) => s.enabled).length
    const disabled = total - enabled
    const avgRtp = total > 0 ? settings.reduce((sum, s) => sum + num(s.rtp, 0.95), 0) / total : 0.95
    return [
      { title: 'Total Games', value: loading ? '...' : String(total) },
      { title: 'Enabled', value: loading ? '...' : String(enabled) },
      { title: 'Disabled', value: loading ? '...' : String(disabled), trendUp: false },
      { title: 'Avg RTP', value: loading ? '...' : `${(avgRtp * 100).toFixed(2)}%` },
    ]
  }, [settings, loading])

  const openEdit = (gameType: string) => {
    const found = settings.find((s) => s.gameType === gameType) || null
    setEditing(found)
    setOpen(true)
  }

  const save = async () => {
    if (!editing) return
    try {
      setSaving(true)
      const updated = await adminAuthService.updateGameSetting({
        gameType: editing.gameType,
        enabled: editing.enabled,
        rtp: num(editing.rtp, 0.95),
        houseEdge: num(editing.houseEdge, 0.05),
        currency: editing.currency,
        minBet: num(editing.minBet, 1),
        maxBet: num(editing.maxBet, 100000),
        maxWin: num(editing.maxWin, 1000000),
        manualOverride: editing.manualOverride,
        forceWin: editing.manualOverride ? editing.forceWin : null,
        winChance: editing.manualOverride ? editing.winChance : null,
      })
      setSettings((prev) => prev.map((p) => (p.gameType === updated.gameType ? (updated as any) : p)))
      toast.success('Game setting updated')
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update setting')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <EnhancedPage
        title="Game Management"
        description="Configure enablement, RTP, bet limits, and admin overrides for every casino game."
        ctaLabel="Manage"
        cards={cards as any}
        columns={['Game', 'Enabled', 'RTP', 'House Edge', 'Min Bet', 'Max Bet', 'Max Win', 'Override']}
        rows={settings
          .slice()
          .sort((a, b) => String(a.gameType).localeCompare(String(b.gameType)))
          .map((s) => [
            String(s.gameType),
            s.enabled ? 'Yes' : 'No',
            `${(num(s.rtp, 0.95) * 100).toFixed(2)}%`,
            `${(num(s.houseEdge, 0.05) * 100).toFixed(2)}%`,
            String(num(s.minBet, 1)),
            String(num(s.maxBet, 100000)),
            String(num(s.maxWin, 1000000)),
            s.manualOverride ? `On` : 'Off',
          ])}
        onEditRow={(row) => openEdit(String(row[0]))}
      />

      <ModalComponent
        open={open}
        title={editing ? `Edit: ${editing.gameType}` : 'Edit Game'}
        onClose={() => setOpen(false)}
      >
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm text-[#64748b]">
                Enabled
                <select
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  value={editing.enabled ? 'yes' : 'no'}
                  onChange={(e) => setEditing({ ...editing, enabled: e.target.value === 'yes' })}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label className="text-sm text-[#64748b]">
                Currency
                <select
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  value={editing.currency}
                  onChange={(e) => setEditing({ ...editing, currency: e.target.value })}
                >
                  <option value="INR">INR</option>
                  <option value="USDT">USDT</option>
                  <option value="BTC">BTC</option>
                </select>
              </label>

              <label className="text-sm text-[#64748b]">
                RTP (0.50–1.00)
                <input
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  type="number"
                  step="0.0001"
                  min="0.5"
                  max="1"
                  value={String(editing.rtp ?? '')}
                  onChange={(e) => setEditing({ ...editing, rtp: Number(e.target.value) as any })}
                />
              </label>

              <label className="text-sm text-[#64748b]">
                House Edge (0–0.50)
                <input
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  type="number"
                  step="0.0001"
                  min="0"
                  max="0.5"
                  value={String(editing.houseEdge ?? '')}
                  onChange={(e) => setEditing({ ...editing, houseEdge: Number(e.target.value) as any })}
                />
              </label>

              <label className="text-sm text-[#64748b]">
                Min Bet
                <input
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  type="number"
                  step="0.01"
                  min="0"
                  value={String(editing.minBet ?? '')}
                  onChange={(e) => setEditing({ ...editing, minBet: Number(e.target.value) as any })}
                />
              </label>

              <label className="text-sm text-[#64748b]">
                Max Bet
                <input
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  type="number"
                  step="0.01"
                  min="0"
                  value={String(editing.maxBet ?? '')}
                  onChange={(e) => setEditing({ ...editing, maxBet: Number(e.target.value) as any })}
                />
              </label>

              <label className="text-sm text-[#64748b]">
                Max Win
                <input
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  type="number"
                  step="0.01"
                  min="0"
                  value={String(editing.maxWin ?? '')}
                  onChange={(e) => setEditing({ ...editing, maxWin: Number(e.target.value) as any })}
                />
              </label>

              <label className="text-sm text-[#64748b]">
                Manual Override
                <select
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  value={editing.manualOverride ? 'on' : 'off'}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      manualOverride: e.target.value === 'on',
                      forceWin: e.target.value === 'on' ? editing.forceWin : null,
                      winChance: e.target.value === 'on' ? editing.winChance : null,
                    })
                  }
                >
                  <option value="off">Off</option>
                  <option value="on">On</option>
                </select>
              </label>

              <label className="text-sm text-[#64748b]">
                Force Result
                <select
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  disabled={!editing.manualOverride}
                  value={editing.forceWin === null ? 'none' : editing.forceWin ? 'win' : 'loss'}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      forceWin: e.target.value === 'none' ? null : e.target.value === 'win',
                    })
                  }
                >
                  <option value="none">No force</option>
                  <option value="win">Force win</option>
                  <option value="loss">Force loss</option>
                </select>
              </label>

              <label className="text-sm text-[#64748b]">
                Win Chance (0–1)
                <input
                  className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  type="number"
                  step="0.0001"
                  min="0"
                  max="1"
                  disabled={!editing.manualOverride}
                  value={editing.winChance === null || typeof editing.winChance === 'undefined' ? '' : String(editing.winChance)}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      winChance: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="optional"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 bg-[#e2e8f0] hover:opacity-90 text-[#020617] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-lg px-3 py-2 bg-[#22c55e] hover:opacity-90 text-[#ffffff] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : null}
      </ModalComponent>
    </>
  )
}

