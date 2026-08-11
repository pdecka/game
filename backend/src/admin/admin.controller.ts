import { Controller, Post, Get, Body, UseGuards, Request, Param, Query, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { KycService } from '../kyc/kyc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { SuspendUserDto, CreditWalletDto, DebitWalletDto, UpdateGameSettingDto } from './dto';
import { PaymentStatus, KYCStatus } from '@gaming-platform/shared';
import { BankAccountStatus } from './bank-account.enums';
import { SportType } from '../sports/sports.enums';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private kycService: KycService,
  ) {}

  @Get('kyc/submissions')
  async listKycSubmissions(@Query('status') status?: KYCStatus) {
    return this.kycService.listSubmissions(status);
  }

  @Patch('kyc/:kycId/approve')
  async approveKyc(@Request() req, @Param('kycId') kycId: string) {
    return this.kycService.approveKyc(kycId, req.user.id);
  }

  @Patch('kyc/:kycId/reject')
  async rejectKyc(@Param('kycId') kycId: string, @Body() body: { reason?: string }) {
    return this.kycService.rejectKyc(kycId, body?.reason || 'Rejected by admin');
  }

  @Get('dashboard')
  async getDashboard(@Query('from') from?: string, @Query('to') to?: string) {
    return this.adminService.getDashboard({ from, to });
  }

  @Get('affiliate/overview')
  async affiliateOverview() {
    return this.adminService.getAffiliateOverview();
  }

  @Patch('affiliate/global-rate')
  async affiliateGlobalRate(@Body() body: { rate: number }) {
    return this.adminService.setAffiliateGlobalRate(body.rate);
  }

  @Patch('users/:userId/affiliate-override')
  async userAffiliateOverride(@Param('userId') userId: string, @Body() body: { rate: number | null }) {
    return this.adminService.setUserAffiliateRateOverride(userId, body?.rate ?? null);
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Get('game-settings')
  async getGameSettings() {
    return this.adminService.getGameSettings();
  }

  @Post('game-settings')
  async updateGameSettings(@Body() dto: UpdateGameSettingDto) {
    return this.adminService.upsertGameSetting(dto);
  }

  @Post('users/:userId/suspend')
  async suspendUser(@Request() req, @Param('userId') userId: string, @Body() dto: SuspendUserDto) {
    return this.adminService.suspendUser(req.user.id, userId, dto.reason, req.ip || 'unknown');
  }

  @Post('users/:userId/unsuspend')
  async unsuspendUser(@Request() req, @Param('userId') userId: string) {
    return this.adminService.unsuspendUser(req.user.id, userId, req.ip || 'unknown');
  }

  // @Post('wallet/credit')
  // async creditWallet(@Request() req, @Body() dto: CreditWalletDto) {
  //   return this.adminService.creditWallet(
  //     req.user.id,
  //     dto.userId,
  //     dto.amount,
  //     dto.currency,
  //     dto.reason,
  //     req.ip || 'unknown',
  //   );
  // }

  @Post('wallet/debit')
  async debitWallet(@Request() req, @Body() dto: DebitWalletDto) {
    return this.adminService.debitWallet(
      req.user.id,
      dto.userId,
      dto.amount,
      dto.currency,
      dto.reason,
      req.ip || 'unknown',
    );
  }

  @Get('bank-accounts')
  async listBankAccounts() {
    return this.adminService.listBankAccounts();
  }

  @Post('bank-accounts')
  async createBankAccount(
    @Body()
    dto: {
      bankName: string;
      accountHolder: string;
      accountNumber: string;
      ifsc: string;
      upiId?: string;
      qrImageUrl?: string;
      status?: BankAccountStatus;
    },
  ) {
    return this.adminService.upsertBankAccount(dto);
  }

  @Patch('bank-accounts/:id')
  async updateBankAccount(
    @Param('id') id: string,
    @Body()
    dto: {
      bankName: string;
      accountHolder: string;
      accountNumber: string;
      ifsc: string;
      upiId?: string;
      qrImageUrl?: string;
      status?: BankAccountStatus;
    },
  ) {
    return this.adminService.upsertBankAccount({ ...dto, id });
  }

  // Add GET endpoint for bank accounts at root level
  @Get('bank')
  async listBankAccountsRoot() {
    return this.adminService.listBankAccounts();
  }

  @Get('payments/method-settings')
  async listMethodSettings() {
    return this.adminService.listPaymentMethodSettings();
  }

  @Post('payments/method-settings')
  async upsertMethodSetting(
    @Body()
    body: {
      purpose: 'deposit' | 'withdrawal';
      method: string;
      currency: string;
      network?: string;
      displayName?: string;
      depositAddress?: string;
      upiId?: string;
      qrImageUrl?: string;
      enabled?: boolean;
      metadata?: Record<string, any>;
    },
  ) {
    return this.adminService.upsertPaymentMethodSetting(body);
  }

  @Get('payments/deposits')
  async getDepositRequests(
    @Request() req,
    @Query('status') status?: PaymentStatus,
    @Query('userId') userId?: string,
    @Query('username') username?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.adminService.getDepositRequests({
      status: status ?? undefined,
      userId: userId ?? undefined,
      username: username ?? undefined,
      from,
      to,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  // Backward-compatible endpoint without /payments prefix
  @Get('deposits')
  async getDepositRequestsLegacy(
    @Query('status') status?: PaymentStatus,
    @Query('userId') userId?: string,
    @Query('username') username?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.adminService.getDepositRequests({
      status: status ?? undefined,
      userId: userId ?? undefined,
      username: username ?? undefined,
      from,
      to,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  // Backward-compatible alias endpoint.
  @Get('deposits')
  async getDepositRequestsAlias(
    @Query('status') status?: PaymentStatus,
    @Query('userId') userId?: string,
    @Query('username') username?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.adminService.getDepositRequests({
      status: status ?? undefined,
      userId: userId ?? undefined,
      username: username ?? undefined,
      from,
      to,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Patch('payments/deposits/:paymentId/approve')
  async approveDeposit(@Request() req, @Param('paymentId') paymentId: string) {
    return this.adminService.approveDeposit(req.user.id, paymentId, req.ip || 'unknown');
  }

  @Patch('payments/deposits/:paymentId/reject')
  async rejectDeposit(
    @Request() req,
    @Param('paymentId') paymentId: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.rejectDeposit(
      req.user.id,
      paymentId,
      body?.reason ?? 'Rejected by admin',
      req.ip || 'unknown',
    );
  }

  // Backward-compatible alias endpoint.
  @Patch('deposit/:paymentId')
  async updateDepositStatusAlias(
    @Request() req,
    @Param('paymentId') paymentId: string,
    @Body() body: { status: 'approved' | 'rejected'; reason?: string },
  ) {
    if (body?.status === 'approved') {
      return this.adminService.approveDeposit(req.user.id, paymentId, req.ip || 'unknown');
    }
    return this.adminService.rejectDeposit(
      req.user.id,
      paymentId,
      body?.reason ?? 'Rejected by admin',
      req.ip || 'unknown',
    );
  }

  @Get('payments/withdrawals')
  async getWithdrawalRequests(
    @Request() req,
    @Query('status') status?: PaymentStatus,
    @Query('userId') userId?: string,
    @Query('username') username?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.adminService.getWithdrawalRequests({
      status: status ?? undefined,
      userId: userId ?? undefined,
      username: username ?? undefined,
      from,
      to,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  // Backward-compatible endpoint without /payments prefix
  @Get('withdrawals')
  async getWithdrawalRequestsLegacy(
    @Query('status') status?: PaymentStatus,
    @Query('userId') userId?: string,
    @Query('username') username?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.adminService.getWithdrawalRequests({
      status: status ?? undefined,
      userId: userId ?? undefined,
      username: username ?? undefined,
      from,
      to,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Patch('payments/withdrawals/:paymentId/reject')
  async rejectWithdrawal(
    @Request() req,
    @Param('paymentId') paymentId: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.rejectWithdrawal(
      req.user.id,
      paymentId,
      body?.reason ?? 'Rejected by admin',
      req.ip || 'unknown',
    );
  }

  @Get('reports/financial')
  async getFinancialReport(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.getFinancialReport({ from, to, userId })
  }

  @Get('sports/settings')
  async getSportsSettings() {
    return this.adminService.getSportsSettings()
  }

  @Post('sports/settings/:sport')
  async updateSportsSetting(@Param('sport') sport: SportType, @Body() body: { enabled?: boolean; houseEdge?: number }) {
    return this.adminService.updateSportsSetting(sport, body)
  }

  @Patch('payments/withdrawals/:paymentId/approve')
  async approveWithdrawal(
    @Request() req,
    @Param('paymentId') paymentId: string,
    @Body() body: { payoutReference?: string; payoutScreenshotUrl?: string },
  ) {
    return this.adminService.approveWithdrawal(req.user.id, paymentId, req.ip || 'unknown', body);
  }

  // Backward-compatible POST endpoint
  @Post('withdrawals/:paymentId/approve')
  async approveWithdrawalPost(
    @Request() req,
    @Param('paymentId') paymentId: string,
    @Body() body: { payoutReference?: string; payoutScreenshotUrl?: string },
  ) {
    return this.adminService.approveWithdrawal(req.user.id, paymentId, req.ip || 'unknown', body);
  }

  
  @Post('payments/deposits/:paymentId/recover-wallet')
  async recoverWalletTransaction(@Request() req, @Param('paymentId') paymentId: string) {
    console.log(`Recovering wallet transaction for payment: ${paymentId}`);
    try {
      const result = await this.adminService.recoverWalletTransaction(req.user.id, paymentId, req.ip || 'unknown');
      return { success: true, result };
    } catch (error) {
      console.error('Wallet recovery failed:', error);
      throw error;
    }
  }

}
