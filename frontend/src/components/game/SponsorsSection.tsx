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
    <div className="bg-[#0a0a0a] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Game Providers */}
        <div className="mb-12">
          <h3 className="text-center text-lg font-semibold text-white mb-8">
            Trusted Game Providers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-center h-20 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="text-xs text-slate-400 text-center font-medium">
                  {sponsor.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-12">
          <h3 className="text-center text-lg font-semibold text-white mb-8">
            Payment Methods
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {paymentMethods.map((payment) => (
              <div
                key={payment.name}
                className="bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-center h-20 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="text-xs text-slate-400 text-center font-medium">
                  {payment.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-12">
          <h3 className="text-center text-lg font-semibold text-white mb-8">
            Certifications & Licenses
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-center h-20 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="text-xs text-slate-400 text-center font-medium">
                  {cert.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-4">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-white/10">
            <h4 className="text-sm font-semibold text-white mb-2">
              Why Choose Our Platform?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
              <div>
                <div className="font-medium text-white mb-1">🔒 Secure & Fair</div>
                <div>Provably fair games with advanced encryption</div>
              </div>
              <div>
                <div className="font-medium text-white mb-1">⚡ Instant Withdrawals</div>
                <div>Fast and reliable payment processing</div>
              </div>
              <div>
                <div className="font-medium text-white mb-1">🎮 24/7 Gaming</div>
                <div>Play anytime, anywhere on any device</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Logo */}
        <div className="text-center pt-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-sky-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-white font-semibold text-lg">Gaming Platform</span>
          </div>
          <p className="text-xs text-slate-500">
            The premier destination for online gaming and sports betting
          </p>
        </div>
      </div>
    </div>
  )
}
