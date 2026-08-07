import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { WalletModule } from '../wallet/wallet.module';
import { RngService } from './rng.service';
import { ProvablyFairService } from './provably-fair.service';

@Module({
  imports: [WalletModule],
  controllers: [GamesController],
  providers: [GamesService, RngService, ProvablyFairService],
  exports: [GamesService],
})
export class GamesModule {}
