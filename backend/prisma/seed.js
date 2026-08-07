"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const prisma = new client_1.PrismaClient();
const GAME_TYPES = [
    client_1.GameType.dice,
    client_1.GameType.crash,
    client_1.GameType.mines,
    client_1.GameType.plinko,
    client_1.GameType.roulette,
    client_1.GameType.blackjack,
    client_1.GameType.baccarat,
    client_1.GameType.slots,
    client_1.GameType.wheel,
    client_1.GameType.tower,
    client_1.GameType.limbo,
    client_1.GameType.coinflip,
    client_1.GameType.keno,
    client_1.GameType.scratch,
    client_1.GameType.dragon_tiger,
    client_1.GameType.andar_bahar,
    client_1.GameType.video_poker,
    client_1.GameType.color_prediction,
    client_1.GameType.hilo,
    client_1.GameType.number_hilo,
    client_1.GameType.poker,
    client_1.GameType.tic_tac_toe,
];
const VIP_TIERS = [
    { name: 'Bronze', level: 1, minWagered: 0, cashbackRate: 0.005 },
    { name: 'Silver', level: 2, minWagered: 50000, cashbackRate: 0.01 },
    { name: 'Gold', level: 3, minWagered: 250000, cashbackRate: 0.015 },
    { name: 'Platinum', level: 4, minWagered: 1000000, cashbackRate: 0.02 },
    { name: 'Diamond', level: 5, minWagered: 5000000, cashbackRate: 0.03 },
];
async function main() {
    const passwordPlain = process.env.SUPERADMIN_PASSWORD ||
        `Sa!${crypto.randomBytes(9).toString('base64url')}#${crypto.randomInt(10, 99)}`;
    const passwordHash = await bcrypt.hash(passwordPlain, 12);
    const superAdmin = await prisma.user.upsert({
        where: { username: 'superadmin' },
        update: {
            role: client_1.UserRole.super_admin,
            status: 'active',
            password: passwordHash,
            email: 'superadmin@platform.local',
        },
        create: {
            email: 'superadmin@platform.local',
            username: 'superadmin',
            password: passwordHash,
            role: client_1.UserRole.super_admin,
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
                currency: client_1.Currency.INR,
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
    const credsPath = path.join(__dirname, '.seed-superadmin.local.json');
    fs.writeFileSync(credsPath, JSON.stringify({
        username: 'superadmin',
        email: 'superadmin@platform.local',
        password: passwordPlain,
        role: 'super_admin',
        note: 'Local seed credentials — do not commit',
    }, null, 2));
    console.log('Seed complete.');
    console.log('SUPERADMIN_USERNAME=superadmin');
    console.log(`SUPERADMIN_PASSWORD=${passwordPlain}`);
    console.log(`Credentials also written to ${credsPath} (gitignored).`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map