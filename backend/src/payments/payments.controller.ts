import { Controller, Post, Get, Body, UseGuards, Request, Param, Query, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DepositDto, WithdrawalDto } from './dto';
import { PaymentMethod, Currency } from '@gaming-platform/shared';
import { PaymentStatus } from '@gaming-platform/shared';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload-screenshot')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'deposits');
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const safeExt = extname(file.originalname || '').toLowerCase() || '.png';
          const ts = Date.now();
          const rnd = Math.random().toString(36).slice(2, 10);
          cb(null, `dep-${ts}-${rnd}${safeExt}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith('image/')) {
          return cb(new BadRequestException('Only image uploads are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadScreenshot(@Request() req, @UploadedFile() file?: any) {
    if (!file) {
      throw new BadRequestException('Screenshot file is required');
    }
    const base = `${req.protocol}://${req.get('host')}`;
    return {
      url: `${base}/uploads/deposits/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('deposit')
  async createDeposit(@Request() req, @Body() depositDto: DepositDto) {
    return this.paymentsService.createDeposit(
      req.user.id,
      depositDto.amount,
      depositDto.currency,
      depositDto.method,
      {
        ...(depositDto.reference ? { reference: depositDto.reference } : {}),
        ...(depositDto.screenshotUrl ? { screenshotUrl: depositDto.screenshotUrl } : {}),
        ...(depositDto.txHash ? { txHash: depositDto.txHash } : {}),
        ...(depositDto.network ? { network: depositDto.network } : {}),
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdrawal')
  async createWithdrawal(@Request() req, @Body() withdrawalDto: WithdrawalDto) {
    return this.paymentsService.createWithdrawal(
      req.user.id,
      withdrawalDto.amount,
      withdrawalDto.currency,
      withdrawalDto.method,
      withdrawalDto.address,
      withdrawalDto.reference
        ? { ...(withdrawalDto.accountDetails ?? {}), reference: withdrawalDto.reference }
        : withdrawalDto.accountDetails,
      withdrawalDto.accountId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('deposit-methods')
  async getDepositMethods() {
    return this.paymentsService.listDepositMethodSettings();
  }

  @UseGuards(JwtAuthGuard)
  @Get('withdrawal-accounts')
  async listWithdrawalAccounts(@Request() req) {
    return this.paymentsService.listWithdrawalAccounts(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdrawal-accounts')
  async addWithdrawalAccount(
    @Request() req,
    @Body() body: { type: 'bank' | 'upi' | 'crypto'; label: string; details: Record<string, any>; isDefault?: boolean },
  ) {
    return this.paymentsService.addWithdrawalAccount(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('deposits')
  async listMyDeposits(
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

  @UseGuards(JwtAuthGuard)
  @Get('withdrawals')
  async listMyWithdrawals(
    @Request() req,
    @Query('status') status?: PaymentStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.paymentsService.listWithdrawalRequests({
      userId: req.user.id,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Post('webhook/:paymentId')
  async handleWebhook(@Param('paymentId') paymentId: string, @Body() body: any) {
    return this.paymentsService.verifyDeposit(paymentId, body);
  }
}
