const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/games/games.service.ts');
let s = fs.readFileSync(file, 'utf8');

// 1) Header
const oldHeaderEnd = s.indexOf("import * as crypto from 'crypto';");
if (oldHeaderEnd < 0) throw new Error('crypto import not found');
const afterHeader = s.indexOf('\n', oldHeaderEnd) + 1;
s =
  `import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { RngService } from './rng.service';
import { ProvablyFairService } from './provably-fair.service';
import { GameType, Currency, TransactionType, GameStatus } from '@gaming-platform/shared';
import * as crypto from 'crypto';
` + s.slice(afterHeader);

// 2) Constructor
s = s.replace(
  /constructor\(\s*@InjectRepository\(GameSession\)[\s\S]*?private provablyFairService: ProvablyFairService,\s*\)/,
  `constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private rngService: RngService,
    private provablyFairService: ProvablyFairService,
  )`,
);

// 3) getSetting block through return setting;
{
  const start = s.indexOf('private async getSetting(gameType: GameType)');
  const end = s.indexOf('private assertBetWithinLimits', start);
  if (start < 0 || end < 0) throw new Error('getSetting block not found');
  const replacement = `private async getSetting(gameType: GameType): Promise<any> {
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
        result: session.result ?? null,
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

  `;
  s = s.slice(0, start) + replacement + s.slice(end);
}

// 4) createSession
{
  const start = s.indexOf('async createSession(');
  const end = s.indexOf('private resolveWinOverride', start);
  if (start < 0 || end < 0) throw new Error('createSession block not found');
  const replacement = `async createSession(
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

  `;
  s = s.slice(0, start) + replacement + s.slice(end);
}

// 5) Type annotations that referenced entities
s = s.replace(/Promise<GameSetting>/g, 'Promise<any>');
s = s.replace(/Promise<GameSession>/g, 'Promise<any>');
s = s.replace(/setting: GameSetting/g, 'setting: any');
s = s.replace(/session: GameSession/g, 'session: any');
s = s.replace(/\(session: GameSession\)/g, '(session: any)');

// 6) Repository call replacements
s = s.split('this.gameSessionRepository.save(session)').join('this.saveSession(session)');
s = s
  .split('await this.gameSessionRepository.findOne({ where: { id: sessionId, userId } })')
  .join('await this.prisma.gameSession.findFirst({ where: { id: sessionId, userId } })');

// 7) getNextNonce + getSessionHistory
{
  const start = s.indexOf('private async getNextNonce(userId: string)');
  if (start < 0) throw new Error('getNextNonce not found');
  s =
    s.slice(0, start) +
    `private async getNextNonce(userId: string): Promise<number> {
    const lastSession = await this.prisma.gameSession.findFirst({
      where: { userId },
      orderBy: { nonce: 'desc' },
    });
    return (lastSession?.nonce || 0) + 1;
  }

  async getSessionHistory(userId: string, limit: number = 50) {
    return this.prisma.gameSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
`;
}

fs.writeFileSync(file, s);

const bad = [];
s.split('\n').forEach((l, i) => {
  if (/gameSessionRepository|gameSettingRepository|InjectRepository|from 'typeorm'|@nestjs\/typeorm/.test(l)) {
    bad.push(`${i + 1}: ${l}`);
  }
});
if (bad.length) {
  console.error('Still bad:\n' + bad.join('\n'));
  process.exit(1);
}
console.log('games.service.ts patched OK, lines:', s.split('\n').length);
