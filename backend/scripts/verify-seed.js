const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function main() {
  const prisma = new PrismaClient();
  const credsPath = path.join(__dirname, '../prisma/.seed-superadmin.local.json');
  const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
  const user = await prisma.user.findUnique({ where: { username: 'admin' } });
  const games = await prisma.game.count();
  const settings = await prisma.gameSetting.count();
  const passwordOk = user ? await bcrypt.compare(creds.password, user.password) : false;
  console.log(
    JSON.stringify(
      {
        userFound: Boolean(user),
        role: user?.role ?? null,
        passwordOk,
        games,
        settings,
        database: 'gaming_db',
      },
      null,
      2,
    ),
  );
  await prisma.$disconnect();
  if (!user || !passwordOk || games < 20) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
