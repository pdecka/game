import { PrismaClient, UserRole, GameType, Currency } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const GAME_TYPES: GameType[] = [
  GameType.dice,
  GameType.crash,
  GameType.mines,
  GameType.plinko,
  GameType.roulette,
  GameType.blackjack,
  GameType.baccarat,
  GameType.slots,
  GameType.wheel,
  GameType.tower,
  GameType.limbo,
  GameType.coinflip,
  GameType.keno,
  GameType.scratch,
  GameType.dragon_tiger,
  GameType.andar_bahar,
  GameType.video_poker,
  GameType.color_prediction,
  GameType.hilo,
  GameType.number_hilo,
  GameType.poker,
  GameType.tic_tac_toe,
];

const VIP_TIERS = [
  { name: 'Bronze', level: 1, minWagered: 0, cashbackRate: 0.005 },
  { name: 'Silver', level: 2, minWagered: 50000, cashbackRate: 0.01 },
  { name: 'Gold', level: 3, minWagered: 250000, cashbackRate: 0.015 },
  { name: 'Platinum', level: 4, minWagered: 1000000, cashbackRate: 0.02 },
  { name: 'Diamond', level: 5, minWagered: 5000000, cashbackRate: 0.03 },
];

async function main() {
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { username: 'superadmin' },
  });

  const passwordPlain =
    process.env.SUPERADMIN_PASSWORD ||
    `Sa!${crypto.randomBytes(9).toString('base64url')}#${crypto.randomInt(10, 99)}`;
  const passwordHash = await bcrypt.hash(passwordPlain, 12);

  const superAdmin = existingSuperAdmin
    ? await prisma.user.update({
        where: { username: 'superadmin' },
        data: {
          role: UserRole.super_admin,
          status: 'active',
          email: 'superadmin@platform.local',
          ...(process.env.SUPERADMIN_PASSWORD ? { password: passwordHash } : {}),
        },
      })
    : await prisma.user.create({
        data: {
          email: 'superadmin@platform.local',
          username: 'superadmin',
          password: passwordHash,
          role: UserRole.super_admin,
          status: 'active',
          kycStatus: 'verified',
        },
      });

  const existingWallet = await prisma.wallet.findFirst({ where: { userId: superAdmin.id } });
  if (!existingWallet) {
    await prisma.wallet.create({ data: { userId: superAdmin.id } });
  }

  for (const gameType of GAME_TYPES) {
    await prisma.game.upsert({
      where: { gameType },
      update: { enabled: true },
      create: { gameType, enabled: true },
    });
    await prisma.gameSetting.upsert({
      where: { gameType },
      update: {},
      create: {
        gameType,
        enabled: true,
        rtp: 0.95,
        houseEdge: 0.05,
        currency: Currency.INR,
        minBet: 1,
        maxBet: 100000,
        maxWin: 1000000,
        manualOverride: false,
      },
    });
    await prisma.gameCatalogMeta.upsert({
      where: { gameType },
      update: {},
      create: {
        gameType,
        title: gameType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        tags: ['casino'],
        sortOrder: GAME_TYPES.indexOf(gameType),
        featured: ['crash', 'mines', 'dice', 'slots'].includes(gameType),
      },
    });
  }

  await prisma.affiliateGlobal.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', commissionRate: 0.005 },
  });

  for (const tier of VIP_TIERS) {
    await prisma.vipTier.upsert({
      where: { name: tier.name },
      update: {
        level: tier.level,
        minWagered: tier.minWagered,
        cashbackRate: tier.cashbackRate,
      },
      create: {
        name: tier.name,
        level: tier.level,
        minWagered: tier.minWagered,
        cashbackRate: tier.cashbackRate,
      },
    });
  }

  for (const sport of ['cricket', 'football', 'hockey']) {
    const existing = await prisma.sportsSetting.findUnique({ where: { sport } });
    if (!existing) {
      await prisma.sportsSetting.create({
        data: { sport, enabled: true, houseEdge: 0.05 },
      });
    }
  }

  console.log('Seed complete.');
  console.log('SUPERADMIN_USERNAME=superadmin');
  if (!existingSuperAdmin) {
    const credsPath = path.join(__dirname, '.seed-superadmin.local.json');
    fs.writeFileSync(
      credsPath,
      JSON.stringify(
        {
          username: 'superadmin',
          email: 'superadmin@platform.local',
          password: passwordPlain,
          role: 'super_admin',
          note: 'Local seed credentials — do not commit',
        },
        null,
        2,
      ),
    );
    console.log(`SUPERADMIN_PASSWORD=${passwordPlain}`);
    console.log(`Credentials also written to ${credsPath} (gitignored).`);
    console.log('Tip: set SUPERADMIN_PASSWORD on Render to use a fixed password.');
  } else if (process.env.SUPERADMIN_PASSWORD) {
    console.log('Super admin password updated from SUPERADMIN_PASSWORD env.');
  } else {
    console.log('Super admin already exists — password unchanged.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
