"use strict";
const { PrismaClient, UserRole, GameType, Currency } = require("@prisma/client");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const ADMIN_EMAIL = "admin@games.com";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345678";

const prisma = new PrismaClient();

const GAME_TYPES = [
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
  { name: "Bronze", level: 1, minWagered: 0, cashbackRate: 0.005 },
  { name: "Silver", level: 2, minWagered: 50000, cashbackRate: 0.01 },
  { name: "Gold", level: 3, minWagered: 250000, cashbackRate: 0.015 },
  { name: "Platinum", level: 4, minWagered: 1000000, cashbackRate: 0.02 },
  { name: "Diamond", level: 5, minWagered: 5000000, cashbackRate: 0.03 },
];

async function main() {
  const alreadySaved = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  let superAdmin = alreadySaved;

  if (!alreadySaved) {
    const legacy =
      (await prisma.user.findUnique({ where: { username: ADMIN_USERNAME } })) ||
      (await prisma.user.findUnique({ where: { username: "superadmin" } })) ||
      (await prisma.user.findUnique({ where: { email: "superadmin@platform.local" } }));

    const adminData = {
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      role: UserRole.super_admin,
      status: "active",
      password: await bcrypt.hash(ADMIN_PASSWORD, 12),
      kycStatus: "verified",
    };

    superAdmin = legacy
      ? await prisma.user.update({ where: { id: legacy.id }, data: adminData })
      : await prisma.user.create({ data: adminData });
  }

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
        title: gameType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        tags: ["casino"],
        sortOrder: GAME_TYPES.indexOf(gameType),
        featured: ["crash", "mines", "dice", "slots"].includes(gameType),
      },
    });
  }

  await prisma.affiliateGlobal.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", commissionRate: 0.005 },
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

  for (const sport of ["cricket", "football", "hockey"]) {
    const existingSport = await prisma.sportsSetting.findUnique({ where: { sport } });
    if (!existingSport) {
      await prisma.sportsSetting.create({
        data: { sport, enabled: true, houseEdge: 0.05 },
      });
    }
  }

  const credsPath = path.join(__dirname, ".seed-superadmin.local.json");
  fs.writeFileSync(
    credsPath,
    JSON.stringify(
      {
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "super_admin",
        note: "Local seed credentials — do not commit",
      },
      null,
      2,
    ),
  );

  console.log(alreadySaved ? "Admin login already saved." : "Admin login saved once.");
  console.log(`ADMIN_EMAIL=${ADMIN_EMAIL}`);
  console.log(`ADMIN_PASSWORD=${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
