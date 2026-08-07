'use client'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

export default function ModalComponent({ open, title, onClose, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#020617]/60 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#020617]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-[#020617] transition-colors duration-200"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

