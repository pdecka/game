import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DepositController } from './deposit.controller';
import { WalletModule } from '../wallet/wallet.module';
import { UsersModule } from '../users/users.module';
import { RazorpayService } from './razorpay.service';
import { CryptoService } from './crypto.service';

@Module({
  imports: [
    WalletModule,
    UsersModule,
  ],
  controllers: [PaymentsController, DepositController],
  providers: [PaymentsService, RazorpayService, CryptoService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
