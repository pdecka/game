import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Currency, PaymentMethod, PaymentStatus } from '@gaming-platform/shared';
import { PaymentsService } from './payments.service';

@Controller('deposit')
export class DepositController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(
    @Request() req,
    @Body()
    body: {
      amount: number;
      utr?: string;
      screenshotUrl?: string;
      currency?: Currency;
      method?: PaymentMethod;
      txHash?: string;
      network?: string;
    },
  ) {
    return this.paymentsService.createDeposit(
      req.user.id,
      body.amount,
      body.currency || Currency.INR,
      body.method || PaymentMethod.BANK_TRANSFER,
      {
        ...(body.utr ? { reference: body.utr, utr: body.utr } : {}),
        ...(body.screenshotUrl ? { screenshotUrl: body.screenshotUrl } : {}),
        ...(body.txHash ? { txHash: body.txHash } : {}),
        ...(body.network ? { network: body.network } : {}),
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async listMy(
    @Request() req,
    @Query('status') status?: PaymentStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.paymentsService.listDepositRequests({
      userId: req.user.id,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }
}

