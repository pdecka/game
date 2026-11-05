'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import ModalComponent from './ModalComponent'
import { adminAuthService, type AdminUser } from '../../services/adminAuthService'

const inputClass =
  'w-full rounded-md bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none focus:ring-2 focus:ring-[#22c55e]'

function dateValue(value?: string | null) {
  if (!value) return ''
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ''
}

export default function EditPlayerModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser | null
  onClose: () => void
  onSaved: () => void
}) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mobile, setMobile] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')
  const [status, setStatus] = useState('active')
  const [kycStatus, setKycStatus] = useState('pending')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setUsername(user.username || '')
    setEmail(user.email || '')
    setPassword('')
    setShowPassword(false)
    setMobile(user.mobile || '')
    setCountryCode(user.countryCode || '')
    setFirstName(user.firstName || '')
    setLastName(user.lastName || '')
    setDateOfBirth(dateValue(user.dateOfBirth))
    setAddress(user.address || '')
    setCity(user.city || '')
    setPostalCode(user.postalCode || '')
    setCountry(user.country || '')
    setStatus(user.status || 'active')
    setKycStatus(user.kycStatus || 'pending')
  }, [user])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return
    try {
      setSaving(true)
      await adminAuthService.updatePlayer(user.id, {
        username: username.trim(),
        email: email.trim(),
        password,
        mobile: mobile.trim(),
        countryCode: countryCode.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        status,
        kycStatus,
      })
      toast.success('User details updated')
      onSaved()
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not update this user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalComponent open={Boolean(user)} title="Edit user" onClose={onClose}>
      <form className="max-h-[70vh] space-y-3 overflow-y-auto pr-1" onSubmit={submit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-[#64748b]">
            Username
            <input required minLength={3} value={username} onChange={(e) => setUsername(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-sm text-[#64748b]">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-sm text-[#64748b]">
            Mobile
            <input value={mobile} onChange={(e) => setMobile(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-sm text-[#64748b]">
            Country code
            <input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} placeholder="+91" className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-sm text-[#64748b]">
            First name
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-sm text-[#64748b]">
            Last name
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-sm text-[#64748b]">
            Date of birth
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-sm text-[#64748b]">
            Country
            <input value={country} onChange={(e) => setCountry(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-sm text-[#64748b]">
            City
            <input value={city} onChange={(e) => setCity(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-sm text-[#64748b]">
            Postal code
            <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
        </div>
        <label className="block text-sm text-[#64748b]">
          Address
          <input value={address} onChange={(e) => setAddress(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-sm text-[#64748b]">
          New password
          <span className="mt-1 flex gap-2">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              minLength={password ? 6 : undefined}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep the current password"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="rounded-md border border-[#e2e8f0] px-2 text-[#64748b] hover:text-[#020617]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-[#64748b]">
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} mt-1`}>
              <option value="active">active</option>
              <option value="suspended">suspended</option>
              <option value="kyc_pending">kyc_pending</option>
              <option value="withdraw_locked">withdraw_locked</option>
              <option value="banned">banned</option>
            </select>
          </label>
          <label className="block text-sm text-[#64748b]">
            KYC
            <select value={kycStatus} onChange={(e) => setKycStatus(e.target.value)} className={`${inputClass} mt-1`}>
              <option value="pending">pending</option>
              <option value="verified">verified</option>
              <option value="rejected">rejected</option>
              <option value="expired">expired</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg bg-[#e2e8f0] px-3 py-2 text-[#020617]">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#16a34a] px-4 py-2 font-medium text-white hover:bg-[#15803d] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save details'}
          </button>
        </div>
      </form>
    </ModalComponent>
  )
}
