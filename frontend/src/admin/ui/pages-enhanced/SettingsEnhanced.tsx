'use client'

import { useState } from 'react'

export default function SettingsEnhanced() {
  const [toggles, setToggles] = useState({
    kycAutoReview: true,
    withdrawalAlerts: true,
    fraudGuard: true,
  })

  const setToggle = (key: keyof typeof toggles) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#ffffff]">Settings</h1>
        <p className="text-[#64748b] mt-1">Configure admin profile and platform-level controls.</p>
      </div>

      <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-6 shadow-sm">
        <h2 className="text-lg font-medium text-[#020617] mb-4">Admin Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
            placeholder="Display Name"
          />
          <input
            className="rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
            placeholder="Email"
          />
        </div>
      </div>

      <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-6 shadow-sm">
        <h2 className="text-lg font-medium text-[#020617] mb-4">Platform Toggles</h2>
        <div className="space-y-3">
          {[
            ['KYC Auto Review', 'kycAutoReview'],
            ['Withdrawal Alerts', 'withdrawalAlerts'],
            ['Fraud Guard', 'fraudGuard'],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[#020617]">{label}</span>
              <button
                onClick={() => setToggle(key as keyof typeof toggles)}
                className={`w-14 h-8 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffff] ${
                  toggles[key as keyof typeof toggles] ? 'bg-[#22c55e]' : 'bg-[#0f172a]'
                }`}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white transform transition ${
                    toggles[key as keyof typeof toggles] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

