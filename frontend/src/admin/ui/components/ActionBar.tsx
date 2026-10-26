'use client'

interface ActionBarProps {
  searchPlaceholder?: string
  primaryLabel?: string
  onPrimaryAction?: () => void
  showFilters?: boolean
}

export default function ActionBar({
  searchPlaceholder = 'Search...',
  primaryLabel = 'Add',
  onPrimaryAction,
  showFilters = true,
}: ActionBarProps) {
  return (
    <div className="rounded-xl bg-[#ffffff] border border-[#bbf7d0] p-4 shadow-sm flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between transition-all duration-200">
      {showFilters ? (
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <input
            className="w-full sm:max-w-sm rounded-md bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
            placeholder={searchPlaceholder}
          />
        </div>
      ) : (
        <p className="text-sm text-[#64748b]">Live data for the selected IST window.</p>
      )}
      <button
        onClick={onPrimaryAction}
        className="rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-[#ffffff] font-medium px-4 py-2 transition-all duration-200"
      >
        {primaryLabel}
      </button>
    </div>
  )
}

