'use client'

import Image from 'next/image'

export default function SponsorsSection() {
  const sponsors = [
    { name: 'NetEnt', logo: '/sponsors/netent.png' },
    { name: 'Microgaming', logo: '/sponsors/microgaming.png' },
    { name: 'Evolution', logo: '/sponsors/evolution.png' },
    { name: 'Pragmatic Play', logo: '/sponsors/pragmatic.png' },
    { name: 'Playtech', logo: '/sponsors/playtech.png' },
    { name: 'Betsoft', logo: '/sponsors/betsoft.png' },
    { name: 'Yggdrasil', logo: '/sponsors/yggdrasil.png' },
    { name: 'Quickspin', logo: '/sponsors/quickspin.png' },
  ]

  const paymentMethods = [
    { name: 'Visa', logo: '/payments/visa.png' },
    { name: 'Mastercard', logo: '/payments/mastercard.png' },
    { name: 'Bitcoin', logo: '/payments/bitcoin.png' },
    { name: 'Ethereum', logo: '/payments/ethereum.png' },
    { name: 'Litecoin', logo: '/payments/litecoin.png' },
    { name: 'Dogecoin', logo: '/payments/dogecoin.png' },
    { name: 'USDT', logo: '/payments/usdt.png' },
    { name: 'Razorpay', logo: '/payments/razorpay.png' },
  ]

  const certifications = [
    { name: 'Gaming License', logo: '/certifications/gaming-license.png' },
    { name: 'SSL Certified', logo: '/certifications/ssl.png' },
    { name: 'Responsible Gaming', logo: '/certifications/responsible-gaming.png' },
    { name: '18+', logo: '/certifications/18-plus.png' },
  ]

  return (
    <div className="border-t border-line bg-bg-2">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Game Providers */}
        <div className="mb-12">
          <h3 className="mb-8 text-center text-lg font-semibold text-ink">
            Trusted Game Providers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="flex h-20 items-center justify-center rounded-lg border border-line bg-white p-4 transition-colors hover:border-brand/40"
              >
                <div className="text-center text-xs font-medium text-ink-2">
                  {sponsor.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-12">
          <h3 className="mb-8 text-center text-lg font-semibold text-ink">
            Payment Methods
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {paymentMethods.map((payment) => (
              <div
                key={payment.name}
                className="flex h-20 items-center justify-center rounded-lg border border-line bg-white p-4 transition-colors hover:border-brand/40"
              >
                <div className="text-center text-xs font-medium text-ink-2">
                  {payment.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-12">
          <h3 className="mb-8 text-center text-lg font-semibold text-ink">
            Certifications & Licenses
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="flex h-20 items-center justify-center rounded-lg border border-line bg-white p-4 transition-colors hover:border-brand/40"
              >
                <div className="text-center text-xs font-medium text-ink-2">
                  {cert.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-4">
          <div className="rounded-lg border border-line bg-white p-6">
            <h4 className="mb-2 text-sm font-semibold text-ink">
              Why Choose Our Platform?
            </h4>
            <div className="grid grid-cols-1 gap-4 text-xs text-ink-2 md:grid-cols-3">
              <div>
                <div className="mb-1 font-medium text-ink">🔒 Secure & Fair</div>
                <div>Provably fair games with advanced encryption</div>
              </div>
              <div>
                <div className="mb-1 font-medium text-ink">⚡ Instant Withdrawals</div>
                <div>Fast and reliable payment processing</div>
              </div>
              <div>
                <div className="mb-1 font-medium text-ink">🎮 24/7 Gaming</div>
                <div>Play anytime, anywhere on any device</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Logo */}
        <div className="border-t border-line pt-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand">
              <span className="text-sm font-bold text-white">G</span>
            </div>
            <span className="text-lg font-semibold text-ink">Gaming Platform</span>
          </div>
          <p className="text-xs text-ink-3">
            The premier destination for online gaming and sports betting
          </p>
        </div>
      </div>
    </div>
  )
}
