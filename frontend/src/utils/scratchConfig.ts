/**
 * Scratch Card Game Configuration
 * Centralized configuration for all scratch card settings
 */

import type { ScratchConfig, Volatility, CardType, SymbolConfig } from './scratchEngine'

// Backend-configurable settings (would come from API in production)
export interface BackendConfig {
  rtp: number
  minBet: number
  maxBet: number
  volatilitySettings: {
    low: { winRate: number; minMultiplier: number; maxMultiplier: number }
    medium: { winRate: number; minMultiplier: number; maxMultiplier: number }
    high: { winRate: number; minMultiplier: number; maxMultiplier: number }
  }
  symbolWeights: Record<string, number>
  jackpotOdds: number
  autoRevealThreshold: number
}

// Default backend configuration
export const DEFAULT_BACKEND_CONFIG: BackendConfig = {
  rtp: 95,
  minBet: 1,
  maxBet: 10000,
  volatilitySettings: {
    low: { winRate: 0.45, minMultiplier: 1.2, maxMultiplier: 3 },
    medium: { winRate: 0.35, minMultiplier: 1.5, maxMultiplier: 10 },
    high: { winRate: 0.20, minMultiplier: 2, maxMultiplier: 100 }
  },
  symbolWeights: {
    cherry: 30,
    lemon: 25,
    orange: 20,
    plum: 15,
    bell: 8,
    star: 5,
    seven: 1
  },
  jackpotOdds: 1000,
  autoRevealThreshold: 0.6
}

// Card themes
export interface CardTheme {
  id: string
  name: string
  bgColor: string
  borderColor: string
  scratchColor: string
  scratchPattern: string
  backgroundPattern: string
  glowColor: string
}

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'gold',
    name: 'Gold Premium',
    bgColor: 'bg-gradient-to-br from-yellow-600 to-yellow-800',
    borderColor: 'border-yellow-400',
    scratchColor: '#8B7355',
    scratchPattern: 'linear-gradient(45deg, #8B7355 25%, #A0826D 25%, #A0826D 50%, #8B7355 50%, #8B7355 75%, #A0826D 75%, #A0826D)',
    backgroundPattern: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
    glowColor: 'shadow-yellow-500/50'
  },
  {
    id: 'purple',
    name: 'Purple Royale',
    bgColor: 'bg-gradient-to-br from-purple-600 to-purple-800',
    borderColor: 'border-purple-400',
    scratchColor: '#4B0082',
    scratchPattern: 'linear-gradient(45deg, #4B0082 25%, #6A0DAD 25%, #6A0DAD 50%, #4B0082 50%, #4B0082 75%, #6A0DAD 75%, #6A0DAD)',
    backgroundPattern: 'radial-gradient(circle, rgba(147,51,234,0.1) 0%, transparent 70%)',
    glowColor: 'shadow-purple-500/50'
  },
  {
    id: 'blue',
    name: 'Blue Classic',
    bgColor: 'bg-gradient-to-br from-blue-600 to-blue-800',
    borderColor: 'border-blue-400',
    scratchColor: '#1E3A8A',
    scratchPattern: 'linear-gradient(45deg, #1E3A8A 25%, #3B82F6 25%, #3B82F6 50%, #1E3A8A 50%, #1E3A8A 75%, #3B82F6 75%, #3B82F6)',
    backgroundPattern: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
    glowColor: 'shadow-blue-500/50'
  }
]

// Scratch brush settings
export interface ScratchBrush {
  size: number
  hardness: number
  opacity: number
  shape: 'circle' | 'square'
  smoothing: boolean
}

export const SCRATCH_BRUSHES: Record<string, ScratchBrush> = {
  small: {
    size: 20,
    hardness: 0.5,
    opacity: 0.8,
    shape: 'circle',
    smoothing: true
  },
  medium: {
    size: 30,
    hardness: 0.6,
    opacity: 0.9,
    shape: 'circle',
    smoothing: true
  },
  large: {
    size: 40,
    hardness: 0.7,
    opacity: 1,
    shape: 'circle',
    smoothing: true
  }
}

// Animation settings
export interface AnimationConfig {
  scratchDuration: number
  revealDuration: number
  winDuration: number
  particleCount: number
  particleLifetime: number
  coinAnimationDuration: number
}

export const ANIMATION_CONFIG: AnimationConfig = {
  scratchDuration: 300,
  revealDuration: 600,
  winDuration: 2000,
  particleCount: 20,
  particleLifetime: 1000,
  coinAnimationDuration: 1500
}

// Sound effects configuration
export interface SoundConfig {
  enabled: boolean
  volume: number
  scratchSound: string
  revealSound: string
  winSound: string
  loseSound: string
  coinSound: string
}

