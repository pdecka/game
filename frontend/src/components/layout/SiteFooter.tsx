import Link from 'next/link'

const LINKS = [
  { href: '/casino', label: 'Casino' },
  { href: '/sports', label: 'Sports' },
  { href: '/blog', label: 'Blog' },
  { href: '/legal/terms', label: 'Terms & Conditions' },
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/cookies', label: 'Cookie Policy' },
]

const SPONSORS = ['NetEnt', 'Evolution', 'Pragmatic Play', 'Playtech']

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-8">
        <img src="/logo-vertical.png" alt="Arena Bet" className="h-64 w-auto object-contain sm:h-80" />
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-2">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-2">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-center text-xs text-ink-3">
          Sponsors · {SPONSORS.join(' · ')}
        </p>
        <p className="text-center text-xs text-ink-3">© {new Date().getFullYear()} Arena Bet. 18+ only. Play responsibly.</p>
      </div>
    </footer>
  )
}
