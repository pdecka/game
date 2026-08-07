export type TileType = 'egg' | 'monster'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface DifficultyConfig {
  name: string
  columns: number
  eggs: number
  monsters: number
  maxSteps: number
  maxMultiplier: number
  baseMultiplier: number
  multiplierGrowth: number
}

export interface Tile {
  id: string
  type: TileType
  row: number
  column: number
  isRevealed: boolean
  isSelected: boolean
}

export interface TowerRow {
  id: string
  rowNumber: number
  tiles: Tile[]
  isCompleted: boolean
}

export interface TowerBoard {
  id: string
  rows: TowerRow[]
  difficulty: Difficulty
  currentStep: number
  selectedPath: number[]
}

export interface TowerRound {
  id: string
  timestamp: number
  betAmount: number
  difficulty: Difficulty
  board: TowerBoard
  stepsCompleted: number
  finalMultiplier: number
  payout: number
  outcome: 'lost' | 'cashed_out' | 'completed'
  path: number[]
}

// Difficulty configurations
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: 'Easy',
    columns: 4,
    eggs: 3,
    monsters: 1,
    maxSteps: 11,
    maxMultiplier: 12.5,
    baseMultiplier: 1.2,
    multiplierGrowth: 0.15
  },
  medium: {
    name: 'Medium',
    columns: 3,
    eggs: 2,
    monsters: 1,
    maxSteps: 11,
    maxMultiplier: 24.0,
    baseMultiplier: 1.5,
    multiplierGrowth: 0.25
  },
  hard: {
    name: 'Hard',
    columns: 2,
    eggs: 1,
    monsters: 1,
    maxSteps: 11,
    maxMultiplier: 40.0,
    baseMultiplier: 1.8,
    multiplierGrowth: 0.35
  },
  expert: {
    name: 'Expert',
    columns: 4,
    eggs: 1,
    monsters: 3,
    maxSteps: 11,
    maxMultiplier: 90.0,
    baseMultiplier: 2.0,
    multiplierGrowth: 0.45
  }
}

export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
  return DIFFICULTY_CONFIGS[difficulty]
}

export function generateTileId(row: number, column: number): string {
  return `tile-${row}-${column}`
}

export function generateRowId(rowNumber: number): string {
  return `row-${rowNumber}`
}

export function generateBoardId(): string {
  return `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateRoundId(): string {
  return `tower-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function createTile(row: number, column: number, type: TileType): Tile {
  return {
    id: generateTileId(row, column),
    type,
    row,
    column,
    isRevealed: false,
    isSelected: false
  }
}

export function createRow(rowNumber: number, config: DifficultyConfig): TowerRow {
  const tiles: Tile[] = []
  const positions = Array.from({ length: config.columns }, (_, i) => i)
  
  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]]
  }
  
  // Place eggs
  for (let i = 0; i < config.eggs && i < positions.length; i++) {
    const column = positions[i]
    tiles.push(createTile(rowNumber, column, 'egg'))
  }
  
  // Place monsters
  for (let i = config.eggs; i < config.eggs + config.monsters && i < positions.length; i++) {
    const column = positions[i]
    tiles.push(createTile(rowNumber, column, 'monster'))
  }
  
  // Sort by column
  tiles.sort((a, b) => a.column - b.column)
  
  return {
    id: generateRowId(rowNumber),
    rowNumber,
    tiles,
    isCompleted: false
  }
}

export function generateBoard(difficulty: Difficulty): TowerBoard {
  const config = getDifficultyConfig(difficulty)
  const rows: TowerRow[] = []
  
  for (let row = 0; row < config.maxSteps; row++) {
    rows.push(createRow(row, config))
  }
  
  return {
    id: generateBoardId(),
    rows,
    difficulty,
    currentStep: 0,
    selectedPath: []
  }
}

export function getMultiplierForStep(step: number, config: DifficultyConfig): number {
  if (step === 0) return 1
  const multiplier = config.baseMultiplier + (step * config.multiplierGrowth)
  return Math.round(multiplier * 100) / 100
}

export function getMaxMultiplier(config: DifficultyConfig): number {
  return getMultiplierForStep(config.maxSteps - 1, config)
}

export function calculatePayout(betAmount: number, multiplier: number): number {
  return Math.round((betAmount * multiplier) * 100) / 100
}

export function getTileEmoji(type: TileType): string {
  return type === 'egg' ? 'ð¥' : 'ð¹'
}

export function getTileColor(type: TileType): string {
  switch (type) {
    case 'egg':
      return 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600'
    case 'monster':
      return 'bg-red-500 hover:bg-red-600 text-white border-red-600'
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white border-gray-600'
  }
}

export function getRevealedTileColor(type: TileType): string {
  switch (type) {
    case 'egg':
      return 'bg-emerald-600 text-white border-emerald-700'
    case 'monster':
      return 'bg-red-600 text-white border-red-700'
    default:
      return 'bg-gray-600 text-white border-gray-700'
  }
}

export function generateMockHistory(count: number = 20): TowerRound[] {
  const history: TowerRound[] = []
  const now = Date.now()
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
    const config = getDifficultyConfig(difficulty)
    const betAmount = Math.floor(Math.random() * 500) + 10
    const stepsCompleted = Math.floor(Math.random() * config.maxSteps)
    const multiplier = getMultiplierForStep(stepsCompleted, config)
    const payout = calculatePayout(betAmount, multiplier)
    
    const outcomes: ('lost' | 'cashed_out' | 'completed')[] = ['lost', 'cashed_out', 'completed']
    const outcome = stepsCompleted === 0 ? 'lost' : 
                   stepsCompleted >= config.maxSteps - 1 ? 'completed' :
                   outcomes[Math.floor(Math.random() * outcomes.length)]
    
    history.push({
      id: generateRoundId(),
      timestamp: now - (i * 90000), // 1.5 minutes apart
      betAmount,
      difficulty,
      board: generateBoard(difficulty),
      stepsCompleted,
      finalMultiplier: outcome === 'lost' ? 0 : multiplier,
      payout: outcome === 'lost' ? 0 : payout,
      outcome,
      path: Array.from({ length: stepsCompleted }, () => Math.floor(Math.random() * config.columns))
    })
  }
  
  return history.sort((a, b) => b.timestamp - a.timestamp)
}

export function formatMultiplier(multiplier: number): string {
  return multiplier.toFixed(2)
}

export function formatPayout(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  }
  return amount.toFixed(2)
}

export function getDifficultyDisplayName(difficulty: Difficulty): string {
  return DIFFICULTY_CONFIGS[difficulty].name
}

export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-emerald-500 text-white'
    case 'medium':
      return 'bg-yellow-500 text-white'
    case 'hard':
      return 'bg-orange-500 text-white'
    case 'expert':
      return 'bg-red-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}