export const SOUND_CONFIG: SoundConfig = {
  enabled: true,
  volume: 0.5,
  scratchSound: '/sounds/scratch.mp3',
  revealSound: '/sounds/reveal.mp3',
  winSound: '/sounds/win.mp3',
  loseSound: '/sounds/lose.mp3',
  coinSound: '/sounds/coin.mp3'
}

// Mobile settings
export interface MobileConfig {
  touchSensitivity: number
  autoRevealDelay: number
  hapticFeedback: boolean
  zoomEnabled: boolean
}

export const MOBILE_CONFIG: MobileConfig = {
  touchSensitivity: 1.2,
  autoRevealDelay: 3000,
  hapticFeedback: true,
  zoomEnabled: false
}

// Accessibility settings
export interface AccessibilityConfig {
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

export const ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true
}

// Game presets
export interface GamePreset {
  id: string
  name: string
  description: string
  volatility: Volatility
  cardTheme: CardTheme
  brush: ScratchBrush
  rtp: number
  recommendedBetRange: { min: number; max: number }
}

export const GAME_PRESETS: GamePreset[] = [
  {
    id: 'beginner',
    name: 'Beginner Friendly',
    description: 'High win rate, small rewards',
    volatility: 'low',
    cardTheme: CARD_THEMES[2], // Blue
    brush: SCRATCH_BRUSHES.medium,
    rtp: 96,
    recommendedBetRange: { min: 1, max: 100 }
  },
  {
    id: 'balanced',
    name: 'Balanced Play',
    description: 'Moderate risk and reward',
    volatility: 'medium',
    cardTheme: CARD_THEMES[1], // Purple
    brush: SCRATCH_BRUSHES.medium,
    rtp: 95,
    recommendedBetRange: { min: 10, max: 500 }
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Low win rate, massive rewards',
    volatility: 'high',
    cardTheme: CARD_THEMES[0], // Gold
    brush: SCRATCH_BRUSHES.large,
    rtp: 94,
    recommendedBetRange: { min: 100, max: 10000 }
  }
]

// Create scratch config from backend settings
export function createScratchConfigFromBackend(
  backendConfig: BackendConfig,
  overrides: Partial<ScratchConfig> = {}
): ScratchConfig {
  const symbols: SymbolConfig[] = [
    { id: 'cherry', emoji: 'ð', value: 1, type: 'normal', weight: backendConfig.symbolWeights.cherry },
    { id: 'lemon', emoji: 'ð', value: 1, type: 'normal', weight: backendConfig.symbolWeights.lemon },
    { id: 'orange', emoji: 'ð', value: 1, type: 'normal', weight: backendConfig.symbolWeights.orange },
    { id: 'plum', emoji: 'ð', value: 1, type: 'normal', weight: backendConfig.symbolWeights.plum },
    { id: 'bell', emoji: 'ð', value: 2, type: 'bonus', weight: backendConfig.symbolWeights.bell },
    { id: 'star', emoji: 'â', value: 3, type: 'multiplier', weight: backendConfig.symbolWeights.star },
    { id: 'seven', emoji: '7ï¸', value: 10, type: 'jackpot', weight: backendConfig.symbolWeights.seven },
  ]

  // Generate multipliers based on volatility settings
  const generateMultipliers = (volatility: Volatility): number[] => {
    const settings = backendConfig.volatilitySettings[volatility]
    const multipliers: number[] = []
    
    // Generate a range of multipliers
    const step = (settings.maxMultiplier - settings.minMultiplier) / 8
    for (let i = 0; i < 9; i++) {
      multipliers.push(settings.minMultiplier + (i * step))
    }
    
    return multipliers
  }

  return {
    rtp: backendConfig.rtp,
    volatility: 'medium', // Default, will be overridden per game
    minBet: backendConfig.minBet,
    maxBet: backendConfig.maxBet,
    gridSize: 9, // 3x3 grid
    symbols,
    multipliers: generateMultipliers('medium'),
    jackpotOdds: backendConfig.jackpotOdds,
    autoRevealThreshold: backendConfig.autoRevealThreshold,
    ...overrides
  }
}

// Get configuration for specific volatility
export function getVolatilityConfig(
  volatility: Volatility,
  backendConfig: BackendConfig
): ScratchConfig {
  const baseConfig = createScratchConfigFromBackend(backendConfig)
  const settings = backendConfig.volatilitySettings[volatility]
  
  // Generate multipliers for this volatility
  const multipliers: number[] = []
  const step = (settings.maxMultiplier - settings.minMultiplier) / 8
  for (let i = 0; i < 9; i++) {
    multipliers.push(settings.minMultiplier + (i * step))
  }
  
  return {
    ...baseConfig,
    volatility,
    multipliers
  }
}

