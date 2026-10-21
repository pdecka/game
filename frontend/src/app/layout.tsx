import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Gaming Platform - Casino & Sports Betting',
  description: 'Premium online casino and sports betting platform',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-bg text-ink antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              className: 'text-sm',
              style: {
                background: '#FFFFFF',
                color: '#0B1F12',
                border: '1px solid #D7E8DC',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
