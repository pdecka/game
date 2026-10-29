'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import ModalComponent from '../components/ModalComponent'
import StatCard from '../components/StatCard'
import { adminFinanceService } from '../../services/adminFinanceService'

type BankAccountRow = {
  id: string
  bankName: string
  accountHolder: string
  accountNumber: string
  ifsc: string
  upiId?: string | null
  qrImageUrl?: string | null
  status: string
  shownToUsers?: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

export default function BankAccountsEnhanced() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<BankAccountRow[]>([])

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadingQr, setUploadingQr] = useState(false)

  const [form, setForm] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
    upiId: '',
    qrImageUrl: '',
    status: 'active',
  })

  const stats = useMemo(() => {
    const total = rows.length
    const active = rows.filter((r) => r.status === 'active').length
    return [
      { title: 'Bank Accounts', value: String(total), trend: `${active} active` },
      { title: 'Active', value: String(active), trend: active === 1 ? 'Primary payout account' : 'Available for withdrawals' },
      { title: 'Inactive', value: String(total - active), trend: 'Not used for default', trendUp: false },
      { title: 'Recent', value: rows[0]?.updatedAt ? new Date(rows[0].updatedAt).toLocaleDateString() : '-', trend: 'Last updated' },
    ]
  }, [rows])

  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const data = await adminFinanceService.getBankAccounts()
      setRows(Array.isArray(data) ? data : [])
    } catch (err: any) {
      if (!silent) toast.error(err?.response?.data?.message || 'Failed to load bank accounts')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const timer = window.setInterval(() => {
      if (!open) void load(true)
    }, 5000)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const openCreate = () => {
    setEditingId(null)
    setForm({ bankName: '', accountHolder: '', accountNumber: '', ifsc: '', upiId: '', qrImageUrl: '', status: 'active' })
    setOpen(true)
  }

  const openEdit = (row: BankAccountRow) => {
    setEditingId(row.id)
    setForm({
      bankName: row.bankName ?? '',
      accountHolder: row.accountHolder ?? '',
      accountNumber: row.accountNumber ?? '',
      ifsc: row.ifsc ?? '',
      upiId: row.upiId ?? '',
      qrImageUrl: row.qrImageUrl ?? '',
      status: row.status ?? 'active',
    })
    setOpen(true)
  }

  const onSave = async () => {
    if (!form.bankName.trim() || !form.accountHolder.trim() || !form.accountNumber.trim() || !form.ifsc.trim()) {
      toast.error('Bank name, account holder, account number, and IFSC are required')
      return
    }
    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        bankName: form.bankName.trim(),
        accountHolder: form.accountHolder.trim(),
        accountNumber: form.accountNumber.trim(),
        ifsc: form.ifsc.trim(),
        upiId: form.upiId.trim(),
        qrImageUrl: form.qrImageUrl.trim(),
        status: form.status,
      }
      await adminFinanceService.upsertBankAccount(payload as any)
      toast.success(editingId ? 'Bank account updated' : 'Bank account added')
      setOpen(false)
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#14532d]">Bank Accounts</h1>
        <p className="text-[#64748b] mt-1">Add or update every deposit account. Users see the active account that was saved most recently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} title={s.title} value={loading ? '...' : s.value} trend={s.trend} trendUp={s.trendUp} />
        ))}
      </div>

      <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <button onClick={openCreate} className="rounded-lg bg-[#22c55e] hover:opacity-90 text-[#ffffff] px-4 py-2 text-xs font-semibold shadow-sm">
            Add Bank Account
          </button>
          <div className="text-sm text-[#64748b]">{rows.length} accounts</div>
        </div>

        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[#64748b] border-b border-[#e2e8f0] bg-[#e2e8f0]">
                <th className="py-3 pr-4 font-medium">Bank</th>
                <th className="py-3 pr-4 font-medium">Account Holder</th>
                <th className="py-3 pr-4 font-medium">Account Number</th>
                <th className="py-3 pr-4 font-medium">IFSC</th>
                <th className="py-3 pr-4 font-medium">UPI</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="rounded-lg border border-dashed border-[#e2e8f0] p-8 text-center text-[#64748b] bg-[#ffffff]">
                      No bank accounts found
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-[#e2e8f0] hover:bg-[#e2e8f0]/40 text-[#020617] transition-all duration-200">
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {r.bankName}
                      {r.shownToUsers ? (
                        <span className="ml-2 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#166534]">Shown to users</span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">{r.accountHolder}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{r.accountNumber}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{r.ifsc}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{r.upiId || '-'}</td>
                    <td className="py-3 pr-4 whitespace-nowrap capitalize">{r.status}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <button onClick={() => openEdit(r)} className="rounded-md px-3 py-1 bg-[#22c55e] hover:opacity-90 text-[#ffffff] text-xs transition-all duration-200">
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

      <ModalComponent open={open} title={editingId ? 'Edit Bank Account' : 'Add Bank Account'} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#64748b]">Bank Name</label>
              <input
                className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b]">Status</label>
              <select
                className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#64748b]">Account Holder</label>
            <input
              className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
              value={form.accountHolder}
              onChange={(e) => setForm((f) => ({ ...f, accountHolder: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs text-[#64748b]">Account Number</label>
            <input
              className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
              value={form.accountNumber}
              onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#64748b]">IFSC</label>
              <input
                className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                value={form.ifsc}
                onChange={(e) => setForm((f) => ({ ...f, ifsc: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b]">UPI</label>
              <input
                className="mt-1 w-full rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                value={form.upiId}
                onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#64748b]">QR photo</label>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <label className="rounded-md bg-[#22c55e] px-4 py-2 text-xs font-semibold text-[#ffffff] cursor-pointer">
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
              <img src={form.qrImageUrl} alt="Bank QR" className="mt-3 h-28 w-28 rounded-md border border-[#e2e8f0] object-contain bg-white" />
            ) : null}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setOpen(false)} className="rounded-md px-4 py-2 bg-[#e2e8f0] hover:opacity-90 text-[#020617] text-sm font-semibold transition-all">
              Cancel
            </button>
            <button onClick={onSave} className="rounded-md px-4 py-2 bg-[#22c55e] hover:opacity-90 text-[#ffffff] text-sm font-semibold transition-all">
              Save
            </button>
          </div>
        </div>
      </ModalComponent>
    </section>
  )
}

