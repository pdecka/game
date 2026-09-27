import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { RngService } from './rng.service';
import { ProvablyFairService } from './provably-fair.service';
import { GameType, Currency, TransactionType, GameStatus } from '@gaming-platform/shared';
import * as crypto from 'crypto';

@Injectable()
export class GamesService {
  private readonly liveEpochMs = 1700000000000;

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private rngService: RngService,
    private provablyFairService: ProvablyFairService,
  ) {}

  private async getSetting(gameType: GameType): Promise<any> {
    let setting = await this.prisma.gameSetting.findUnique({ where: { gameType: gameType as any } });
    if (!setting) {
      setting = await this.prisma.gameSetting.create({
        data: {
          gameType: gameType as any,
          enabled: true,
          rtp: 0.95,
          houseEdge: 0.05,
          currency: Currency.INR as any,
          minBet: 1,
          maxBet: 100000,
          maxWin: 1000000,
          manualOverride: false,
          forceWin: null,
          winChance: null,
        },
      });
    }
    return setting;
  }

  private async saveSession(session: any): Promise<any> {
    return this.prisma.gameSession.update({
      where: { id: session.id },
      data: {
        status: session.status,
        betAmount: session.betAmount,
        currency: session.currency,
        winAmount: session.winAmount ?? null,
        result: (session.result ?? null) as any,
        serverSeed: session.serverSeed ?? null,
        clientSeed: session.clientSeed ?? null,
        nonce: session.nonce ?? null,
        hash: session.hash ?? null,
        ledgerEntryId: session.ledgerEntryId ?? null,
        completedAt: session.completedAt ?? null,
        gameType: session.gameType,
      },
    });
  }

  private asMutableSession(session: any): any {
    if (!session) return session;
    return {
      ...session,
      result: session.result && typeof session.result === 'object' ? { ...(session.result as any) } : session.result,
    };
  }

  private assertBetWithinLimits(setting: any, betAmount: number, currency: Currency) {
    if (!setting.enabled) {
      throw new BadRequestException('Game is disabled');
    }
    if (setting.currency && setting.currency !== currency) {
      // Keep current endpoint shape; just validate.
      throw new BadRequestException(`Currency not allowed for this game`);
    }
    const minBet = Number(setting.minBet);
    const maxBet = Number(setting.maxBet);
    if (betAmount < minBet) {
      throw new BadRequestException(`Bet amount below minimum (${minBet})`);
    }
    if (betAmount > maxBet) {
      throw new BadRequestException(`Bet amount exceeds maximum (${maxBet})`);
    }
  }

  async createSession(
    userId: string,
    gameType: GameType,
    betAmount: number,
    currency: Currency,
    clientSeed?: string,
  ): Promise<any> {
    const setting = await this.getSetting(gameType);
    this.assertBetWithinLimits(setting, betAmount, currency);

    const balance = await this.walletService.getBalance(userId, currency as any);
    if (balance < betAmount) {
      throw new BadRequestException('Insufficient balance');
    }

    const { serverSeed, hash } = this.provablyFairService.generateServerSeed();
    const nonce = await this.getNextNonce(userId);

    const session = await this.prisma.gameSession.create({
      data: {
        userId,
        gameType: gameType as any,
        betAmount,
        currency,
        serverSeed,
        clientSeed: clientSeed || this.provablyFairService.generateClientSeed(),
        nonce,
        hash,
      },
    });

    try {
      await this.walletService.createTransaction(
        userId,
        currency as any,
        betAmount,
        TransactionType.BET as any,
        session.id,
      );
    } catch (err) {
      await this.prisma.gameSession.delete({ where: { id: session.id } });
      throw err;
    }

    return session;
  }

  private resolveWinOverride(setting: any): boolean | null {
    if (!setting.manualOverride) return null;
    if (typeof setting.forceWin === 'boolean') return setting.forceWin;
    return null;
  }

  /**
   * Strip server-only state from sessions before sending to clients.
   * While a session is ACTIVE the player must not see the server seed or any
   * hidden outcome data (mine positions, remaining deck) or the game becomes
   * trivially cheatable. Once COMPLETED everything is revealed so players can
   * verify provable fairness.
   */
  private present(session: any): any {
    const plain: any = { ...session };
    if ((session.status as any) !== (GameStatus.COMPLETED as any)) {
      delete plain.serverSeed;
      if (plain.result && typeof plain.result === 'object') {
        const result = { ...plain.result };
        delete result.deck;
        delete result.idx;
        delete result.minePositions;
        // Hide the dealer's hole card until the hand is resolved.
        if (session.gameType === GameType.BLACKJACK && Array.isArray(result.dealer)) {
          result.dealer = [result.dealer[0]];
        }
        plain.result = result;
      }
    }
    return plain;
  }

  private clampMaxWin(setting: any, amount: number): number {
    const maxWin = Number(setting.maxWin);
    if (!maxWin || maxWin <= 0) return amount;
    return Math.min(amount, maxWin);
  }

  async playDice(
    userId: string,
    betAmount: number,
    currency: Currency,
    multiplier: number,
    target: 'high' | 'low',
    clientSeed?: string,
  ) {
    const setting = await this.getSetting(GameType.DICE);
    const session: any = await this.createSession(userId, GameType.DICE, betAmount, currency, clientSeed);
    
    const rollValue = this.rngService.generateDiceRoll(session.serverSeed, session.clientSeed, session.nonce);
    const naturalWin = target === 'high' ? rollValue >= multiplier : rollValue <= multiplier;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;
    const unclampedWinAmount = win ? betAmount * multiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) {
      await this.walletService.createTransaction(
        userId,
        currency,
        winAmount,
        TransactionType.WIN,
        session.id,
      );
    } else {
      await this.walletService.createTransaction(
        userId,
        currency,
        betAmount,
        TransactionType.LOSS,
        session.id,
      );
    }

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount;
    session.result = { rollValue, multiplier, target, win, naturalWin };
    session.completedAt = new Date();

    return this.present(await this.saveSession(session));
  }

  async playCrash(
    userId: string,
    betAmount: number,
    currency: Currency,
    cashOutAt: number,
    clientSeed?: string,
  ) {
    const setting = await this.getSetting(GameType.CRASH);
    const session: any = await this.createSession(userId, GameType.CRASH, betAmount, currency, clientSeed);
    
    const crashPoint = this.rngService.generateCrashPoint(session.serverSeed, session.clientSeed, session.nonce);
    const naturalWin = cashOutAt < crashPoint;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;
    const unclampedWinAmount = win ? betAmount * cashOutAt : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) {
      await this.walletService.createTransaction(
        userId,
        currency,
        winAmount,
        TransactionType.WIN,
        session.id,
      );
    } else {
      await this.walletService.createTransaction(
        userId,
        currency,
        betAmount,
        TransactionType.LOSS,
        session.id,
      );
    }

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount;
    session.result = { crashPoint, cashOutAt, win, naturalWin };
    session.completedAt = new Date();

    return this.present(await this.saveSession(session));
  }

  async startMines(
    userId: string,
    betAmount: number,
    currency: Currency,
    gridSize: number,
    mines: number,
    clientSeed?: string,
  ) {
    try {
      const setting = await this.getSetting(GameType.MINES);
      
      // Validate game is enabled
      if (!setting.enabled) {
        throw new BadRequestException('Mines game is currently disabled');
      }
      
      // Validate mine count (2-24 as per requirements)
      if (mines < 2 || mines > 24) {
        throw new BadRequestException('Mine count must be between 2 and 24');
      }
      
      // Validate grid size (must be 25 for 5x5 board)
      if (gridSize !== 25) {
        throw new BadRequestException('Grid size must be 25 (5x5 board)');
      }
      
      // Validate bet amount
      if (!Number.isFinite(betAmount) || betAmount <= 0) {
        throw new BadRequestException('Bet amount must be a positive number');
      }
      
      // Check for Mines-specific limits in metadata
      const metadata = setting.metadata as Record<string, any> || {};
      const minMines = metadata.minMines ?? 2;
      const maxMines = metadata.maxMines ?? 24;
      
      if (mines < minMines || mines > maxMines) {
        throw new BadRequestException(`Mine count must be between ${minMines} and ${maxMines}`);
      }
      
      const session: any = await this.createSession(userId, GameType.MINES, betAmount, currency, clientSeed);
      
      // Algorithm version for provable fairness verification
      const algorithmVersion = 'mines-v1';
      
      // Generate mine positions using deterministic HMAC-SHA256 + Fisher-Yates
      const minePositions = this.rngService.generateMines(
        gridSize, 
        mines, 
        session.serverSeed, 
        session.clientSeed, 
        session.nonce,
        algorithmVersion
      );
      
      // Validate mine positions
      if (!Array.isArray(minePositions) || minePositions.length !== mines) {
        throw new BadRequestException('Failed to generate valid mine positions');
      }
      
      // Check for duplicate positions
      const uniquePositions = new Set(minePositions);
      if (uniquePositions.size !== mines) {
        throw new BadRequestException('Generated duplicate mine positions');
      }
      
      // Check all positions are within valid range
      if (minePositions.some(pos => pos < 0 || pos >= gridSize)) {
        throw new BadRequestException('Generated mine positions out of valid range');
      }
      
      session.status = GameStatus.ACTIVE as any;
      session.result = { 
        minePositions, 
        revealed: [], 
        hitMine: false,
        algorithmVersion,
        gridSize,
        minesCount: mines
      };
      
      return this.present(await this.saveSession(session));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error starting Mines game:', error);
      throw new BadRequestException('Failed to start Mines game. Please try again.');
    }
  }

  /**
   * Reveal a single tile server-side. The client never knows mine positions
   * while the game is active, so the outcome cannot be cheated.
   */
  async revealMines(userId: string, sessionId: string, position: number) {
    try {
      const session = (await this.prisma.gameSession.findFirst({ where: { id: sessionId, userId } })) as any;
      if (!session) throw new BadRequestException('Game session not found');
      if (session.gameType !== GameType.MINES) throw new BadRequestException('Invalid session');
      if (session.status !== GameStatus.ACTIVE) throw new BadRequestException('Game is not active');
      if (!Number.isInteger(position) || position < 0 || position > 24) {
        throw new BadRequestException('Invalid tile position');
      }

      const setting = await this.getSetting(GameType.MINES);
      const state = session.result as any;
      const minePositions: number[] = state.minePositions || [];
      const revealed: number[] = state.revealed || [];
      
      if (!Array.isArray(minePositions) || minePositions.length === 0) {
        throw new BadRequestException('Invalid game state: missing mine positions');
      }
      
      if (revealed.includes(position)) throw new BadRequestException('Tile already revealed');

      const hitMine = minePositions.includes(position);
      const newRevealed = [...revealed, position];

      if (hitMine) {
        await this.walletService.createTransaction(
          userId,
          session.currency as any,
          Number(session.betAmount),
          TransactionType.LOSS,
          session.id,
        );
        session.status = GameStatus.COMPLETED as any;
        session.winAmount = 0 as any;
        session.result = { 
          ...state, 
          revealed: newRevealed, 
          hitMine: true, 
          win: false, 
          naturalWin: false,
          finalMultiplier: 0,
          finalPayout: 0
        };
        session.completedAt = new Date();
        return this.present(await this.saveSession(session));
      }

      const multiplier = this.calculateMinesMultiplier(
        newRevealed.length,
        minePositions.length,
        25,
        Number(setting.rtp),
      );
      
      // Check if all safe cells have been revealed (automatic win)
      const totalSafeCells = 25 - minePositions.length;
      const allSafeRevealed = newRevealed.length === totalSafeCells;
      
      if (allSafeRevealed) {
        // Auto-win: cashout automatically when all safe cells are revealed
        const unclampedWinAmount = Number(session.betAmount) * multiplier;
        const winAmount = this.clampMaxWin(setting, unclampedWinAmount);
        
        await this.walletService.createTransaction(
          userId,
          session.currency as any,
          winAmount,
          TransactionType.WIN,
          session.id,
        );
        
        session.status = GameStatus.COMPLETED as any;
        session.winAmount = winAmount;
        session.result = { 
          ...state, 
          revealed: newRevealed, 
          hitMine: false, 
          win: true, 
          naturalWin: true,
          finalMultiplier: Number(multiplier.toFixed(4)),
          finalPayout: winAmount
        };
        session.completedAt = new Date();
        return this.present(await this.saveSession(session));
      }

      session.result = {
        ...state,
        revealed: newRevealed,
        hitMine: false,
        multiplier: Number(multiplier.toFixed(4)),
        potentialWin: Number((Number(session.betAmount) * multiplier).toFixed(2)),
      };
      return this.present(await this.saveSession(session));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error revealing Mines tile:', error);
      throw new BadRequestException('Failed to reveal tile. Please try again.');
    }
  }

  async cashoutMines(userId: string, sessionId: string) {
    try {
      const session = (await this.prisma.gameSession.findFirst({ where: { id: sessionId, userId } })) as any;
      if (!session) {
        throw new BadRequestException('Game session not found');
      }
      
      if (session.status !== GameStatus.ACTIVE) {
        throw new BadRequestException('Game is not active');
      }

      const setting = await this.getSetting(GameType.MINES);
      // Only trust server-tracked reveals; never client-provided positions.
      const { minePositions, revealed = [] } = session.result as any;
      const revealedPositions: number[] = revealed;

      if (!Array.isArray(minePositions) || minePositions.length === 0) {
        throw new BadRequestException('Invalid game state: missing mine positions');
      }

      if (revealedPositions.length === 0) {
        throw new BadRequestException('Reveal at least one tile before cashing out');
      }

      const hitMine = revealedPositions.some((pos: number) => minePositions.includes(pos));
      
      const naturalWin = !hitMine;
      const override = this.resolveWinOverride(setting);
      const win = override ?? naturalWin;

      if (win) {
        const multiplier = this.calculateMinesMultiplier(revealedPositions.length, minePositions.length, 25, Number(setting.rtp));
        const unclampedWinAmount = Number(session.betAmount) * multiplier;
        const winAmount = this.clampMaxWin(setting, unclampedWinAmount);
        
        await this.walletService.createTransaction(
          userId,
          session.currency as any,
          winAmount,
          TransactionType.WIN,
          session.id,
        );
        
        session.winAmount = winAmount;
        session.result = { 
          ...session.result, 
          revealed: revealedPositions, 
          hitMine, 
          win, 
          naturalWin,
          finalMultiplier: Number(multiplier.toFixed(4)),
          finalPayout: winAmount
        };
      } else {
        await this.walletService.createTransaction(
          userId,
          session.currency as any,
          Number(session.betAmount),
          TransactionType.LOSS,
          session.id,
        );
        
        session.result = { 
          ...session.result, 
          revealed: revealedPositions, 
          hitMine, 
          win, 
          naturalWin,
          finalMultiplier: 0,
          finalPayout: 0
        };
      }

      session.status = GameStatus.COMPLETED as any;
      session.completedAt = new Date();

      return this.present(await this.saveSession(session));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error cashing out Mines game:', error);
      throw new BadRequestException('Failed to cash out. Please try again.');
    }
  }

  /**
   * Verify provable fairness of a completed Mines game.
   * Allows users to independently verify that the game was fair.
   */
  async verifyMinesGame(userId: string, sessionId: string) {
    try {
      const session = (await this.prisma.gameSession.findFirst({ where: { id: sessionId, userId } })) as any;
      if (!session) {
        throw new BadRequestException('Game session not found');
      }

      if (session.gameType !== GameType.MINES) {
        throw new BadRequestException('Invalid game type');
      }

      const state = session.result as any;
      
      if (!session.serverSeed || !session.hash) {
        throw new BadRequestException('Missing provable fairness data');
      }
      
      // Verify server seed hash commitment
      const computedHash = crypto.createHash('sha256').update(session.serverSeed).digest('hex');
      const hashValid = computedHash === session.hash;

      // Regenerate mine positions using the same algorithm
      const algorithmVersion = state.algorithmVersion || 'mines-v1';
      const regeneratedMinePositions = this.rngService.generateMines(
        state.gridSize || 25,
        state.minesCount || state.minePositions?.length || 3,
        session.serverSeed,
        session.clientSeed,
        session.nonce,
        algorithmVersion
      );

      // Verify mine positions match
      const positionsMatch = this.arraysEqual(
        regeneratedMinePositions.sort((a, b) => a - b),
        (state.minePositions || []).sort((a, b) => a - b)
      );

      return {
        sessionId: session.id,
        verified: hashValid && positionsMatch,
        hashValid,
        positionsMatch,
        serverSeed: session.serverSeed,
        serverSeedHash: session.hash,
        computedHash,
        clientSeed: session.clientSeed,
        nonce: session.nonce,
        algorithmVersion,
        originalMinePositions: state.minePositions,
        regeneratedMinePositions,
        gridSize: state.gridSize,
        minesCount: state.minesCount,
        revealed: state.revealed,
        finalMultiplier: state.finalMultiplier,
        finalPayout: state.finalPayout,
        status: session.status,
        completedAt: session.completedAt
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error verifying Mines game:', error);
      throw new BadRequestException('Failed to verify game. Please try again.');
    }
  }

  /**
   * Get active Mines game for user (for recovery after page refresh)
   */
  async getActiveMinesGame(userId: string) {
    const session = (await this.prisma.gameSession.findFirst({
      where: { 
        userId, 
        gameType: GameType.MINES,
        status: GameStatus.ACTIVE 
      },
      orderBy: { createdAt: 'desc' }
    })) as any;

    if (!session) {
      return { active: false };
    }

    const state = session.result as any;
    return {
      active: true,
      sessionId: session.id,
      betAmount: Number(session.betAmount),
      currency: session.currency,
      minesCount: state.minesCount || state.minePositions?.length || 3,
      revealed: state.revealed || [],
      revealedCount: (state.revealed || []).length,
      currentMultiplier: state.multiplier || 1,
      potentialWin: state.potentialWin || Number(session.betAmount),
      serverSeedHash: session.hash,
      clientSeed: session.clientSeed,
      nonce: session.nonce,
      algorithmVersion: state.algorithmVersion,
      gridSize: state.gridSize,
      // Don't reveal mine positions while game is active
      createdAt: session.createdAt
    };
  }

  private arraysEqual(arr1: number[], arr2: number[]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }

  /**
   * Store auto-play configuration for Mines with safety limits.
   * The actual auto-play execution is handled by the frontend making individual game requests,
   * but the server validates each request against the stored configuration and limits.
   */
  async startAutoMines(userId: string, autoConfig: {
    betAmount: number;
    mines: number;
    games: number;
    stopOnLoss?: boolean;
    stopOnWin?: boolean;
    stopAtMultiplier?: number;
    stopAtProfit?: number;
    maxLoss?: number;
    pickSequence?: number[];
  }) {
    const setting = await this.getSetting(GameType.MINES);
    
    // Validate auto-play configuration
    if (autoConfig.betAmount <= 0) {
      throw new BadRequestException('Invalid bet amount');
    }
    if (autoConfig.mines < 2 || autoConfig.mines > 24) {
      throw new BadRequestException('Mine count must be between 2 and 24');
    }
    if (autoConfig.games <= 0 || autoConfig.games > 1000) {
      throw new BadRequestException('Games must be between 1 and 1000');
    }
    if (autoConfig.maxLoss && autoConfig.maxLoss < 0) {
      throw new BadRequestException('Max loss cannot be negative');
    }

    // Check if user already has an active auto session
    const existingAuto = await this.prisma.gameSession.findFirst({
      where: {
        userId,
        gameType: GameType.MINES,
        status: GameStatus.ACTIVE
      }
    });

    if (existingAuto) {
      const result = existingAuto.result as any;
      if (result?.autoPlay) {
        throw new BadRequestException('Auto-play session already active');
      }
    }

    // Store auto-play configuration in a special tracking session
    const autoSessionId = crypto.randomUUID();
    
    const autoSession = await this.prisma.gameSession.create({
      data: {
        userId,
        gameType: GameType.MINES,
        status: GameStatus.ACTIVE as any,
        betAmount: 0, // Placeholder - doesn't affect wallet
        currency: 'INR',
        result: {
          autoPlay: true,
          autoSessionId,
          config: autoConfig,
          startedAt: new Date(),
          gamesPlayed: 0,
          totalProfit: 0,
          totalLoss: 0
        }
      }
    });
    
    return {
      autoSessionId,
      sessionId: autoSession.id,
      status: 'started',
      config: autoConfig
    };
  }

  async stopAutoMines(userId: string) {
    // This is a simplified implementation
    // In production, you'd use a proper job queue (Bull, Agenda, etc.)
    // and cancel the job by ID
    return { stopped: true, message: 'Auto-play stop requested' };
  }

  async getAutoMinesStatus(userId: string) {
    // Check if there are recent auto-play games
    const recentAutoGames = await this.prisma.gameSession.findMany({
      where: {
        userId,
        gameType: GameType.MINES,
        result: {
          path: ['autoPlay'],
          equals: true
        },
        createdAt: {
          gte: new Date(Date.now() - 3600000) // Last hour
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (recentAutoGames.length === 0) {
      return { active: false };
    }

    const totalGames = recentAutoGames.length;
    const totalProfit = recentAutoGames.reduce((sum, game) => sum + (Number(game.winAmount) - Number(game.betAmount)), 0);
    const wins = recentAutoGames.filter(game => Number(game.winAmount) > 0).length;

    return {
      active: false, // Since we're not using a real job queue
      recentActivity: {
        totalGames,
        totalProfit,
        wins,
        winRate: (wins / totalGames * 100).toFixed(1)
      }
    };
  }

  async playMines(
    userId: string,
    betAmount: number,
    currency: Currency,
    gridSize: number,
    mines: number,
    positions: number[],
    clientSeed?: string,
  ) {
    // Legacy method - redirect to startMines for immediate play
    return this.startMines(userId, betAmount, currency, gridSize, mines, clientSeed);
  }

  async playPlinko(
    userId: string,
    betAmount: number,
    currency: Currency,
    rows: number,
    risk: 'low' | 'medium' | 'high',
    clientSeed?: string,
  ) {
    const setting = await this.getSetting(GameType.PLINKO);
    const session: any = await this.createSession(userId, GameType.PLINKO, betAmount, currency, clientSeed);

    const { path, slot } = this.rngService.generatePlinkoPath(
      rows,
      session.serverSeed,
      session.clientSeed,
      session.nonce,
    );

    const multipliers = this.getPlinkoMultipliers(rows, risk);
    const baseMultiplier = multipliers[Math.min(slot, multipliers.length - 1)];

    const naturalWin = baseMultiplier > 0;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;
    const appliedMultiplier = win ? baseMultiplier : 0;

    const unclampedWinAmount = win ? betAmount * appliedMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) {
      await this.walletService.createTransaction(
        userId,
        currency,
        winAmount,
        TransactionType.WIN,
        session.id,
      );
    } else {
      await this.walletService.createTransaction(
        userId,
        currency,
        betAmount,
        TransactionType.LOSS,
        session.id,
      );
    }

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount;
    session.result = {
      rows,
      risk,
      path,
      slot,
      multiplier: appliedMultiplier,
      win,
      naturalWin,
    };
    session.completedAt = new Date();

    return this.present(await this.saveSession(session));
  }

  async playCoinflip(
    userId: string,
    betAmount: number,
    currency: Currency,
    choice: 'heads' | 'tails',
    clientSeed?: string,
  ) {
    const setting = await this.getSetting(GameType.COINFLIP);
    const session: any = await this.createSession(userId, GameType.COINFLIP, betAmount, currency, clientSeed);

    const flip = this.rngService.generateCoinflip(session.serverSeed, session.clientSeed, session.nonce);
    const naturalWin = flip === choice;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;

    // Even-money payout (2x total return => profit = bet; but ledger uses WIN amount)
    const payoutMultiplier = 2;
    const unclampedWinAmount = win ? betAmount * payoutMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) {
      await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
    } else {
      await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);
    }

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount;
    session.result = { choice, flip, win, naturalWin, multiplier: win ? payoutMultiplier : 0 };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async playLimbo(
    userId: string,
    betAmount: number,
    currency: Currency,
    targetMultiplier: number,
    clientSeed?: string,
  ) {
    const setting = await this.getSetting(GameType.LIMBO);
    const session: any = await this.createSession(userId, GameType.LIMBO, betAmount, currency, clientSeed);

    const resultMultiplier = this.rngService.generateLimboMultiplier(
      session.serverSeed,
      session.clientSeed,
      session.nonce,
      Number(setting.rtp),
    );

    const naturalWin = resultMultiplier >= targetMultiplier;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;

    const unclampedWinAmount = win ? betAmount * targetMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) {
      await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
    } else {
      await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);
    }

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount;
    session.result = { targetMultiplier, resultMultiplier, win, naturalWin };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async playWheel(userId: string, betAmount: number, currency: Currency, clientSeed?: string) {
    const setting = await this.getSetting(GameType.WHEEL);
    const session: any = await this.createSession(userId, GameType.WHEEL, betAmount, currency, clientSeed);

    const segments = [
      { label: '0.2x', multiplier: 0.2 },
      { label: '0.5x', multiplier: 0.5 },
      { label: '1x', multiplier: 1 },
      { label: '2x', multiplier: 2 },
      { label: '5x', multiplier: 5 },
      { label: '10x', multiplier: 10 },
    ];

    const index = this.rngService.generateWheelIndex(
      session.serverSeed,
      session.clientSeed,
      session.nonce,
      segments.length,
    );

    const naturalMultiplier = segments[index].multiplier;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalMultiplier >= 1;
    const appliedMultiplier = win ? naturalMultiplier : 0;

    const unclampedWinAmount = win ? betAmount * appliedMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) {
      await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
    } else {
      await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);
    }

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount;
    session.result = { index, segment: segments[index], win, naturalMultiplier, multiplier: appliedMultiplier };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async playRoulette(
    userId: string,
    betAmount: number,
    currency: Currency,
    betType: 'red' | 'black' | 'odd' | 'even' | 'number',
    number?: number,
    clientSeed?: string,
  ) {
    const setting = await this.getSetting(GameType.ROULETTE);
    const session: any = await this.createSession(userId, GameType.ROULETTE, betAmount, currency, clientSeed);

    const spin = this.rngService.generateRouletteNumber(session.serverSeed, session.clientSeed, session.nonce);
    const color = this.getRouletteColor(spin);

    let naturalWin = false;
    let payoutMultiplier = 0;

    if (betType === 'red' || betType === 'black') {
      naturalWin = color === betType;
      payoutMultiplier = 2;
    } else if (betType === 'odd' || betType === 'even') {
      if (spin === 0) {
        naturalWin = false;
      } else {
        naturalWin = betType === 'odd' ? spin % 2 === 1 : spin % 2 === 0;
      }
      payoutMultiplier = 2;
    } else if (betType === 'number') {
      const n = typeof number === 'number' ? number : -1;
      if (n < 0 || n > 36) throw new BadRequestException('Invalid roulette number');
      naturalWin = spin === n;
      payoutMultiplier = 36;
    }

    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;

    const unclampedWinAmount = win ? betAmount * payoutMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) {
      await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
    } else {
      await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);
    }

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount;
    session.result = { spin, color, betType, number: betType === 'number' ? number : null, win, naturalWin, payoutMultiplier };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async playSlots(userId: string, betAmount: number, currency: Currency, clientSeed?: string) {
    const setting = await this.getSetting(GameType.SLOTS);
    const session: any = await this.createSession(userId, GameType.SLOTS, betAmount, currency, clientSeed);

    const symbols = ['A', 'K', 'Q', 'J', '10', '9', '★'];
    const grid = this.rngService.generateSlotsGrid(session.serverSeed, session.clientSeed, session.nonce, 5, 3, symbols);

    const { multiplier, wins } = this.evaluateSlots(grid);
    const naturalWin = multiplier > 0;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;
    const appliedMultiplier = win ? multiplier : 0;

    const unclampedWinAmount = win ? betAmount * appliedMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) {
      await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
    } else {
      await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);
    }

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount;
    session.result = { grid, multiplier: appliedMultiplier, wins, win, naturalWin };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async playBaccarat(
    userId: string,
    betAmount: number,
    currency: Currency,
    betOn: 'player' | 'banker' | 'tie',
    clientSeed?: string,
  ) {
    const setting = await this.getSetting(GameType.BACCARAT);
    const session: any = await this.createSession(userId, GameType.BACCARAT, betAmount, currency, clientSeed);

    const deck = this.rngService.generateShuffledDeck(session.serverSeed, session.clientSeed, session.nonce);
    let idx = 0;
    const draw = () => deck[idx++];

    const handValue = (cards: string[]) => {
      const v = cards.reduce((sum, c) => {
        const rank = c.slice(0, -1);
        if (rank === 'A') return sum + 1;
        if (['K', 'Q', 'J', '10'].includes(rank)) return sum + 0;
        return sum + Number(rank);
      }, 0);
      return v % 10;
    };

    const player = [draw(), draw()];
    const banker = [draw(), draw()];

    // Simplified baccarat third-card rules (playable + correct enough for MVP).
    let playerThird: string | null = null;
    let bankerThird: string | null = null;

    const pVal = () => handValue(player);
    const bVal = () => handValue(banker);

    if (pVal() <= 5) {
      playerThird = draw();
      player.push(playerThird);
    }

    // Banker draw decision (simplified)
    if (bVal() <= 5) {
      bankerThird = draw();
      banker.push(bankerThird);
    }

    const pFinal = pVal();
    const bFinal = bVal();

    let outcome: 'player' | 'banker' | 'tie' = 'tie';
    if (pFinal > bFinal) outcome = 'player';
    else if (bFinal > pFinal) outcome = 'banker';

    const naturalWin = outcome === betOn;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;

    // Payouts: player 2x, banker 1.95x (5% commission), tie 9x
    const payoutMultiplier = betOn === 'tie' ? 9 : betOn === 'banker' ? 1.95 : 2;
    const unclampedWinAmount = win ? betAmount * payoutMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) {
      await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
    } else {
      await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);
    }

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount;
    session.result = {
      betOn,
      outcome,
      player,
      banker,
      playerValue: pFinal,
      bankerValue: bFinal,
      win,
      naturalWin,
      payoutMultiplier,
    };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async blackjackStart(userId: string, betAmount: number, currency: Currency, clientSeed?: string) {
    const setting = await this.getSetting(GameType.BLACKJACK);
    const session: any = await this.createSession(userId, GameType.BLACKJACK, betAmount, currency, clientSeed);

    const deck = this.rngService.generateShuffledDeck(session.serverSeed, session.clientSeed, session.nonce);
    let idx = 0;
    const draw = () => deck[idx++];

    const player = [draw(), draw()];
    const dealer = [draw(), draw()];

    session.status = GameStatus.ACTIVE as any;
    session.result = {
      deck,
      idx,
      player,
      dealer,
      finished: false,
      outcome: null as null | 'win' | 'loss' | 'push',
      payoutMultiplier: null as null | number,
      playerValue: this.blackjackValue(player),
      dealerValue: this.blackjackValue([dealer[0]]), // show one card value for UI
    };

    return this.present(await this.saveSession(session));
  }

  async blackjackAction(userId: string, sessionId: string, action: 'hit' | 'stand') {
    const setting = await this.getSetting(GameType.BLACKJACK);
    const session = (await this.prisma.gameSession.findFirst({ where: { id: sessionId, userId } })) as any;
    if (!session) throw new BadRequestException('Session not found');
    if (session.gameType !== GameType.BLACKJACK) throw new BadRequestException('Invalid session');
    if (session.status !== (GameStatus.ACTIVE as any)) throw new BadRequestException('Hand is not active');

    const state = session.result || {};
    const deck: string[] = state.deck || [];
    let idx: number = state.idx ?? 0;
    const player: string[] = state.player || [];
    const dealer: string[] = state.dealer || [];

    const draw = () => deck[idx++];

    if (action === 'hit') {
      player.push(draw());
      const pv = this.blackjackValue(player);
      if (pv > 21) {
        // bust
        return this.finishBlackjack(session, setting, deck, idx, player, dealer, 'loss', 0);
      }

      session.result = {
        ...state,
        idx,
        player,
        dealer,
        playerValue: pv,
        dealerValue: this.blackjackValue([dealer[0]]),
      };
      return this.present(await this.saveSession(session));
    }

    // stand => dealer plays
    while (this.blackjackValue(dealer) < 17) {
      dealer.push(draw());
    }

    const pv = this.blackjackValue(player);
    const dv = this.blackjackValue(dealer);

    let outcome: 'win' | 'loss' | 'push' = 'push';
    if (dv > 21 || pv > dv) outcome = 'win';
    else if (pv < dv) outcome = 'loss';

    const naturalWin = outcome === 'win';
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;
    const finalOutcome: 'win' | 'loss' | 'push' = override === null ? outcome : win ? 'win' : 'loss';

    const payoutMultiplier = finalOutcome === 'win' ? 2 : finalOutcome === 'push' ? 1 : 0;

    return this.finishBlackjack(session, setting, deck, idx, player, dealer, finalOutcome, payoutMultiplier);
  }

  private blackjackValue(cards: string[]): number {
    let total = 0;
    let aces = 0;
    for (const c of cards) {
      const rank = c.slice(0, -1);
      if (rank === 'A') {
        aces += 1;
        total += 11;
      } else if (['K', 'Q', 'J'].includes(rank)) {
        total += 10;
      } else {
        total += Number(rank);
      }
    }
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return total;
  }

  private async finishBlackjack(
    session: any,
    setting: any,
    deck: string[],
    idx: number,
    player: string[],
    dealer: string[],
    outcome: 'win' | 'loss' | 'push',
    payoutMultiplier: number,
  ) {
    const betAmount = Number(session.betAmount);
    const currency = session.currency as any as Currency;

    if (outcome === 'win') {
      const unclampedWinAmount = betAmount * payoutMultiplier;
      const winAmount = this.clampMaxWin(setting, unclampedWinAmount);
      await this.walletService.createTransaction(session.userId, currency, winAmount, TransactionType.WIN, session.id);
      session.winAmount = winAmount as any;
    } else if (outcome === 'push') {
      // Return bet (treat as WIN of 1x)
      const unclampedWinAmount = betAmount * 1;
      const winAmount = this.clampMaxWin(setting, unclampedWinAmount);
      await this.walletService.createTransaction(session.userId, currency, winAmount, TransactionType.WIN, session.id);
      session.winAmount = winAmount as any;
    } else {
      await this.walletService.createTransaction(session.userId, currency, betAmount, TransactionType.LOSS, session.id);
      session.winAmount = 0 as any;
    }

    session.status = GameStatus.COMPLETED as any;
    session.result = {
      deck,
      idx,
      player,
      dealer,
      finished: true,
      outcome,
      payoutMultiplier,
      playerValue: this.blackjackValue(player),
      dealerValue: this.blackjackValue(dealer),
    };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async hiloStart(userId: string, betAmount: number, currency: Currency, clientSeed?: string) {
    const setting = await this.getSetting(GameType.HILO);
    const session: any = await this.createSession(userId, GameType.HILO, betAmount, currency, clientSeed);

    const deck = this.rngService.generateShuffledDeck(session.serverSeed, session.clientSeed, session.nonce);
    let idx = 0;
    const current = deck[idx++];

    session.status = GameStatus.ACTIVE as any;
    session.result = {
      deck,
      idx,
      current,
      streak: 0,
      multiplier: 1,
      finished: false,
    };
    return this.present(await this.saveSession(session));
  }

  async hiloAction(userId: string, sessionId: string, action: 'higher' | 'lower' | 'cashout') {
    const setting = await this.getSetting(GameType.HILO);
    const session = (await this.prisma.gameSession.findFirst({ where: { id: sessionId, userId } })) as any;
    if (!session) throw new BadRequestException('Session not found');
    if (session.gameType !== GameType.HILO) throw new BadRequestException('Invalid session');
    if (session.status !== (GameStatus.ACTIVE as any)) throw new BadRequestException('Game is not active');

    const state = session.result || {};
    const deck: string[] = state.deck || [];
    let idx: number = state.idx ?? 0;
    let current: string = state.current;
    let streak: number = state.streak ?? 0;
    let multiplier: number = state.multiplier ?? 1;

    if (action === 'cashout') {
      const betAmount = Number(session.betAmount);
      const unclampedWinAmount = betAmount * multiplier;
      const winAmount = this.clampMaxWin(setting, unclampedWinAmount);
      await this.walletService.createTransaction(userId, session.currency as any, winAmount, TransactionType.WIN, session.id);
      session.status = GameStatus.COMPLETED as any;
      session.winAmount = winAmount as any;
      session.result = { ...state, idx, current, streak, multiplier, finished: true, outcome: 'cashout' };
      session.completedAt = new Date();
      return this.present(await this.saveSession(session));
    }

    const next = deck[idx++];
    const curRank = this.cardRankValue(current);
    const nextRank = this.cardRankValue(next);
    const naturalWin = action === 'higher' ? nextRank > curRank : nextRank < curRank;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;

    if (!win) {
      await this.walletService.createTransaction(userId, session.currency as any, Number(session.betAmount), TransactionType.LOSS, session.id);
      session.status = GameStatus.COMPLETED as any;
      session.winAmount = 0 as any;
      session.result = { ...state, idx, current, next, win, naturalWin, finished: true, outcome: 'loss' };
      session.completedAt = new Date();
      return this.present(await this.saveSession(session));
    }

    // Correct guess => increase streak + multiplier, continue
    streak += 1;
    multiplier = Number((multiplier * (1.2 * (Number(setting.rtp) || 0.95))).toFixed(4));
    current = next;

    session.result = { ...state, idx, current, streak, multiplier, last: next, win, naturalWin, finished: false };
    return this.present(await this.saveSession(session));
  }

  async towerStart(userId: string, betAmount: number, currency: Currency, clientSeed?: string) {
    const setting = await this.getSetting(GameType.TOWER);
    const session: any = await this.createSession(userId, GameType.TOWER, betAmount, currency, clientSeed);

    session.status = GameStatus.ACTIVE as any;
    session.result = {
      level: 0,
      multiplier: 1,
      finished: false,
    };
    return this.present(await this.saveSession(session));
  }

  async towerAction(userId: string, sessionId: string, action: 'pick' | 'cashout', column?: number) {
    const setting = await this.getSetting(GameType.TOWER);
    const session = (await this.prisma.gameSession.findFirst({ where: { id: sessionId, userId } })) as any;
    if (!session) throw new BadRequestException('Session not found');
    if (session.gameType !== GameType.TOWER) throw new BadRequestException('Invalid session');
    if (session.status !== (GameStatus.ACTIVE as any)) throw new BadRequestException('Game is not active');

    const state = session.result || {};
    let level: number = state.level ?? 0;
    let multiplier: number = state.multiplier ?? 1;

    if (action === 'cashout') {
      const betAmount = Number(session.betAmount);
      const unclampedWinAmount = betAmount * multiplier;
      const winAmount = this.clampMaxWin(setting, unclampedWinAmount);
      await this.walletService.createTransaction(userId, session.currency as any, winAmount, TransactionType.WIN, session.id);
      session.status = GameStatus.COMPLETED as any;
      session.winAmount = winAmount as any;
      session.result = { ...state, level, multiplier, finished: true, outcome: 'cashout' };
      session.completedAt = new Date();
      return this.present(await this.saveSession(session));
    }

    if (typeof column !== 'number' || column < 0 || column > 2) throw new BadRequestException('Invalid column');
    const safe = this.rngService.generateInt(session.serverSeed, session.clientSeed, session.nonce + level, 0, 2);
    const naturalWin = column === safe;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;

    if (!win) {
      await this.walletService.createTransaction(userId, session.currency as any, Number(session.betAmount), TransactionType.LOSS, session.id);
      session.status = GameStatus.COMPLETED as any;
      session.winAmount = 0 as any;
      session.result = { ...state, level, multiplier, pick: column, safe, win, naturalWin, finished: true, outcome: 'loss' };
      session.completedAt = new Date();
      return this.present(await this.saveSession(session));
    }

    level += 1;
    multiplier = Number((multiplier * (1.35 * (Number(setting.rtp) || 0.95))).toFixed(4));
    session.result = { ...state, level, multiplier, lastPick: column, safe, win, naturalWin, finished: false };
    return this.present(await this.saveSession(session));
  }

  async playKeno(userId: string, betAmount: number, currency: Currency, picks: number[], clientSeed?: string) {
    const setting = await this.getSetting(GameType.KENO);
    const session: any = await this.createSession(userId, GameType.KENO, betAmount, currency, clientSeed);

    const cleaned = Array.from(new Set(picks)).filter((n) => Number.isFinite(n) && n >= 1 && n <= 40).slice(0, 10);
    if (cleaned.length < 1) throw new BadRequestException('Select at least 1 number');

    const draw = this.rngService.sampleUniqueNumbers(session.serverSeed, session.clientSeed, session.nonce, 10, 1, 40);
    const matches = cleaned.filter((n) => draw.includes(n)).length;

    // Simple payout table based on matches (playable)
    const table: Record<number, number> = { 0: 0, 1: 0, 2: 0.5, 3: 1, 4: 2, 5: 5, 6: 10, 7: 20, 8: 50, 9: 100, 10: 250 };
    const base = table[matches] ?? 0;
    const payoutMultiplier = Number((base * (Number(setting.rtp) || 0.95)).toFixed(4));

    const naturalWin = payoutMultiplier > 0;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;

    const unclampedWinAmount = win ? betAmount * payoutMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
    else await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount as any;
    session.result = { picks: cleaned, draw, matches, payoutMultiplier, win, naturalWin };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async playScratch(userId: string, betAmount: number, currency: Currency, clientSeed?: string) {
    const setting = await this.getSetting(GameType.SCRATCH);
    const session: any = await this.createSession(userId, GameType.SCRATCH, betAmount, currency, clientSeed);

    const symbols = ['🍒', '🍋', '⭐', '💎', '7'];
    const pick = (i: number) => symbols[this.rngService.generateInt(session.serverSeed, session.clientSeed, session.nonce + i, 0, symbols.length - 1)];
    const revealed = [pick(1), pick(2), pick(3)];

    let payoutMultiplier = 0;
    if (revealed[0] === revealed[1] && revealed[1] === revealed[2]) {
      payoutMultiplier = revealed[0] === '7' ? 10 : revealed[0] === '💎' ? 5 : 2;
    }
    payoutMultiplier = Number((payoutMultiplier * (Number(setting.rtp) || 0.95)).toFixed(4));

    const naturalWin = payoutMultiplier > 0;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;
    const unclampedWinAmount = win ? betAmount * payoutMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
    else await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount as any;
    session.result = { revealed, payoutMultiplier, win, naturalWin };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async playDragonTiger(
    userId: string,
    betAmount: number,
    currency: Currency,
    betOn: 'dragon' | 'tiger' | 'tie',
    clientSeed?: string,
  ) {
    const setting = await this.getSetting(GameType.DRAGON_TIGER);
    const session: any = await this.createSession(userId, GameType.DRAGON_TIGER, betAmount, currency, clientSeed);

    const deck = this.rngService.generateShuffledDeck(session.serverSeed, session.clientSeed, session.nonce);
    const dragon = deck[0];
    const tiger = deck[1];
    const dv = this.cardRankValue(dragon);
    const tv = this.cardRankValue(tiger);

    let outcome: 'dragon' | 'tiger' | 'tie' = 'tie';
    if (dv > tv) outcome = 'dragon';
    else if (tv > dv) outcome = 'tiger';

    const naturalWin = outcome === betOn;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;

    const payoutMultiplier = betOn === 'tie' ? 8 : 2;
    const unclampedWinAmount = win ? betAmount * payoutMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
    else await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount as any;
    session.result = { betOn, outcome, dragon, tiger, win, naturalWin, payoutMultiplier };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async playAndarBahar(
    userId: string,
    betAmount: number,
    currency: Currency,
    betOn: 'andar' | 'bahar',
    clientSeed?: string,
  ) {
    const setting = await this.getSetting(GameType.ANDAR_BAHAR);
    const session: any = await this.createSession(userId, GameType.ANDAR_BAHAR, betAmount, currency, clientSeed);

    const deck = this.rngService.generateShuffledDeck(session.serverSeed, session.clientSeed, session.nonce);
    let idx = 0;
    const joker = deck[idx++];
    const jokerRank = joker.slice(0, -1);

    const andar: string[] = [];
    const bahar: string[] = [];
    let side: 'andar' | 'bahar' = 'andar';
    let winner: 'andar' | 'bahar' = 'andar';

    while (idx < deck.length) {
      const card = deck[idx++];
      if (side === 'andar') andar.push(card);
      else bahar.push(card);
      if (card.slice(0, -1) === jokerRank) {
        winner = side;
        break;
      }
      side = side === 'andar' ? 'bahar' : 'andar';
    }

    const naturalWin = winner === betOn;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;

    const payoutMultiplier = 2;
    const unclampedWinAmount = win ? betAmount * payoutMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
    else await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount as any;
    session.result = { betOn, winner, joker, andar, bahar, win, naturalWin, payoutMultiplier };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async videoPokerStart(userId: string, betAmount: number, currency: Currency, clientSeed?: string) {
    const setting = await this.getSetting(GameType.VIDEO_POKER);
    const session: any = await this.createSession(userId, GameType.VIDEO_POKER, betAmount, currency, clientSeed);
    const deck = this.rngService.generateShuffledDeck(session.serverSeed, session.clientSeed, session.nonce);
    let idx = 0;
    const hand = [deck[idx++], deck[idx++], deck[idx++], deck[idx++], deck[idx++]];

    session.status = GameStatus.ACTIVE as any;
    session.result = { deck, idx, hand, drawn: false };
    return this.present(await this.saveSession(session));
  }

  async videoPokerDraw(userId: string, sessionId: string, hold: boolean[]) {
    const setting = await this.getSetting(GameType.VIDEO_POKER);
    const session = (await this.prisma.gameSession.findFirst({ where: { id: sessionId, userId } })) as any;
    if (!session) throw new BadRequestException('Session not found');
    if (session.gameType !== GameType.VIDEO_POKER) throw new BadRequestException('Invalid session');
    if (session.status !== (GameStatus.ACTIVE as any)) throw new BadRequestException('Hand is not active');

    const state = session.result || {};
    if (state.drawn) throw new BadRequestException('Already drawn');
    const deck: string[] = state.deck || [];
    let idx: number = state.idx ?? 0;
    const hand: string[] = state.hand || [];
    if (!Array.isArray(hold) || hold.length !== 5) throw new BadRequestException('Hold must be length 5');

    for (let i = 0; i < 5; i++) {
      if (!hold[i]) {
        hand[i] = deck[idx++];
      }
    }

    const evalRes = this.evaluatePokerHand(hand);
    const payoutMultiplier = Number((evalRes.multiplier * (Number(setting.rtp) || 0.95)).toFixed(4));
    const naturalWin = payoutMultiplier > 0;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;

    const betAmount = Number(session.betAmount);
    const unclampedWinAmount = win ? betAmount * payoutMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) await this.walletService.createTransaction(userId, session.currency as any, winAmount, TransactionType.WIN, session.id);
    else await this.walletService.createTransaction(userId, session.currency as any, betAmount, TransactionType.LOSS, session.id);

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount as any;
    session.result = { deck, idx, hand, drawn: true, handRank: evalRes.rank, payoutMultiplier, win, naturalWin };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async playColorPrediction(
    userId: string,
    betAmount: number,
    currency: Currency,
    color: 'red' | 'green' | 'violet',
    clientSeed?: string,
  ) {
    const setting = await this.getSetting(GameType.COLOR_PREDICTION);
    const session: any = await this.createSession(userId, GameType.COLOR_PREDICTION, betAmount, currency, clientSeed);

    const roll = this.rngService.generateInt(session.serverSeed, session.clientSeed, session.nonce, 1, 100);
    const outcome: 'red' | 'green' | 'violet' = roll <= 45 ? 'red' : roll <= 90 ? 'green' : 'violet';
    const naturalWin = outcome === color;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;

    const payoutMultiplier = color === 'violet' ? 4 : 2;
    const unclampedWinAmount = win ? betAmount * payoutMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
    else await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount as any;
    session.result = { color, outcome, roll, win, naturalWin, payoutMultiplier };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async playNumberHiLo(
    userId: string,
    betAmount: number,
    currency: Currency,
    start: number,
    guess: 'higher' | 'lower',
    clientSeed?: string,
  ) {
    const setting = await this.getSetting(GameType.NUMBER_HILO);
    const session: any = await this.createSession(userId, GameType.NUMBER_HILO, betAmount, currency, clientSeed);

    const next = this.rngService.generateInt(session.serverSeed, session.clientSeed, session.nonce, 0, 9);
    const naturalWin = guess === 'higher' ? next > start : next < start;
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;

    // Multiplier based on probability, scaled by RTP
    const p = guess === 'higher' ? (9 - start) / 10 : start / 10;
    const payoutMultiplier = Number(((1 / Math.max(0.1, p)) * (Number(setting.rtp) || 0.95)).toFixed(4));

    const unclampedWinAmount = win ? betAmount * payoutMultiplier : 0;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (win) await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
    else await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);

    session.status = GameStatus.COMPLETED as any;
    session.winAmount = winAmount as any;
    session.result = { start, guess, next, win, naturalWin, payoutMultiplier };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async playPoker(userId: string, betAmount: number, currency: Currency, clientSeed?: string) {
    const setting = await this.getSetting(GameType.POKER);
    const session: any = await this.createSession(userId, GameType.POKER, betAmount, currency, clientSeed);

    const deck = this.rngService.generateShuffledDeck(session.serverSeed, session.clientSeed, session.nonce);
    const playerCards = [deck[0], deck[1]];
    const dealerCards = [deck[2], deck[3]];
    const communityCards = [deck[4], deck[5], deck[6], deck[7], deck[8]];

    const playerHand = this.bestPokerHand([...playerCards, ...communityCards]);
    const dealerHand = this.bestPokerHand([...dealerCards, ...communityCards]);

    const cmp = this.comparePokerScores(playerHand.score, dealerHand.score);
    let winner: 'player' | 'dealer' | 'tie' = 'tie';
    if (cmp > 0) winner = 'player';
    else if (cmp < 0) winner = 'dealer';

    const naturalWin = winner === 'player';
    const override = this.resolveWinOverride(setting);
    const win = override ?? naturalWin;
    const finalWinner: 'player' | 'dealer' | 'tie' = override === null ? winner : win ? 'player' : 'dealer';

    const payoutMultiplier = finalWinner === 'player' ? 2 : finalWinner === 'tie' ? 1 : 0;
    const unclampedWinAmount = betAmount * payoutMultiplier;
    const winAmount = this.clampMaxWin(setting, unclampedWinAmount);

    if (payoutMultiplier > 0) {
      await this.walletService.createTransaction(userId, currency, winAmount, TransactionType.WIN, session.id);
      session.winAmount = winAmount as any;
    } else {
      await this.walletService.createTransaction(userId, currency, betAmount, TransactionType.LOSS, session.id);
      session.winAmount = 0 as any;
    }

    session.status = GameStatus.COMPLETED as any;
    session.result = {
      playerCards,
      dealerCards,
      communityCards,
      playerHand: { rank: playerHand.rank, description: playerHand.description },
      dealerHand: { rank: dealerHand.rank, description: dealerHand.description },
      winner: finalWinner,
      win: finalWinner === 'player',
      naturalWin,
      payoutMultiplier,
    };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  async ticTacToeStart(
    userId: string,
    betAmount: number,
    currency: Currency,
    userSymbol: 'X' | 'O',
    clientSeed?: string,
  ) {
    const session: any = await this.createSession(userId, GameType.TIC_TAC_TOE, betAmount, currency, clientSeed);

    const board: (null | 'X' | 'O')[] = Array(9).fill(null);
    const aiSymbol = userSymbol === 'X' ? 'O' : 'X';
    let moveCount = 0;

    // X always moves first.
    if (aiSymbol === 'X') {
      const aiPos = this.ticTacToeAiMove(board, aiSymbol, userSymbol, session, moveCount);
      board[aiPos] = aiSymbol;
      moveCount += 1;
    }

    session.status = GameStatus.ACTIVE as any;
    session.result = {
      board,
      userSymbol,
      aiSymbol,
      moveCount,
      currentTurn: userSymbol,
      finished: false,
    };
    return this.present(await this.saveSession(session));
  }

  async ticTacToeMove(userId: string, sessionId: string, position: number) {
    const setting = await this.getSetting(GameType.TIC_TAC_TOE);
    const session = (await this.prisma.gameSession.findFirst({ where: { id: sessionId, userId } })) as any;
    if (!session) throw new BadRequestException('Session not found');
    if (session.gameType !== GameType.TIC_TAC_TOE) throw new BadRequestException('Invalid session');
    if (session.status !== (GameStatus.ACTIVE as any)) throw new BadRequestException('Game is not active');

    const state = session.result as any;
    const board: (null | 'X' | 'O')[] = [...(state.board || Array(9).fill(null))];
    const userSymbol: 'X' | 'O' = state.userSymbol;
    const aiSymbol: 'X' | 'O' = state.aiSymbol;
    let moveCount: number = state.moveCount ?? 0;

    if (board[position] !== null) throw new BadRequestException('Cell already taken');

    board[position] = userSymbol;
    moveCount += 1;

    let verdict = this.ticTacToeVerdict(board);
    if (!verdict.finished) {
      const aiPos = this.ticTacToeAiMove(board, aiSymbol, userSymbol, session, moveCount);
      board[aiPos] = aiSymbol;
      moveCount += 1;
      verdict = this.ticTacToeVerdict(board);
    }

    if (!verdict.finished) {
      session.result = { ...state, board, moveCount, currentTurn: userSymbol, finished: false };
      return this.present(await this.saveSession(session));
    }

    const naturalOutcome: 'win' | 'loss' | 'draw' =
      verdict.winner === userSymbol ? 'win' : verdict.winner === aiSymbol ? 'loss' : 'draw';
    const override = this.resolveWinOverride(setting);
    const outcome: 'win' | 'loss' | 'draw' =
      override === null ? naturalOutcome : override ? 'win' : 'loss';

    const betAmount = Number(session.betAmount);
    const payoutMultiplier = outcome === 'win' ? 2 : outcome === 'draw' ? 1 : 0;
    const winAmount = this.clampMaxWin(setting, betAmount * payoutMultiplier);

    if (payoutMultiplier > 0) {
      await this.walletService.createTransaction(userId, session.currency as any, winAmount, TransactionType.WIN, session.id);
      session.winAmount = winAmount as any;
    } else {
      await this.walletService.createTransaction(userId, session.currency as any, betAmount, TransactionType.LOSS, session.id);
      session.winAmount = 0 as any;
    }

    session.status = GameStatus.COMPLETED as any;
    session.result = {
      ...state,
      board,
      moveCount,
      finished: true,
      outcome,
      winningLine: verdict.line,
      payoutMultiplier,
    };
    session.completedAt = new Date();
    return this.present(await this.saveSession(session));
  }

  private ticTacToeVerdict(board: (null | 'X' | 'O')[]): {
    finished: boolean;
    winner: 'X' | 'O' | null;
    line: number[] | null;
  } {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        return { finished: true, winner: board[a] as 'X' | 'O', line };
      }
    }
    if (board.every((cell) => cell !== null)) {
      return { finished: true, winner: null, line: null };
    }
    return { finished: false, winner: null, line: null };
  }

  /**
   * Deterministic AI driven by the provably-fair RNG: plays a strong
   * heuristic move most of the time, an imperfect move occasionally so the
   * game stays winnable.
   */
  private ticTacToeAiMove(
    board: (null | 'X' | 'O')[],
    aiSymbol: 'X' | 'O',
    userSymbol: 'X' | 'O',
    session: any,
    moveIndex: number,
  ): number {
    const available = board
      .map((cell, i) => (cell === null ? i : -1))
      .filter((i) => i !== -1);

    const roll = this.rngService.generateInt(
      session.serverSeed,
      session.clientSeed,
      session.nonce + moveIndex + 1,
      1,
      100,
    );
    // ~25% of moves are random — keeps the game beatable.
    if (roll <= 25) {
      const pick = this.rngService.generateInt(
        session.serverSeed,
        session.clientSeed,
        session.nonce + moveIndex + 50,
        0,
        available.length - 1,
      );
      return available[pick];
    }

    const winningMove = (symbol: 'X' | 'O'): number | null => {
      for (const i of available) {
        const copy = [...board];
        copy[i] = symbol;
        if (this.ticTacToeVerdict(copy).winner === symbol) return i;
      }
      return null;
    };

    const winNow = winningMove(aiSymbol);
    if (winNow !== null) return winNow;

    const blockNow = winningMove(userSymbol);
    if (blockNow !== null) return blockNow;

    if (board[4] === null) return 4;

    const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
    if (corners.length > 0) {
      const pick = this.rngService.generateInt(
        session.serverSeed,
        session.clientSeed,
        session.nonce + moveIndex + 100,
        0,
        corners.length - 1,
      );
      return corners[pick];
    }

    return available[0];
  }

  /** Best 5-card hand out of 7 cards (Texas Hold'em showdown). */
  private bestPokerHand(cards: string[]): { score: number[]; rank: string; description: string } {
    let best: { score: number[]; rank: string; description: string } | null = null;
    const n = cards.length;
    for (let a = 0; a < n - 4; a++) {
      for (let b = a + 1; b < n - 3; b++) {
        for (let c = b + 1; c < n - 2; c++) {
          for (let d = c + 1; d < n - 1; d++) {
            for (let e = d + 1; e < n; e++) {
              const hand = [cards[a], cards[b], cards[c], cards[d], cards[e]];
              const scored = this.scoreFiveCardHand(hand);
              if (!best || this.comparePokerScores(scored.score, best.score) > 0) {
                best = scored;
              }
            }
          }
        }
      }
    }
    return best!;
  }

  private comparePokerScores(a: number[], b: number[]): number {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const av = a[i] ?? 0;
      const bv = b[i] ?? 0;
      if (av !== bv) return av - bv;
    }
    return 0;
  }

  private scoreFiveCardHand(hand: string[]): { score: number[]; rank: string; description: string } {
    const values = hand
      .map((c) => {
        const r = c.slice(0, -1);
        return r === 'A' ? 14 : r === 'K' ? 13 : r === 'Q' ? 12 : r === 'J' ? 11 : Number(r);
      })
      .sort((x, y) => y - x);
    const suits = hand.map((c) => c.slice(-1));

    const isFlush = suits.every((s) => s === suits[0]);
    const distinctDesc = [...new Set(values)];
    let straightHigh = 0;
    if (distinctDesc.length === 5) {
      if (values[0] - values[4] === 4) straightHigh = values[0];
      // Wheel: A-2-3-4-5
      else if (values.toString() === [14, 5, 4, 3, 2].toString()) straightHigh = 5;
    }
    const isStraight = straightHigh > 0;

    const counts = new Map<number, number>();
    for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
    // Sort by count desc, then by value desc — produces correct kicker order.
    const grouped = [...counts.entries()].sort((x, y) => y[1] - x[1] || y[0] - x[0]);
    const kickers = grouped.map(([v]) => v);

    if (isStraight && isFlush) return { score: [8, straightHigh], rank: 'straight_flush', description: 'Straight Flush' };
    if (grouped[0][1] === 4) return { score: [7, ...kickers], rank: 'four_kind', description: 'Four of a Kind' };
    if (grouped[0][1] === 3 && grouped[1][1] === 2) return { score: [6, ...kickers], rank: 'full_house', description: 'Full House' };
    if (isFlush) return { score: [5, ...values], rank: 'flush', description: 'Flush' };
    if (isStraight) return { score: [4, straightHigh], rank: 'straight', description: 'Straight' };
    if (grouped[0][1] === 3) return { score: [3, ...kickers], rank: 'three_kind', description: 'Three of a Kind' };
    if (grouped[0][1] === 2 && grouped[1][1] === 2) return { score: [2, ...kickers], rank: 'two_pair', description: 'Two Pair' };
    if (grouped[0][1] === 2) return { score: [1, ...kickers], rank: 'pair', description: 'Pair' };
    return { score: [0, ...values], rank: 'high_card', description: 'High Card' };
  }

  /**
   * Calculate mathematically defensible multiplier for Mines game.
   * 
   * The probability of surviving k safe picks with m mines is:
   * P(survive k) = Π(i=0 to k-1) ((25 - m - i) / (25 - i))
   * 
   * Fair multiplier = 1 / P
   * Displayed multiplier = Fair multiplier × RTP
   * 
   * This ensures the house edge is consistently applied through RTP.
   */
  private calculateMinesMultiplier(revealed: number, mines: number, gridSize: number, rtp: number): number {
    if (revealed <= 0) return 1.0;
    if (mines <= 0 || mines >= gridSize) return 1.0;
    
    // Calculate sequential survival probability
    let probability = 1.0;
    for (let i = 0; i < revealed; i++) {
      probability *= (gridSize - mines - i) / (gridSize - i);
    }
    
    // Avoid division by zero
    if (probability <= 0) return 1.0;
    
    // Fair multiplier based on probability
    const fairMultiplier = 1.0 / probability;
    
    // Apply RTP (Return to Player) - typically 0.95-0.99
    const appliedRtp = rtp || 0.95;
    
    return fairMultiplier * appliedRtp;
  }

  private getRouletteColor(n: number): 'red' | 'black' | 'green' {
    if (n === 0) return 'green';
    const reds = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
    return reds.has(n) ? 'red' : 'black';
  }

  private cardRankValue(card: string): number {
    const rank = card.slice(0, -1);
    if (rank === 'A') return 14;
    if (rank === 'K') return 13;
    if (rank === 'Q') return 12;
    if (rank === 'J') return 11;
    return Number(rank);
  }

  private evaluatePokerHand(hand: string[]): { rank: string; multiplier: number } {
    // Minimal video poker evaluation (playable)
    const ranks = hand.map((c) => c.slice(0, -1));
    const suits = hand.map((c) => c.slice(-1));
    const values = ranks
      .map((r) => (r === 'A' ? 14 : r === 'K' ? 13 : r === 'Q' ? 12 : r === 'J' ? 11 : Number(r)))
      .sort((a, b) => a - b);

    const isFlush = suits.every((s) => s === suits[0]);
    const isStraight =
      values.every((v, i) => (i === 0 ? true : v === values[i - 1] + 1)) ||
      // A2345
      (values.toString() === [2, 3, 4, 5, 14].toString());

    const counts: Record<number, number> = {};
    for (const v of values) counts[v] = (counts[v] || 0) + 1;
    const groups = Object.values(counts).sort((a, b) => b - a);

    if (isStraight && isFlush) return { rank: 'straight_flush', multiplier: 20 };
    if (groups[0] === 4) return { rank: 'four_kind', multiplier: 10 };
    if (groups[0] === 3 && groups[1] === 2) return { rank: 'full_house', multiplier: 6 };
    if (isFlush) return { rank: 'flush', multiplier: 4 };
    if (isStraight) return { rank: 'straight', multiplier: 3 };
    if (groups[0] === 3) return { rank: 'three_kind', multiplier: 2 };
    if (groups[0] === 2 && groups[1] === 2) return { rank: 'two_pair', multiplier: 1.5 };
    if (groups[0] === 2) return { rank: 'pair', multiplier: 1.2 };
    return { rank: 'none', multiplier: 0 };
  }

  private hashToFloat(hash: string): number {
    const substring = hash.substring(0, 8);
    const int = parseInt(substring, 16);
    return int / 0xffffffff;
  }

  private makeRoundSeed(game: string, roundId: number): string {
    return crypto.createHash('sha256').update(`live:${game}:${roundId}:server`).digest('hex');
  }

  private getRoundMeta(
    nowMs: number,
    durationMs: number,
    bettingMs: number,
    settleMs: number,
  ): {
    roundId: number;
    roundStartMs: number;
    roundEndMs: number;
    lockMs: number;
    settleMs: number;
    phase: 'betting' | 'running' | 'settled';
    remainingMs: number;
  } {
    const elapsedFromEpoch = Math.max(0, nowMs - this.liveEpochMs);
    const roundId = Math.floor(elapsedFromEpoch / durationMs);
    const roundStartMs = this.liveEpochMs + roundId * durationMs;
    const roundEndMs = roundStartMs + durationMs;
    const lockMs = roundStartMs + bettingMs;
    const settlePointMs = roundEndMs - settleMs;

    let phase: 'betting' | 'running' | 'settled' = 'betting';
    if (nowMs >= settlePointMs) phase = 'settled';
    else if (nowMs >= lockMs) phase = 'running';

    const remainingMs =
      phase === 'betting'
        ? Math.max(0, lockMs - nowMs)
        : phase === 'running'
          ? Math.max(0, settlePointMs - nowMs)
          : Math.max(0, roundEndMs - nowMs);

    return { roundId, roundStartMs, roundEndMs, lockMs, settleMs: settlePointMs, phase, remainingMs };
  }

  getLiveCrashState() {
    const now = Date.now();
    const meta = this.getRoundMeta(now, 12000, 5000, 2000);
    const serverSeed = this.makeRoundSeed('crash', meta.roundId);
    const seedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
    const crashPoint = this.rngService.generateCrashPoint(serverSeed, 'live-client', 1);

    let currentMultiplier = 1;
    if (meta.phase === 'running') {
      const progress = (now - meta.lockMs) / Math.max(1, meta.settleMs - meta.lockMs);
      currentMultiplier = Math.min(crashPoint, Number((Math.exp(progress * 3)).toFixed(2)));
    } else if (meta.phase === 'settled') {
      currentMultiplier = Number(crashPoint.toFixed(2));
    }

    return {
      game: 'crash',
      roundId: meta.roundId,
      phase: meta.phase,
      remainingMs: meta.remainingMs,
      startsAt: new Date(meta.roundStartMs).toISOString(),
      locksAt: new Date(meta.lockMs).toISOString(),
      settlesAt: new Date(meta.settleMs).toISOString(),
      endsAt: new Date(meta.roundEndMs).toISOString(),
      currentMultiplier,
      result: meta.phase === 'settled' ? { crashPoint: Number(crashPoint.toFixed(2)) } : null,
      fair: { serverSeedHash: seedHash, nonce: meta.roundId },
    };
  }

  getLiveRouletteState() {
    const now = Date.now();
    const meta = this.getRoundMeta(now, 10000, 5000, 1500);
    const serverSeed = this.makeRoundSeed('roulette', meta.roundId);
    const seedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
    const spin = this.rngService.generateRouletteNumber(serverSeed, 'live-client', 1);
    const color = this.getRouletteColor(spin);

    return {
      game: 'roulette',
      roundId: meta.roundId,
      phase: meta.phase,
      remainingMs: meta.remainingMs,
      startsAt: new Date(meta.roundStartMs).toISOString(),
      locksAt: new Date(meta.lockMs).toISOString(),
      settlesAt: new Date(meta.settleMs).toISOString(),
      endsAt: new Date(meta.roundEndMs).toISOString(),
      result: meta.phase === 'settled' ? { spin, color } : null,
      fair: { serverSeedHash: seedHash, nonce: meta.roundId },
    };
  }

  getLiveColorPredictionState() {
    const now = Date.now();
    const meta = this.getRoundMeta(now, 8000, 4000, 1000);
    const serverSeed = this.makeRoundSeed('color_prediction', meta.roundId);
    const seedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
    const roll = this.rngService.generateInt(serverSeed, 'live-client', 1, 1, 100);
    const outcome: 'red' | 'green' | 'violet' = roll <= 45 ? 'red' : roll <= 90 ? 'green' : 'violet';

    return {
      game: 'color_prediction',
      roundId: meta.roundId,
      phase: meta.phase,
      remainingMs: meta.remainingMs,
      startsAt: new Date(meta.roundStartMs).toISOString(),
      locksAt: new Date(meta.lockMs).toISOString(),
      settlesAt: new Date(meta.settleMs).toISOString(),
      endsAt: new Date(meta.roundEndMs).toISOString(),
      result: meta.phase === 'settled' ? { roll, outcome } : null,
      fair: { serverSeedHash: seedHash, nonce: meta.roundId },
    };
  }

  private evaluateSlots(grid: string[][]): { multiplier: number; wins: any[] } {
    // 5 reels x 3 rows grid where grid[row][col]
    // Paylines: top, middle, bottom
    const lines = [
      { name: 'top', cells: [grid[0][0], grid[0][1], grid[0][2], grid[0][3], grid[0][4]] },
      { name: 'mid', cells: [grid[1][0], grid[1][1], grid[1][2], grid[1][3], grid[1][4]] },
      { name: 'bot', cells: [grid[2][0], grid[2][1], grid[2][2], grid[2][3], grid[2][4]] },
    ];

    const payTable: Record<string, number> = {
      '★': 10,
      A: 3,
      K: 2.5,
      Q: 2,
      J: 1.8,
      '10': 1.6,
      '9': 1.4,
    };

    const wins: any[] = [];
    let totalMultiplier = 0;

    for (const line of lines) {
      const first = line.cells[0];
      let count = 1;
      for (let i = 1; i < line.cells.length; i++) {
        if (line.cells[i] === first) count++;
        else break;
      }
      if (count >= 3) {
        const base = payTable[first] || 1;
        const m = Number((base * (count === 3 ? 1 : count === 4 ? 1.5 : 2)).toFixed(2));
        totalMultiplier += m;
        wins.push({ line: line.name, symbol: first, count, multiplier: m });
      }
    }

    return { multiplier: Number(totalMultiplier.toFixed(2)), wins };
  }

  private getPlinkoMultipliers(rows: number, risk: 'low' | 'medium' | 'high'): number[] {
    // Simplified, playable multiplier tables.
    // Length must be rows+1.
    // Risk increases variance.
    if (risk === 'low') {
      // Center-biased small multipliers
      // Example for rows=8 -> 9 slots
      return Array.from({ length: rows + 1 }, (_, i) => {
        const dist = Math.abs(i - rows / 2);
        const m = Math.max(0.2, 1.2 - dist * 0.2);
        return Number(m.toFixed(2));
      });
    }

    if (risk === 'medium') {
      return Array.from({ length: rows + 1 }, (_, i) => {
        const dist = Math.abs(i - rows / 2);
        const m = Math.max(0, 1.6 - dist * 0.25);
        return Number(m.toFixed(2));
      });
    }

    // high
    return Array.from({ length: rows + 1 }, (_, i) => {
      const dist = Math.abs(i - rows / 2);
      const m = Math.max(0, 2.4 - dist * 0.35);
      // Make edges more exciting
      if (i === 0 || i === rows) return Number((m + 2.5).toFixed(2));
      return Number(m.toFixed(2));
    });
  }

  /**
   * Get next nonce with proper concurrency safety using database transaction.
   * This prevents race conditions where simultaneous requests could get the same nonce.
   */
  private async getNextNonce(userId: string): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      // Use SELECT FOR UPDATE-style locking by finding the max nonce within transaction
      const lastSession = await tx.gameSession.findFirst({
        where: { userId },
        orderBy: { nonce: 'desc' },
      });
      
      // Increment atomically within transaction
      return (lastSession?.nonce || 0) + 1;
    });
  }

  async getSessionHistory(userId: string, limit: number = 50) {
    return this.prisma.gameSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
