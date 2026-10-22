import React from 'react'
import { clsx } from 'clsx'

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'brand' | 'success' | 'warn' | 'danger'
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        {
          'bg-elevated text-ink-2': tone === 'neutral',
          'bg-brand/15 text-brand-2': tone === 'brand' || tone === 'success',
          'bg-warn-muted text-warn': tone === 'warn',
          'bg-danger-muted text-danger': tone === 'danger',
        },
        className
      )}
      {...props}
    />
  )
}
