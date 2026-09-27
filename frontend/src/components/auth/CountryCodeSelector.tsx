'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

// Country data with dial codes and flags
const COUNTRIES = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '🇭🇺' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧' },
  { code: 'AF', name: 'Afghanistan', dialCode: '+93', flag: '🇦🇫' },
  { code: 'MM', name: 'Myanmar', dialCode: '+95', flag: '🇲🇲' },
  { code: 'KH', name: 'Cambodia', dialCode: '+855', flag: '🇰🇭' },
  { code: 'LA', name: 'Laos', dialCode: '+856', flag: '🇱🇦' },
]

interface CountryCodeSelectorProps {
  value: string
  onChange: (dialCode: string, countryCode: string) => void
  disabled?: boolean
}

export default function CountryCodeSelector({ value, onChange, disabled = false }: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const selectedCountry = useMemo(() => {
    return COUNTRIES.find(c => c.dialCode === value) || COUNTRIES[0]
  }, [value])

  const filteredCountries = useMemo(() => {
    if (!searchTerm) return COUNTRIES
    const term = searchTerm.toLowerCase()
    return COUNTRIES.filter(country => 
      country.name.toLowerCase().includes(term) ||
      country.dialCode.includes(term) ||
      country.code.toLowerCase().includes(term)
    )
  }, [searchTerm])

  const handleSelect = (country: typeof COUNTRIES[0]) => {
    onChange(country.dialCode, country.code)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-3 bg-[#1a2c38] border border-white/20 rounded-l-lg hover:bg-[#2a3c48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
      >
        <span className="text-xl">{selectedCountry.flag}</span>
        <span className="text-white text-sm font-medium">{selectedCountry.dialCode}</span>
        {!disabled && <ChevronDown className="w-4 h-4 text-white/60" />}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-[#0f212e] border border-white/20 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a2c38] border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Country List */}
          <div className="overflow-y-auto max-h-60">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-white/40 text-sm">
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a2c38] transition-colors text-left"
                >
                  <span className="text-xl">{country.flag}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{country.name}</div>
                    <div className="text-white/40 text-xs">{country.code}</div>
                  </div>
                  <div className="text-white/60 text-sm">{country.dialCode}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
