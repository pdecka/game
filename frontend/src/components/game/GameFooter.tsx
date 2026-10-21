'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, MessageCircle } from 'lucide-react'

export default function GameFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Casino */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-ink">Casino</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/games/crash" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Crash
                </Link>
              </li>
              <li>
                <Link href="/games/dice" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Dice
                </Link>
              </li>
              <li>
                <Link href="/games/mines" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Mines
                </Link>
              </li>
              <li>
                <Link href="/games/roulette" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Roulette
                </Link>
              </li>
              <li>
                <Link href="/casino" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  All Games
                </Link>
              </li>
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-ink">Sports</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sports/football" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Football
                </Link>
              </li>
              <li>
                <Link href="/sports/basketball" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Basketball
                </Link>
              </li>
              <li>
                <Link href="/sports/tennis" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Tennis
                </Link>
              </li>
              <li>
                <Link href="/sports/cricket" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Cricket
                </Link>
              </li>
              <li>
                <Link href="/sports" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  All Sports
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-ink">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support/contact" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/support/faq" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support/responsible-gaming" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Responsible Gaming
                </Link>
              </li>
              <li>
                <Link href="/support/complaints" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Complaints
                </Link>
              </li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-ink">About Us</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Partners
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-ink">Payment Info</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/payments/deposit" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Deposit Methods
                </Link>
              </li>
              <li>
                <Link href="/payments/withdrawal" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Withdrawal
                </Link>
              </li>
              <li>
                <Link href="/payments/crypto" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Crypto
                </Link>
              </li>
              <li>
                <Link href="/payments/security" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/payments/fees" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Fees
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-ink">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/kyc" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  KYC Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/aml" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  AML Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/responsible-gaming" className="text-xs text-ink-2 transition-colors hover:text-brand-2">
                  Responsible Gaming
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-line pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <Link href="#" className="text-ink-2 transition-colors hover:text-brand-2">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-ink-2 transition-colors hover:text-brand-2">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-ink-2 transition-colors hover:text-brand-2">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-ink-2 transition-colors hover:text-brand-2">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-ink-2 transition-colors hover:text-brand-2">
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-xs text-ink-2">
                © 2024 Gaming Platform. All rights reserved.
              </p>
              <p className="mt-1 text-xs text-ink-3">
                Play responsibly. 18+ only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
