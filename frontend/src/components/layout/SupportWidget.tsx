'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Headphones, X } from 'lucide-react'

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I create an account?',
    a: 'Open Register, enter your email and password, then confirm the 6-digit code sent to your email. After that you can log in with email and password.',
  },
  {
    q: 'I did not get the registration OTP. What should I do?',
    a: 'Check spam or promotions, then use Resend OTP on the verify screen. The code is valid for about 10–15 minutes. You only need OTP the first time you register.',
  },
  {
    q: 'How do I log in after registering?',
    a: 'Use the same email and password on the Login page. OTP is not asked again after your email is verified.',
  },
  {
    q: 'How do I deposit funds?',
    a: 'Open Wallet in the top bar, choose Deposit, follow the on-screen payment details, and submit your request. Credits appear after the deposit is approved.',
  },
  {
    q: 'How long do deposits take?',
    a: 'Submitted deposits wait for review. Once approved, your INR balance updates automatically. Refresh the page or wait a short moment if it does not appear immediately.',
  },
  {
    q: 'How do I withdraw?',
    a: 'Open Wallet, choose Withdraw, and enter the amount and payout details. Withdrawals are processed from your available INR balance, not from open sports exposure.',
  },
  {
    q: 'What is the wallet balance in the top bar?',
    a: 'That is your available INR. On sports pages, logged-in users also see exposure in brackets: available (open stake).',
  },
  {
    q: 'What is sports exposure?',
    a: 'Exposure is the total stake on pending sports bets. It is held until those bets settle. Settled wins credit stake × odds back to your balance.',
  },
  {
    q: 'How do I place a casino bet?',
    a: 'Open Casino from the sidebar or homepage slider, pick a game, set your stake, and play. Results settle in the game itself.',
  },
  {
    q: 'How do I bet on sports?',
    a: 'Open a sport from the homepage cards or Sports in the sidebar, pick a match, add selections to the bet slip, enter a stake, and place the bet.',
  },
  {
    q: 'Which sports can I bet on?',
    a: 'Football, cricket, basketball, tennis, baseball, American football, ice hockey, rugby, and any other sports listed on the Sports lobby. Availability follows live fixtures.',
  },
  {
    q: 'Why does a sport show no matches?',
    a: 'There may be no live or upcoming events in the current feed for that sport. Check again later or pick another sport from the lobby.',
  },
  {
    q: 'Are cricket nested markets (over, ball, player) real book prices?',
    a: 'Match lists use live fixture data. Nested cricket prices are Arena house prices derived from the live scorecard when the feed has no book odds for that market.',
  },
  {
    q: 'Can I cash out a sports bet?',
    a: 'Open bets stay pending until the market settles. There is no cash-out button. Check History or your sports bets list for status.',
  },
  {
    q: 'How do I find a game quickly?',
    a: 'Use the search icon in the top bar, the homepage search field, or the Casino and Sports sliders on Home.',
  },
  {
    q: 'Is Arena Bet available in my country?',
    a: 'Access depends on your location. Some regions are restricted. If the site is blocked, that is a compliance rule, not a login error.',
  },
  {
    q: 'Why was my bet rejected or voided?',
    a: 'Bets can be voided or markets suspended for security, late odds changes, or compliance checks. Stake is returned when a bet is voided.',
  },
  {
    q: 'How do I see my betting history?',
    a: 'Open your profile menu in the top right and choose History, or visit Dashboard. Sports pending bets also appear in the bet slip area when you are on sports.',
  },
  {
    q: 'I forgot my password. What now?',
    a: 'Use Login and the password recovery option if shown. If you still cannot get in, email the address used on your account emails with the registered address.',
  },
  {
    q: 'Do I need KYC?',
    a: 'Your account starts in a pending-check state after registration. We may ask for identity documents before large withdrawals or when required for security.',
  },
  {
    q: 'Are the games fair?',
    a: 'Original casino games use the platform’s fairness tools where shown in the game. Sports results follow the live event, not invented scores.',
  },
  {
    q: 'What is the minimum age?',
    a: 'You must be 18 or older to register, deposit, or place bets. Underage play is not allowed.',
  },
  {
    q: 'How do I gamble responsibly?',
    a: 'Set personal limits, never chase losses, and stop if play is no longer fun. Use Responsible Gambling in the sidebar when that section is available, or contact us from this panel.',
  },
  {
    q: 'Where are Terms, Privacy, and Cookies?',
    a: 'They are linked in the site footer: Terms & Conditions, Privacy Policy, and Cookie Policy.',
  },
  {
    q: 'How do I contact support if my question is not listed?',
    a: 'Email the address on your registration or account emails with your username and a short description. This panel covers the most common questions so you can get an answer immediately.',
  },
]

export function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<number | null>(0)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full border border-brand/40 bg-brand text-white shadow-lift transition hover:bg-brand-2"
        aria-label="Support"
        title="Support"
      >
        <Headphones className="h-6 w-6" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-title"
            className="flex max-h-[min(82vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 id="support-title" className="text-lg font-semibold text-ink">
                  Support
                </h2>
                <p className="mt-1 text-sm text-ink-3">
                  Common questions. Tap a topic to read the answer.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="icon-btn shrink-0" aria-label="Close support">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto px-5 py-4">
              {FAQS.map((item, index) => {
                const expanded = active === index
                return (
                  <div key={item.q} className="rounded-xl border border-line bg-white">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-ink"
                      aria-expanded={expanded}
                      onClick={() => setActive(expanded ? null : index)}
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-ink-3 transition ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                    {expanded ? (
                      <p className="border-t border-line px-4 py-3 text-sm leading-6 text-ink-2">{item.a}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
