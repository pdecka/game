import { Module } from '@nestjs/common'
import { WalletModule } from '../wallet/wallet.module'
import { OddsEngineService } from './odds-engine.service'
import { SportsController } from './sports.controller'
import { SportsService } from './sports.service'

@Module({
  imports: [WalletModule],
  controllers: [SportsController],
  providers: [SportsService, OddsEngineService],
  exports: [SportsService],
})
export class SportsModule {}
