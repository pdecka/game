'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import ModalComponent from '../components/ModalComponent'
import StatCard from '../components/StatCard'
import { adminFinanceService } from '../../services/adminFinanceService'

type CurrencyRow = {
  id: string
  purpose: string
  method: string
  currency: string
  network?: string | null
  displayName?: string | null
  depositAddress?: string | null
  qrImageUrl?: string | null
  enabled?: boolean
}

type FormState = {
  currency: string
  network: string
  depositAddress: string
  qrImageUrl: string
  displayName: string
  enabled: boolean
  method: string
}

type CoinExample = {
  currency: string
  network: string
  name: string
}

const COIN_EXAMPLES: CoinExample[] = [
  { currency: 'USDT', network: 'TRC20', name: 'USDT TRC20' },
  { currency: 'USDT', network: 'ERC20', name: 'USDT ERC20' },
  { currency: 'USDT', network: 'BEP20', name: 'USDT BEP20' },
  { currency: 'USDC', network: 'ERC20', name: 'USDC ERC20' },
  { currency: 'USDC', network: 'TRC20', name: 'USDC TRC20' },
  { currency: 'BTC', network: 'BTC', name: 'Bitcoin' },
  { currency: 'ETH', network: 'ERC20', name: 'Ethereum' },
  { currency: 'TRX', network: 'TRC20', name: 'Tron' },
  { currency: 'BNB', network: 'BEP20', name: 'BNB' },
  { currency: 'LTC', network: 'LTC', name: 'Litecoin' },
  { currency: 'DOGE', network: 'DOGE', name: 'Dogecoin' },
  { currency: 'SOL', network: 'SOL', name: 'Solana' },
  { currency: 'XRP', network: 'XRP', name: 'XRP' },
  { currency: 'BCH', network: 'BCH', name: 'Bitcoin Cash' },
  { currency: 'TON', network: 'TON', name: 'Toncoin' },
  { currency: 'MATIC', network: 'POLYGON', name: 'Polygon' },
  { currency: 'ADA', network: 'ADA', name: 'Cardano' },
  { currency: 'SHIB', network: 'ERC20', name: 'Shiba Inu' },
]

const emptyForm: FormState = {
  currency: '',
  network: '',
  depositAddress: '',
  qrImageUrl: '',
  displayName: '',
  enabled: true,
  method: '',
}

function isCryptoRow(row: { currency?: string; method?: string }) {
  const currency = String(row.currency || '').toUpperCase()
  const method = String(row.method || '')
  if (!currency || currency === 'INR') return false
  if (method === 'bank_transfer' || method.startsWith('local_')) return false
  return true
}

function methodKey(currency: string, network: string, existingMethod: string) {
  if (existingMethod) return existingMethod
  const coin = currency.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
  const chain = network.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
  return [coin || 'crypto', chain].filter(Boolean).join('_')
}

function samePair(row: CurrencyRow, currency: string, network: string) {
  return row.currency.toUpperCase() === currency.toUpperCase() && String(row.network || '').toUpperCase() === network.toUpperCase()
}

