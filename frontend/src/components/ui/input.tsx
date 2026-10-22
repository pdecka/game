import React from 'react'
import { clsx } from 'clsx'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={clsx(
        'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink',
        'placeholder:text-ink-3 outline-none transition duration-200',
        'focus:border-brand/50 focus:ring-2 focus:ring-brand/25',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}
