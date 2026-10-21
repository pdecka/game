import { Search } from 'lucide-react'

type SearchOverlayProps = {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm">
      <div className="mx-auto mt-8 max-w-3xl px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 shadow-panel">
          <Search className="h-5 w-5 text-ink-3" />
          <input
            autoFocus
            type="text"
            placeholder="Search games, events or providers"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onClose()
              }
            }}
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-elevated px-3 py-1 text-xs text-ink-2 hover:bg-brand/10 hover:text-ink"
          >
            ESC
          </button>
        </div>
      </div>
    </div>
  )
}
