import React from 'react'
import { clsx } from 'clsx'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean
}

export function Card({ className, padded = true, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-line bg-card shadow-panel',
        padded && 'p-5 sm:p-6',
        className
      )}
      {...props}
    />
  )
}