export default function CurrencyEnhanced() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<CurrencyRow[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingQr, setUploadingQr] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const data = await adminFinanceService.getDepositCurrencies()
      setRows((Array.isArray(data) ? data : []).filter(isCryptoRow))
    } catch (err: any) {
      if (!silent) toast.error(err?.response?.data?.message || 'Failed to load currencies')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => {
      if (!open) void load(true)
    }, 8000)
    return () => window.clearInterval(timer)
  }, [open])

  const stats = useMemo(() => {
    const on = rows.filter((row) => row.enabled !== false)
    const ready = rows.filter((row) => row.depositAddress && row.qrImageUrl && row.enabled !== false)
    return [
      { title: 'Crypto pairs', value: String(rows.length), trend: 'Saved on this page' },
      { title: 'Turned on', value: String(on.length), trend: 'Shown on Crypto deposit' },
      { title: 'Address and QR', value: String(ready.length), trend: 'Ready for players' },
      { title: 'Examples', value: String(COIN_EXAMPLES.length), trend: 'Pick one and add your details' },
    ]
  }, [rows])

  const openCreate = (example?: CoinExample) => {
    if (example) {
      const existing = rows.find((row) => samePair(row, example.currency, example.network))
      if (existing) {
        openEdit(existing)
        return
      }
      setForm({
        ...emptyForm,
        currency: example.currency,
        network: example.network,
        displayName: example.name,
      })
    } else {
      setForm(emptyForm)
    }
    setOpen(true)
  }

  const openEdit = (row: CurrencyRow) => {
    setForm({
      currency: row.currency || '',
      network: row.network || '',
      depositAddress: row.depositAddress || '',
      qrImageUrl: row.qrImageUrl || '',
      displayName: row.displayName || `${row.currency} ${row.network || ''}`.trim(),
      enabled: row.enabled !== false,
      method: row.method,
    })
    setOpen(true)
  }

  const onSave = async () => {
    const currency = form.currency.trim().toUpperCase()
    const network = form.network.trim()
    if (!currency) {
      toast.error('Enter the coin, such as USDT or BTC')
      return
    }
    if (!network) {
      toast.error('Enter the network, such as TRC20 or BTC')
      return
    }
    if (!form.depositAddress.trim()) {
      toast.error('Enter the deposit address')
      return
    }
    if (!form.qrImageUrl.trim()) {
      toast.error('Upload the QR photo')
      return
    }
    try {
      setSaving(true)
      await adminFinanceService.saveDepositCurrency({
        method: methodKey(currency, network, form.method),
        currency,
        network,
        displayName: form.displayName.trim() || `${currency} ${network}`,
        depositAddress: form.depositAddress.trim(),
        qrImageUrl: form.qrImageUrl.trim(),
        enabled: form.enabled,
      })
      toast.success(form.method ? 'Crypto updated' : 'Crypto added')
      setOpen(false)
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#14532d]">Currency</h1>
        <p className="mt-1 text-[#64748b]">
          Crypto deposits only. Pick a coin, then set your wallet address and QR. Local money stays on Bank Accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <StatCard key={card.title} title={card.title} value={loading ? '...' : card.value} trend={card.trend} />
        ))}
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#020617]">Common coins</h2>
          <button type="button" onClick={() => openCreate()} className="rounded-lg bg-[#22c55e] px-4 py-2 text-xs font-semibold text-white">
            Add another coin
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {COIN_EXAMPLES.map((coin) => {
            const saved = rows.find((row) => samePair(row, coin.currency, coin.network))
            return (
              <button
                key={`${coin.currency}-${coin.network}`}
                type="button"
                onClick={() => openCreate(coin)}
                className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-left hover:border-[#22c55e]"
              >
                <div className="text-sm font-semibold text-[#020617]">{coin.currency}</div>
                <div className="text-xs text-[#64748b]">{coin.network}</div>
                <div className="mt-1 text-[11px] font-medium text-[#22c55e]">{saved ? (saved.enabled === false ? 'Saved, off' : 'Saved') : 'Set address'}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="text-sm text-[#64748b]">{rows.length} crypto {rows.length === 1 ? 'pair' : 'pairs'} saved</div>
        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#e2e8f0] text-left text-[#64748b]">
                <th className="py-3 pr-4 font-medium">Coin</th>
                <th className="py-3 pr-4 font-medium">Network</th>
                <th className="py-3 pr-4 font-medium">Address</th>
                <th className="py-3 pr-4 font-medium">QR</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#64748b]">
                    No crypto addresses yet. Pick a coin above and add yours.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#e2e8f0] text-[#020617]">
                    <td className="py-3 pr-4 whitespace-nowrap">{row.displayName || row.currency}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{row.network || '—'}</td>
                    <td className="max-w-[280px] truncate py-3 pr-4">{row.depositAddress || 'Missing'}</td>
                    <td className="py-3 pr-4">
                      {row.qrImageUrl ? (
                        <img src={row.qrImageUrl} alt="" className="h-10 w-10 rounded border border-[#e2e8f0] object-contain bg-white" />
                      ) : (
                        <span className="text-[#64748b]">Missing</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">{row.enabled === false ? 'Off' : 'On'}</td>
                    <td className="py-3 pr-4">
                      <button type="button" onClick={() => openEdit(row)} className="rounded-md bg-[#22c55e] px-3 py-1 text-xs text-white">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalComponent open={open} title={form.method ? 'Edit crypto' : 'Add crypto'} onClose={() => setOpen(false)}>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <p className="text-sm text-[#64748b]">Players see this coin, address, and QR on the Crypto deposit tab.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-[#64748b]">Coin</label>
              <input
                className="mt-1 w-full rounded-md border border-[#e2e8f0] bg-[#e2e8f0] px-3 py-2 text-[#020617]"
                value={form.currency}
                disabled={Boolean(form.method)}
                placeholder="USDT, BTC, ETH"
                onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b]">Network</label>
              <input
                className="mt-1 w-full rounded-md border border-[#e2e8f0] bg-[#e2e8f0] px-3 py-2 text-[#020617]"
                value={form.network}
                disabled={Boolean(form.method)}
                placeholder="TRC20, ERC20, BTC"
                onChange={(event) => setForm((current) => ({ ...current, network: event.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#64748b]">Name players see</label>
            <input
              className="mt-1 w-full rounded-md border border-[#e2e8f0] bg-[#e2e8f0] px-3 py-2 text-[#020617]"
              value={form.displayName}
              placeholder="USDT TRC20"
              onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-[#64748b]">Deposit address</label>
            <input
              className="mt-1 w-full rounded-md border border-[#e2e8f0] bg-[#e2e8f0] px-3 py-2 text-[#020617]"
              value={form.depositAddress}
              placeholder="Wallet address players will pay"
              onChange={(event) => setForm((current) => ({ ...current, depositAddress: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-[#64748b]">QR photo</label>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-md bg-[#22c55e] px-4 py-2 text-xs font-semibold text-white">
                {uploadingQr ? 'Uploading...' : 'Upload PNG or JPG'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                  className="hidden"
                  disabled={uploadingQr}
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ''
                    if (!file) return
                    const allowed = ['image/png', 'image/jpeg', 'image/jpg']
                    if (!allowed.includes(file.type)) {
                      toast.error('Upload a PNG or JPG photo')
                      return
                    }
                    try {
                      setUploadingQr(true)
                      const uploaded = await adminFinanceService.uploadBankQr(file)
                      setForm((current) => ({ ...current, qrImageUrl: uploaded.url }))
                      toast.success('QR photo uploaded')
                    } catch (err: any) {
                      toast.error(err?.response?.data?.message || 'QR upload failed')
                    } finally {
                      setUploadingQr(false)
                    }
                  }}
                />
              </label>
              {form.qrImageUrl ? (
                <button
                  type="button"
                  className="text-xs text-[#64748b] underline"
                  onClick={() => setForm((current) => ({ ...current, qrImageUrl: '' }))}
                >
                  Remove
                </button>
              ) : (
                <span className="text-xs text-[#64748b]">No photo yet</span>
              )}
            </div>
            {form.qrImageUrl ? (
              <img src={form.qrImageUrl} alt="Crypto QR" className="mt-3 h-28 w-28 rounded-md border border-[#e2e8f0] bg-white object-contain" />
            ) : null}
          </div>
          <div>
            <label className="text-xs text-[#64748b]">Status</label>
            <select
              className="mt-1 w-full rounded-md border border-[#e2e8f0] bg-[#e2e8f0] px-3 py-2 text-[#020617]"
              value={form.enabled ? 'on' : 'off'}
              onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.value === 'on' }))}
            >
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-md bg-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#020617]">
              Cancel
            </button>
            <button type="button" onClick={onSave} disabled={saving || uploadingQr} className="rounded-md bg-[#22c55e] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </ModalComponent>
    </section>
  )
}
