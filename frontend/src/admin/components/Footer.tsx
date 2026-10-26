'use client'

export default function AdminFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-[#bbf7d0] bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <img src="/logo-vertical.png" alt="Arena Bet" className="h-10 w-auto object-contain sm:h-12" />
        <p className="text-right text-[11px] leading-snug text-[#64748b] sm:text-xs">
          © {year} Arena Bet. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
