import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-brand text-white hover:bg-brand-2 active:bg-brand-2': variant === 'default',
          'bg-elevated text-ink hover:bg-brand/15': variant === 'secondary',
          'border border-line bg-white text-ink hover:border-brand/40 hover:bg-brand/10': variant === 'outline',
          'text-ink-2 hover:bg-brand/10 hover:text-ink': variant === 'ghost',
          'bg-danger text-white hover:bg-red-700': variant === 'destructive',
          'h-9 px-3 text-sm': size === 'sm',
          'h-11 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
          'h-10 w-10 p-0': size === 'icon',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
