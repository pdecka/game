'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, MessageCircle } from 'lucide-react'

export default function GameFooter() {
  return (
    <footer className="bg-[#0f212e] border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Casino */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Casino</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/games/crash" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Crash
                </Link>
              </li>
              <li>
                <Link href="/games/dice" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Dice
                </Link>
              </li>
              <li>
                <Link href="/games/mines" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Mines
                </Link>
              </li>
              <li>
                <Link href="/games/roulette" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Roulette
                </Link>
              </li>
              <li>
                <Link href="/casino" className="text-xs text-slate-400 hover:text-white transition-colors">
                  All Games
                </Link>
              </li>
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Sports</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sports/football" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Football
                </Link>
              </li>
              <li>
                <Link href="/sports/basketball" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Basketball
                </Link>
              </li>
              <li>
                <Link href="/sports/tennis" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Tennis
                </Link>
              </li>
              <li>
                <Link href="/sports/cricket" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Cricket
                </Link>
              </li>
              <li>
                <Link href="/sports" className="text-xs text-slate-400 hover:text-white transition-colors">
                  All Sports
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support/contact" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/support/faq" className="text-xs text-slate-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support/responsible-gaming" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Responsible Gaming
                </Link>
              </li>
              <li>
                <Link href="/support/complaints" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Complaints
                </Link>
              </li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">About Us</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-xs text-slate-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Partners
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Payment Info</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/payments/deposit" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Deposit Methods
                </Link>
              </li>
              <li>
                <Link href="/payments/withdrawal" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Withdrawal
                </Link>
              </li>
              <li>
                <Link href="/payments/crypto" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Crypto
                </Link>
              </li>
              <li>
                <Link href="/payments/security" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/payments/fees" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Fees
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/kyc" className="text-xs text-slate-400 hover:text-white transition-colors">
                  KYC Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/aml" className="text-xs text-slate-400 hover:text-white transition-colors">
                  AML Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/responsible-gaming" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Responsible Gaming
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-xs text-slate-400">
                © 2024 Gaming Platform. All rights reserved.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Play responsibly. 18+ only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
