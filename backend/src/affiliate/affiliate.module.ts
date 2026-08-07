import { Module, forwardRef } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { AffiliateController } from './affiliate.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    forwardRef(() => WalletModule),
  ],
  controllers: [AffiliateController],
  providers: [AffiliateService],
  exports: [AffiliateService],
})
export class AffiliateModule {}
