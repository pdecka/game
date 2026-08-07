import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { GamesModule } from './games/games.module';
import { PaymentsModule } from './payments/payments.module';
import { BonusModule } from './bonus/bonus.module';
import { AdminModule } from './admin/admin.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { KycModule } from './kyc/kyc.module';
import { FraudModule } from './fraud/fraud.module';
import { SportsModule } from './sports/sports.module';
import { AffiliateModule } from './affiliate/affiliate.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    WalletModule,
    GamesModule,
    PaymentsModule,
    BonusModule,
    AdminModule,
    AdminAuthModule,
    KycModule,
    FraudModule,
    SportsModule,
    AffiliateModule,
    BlogModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
