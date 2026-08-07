import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Currency } from '@gaming-platform/shared';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Request() req, @Query('currency') currency?: Currency) {
    console.log('=== WALLET BALANCE REQUEST ===');
    console.log('User ID:', req.user.id);
    console.log('Currency query:', currency);
    
    try {
      const wallet = await this.walletService.getWallet(req.user.id);
      console.log('Wallet found:', {
        id: wallet.id,
        userId: wallet.userId,
        inrBalance: wallet.inrBalance.toString(),
        inrLocked: wallet.inrLocked.toString()
      });
      
      if (currency) {
        const balance = await this.walletService.getBalance(req.user.id, currency);
        console.log(`Balance for ${currency}:`, balance);
        return { currency, balance };
      }

      const balanceResponse = {
        INR: parseFloat(wallet.inrBalance.toString()),
        USDT: parseFloat(wallet.usdtBalance.toString()),
        BTC: parseFloat(wallet.btcBalance.toString()),
        locked: {
          INR: parseFloat(wallet.inrLocked.toString()),
          USDT: parseFloat(wallet.usdtLocked.toString()),
          BTC: parseFloat(wallet.btcLocked.toString()),
        },
      };
      
      console.log('Balance response:', balanceResponse);
      console.log('=== WALLET BALANCE SUCCESS ===');
      return balanceResponse;
      
    } catch (error) {
      console.error('=== WALLET BALANCE ERROR ===');
      console.error('Error:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.walletService.getTransactionHistory(
      req.user.id,
      limit ? parseInt(limit.toString()) : 50,
      offset ? parseInt(offset.toString()) : 0,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('bank-default')
  async getDefaultBankAccount() {
    return this.walletService.getDefaultActiveBankAccount();
  }
}
