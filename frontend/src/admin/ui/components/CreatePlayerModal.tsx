'use client'

import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import ModalComponent from './ModalComponent'
import { adminAuthService } from '../../services/adminAuthService'

export default function CreatePlayerModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<{ username: string; password: string } | null>(null)

  const reset = () => {
    setUsername('')
    setPassword('')
    setEmail('')
    setCreated(null)
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await adminAuthService.createPlayer({
        username: username.trim(),
        password,
        email: email.trim() || undefined,
      })
      setCreated({ username: username.trim(), password })
      toast.success('Player created. Share the username and password with the client.')
      onCreated?.()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalComponent open={open} title="Add User" onClose={close}>
      {created ? (
        <div className="space-y-3">
          <p className="text-sm text-[#166534]">
            This client can log in on the user site with the credentials below. Copy them now — the password is not stored in plain text.
          </p>
          <div className="rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] p-3 text-sm text-[#14532d] space-y-1">
            <p>
              <span className="font-semibold">User ID:</span> {created.username}
            </p>
            <p>
              <span className="font-semibold">Password:</span> {created.password}
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-4 py-2 bg-[#16a34a] text-white text-sm font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={submit}>
          <div>
            <label className="block text-sm text-[#64748b] mb-1">User ID (username)</label>
            <input
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="client username"
              className="w-full rounded-md bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none focus:ring-2 focus:ring-[#22c55e]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#64748b] mb-1">Password</label>
            <input
              required
              minLength={6}
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="temporary password"
              className="w-full rounded-md bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none focus:ring-2 focus:ring-[#22c55e]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#64748b] mb-1">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="optional@email.com"
              className="w-full rounded-md bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none focus:ring-2 focus:ring-[#22c55e]"
            />
          </div>
          <p className="text-xs text-[#64748b]">Account is created as an active player. No OTP is required for this login.</p>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={close} className="rounded-lg px-3 py-2 bg-[#e2e8f0] text-[#020617]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white font-medium"
            >
              {saving ? 'Creating...' : 'Create login'}
            </button>
          </div>
        </form>
      )}
    </ModalComponent>
  )
}
