import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
}

bootstrap();
