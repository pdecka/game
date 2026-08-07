'use client'

interface ActionBarProps {
  searchPlaceholder?: string
  primaryLabel?: string
  onPrimaryAction?: () => void
}

export default function ActionBar({
  searchPlaceholder = 'Search...',
  primaryLabel = 'Add',
  onPrimaryAction,
}: ActionBarProps) {
  return (
    <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-4 shadow-sm flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between transition-all duration-200">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <input
          className="w-full sm:max-w-sm rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] placeholder:text-[#64748b] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
          placeholder={searchPlaceholder}
        />
        <select className="rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]">
          <option>All Status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Completed</option>
        </select>
        <input
          type="date"
          className="rounded-md bg-[#e2e8f0] border border-[#e2e8f0] px-3 py-2 text-[#020617] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
        />
      </div>
      <button
        onClick={onPrimaryAction}
        className="rounded-lg bg-[#22c55e] hover:opacity-90 text-[#ffffff] font-medium px-4 py-2 transition-all duration-200"
      >
        {primaryLabel}
      </button>
    </div>
  )
}

