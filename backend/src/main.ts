import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as express from 'express';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaService } from './prisma/prisma.service';

const ADMIN_EMAIL = 'admin@games.com';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '12345678';

async function ensureAdminOnce(prisma: PrismaService) {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) return;

  const legacy =
    (await prisma.user.findUnique({ where: { username: ADMIN_USERNAME } })) ||
    (await prisma.user.findUnique({ where: { username: 'superadmin' } })) ||
    (await prisma.user.findUnique({ where: { email: 'superadmin@platform.local' } }));

  const data = {
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    role: UserRole.super_admin,
    status: 'active' as const,
    password: await bcrypt.hash(ADMIN_PASSWORD, 12),
    kycStatus: 'verified' as const,
  };

  const admin = legacy
    ? await prisma.user.update({ where: { id: legacy.id }, data })
    : await prisma.user.create({ data });

  const wallet = await prisma.wallet.findFirst({ where: { userId: admin.id } });
  if (!wallet) {
    await prisma.wallet.create({ data: { userId: admin.id } });
  }

  console.log('Admin login saved once:', ADMIN_EMAIL);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS
  const corsOriginRaw = (configService.get<string>('CORS_ORIGIN') || '').trim();
  const corsOrigins = corsOriginRaw
    ? corsOriginRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Known production frontend domains. These are merged with CORS_ORIGIN so a
  // stale env var can never lock the live frontend out of the API.
  const defaultProdOrigins = [
    'https://lucky-games-777.vercel.app'
  ];
  const allowedOrigins = new Set([...corsOrigins, ...defaultProdOrigins]);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl/postman) that don't send Origin.
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin)) return callback(null, true);

      // Local dev: allow localhost on any port (Next often runs on 3000/3001/3002...)
      const isLocalhost =
        /^https?:\/\/localhost(:\d+)?$/i.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin);
      // Disallow without throwing: an Error here surfaces as a 500 instead of
      // a clean CORS denial.
      return callback(null, isLocalhost);
    },
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Cookie parser (if needed)
  // app.use(cookieParser());

  // Global prefix
  app.setGlobalPrefix('api');
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const port = configService.get('PORT') || 3001;
  const databaseUrl = (process.env.DATABASE_URL || '').trim();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required. PostgreSQL must be configured (SQLite fallback removed).');
  }
  console.log('[boot] DB:', {
    provider: 'postgresql+prisma',
    hasDATABASE_URL: true,
    databaseUrlPreview: `${databaseUrl.slice(0, 24)}...`,
    port,
  });
  await ensureAdminOnce(app.get(PrismaService));
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
}

bootstrap();
