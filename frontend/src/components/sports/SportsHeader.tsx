'use client'

interface SportsHeaderProps {
  selectedCategory?: string
  count?: number
}

export default function SportsHeader({ selectedCategory, count }: SportsHeaderProps) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold text-ink">Sports</h1>
      <p className="mt-1 text-sm text-ink-2">
        {selectedCategory ? selectedCategory : 'Live and upcoming matches'}
        {typeof count === 'number' ? ` · ${count}` : ''}
      </p>
    </div>
  )
}
