export enum GameType {
  DICE = 'dice',
  CRASH = 'crash',
  MINES = 'mines',
  PLINKO = 'plinko',
  ROULETTE = 'roulette',
  BLACKJACK = 'blackjack',
  BACCARAT = 'baccarat',
  SLOTS = 'slots',
  WHEEL = 'wheel',
  TOWER = 'tower',
  LIMBO = 'limbo',
  COINFLIP = 'coinflip',
  KENO = 'keno',
  SCRATCH = 'scratch',
  DRAGON_TIGER = 'dragon_tiger',
  ANDAR_BAHAR = 'andar_bahar',
  VIDEO_POKER = 'video_poker',
  COLOR_PREDICTION = 'color_prediction',
  HILO = 'hilo',
  NUMBER_HILO = 'number_hilo',
  POKER = 'poker',
  TIC_TAC_TOE = 'tic_tac_toe',
  SPORTS = 'sports',
}

export enum GameStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface GameSession {
  id: string;
  userId: string;
  gameType: GameType;
  status: GameStatus;
  betAmount: number;
  currency: string;
  winAmount?: number;
  result?: any;
  seed?: string;
  hash?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ProvablyFair {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  hash: string;
}

export interface DiceGame {
  multiplier: number;
  target: 'high' | 'low';
  rollValue: number;
}

export interface CrashGame {
  multiplier: number;
  crashedAt: number;
}

export interface MinesGame {
  gridSize: number;
  mines: number;
  revealed: number[];
  result: 'win' | 'loss';
}

export interface PlinkoGame {
  rows: number;
  risk: 'low' | 'medium' | 'high';
  path: number[];
  multiplier: number;
}