// Validate configuration
export function validateConfig(config: ScratchConfig): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validate RTP
  if (config.rtp < 85 || config.rtp > 99) {
    errors.push('RTP must be between 85% and 99%')
  }
  
  // Validate bet limits
  if (config.minBet >= config.maxBet) {
    errors.push('Min bet must be less than max bet')
  }
  
  if (config.minBet < 1) {
    errors.push('Min bet must be at least 1')
  }
  
  if (config.maxBet > 100000) {
    warnings.push('Max bet is very high')
  }
  
  // Validate symbols
  if (config.symbols.length < 3) {
    errors.push('Must have at least 3 symbols')
  }
  
  const totalWeight = config.symbols.reduce((sum, symbol) => sum + symbol.weight, 0)
  if (totalWeight === 0) {
    errors.push('Symbol weights must sum to greater than 0')
  }
  
  // Validate multipliers
  if (config.multipliers.length < 3) {
    errors.push('Must have at least 3 multipliers')
  }
  
  if (config.multipliers.some(m => m < 1)) {
    errors.push('All multipliers must be at least 1')
  }
  
  // Validate grid size
  if (config.gridSize !== 9 && config.gridSize !== 16) {
    warnings.push('Grid size should be 9 (3x3) or 16 (4x4)')
  }
  
  // Validate auto reveal threshold
  if (config.autoRevealThreshold < 0.3 || config.autoRevealThreshold > 0.9) {
    warnings.push('Auto reveal threshold should be between 30% and 90%')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Get default configuration for development
export function getDevelopmentConfig(): ScratchConfig {
  return createScratchConfigFromBackend(DEFAULT_BACKEND_CONFIG, {
    rtp: 98, // Higher RTP for development
    minBet: 1,
    maxBet: 1000
  })
}

// Get production configuration
export function getProductionConfig(): ScratchConfig {
  return createScratchConfigFromBackend(DEFAULT_BACKEND_CONFIG)
}

// Configuration management utilities
export class ConfigManager {
  private static instance: ConfigManager
  private config: ScratchConfig
  private backendConfig: BackendConfig
  
  private constructor() {
    this.backendConfig = DEFAULT_BACKEND_CONFIG
    this.config = getProductionConfig()
  }
  
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }
  
  updateBackendConfig(newConfig: Partial<BackendConfig>): void {
    this.backendConfig = { ...this.backendConfig, ...newConfig }
    this.config = createScratchConfigFromBackend(this.backendConfig)
  }
  
  getConfig(): ScratchConfig {
    return this.config
  }
  
  getBackendConfig(): BackendConfig {
    return this.backendConfig
  }
  
  getVolatilityConfig(volatility: Volatility): ScratchConfig {
    return getVolatilityConfig(volatility, this.backendConfig)
  }
  
  validateCurrentConfig(): ReturnType<typeof validateConfig> {
    return validateConfig(this.config)
  }
  
  resetToDefaults(): void {
    this.backendConfig = DEFAULT_BACKEND_CONFIG
    this.config = getProductionConfig()
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance()

// Configuration hooks for React components
export function useScratchConfig(volatility?: Volatility): ScratchConfig {
  if (volatility) {
    return configManager.getVolatilityConfig(volatility)
  }
  return configManager.getConfig()
}

export function useBackendConfig(): BackendConfig {
  return configManager.getBackendConfig()
}

// Configuration presets for different environments
export const ENVIRONMENT_PRESETS: Record<string, BackendConfig> = {
  development: {
    rtp: 98,
    minBet: 1,
    maxBet: 1000,
    volatilitySettings: {
      low: { winRate: 0.5, minMultiplier: 1.2, maxMultiplier: 3 },
      medium: { winRate: 0.4, minMultiplier: 1.5, maxMultiplier: 10 },
      high: { winRate: 0.25, minMultiplier: 2, maxMultiplier: 50 }
    },
    symbolWeights: {
      cherry: 30,
      lemon: 25,
      orange: 20,
      plum: 15,
      bell: 8,
      star: 5,
      seven: 1
    },
    jackpotOdds: 500,
    autoRevealThreshold: 0.7
  },
  staging: {
    rtp: 96,
    minBet: 1,
    maxBet: 5000,
    volatilitySettings: {
      low: { winRate: 0.45, minMultiplier: 1.2, maxMultiplier: 3 },
      medium: { winRate: 0.35, minMultiplier: 1.5, maxMultiplier: 10 },
      high: { winRate: 0.20, minMultiplier: 2, maxMultiplier: 100 }
    },
    symbolWeights: {
      cherry: 30,
      lemon: 25,
      orange: 20,
      plum: 15,
      bell: 8,
      star: 5,
      seven: 1
    },
    jackpotOdds: 800,
    autoRevealThreshold: 0.65
  },
  production: DEFAULT_BACKEND_CONFIG
}

// Get configuration for current environment
export function getEnvironmentConfig(): BackendConfig {
  const env = process.env.NODE_ENV || 'development'
  return ENVIRONMENT_PRESETS[env as keyof typeof ENVIRONMENT_PRESETS] || DEFAULT_BACKEND_CONFIG
}
