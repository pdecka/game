'use client'

import Link from 'next/link'
import { useState } from 'react'
import { X, ChevronDown, Home, Trophy, Zap, Crown, Users, FileText, Globe, HelpCircle, Star, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GameSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function GameSidebar({ isOpen, onClose }: GameSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['casino'])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const menuSections = [
    {
      id: 'favourites',
      title: 'Favourites',
      icon: <Star className="h-4 w-4" />,
      items: []
    },
    {
      id: 'recent',
      title: 'Recent',
      icon: <Clock className="h-4 w-4" />,
      items: []
    },
    {
      id: 'challenges',
      title: 'Challenges',
      icon: <Trophy className="h-4 w-4" />,
      items: []
    },
    {
      id: 'bets',
      title: 'My Bets',
      icon: <FileText className="h-4 w-4" />,
      items: []
    },
    {
      id: 'games',
      title: 'Games',
      icon: <Trophy className="h-4 w-4" />,
      items: [
        { name: 'Only on Stake', href: '/games/exclusive' },
        { name: 'New Releases', href: '/games/new' },
        { name: 'Slots', href: '/games/slots' },
        { name: 'Stake Originals', href: '/games/originals' },
        { name: 'Live Casino', href: '/casino/live' },
        { name: 'Game Shows', href: '/games/shows' },
        { name: 'Burst Games', href: '/games/burst' },
        { name: 'Enhanced RTP', href: '/games/rtp' },
      ]
    },
    {
      id: 'sports',
      title: 'Sports',
      icon: <Zap className="h-4 w-4" />,
      items: [
        { name: 'Live Betting', href: '/sports/live' },
        { name: 'Football', href: '/sports/football' },
        { name: 'Basketball', href: '/sports/basketball' },
        { name: 'Tennis', href: '/sports/tennis' },
        { name: 'Cricket', href: '/sports/cricket' },
        { name: 'All Sports', href: '/sports' },
      ]
    },
    {
      id: 'promotions',
      title: 'Promotions',
      icon: <Star className="h-4 w-4" />,
      items: [
        { name: 'Welcome Bonus', href: '/promotions/welcome' },
        { name: 'Daily Rewards', href: '/promotions/daily' },
        { name: 'VIP Program', href: '/promotions/vip' },
        { name: 'Tournaments', href: '/promotions/tournaments' },
        { name: 'All Promos', href: '/promotions' },
      ]
    },
    {
      id: 'vip',
      title: 'VIP Club',
      icon: <Crown className="h-4 w-4" />,
      items: [
        { name: 'VIP Levels', href: '/vip/levels' },
        { name: 'Benefits', href: '/vip/benefits' },
        { name: 'Cashback', href: '/vip/cashback' },
        { name: 'Exclusive Games', href: '/vip/exclusive' },
      ]
    },
    {
      id: 'affiliate',
      title: 'Affiliate',
      icon: <Users className="h-4 w-4" />,
      items: [
        { name: 'Join Program', href: '/affiliate/join' },
        { name: 'Commission', href: '/affiliate/commission' },
        { name: 'Marketing Tools', href: '/affiliate/tools' },
        { name: 'Statistics', href: '/affiliate/stats' },
      ]
    },
    {
      id: 'support',
      title: 'Support',
      icon: <HelpCircle className="h-4 w-4" />,
      items: [
        { name: 'Help Center', href: '/support' },
        { name: 'Contact Us', href: '/support/contact' },
        { name: 'FAQ', href: '/support/faq' },
        { name: 'Live Chat', href: '/support/chat' },
      ]
    },
    {
      id: 'about',
      title: 'About',
      icon: <Globe className="h-4 w-4" />,
      items: [
        { name: 'About Us', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
      ]
    },
    {
      id: 'legal',
      title: 'Legal',
      icon: <FileText className="h-4 w-4" />,
      items: [
        { name: 'Terms & Conditions', href: '/legal/terms' },
        { name: 'Privacy Policy', href: '/legal/privacy' },
        { name: 'Responsible Gaming', href: '/legal/responsible-gaming' },
      ]
    }
  ]

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-[#1a1a1a] border-r border-white/10 z-[60] transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:w-64
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-emerald-400 to-sky-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-white font-semibold">Stake</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100vh-8rem)] p-4 overflow-hidden">
          <div className="space-y-2 h-[calc(100vh-12rem)] overflow-y-auto">
            {/* Navigation Items */}
            {menuSections.map((section) => (
              <div key={section.id} className="space-y-1">
                <Button
                  variant="ghost"
                  onClick={() => toggleSection(section.id)}
                  className="w-full justify-between text-white hover:bg-white/10 p-3 h-auto"
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <span className="text-sm font-medium">{section.title}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    expandedSections.includes(section.id) ? 'rotate-180' : ''
                  }`} />
                </Button>

                {expandedSections.includes(section.id) && (
                  <div className="ml-7 space-y-1">
                    {section.items.map((item) => (
                      <Link key={item.name} href={item.href} onClick={onClose}>
                        <div className="flex items-center p-2 rounded text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                          {item.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>© 2024 Gaming Platform</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Play responsibly. 18+ only.</span>
          </div>
        </div>
      </div>
    </>
  )
}
