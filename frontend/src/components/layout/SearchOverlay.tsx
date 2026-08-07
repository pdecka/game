import { Search } from 'lucide-react'

type SearchOverlayProps = {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm">
      <div className="mx-auto mt-8 max-w-3xl px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0f212e]/90 px-4 py-3 shadow-2xl">
          <Search className="h-5 w-5 text-slate-300" />
          <input
            autoFocus
            type="text"
            placeholder="Search games, events or providers"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onClose()
              }
            }}
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/5 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
          >
            ESC
          </button>
        </div>
      </div>
    </div>
  )
}

